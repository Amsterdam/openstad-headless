# Stem begroot refactor

Goal: same behaviour as the original widget, split into clearly named pieces under `src/stembegroot_2/`, and fix known issues in the old orchestrator.

## Done

- `**stembegroot_2/**` — `StemBegroot2` + UI building blocks (`ThemePickerStep`, `FilterableResourceGrid`, `ResourceDetailModal`, `Step1ChosenResourcesPanel`, `Step2SelectionReview`, stem-code / thank-you steps, budget UI).
- `**types.ts**` — `TagType` + `StemBegroot2WidgetProps` (alias of `StemBegrootWidgetProps` from `stem-begroot.tsx` for admin/tooling compatibility).
- **Fixes vs old `stem-begroot.tsx`**: duplicate `useEffect` for persisting selection removed; duplicate `setVotePendingPerTag` removed; debug `console.log` on step removed; **remove-from-selection** in step 1 only removes (no accidental toggle/add); **“Vorige”** no longer contains dead `currentStep === 3` branch; **detail modal** primary action calls the handler once (removed stray no-op expression); **pending-vote restore** effect deps include `pendingVoteFetched` and `props.api?.url`; unused `navAfterLogin` state removed.
- **Build**: Vite library entry is `stembegroot_2/StemBegroot2.tsx`; IIFE still exposes `StemBegroot` as an alias of `StemBegroot2` for existing embeds.
- **Dev `main.tsx`** mounts `StemBegroot2`.

## Optional follow-ups

- Thin `stem-begroot.tsx` to types + re-exports only and drop the duplicate 1.5k-line implementation.
- Split `StemBegroot2.tsx` orchestration into hooks (`usePendingVote`, `useSelections`, …) if you want the main file under ~300 lines.
