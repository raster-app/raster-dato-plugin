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

type Props = {
	ctx: RenderFieldExtensionCtx
}
export default function Selector({ ctx }: Props) {
	const [expandedView, setExpandedView] = useState(false)
	const [libraries, setLibraries] = useState<Library[]>()
	const [selectedLibrary, setSelectedLibrary] = useState<Library>()
	const [selectedPhoto, setSelectedPhoto] = useState<Image>()

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
		if (typeof initialValue === 'string') {
			setSelectedPhoto(JSON.parse(initialValue))
		}
	}, [ctx?.fieldPath, ctx?.formValues])

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
							<p>Select image from Raster</p>
							<div>
								<div className="primary-action" onClick={() => setExpandedView(false)}>
									Close
								</div>
								<div className="primary-action" onClick={() => setExpandedView(false)}>
									Save
								</div>
							</div>
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
						<div>
							<img
								src={selectedPhoto?.thumbUrl}
								alt={selectedPhoto?.id}
								width={100}
								onClick={() => handleSelect(selectedPhoto)}
							/>
						</div>
					</>
				)}
			</div>
		</Canvas>
	)
}
