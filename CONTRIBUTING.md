# Contributing

## Development

```bash
pnpm install
pnpm dev
```

In a sandbox environment of a DatoCMS project with the plugin installed, open the plugin's
**Developer zone** and set the entry point URL to `http://localhost:5173`; use Chrome or Firefox,
since Safari blocks the insecure iframe. To check a change:

```bash
pnpm typecheck
pnpm lint
pnpm build
```

`pnpm build` type-checks and writes the plugin to `dist/`, which `datoCmsPlugin.entryPoint`
points at. It is not committed: DatoCMS loads the plugin from the published npm package, and
`prepublishOnly` builds it.

## Releasing

DatoCMS installs marketplace plugins from npm, so a release is an npm publish:

1. **The marketplace reads `package.json`.** It lists a package whose `keywords` include
   `datocms-plugin` and whose `datoCmsPlugin` names a `title`, `entryPoint` and `permissions`,
   with the entry point and images as files in the package at paths relative to its root. It
   picks up a new package or version within an hour of the publish
   ([Publishing to the Marketplace](https://www.datocms.com/docs/plugin-sdk/publishing-to-marketplace)).
   That page also asks for a name starting with `datocms-plugin-`; this scoped name has been
   listed since 0.x.
2. **Publish a canary.** `npm publish --tag next` publishes without the `latest` tag, and
   DatoCMS only offers installed projects an upgrade when a version is tagged `latest`
   ([Releasing new plugin versions](https://www.datocms.com/docs/plugin-sdk/releasing-new-plugin-versions)).
3. **Test it in a sandbox environment.** Fork the primary environment, and in the plugin's
   **Developer zone** use **Upgrade to canary release** to install that exact version. Run the
   manual test below, on records and settings saved by the previous version: DatoCMS keeps old
   settings across upgrades, so they must still work.
4. **Promote it.** `npm dist-tag add @raster-app/datocms-plugin-raster@<version> latest`.
   Projects with the plugin installed are then notified to upgrade, and each admin upgrades in
   **Configuration > Plugins**. **Switch to a different version** pins any version, including a
   canary, to roll back.

## Manual test

In a DatoCMS project with the plugin installed from its built entry:

- [ ] With no settings, **Browse Raster** shows the sign-in; signing in lists your libraries.
- [ ] **Browse Raster**, pick two assets, **Add to field**; both appear as thumbnails and the
      record saves.
- [ ] Drag a thumbnail to reorder, and remove one with **×**; the record saves the new order.
- [ ] A record saved with 0.1.12 still shows its thumbnails, videos included.
- [ ] Search finds an asset by name, in the organization and in one library.
- [ ] Upload a file into a library and pick it.
- [ ] Save an API key in the plugin settings; a browser that never signed in is connected
      without the sign-in. A key for another organization than the pinned one is refused.
- [ ] Remove the saved key; on the next load, a browser that never signed in shows the sign-in,
      and one that signed in before stays signed in.
