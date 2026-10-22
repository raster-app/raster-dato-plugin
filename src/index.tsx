import { RenderFieldExtensionCtx, RenderModalCtx, connect } from 'datocms-plugin-sdk'
import { render } from './utils/render'
import ConfigScreen from './entrypoints/ConfigScreen'
import 'datocms-react-ui/styles.css'
import SelectorModal from './components/SelectorModal'
import SelectorField from './components/SelectorField'

connect({
	manualFieldExtensions() {
		return [
			{
				id: 'raster',
				name: 'Raster',
				type: 'editor',
				fieldTypes: ['json'],
			},
		]
	},
	renderFieldExtension(fieldExtensionId: string, ctx: RenderFieldExtensionCtx) {
		switch (fieldExtensionId) {
			case 'raster':
				return render(<SelectorField ctx={ctx} />)
			default:
				return null
		}
	},
	renderConfigScreen(ctx) {
		return render(<ConfigScreen ctx={ctx} />)
	},
	renderModal(modalId: string, ctx: RenderModalCtx) {
		switch (modalId) {
			case 'selectorModal':
				return render(<SelectorModal ctx={ctx} />)
		}
	},
})
