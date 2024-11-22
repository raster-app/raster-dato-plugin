import { RenderFieldExtensionCtx } from 'datocms-plugin-sdk'
import { Canvas, Button } from 'datocms-react-ui'
import get from 'lodash/get'

type Props = {
	ctx: RenderFieldExtensionCtx
}

const SelectorField = ({ ctx }: Props) => {
	const initialValueJSON = get(ctx.formValues, ctx.fieldPath || '')
	const initialValue = JSON.parse(initialValueJSON as string)

	const handleOpenModal = async () => {
		const result = await ctx.openModal({
			id: 'selectorModal',
			title: 'Select an image from Raster',
			width: 'fullWidth',
			parameters: {
				selectedPhotos: initialValueJSON,
				formValues: ctx.formValues,
				fieldPath: ctx.fieldPath,
			},
		})
		if (result) {
			ctx.setFieldValue(ctx.fieldPath, result)
		}
	}

	const handleClearSelection = () => {
		ctx.setFieldValue(ctx.fieldPath, null)
	}

	const handleRemoveImage = (imageId: string) => {
		const newImages = JSON.parse(initialValueJSON as string).filter(
			(image: any) => image.id !== imageId
		)
		const newImagesJSON = newImages.length ? JSON.stringify(newImages) : null
		ctx.setFieldValue(ctx.fieldPath, newImagesJSON)
	}

	return (
		<Canvas ctx={ctx}>
			<div className="flex flex-col gap-5 border p-5 rounded-md border-gray-200 mt-3">
				<div className="flex justify-between gap-5 w-full">
					<h2 className="text-2xl font-medium flex flex-col">
						Select an image from Raster
						{Boolean(initialValue?.length) && (
							<span className="font-normal text-base text-gray-400">
								{initialValue?.length} selected
							</span>
						)}
					</h2>
					<div className="flex flex-col gap-3 items-end">
						<Button
							onClick={handleOpenModal}
							className="w-fit h-fit bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded font-medium transition-colors min-w-36"
						>
							{Boolean(initialValue?.length) ? 'Edit selection' : 'Select images'}
						</Button>
						{Boolean(initialValue?.length) && (
							<Button
								onClick={handleClearSelection}
								className="w-fit h-fit bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded font-medium transition-colors min-w-36"
							>
								Clear selection
							</Button>
						)}
					</div>
				</div>

				{/* Display thumbnails */}
				{Boolean(initialValue?.length) && (
					<div className="flex flex-wrap gap-2 mt-3">
						{initialValue?.map((image: any) => (
							<div key={image.id} className="relative">
								<img
									src={image.thumbUrl}
									height={112}
									width={112}
									alt={image.id}
									className="object-cover h-28 w-28 rounded-md"
								/>
								<button
									type="button"
									onClick={() => handleRemoveImage(image.id)}
									className="absolute -top-2 -right-2 w-6 h-6 text-white cursor-pointer bg-red-500 rounded-full p-1 z-50 border-[3px] border-white flex justify-center items-center bg-primary hover:bg-primary-dark transition-colors"
								>
									<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
										<path d="M4 12L12 4M4 4l8 8" strokeLinecap="round" strokeLinejoin="round" />
									</svg>
								</button>
							</div>
						))}
					</div>
				)}
			</div>
		</Canvas>
	)
}

export default SelectorField
