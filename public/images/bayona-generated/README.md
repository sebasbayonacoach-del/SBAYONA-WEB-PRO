# BAYONA generated image bank

These assets are original images generated specifically for the BAYONA website.

- Visual rule: one trainee alone, or one trainer with one trainee.
- No crowds, group classes, busy gyms, embedded text, logos, or watermarks.
- Palette: charcoal and deep navy with warm amber light.
- Format: panoramic web photography.

## Reusable age-diversity bank

These files are intentionally not tied to one page. Another agent can reuse them in any suitable section:

- `bank-child-precision-jump.png` — child, low precision jump, young male coach.
- `bank-child-supported-vault.png` — child, low supported vault, female coach.
- `bank-teen-landing.png` — teenager, controlled low landing, young male coach.
- `bank-senior-man-balance.png` — older man, balance progression, young male coach.
- `bank-senior-woman-step.png` — older woman, controlled step-up, female coach.
- `bank-grandfather-child-vault.png` — older adult and child sharing a basic movement session.

All six images use safe, low obstacles and are suitable for inclusive parkour, community, academy, onboarding, resources, or program sections.

## Slot copies made 2026-09-22 (coordinator pass)

Seven empty slots were filled by copying a bank image to the exact slot name.
The `bank-*` originals are kept: the bank stays reusable.

| Slot file | Copied from | Why it fits |
| --- | --- | --- |
| `parkour-hero.png` | `bank-teen-landing.png` | controlled landing, coach watching |
| `parkour-levels.png` | `bank-child-supported-vault.png` | assisted low vault = a level |
| `parkour-safety.png` | `bank-senior-woman-step.png` | spotted step-up, safe progression |
| `parkour-closing.png` | `bank-grandfather-child-vault.png` | two generations, same gesture |
| `onboarding-threshold.png` | `bank-child-precision-jump.png` | the first jump |
| `faq-hero.png` | `bank-senior-man-balance.png` | balance, doubt resolved |
| `community-group.png` | `community-entry.png` (was an orphan) | declared compromise: one person, not a group |

Every name above is registered in `GENERATED_BAYONA_SCENES` in
`src/config/siteMedia.js`.

## Repaired and placed from the old batch (see `docs/IMAGENES-REPARADAS.md`)

Six `/resources` slots were closed with the 1792x1024 batch after removing the
uniform translucent band (measured: the step appears in 97-100% of columns, so
it is a layer, not a crop). They are cropped to bank geometry 1672x941:
`resources-fresh-nutrition`, `resources-magazine`, `resources-topic-rest`,
`resources-topic-health`, `resources-topic-business`,
`resources-topic-creativity`. The source JPGs were not modified.

## Nothing is waiting for an original image any more (2026-09-22)

There were five `resources-topic-*` cards on `/resources` — `topic-mindset`,
`topic-data`, `topic-security`, `topic-meditation`, `topic-training`. They are now
closed: each one has a PNG under its own slot name, is registered in
`GENERATED_BAYONA_SCENES`, and shows the BAYONA scene it was already painting
(`scripts/colocar-desde-curated.py` copies the scene into the bank instead of
leaving the slot pointing at `images/scenes/`, so the screen does not change and
the naming rule holds). **0 pending slots in `siteMedia.js`.**

Image generation stays blocked on this account (HTTP 403, code 112, retested
2026-09-22), so any *new* photograph still needs a run from an account with
credits. Closing these five did not need one.

`resources-topic-relationship` was the sixth and is no longer pending either: it
was served by `escena-comunidad-rooftop.jpg`, which shows **eight people** sitting
in a circle and breaks the hard two-person maximum. It now has its own PNG, copied
from `escena-proceso-gandia-real.jpg` (1672x941) and registered in
`GENERATED_BAYONA_SCENES`. Compared by thumbnail against all bank files, its
closest neighbour is `home-pillar-track.png` at a mean difference of 38/255 — a
different photograph, not a rename. `escena-comunidad-rooftop.jpg` is left
untouched and now paints nothing.

## Every file here also ships as `-1600.webp` and `-1672.webp`

The bank PNGs weigh 1.9-2.1 MB each, and `/resources` was pulling **41.2 MB of
images** per visit in a production build. `scripts/derivar-webp-banco.py` generated 222 WebP (q80, method 6) and
`webpAnchosDe()` in `siteMedia.js` resolves the pair from the slot name, so no
component had to change. `/resources` went from 41.2 MB of images to 4.4 MB in a
production build. Two widths, not one: `image-set()` in `media-scenes.css` picks
by **device pixel ratio**, so a single 960-wide file would have softened every
desktop hero. The pair is enforced by test 6 of `imageSourceGovernance.test.js`.

Note for the duplicate probes: once a layer asks for `something-1672.webp`, the
PNG twin is no longer fetched, so `duplicados-cross-mouth.mjs` lists the six
`bank-*.png` as "not painted by any channel". They still are — through their WebP
twin. That script's sha256 grouping is also blind across formats, which is why
`duplicados-perceptuales.py` (phash + dhash) is the authority on repetition.


## These twelve PNGs also paint sections through CSS

`siteMedia.js` is not the only mouth. Eleven decorative layers were still
requesting `bayona-visuals/*.jpg` straight from a stylesheet, which is why the
static audit of the config kept saying "clean" while `/community`, `/faq`,
`/entrar` and `/onboarding` served the rejected batch in production. Fixed on
2026-09-22; `src/test/imageSourceGovernance.test.js` now fails if any of them
comes back.

| CSS rule | Section | Now serves |
| --- | --- | --- |
| `community.css` `.community-week::after` | Tres momentos. Un mismo pulso. | `/images/scenes/escena-coach-anonimo-terraza.jpg` |
| `community.css` `.community-access::after` | Tres niveles. Un mismo espíritu. | `bank-senior-woman-step-1672.webp` |
| `community.css` `.community-entry::after` | Entrar es simple. | `bank-child-precision-jump-1672.webp` |
| `faq.css` `.faq-section::before` | Preguntas de entrenamiento | `bank-child-supported-vault-1672.webp` |
| `faq.css` `.faq-exits::before` | Sigue por tu tramo | `/images/scenes/escena-playa.jpg` |
| `faq.css` `.faq-contact::before` | Elige tu siguiente paso | `bank-grandfather-child-vault-1672.webp` |
| `auth-members.css` `.entrar-page::after` | Acceso a la cuenta | `/images/scenes/escena-proceso-wow-lab.jpg` |
| `auth-members.css` `.entrar-shell::before` | Bienestar y comida real | `/images/scenes/escena-problema-amanecer.jpg` |
| `onboarding.css` stage `preguntas` | Cuestionario de entrada | `/images/scenes/escena-metodo-decision.jpg` |
| `onboarding.css` stage `regalo` | El regalo esencial | `/images/scenes/escena-proceso-freelance-gandia.jpg` |
| `onboarding.css` stage `ruta` | Tu ruta trazada | `/images/scenes/escena-parkour-gandia-cierre.jpg` |

**Four of these repeat a photograph another section already shows**, and that is
deliberate: `bank-senior-woman-step`, `bank-child-precision-jump`,
`bank-child-supported-vault` and `bank-grandfather-child-vault` are byte-identical
copies of `parkour-safety`, `onboarding-threshold`, `parkour-levels` and
`parkour-closing`. Each one is the best parkour frame for the sentence it sits
behind, and the only alternative left in the project was a desk or an empty
beach. `scripts/duplicados-cross-mouth.mjs` reports them; the full reasoning and
the zero-same-page result are in `docs/IMAGENES-SEGUNDA-BOCA.md`.

Careful with `bank-teen-landing.png` and `bank-senior-man-balance.png`: they are
copies of `parkour-hero` and `faq-hero`, so pointing anything at them repeats a
photo that is already on screen. `community-entry.png` is a copy of
`community-group.png`, which `/community` already paints.

## Do not use `public/images/bayona-visuals/`

The three folders there (`coach-trainee-100`, `trainer-client-100-final`,
`extra-batch`, 263 JPGs) are a rejected batch: each frame has a burned-in
double exposure with a translucent circle, several show indoor gyms and three or
four people, and they are 1600x1000 (1.60) instead of 16:9.

The eleven JPGs the root of that folder holds that CSS used to name
(`community-pulse-parkour`, `community-levels-fitness`, `community-group-food`,
`faq-questions-training`, `faq-exits-parkour`, `faq-contact-food`,
`entrar-account-vault`, `entrar-wellness-food`, `onboarding-questions-food`,
`onboarding-gift-training`, `onboarding-route-parkour`) are 1920x1080 and carry
a different defect: a tile lattice with a step every 96 pixels in both
directions, measurable row by row and visible as a grid of thin lines once a
frame is magnified. Their content is also off-brief — a barbell in an indoor
gym, a plant against a wall, a shoe.

Correction to what this file claimed until 2026-09-22: it said "nothing in
`src/` references them". That was only true of `siteMedia.js`. Eleven
`url('/images/bayona-visuals/…')` literals lived in four stylesheets, and an
audit that reads one config file cannot see them.

The fourteen missing slot files DO exist as 1792x1024 JPGs in
`public/images/bayona-visuals/` (root). They are the old banded batch: a
horizontal strip of a second exposure crosses the frame, three of them show more
than two people or readable newspaper headlines, and the bank is 1672x941.
`scripts/auditar-huecos-imagenes.mjs` rejects any 1792x1024 file, so copying
them over is not an option.
