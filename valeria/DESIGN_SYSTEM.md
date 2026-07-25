# Valeria Design System — Screen Author Guide

Every redesigned screen MUST use these primitives. Do not hand-roll gradients,
safe-area padding, buttons, or cards.

## Imports
```ts
import {
  Screen, AppText, Button, Card, Header,
  Field, Chip, SegmentedControl, OptionWheel,
  ProgressBar, EmptyState, LoadingView, Skeleton,
} from '../../src/components';        // adjust ../ depth per file location
import { Colors, Gradients } from '../../src/theme/colors';
import { Spacing, BorderRadius, Shadows, FontWeight } from '../../src/theme/spacing';
```

## Layout
- Wrap EVERY screen in `<Screen>`. It provides gradient background + safe-area
  insets + scroll + optional keyboard handling. Never use hardcoded
  `paddingTop: 60/100`. Props: `scroll` (default true), `keyboard`, `padded`
  (default true, adds horizontal padding), `edges`, `refreshing`+`onRefresh`,
  `stars`.
- For stack (non-tab) screens, put a `<Header title="..." />` as the first child
  inside `<Screen>` (it renders a back chevron; it does NOT add its own top inset).

## Typography — use `<AppText variant=...>`, never raw fontSize/fontWeight
Variants: `hero, title, h1, h2, h3, body, bodyStrong, callout, caption, label, button`.
Props: `color`, `center`, `numberOfLines`, `onPress`.

## Buttons — `<Button title onPress variant size loading icon />`
Variants: `primary` (gold gradient), `secondary` (purple outline), `ghost`, `danger`.
Sizes: `sm|md|lg`. Always has built-in a11y + loading spinner.

## Cards / surfaces — `<Card glow? onPress? padded?>`
Use for every grouped block. `glow` for the hero/featured card.

## Color rules
- Use `Colors.*` tokens ONLY. NO raw hex (`#fff`, `#000`) in screens.
- Surfaces: `surface1/2/3`. Text: `textPrimary/Secondary/Muted/Accent`.
- Helpers: `whiteA05/08/12`, `purpleA15/25`, `goldA12/20`, `borderAccent`.
- Gradients: `Gradients.background/gold/purple/card/aurora`.

## Icons
- `@expo/vector-icons` Ionicons. Give icon-only buttons an `accessibilityLabel`.
- NEVER apply `tintColor` to the multi-color PNG zodiac/element/planet icons in
  `assets`/`burclar`/`elementler`/`gezegenler` — it destroys the artwork. Render
  them at natural color via `expo-image` / `Image`.

## Turkish copy
- Always correct diacritics: Güneş, Ay, Yükselen, Keşfet, Danışmanlar, Geçmiş,
  Astroloji, Fal, Profil, Ayarlar. No ASCII-flattened labels.

## Data & bugs to honor
- Entitlements store `spendCredits(amount, reason?, contentId?)` returns
  `Promise<boolean>`. ALWAYS `await` it: `if (await spendCredits(5, 'unlock', id))`.
  The old `if (spendCredits(5))` is a bug (Promise is always truthy → free unlocks).
- `earnXP`, `watchAd` are async — await them.
- Never ship `console.log`. Remove debug logging.
- Every network-backed section needs loading (Skeleton/LoadingView), empty
  (EmptyState), and error (retry) states. No blank screens on failure.
- Add `KeyboardAvoidingView` via `<Screen keyboard>` on any screen with a TextInput.

## Quality bar
- Min 44pt touch targets, `accessibilityRole`/`Label` on custom touchables.
- Consistent spacing rhythm using `Spacing.*`.
- Run `npx tsc --noEmit` and ensure your edited files introduce no new errors.
