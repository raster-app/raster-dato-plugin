import { RenderModalCtx } from 'datocms-plugin-sdk'
import { Canvas } from 'datocms-react-ui'
import clsx from 'clsx'
import {
	RasterLibraries,
	RasterPreview,
	useSelectedImages,
	RasterImages,
} from '@raster-app/raster-toolkit'

type Props = {
	ctx: RenderModalCtx
}

const Selector = ({ ctx }: Props) => {
	const { count, images: selectedPhotos } = useSelectedImages()

	const orgId = ctx.plugin.attributes.parameters.orgId as string
	const apiKey = ctx.plugin.attributes.parameters.apiKey as string
	const { selectedPhotos: initialValue } = ctx.parameters ?? {}

	if (!orgId || !apiKey) {
		return <>Please configure the plugin first</>
	}

	return (
		<div className="relative flex flex-col gap-10 h-full bg-white">
			<Canvas ctx={ctx}>
				<div className="flex justify-between w-full">
					<h2 className="text-2xl font-medium pb-10">Select an image from Raster</h2>

					{count > 0 && (
						<button
							className="w-fit h-fit bg-green hover:bg-green-dark text-white px-3 py-2 rounded font-medium transition-colors"
							type="button"
							onClick={() => ctx.resolve(JSON.stringify(selectedPhotos))}
						>
							Confirm
						</button>
					)}
				</div>

				<div className="flex max-sm:flex-col gap-8">
					{/* Libraries */}
					<RasterLibraries config={{ orgId, apiKey }} initialValue={initialValue} />

					{/* Selected images */}
					<div className="flex flex-col gap-3 w-full max-w-7xl mx-auto">
						<RasterPreview config={{ orgId, apiKey }} initialValue={initialValue} />
						<hr className="bg-gray-300 mb-3" />
						<RasterImages config={{ orgId, apiKey }} initialValue={initialValue} />
					</div>
				</div>
			</Canvas>

			{/* Selected images count, cancel and confirm buttons */}
			<div
				className={clsx(
					'w-full flex justify-between bg-white border-t border-gray-200 transition-[opacity,transform] duration-300 ease-in-out',
					count > 0 ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
				)}
			>
				<span className="font-medium py-6 px-7">{count} selected</span>
				<div className="flex gap-3 px-7 pt-4">
					<button
						className="w-fit h-fit bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded font-medium transition-colors"
						type="button"
						onClick={() => ctx.resolve('')}
					>
						Cancel
					</button>
					<button
						className="w-fit h-fit bg-green hover:bg-green-dark text-white px-3 py-2 rounded font-medium transition-colors"
						type="button"
						onClick={() => ctx.resolve(JSON.stringify(selectedPhotos))}
					>
						Confirm
					</button>
				</div>
			</div>
		</div>
	)
}

export default Selector
