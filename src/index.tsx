import { IntentCtx, RenderFieldExtensionCtx, connect } from 'datocms-plugin-sdk'
import { render } from './utils/render'
import ConfigScreen from './entrypoints/ConfigScreen'
import 'datocms-react-ui/styles.css'
import Selector from './components/Selector'

connect({
	manualFieldExtensions(ctx: IntentCtx) {
		return [
			{
				id: 'raster',
				name: 'Raster.app',
				type: 'editor',
				fieldTypes: ['json'],
			},
		]
	},
	renderFieldExtension(fieldExtensionId: string, ctx: RenderFieldExtensionCtx) {
		switch (fieldExtensionId) {
			case 'raster':
				return render(<Selector ctx={ctx} />)
			default:
				return null
		}
	},
	renderConfigScreen(ctx) {
		return render(<ConfigScreen ctx={ctx} />)
	},
})
