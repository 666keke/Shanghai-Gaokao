# Shanghai Gaokao Admission Workbench

[简体中文](./README.md)

A web-based admission analysis workbench for Shanghai Gaokao candidates and families. It uses 2020-2024 Shanghai general undergraduate batch admission data to help users start from their citywide rank, inspect reachable major-group ranges, compare risk levels, and review multi-year trends.

Live site: [https://666keke.github.io/Shanghai-Gaokao/](https://666keke.github.io/Shanghai-Gaokao/)

> This project organizes historical data for exploration and decision support. It does not replace the current-year admission catalog, university admission brochure, or official information from the Shanghai Municipal Education Examination Authority.

## Purpose

Choosing applications is not only about finding one cutoff score. Candidates need to understand where their rank sits, which options look safer, which choices need a closer check, and how a university or major group has changed over several years. This project brings rank input, range discovery, lookup, trend analysis, and a comparison basket into one workflow.

## Features

- **Rank-first workbench**: Enter a citywide Gaokao rank on the home page and choose a reference year to see the likely range.
- **Rank distribution rail**: Shows the user's position against the selected year's admission cutoff-rank distribution.
- **Risk grouping**: Groups major options into levels such as possibly safe, safe, stable, and reach.
- **Rank lookup**: Use `/lookup/` to filter admission records by rank, year, university, or major group.
- **University library**: Use `/trends/` to inspect universities and major groups across years.
- **Comparison basket**: Add universities or specific major groups while browsing, and tap again to remove them.
- **Major-group triage**: Hide groups you do not want to consider; charts update to reflect the visible set.
- **Mobile-friendly comparison tables**: Compact card layouts reduce the need for heavy horizontal scrolling.
- **Chinese and English UI**: Built-in language switching for both main user flows.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Home workbench for rank input, range preview, common universities, and comparison entry points |
| `/lookup/` | Rank lookup with filters and add/remove actions for comparison |
| `/trends/` | University library, major-group trends, multi-year tables, and comparison views |

## Recommended Workflow

1. Enter your citywide Gaokao rank on the home page.
2. Select a reference year and inspect the overall range and risk groups.
3. Open rank lookup to filter out obviously unsuitable records.
4. Add universities or specific major groups to the comparison basket.
5. Review multi-year trends in the university library.
6. Cross-check the final shortlist against the current-year official catalog, subject requirements, admission plan, and university brochure.

## Data Scope

The app uses local JSON data:

- `public/data.json`: runtime data used by the web app.
- `data.json`: a root-level data copy kept in the repository.

Core fields:

| Field | Meaning |
| --- | --- |
| `年份` | Data year |
| `院校名` | University name |
| `组名` | University major-group name, for example `复旦大学(01)` |
| `组号` | Major-group number |
| `投档线` | Cutoff score or special marker for that year |
| `最低排名` | Lowest rank corresponding to the cutoff |
| `语文数学合计`, `外语`, `选考最高`, etc. | Score details for the final admitted candidate when available; otherwise `null` |

Important caveats:

- Records marked `580及以上` cannot be converted into exact scores and should only be used as boundary references.
- A cutoff rank is not an admission guarantee. Same-score competition, subject requirements, plan changes, physical exam rules, and major notes can all affect the final outcome.
- University names, major-group numbers, and admission scopes may change each year. Always verify with current official documents before submitting applications.
- The home-page distribution visualization is based on historical admission cutoff ranks, not the full examinee population.

## Tech Stack

- Next.js 14 App Router
- React 18
- TypeScript
- Tailwind CSS
- Recharts
- Framer Motion
- Fuse.js
- Lucide React
- Local static JSON data

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build and Static Deployment

The project is configured for static export in `next.config.js`:

```js
output: 'export'
```

Create a production build:

```bash
npm run build
```

The build output is written to `out/`. In production, the app uses `/Shanghai-Gaokao` as both `basePath` and asset prefix, which fits GitHub Pages deployment:

```text
https://<username>.github.io/Shanghai-Gaokao/
```

You can preview the static output with any static server, for example:

```bash
python3 -m http.server 3001 --directory out
```

## Project Structure

```text
.
├── app/
│   ├── HomePageClient.tsx
│   ├── lookup/page.tsx
│   ├── trends/page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── AdmissionChanceCalculator.tsx
│   ├── MajorGroupCompare.tsx
│   ├── MajorGroupsTable.tsx
│   ├── MultiTrendChart.tsx
│   ├── Navigation.tsx
│   ├── UniversityCompare.tsx
│   └── ui/
├── contexts/
│   ├── CompareBasketContext.tsx
│   ├── DisclaimerContext.tsx
│   └── LanguageContext.tsx
├── lib/
│   └── utils.ts
├── public/
│   ├── data.json
│   └── univ_svg/
├── README.md
└── README.en.md
```

## Common Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Generate the static production build |
| `npm run lint` | Run the Next.js ESLint check |

## Disclaimer

This project helps users understand historical admission data and risk ranges. It does not provide admission guarantees or official application advice. Before submitting applications, verify everything against the Shanghai Municipal Education Examination Authority, target university brochures, current-year admission catalogs, and official university notices.
