# kauntah-generate

Bilingual Astro generator for [Kauntah](https://github.com/fjt-dev/Kauntah).
English is served at `/`, Japanese at `/ja/`.

## Local development

Requires Node.js 22.6.0 or later.

```sh
npm install
npm run dev
npm run build
npm run check
npm test
```

## Interface

Select one of the five designs, then optionally adjust offset and minimum
digits. The preview and embed code update immediately. No generation step
is required. Invalid settings hide the code and disable copying until fixed.
HTML is the default output; a plain image URL is also available.
On mobile, the preview stays above the settings while scrolling (except
on short viewports). The UI uses white, black, and a restrained red accent,
square corners, and no shadows. It adds no promotional subtitle.

## Counter service contract

Checked against `fjt-dev/Kauntah` commit
`30b0d9da33a9bcdf94c2be9657617799129e3e5f` using its README, `src/types.ts`,
`src/index.ts`, `src/imageService.ts`, and digit assets.

- Endpoint: `https://counter.fjtd.dev/counter`.
- Themes: `normal-150` (default), `blue2-150`, `blue2-100`, `green-100`, `rule34`.
- `offset`: a display addition from 0 to 1,000,000, not a persistent count change.
- `padding`: optional minimum digits from 1 to 16; longer counts are never truncated.
- `rule34` is independent; the obsolete `animation` parameter is never generated.
- HTML includes `referrerpolicy="origin"`. Hostname identification depends on a
  valid Referer. Subdomains have separate counters. Direct URL navigation does
  not increment the count. Without a valid Referer, the base count is zero;
  the service still applies a supplied display offset.
- Image proxies and Markdown renderers may not forward a suitable Referer.
  Markdown output is intentionally not offered as a reliable installation method.
- The service counts accepted image requests, not unique visitors. Increments
  are limited to 20 per 60 seconds for each host/IP combination.

Previews use local assets and model zero recorded hits plus the chosen offset.
They never call the live counter service. Width/height report the actual SVG
output dimensions; previews scale down to fit smaller screens.

## Validation

`npm test` verifies the required referrer policy, query parameter generation,
HTML escaping, all five themes, numeric limits, and padding behavior.
During this revision, all 50 local digit assets and all theme dimensions were
compared against the upstream repository. Sixty theme/offset/padding combinations
were checked against its parsers and SVG renderer. These local comparisons make
no requests to the live counter endpoint.

## Artwork credits

Original illustration: [Kokage Kusaka](https://x.com/K_KOKAGE).
See [Kauntah credits and usage conditions](https://github.com/fjt-dev/Kauntah#credits).

The rule34 GIFs are copied without modification from
[journey-ad/Moe-Counter](https://github.com/journey-ad/Moe-Counter/tree/8abee4defc7c10b8d82103a36d826a24416e5169/assets/theme/rule34),
commit `8abee4defc7c10b8d82103a36d826a24416e5169`.
The upstream MIT license is included in `public/images/rule34/LICENSE`.

## Accessibility

Format tabs follow the ARIA tabs keyboard pattern (arrows, Home/End, and a
single Tab stop). Forms have associated labels and help; invalid values update
ARIA state, error descriptions, and a polite status region. Selected tab text
and language links have non-color indicators. The page includes a skip link.
Text accents and input borders use contrast-adjusted colors. Mobile source
order matches visual order; keyboard focus is kept below the sticky preview.
GIF animation behavior remains unchanged. These improvements do not constitute
a full WCAG conformance audit or assistive-technology certification.

## Command mode (Beta)

Expand **Command mode (Beta)** under Settings. Commands update the
normal controls, local preview, and embed code together. Nothing is executed
in a system shell and no counter requests are made by these commands.

```text
kauntah --asset rule34 --offset 42 --padding 6 --format html
theme blue2-100
offset 1000
padding auto
format url
help
themes
show
copy
reset
clear
```

Flags accept either `--padding 6` or `--padding=6`. Unspecified settings are
preserved. Invalid commands leave all settings untouched. `show` prints a
reusable command and the current embed output; `copy` copies the selected
format. `reset` restores defaults; `clear` clears displayed output. Use the
Up/Down keys to recall commands. Tab completes command names, options, designs,
formats, and padding values. A unique match is inserted; ambiguous matches
expand to their common prefix and appear as selectable candidates. An unchanged
second Tab moves focus to the next control. Shift+Tab always moves backward.
The Complete button provides the same completion on touch devices. Escape closes
the candidate list. Completion respects the caret position and preserves later
flags, and never proposes already-used options.

The terminal uses a Linux-style `guest@kauntah:~$` prompt with the input on the
same line. Ctrl+A/E move to the start/end, Ctrl+U/K delete before/after the
caret, Ctrl+L clears output without losing input, and Ctrl+C cancels an
unselected line. Selected text retains normal clipboard copying. `history`
prints numbered commands. These are browser UI bindings, not an operating-system
shell.
Command history is in memory only and is cleared on page reload.

## Third-party terminal artwork

The page-wide steam locomotive uses D51 ASCII artwork and the six wheel phases
from [SL by Toyoda Masashi](https://github.com/mtoyoda/sl), commit
`923e7d7ebc5c1f009755bdeb789ac25658ccce03`. The browser animation adapts
the original right-to-left character-step motion and adds bounded DOM cleanup,
one active effect at a time, Escape dismissal, and a brief stationary display
when reduced motion is requested. The overlay does not intercept pointer events
or change counter settings. The full upstream license is retained in
`public/licenses/sl.txt`; the artwork source also retains attribution.
