# ETaxwala CRM theme ("MNC" look)

Source: `src/styles/theme-mnc.css` (loaded after `globals.css` in `main.tsx`). It only changes styling.
No component logic, API call or data shape depends on it.

## What we borrowed and from where

| Area              | Reference                                                    | What we took                                                                                                                                            |
| ----------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Type              | Shopify Polaris, Stripe, Linear                              | Inter in the CRM. 13–14px body, 11px uppercase table headers, tabular numbers in tables                                                                 |
| Spacing / density | Polaris (4px scale, 8×12 cell padding), Salesforce Lightning | Kept the existing padding. Dense tables with 1px row lines                                                                                              |
| Colour            | Stripe / Fluent neutrals                                     | Cool slate neutrals (`#f5f7fa` page, white surfaces, `#e3e8ef` lines) replace the cream. Navy `#003A66` and the logo spectrum stay as the brand colours |
| Corners / depth   | Linear, Vercel, Atlassian                                    | Cards 10–12px, controls 8px, hairline shadows. No blurred glows on surfaces                                                                             |
| Tables            | Stripe, Lightning                                            | One light header style everywhere (was a mix of navy, cream and grey)                                                                                   |
| Motion            | Microsoft Fluent 2 tokens                                    | 120 / 160 / 200 ms with decelerate curves. Only `transform` and `opacity` animate. `prefers-reduced-motion` turns motion off                            |

## Buttons: border-gradient (css-buttons.com #54)

- The reference uses a white fill, a 2px gradient border and a pill shape (`background-clip: padding-box, border-box`), with a glow on hover.
- Our gradient follows the logo: cyan `#0084D1`, then violet `#7C3AED`, then crimson `#E11D48`.
- All shared button classes (`btn-multicolor`, `btn-outline-multicolor`, `btn-primary`, `btn-ca-call`, `btn-gold`, `.btn[class*=bg-]` …) and the `Button` component now get this look. Pages did not need rewriting.
- 17 buttons that had a solid one-off colour now use `btn-multicolor`, or `btn-danger` for red ones.
- Variants:
  - `btn-danger` (coral to crimson)
  - `btn-gold`
  - `btn-ghost-etx` (no ring)
  - sizes `btn-sm`, `btn-md`, `btn-lg`, `btn-icon`
- States:
  - **hover:** a glow on `::before` that fades in through opacity only
  - **active:** `scale(.97)`
  - **focus-visible:** a 2px cyan outline
  - **selected** (`ring-2`, `.active` or `aria-pressed`/`aria-selected`/`data-state=active`): a light-blue fill
  - **disabled:** flat grey, as in the reference
  - **loading:** `aria-busy`
- Replaced: the old "galaxy" button, which ran a rotating, blurred conic gradient on every button forever. On Manage Leads that meant about 35 running animations. Now there are 4, and they are the small "live" dots.
- Not changed: icon-only controls, tabs, toggles, pagination and the Desk tracker's own old-style buttons.

## Layout rules

- The CRM header stays on one line at every width (360 to 1920). The Staff Alerts and Staff Chat labels collapse to icons below 1680px, and they keep a `title` and an `aria-label`. The role caption hides below 1536px, and the search pill hides below 1280px.
- Page titles shrink on phones up to 480px wide.
- The sidebar animates only `transform`/`opacity`. Collapsing it on desktop snaps instead of animating its width.
- `backdrop-filter` is removed from scrolling content inside `<main>`. Fixed overlays keep it.

## How to switch things back

- Table header colour: edit the `.crm-shell.crm-shell table thead` rules.
- Cream background: delete the "cream palette" block.
- Old buttons: remove the `theme-mnc.css` import. This alone won't bring the old galaxy rules back; you also need to revert the globals.css part of the commit.
