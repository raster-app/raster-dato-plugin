import { RenderModalCtx } from 'datocms-plugin-sdk'
import { Canvas } from 'datocms-react-ui'
import Selector from './Selector'
import { useState, useEffect } from 'react'

type Props = {
	ctx: RenderModalCtx
}

const SelectorModal = ({ ctx }: Props) => {
	const [selectedPhotos, setSelectedPhotos] = useState<any[]>(
		Array.isArray(ctx.parameters.selectedPhotos) ? ctx.parameters.selectedPhotos : []
	)

	useEffect(() => {
		if (Array.isArray(ctx.parameters.selectedPhotos)) {
			setSelectedPhotos(ctx.parameters.selectedPhotos)
		}
	}, [ctx.parameters.selectedPhotos])

	const handleSave = (photos: any[]) => {
		setSelectedPhotos(photos)
		ctx.resolve(photos)
	}

	return (
		<Canvas ctx={ctx}>
			<Selector selectedPhotos={selectedPhotos} setSelectedPhotos={handleSave} ctx={ctx} />
		</Canvas>
	)
}

export default SelectorModal
