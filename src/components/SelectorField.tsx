import {
	closestCenter,
	DndContext,
	type DragEndEvent,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from '@dnd-kit/core'
import {
	arrayMove,
	rectSortingStrategy,
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
} from '@dnd-kit/sortable'
import { getBlurhashPlaceholder, getThumbUrl } from '@raster-app/react'
import type { RenderFieldExtensionCtx } from 'datocms-plugin-sdk'
import { Button, Canvas } from 'datocms-react-ui'
import get from 'lodash/get'
import { addStoredAssets, type StoredAsset } from '../stored-asset'
import s from './styles.module.css'

/** Without `onRemove`, as when the field is disabled, it can't be moved or removed. */
function Thumbnail({ asset, onRemove }: { asset: StoredAsset; onRemove?: () => void }) {
	const {
		attributes,
		listeners,
		setNodeRef,
		setActivatorNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: asset.id, disabled: onRemove === undefined })
	const blurhash = getBlurhashPlaceholder(asset)

	return (
		<div
			// As the activator, a key pressed on the remove button doesn't start a drag.
			ref={(node) => {
				setNodeRef(node)
				setActivatorNodeRef(node)
			}}
			className={s.thumb}
			style={{
				transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
				transition,
				zIndex: isDragging ? 1 : undefined,
			}}
			{...attributes}
			{...listeners}
		>
			{/* 0.x stored videos without dimensions; one picked since has them and a poster in `sizes`. */}
			{!asset.width && !asset.height ? (
				<video src={asset.url ?? undefined} className={s.media} muted />
			) : (
				<img
					src={getThumbUrl(asset)}
					alt={asset.name ?? asset.id}
					className={s.media}
					style={blurhash ? { backgroundImage: `url(${blurhash})` } : undefined}
				/>
			)}
			{onRemove && (
				<button type="button" className={s.remove} aria-label="Remove" onClick={onRemove}>
					×
				</button>
			)}
		</div>
	)
}

/** The field: its picked assets, in order, and a button that opens the picker to add more. */
export default function SelectorField({ ctx }: { ctx: RenderFieldExtensionCtx }) {
	const sensors = useSensors(
		// A click on a thumbnail's remove button isn't a drag.
		useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
		useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
	)

	// The field stores a JSON string of `StoredAsset[]`, or null when empty.
	const value = get(ctx.formValues, ctx.fieldPath)
	const assets: StoredAsset[] = typeof value === 'string' && value !== '' ? JSON.parse(value) : []

	function setAssets(next: StoredAsset[]) {
		ctx.setFieldValue(ctx.fieldPath, next.length === 0 ? null : JSON.stringify(next))
	}

	function handleDragEnd({ active, over }: DragEndEvent) {
		if (over === null || active.id === over.id) return
		const from = assets.findIndex((asset) => asset.id === active.id)
		const to = assets.findIndex((asset) => asset.id === over.id)
		setAssets(arrayMove(assets, from, to))
	}

	async function handleOpenModal() {
		// What `SelectorModal` resolves with.
		const picked = (await ctx.openModal({
			id: 'selectorModal',
			title: 'Select assets from Raster',
			width: 'fullWidth',
		})) as StoredAsset[] | null
		if (picked?.length) setAssets(addStoredAssets(assets, picked))
	}

	return (
		<Canvas ctx={ctx}>
			<div className={s.field}>
				{assets.length > 0 && (
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={handleDragEnd}
					>
						<SortableContext items={assets} strategy={rectSortingStrategy}>
							<div className={s.grid}>
								{assets.map((asset) => (
									<Thumbnail
										key={asset.id}
										asset={asset}
										onRemove={
											ctx.disabled
												? undefined
												: () => setAssets(assets.filter((other) => other.id !== asset.id))
										}
									/>
								))}
							</div>
						</SortableContext>
					</DndContext>
				)}

				{!ctx.disabled && (
					<div className={s.actions}>
						<Button buttonSize="s" onClick={handleOpenModal}>
							Browse Raster
						</Button>
						{assets.length > 0 && (
							<Button buttonSize="s" buttonType="negative" onClick={() => setAssets([])}>
								Clear selection
							</Button>
						)}
					</div>
				)}
			</div>
		</Canvas>
	)
}
