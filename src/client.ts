import {
	connectSharedApiKey,
	createRasterClient,
	localStorageCredentialStore,
	localStorageStateStore,
	memoryCredentialStore,
	type RasterClient,
	type StateStore,
} from '@raster-app/react'

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
 * What a project's Raster sign-in and browsing state are kept under. The pinned organization
 * is in it, so pinning, or changing the pin, asks editors to sign in again.
 */
export function rasterScope(siteId: string, orgId: string | undefined): string {
	const scope = `raster.${siteId}`
	return orgId === undefined ? scope : `${scope}.org.${orgId}`
}

// DatoCMS renders again on every change to the form, so the client outlives a render.
const clients = new Map<string, { client: RasterClient; state: StateStore }>()

export function getRasterClient(scope: string): { client: RasterClient; state: StateStore } {
	const existing = clients.get(scope)
	if (existing !== undefined) return existing

	const created = {
		client: createRasterClient({
			host: HOST,
			credentials: localStorageCredentialStore(`${scope}.credentials`),
		}),
		state: localStorageStateStore(`${scope}.state.`),
	}
	clients.set(scope, created)
	return created
}

/** Checks a key with Raster, and that it is for `orgId`, without storing it anywhere. */
export async function verifyApiKey(apiKey: string, orgId: string | undefined): Promise<void> {
	const client = createRasterClient({ host: HOST, credentials: memoryCredentialStore() })
	await connectSharedApiKey(client, { apiKey, organizationId: orgId })
}
