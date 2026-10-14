import { type ReactNode, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

const container = document.getElementById('root')
if (container === null) throw new Error('index.html has no #root')
const root = createRoot(container)

export function render(component: ReactNode): void {
	root.render(<StrictMode>{component}</StrictMode>)
}
