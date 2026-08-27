# Content Packages

AEM FileVault content packages for pages that could not be synced through the
authoring UI (e.g. when the site configuration is missing). Install these
manually via CRX Package Manager.

## loreal_en_beauty_n_science-1.0.0.zip

Beauty Science & Technology section — the parent page plus its children,
imported from loreal.com.

**Pages (7 `.content.xml` nodes):**

| JCR path (under content root) | Source |
|---|---|
| `/en` | https://www.loreal.com/en/ (root node) |
| `/en/beauty-science-and-technology` | .../beauty-science-and-technology/ |
| `/en/beauty-science-and-technology/beauty-research-and-innovation` | .../beauty-research-and-innovation/ |
| `/en/beauty-science-and-technology/beauty-tech` | .../beauty-tech/ |
| `/en/beauty-science-and-technology/l-oreal-open-innovation` | .../l-oreal-open-innovation/ |
| `/en/beauty-science-and-technology/l-oreal-open-innovation/beauty-tech-atelier` | .../beauty-tech-atelier/ |
| `/en/beauty-science-and-technology/l-oreal-open-innovation/creating-breakthrough-products-through-collaborative-play` | .../collaborative-play/ |

**Blocks:** `hero-stage`, `columns-media` (plus default-content text sections).

**Content root:** `/content/eds-loreal` — taken from the `fstab.yaml` mountpoint
(`.../content/eds-loreal`). If your author instance mounts this site at a
different path, edit `META-INF/vault/filter.xml` and the `jcr_root/content/...`
folder name in the `-src` tree, then rezip (see below).

### Install (CRX Package Manager)

1. Open `https://<author-host>/crx/packmgr/index.jsp`
2. **Upload Package** → select `loreal_en_beauty_n_science-1.0.0.zip`
3. **Install**
4. The pages appear under `/content/eds-loreal/en/beauty-science-and-technology`
   in Sites. Open in Universal Editor, then **Publish** to push to Edge Delivery.

### Rebuild the zip from source

The expanded package is checked in at `loreal_en_beauty_n_science-src/`. After
editing any `.content.xml` or the vault metadata:

```bash
cd tools/content-packages/loreal_en_beauty_n_science-src
python3 -c "import zipfile,os; z=zipfile.ZipFile('../loreal_en_beauty_n_science-1.0.0.zip','w',zipfile.ZIP_DEFLATED); [z.write(os.path.join(r,f), os.path.relpath(os.path.join(r,f),'.')) for r,d,fs in os.walk('.') for f in fs]; z.close()"
```

### How it was generated

The imported `content/**/*.plain.html` files were converted with the XWalk
pipeline `html2md` → `@adobe/helix-md2jcr`, using the project's aggregated
`component-definition.json` / `component-models.json` / `component-filters.json`
so each block cell maps to its Universal Editor model. The generator script is
`.migration/jcr-build/convert.mjs`.
