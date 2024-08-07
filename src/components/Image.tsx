import clsx from 'clsx'
import Check from './icons/Check'

type Props = {
	image: Image
	original?: boolean
	selected?: boolean
	displayName: boolean
	chooseImage?: (image: Image) => void
	openVersions?: (image: Image) => void
	thumbnail?: boolean
	version?: boolean
	versionSelected?: boolean
}

const RasterImage = ({
	image,
	original,
	selected,
	displayName,
	chooseImage,
	openVersions,
	thumbnail,
	version,
	versionSelected,
}: Props) => {
	const originalLabel = () => {
		if (!original) return null
		return (
			<span className="bg-gray-200 py-0.5 px-1.5 rounded text-gray-500 ml-1 text-sm">Original</span>
		)
	}

	return (
		<div className="relative flex flex-col gap-1.5 mb-4">
			<button
				type="button"
				onClick={() => !thumbnail && chooseImage && chooseImage(image)}
				key={image.id}
				className={clsx(
					'relative group inline-block border-[3px] rounded-lg transition-transform duration-300 ease-in-out hover:scale-[0.98]',
					selected ? 'border-primary' : 'border-white',
					thumbnail ? 'cursor-move h-36 w-36' : 'overflow-hidden',
					{ 'h-40': version }
				)}
			>
				{thumbnail && (
					<div className="z-10 transition-opacity absolute inset-0 group-hover:opacity-100 opacity-0 bg-black/25 h-full w-full rounded" />
				)}
				<img
					src={image.thumbUrl}
					alt={image?.name}
					className={clsx(
						'animate-fade-in w-full h-full text-gray-500 rounded transition-transform duration-300 ease-in-out select-none pointer-events-none bg-gray-100 object-cover',
						thumbnail ? 'h-36 w-36' : 'group-hover:scale-[1.02] min-h-[147px]'
					)}
				/>
				{!thumbnail && openVersions && image?.views && image?.views?.length > 0 && (
					<button
						type="button"
						className="cursor-pointer"
						onClick={(e) => {
							e.preventDefault()
							e.stopPropagation()
							openVersions(image)
						}}
					>
						<div
							className={clsx(
								'absolute top-2 right-2 bg-gray-900/80 px-2.5 py-1 text-white rounded-md cursor-pointer text-gray-300 flex gap-1.5 items-center hover:bg-gray-900/90',
								{ 'border-2 border-primary': versionSelected }
							)}
						>
							+{image.views.length}
							{versionSelected && (
								<span className="h-4 w-4 p-0.5 bg-primary rounded-full flex justify-center items-center">
									<Check />
								</span>
							)}
						</div>
					</button>
				)}
				<span
					className={clsx(
						'absolute bottom-2 right-2 bg-primary h-7 w-7 p-1 rounded-full pointer-events-none flex items-center justify-center text-white',
						selected && !thumbnail ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
					)}
				>
					<Check />
				</span>
				{!thumbnail && image.height && image.width && (
					<span className="absolute bottom-2 left-2 text-xs bg-gray-900/80 px-2.5 py-1 rounded-md pointer-events-none text-gray-100">
						{image.height}×{image.width}
					</span>
				)}
			</button>

			{displayName && (
				<div className="image-name">
					{image.name} {originalLabel()}
				</div>
			)}
		</div>
	)
}

export default RasterImage
