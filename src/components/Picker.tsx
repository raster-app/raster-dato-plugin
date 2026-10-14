import { type ReactNode, useEffect, useState } from 'react'
import {
	type Asset,
	RasterPicker,
	RasterProvider,
	type RasterClient,
	toUserMessage,
	useRasterClient,
	useSession,
} from '@raster-app/react'
import '@raster-app/react/styles.css'
import type { RenderFieldExtensionCtx, RenderModalCtx } from 'datocms-plugin-sdk'
import { Spinner } from 'datocms-react-ui'
import { connectSharedKey, getRasterClient, rasterScope, readParameters } from '../client'
import s from './styles.module.css'

// A gate rendered while its client is still connecting waits on that connect.
const connecting = new WeakMap<RasterClient, Promise<void>>()

function connectOnce(client: RasterClient, apiKey: string, orgId: string | undefined) {
	const pending =
		connecting.get(client) ??
		connectSharedKey(client, apiKey, orgId).finally(() => connecting.delete(client))
	connecting.set(client, pending)
	return pending
}

/** Connects with the key an admin saved for the project before the picker offers to sign in. */
function SharedKeyGate({
	apiKey,
	orgId,
	children,
}: {
	apiKey: string | undefined
	orgId: string | undefined
	children: ReactNode
}) {
	const client = useRasterClient()
	const { credentials, isConfigured } = useSession()
	const [result, setResult] = useState<
		{ status: 'idle' | 'done' } | { status: 'failed'; message: string }
	>({ status: 'idle' })

	// Decided while rendering, so the sign-in never shows before the connect starts. Only once
	// the store is read, so an editor's own sign-in from an earlier load is kept. Once per page,
	// so an editor who signs out of the key can sign in themselves.
	const shouldConnect =
		apiKey !== undefined && credentials !== undefined && !isConfigured && result.status === 'idle'

	useEffect(() => {
		if (!shouldConnect || apiKey === undefined) return
		connectOnce(client, apiKey, orgId).then(
			() => setResult({ status: 'done' }),
			(caught: unknown) => {
				console.error(caught)
				setResult({ status: 'failed', message: toUserMessage(caught) })
			}
		)
	}, [shouldConnect, client, apiKey, orgId])

	if (shouldConnect) {
		return (
			<div className={s.center} role="status">
				<Spinner /> Connecting to Raster…
			</div>
		)
	}

	return (
		<>
			{result.status === 'failed' && !isConfigured && (
				<p className={s.error}>The API key saved for this project was refused: {result.message}</p>
			)}
			{children}
		</>
	)
}

/** Raster's picker, signed in with the project's client, `height` tall. */
export function Picker({
	ctx,
	height,
	onPick,
}: {
	ctx: RenderFieldExtensionCtx | RenderModalCtx
	height: number
	onPick: (asset: Asset) => void
}) {
	const { orgId, apiKey } = readParameters(ctx.plugin.attributes.parameters)
	const scope = rasterScope(ctx.site.id, orgId)
	const { client, state } = getRasterClient(scope)

	return (
		// The provider keeps the client it mounted with, so another scope remounts it.
		<RasterProvider key={scope} client={client} state={state}>
			<SharedKeyGate apiKey={apiKey} orgId={orgId}>
				<div style={{ height }}>
					<RasterPicker
						organizationId={orgId}
						onPick={onPick}
						onError={console.error}
						theme="light"
					/>
				</div>
			</SharedKeyGate>
		</RasterProvider>
	)
}
