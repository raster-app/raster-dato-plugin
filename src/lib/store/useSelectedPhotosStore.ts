import { create } from 'zustand'

type SelectedPhotos = {
	selectedPhotos: Image[]
	setSelectedPhotos: (photo?: Image) => void
	setInitialValue: (initialValue: unknown) => void
}

export const useSelectedPhotosStore = create<SelectedPhotos>()((set, get) => {
	const setSelectedPhotos = (photo?: Image) => {
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
		set({ selectedPhotos: [] })
	}

	return {
		selectedPhotos: [],
		setSelectedPhotos,
		setInitialValue,
	}
})
