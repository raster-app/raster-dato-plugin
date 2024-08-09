import { RenderModalCtx } from 'datocms-plugin-sdk'
import { Canvas } from 'datocms-react-ui'
import Selector from './Selector'
import { useSelectedPhotosStore } from '../lib/store/useSelectedPhotosStore'
import { useEffect } from 'react'

type Props = {
	ctx: RenderModalCtx
}

const SelectorModal = ({ ctx }: Props) => {
	const [setInitialValue] = useSelectedPhotosStore((state) => [state.setInitialValue])

	useEffect(() => {
		const { selectedPhotos: initialValue } = ctx.parameters ?? {}
		setInitialValue(initialValue)
	}, [ctx.parameters, setInitialValue])

	return (
		<Canvas ctx={ctx}>
			<Selector ctx={ctx} />
		</Canvas>
	)
}

export default SelectorModal
