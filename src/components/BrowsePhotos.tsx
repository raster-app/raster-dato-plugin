import { RenderFieldExtensionCtx } from 'datocms-plugin-sdk'
import { useState, useEffect } from 'react'
import { clsx } from 'clsx'

import get from 'lodash/get'

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

	const query = `
	query Photos($organizationId: String!, $libraryId: String!) {
		photos(organizationId: $organizationId, libraryId: $libraryId) {
			id
			tags
			blurhash
			thumbUrlBlurred
			thumbUrl
			baseUrl
			height
			width
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
			console.log('-> photos', libraryPhotos.data)

			if (libraryPhotos.data && libraryPhotos.data.photos.length > 0)
				setPhotos(libraryPhotos.data.photos)
			else {
				setPhotos([])
			}
		}

		getPhotosFromLibrary()
	}, [library])

	const handlePhotoClick = (photo: any) => {
		setSelectedPhoto(photo)
		ctx?.setFieldValue(ctx.fieldPath, photo ? JSON.stringify(photo) : '')
	}

	return (
		<div>
			<h3 style={{ margin: '0 0 10px 0' }}>{library.name}</h3>
			<div className="photos">
				{photos.length > 0 ? (
					photos.map((photo: any) => {
						return (
							<div
								onClick={() => handlePhotoClick(photo)}
								className={clsx('photo', photo.id === selectedPhoto.id && 'selected')}
								key={photo.id}
							>
								<img src={photo.thumbUrl} alt={photo.id} width={64} />
							</div>
						)
					})
				) : (
					<p>No photos found</p>
				)}
			</div>
		</div>
	)
}
