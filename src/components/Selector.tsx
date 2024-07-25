import { RenderFieldExtensionCtx } from 'datocms-plugin-sdk'
import { Canvas } from 'datocms-react-ui'
import { useState, useEffect } from 'react'
import useSWR from 'swr'

import { clsx } from 'clsx'
import get from 'lodash/get'

import './styles.css'
import BrowsePhotos from './BrowsePhotos'
import { swrLibreriesFetcher } from '../lib/fetcher'
import { getLibraryListQuery } from '../lib/graphql/queries'
import { useSelectedPhotosStore } from '../lib/store/useSelectedPhotosStore'

type Props = {
	ctx: RenderFieldExtensionCtx
}

export default function Selector({ ctx }: Props) {
	const [expandedView, setExpandedView] = useState(false)
	const [libraries, setLibraries] = useState<Library[]>()
	const [selectedLibrary, setSelectedLibrary] = useState<Library>()

	const [selectedPhotos, setInitialValue, setSelectedPhotos] = useSelectedPhotosStore((state) => [
		state.selectedPhotos,
		state.setInitialValue,
		state.setSelectedPhotos,
	])

	const { orgId, apiKey } = ctx.plugin.attributes.parameters

	// Get the list of libraries
	const { data } = useSWR(
		{
			query: getLibraryListQuery,
			variables: {
				organizationId: orgId,
			},
			settings: { apiKey, orgId },
		},
		swrLibreriesFetcher,
		{
			revalidateIfStale: false,
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
		}
	)

	useEffect(() => {
		if (data && data.length > 0 && !libraries?.length) {
			setLibraries(data)
		}
	}, [data, libraries])

	useEffect(() => {
		const initialValue = get(ctx?.formValues, ctx?.fieldPath || '')
		setInitialValue(initialValue)
	}, [ctx?.fieldPath, ctx?.formValues, setInitialValue])

	const handleSelect = (img?: Image) => {
		if (!img) return
		setExpandedView(true)
		const imgLibrary = img.url.split('/')[4]
		setSelectedLibrary(libraries?.find((lib) => lib.id === imgLibrary))
	}

	// Make sure the plugin is configured
	if (!ctx.plugin.attributes.parameters.orgId || !ctx.plugin.attributes.parameters.apiKey) {
		return <>Please configure the plugin first</>
	}

	return (
		<Canvas ctx={ctx}>
			<div className="App">
				{expandedView ? (
					<div>
						<div className="title">
							<h2>Select image from Raster</h2>
							<div>
								<button
									type="button"
									className="primary-action"
									onClick={() => setExpandedView(false)}
								>
									Close
								</button>
								<button
									type="button"
									className="primary-action"
									onClick={() => {
										ctx?.setFieldValue(
											ctx.fieldPath,
											JSON.stringify(Boolean(selectedPhotos.length) ? selectedPhotos : [])
										)
										setExpandedView(false)
									}}
								>
									Save
								</button>
								<button
									type="button"
									className="primary-action"
									onClick={() => {
										setInitialValue([])
										setExpandedView(false)
									}}
								>
									Reset
								</button>
							</div>
						</div>

						<div className="preview-container">
							<p>Selected:</p>
							{Boolean(selectedPhotos.length) ? (
								<div className="preview-selected-container">
									{selectedPhotos?.map((item) => (
										<div>
											<img
												className="preview-selected"
												key={item?.id}
												src={item?.url}
												alt={item?.id}
												width={100}
												onClick={() => {
													setSelectedPhotos(item)
												}}
											/>
											{item.width && (
												<span>
													({item.width}x{item.height})
												</span>
											)}
										</div>
									))}
								</div>
							) : (
								<p>No images selected</p>
							)}
						</div>

						<div style={{ display: 'flex' }}>
							<div style={{ marginRight: '30px', minWidth: '200px' }}>
								<div className="libraries">
									{libraries &&
										libraries.map((library) => {
											return (
												<div
													className={clsx(
														`library`,
														selectedLibrary?.id === library.id && 'selected'
													)}
													key={library.id}
													onClick={() => {
														setSelectedLibrary(library)
													}}
												>
													{library.name} ({library.photosCount})
												</div>
											)
										})}
								</div>
							</div>

							{selectedLibrary?.id && <BrowsePhotos library={selectedLibrary} ctx={ctx} />}
						</div>
					</div>
				) : (
					<>
						{Boolean(selectedPhotos.length) ? (
							<div className="selected-photos">
								{selectedPhotos?.map((item) => (
									<img
										key={item?.id}
										src={item?.thumbUrl}
										alt={item?.id}
										width={100}
										onClick={() => handleSelect(item)}
									/>
								))}
							</div>
						) : (
							<div className="empty-state">
								<h2>No images selected</h2>
								<button
									type="button"
									className="primary-action"
									onClick={() => setExpandedView(true)}
								>
									Select Images
								</button>
							</div>
						)}
					</>
				)}
			</div>
		</Canvas>
	)
}
