import { RenderFieldExtensionCtx } from 'datocms-plugin-sdk'
import { Canvas } from 'datocms-react-ui'
import { useState, useEffect } from 'react'

type Props = {
	ctx: RenderFieldExtensionCtx
}
export default function PhotoSelector({ ctx }: Props) {
	const [libraries, setLibraries] = useState<any[]>([])

	useEffect(() => {
		const getLibraries = async () => {
			let results = await fetch('https://raster-graphql-apis-production.up.railway.app', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'x-api-key':
						typeof ctx.plugin.attributes.parameters.apiKey === 'string'
							? ctx.plugin.attributes.parameters.apiKey
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
				<p>Found {libraries.length} libraries.</p>

				{libraries.length > 0 &&
					libraries.map((library) => {
						return (
							<div key={library.id}>
								{library.name} ({library.photosCount})
							</div>
						)
					})}
			</div>
		</Canvas>
	)
}
