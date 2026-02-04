# Files & Contracts Specification

This document outlines the files and contracts management system for venues, operators, and concessionaires.

## Overview

All three entity types (Venues, Operators, Concessionaires) can store:
- **Files**: Decks, one-pagers, proposals, reports, and other documents
- **Contracts**: MSAs, SOWs, NDAs, and other legal agreements

Operators and Concessionaires can mark files/contracts as **inheritable**, meaning their associated venues will automatically see those items.

---

## Data Models

### File

```typescript
interface File {
  id: string
  name: string
  type: 'deck' | 'one-pager' | 'proposal' | 'report' | 'other'
  date: string // ISO date, when the file was created/uploaded
  url?: string // External link (Google Drive, Dropbox, etc.)
  uploadedFile?: string // Path to uploaded file (future)
  description?: string

  // Ownership
  entityType: 'venue' | 'operator' | 'concessionaire'
  entityId: string

  // Inheritance (only for operator/concessionaire files)
  isInheritable?: boolean // If true, venues under this entity will see this file

  createdAt: string
  updatedAt: string
}
```

### Contract

```typescript
interface Contract {
  id: string
  name: string
  type: 'msa' | 'sow' | 'nda' | 'other'
  effectiveDate: string // When the contract starts
  expirationDate?: string // When the contract expires (optional for indefinite)
  status: 'active' | 'expired' | 'pending' | 'terminated'
  url?: string // External link
  uploadedFile?: string // Path to uploaded file (future)
  description?: string

  // Ownership
  entityType: 'venue' | 'operator' | 'concessionaire'
  entityId: string

  // Inheritance (only for operator/concessionaire contracts)
  isInheritable?: boolean // If true, venues under this entity will see this contract

  createdAt: string
  updatedAt: string
}
```

---

## Inheritance Logic

### How It Works

1. **Operators and Concessionaires** can upload files/contracts and mark each one as "inheritable"
2. **Venues** automatically see inherited files/contracts from:
   - Their associated **Operator** (if any)
   - Their associated **Concessionaire** (if any)
3. Inherited items are **read-only** at the venue level (managed at parent level)
4. Venues can **add their own** files/contracts alongside inherited ones

### Display Rules

At the **Venue** level:
```
Files Tab
├── Venue Files (owned by this venue)
│   ├── Q1 Sales Deck.pdf
│   └── Venue One-Pager.pdf
│
├── Inherited from Oak View Group (Operator)
│   ├── [OVG] Corporate Overview.pdf
│   └── [OVG] Partnership Guidelines.pdf
│
└── Inherited from Levy Restaurants (Concessionaire)
    └── [Levy] Menu Standards.pdf
```

### Visual Indicators

- **Inherited files** show a tag/badge with the source entity name
- **Inherited files** may have a subtle visual distinction (e.g., slightly muted, different icon)
- **Inherited files** cannot be edited or deleted from the venue (only from parent)

---

## UI Components

### Files Tab

```
┌─────────────────────────────────────────────────────────────┐
│ Files                                            [+ Add File]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 📁 Venue Files                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📊 Q4 Sales Deck              Deck      Dec 15, 2024   │ │
│ │ 📄 Venue One-Pager            One-Pager Nov 20, 2024   │ │
│ │ 📋 2024 Proposal              Proposal  Oct 5, 2024    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 📥 Inherited from Oak View Group                            │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📊 Corporate Overview         Deck      Jan 10, 2024   │ │
│ │    └─ Inherited • Cannot edit                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Contracts Tab

```
┌─────────────────────────────────────────────────────────────┐
│ Contracts                                    [+ Add Contract]│
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ 📜 Venue Contracts                                          │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Concession Agreement 2024     SOW       ● Active        │ │
│ │ Effective: Jan 1, 2024 → Dec 31, 2024                   │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Equipment Lease              Other      ● Active        │ │
│ │ Effective: Mar 15, 2024 → Mar 14, 2025                  │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ 📥 Inherited from Levy Restaurants                          │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Master Service Agreement      MSA       ● Active        │ │
│ │ Effective: Jan 1, 2023 → Dec 31, 2025                   │ │
│ │    └─ Inherited • Cannot edit                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Add File Modal

```
┌─────────────────────────────────────────────────────────────┐
│ Add File                                              [X]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Name *                                                      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Q4 Sales Deck                                           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Type *                                                      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Deck                                               ▼   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Date                                                        │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Dec 15, 2024                                       📅   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Source *                                                    │
│ ○ URL / Link                                                │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ https://drive.google.com/...                        │   │
│   └─────────────────────────────────────────────────────┘   │
│ ○ Upload File                                               │
│   ┌─────────────────────────────────────────────────────┐   │
│   │ [Choose File] No file chosen                        │   │
│   └─────────────────────────────────────────────────────┘   │
│                                                             │
│ ☐ Make available to all venues (inherit)                   │
│   └─ Only shown for Operator/Concessionaire entities        │
│                                                             │
│                                    [Cancel]  [Save File]    │
└─────────────────────────────────────────────────────────────┘
```

### Add Contract Modal

```
┌─────────────────────────────────────────────────────────────┐
│ Add Contract                                          [X]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Name *                                                      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Master Service Agreement 2024                           │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Type *                                                      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ MSA                                                ▼   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Effective Date *              Expiration Date               │
│ ┌────────────────────────┐    ┌────────────────────────┐   │
│ │ Jan 1, 2024       📅   │    │ Dec 31, 2025      📅   │   │
│ └────────────────────────┘    └────────────────────────┘   │
│                                                             │
│ Status                                                      │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Active                                             ▼   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Source *                                                    │
│ ○ URL / Link                                                │
│ ○ Upload File                                               │
│                                                             │
│ ☐ Make available to all venues (inherit)                   │
│   └─ Only shown for Operator/Concessionaire entities        │
│                                                             │
│                                  [Cancel]  [Save Contract]  │
└─────────────────────────────────────────────────────────────┘
```

---

## Tab Structure

### Venue Detail Page
```
[Overview] [Contacts] [Files] [Contracts] [Timeline]
```

### Operator Detail Page
```
[Overview] [Venues] [Contacts] [Files] [Contracts] [Timeline]
```

### Concessionaire Detail Page
```
[Overview] [Venues] [Contacts] [Files] [Contracts] [Timeline]
```

---

## File Type Icons

| Type | Icon | Color |
|------|------|-------|
| Deck | `Presentation` | chart-2 (blue) |
| One-Pager | `FileText` | primary (teal) |
| Proposal | `FileCheck` | success (green) |
| Report | `FileBarChart` | chart-4 (purple) |
| Other | `File` | muted |

## Contract Type Badges

| Type | Label | Color |
|------|-------|-------|
| MSA | Master Service Agreement | primary |
| SOW | Statement of Work | chart-2 |
| NDA | Non-Disclosure Agreement | chart-4 |
| Other | Other | muted |

## Contract Status Badges

| Status | Color |
|--------|-------|
| Active | success (green) |
| Pending | warning (amber) |
| Expired | muted (gray) |
| Terminated | destructive (red) |

---

## Helper Functions

```typescript
// Get files for a venue (including inherited)
function getFilesForVenue(venueId: string): {
  venueFiles: File[]
  inheritedFromOperator: File[]
  inheritedFromConcessionaire: File[]
}

// Get contracts for a venue (including inherited)
function getContractsForVenue(venueId: string): {
  venueContracts: Contract[]
  inheritedFromOperator: Contract[]
  inheritedFromConcessionaire: Contract[]
}

// Get files for an operator/concessionaire
function getFilesByEntityId(entityType: string, entityId: string): File[]

// Get contracts for an operator/concessionaire
function getContractsByEntityId(entityType: string, entityId: string): Contract[]
```

---

## Implementation Phases

### Phase 1: Data & Basic UI
- [ ] Add File and Contract types to mock-data.ts
- [ ] Add mock files and contracts data
- [ ] Add helper functions for fetching files/contracts
- [ ] Create Files tab for VenueDetail
- [ ] Create Contracts tab for VenueDetail

### Phase 2: Inheritance
- [ ] Add Files/Contracts tabs to OperatorDetail
- [ ] Add Files/Contracts tabs to ConcessionaireDetail
- [ ] Add "isInheritable" toggle in add/edit modals
- [ ] Implement inheritance display in VenueDetail

### Phase 3: Modals & Actions
- [ ] Create AddFileModal component
- [ ] Create AddContractModal component
- [ ] Add edit functionality
- [ ] Add delete functionality (with confirmation)

### Phase 4: Polish
- [ ] File type icons
- [ ] Contract status badges
- [ ] Empty states
- [ ] Search/filter within tabs
