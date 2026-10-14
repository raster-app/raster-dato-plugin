import {
	type CredentialStore,
	createRasterClient,
	localStorageCredentialStore,
	localStorageStateStore,
	type Me,
	meCredentialOrganizations,
	memoryCredentialStore,
	RasterApiError,
	type RasterClient,
	SIGNED_OUT,
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

// Keys connected as the project's on this page.
const sharedKeys = new Set<string>()

/**
 * Stores an editor's own sign-in, but the project's key only as signed out, keeping the client
 * registration: each load then connects the key saved at that point, so a rotated key takes
 * effect instead of a stored copy outliving it.
 */
function withoutSharedKeys(store: CredentialStore): CredentialStore {
	return {
		...store,
		save: (credentials) =>
			store.save(
				credentials.apiKey !== null && sharedKeys.has(credentials.apiKey)
					? { ...SIGNED_OUT, clientId: credentials.clientId }
					: credentials
			),
	}
}

export function getRasterClient(scope: string): { client: RasterClient; state: StateStore } {
	const existing = clients.get(scope)
	if (existing !== undefined) return existing

	const created = {
		client: createRasterClient({
			host: HOST,
			credentials: withoutSharedKeys(localStorageCredentialStore(`${scope}.credentials`)),
		}),
		state: localStorageStateStore(`${scope}.state.`),
	}
	clients.set(scope, created)
	return created
}

/**
 * `auth.connect` can't bind a key to an organization, so a pinned plugin checks the one the key
 * reaches before anything adopts it.
 */
async function checkKey(
	client: RasterClient,
	apiKey: string,
	orgId: string | undefined
): Promise<Me> {
	const me = await client.me(apiKey)
	if (orgId === undefined || ('organizationId' in me && me.organizationId === orgId)) return me
	throw new RasterApiError(
		`That key is for another Raster organization than ${orgId}.`,
		'ORGANIZATION_MISMATCH',
		403
	)
}

/** Connects a signed-out client with the project's API key, once Raster has accepted it. */
export async function connectSharedKey(
	client: RasterClient,
	apiKey: string,
	orgId: string | undefined
): Promise<void> {
	const me = await checkKey(client, apiKey, orgId)
	const { clientId } = client.session.current() ?? (await client.session.hydrate())
	sharedKeys.add(apiKey)
	await client.session.save({
		clientId,
		apiKey,
		oauth: null,
		userName: null,
		organizations: meCredentialOrganizations(me),
	})
}

/** Checks a key with Raster without storing it anywhere. */
export async function verifyApiKey(apiKey: string, orgId: string | undefined): Promise<void> {
	const client = createRasterClient({ host: HOST, credentials: memoryCredentialStore() })
	await checkKey(client, apiKey, orgId)
}
