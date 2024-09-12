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

	return (
		<Canvas ctx={ctx}>
			<div className="flex flex-col gap-5 border p-5 rounded-md border-gray-200 mt-3">
				<div className="flex justify-between gap-5 w-full">
					<h2 className="text-2xl font-medium flex flex-col">
						Select an image from Raster
						<span className="font-normal text-base text-gray-400">
							{initialValue?.length} selected
						</span>
					</h2>
					<div className="flex gap-3">
						<Button
							onClick={handleOpenModal}
							className="w-fit h-fit bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded font-medium transition-colors"
						>
							{Boolean(initialValue?.length) ? 'Edit selection' : 'Select images'}
						</Button>
					</div>
				</div>

				{/* Display thumbnails */}
				{Boolean(initialValue?.length) && (
					<div className="flex flex-wrap gap-2 mt-3">
						{initialValue?.map((image: any) => (
							<img
								key={image.id}
								src={image.thumbUrl}
								height={112}
								width={112}
								alt={image.id}
								className="object-cover h-28 w-28 rounded-md"
							/>
						))}
					</div>
				)}
			</div>
		</Canvas>
	)
}

export default SelectorField
