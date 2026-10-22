import { useState } from 'react'
import { RasterPicker, RasterProvider } from '@raster-app/react'
import '@raster-app/react/styles.css'
import type { RenderModalCtx } from 'datocms-plugin-sdk'
import { Button, Canvas } from 'datocms-react-ui'
import { getRasterClient, readParameters } from '../client'
import { addStoredAssets, type StoredAsset, toStoredAsset } from '../stored-asset'
import s from './styles.module.css'

/** Raster's picker, full width. Resolves with the assets picked, for the field to append. */
export default function SelectorModal({ ctx }: { ctx: RenderModalCtx }) {
	const [picked, setPicked] = useState<StoredAsset[]>([])
	const { orgId, apiKey } = readParameters(ctx.plugin.attributes.parameters)
	const { scope, client, state } = getRasterClient(ctx.site.id, orgId)

	return (
		// A full-width modal has a fixed height, which the picker fills, rather than sizing to content.
		<Canvas ctx={ctx} noAutoResizer>
			<div className={s.modal}>
				{/* The provider keeps the client it mounted with, so another scope remounts it. */}
				<RasterProvider key={scope} client={client} state={state}>
					<div className={s.picker}>
						<RasterPicker
							organizationId={orgId}
							apiKey={apiKey}
							onPick={(asset) =>
								setPicked((current) => addStoredAssets(current, [toStoredAsset(asset)]))
							}
							onError={console.error}
							theme={ctx.colorScheme}
						/>
					</div>
				</RasterProvider>
				<div className={s.footer}>
					<span>{picked.length} picked</span>
					<Button buttonSize="s" onClick={() => ctx.resolve(null)}>
						Cancel
					</Button>
					<Button
						buttonSize="s"
						buttonType="primary"
						disabled={picked.length === 0}
						onClick={() => ctx.resolve(picked)}
					>
						Add to field
					</Button>
				</div>
			</div>
		</Canvas>
	)
}
