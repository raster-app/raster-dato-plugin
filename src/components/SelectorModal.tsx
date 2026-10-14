import { useState } from 'react'
import type { RenderModalCtx } from 'datocms-plugin-sdk'
import { Button, Canvas } from 'datocms-react-ui'
import { addStoredAssets, type StoredAsset, toStoredAsset } from '../stored-asset'
import { Picker } from './Picker'
import s from './styles.module.css'

/** The picker full width. Resolves with the assets picked, for the field to append. */
export default function SelectorModal({ ctx }: { ctx: RenderModalCtx }) {
	const [picked, setPicked] = useState<StoredAsset[]>([])

	return (
		<Canvas ctx={ctx}>
			<Picker
				ctx={ctx}
				height={640}
				onPick={(asset) => setPicked((current) => addStoredAssets(current, [toStoredAsset(asset)]))}
			/>
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
		</Canvas>
	)
}
