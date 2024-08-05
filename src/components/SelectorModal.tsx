import { RenderModalCtx } from 'datocms-plugin-sdk'
import { Canvas, Button } from 'datocms-react-ui'
import Selector from './Selector'
import { useState, useEffect } from 'react'

type Props = {
	ctx: RenderModalCtx
}

const SelectorModal = ({ ctx }: Props) => {
	const [selectedPhotos, setSelectedPhotos] = useState<any[]>(
		Array.isArray(ctx.parameters.selectedPhotos) ? ctx.parameters.selectedPhotos : []
	)

	const handleSave = () => {
		ctx.resolve(JSON.stringify(selectedPhotos))
	}

	useEffect(() => {
		if (Array.isArray(ctx.parameters.selectedPhotos)) {
			setSelectedPhotos(ctx.parameters.selectedPhotos)
		}
	}, [ctx.parameters.selectedPhotos])

	return (
		<Canvas ctx={ctx}>
			<Selector selectedPhotos={selectedPhotos} setSelectedPhotos={setSelectedPhotos} ctx={ctx} />
			<div className="flex flex-col gap-5 items-end">
				<Button type="button" onClick={handleSave}>
					Save
				</Button>
			</div>
		</Canvas>
	)
}

export default SelectorModal
