# Listo CRM

A CRM application for managing venues, operators, concessionaires, and contacts in the live entertainment industry.

## Important Guidelines

- **Always ask before installing new libraries or making significant dependency changes.** Prefer using existing libraries and tools already in the project whenever possible.

## Tech Stack

- **Framework:** Vite 5 + React 18 + TypeScript
- **Routing:** React Router 6
- **Styling:** Tailwind CSS 3.4 with CSS variables (HSL format)
- **UI Components:** shadcn/ui (Radix primitives + Tailwind)
- **Icons:** Lucide React
- **State:** React hooks (useState, useMemo)
- **Data:** Mock data in `src/lib/mock-data.ts`

## Commands

```bash
pnpm dev      # Start dev server on port 3000
pnpm build    # Build for production
pnpm preview  # Preview production build
```

## Project Structure

```
src/
├── components/
│   ├── ui/           # shadcn/ui components (Button, Card, Badge, etc.)
│   └── crm/          # Domain-specific components
│       ├── sidebar.tsx
│       ├── interaction-timeline.tsx
│       ├── insights-panel.tsx
│       └── modals/   # Modal dialogs
├── pages/            # Route components
│   ├── Dashboard.tsx
│   ├── Venues.tsx
│   ├── VenueDetail.tsx
│   ├── Contacts.tsx
│   ├── ContactDetail.tsx
│   ├── OperatorDetail.tsx
│   ├── ConcessionaireDetail.tsx
│   ├── Pipeline.tsx
│   ├── Tasks.tsx
│   ├── Analytics.tsx
│   └── Settings.tsx
├── lib/
│   ├── utils.ts      # cn() helper for className merging
│   └── mock-data.ts  # All mock data and helper functions
├── hooks/            # Custom hooks
├── providers/        # Theme provider
└── router/           # React Router configuration
```

## Routing

All routes use React Router 6 with `Link` and `useParams`:

```tsx
import { Link, useParams } from "react-router-dom"

// Navigation
<Link to="/venues">Venues</Link>
<Link to={`/venues/${venue.id}`}>View Venue</Link>

// Getting URL params
const { id } = useParams<{ id: string }>()
```

## Design System

### Color Tokens (HSL in CSS variables)

- **Primary:** Teal (`--primary: 175 65% 40%`) - main brand color
- **Success:** Green (`--success: 145 60% 40%`) - positive states, "Primary Contact" badge
- **Warning:** Amber (`--warning: 45 95% 50%`) - concessionaire branding
- **Chart colors:** `--chart-1` through `--chart-5` for data visualization
- **Destructive:** Red for errors and danger states

### Entity Branding

Each entity type has consistent visual branding:

**Venues** - Type-specific icons with unique colors:
```tsx
const venueTypeConfig: Record<VenueType, { icon: typeof Building2; color: string; bgColor: string }> = {
  stadium: { icon: Landmark, color: "text-primary", bgColor: "bg-primary/10" },
  arena: { icon: Building2, color: "text-chart-2", bgColor: "bg-chart-2/10" },
  amphitheater: { icon: TreePine, color: "text-success", bgColor: "bg-success/10" },
  theater: { icon: Drama, color: "text-chart-4", bgColor: "bg-chart-4/10" },
  "convention-center": { icon: Building, color: "text-chart-3", bgColor: "bg-chart-3/10" },
  other: { icon: Star, color: "text-muted-foreground", bgColor: "bg-muted" },
}
```

**Operators** - Briefcase icon with chart-2 (blue) color
**Concessionaires** - ChefHat icon with warning (amber) color
**Contacts** - Avatar with initials, primary/10 background

### Common Patterns

**Page Layout:**
```tsx
<div className="flex min-h-screen bg-background">
  <Sidebar />
  <main className="flex-1 pl-64">
    {/* Header */}
    <div className="border-b border-border bg-card px-8 py-6">
      {/* ... */}
    </div>
    {/* Content */}
    <div className="p-8">
      {/* ... */}
    </div>
  </main>
</div>
```

**Detail Page Header:**
- Back button (ArrowLeft icon)
- Entity icon/avatar (16x16 rounded-xl)
- Title + Badge
- Metadata row (location, counts, etc.)
- Right side: Key metric (deal value, pipeline total)

**Tabs Pattern:**
```tsx
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="contacts">Contacts ({count})</TabsTrigger>
  </TabsList>
  <TabsContent value="overview" className="mt-6">
    {/* Content */}
  </TabsContent>
</Tabs>
```

**Grid Layouts:**
- Overview tabs: `grid gap-6 lg:grid-cols-3` with main content in `lg:col-span-2`
- Contact cards: `grid gap-4 md:grid-cols-2`
- Venue cards in ContactDetail: `grid gap-4 md:grid-cols-2 lg:grid-cols-3`

### Components

**InteractionTimeline** - Shows communication history (calls, emails, meetings)
```tsx
<InteractionTimeline interactions={interactions} showFull />
```

**InsightsPanel** - AI-powered sentiment analysis and engagement scoring
```tsx
<InsightsPanel interactions={interactions} showFull />
```

**Contact Cards** (in VenueDetail) - Rich cards with:
- Avatar and name/role
- Email and phone links
- Last interaction summary
- Action buttons (Email, Call, View)

## Data Types

Key types from `mock-data.ts`:

```tsx
type VenueType = "stadium" | "arena" | "amphitheater" | "theater" | "convention-center" | "other"
type VenueStage = "lead" | "qualified" | "demo" | "proposal" | "negotiation" | "closed-won" | "closed-lost"
type VenueStatus = "client" | "prospect" | "negotiating" | "churned"
```

## Helper Functions

From `mock-data.ts`:
- `getVenueById(id)`, `getContactById(id)`, `getOperatorById(id)`, `getConcessionaireById(id)`
- `getVenuesByOperatorId(id)`, `getVenuesByConcessionaireId(id)`
- `getContactsByVenueId(id)`, `getContactsByOperatorId(id)`, `getContactsByConcessionaireId(id)`
- `getInteractionsByVenueId(id)`, `getInteractionsByOperatorId(id)`
- `getTodosByVenueId(id)`

## Styling Conventions

- Use `cn()` from `@/lib/utils` for conditional classes
- Badge variants: `bg-{color}/20 text-{color}` for soft badges
- Hover states: `hover:bg-secondary/50 transition-colors`
- Links: `hover:text-primary transition-colors`
- Borders: `border border-border rounded-lg`
- Card backgrounds: `bg-card` or `bg-secondary/20` for subtle sections

## Currency Formatting

```tsx
function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 0,
  }).format(amount)
}
```

## Known Issues & Fixes

### shadcn/ui components require React.forwardRef (React 18)

The shadcn/ui components were generated for **React 19**, which passes refs to function components automatically. This project uses **React 18**, which requires `React.forwardRef()`.

**Symptom:** Radix `asChild` components (dropdowns, popovers, tooltips) don't open — content renders in the DOM but stays positioned off-screen at `translate(0, -200%)`. Console shows: `"Function components cannot be given refs"`.

**Root cause:** Without a ref, `@floating-ui` (used by Radix) can't measure the trigger element's position to place the popover/dropdown content.

**Fix:** Any component passed as a child via `asChild` must use `React.forwardRef` and forward the `ref` to its root DOM element. The `Button` component has already been fixed. If new shadcn/ui components are added, ensure they use `forwardRef` if they'll be used with `asChild`.

### Tailwind CSS v4 syntax on v3 runtime

The shadcn/ui components use Tailwind v4-only syntax that is silently ignored by v3. These are cosmetic issues (not functional blockers):

| v4 syntax | v3 equivalent |
|-----------|--------------|
| `outline-hidden` | `outline-none` |
| `origin-(--css-var)` | `origin-[var(--css-var)]` |
| `max-h-(--css-var)` | `max-h-[var(--css-var)]` |
| `shadow-xs` | `shadow-sm` |
| `size-8!` (suffix `!`) | `!size-8` (prefix `!`) |

These have not been converted yet. If visual polish issues arise (missing outlines, wrong shadows, broken animations), check for v4 syntax in `src/components/ui/`.

## Notes

- Contacts page uses table view only (not cards)
- Contact cards are only used within venue detail pages
- All detail pages have tabs: Overview, entity-specific tabs, Timeline
- InteractionTimeline and InsightsPanel are shown in Overview (preview) and Timeline (full) tabs
