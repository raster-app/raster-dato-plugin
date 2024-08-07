import { RenderModalCtx } from 'datocms-plugin-sdk'
import { Canvas, Button } from 'datocms-react-ui'
import Selector from './Selector'
import { useState, useEffect } from 'react'
import clsx from 'clsx'

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

	return (
		<Canvas ctx={ctx}>
			<div className="relative flex flex-col gap-10 h-full bg-white">
				<Selector selectedPhotos={selectedPhotos} setSelectedPhotos={setSelectedPhotos} ctx={ctx} />

				{/* Selected images count, cancel and confirm buttons */}
				<div
					className={clsx(
						'w-full flex justify-between bg-white border-t border-gray-200 transition-transform duration-300 ease-in-out',
						selectedPhotos.length > 0 ? 'translate-y-0' : 'translate-y-full'
					)}
				>
					<span className="font-medium py-6 px-7">{selectedPhotos.length} selected</span>
					<div className="flex gap-3 px-14 pt-4">
						<Button
							className="w-fit h-fit bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded font-medium transition-colors"
							type="button"
							onClick={() => ctx.resolve('')}
						>
							Cancel
						</Button>
						<Button
							className="w-fit h-fit bg-green hover:bg-green-dark text-white px-3 py-2 rounded font-medium transition-colors"
							type="button"
							onClick={() => ctx.resolve(JSON.stringify(selectedPhotos))}
						>
							Confirm
						</Button>
					</div>
				</div>
			</div>
		</Canvas>
	)
}

export default SelectorModal
