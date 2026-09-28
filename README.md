# El Capitan viewer

Interactive wreck and aligned drawing viewer built with BelowJS.

## Credits

- Model: **Holger Buss / [Dive3D](https://dive3d.eu/models/philippines/subic-bay-philippines/el-capitan-majaba/)**. Attribution identified in Andrew Hutchison’s accompanying email.
- **GIRT Scientific Divers**
- **Visualisation by Patrick Morrison**

The source email and private project files are not included. Model and drawing assets retain their original ownership; this repository does not grant additional reuse rights over those assets.

## View

https://patrick-morrison.github.io/el-capitan-viewer/

Click drawing names to toggle overlays; double-click to isolate and frame a drawing. Use the Wreck–Plans slider to blend. Drag to orbit, scroll to zoom, F to fly, and MEASURE for measurements. Click the title or press Home to reset. Standard orbit controls are used. Interrupting a drawing transition preserves the current camera position; Home resets to upright.

The drawings retain their supplied alignment. Measurement scale and exact wreck pose have not been independently surveyed. Fuel footprints are schematic and do not establish current contents or condition.

## Development

```sh
npm ci
npm run dev
npm run build
```

GitHub Pages serves the committed `docs/` directory from `main`. After editing, build and copy `dist/` into `docs/`, retaining `.nojekyll`. Relative asset URLs support the repository subpath.

BelowJS 1.9.1 is GPL-3.0-or-later; Three.js is MIT. Source, package lock and third-party notices are included. Interface code is provided under GPL-3.0-or-later; this does not relicense model or drawing assets.

## Casual password screen

Enter `girt` to open the viewer. This is only a client-side privacy screen, not access control. Repository files and direct model URLs remain public. The viewer and model are loaded after entering the password.
