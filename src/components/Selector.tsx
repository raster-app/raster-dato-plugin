import { RenderFieldExtensionCtx } from 'datocms-plugin-sdk'
import { Canvas } from 'datocms-react-ui'
import { useState, useEffect } from 'react'
import useSWR from 'swr'
import clsx from 'clsx'
import get from 'lodash/get'
import BrowsePhotos from './BrowsePhotos'
import { swrLibreriesFetcher } from '../lib/fetcher'
import { getLibraryListQuery } from '../lib/graphql/queries'
import { useSelectedPhotosStore } from '../lib/store/useSelectedPhotosStore'
import RasterImage from './Image'
import XMark from './icons/XMark'

import type { DragEndEvent, DragStartEvent, UniqueIdentifier } from '@dnd-kit/core'
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core'
import {
	arrayMove,
	SortableContext,
	useSortable,
	verticalListSortingStrategy,
} from '@dnd-kit/sortable'

type Props = {
	ctx: RenderFieldExtensionCtx
}

interface SortableItemProps {
	id: UniqueIdentifier
	children: React.ReactNode
	isDragging: boolean
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
	const [expandedView, setExpandedView] = useState(false)
	const [libraries, setLibraries] = useState<Library[]>()
	const [selectedLibrary, setSelectedLibrary] = useState<Library>()
	const [selectedPhotos, setInitialValue, setSelectedPhotos] = useSelectedPhotosStore((state) => [
		state.selectedPhotos,
		state.setInitialValue,
		state.setSelectedPhotos,
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
		if (data && data.length > 0 && !libraries?.length) {
			setLibraries(data)
		}
	}, [data, libraries])

	useEffect(() => {
		const initialValue = get(ctx?.formValues, ctx?.fieldPath || '')
		setInitialValue(initialValue)
	}, [ctx?.fieldPath, ctx?.formValues, setInitialValue])

	const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
	const [isDragging, setIsDragging] = useState(false)

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event
		setActiveId(null)
		setIsDragging(false)

		if (active.id !== over?.id && over?.id) {
			setSelectedPhotos((items) => {
				const oldIndex = items.findIndex((item) => item.id === active.id)
				const newIndex = items.findIndex((item) => item.id === over.id)
				return arrayMove(items, oldIndex, newIndex)
			})
		}
	}

	const handleDragStart = (event: DragStartEvent) => {
		setActiveId(event.active.id)
		setIsDragging(true)
	}

	const handleSelect = (img?: Image) => {
		if (!img) return
		setExpandedView(true)
		const imgLibrary = img.url.split('/')[4]
		setSelectedLibrary(libraries?.find((lib) => lib.id === imgLibrary))
	}

	if (!ctx.plugin.attributes.parameters.orgId || !ctx.plugin.attributes.parameters.apiKey) {
		return <>Please configure the plugin first</>
	}

	return (
		<Canvas ctx={ctx}>
			<div className="flex items-center justify-between">
				<h2 className="text-xl font-medium">Select an image from Raster</h2>
				<div className="flex gap-2">
					<button type="button" className="primary-action" onClick={() => setExpandedView(false)}>
						Close
					</button>
					<button
						type="button"
						className="primary-action"
						onClick={() => {
							ctx?.setFieldValue(
								ctx.fieldPath,
								JSON.stringify(Boolean(selectedPhotos.length) ? selectedPhotos : [])
							)
							setExpandedView(false)
						}}
					>
						Save
					</button>
					<button
						type="button"
						className="primary-action"
						onClick={() => {
							setInitialValue([])
							setExpandedView(false)
						}}
					>
						Reset
					</button>
				</div>
			</div>

			{expandedView ? (
				<div className="flex gap-5">
					{/* Libraries */}
					<div className="flex flex-col gap-2 w-full max-w-56">
						{libraries &&
							libraries.map((library) => (
								<button
									type="button"
									className={clsx(
										'px-3 py-4 border transition-colors rounded-md flex justify-between items-center',
										selectedLibrary?.id === library.id
											? 'border-primary'
											: 'border-gray-300 hover:border-gray-400'
									)}
									key={library.id}
									onClick={() => setSelectedLibrary(library)}
								>
									{library.name} <span className="text-gray-400">{library.photosCount}</span>
								</button>
							))}
					</div>

					{/* Selected images */}
					<div className="flex flex-col gap-5">
						<h3 className="text-xl font-medium">Selected images:</h3>
						{Boolean(selectedPhotos.length) ? (
							<DndContext
								collisionDetection={closestCenter}
								onDragStart={handleDragStart}
								onDragEnd={handleDragEnd}
							>
								<SortableContext items={selectedPhotos} strategy={verticalListSortingStrategy}>
									<div className="flex gap-2 flex-wrap">
										{selectedPhotos?.map((image) => (
											<div
												key={image.id}
												className="group image relative inline-block opacity-0 animate-fade-in"
											>
												<button
													type="button"
													// onClick={() => {
													// 	setSelectedPhotos((prevSelectedImages) =>
													// 		prevSelectedImages.filter(
													// 			(selectedImage) => selectedImage.id !== image.id
													// 		)
													// 	)
													// }}
													aria-label="Remove image"
													className={clsx('remove', { 'opacity-0': isDragging })}
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
										<SortableItem id={activeId} isDragging>
											<RasterImage
												image={selectedPhotos.find((image) => image.id === activeId)!}
												displayName={false}
												thumbnail
												chooseImage={handleSelect}
											/>
										</SortableItem>
									) : null}
								</DragOverlay>
							</DndContext>
						) : (
							<p>No images selected</p>
						)}

						<hr className="bg-gray-300" />

						{selectedLibrary?.id && <BrowsePhotos library={selectedLibrary} ctx={ctx} />}
					</div>
				</div>
			) : (
				<>
					{Boolean(selectedPhotos.length) ? (
						<div className="selected-photos">
							{selectedPhotos?.map((item) => (
								<img
									key={item?.id}
									src={item?.thumbUrl}
									alt={item?.id}
									width={100}
									onClick={() => handleSelect(item)}
								/>
							))}
						</div>
					) : (
						<div className="empty-state">
							<h2>No images selected</h2>
							<button
								type="button"
								className="primary-action"
								onClick={() => setExpandedView(true)}
							>
								Select Images
							</button>
						</div>
					)}
				</>
			)}
		</Canvas>
	)
}

export default Selector
