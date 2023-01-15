import { RenderConfigScreenCtx } from 'datocms-plugin-sdk'
import { Canvas, ContextInspector, TextField, Button } from 'datocms-react-ui'
import s from './styles.module.css'
import { useState } from 'react'

// this is how we want to save our settings
type ValidParameters = { rasterOrgId: string; apiKey: string }

// parameters can be either empty or filled in
type Parameters = ValidParameters

type Props = {
	ctx: RenderConfigScreenCtx
}

export default function ConfigScreen({ ctx }: Props) {
	const parameters = ctx.plugin.attributes.parameters as Parameters

	// Props
	const [rasterOrgId, setRasterOrgId] = useState(parameters.rasterOrgId)
	const [apiKey, setApiKey] = useState(parameters.apiKey)

	const handleSave = () => {
		const newParameters: ValidParameters = {
			rasterOrgId,
			apiKey
		}

		ctx.updatePluginParameters(newParameters)
	}

	return (
		<Canvas ctx={ctx}>
			<p>Welcome to the Raster.app Plugin</p>

			<div className={s.inspector}>
				{/* Organization ID */}

				<form onSubmit={handleSave}>
					<div style={{ marginTop: '10px' }}>
						<TextField
							id="02"
							name="org-id"
							label="Organization ID"
							value={rasterOrgId}
							onChange={(newValue) => setRasterOrgId(newValue)}
						/>
					</div>

					{/* API Key */}
					<div style={{ marginTop: '20px' }}>
						<TextField
							id="03"
							name="api-key"
							label="Raster API Key"
							value={apiKey}
							onChange={(newValue) => setApiKey(newValue)}
						/>
					</div>

					{/* Submit changes */}
					<div style={{ marginTop: 'var(--spacing-m)' }}>
						<Button buttonType="primary" type="submit">
							Save Settings
						</Button>
					</div>
				</form>

				<ContextInspector />
			</div>
		</Canvas>
	)
}
