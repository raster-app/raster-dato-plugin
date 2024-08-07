import { RenderModalCtx } from 'datocms-plugin-sdk'
import { Canvas } from 'datocms-react-ui'
import Selector from './Selector'
import { useState, useEffect } from 'react'

type Props = {
	ctx: RenderModalCtx
}

const SelectorModal = ({ ctx }: Props) => {
	const [selectedPhotos, setSelectedPhotos] = useState<any>(ctx.parameters.selectedPhotos || [])

	useEffect(() => {
		setSelectedPhotos(ctx.parameters.selectedPhotos || [])
	}, [ctx.parameters.selectedPhotos])

	return (
		<Canvas ctx={ctx}>
			<Selector selectedPhotos={selectedPhotos} setSelectedPhotos={setSelectedPhotos} ctx={ctx} />
		</Canvas>
	)
}

export default SelectorModal
