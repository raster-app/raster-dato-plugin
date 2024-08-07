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

type Props = {
	ctx: RenderModalCtx
	selectedPhotos: any[]
	setSelectedPhotos: (photos: any) => void
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

function arrayMove<T>(arr: T[], fromIndex: number, toIndex: number): T[] {
	const element = arr[fromIndex]
	arr.splice(fromIndex, 1)
	arr.splice(toIndex, 0, element)
	return arr
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

const Selector = ({ ctx, selectedPhotos, setSelectedPhotos }: Props) => {
	const [libraries, setLibraries] = useState<Library[]>([])
	const [selectedLibrary, setSelectedLibrary] = useState<Library | null>(null)
	const [selectedVersions, setSelectedVersions] = useState<string[]>([])

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
		const { active, over } = event
		if (active && over && active.id !== over.id) {
			setSelectedPhotos((items: Image[]) => {
				const oldIndex = items.findIndex((item) => item.id === active.id)
				const newIndex = items.findIndex((item) => item.id === over.id)
				return arrayMove([...items], oldIndex, newIndex)
			})
		}
	}

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id)
		setIsDragging(true)
	}

	if (!ctx.plugin.attributes.parameters.orgId || !ctx.plugin.attributes.parameters.apiKey) {
		return <>Please configure the plugin first</>
	}

	return (
		<Canvas ctx={ctx}>
			<h2 className="text-2xl font-medium pb-10">Select an image from Raster</h2>

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
												onClick={() =>
													setSelectedPhotos((prev: any[]) =>
														prev.filter((photo) => photo.id !== image.id)
													)
												}
												aria-label="Remove image"
												className={clsx(
													'z-10 text-white border-[3px] border-white absolute -top-2.5 -right-2.5 h-8 w-8 flex justify-center items-center bg-primary rounded-full p-1 hover:bg-primary-dark transition-colors',
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
							<p>Please select a library.</p>
						</div>
					)}
				</div>
			</div>
		</Canvas>
	)
}

export default Selector
