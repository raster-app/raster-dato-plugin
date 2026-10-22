import { type Asset, RasterPicker, RasterProvider } from '@raster-app/react'
import '@raster-app/react/styles.css'
import type { RenderFieldExtensionCtx, RenderModalCtx } from 'datocms-plugin-sdk'
import { getRasterClient, readParameters } from '../client'

/** Raster's picker, signed in with the project's client, `height` tall. */
export function Picker({
	ctx,
	height,
	onPick,
}: {
	ctx: RenderFieldExtensionCtx | RenderModalCtx
	height: number
	onPick: (asset: Asset) => void
}) {
	const { orgId, apiKey } = readParameters(ctx.plugin.attributes.parameters)
	const { scope, client, state } = getRasterClient(ctx.site.id, orgId)

	return (
		// The provider keeps the client it mounted with, so another scope remounts it.
		<RasterProvider key={scope} client={client} state={state}>
			<div style={{ height }}>
				<RasterPicker
					organizationId={orgId}
					apiKey={apiKey}
					onPick={onPick}
					onError={console.error}
					theme="light"
				/>
			</div>
		</RasterProvider>
	)
}
