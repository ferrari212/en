# Authentic engineering figures

These scripts are optional provenance tools, not website build dependencies.

## FEAScript cantilever figure

The plot uses the actual FEAScript solver, not invented data. To reproduce:

1. Obtain the public `FEAScript/FEAScript-core` source at
   `c0dabd998cb47fd77969ee778bdebaf81c7c5563` and its committed `dist/feascript.cjs`.
2. From this portfolio root, run:
   `node scripts/figures/feascript-beam.cjs /path/to/FEAScript-core/dist/feascript.cjs`.
3. With matplotlib and Pillow installed in a separate plotting environment, run
   `python scripts/figures/plot_beam.py`.

The Node script checks the tip against `P L³ / (3 EI)` before saving nodal output.
`content/figures/feascript-cantilever.json` records the parameters and source revision.
The SVG is downloadable; the compressed WebP is used in page previews.
This is a reference example, not a new published research finding.

## Interface captures

- `vessel3d-editor.webp`: actual default live editor from `shiplab/vessel3D`
  at `43adb48e01161af0042ec93c5523f5403804c379` (1280×760 viewport).
- `catenary-interface.webp`: actual `ferrari212/mooring` interface at
  `79954903dfa04456a87e9770a38f00287d7b3beb`.
- Other WebP previews come from the original portfolio's images; the floating-body
  poster is the first frame of the original GIF. The live demonstration link
  retains access to the animation, without forcing animated images on readers.

Captures were taken using a local copy of the public source, with TLS-verified,
same-version CDN dependencies supplied through an accessible mirror where required.
No screenshot depicts a fabricated interface or simulated research result.
