import { RenderFieldExtensionCtx } from 'datocms-plugin-sdk'
import { useState, useEffect } from 'react'
import { clsx } from 'clsx'

import IconDocumentDuplicate from '../icons/IconDocumentDuplicate.svg'
import { useSelectedPhotosStore } from '../lib/store/useSelectedPhotosStore'
import RasterImage from './Image'

type Props = {
	ctx: RenderFieldExtensionCtx
	library: Library
}

export default function BrowsePhotos({ library, ctx }: Props) {
	const [photos, setPhotos] = useState<Image[]>([])
	const [viewsView, setViewsView] = useState(false)
	const [photoViews, setPhotoViews] = useState<Image[]>([])

	const [selectedPhotos, setSelectedPhotos] = useSelectedPhotosStore((state) => [
		state.selectedPhotos,
		state.setSelectedPhotos,
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
		}

		getPhotosFromLibrary()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [library])

	const showPhotoViews = (photo: Image) => {
		setViewsView(true)
		if (photo.views) {
			setPhotoViews(photo.views)
		}
	}

	const handlePhotoClick = (photo: Image) => {
		setSelectedPhotos(photo)
		setViewsView(false)
	}

	return viewsView ? (
		<div className="flex flex-col gap-5 py-5">
			<button
				onClick={() => setViewsView(false)}
				className="w-fit h-fit bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded font-medium transition-colors"
			>
				Go back
			</button>

			<p>The selected image has more than one version, please make a selection below.</p>

			{photoViews && (
				<div className="grid grid-cols-2 gap-4">
					{photoViews.map((view: Image) => {
						return (
							<RasterImage
								image={view}
								displayName
								selected={selectedPhotos.includes(view)}
								chooseImage={() => handlePhotoClick(view)}
							/>
						)
					})}
				</div>
			)}
		</div>
	) : (
		<div className="columns-2 gap-4">
			{photos.map((photo) => {
				return (
					<div
						key={photo.id}
						className={clsx(
							'photo',
							selectedPhotos?.length > 0 &&
								selectedPhotos.find((p) => p.id === photo.id || p.parentId === photo.id) &&
								'selected'
						)}
						onClick={() =>
							Boolean(photo.views?.length) ? showPhotoViews(photo) : handlePhotoClick(photo)
						}
					>
						<RasterImage
							image={photo}
							displayName={false}
							openVersions={showPhotoViews}
							selected={selectedPhotos.includes(photo)}
						/>
					</div>
				)
			})}
		</div>
	)
}
