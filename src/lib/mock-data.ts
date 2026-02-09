// ==============================================
// Type Definitions for Listo CRM
// ==============================================
// This file contains only type definitions.
// All data is now stored in the database and
// accessed via API hooks in src/queries/

export type VenueStatus = "client" | "prospect" | "churned" | "negotiating"
export type VenueStage = "lead" | "qualified" | "demo" | "proposal" | "negotiation" | "closed-won" | "closed-lost"
export type InteractionType = "call" | "video" | "email" | "meeting" | "note"
export type VenueType = "stadium" | "arena" | "amphitheater" | "theater" | "convention-center" | "other"
export type FileType = "deck" | "one-pager" | "proposal" | "report" | "other"
export type ContractType = "msa" | "sow" | "nda" | "other"
export type ContractStatus = "active" | "expired" | "pending" | "terminated"
export type UseCase = "suites" | "back-of-house" | "warehouse" | "labor-tracking"

// Opportunity details - AI auto-completed, user-editable
export interface OpportunityDetails {
  useCases: UseCase[]
  licenses: {
    watches: number
    mobile: number
    tablets: number
  }
  onsiteInterest: boolean
  expectedReleaseDate?: string
  intel: {
    source?: string // How they heard about us
    interests?: string[] // What they're interested in
    painPoints?: string[] // Problems they're facing
  }
}

export interface User {
  id: string
  name: string
  email: string
  avatar: string
  avatarUrl?: string
}

// Files - decks, one-pagers, proposals, reports
export interface VenueFile {
  id: string
  name: string
  type: FileType
  date: string // When the file was created/uploaded
  url?: string // External link (Google Drive, Dropbox, etc.)
  description?: string
  entityType: "venue" | "operator" | "concessionaire"
  entityId: string
  isInheritable?: boolean // If true, venues under this entity will see this file
  createdAt: string
}

// Contracts - MSAs, SOWs, NDAs
export interface Contract {
  id: string
  name: string
  type: ContractType
  effectiveDate: string
  expirationDate?: string
  status: ContractStatus
  url?: string
  description?: string
  entityType: "venue" | "operator" | "concessionaire"
  entityId: string
  isInheritable?: boolean
  createdAt: string
}

// Operators run/own venues (e.g., Live Nation, MSG, AEG, Oak View Group)
export interface Operator {
  id: string
  name: string
  logo?: string
  website?: string
  description?: string
  headquarters?: string
  venueCount?: number
}

// Concessionaires handle food & beverage (e.g., Levy, Aramark, Sodexo, Delaware North, Legends)
export interface Concessionaire {
  id: string
  name: string
  logo?: string
  website?: string
  description?: string
  headquarters?: string
  venueCount?: number
}

export interface Contact {
  id: string
  name: string
  email: string
  phone: string
  role: string
  isPrimary: boolean
  avatar?: string
  linkedIn?: string
  venueIds: string[]
  operatorId?: string
  concessionaireId?: string
}

export interface EmailMessage {
  id: string
  from: { name: string; email: string }
  to: { name: string; email: string }[]
  cc?: { name: string; email: string }[]
  subject: string
  body: string
  date: string
  isInbound: boolean
}

export interface Interaction {
  id: string
  type: InteractionType
  date: string
  duration?: number
  summary: string
  transcript?: string
  recordingUrl?: string
  highlights: string[]
  wants: string[]
  concerns: string[]
  contactId: string
  venueId: string
  userId: string
  emailThread?: EmailMessage[]
}

export type TaskType = "email" | "call" | "meeting" | "document" | "follow-up" | "other"

export interface TodoSource {
  type: "email" | "call" | "meeting" | "ai" | "manual"
  label: string
  interactionId?: string
}

export interface Todo {
  id: string
  title: string
  description?: string
  dueDate: string
  dueTime?: string
  completed: boolean
  priority: "low" | "medium" | "high"
  type: TaskType
  assignedTo: string
  sharedWith?: string[]
  createdBy: string
  venueId?: string
  contactId?: string
  source?: TodoSource
}

// Venues are the main entity - each has an operator and concessionaire(s)
export interface Venue {
  id: string
  name: string
  address: string
  city: string
  state: string
  type: VenueType
  capacity?: number
  stage: VenueStage
  status: VenueStatus
  dealValue?: number
  probability?: number
  nextFollowUp?: string
  notes?: string
  operatorId: string
  concessionaireIds: string[]
  createdAt: string
  lastActivity: string
  // Opportunity fields
  imageUrl?: string
  teamLogoUrl?: string
  teamName?: string
  assignedUserIds: string[]
  opportunity?: OpportunityDetails
  // Expanded relations (populated by API)
  operator?: any
  concessionaires?: any[]
  assignedUsers?: any[]
}

export interface Company {
  id: string
  name: string
  logo: string
  website: string
  industry: string
  status: VenueStatus
  relationshipType: string
  annualRevenue: number
  totalDealValue: number
  createdAt: string
  lastActivity: string
}

// ==============================================
// Dashboard Types
// ==============================================

// Scheduled events - calls, meetings on calendar
export interface ScheduledEvent {
  id: string
  type: "call" | "video" | "meeting"
  title: string
  startTime: string // ISO datetime
  endTime?: string
  venueId: string
  contactId: string
  userId: string
  meetingLink?: string // For video calls
  location?: string // For in-person meetings
  notes?: string
}

// AI-recommended actions
export type RecommendedActionType = "follow-up-email" | "schedule-call" | "send-proposal" | "check-in"

export interface RecommendedAction {
  id: string
  type: RecommendedActionType
  priority: "high" | "medium" | "low"
  title: string
  reason: string // Why AI suggests this
  suggestedContent?: string // Pre-written email/message
  venueId: string
  contactId: string
  userId: string
  dueBy?: string
}

// Business insights/news
export type InsightType = "contract-news" | "engagement-metric" | "pipeline-alert" | "milestone" | "inbound-activity"
export type InsightPriority = "info" | "positive" | "warning" | "urgent"

export interface BusinessInsight {
  id: string
  type: InsightType
  title: string
  description: string
  timestamp: string
  venueId?: string
  operatorId?: string
  metric?: { value: number; change: number; unit: string }
  priority: InsightPriority
}
