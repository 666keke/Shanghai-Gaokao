# Motion rehearsal — admission workbench

Source: [StageShow](https://benji.org/stageshow), `benjitaylor/skills/stageshow` v1.1.0.

## Scope and reference

This change applies StageShow's causal motion and retained-state choreography to the existing, working product. The closest references are `examples/choreography` (the frame stays steady while dependent content changes) and the share/popover interaction. Existing React controls, real admission data and accessibility semantics are retained. No faux screens, scripted cursor or autonomous playback are added.

The StageShow kit and example source are not vendored into this app. `lib/motion.ts` and `Motion.tsx` implement the applicable patterns using the project's existing Framer Motion dependency.

## Choreography

| Trigger | Response | Settle |
| --- | --- | --- |
| Select a category/tab | Indicator travels; content changes in the existing frame | 140–300 ms |
| Open/close search or details | Space opens/closes with opacity; closed content becomes inert | 220 ms |
| Open comparison menu | Menu enters from its measured anchor | 140 ms |
| Close menu | Keep last anchor until exit finishes, then unmount | 140 ms |
| Open/close selection sheet | Opaque surface travels from/to screen edge; backdrop fades separately | 300 / 180 ms |
| Add/remove a comparison | Stable label slot changes and adjacent chips make room | 140 ms |
| Collapse university / ignore a group | Header stays; data and following rows move together | 220 ms |
| Change admission conditions | Result changes locally; surrounding article stays | 140 ms |
| Navigate | Body fades lightly; fixed navigation keeps its viewport anchor | 180 ms |

Travel: `cubic-bezier(0.45, 0, 0.1, 1)`.
Arrival: `cubic-bezier(0.25, 0.8, 0.25, 1)`.

Native disclosure semantics remain. During close, `open` is retained until the height transition completes; `data-expanded` drives the arrow immediately. Margin spacing belongs to the collapsing body, avoiding an extra jump when the native `open` attribute is removed.

## Verified in the real app

- Homepage: rank input → confirm → results.
- Query: category filtering settles to 30 rendered results; details close/reverse/open; comparison popup Escape dismissal and retained exit.
- Library: searchable multi-select sheet; closing sheet observed mounted with `data-state=closed` and its exit animation before unmount.
- Library: trend/history panel swaps; selecting/removing chips; university collapse; ignoring/restoring a group on desktop.
- Rule guide: changing the example order updates the filing destination; restoring the order restores the result. Both adjustment switches and all four condition combinations were checked, including keyboard input. FAQs and the checklist remain plain reading content.
- Widths: desktop 1280, phones 390 and 320. No horizontal overflow on tested screens.
- Reduced motion: emulated media query true; page CSS animation duration 0.01 ms; disclosures still usable; query results and sheets settle correctly.
- The selected comparisons added for verification were removed again.
- TypeScript and Next.js production build pass.

## Frames and limitations

Browser screenshots are saved to the chat outputs as `motion-lookup-mobile.png`, `motion-history-mobile.png`, `motion-selection-mobile.png`, and `motion-lookup-desktop.png`.

A requestAnimationFrame sample observed eight distinct university heights ending at the 44 px header. Sampling intervals in the background browser were uneven; this supports continuity, not a certified frame-rate claim.

`film.mjs --gate` is not used: these are real, input-driven application screens, not StageShow stages or a scripted looping demo. No synthetic `rehearsal passed` verdict is claimed.

Not checked: physical iOS/Android hardware, Safari, every translated label, and stable foreground frame-rate profiling. Native keyboard semantics, inert state, responsive bounds and reduced-motion behavior were checked with the browser described above.

## Review fixes

- Removed page-body translation so fixed bottom navigation does not gain a transformed containing block.
- Selection sheets stay opaque while moving; the backdrop owns fading.
- Moved disclosure heading spacing inside the collapsing body to avoid a final margin snap.
- Kept trend/history padding on each retained panel rather than changing the host during crossfade.
- Scoped filter marker fill and label typography above the existing count-span styles.

## Navigation and query regression checks

- Query state survives switching to comparisons and back: rank, year, category, search text and the search panel state. Explicit URL parameters still initialize the query, and intentionally clearing the rank stays cleared across navigation.
- Query and comparison empty states share the same component.
- Desktop navigation uses a persistent marker measured in the navigation container. A frame sample from the bottom of the rule guide to lookup and comparisons kept its vertical position at 18 px throughout, inside the 73 px header.
- At the tested desktop width, lookup, comparison and rule guide containers had matching left/right bounds and title alignment. The rule guide places explanation and example side by side on desktop and stacks them on mobile.
- The mobile header contracts with scrolling; desktop footers have been removed across pages.
