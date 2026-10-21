# Alex Fallas portfolio

Local, dependency-free website based on Figma `sARcOwOD6gnK7usal6y2dv`, frames `87:396` (desktop 1440 × 4495) and `87:499` (mobile 402 × 4821).

## Run and edit

```sh
python3 server.py
```

- Website: http://127.0.0.1:8000
- Content editor: http://127.0.0.1:8000/admin
- Use `--port 8001` if needed.

The editor saves all homepage copy, including the expertise section, plus project/about images and contact links to `content/home.json`. The introduction reuses the LinkedIn, Email, and Resume contact links. Uploads go into `assets/uploads/`. The last saved version is backed up in `.local/home.previous.json`. Refresh the public preview after saving. Image uploads are saved immediately; the content file references them only after Save changes. Empty image paths show the original design placeholders.

The editor binds only to loopback and uses a session token for writes. It is a local authoring tool, not a production multi-user CMS.

## Files and extension points

- `styles.css`: shared typography, colors, 12-column desktop grid (8px gutters), responsive page layout, interactions, and editor styling.
- `content/home.json`: source of truth for copy; add future project page content alongside this file.
- `app.js`: rendering and accessible navigation/dialog interactions.
- `assets/`: original downloaded Figma computer, decorative SVGs and menu icon. SVG blur padding, root dimensions, opacity and shape geometry are retained.
- `#game-mount`: replace the placeholder with the game integration later. The native dialog provides focus trapping, Escape and close behavior.
- Project cards retain distinct future URLs under `/projects/<slug>/`; ordinary activation shows a coming-soon notice until those pages are built.
- `alexfallasresume.pdf` at the root is linked from the introduction and contact sections and included in the static export.

## Fonts

IBM Plex Sans and Josefin Sans are bundled locally. The large hero name now uses IBM Plex Sans, matching the current home-page direction in Figma.

## Build and repository

```sh
python3 build.py
```

`dist/` is a static public-site export and excludes the editor, Python server, session API, and backups. Deploy it at the root of a domain. No dependencies or build framework are required. The repository is https://github.com/madmax262/home-page and the local checkout is `~/Documents/home-page`. The build includes `CNAME` for the custom domain `www.sayhitalex.com`. Hosting settings are managed separately in GitHub; moving the project does not publish it.

From the repository folder, review changes with `git status` and `git diff`, then commit and push when ready. Generated `dist/` files and local editor backups are ignored by Git.

## Publishing and access control

Publish **only the files produced by `python3 build.py` in `dist/`**. Do not configure GitHub Pages to publish this repository's source root: that would expose `admin.html` and `admin.js` as ordinary public files. The static export intentionally excludes the local editor, Python write API, and backups. Check the deployed site directly: `/admin` and `/admin.html` should not serve the editor.

The editor at `http://127.0.0.1:8000/admin` is for use on your own computer. `server.py` listens only on `127.0.0.1` and uses a temporary token for writes; it is not a remote login system. To update a GitHub Pages site, edit locally, commit the changed content and assets, rebuild, and deploy the static export. Keep the GitHub account and repository protected with appropriate sign-in and access settings.

`content/home.json`, uploaded project images, and all other files in `dist/` are public once deployed. Keep passwords, API keys, confidential client material, and private files out of both the deployed folder and any public repository. A private repository does not itself make an ordinary GitHub Pages site private. For genuinely restricted visitor pages or an online admin editor, use hosting with server-side authentication and storage, such as a protected Cloudflare Pages application, and enforce access on each request before serving private content.
