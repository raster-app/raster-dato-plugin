import type { Asset, AssetVariant } from '@raster-app/react'

/**
 * One picked asset as the field stores it: the keys, in the order, that 0.x wrote, so records
 * saved before 1.0 and the sites reading them keep working.
 */
export type StoredAsset = Pick<
	Asset,
	'id' | 'blurhash' | 'sizes' | 'url' | 'name' | 'height' | 'width' | 'description'
> & {
	views: Pick<AssetVariant, 'id' | 'parentId' | 'name' | 'url' | 'sizes' | 'height' | 'width'>[] | null
}

export function toStoredAsset(asset: Asset): StoredAsset {
	const { id, blurhash, sizes, url, name, height, width, variants, description } = asset
	const views =
		variants
			?.filter((variant) => variant !== null)
			.map(({ id, parentId, name, url, sizes, height, width }) => ({
				id,
				parentId,
				name,
				url,
				sizes,
				height,
				width,
			})) ?? null
	return { id, blurhash, sizes, url, name, height, width, views, description }
}

/** Appends picks not already in the list. */
export function addStoredAssets(current: StoredAsset[], picked: StoredAsset[]): StoredAsset[] {
	const ids = new Set(current.map((asset) => asset.id))
	return [...current, ...picked.filter((asset) => !ids.has(asset.id))]
}
