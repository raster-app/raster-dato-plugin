# Raster for DatoCMS

A DatoCMS plugin for [Raster](https://raster.app), a digital asset manager. Browse, search and
upload Raster assets from a record, and pick them into a JSON field.

Built on [`@raster-app/react`](https://www.npmjs.com/package/@raster-app/react), Raster's
drop-in picker. See the [SDK docs](https://raster.app/docs/api/sdk).

![Raster in DatoCMS](docs/preview.png)

## Install and configure

1. In your DatoCMS project, open **Configuration > Plugins**, search the marketplace for
   **Raster** and install it.
2. On a model, add a **JSON** field, or open an existing Raster field. Under **Presentation**,
   choose **Raster** as the field editor.

The plugin's settings are optional:

- **Organization** — your organization's slug, the part after `raster.app/` in its URL. With it
  set, editors can only sign in to that organization.
- **API key for everyone** — an organization API key, created in Raster under
  **Organization settings > API keys**. Editors are then connected without signing in.

## Sign in

The first time an editor clicks **Browse Raster** in a Raster field, the picker asks them to
sign in. **Sign in** opens Raster in a new tab, where they approve the connection; the field
then shows their libraries. The session is remembered in that browser.

If an admin saved an API key, editors skip this step.

The saved key is stored in the plugin's settings. DatoCMS hands plugin settings to every
collaborator who loads the plugin, so anyone who can edit a record with a Raster field can read
the key. Use a key with Read access to only the libraries the project needs.

## What you can do

- **Pick assets into a field.** **Browse Raster** opens the picker full screen, where you pick
  one or several and click **Add to field**.
- **Browse, search and upload.** Switch organizations and libraries, search an organization or
  one library, open an asset's versions, and upload by button or drag-and-drop.
- **Order and remove.** Drag thumbnails to reorder them, or click **×** to remove one.

The field stores a JSON array, one entry per asset:

```json
[
	{
		"id": "…",
		"blurhash": "…",
		"sizes": "{\"400\":\"https://…\",\"1080\":\"https://…\"}",
		"url": "https://…",
		"name": "hero.jpg",
		"height": 2000,
		"width": 3000,
		"views": [],
		"description": null,
		"contentType": "image/jpeg"
	}
]
```

`url` is the full-size file on Raster's CDN; `sizes` is a JSON string of smaller sizes by their
longest edge; `views` are the asset's variants; `contentType` tells a video from an image. Assets
picked with 0.x have no `contentType`, and stored videos with `null` dimensions.

## Upgrade from 0.x

Upgrade the plugin in **Configuration > Plugins**. Your Organization ID, API key and records
carry over. See the [changelog](CHANGELOG.md#100) for what changed.

## Development

See [CONTRIBUTING.md](https://github.com/raster-app/raster-dato-plugin/blob/main/CONTRIBUTING.md).

## License

MIT
