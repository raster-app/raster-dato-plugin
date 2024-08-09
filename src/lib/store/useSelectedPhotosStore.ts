import { DragEndEvent } from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { create } from 'zustand'

type SelectedPhotos = {
	selectedPhotos: Image[]
	setPhoto: (photo?: Image) => void
	reorderPhotos: (event: DragEndEvent) => void
	setInitialValue: (initialValue: unknown) => void
}

export const useSelectedPhotosStore = create<SelectedPhotos>()((set, get) => {
	const setPhoto = (photo?: Image) => {
		if (!photo) return
		const current = get().selectedPhotos

		const exists = current.find((p) => p.id === photo.id)

		if (exists) {
			set({ selectedPhotos: current.filter((p) => p.id !== photo.id) })
			return
		}
		set({ selectedPhotos: [...current, photo] })
	}

	const setInitialValue = (initialValue: unknown) => {
		if (typeof initialValue === 'string') {
			set({ selectedPhotos: JSON.parse(initialValue) as Image[] })
			return
		}
		set({ selectedPhotos: initialValue as Image[] })
	}

	const reorderPhotos = (event: DragEndEvent) => {
		const { active, over } = event

		if (active.id !== over?.id && over?.id) {
			const images = get().selectedPhotos
			const oldIndex = images.findIndex((image) => image.id === active.id)
			const newIndex = images.findIndex((image) => image.id === over.id)
			return set({ selectedPhotos: arrayMove(images, oldIndex, newIndex) })
		}
	}

	return {
		selectedPhotos: [],
		setPhoto,
		reorderPhotos,
		setInitialValue,
	}
})
