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

## Designs

Select `rule34` from the design list to preview its animated GIF artwork and
generate a URL with `asset=rule34`. It is an independent design;
`blue2-100` always uses its original static artwork. The generator no longer
shows an animation control or includes the `animation` parameter in generated URLs.

All designs support `offset` and `padding`. Switching designs preserves these
values and hides the previously generated URL until it is generated again.

Existing `asset=blue2-100&animation=1` URLs should be changed to `asset=rule34`.
The counter service must deploy support for `asset=rule34` before those URLs
render the new design. Local previews work independently of that deployment.

## Artwork credits

The rule34 GIFs are copied without modification from
[journey-ad/Moe-Counter](https://github.com/journey-ad/Moe-Counter/tree/8abee4defc7c10b8d82103a36d826a24416e5169/assets/theme/rule34),
commit `8abee4defc7c10b8d82103a36d826a24416e5169`.
The upstream MIT license is included in `public/images/rule34/LICENSE`.
For original illustration attribution and non-commercial usage conditions, see
[Kauntah credits](https://github.com/fjt-dev/Kauntah#credits).
