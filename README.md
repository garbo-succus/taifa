# Taifa for Probability

[Playable ZIP](dist/taifa.probability.zip) · [Rules](sources/pnp/Rules-Taifa-30.pdf) · [Licence](LICENSE.md)

| Directory | Contents |
| --- | --- |
| `sources/` | Original PDFs, 12 px/mm PNG masters, SVG backs, asset manifest and saved layout |
| `scripts/` | JavaScript build and preview tools |
| `release/` | Current playable output: deduplicated models, textures and manifest |
| `dist/` | One playable ZIP, approximately 4.68 MB |

Requires Node.js 22+ and pnpm 10:

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm preview
```

The build packages the checked-in runtime assets and saved layout; it does not rerun PDF extraction or Real-CUGAN enhancement. It validates piece counts, card sizes, millimetre positions and ZIP integrity. Source masters remain lossless; runtime AVIF/WebP compression preserves pixel dimensions. No ESRGAN was used.

[Open the local template](http://localhost:3002/play/#template=http%3A%2F%2F127.0.0.1%3A45942%2Fcompact%2F) with Probability at localhost:3002 and the preview server at 127.0.0.1:45942.

181 pieces: 90 cards, 78 castles, six bonus markers, one turn marker, one map and five pip dice. Eight cards are dealt per kingdom, leaving 21 per deck. The 500 × 1000 mm layout preserves the shuffled order and rounds positions to 1 mm. The hand rows are Castile/Catalan Counties/Leon, then Valencia/Seville/Badajoz. Eight castles per kingdom start on the map, five beside each hand; bonuses start at zero and the turn at one. Rules and bot decisions are manual.

Original artwork: CC BY-NC-SA (no version stated). Classic die: CC BY 4.0. Attribution remains in LICENSE.md and on the map.
