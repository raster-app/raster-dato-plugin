import { RenderModalCtx } from 'datocms-plugin-sdk'
import { useState, useEffect } from 'react'
import { useSelectedPhotosStore } from '../lib/store/useSelectedPhotosStore'
import RasterImage from './Image'

type Props = {
	ctx: RenderModalCtx
	library: Library
	chooseVersion: (versionId: string) => void
	selectedVersions: string[]
}

export default function BrowsePhotos({ library, ctx }: Props) {
	const [photos, setPhotos] = useState<Image[]>([])
	const [viewsView, setViewsView] = useState(false)
	const [photoViews, setPhotoViews] = useState<Image[]>([])
	const [loading, setLoading] = useState(true)

	const [selectedPhotos, setPhoto] = useSelectedPhotosStore((state) => [
		state.selectedPhotos,
		state.setPhoto,
	])

	const query = `
	query Photos($organizationId: String!, $libraryId: String!) {
		photos(organizationId: $organizationId, libraryId: $libraryId) {
			id
			blurhash
			thumbUrl
			thumbUrlBlurred
			url
			height
			width
			views {
				id
				parentId
				name
				url
				thumbUrl
			}
		}
	}
	`

	const body = {
		query,
		operationName: 'Photos',
		variables: {
			organizationId: ctx.plugin.attributes.parameters.orgId,
			libraryId: library.id,
		},
	}

	useEffect(() => {
		const getPhotosFromLibrary = async () => {
			setLoading(true)
			try {
				let results = await fetch('https://apis.raster.app', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization:
							typeof ctx.plugin.attributes.parameters.apiKey === 'string'
								? `Bearer ${ctx.plugin.attributes.parameters.apiKey}`
								: '',
						'Apollo-Require-Preflight': 'true',
					},
					body: JSON.stringify(body),
				})

				const libraryPhotos = await results.json()
				if (libraryPhotos.data && libraryPhotos.data.photos.length > 0)
					setPhotos(libraryPhotos.data.photos)
				else {
					setPhotos([])
				}
			} catch (error) {
				console.error('Failed to fetch photos:', error)
				setPhotos([])
			} finally {
				setLoading(false)
			}
		}

		getPhotosFromLibrary()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [library])

	const showPhotoViews = (photo: Image) => {
		setViewsView(true)
		if (photo.views) {
			setPhotoViews([photo, ...photo.views])
		}
	}

	const handlePhotoClick = (photo: Image) => {
		let media = photo
		if (photo.parentId) {
			const parent = photos.find((p) => p.id === photo.parentId)
			media = { ...media, width: parent?.width ?? '', height: parent?.height ?? '' }
		}
		setPhoto(media)
		setViewsView(false)
	}

	if (loading) {
		return (
			<div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
				{Array(8)
					.fill(0)
					.map((_, index) => (
						<div key={index} className="w-full h-56 animate-pulse bg-gray-200 rounded-md" />
					))}
			</div>
		)
	}

	return viewsView ? (
		// Versions view for selected image
		<div className="flex flex-col gap-5 py-5">
			<button
				onClick={() => setViewsView(false)}
				className="w-fit h-fit bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded font-medium transition-colors"
			>
				Go back
			</button>

			<p>The selected image has more than one version, please make a selection below.</p>

			{photoViews && (
				<div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
					{photoViews.map((view: Image, index: number) => {
						const parent = photos.find((p) => p.id === view.parentId)
						return (
							<RasterImage
								key={view.id}
								image={{
									...view,
									width: view.width ?? parent?.width,
									height: view.height ?? parent?.height,
								}}
								original={index === 0}
								displayName
								selected={selectedPhotos.some((selected) => selected.id === view.id)}
								chooseImage={() => handlePhotoClick(view)}
								version
							/>
						)
					})}
				</div>
			)}
		</div>
	) : (
		// All photos for selected library
		<div className="columns-2 lg:columns-3 xl:columns-4 gap-4">
			{photos.map((photo) => {
				return (
					<div
						key={photo.id}
						onClick={() =>
							Boolean(photo.views?.length) ? showPhotoViews(photo) : handlePhotoClick(photo)
						}
					>
						<RasterImage
							image={photo}
							displayName={false}
							openVersions={showPhotoViews}
							selected={selectedPhotos.some((selected) => selected.id === photo.id)}
							versionSelected={photo.views?.some((view) =>
								selectedPhotos.some((selected) => selected.id === view.id)
							)}
						/>
					</div>
				)
			})}
		</div>
	)
}
