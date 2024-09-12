import { RenderModalCtx } from 'datocms-plugin-sdk'
import { Canvas } from 'datocms-react-ui'
import Selector from './Selector'

type Props = {
	ctx: RenderModalCtx
}

const SelectorModal = ({ ctx }: Props) => {
	return (
		<Canvas ctx={ctx}>
			<Selector ctx={ctx} />
		</Canvas>
	)
}

export default SelectorModal
