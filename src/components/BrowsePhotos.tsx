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

	return (
		<div className="photos">
			{viewsView && (
				<div className="photo-modal">
					<div className="header">
						<div>
							<div>Photo Views</div>
							<div>The selected image has more than one views.</div>
						</div>

						<div onClick={() => setViewsView(false)}>Close</div>
					</div>

					<div>
						{photoViews &&
							photoViews.map((view: Image) => {
								return (
									<div
										onClick={() => handlePhotoClick(view)}
										className={clsx(
											'photo',
											selectedPhotos?.length > 0 &&
												selectedPhotos.find((p) => p.id === view.id || p.parentId === view.id) &&
												'selected'
										)}
									>
										<img src={view.thumbUrl} alt={view.name} width={64} />
									</div>
								)
							})}
					</div>
				</div>
			)}

			{photos.length > 0 && (
				<div className="columns-3 gap-4">
					{photos.map((photo) => {
						return (
							<div key={photo.id}>
								<div
									className={clsx(
										'photo',
										selectedPhotos?.length > 0 &&
											selectedPhotos.find((p) => p.id === photo.id || p.parentId === photo.id) &&
											'selected'
									)}
									onClick={() =>
										Boolean(photo.views?.length) ? showPhotoViews(photo) : handlePhotoClick(photo)
									}
									key={photo.id}
								>
									<RasterImage image={photo} displayName={false} />
								</div>
								{Boolean(photo?.views?.length) && (
									<div>
										<img src={IconDocumentDuplicate} alt="alternative views" width={16} />
									</div>
								)}
							</div>
						)
					})}
				</div>
			)}
		</div>
	)
}
