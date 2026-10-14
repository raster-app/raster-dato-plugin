import { connect } from 'datocms-plugin-sdk'
import 'datocms-react-ui/styles.css'
import SelectorField from './components/SelectorField'
import SelectorModal from './components/SelectorModal'
import ConfigScreen from './entrypoints/ConfigScreen'
import { render } from './utils/render'

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
	renderFieldExtension(fieldExtensionId, ctx) {
		if (fieldExtensionId === 'raster') render(<SelectorField ctx={ctx} />)
	},
	renderModal(modalId, ctx) {
		if (modalId === 'selectorModal') render(<SelectorModal ctx={ctx} />)
	},
	renderConfigScreen(ctx) {
		render(<ConfigScreen ctx={ctx} />)
	},
})
