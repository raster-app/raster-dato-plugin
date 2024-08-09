import { RenderModalCtx } from 'datocms-plugin-sdk'
import { Canvas } from 'datocms-react-ui'
import { useState, useEffect } from 'react'
import useSWR from 'swr'
import clsx from 'clsx'
import BrowsePhotos from './BrowsePhotos'
import { swrLibreriesFetcher } from '../lib/fetcher'
import { getLibraryListQuery } from '../lib/graphql/queries'
import RasterImage from './Image'
import XMark from './icons/XMark'

import type { DragEndEvent, DragStartEvent, UniqueIdentifier } from '@dnd-kit/core'
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSelectedPhotosStore } from '../lib/store/useSelectedPhotosStore'

type Props = {
	ctx: RenderModalCtx
}

interface SortableItemProps {
	id: UniqueIdentifier
	children: React.ReactNode
	isDragging: boolean
}

interface Library {
	id: string
	name: string
	photosCount: number
}

function SortableItem({ id, children, isDragging }: SortableItemProps) {
	const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

	const style = {
		transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
		transition,
		zIndex: isDragging ? 1000 : 'auto',
	}

	return (
		<div
			ref={setNodeRef}
			style={style}
			{...attributes}
			{...listeners}
			className="group image relative inline-block"
		>
			{children}
		</div>
	)
}

const Selector = ({ ctx }: Props) => {
	const [libraries, setLibraries] = useState<Library[]>([])
	const [selectedLibrary, setSelectedLibrary] = useState<Library | null>(null)
	const [selectedVersions, setSelectedVersions] = useState<string[]>([])

	const [selectedPhotos, reorderPhotos, setPhoto] = useSelectedPhotosStore((state) => [
		state.selectedPhotos,
		state.reorderPhotos,
		state.setPhoto,
	])

	const { orgId, apiKey } = ctx.plugin.attributes.parameters

	const { data } = useSWR(
		{
			query: getLibraryListQuery,
			variables: { organizationId: orgId },
			settings: { apiKey, orgId },
		},
		swrLibreriesFetcher,
		{
			revalidateIfStale: false,
			revalidateOnFocus: false,
			revalidateOnReconnect: false,
		}
	)

	useEffect(() => {
		if (data && data.length > 0 && !libraries.length) {
			setLibraries(data)
		}
	}, [data, libraries])

	useEffect(() => {
		if (libraries.length > 0 && !selectedLibrary) {
			setSelectedLibrary(libraries[0])
		}
	}, [libraries, selectedLibrary])

	const handleChooseVersion = (versionId: string) => {
		setSelectedVersions((prevSelectedVersions: string[]) => {
			const isSelected = prevSelectedVersions.includes(versionId)
			if (isSelected) {
				return prevSelectedVersions.filter((id) => id !== versionId)
			}
			return [...prevSelectedVersions, versionId]
		})
	}

	const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
	const [isDragging, setIsDragging] = useState(false)

	const handleDragEnd = (event: DragEndEvent) => {
		setActiveId(null)
		setIsDragging(false)
		reorderPhotos(event)
	}

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id)
		setIsDragging(true)
	}

	if (!ctx.plugin.attributes.parameters.orgId || !ctx.plugin.attributes.parameters.apiKey) {
		return <>Please configure the plugin first</>
	}

	return (
		<div className="relative flex flex-col gap-10 h-full bg-white">
			<Canvas ctx={ctx}>
				<div className="flex justify-between w-full">
					<h2 className="text-2xl font-medium pb-10">Select an image from Raster</h2>

					{selectedPhotos.length > 0 && (
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
					<div className="flex flex-col gap-2 w-full sm:max-w-56 shrink-0">
						{libraries &&
							libraries.map((library) => (
								<button
									type="button"
									className={clsx(
										'px-3 py-4 border transition-colors rounded-md flex justify-between items-center',
										selectedLibrary?.id === library.id
											? 'border-primary'
											: 'border-gray-200 hover:border-gray-300'
									)}
									key={library.id}
									onClick={() => setSelectedLibrary(library)}
								>
									{library.name} <span className="text-gray-400">{library.photosCount}</span>
								</button>
							))}
					</div>

					{/* Selected images */}
					<div className="flex flex-col gap-3 w-full max-w-7xl mx-auto">
						<h3 className="text-xl font-medium pb-3">Selected images ({selectedPhotos.length}):</h3>

						{Boolean(selectedPhotos.length) ? (
							<DndContext
								collisionDetection={closestCenter}
								onDragStart={handleDragStart}
								onDragEnd={handleDragEnd}
							>
								<SortableContext items={selectedPhotos} strategy={verticalListSortingStrategy}>
									<div className="flex gap-x-2 flex-wrap">
										{selectedPhotos?.map((image: any) => (
											<div
												key={image.id}
												className="group image relative inline-block opacity-0 animate-fade-in"
											>
												<button
													type="button"
													onClick={() => setPhoto(image)}
													aria-label="Remove image"
													className={clsx(
														'z-50 text-white border-[3px] border-white absolute -top-2.5 -right-2.5 h-8 w-8 flex justify-center items-center bg-primary rounded-full p-1 hover:bg-primary-dark transition-colors',
														{ 'opacity-0': isDragging }
													)}
												>
													<XMark />
												</button>

												<SortableItem id={image.id} isDragging={isDragging}>
													<RasterImage image={image} displayName={false} thumbnail />
												</SortableItem>
											</div>
										))}
									</div>
								</SortableContext>
								<DragOverlay>
									{activeId ? (
										<SortableItem id={activeId} isDragging={isDragging}>
											<RasterImage
												image={selectedPhotos.find((image: any) => image.id === activeId)!}
												displayName={false}
												thumbnail
											/>
										</SortableItem>
									) : null}
								</DragOverlay>
							</DndContext>
						) : (
							<div className="relative h-36 w-full mb-2 border rounded-md">
								<span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
									Please make a selection below.
								</span>
							</div>
						)}

						<hr className="bg-gray-300 mb-3" />

						{selectedLibrary?.id ? (
							<BrowsePhotos
								library={selectedLibrary}
								chooseVersion={handleChooseVersion}
								selectedVersions={selectedVersions}
								ctx={ctx}
							/>
						) : (
							<div className="h-[500px] flex items-center justify-center">
								Select a library to view 👀 images
							</div>
						)}
					</div>
				</div>
			</Canvas>

			{/* Selected images count, cancel and confirm buttons */}
			<div
				className={clsx(
					'w-full flex justify-between bg-white border-t border-gray-200 transition-[opacity,transform] duration-300 ease-in-out',
					selectedPhotos.length > 0 ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
				)}
			>
				<span className="font-medium py-6 px-7">{selectedPhotos.length} selected</span>
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
