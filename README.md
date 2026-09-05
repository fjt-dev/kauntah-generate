# kauntah-generate

Astro implementation of the bilingual Kauntah counter generator.

## Commands

```sh
npm install
npm run dev
npm run build
```

The English page is served at `/` and the Japanese page at `/ja/`.
Static counter artwork is embedded in the generated pages. Animated GIFs are served locally from `public/images/rule34/`. Previews do not request the live counter endpoint or increase its count.

## Animation

For `blue2-100`, select **On (rule34)** / **あり（rule34）** to preview the animation
and generate a URL with `asset=blue2-100&animation=1`.
Static mode omits `animation`, matching the counter API default. The control is
disabled for other themes. Switching away from `blue2-100` resets it to static
mode, and changing any setting hides the previously generated URL.
Animation works with both `offset` and `padding`.

The counter service must deploy support for `animation=1` before generated
animation URLs will animate. The local preview works independently of that deployment.

## Artwork credits

The rule34 GIFs are copied without modification from
[journey-ad/Moe-Counter](https://github.com/journey-ad/Moe-Counter/tree/8abee4defc7c10b8d82103a36d826a24416e5169/assets/theme/rule34),
commit `8abee4defc7c10b8d82103a36d826a24416e5169`.
The upstream MIT license is included in `public/images/rule34/LICENSE`.
For original illustration attribution and non-commercial usage conditions, see
[Kauntah credits](https://github.com/fjt-dev/Kauntah#credits).
