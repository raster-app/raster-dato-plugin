# Changelog

## 1.0.0

A rewrite on Raster's drop-in picker, [`@raster-app/react`](https://www.npmjs.com/package/@raster-app/react)
`0.2.0` ([SDK docs](https://raster.app/docs/api/sdk)). Editors sign in to Raster from the field
instead of the plugin needing an API key.

### New

- **Sign in from the field** with Raster's device sign-in. The session is remembered per
  browser.
- **The picker**, inside the field and full screen in a modal: an organization switcher, search
  across an organization or one library, an asset's versions, and uploads.
- **An API key for everyone**, saved once in the plugin settings, connects editors without
  signing in. It is checked against the pinned organization before it is saved, and kept in
  memory only in editors' browsers, so a rotated key takes effect on the next load.
- **Reorder and remove** picked assets by dragging and clicking **×** in the field.

### Breaking changes

- **The API key is optional.** Without one, each editor signs in with their own Raster account.
  A key saved in 0.x keeps connecting everyone.
- **The organization is optional.** When set, it now also limits which organization editors can
  sign in to.
- **Videos picked from 1.0 have `width` and `height`.** 0.x stored them as `null`, which some
  sites used to tell a video from an image; use the file extension of `url` instead.
- **The built plugin moved from `build/` to `dist/`**, and is no longer committed. A private
  install that pointed at a URL inside `build/` must point at `dist/index.html`.
- **`@raster-app/raster-toolkit` is no longer used.**

### Upgrading from 0.x

1. In **Configuration > Plugins**, upgrade Raster to 1.0.0.
2. Optionally, open the plugin's settings: clear **Organization** to let editors use any
   organization, or remove the saved key to have editors sign in themselves.
3. If your site tells videos apart by missing dimensions, check the `url` extension instead.

Records need no changes. The field still stores the same JSON array with the same keys.
