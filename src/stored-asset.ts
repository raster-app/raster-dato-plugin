import type { Asset } from '@raster-app/react'

type StoredVariant = {
	id: string
	parentId: string | null
	name: string | null
	url: string | null
	sizes: string | null
	height: number | null
	width: number | null
}

/**
 * One picked asset as the field stores it: the keys, in the order, that 0.x wrote, so records
 * saved before 1.0 and the sites reading them keep working.
 */
export type StoredAsset = {
	id: string
	blurhash: string | null
	sizes: string | null
	url: string | null
	name: string | null
	height: number | null
	width: number | null
	views: StoredVariant[] | null
	description: string | null
}

export function toStoredAsset(asset: Asset): StoredAsset {
	return {
		id: asset.id,
		blurhash: asset.blurhash,
		sizes: asset.sizes,
		url: asset.url,
		name: asset.name,
		height: asset.height,
		width: asset.width,
		views:
			asset.variants?.flatMap((variant) =>
				variant === null
					? []
					: [
							{
								id: variant.id,
								parentId: variant.parentId,
								name: variant.name,
								url: variant.url,
								sizes: variant.sizes,
								height: variant.height,
								width: variant.width,
							},
						]
			) ?? null,
		description: asset.description,
	}
}

/** The field's value: a JSON string of `StoredAsset[]`, or null when empty. */
export function parseStoredAssets(value: unknown): StoredAsset[] {
	if (typeof value !== 'string' || value === '') return []
	try {
		const parsed: unknown = JSON.parse(value)
		return Array.isArray(parsed) ? parsed : []
	} catch {
		return []
	}
}

export function serializeStoredAssets(assets: StoredAsset[]): string | null {
	return assets.length === 0 ? null : JSON.stringify(assets)
}

/** Appends picks not already in the list. */
export function addStoredAssets(current: StoredAsset[], picked: StoredAsset[]): StoredAsset[] {
	const ids = new Set(current.map((asset) => asset.id))
	return [...current, ...picked.filter((asset) => !ids.has(asset.id))]
}

const VIDEO_PATH = /\.(mp4|m4v|mov|webm|ogv)$/i

/** 0.x stored videos without dimensions; a video picked since carries them, so its URL tells. */
export function isVideo(asset: StoredAsset): boolean {
	if (!asset.width && !asset.height) return true
	try {
		return asset.url !== null && VIDEO_PATH.test(new URL(asset.url).pathname)
	} catch {
		return false
	}
}
