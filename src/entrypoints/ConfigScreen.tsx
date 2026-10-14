import { useState } from 'react'
import { toUserMessage } from '@raster-app/react'
import type { RenderConfigScreenCtx } from 'datocms-plugin-sdk'
import { Button, Canvas, FieldGroup, Form, TextField } from 'datocms-react-ui'
import { type PluginParameters, readParameters, verifyApiKey } from '../client'

/** Where an admin pins the organization and saves the API key that connects every editor. */
export default function ConfigScreen({ ctx }: { ctx: RenderConfigScreenCtx }) {
	const saved = readParameters(ctx.plugin.attributes.parameters)
	const [orgId, setOrgId] = useState(saved.orgId ?? '')
	const [apiKey, setApiKey] = useState('')
	const [saving, setSaving] = useState(false)
	const [error, setError] = useState<string | null>(null)

	async function save(next: PluginParameters) {
		setSaving(true)
		setError(null)
		try {
			if (next.apiKey !== undefined) await verifyApiKey(next.apiKey, next.orgId)
			await ctx.updatePluginParameters(next)
			setApiKey('')
			ctx.notice('Settings saved.')
		} catch (caught) {
			console.error(caught)
			setError(toUserMessage(caught))
		} finally {
			setSaving(false)
		}
	}

	function handleSubmit() {
		void save(readParameters({ orgId, apiKey: apiKey || saved.apiKey }))
	}

	function handleRemoveKey() {
		void save(readParameters({ orgId: saved.orgId }))
	}

	return (
		<Canvas ctx={ctx}>
			<p>
				Editors sign in to Raster with their own account the first time they open a Raster field.
			</p>
			<Form onSubmit={handleSubmit}>
				<FieldGroup>
					<TextField
						id="orgId"
						name="orgId"
						label="Organization"
						hint="Optional. The slug after raster.app/ in your organization's URL. Editors can then only sign in to that organization."
						value={orgId}
						onChange={setOrgId}
					/>
					<TextField
						id="apiKey"
						name="apiKey"
						label="API key for everyone"
						hint={`Optional. ${saved.apiKey ? 'A key is saved; enter another to replace it.' : 'Editors are connected with it instead of signing in.'} DatoCMS hands plugin settings to every collaborator who loads the plugin, so anyone who can edit a record with a Raster field can read this key. Use one with Read access to only the libraries this project needs.`}
						value={apiKey}
						onChange={setApiKey}
						textInputProps={{ type: 'password', autoComplete: 'new-password' }}
						error={error ?? undefined}
					/>
				</FieldGroup>
				<FieldGroup>
					<Button type="submit" buttonType="primary" disabled={saving}>
						Save settings
					</Button>
					{saved.apiKey && (
						<Button buttonType="negative" disabled={saving} onClick={handleRemoveKey}>
							Remove saved key
						</Button>
					)}
				</FieldGroup>
			</Form>
		</Canvas>
	)
}
