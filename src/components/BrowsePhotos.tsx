import { RenderFieldExtensionCtx } from 'datocms-plugin-sdk'
import { useState, useEffect } from 'react'
import { clsx } from 'clsx'

import get from 'lodash/get'

import IconDocumentDuplicate from '../icons/IconDocumentDuplicate.svg'

type Props = {
	ctx: RenderFieldExtensionCtx
	library: {
		id: string
		name: string
		photosCount: number
	}
}

export default function BrowsePhotos({ library, ctx }: Props) {
	const [photos, setPhotos] = useState<any[]>([])
	const initialValue = get(ctx?.formValues, ctx?.fieldPath || '')
	const [selectedPhoto, setSelectedPhoto] = useState(
		typeof initialValue === 'string' ? JSON.parse(initialValue) : null
	)
	const [viewsView, setViewsView] = useState(false)
	const [photoViews, setPhotoViews] = useState<any[]>([])

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
			organizationId: ctx.plugin.attributes.parameters.rasterOrgId,
			libraryId: library.id
		}
	}

	useEffect(() => {
		const getPhotosFromLibrary = async () => {
			let results = await fetch('https://raster-graphql-apis-production.up.railway.app', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization:
						typeof ctx.plugin.attributes.parameters.apiKey === 'string'
							? `Bearer ${ctx.plugin.attributes.parameters.apiKey}`
							: '',
					'Apollo-Require-Preflight': 'true'
				},

				body: JSON.stringify(body)
			})

			const libraryPhotos = await results.json()
			if (libraryPhotos.data && libraryPhotos.data.photos.length > 0)
				setPhotos(libraryPhotos.data.photos)
			else {
				setPhotos([])
			}
		}

		getPhotosFromLibrary()
	}, [library])

	const showPhotoViews = (photo: any) => {
		setViewsView(true)
		setPhotoViews(photo.views)
	}

	const handlePhotoClick = (photo: any) => {
		setSelectedPhoto(photo)
		setViewsView(false)
		ctx?.setFieldValue(ctx.fieldPath, photo ? JSON.stringify(photo) : '')
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
							photoViews.map((view: any) => {
								return (
									<div onClick={() => handlePhotoClick(view)}>
										<img src={view.thumbUrl} alt={view.name} width={64} /> {view.name}
									</div>
								)
							})}
					</div>
				</div>
			)}

			{photos.length > 0 &&
				photos.map((photo: any) => {
					return (
						<div className="photo-group" key={photo.id}>
							<div
								className={clsx(
									'photo',
									[selectedPhoto.id, selectedPhoto.parentId].includes(photo.id) && 'selected'
								)}
								onClick={() =>
									photo.views.length ? showPhotoViews(photo) : handlePhotoClick(photo)
								}
								key={photo.id}
							>
								<img src={photo.thumbUrl} alt={photo.id} width={64} />
							</div>
							{photo.views.length > 0 && (
								<div>
									<img src={IconDocumentDuplicate} alt="alternative views" width={16} />
								</div>
							)}
						</div>
					)
				})}
		</div>
	)
}
