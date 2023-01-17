import { RenderFieldExtensionCtx } from 'datocms-plugin-sdk'
import { Canvas } from 'datocms-react-ui'
import { useState, useEffect, useMemo } from 'react'

import { clsx } from 'clsx'
import get from 'lodash/get'

import './styles.css'
import BrowsePhotos from './BrowsePhotos'

type Props = {
	ctx: RenderFieldExtensionCtx
}
export default function Selector({ ctx }: Props) {
	const [expandedView, setExpandedView] = useState(false)
	const [libraries, setLibraries] = useState<any[]>([])
	const [selectedLibrary, setSelectedLibrary] = useState<any>({
		id: null,
		name: null,
		photosCount: 0
	})

	// const selectedPhoto = get(ctx?.formValues, ctx?.fieldPath || '') as any
	const selectedPhoto = useMemo(() => {
		const initialValue = get(ctx?.formValues, ctx?.fieldPath || '') as any
		return typeof initialValue === 'string' ? JSON.parse(initialValue) : null
	}, [ctx])
	console.log('--> selectedPhoto', selectedPhoto.thumbUrl)

	useEffect(() => {
		const getLibraries = async () => {
			let results = await fetch('https://raster-graphql-apis-production.up.railway.app', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization:
						typeof ctx.plugin.attributes.parameters.apiKey === 'string'
							? `Bearer ${ctx.plugin.attributes.parameters.apiKey}`
							: '',
					'Apollo-Require-Preflight': 'true'
				},

				body: `
				{
					"query": "query Libraries($organizationId: String!) { libraries(organizationId: $organizationId) { id name photosCount }}",
					"operationName": "Libraries",
					"variables": { "organizationId": "${ctx.plugin.attributes.parameters.rasterOrgId}" }
				}
				`
			})

			const libraries = await results.json()
			setLibraries(libraries.data.libraries)
		}

		getLibraries()
	}, [])

	// Make sure the plugin is configured
	if (!ctx.plugin.attributes.parameters.rasterOrgId || !ctx.plugin.attributes.parameters.apiKey) {
		return <>Please configure the plugin first</>
	}

	return (
		<Canvas ctx={ctx}>
			<div className="App">
				{expandedView ? (
					<div>
						<div className="title">
							<p>Select image from Raster</p>
							<div className="primary-action" onClick={() => setExpandedView(false)}>
								Close
							</div>
						</div>
						<div style={{ display: 'flex' }}>
							<div style={{ marginRight: '30px', minWidth: '200px' }}>
								<div className="libraries">
									{libraries.length > 0 &&
										libraries.map((library) => {
											return (
												<div
													className={clsx(
														`library`,
														selectedLibrary.id === library.id && 'selected'
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

							<div>
								{selectedLibrary.id && <BrowsePhotos library={selectedLibrary} ctx={ctx} />}
							</div>
						</div>
					</div>
				) : (
					<>
						<div>
							<img src={selectedPhoto.thumbUrl} alt={selectedPhoto.id} width={100} />
							<div className="primary-action" onClick={() => setExpandedView(true)}>
								Change
							</div>
						</div>
					</>
				)}
			</div>
		</Canvas>
	)
}
