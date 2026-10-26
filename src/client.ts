import { scopedRaster } from '@raster-app/react'

const HOST = {
	/** What Raster's consent page, Connected apps and the sign-in screen call this host. */
	name: 'DatoCMS',
	openExternal: (url: string) => {
		window.open(url, '_blank', 'noopener,noreferrer')
	},
}

/** The plugin's settings, as an admin saves them on its config screen. */
export type PluginParameters = {
	/** Pin the plugin to one organization (its slug): a sign-in that grants any other fails. */
	orgId?: string
	/** An organization API key that connects every editor without signing in. */
	apiKey?: string
}

export function readParameters(parameters: Record<string, unknown> | null): PluginParameters {
	const orgId = typeof parameters?.orgId === 'string' ? parameters.orgId.trim() : ''
	const apiKey = typeof parameters?.apiKey === 'string' ? parameters.apiKey.trim() : ''
	return { ...(orgId && { orgId }), ...(apiKey && { apiKey }) }
}

/**
 * The project's Raster client, and the scope its sign-in and browsing state are kept under. The
 * pinned organization is in the scope, so pinning, or changing the pin, asks editors to sign in
 * again.
 */
export function projectRaster(siteId: string, orgId: string | undefined) {
	const scope = orgId === undefined ? `raster.${siteId}` : `raster.${siteId}.org.${orgId}`
	return { scope, ...scopedRaster(scope, HOST) }
}
