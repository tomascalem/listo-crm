import React, { useState, useMemo, useRef, useEffect, useCallback, memo } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core"
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Sidebar } from "@/components/crm/sidebar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Bell,
  MapPin,
  Search,
  LayoutGrid,
  List,
  BarChart3,
  Plus,
  MoreHorizontal,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  Building2,
  Landmark,
  TreePine,
  Drama,
  Building,
  Star,
  ExternalLink,
  Inbox,
} from "lucide-react"
import {
  type Venue,
  type VenueStage,
  type VenueType,
} from "@/lib/mock-data"
import { useVenues, useUpdateVenueStage } from "@/queries/venues"
import { useOperators } from "@/queries/operators"
import { useUsers } from "@/queries/todos"
import { AddVenueModal } from "@/components/crm/modals/add-venue-modal"
import { LogActivityModal } from "@/components/crm/modals/log-activity-modal"
import { AddTaskModal } from "@/components/crm/modals/add-task-modal"
import { OpportunityModal } from "@/components/crm/modals/opportunity-modal"

// Stage configuration
const stages: { key: VenueStage; label: string; color: string; textColor: string; headerBg: string; headerBorder: string; probability: number }[] = [
  { key: "lead", label: "Lead", color: "bg-slate-500", textColor: "text-slate-600", headerBg: "bg-slate-500/10", headerBorder: "border-slate-500/20", probability: 10 },
  { key: "qualified", label: "Qualified", color: "bg-primary", textColor: "text-primary", headerBg: "bg-primary/10", headerBorder: "border-primary/20", probability: 25 },
  { key: "demo", label: "Demo", color: "bg-chart-2", textColor: "text-chart-2", headerBg: "bg-chart-2/10", headerBorder: "border-chart-2/20", probability: 40 },
  { key: "proposal", label: "Proposal", color: "bg-chart-3", textColor: "text-chart-3", headerBg: "bg-chart-3/10", headerBorder: "border-chart-3/20", probability: 60 },
  { key: "negotiation", label: "Negotiation", color: "bg-chart-4", textColor: "text-chart-4", headerBg: "bg-chart-4/10", headerBorder: "border-chart-4/20", probability: 80 },
  { key: "closed-won", label: "Closed Won", color: "bg-success", textColor: "text-success", headerBg: "bg-success/10", headerBorder: "border-success/20", probability: 100 },
]

// Venue type configuration with icons and colors
const venueTypeConfig: Record<VenueType, { icon: typeof Building2; color: string; bgColor: string }> = {
  stadium: { icon: Landmark, color: "text-primary", bgColor: "bg-primary/10" },
  arena: { icon: Building2, color: "text-chart-2", bgColor: "bg-chart-2/10" },
  amphitheater: { icon: TreePine, color: "text-success", bgColor: "bg-success/10" },
  theater: { icon: Drama, color: "text-chart-4", bgColor: "bg-chart-4/10" },
  "convention-center": { icon: Building, color: "text-chart-3", bgColor: "bg-chart-3/10" },
  other: { icon: Star, color: "text-muted-foreground", bgColor: "bg-muted" },
}

// View modes
type ViewMode = "kanban" | "list" | "funnel"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDaysInStage(lastActivity: string): string {
  const stageDate = new Date(lastActivity)
  const now = new Date()
  const diffMs = now.getTime() - stageDate.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "1 day"
  if (diffDays < 7) return `${diffDays} days`
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return weeks === 1 ? "1 week" : `${weeks} weeks`
  }
  const months = Math.floor(diffDays / 30)
  return months === 1 ? "1 month" : `${months} months`
}

function needsAttention(venue: Venue): { needs: boolean; reason: string | null } {
  const now = new Date()
  const lastActivity = new Date(venue.lastActivity)
  const diffDays = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))

  // More selective criteria:
  // 1. In negotiation stage with no activity in 10+ days (critical stage)
  // 2. High-value deal (>$300K) with no activity in 14+ days
  // 3. Any deal with no activity in 30+ days
  if (venue.stage === "negotiation" && diffDays >= 10) {
    return { needs: true, reason: `No activity for ${diffDays} days in negotiation stage` }
  }
  if ((venue.dealValue || 0) > 300000 && diffDays >= 14) {
    return { needs: true, reason: `High-value deal inactive for ${diffDays} days` }
  }
  if (diffDays >= 30) {
    return { needs: true, reason: `No activity for ${diffDays} days` }
  }

  return { needs: false, reason: null }
}

// Draggable deal card component
interface DealCardProps {
  venue: Venue
  isOverlay?: boolean
  isPendingConfirmation?: boolean
  isReturning?: boolean
  isCollapsing?: boolean // For smooth collapse when card leaves this column
  justDropped?: boolean // Skip sortable transform for just-dropped cards
  disableTransform?: boolean // Disable dnd-kit transforms to keep cards static
}

const DealCard = memo(function DealCard({ venue, isOverlay, isPendingConfirmation, isReturning, isCollapsing, justDropped, disableTransform }: DealCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const operator = venue.operator
  const typeConfig = venueTypeConfig[venue.type] || venueTypeConfig.other
  const TypeIcon = typeConfig.icon
  const attentionInfo = needsAttention(venue)
  // Get assigned users from venue data (already populated by API)
  const assignedUsers = venue.assignedUsers || []

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: venue.id })

  // Handle collapsing animation: false = setup (full height), true = collapse to 0
  const isCollapsingActive = isCollapsing !== undefined
  const shouldCollapse = isCollapsing === true

  // Disable transforms to keep cards static during drag (faded card stays in place)
  // justDropped also disables transform to prevent animation glitches after drop
  const effectiveTransform = (justDropped || disableTransform) ? null : transform

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(effectiveTransform),
    // Use specific properties instead of 'all' for better performance
    // When just dropped, use no transition to prevent animation glitches
    // After within-column drop, use smooth transition for cards settling into new positions
    transition: justDropped
      ? 'none'
      : isCollapsingActive
        ? 'transform 300ms ease-out, opacity 300ms ease-out, max-height 300ms ease-out, margin 300ms ease-out, padding 300ms ease-out'
        : transition || 'transform 200ms ease-out',
    // Dragged card is faded (0.3 opacity) to show original position
    opacity: isReturning || shouldCollapse ? 0 : isDragging ? 0.3 : 1,
    overflow: isCollapsingActive ? 'hidden' : undefined,
    // When collapsing is active, control the height
    maxHeight: shouldCollapse ? 0 : isCollapsingActive ? 200 : undefined,
    marginTop: shouldCollapse ? 0 : undefined,
    marginBottom: shouldCollapse ? 0 : undefined,
    paddingTop: shouldCollapse ? 0 : undefined,
    paddingBottom: shouldCollapse ? 0 : undefined,
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open modal if clicking on interactive elements
    if ((e.target as HTMLElement).closest('a, button, [role="menuitem"]')) {
      return
    }
    setIsModalOpen(true)
  }

  const cardContent = (
    <Card
      className={`bg-card border transition-all cursor-grab active:cursor-grabbing ${
        isPendingConfirmation
          ? "border-border shadow-xl ring-2 ring-primary/50"
          : isOverlay
            ? "border-border shadow-xl ring-2 ring-primary/50 rotate-2"
            : attentionInfo.needs
              ? "border-border ring-1 ring-warning/50 shadow-sm hover:border-primary/40 hover:shadow-md"
              : "border-border shadow-sm hover:border-primary/40 hover:shadow-md"
      }`}
      onClick={handleCardClick}
    >
      <CardContent className="px-3 py-1.5">
        {/* Header with venue type icon and name */}
        <div className="flex items-start justify-between gap-1.5">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className={`p-1.5 rounded-md ${typeConfig.bgColor} shrink-0`}>
              <TypeIcon className={`h-3.5 w-3.5 ${typeConfig.color}`} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-sm truncate">
                  {venue.name}
                </span>
                {attentionInfo.needs && (
                  <Badge variant="outline" className="h-4 px-1 text-[10px] font-medium bg-warning/10 text-warning border-warning/30 shrink-0">
                    <AlertCircle className="h-2.5 w-2.5 mr-0.5" />
                    Action
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{venue.city}, {venue.state}</span>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 hover:opacity-100 focus:opacity-100 data-[state=open]:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem asChild>
                <Link to={`/venues/${venue.id}`} className="flex items-center">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <LogActivityModal
                venueId={venue.id}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Phone className="h-4 w-4 mr-2" />
                    Log Call
                  </DropdownMenuItem>
                }
              />
              <LogActivityModal
                venueId={venue.id}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Mail className="h-4 w-4 mr-2" />
                    Log Email
                  </DropdownMenuItem>
                }
              />
              <AddTaskModal
                venueId={venue.id}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Add Task
                  </DropdownMenuItem>
                }
              />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-border/40">
          <div className="flex items-center gap-1.5 min-w-0">
            {assignedUsers.length > 0 && (
              <div className="flex -space-x-1.5" title={assignedUsers.map(u => u!.name).join(", ")}>
                {assignedUsers.slice(0, 2).map((user) => (
                  <Avatar key={user!.id} className="h-5 w-5 border border-background">
                    {user!.avatarUrl ? (
                      <AvatarImage src={user!.avatarUrl} alt={user!.name} />
                    ) : null}
                    <AvatarFallback className="bg-primary/10 text-primary text-[8px] font-medium">
                      {user!.avatar}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {assignedUsers.length > 2 && (
                  <span className="h-5 w-5 rounded-full bg-muted border border-background text-[8px] font-medium flex items-center justify-center">
                    +{assignedUsers.length - 2}
                  </span>
                )}
              </div>
            )}
            <span className="text-[11px] text-muted-foreground truncate">
              {operator?.name.split(" ").slice(0, 2).join(" ")}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] text-muted-foreground">
              {formatDaysInStage(venue.lastActivity)}
            </span>
            <span className="text-sm font-semibold">
              {venue.dealValue ? formatCurrency(venue.dealValue) : "-"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (isOverlay) {
    return cardContent
  }

  return (
    <>
      <OpportunityModal
        venue={venue}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="group"
        data-venue-id={venue.id}
      >
        {cardContent}
      </div>
    </>
  )
})

// Droppable stage column component
interface StageColumnProps {
  stage: (typeof stages)[0]
  venues: Venue[]
  weightedValue: number
  isActiveDropTarget?: boolean
  pendingVenueId?: string
  isOriginColumn?: boolean
  returningVenueId?: string
  justDroppedVenueId?: string
  draggingVenueId?: string // ID of venue being dragged within this column
  dropPlaceholderIndex?: number // Index where to show drop placeholder
  dropPlaceholderExpanded?: boolean // Whether the placeholder is expanded (for animation)
  columnRef?: (el: HTMLDivElement | null) => void
  expandingPlaceholder?: {
    venueId: string
    height: number
    expanded: boolean
    targetIndex: number
  } | null
  collapsingPlaceholder?: {
    venueId: string
    height: number
    collapsed: boolean
  } | null
}

const StageColumn = memo(function StageColumn({ stage, venues, weightedValue, isActiveDropTarget, pendingVenueId, isOriginColumn, returningVenueId, justDroppedVenueId, draggingVenueId, dropPlaceholderIndex, dropPlaceholderExpanded, columnRef, expandingPlaceholder, collapsingPlaceholder }: StageColumnProps) {
  const totalValue = useMemo(() => venues.reduce((sum, v) => sum + (v.dealValue || 0), 0), [venues])
  const venueIds = useMemo(() => venues.map((v) => v.id), [venues])

  const { setNodeRef, isOver } = useDroppable({
    id: stage.key,
  })

  // Highlight column when over it (but not if it's the origin column)
  const showDropHighlight = (isOver && !isOriginColumn) || isActiveDropTarget

  // Determine add button text
  const addButtonText = stage.key === "lead" ? "Add Lead" : "Add Deal"
  const showAddButton = stage.key === "lead" || stage.key === "qualified"

  return (
    <div ref={columnRef} className="flex flex-col min-w-[300px] w-[300px] shrink-0 h-full">
      {/* Stage header - fixed */}
      <div className={`shrink-0 mb-3 p-3 rounded-lg ${stage.headerBg} border ${stage.headerBorder}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${stage.color}`} />
            <h3 className="font-semibold text-sm text-foreground">{stage.label}</h3>
          </div>
          <Badge variant="secondary" className="h-5 px-1.5 text-xs font-medium bg-background">
            {venues.length}
          </Badge>
        </div>
        <div className="flex items-center gap-3 text-xs mt-2 pl-5">
          <span className="text-muted-foreground">{formatCurrency(totalValue)}</span>
          <span className={`font-medium ${stage.textColor}`}>{formatCurrency(weightedValue)} wtd</span>
        </div>
      </div>

      {/* Droppable cards container - scrolls vertically */}
      <div
        ref={setNodeRef}
        data-stage={stage.key}
        className={`flex-1 min-h-0 rounded-lg p-2 transition-colors border flex flex-col ${
          showDropHighlight ? "bg-primary/10 ring-2 ring-primary/30 ring-dashed border-primary/30" : "bg-muted/30 border-border/50"
        }`}
      >
        {/* Add deal button at top - fixed */}
        {showAddButton && (
          <div className="shrink-0 pb-2">
            <AddVenueModal
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-9 text-xs text-muted-foreground hover:text-foreground border border-dashed border-border hover:border-primary/50 hover:bg-primary/5"
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  {addButtonText}
                </Button>
              }
            />
          </div>
        )}

        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide p-0.5 -m-0.5">
          <SortableContext items={venueIds} strategy={verticalListSortingStrategy}>
            {(() => {
              // Find the index of the venue being dragged within this column
              const draggingIndex = draggingVenueId ? venues.findIndex(v => v.id === draggingVenueId) : -1
              // Suppress placeholder at dragged card's position (before it or immediately after it)
              const isPlaceholderAtDraggedPosition = draggingIndex >= 0 && dropPlaceholderIndex !== undefined && (
                dropPlaceholderIndex === draggingIndex ||
                dropPlaceholderIndex === draggingIndex + 1
              )

              return (
                <div className="flex flex-col">
                  {venues.length === 0 && !expandingPlaceholder && dropPlaceholderIndex === undefined ? (
                    // Empty state (only show if no drop placeholder)
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <Inbox className="h-8 w-8 text-muted-foreground/40 mb-2" />
                      <p className="text-sm text-muted-foreground">No deals</p>
                      <p className="text-xs text-muted-foreground/70">Drag a deal here</p>
                    </div>
                  ) : (
                    // Always use consistent tree structure to prevent remounting
                    venues.map((venue, index) => {
                      // Show placeholder BEFORE this card if dropPlaceholderIndex matches
                      // But suppress if it would be at the dragged card's position
                      const showPlaceholderBefore = dropPlaceholderIndex === index && !isPlaceholderAtDraggedPosition

                      return (
                        <React.Fragment key={venue.id}>
                          {/* Expanding placeholder for cancel animation */}
                          {expandingPlaceholder?.targetIndex === index && (
                            <div
                              className="overflow-hidden transition-[max-height,margin] duration-300 ease-out"
                              style={{
                                maxHeight: expandingPlaceholder.expanded ? expandingPlaceholder.height : 0,
                                marginBottom: expandingPlaceholder.expanded ? 8 : 0,
                              }}
                            />
                          )}
                          {/* Drop placeholder - animates open */}
                          {showPlaceholderBefore && (
                            <div
                              className="rounded-lg border-2 border-dashed border-primary/50 bg-primary/5 overflow-hidden transition-all duration-150 ease-out"
                              style={{
                                height: dropPlaceholderExpanded ? 80 : 0,
                                marginBottom: dropPlaceholderExpanded ? 8 : 0,
                                opacity: dropPlaceholderExpanded ? 1 : 0,
                              }}
                            />
                          )}
                          <div
                            className="transition-transform duration-200 ease-out"
                            style={{
                              marginBottom: 8,
                            }}
                          >
                            <DealCard
                              venue={venue}
                              isPendingConfirmation={venue.id === pendingVenueId}
                              isReturning={venue.id === returningVenueId}
                              isCollapsing={collapsingPlaceholder?.venueId === venue.id ? collapsingPlaceholder.collapsed : undefined}
                              justDropped={venue.id === justDroppedVenueId}
                              disableTransform={!!draggingVenueId}
                            />
                          </div>
                        </React.Fragment>
                      )
                    })
                  )}
                  {/* Drop placeholder at end of list (suppress if at dragged position) */}
                  {dropPlaceholderIndex !== undefined && dropPlaceholderIndex >= venues.length && !isPlaceholderAtDraggedPosition && (
                    <div
                      className="rounded-lg border-2 border-dashed border-primary/50 bg-primary/5 overflow-hidden transition-all duration-150 ease-out"
                      style={{
                        height: dropPlaceholderExpanded ? 80 : 0,
                        marginTop: dropPlaceholderExpanded ? 8 : 0,
                        opacity: dropPlaceholderExpanded ? 1 : 0,
                      }}
                    />
                  )}
              {/* Placeholder at end if target index is past all cards (for cancel animation) */}
                  {expandingPlaceholder && expandingPlaceholder.targetIndex >= venues.length && (
                    <div
                      className="overflow-hidden transition-[max-height] duration-300 ease-out"
                      style={{
                        maxHeight: expandingPlaceholder.expanded ? expandingPlaceholder.height : 0,
                      }}
                    />
                  )}
                </div>
              )
            })()}
          </SortableContext>
        </div>
      </div>
    </div>
  )
})

// List view component
function ListView({ venues }: { venues: Venue[] }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden bg-card">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr className="text-left text-xs text-muted-foreground">
            <th className="px-4 py-3 font-medium">Venue</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 font-medium">Location</th>
            <th className="px-4 py-3 font-medium">Operator</th>
            <th className="px-4 py-3 font-medium">Stage</th>
            <th className="px-4 py-3 font-medium text-right">Deal Value</th>
            <th className="px-4 py-3 font-medium">Time in Stage</th>
            <th className="px-4 py-3 font-medium w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {venues.map((venue) => {
            const operator = venue.operator
            const typeConfig = venueTypeConfig[venue.type] || venueTypeConfig.other
            const TypeIcon = typeConfig.icon
            const stageConfig = stages.find((s) => s.key === venue.stage)
            const attentionInfo = needsAttention(venue)

            return (
              <tr key={venue.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {attentionInfo.needs && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="shrink-0 cursor-help">
                            <AlertCircle className="h-4 w-4 text-warning" />
                          </span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[200px]">
                          <p className="text-xs">{attentionInfo.reason}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                    <Link
                      to={`/venues/${venue.id}`}
                      className="font-medium text-sm hover:text-primary transition-colors"
                    >
                      {venue.name}
                    </Link>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className={`p-1 rounded ${typeConfig.bgColor}`}>
                      <TypeIcon className={`h-3.5 w-3.5 ${typeConfig.color}`} />
                    </div>
                    <span className="text-xs text-muted-foreground capitalize">
                      {venue.type.replace("-", " ")}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {venue.city}, {venue.state}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {operator?.name.split(" ").slice(0, 2).join(" ")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className={`h-2 w-2 rounded-full ${stageConfig?.color}`} />
                    <span className="text-xs">{stageConfig?.label}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-right">
                  {venue.dealValue ? formatCurrency(venue.dealValue) : "-"}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {formatDaysInStage(venue.lastActivity)}
                </td>
                <td className="px-4 py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem asChild>
                        <Link to={`/venues/${venue.id}`}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <LogActivityModal
                        venueId={venue.id}
                        trigger={
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Phone className="h-4 w-4 mr-2" />
                            Log Call
                          </DropdownMenuItem>
                        }
                      />
                      <AddTaskModal
                        venueId={venue.id}
                        trigger={
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Calendar className="h-4 w-4 mr-2" />
                            Add Task
                          </DropdownMenuItem>
                        }
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// Funnel view component
function FunnelView({ venuesByStage }: { venuesByStage: Map<VenueStage, Venue[]> }) {
  const maxCount = Math.max(...Array.from(venuesByStage.values()).map((v) => v.length), 1)

  return (
    <div className="space-y-3 max-w-4xl">
      {stages.map((stage) => {
        const stageVenues = venuesByStage.get(stage.key) || []
        const totalValue = stageVenues.reduce((sum, v) => sum + (v.dealValue || 0), 0)
        const weightedValue = stageVenues.reduce(
          (sum, v) => sum + ((v.dealValue || 0) * stage.probability) / 100,
          0
        )
        const widthPercent = Math.max((stageVenues.length / maxCount) * 100, 15)

        return (
          <div key={stage.key} className="flex items-center gap-4">
            <div className="w-28 text-sm font-medium shrink-0 text-right">{stage.label}</div>
            <div className="flex-1 flex items-center gap-4">
              <div
                className={`h-10 ${stage.color} rounded-md flex items-center justify-end px-3 transition-all shadow-sm`}
                style={{ width: `${widthPercent}%`, minWidth: "80px" }}
              >
                <span className="text-white font-semibold text-sm">{stageVenues.length}</span>
              </div>
              <div className="text-sm text-muted-foreground shrink-0">
                {formatCurrency(totalValue)}
                <span className="text-xs ml-1">({formatCurrency(weightedValue)} wtd)</span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Return animation overlay component
function ReturnAnimationOverlay({
  venue,
  startRect,
  endRect,
}: {
  venue: Venue
  startRect: DOMRect
  endRect: DOMRect
}) {
  const [animationPhase, setAnimationPhase] = useState<"start" | "end">("start")

  useEffect(() => {
    // Trigger animation to end position after a brief delay
    const timer = requestAnimationFrame(() => {
      setAnimationPhase("end")
    })
    return () => cancelAnimationFrame(timer)
  }, [])

  // Calculate position based on animation phase
  const left = animationPhase === "start" ? startRect.left : endRect.left
  const top = animationPhase === "start" ? startRect.top : endRect.top

  return (
    <div
      className="fixed z-20 pointer-events-none transition-all duration-300 ease-out"
      style={{
        left,
        top,
        width: startRect.width,
      }}
    >
      <DealCard venue={venue} isOverlay />
    </div>
  )
}

export default function Pipeline() {
  // Fetch data using React Query
  const { data: venuesData = [], isLoading: venuesLoading } = useVenues()
  const { data: operatorsData = [] } = useOperators()
  const { data: usersData = [] } = useUsers()
  const updateStageMutation = useUpdateVenueStage()

  // Local state for optimistic updates during drag
  const [localVenues, setLocalVenues] = useState<Venue[]>([])
  // Track when we've made local changes that shouldn't be overwritten by server sync
  const localOrderRef = useRef<Map<string, number>>(new Map())

  // Sync local venues with server data, but preserve local ordering for recently moved venues
  useEffect(() => {
    if (venuesData.length > 0) {
      const filtered = venuesData.filter((v: any) => v.stage !== "closed-lost")

      // If we have local ordering preferences, apply them
      if (localOrderRef.current.size > 0) {
        // Sort by local order preference, keeping relative order for untracked venues
        const sortedVenues = [...filtered].sort((a, b) => {
          const orderA = localOrderRef.current.get(a.id)
          const orderB = localOrderRef.current.get(b.id)

          // If both have local order, use that
          if (orderA !== undefined && orderB !== undefined) {
            return orderA - orderB
          }
          // If only one has local order, it comes first
          if (orderA !== undefined) return -1
          if (orderB !== undefined) return 1
          // Otherwise preserve server order
          return 0
        })
        setLocalVenues(sortedVenues)

        // Clear local order after applying (one-time use)
        localOrderRef.current.clear()
      } else {
        setLocalVenues(filtered)
      }
    }
  }, [venuesData])

  const venues = localVenues
  const setVenues = setLocalVenues

  const [viewMode, setViewMode] = useState<ViewMode>("kanban")
  const [searchQuery, setSearchQuery] = useState("")
  const [operatorFilter, setOperatorFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [activeVenue, setActiveVenue] = useState<Venue | null>(null)
  const [activeDropTarget, setActiveDropTarget] = useState<VenueStage | null>(null)
  const [justDroppedVenueId, setJustDroppedVenueId] = useState<string | null>(null)
  // Track where to show the drop placeholder (gap that opens up)
  const [dropPlaceholder, setDropPlaceholder] = useState<{
    stage: VenueStage
    insertAfterIndex: number // index where to show placeholder
  } | null>(null)
  // Ref to store placeholder position synchronously (avoids React state batching issues)
  const dropPlaceholderRef = useRef<{
    stage: VenueStage
    insertAfterIndex: number
  } | null>(null)
  // Separate state for animation - set slightly after dropPlaceholder to trigger CSS transition
  const [placeholderExpanded, setPlaceholderExpanded] = useState(false)
  const [stageChangeDialog, setStageChangeDialog] = useState<{
    venue: Venue
    fromStage: VenueStage
    toStage: VenueStage
    originalCardRect: DOMRect | null
    originalIndex: number
    originalInsertAfterVenueId: string | null | undefined // For restoring position on cancel
  } | null>(null)
  const [returningCard, setReturningCard] = useState<{
    venue: Venue
    fromStage: VenueStage
    toStage: VenueStage
    startRect: DOMRect | null
    endRect: DOMRect | null
  } | null>(null)
  // Placeholder that expands to make room for returning card (in origin column)
  const [expandingPlaceholder, setExpandingPlaceholder] = useState<{
    venueId: string
    stage: VenueStage
    height: number
    expanded: boolean
    targetIndex: number
  } | null>(null)
  // Placeholder that collapses as card leaves (in destination column)
  const [collapsingPlaceholder, setCollapsingPlaceholder] = useState<{
    venueId: string
    stage: VenueStage
    height: number
    collapsed: boolean
  } | null>(null)
  const columnRefs = useRef<Map<VenueStage, HTMLDivElement>>(new Map())

  // Memoized column ref callbacks to prevent breaking StageColumn's memo
  const columnRefCallbacks = useMemo(() => {
    const callbacks = new Map<VenueStage, (el: HTMLDivElement | null) => void>()
    stages.forEach((stage) => {
      callbacks.set(stage.key, (el) => {
        if (el) columnRefs.current.set(stage.key, el)
      })
    })
    return callbacks
  }, [])

  // Memoized placeholder objects per stage to prevent breaking StageColumn's memo
  const expandingPlaceholderByStage = useMemo(() => {
    if (!expandingPlaceholder) return null
    return {
      stage: expandingPlaceholder.stage,
      data: {
        venueId: expandingPlaceholder.venueId,
        height: expandingPlaceholder.height,
        expanded: expandingPlaceholder.expanded,
        targetIndex: expandingPlaceholder.targetIndex,
      }
    }
  }, [expandingPlaceholder])

  const collapsingPlaceholderByStage = useMemo(() => {
    if (!collapsingPlaceholder) return null
    return {
      stage: collapsingPlaceholder.stage,
      data: {
        venueId: collapsingPlaceholder.venueId,
        height: collapsingPlaceholder.height,
        collapsed: collapsingPlaceholder.collapsed,
      }
    }
  }, [collapsingPlaceholder])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor)
  )

  // Filter venues
  const filteredVenues = useMemo(() => {
    return venues.filter((v) => {
      const matchesSearch =
        searchQuery === "" ||
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.city.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesOperator = operatorFilter === "all" || v.operatorId === operatorFilter
      const matchesType = typeFilter === "all" || v.type === typeFilter

      return matchesSearch && matchesOperator && matchesType
    })
  }, [venues, searchQuery, operatorFilter, typeFilter])

  // Group venues by stage
  const venuesByStage = useMemo(() => {
    const map = new Map<VenueStage, Venue[]>()
    stages.forEach((stage) => {
      map.set(
        stage.key,
        filteredVenues.filter((v) => v.stage === stage.key)
      )
    })
    return map
  }, [filteredVenues])

  // Pre-compute weighted values per stage (avoids calculation in render loop)
  const weightedValuesByStage = useMemo(() => {
    const map = new Map<VenueStage, number>()
    stages.forEach((stage) => {
      const stageVenues = venuesByStage.get(stage.key) || []
      const weightedValue = stageVenues.reduce(
        (sum, v) => sum + ((v.dealValue || 0) * stage.probability) / 100,
        0
      )
      map.set(stage.key, weightedValue)
    })
    return map
  }, [venuesByStage])

  // Calculate totals (memoized)
  const { totalPipeline, weightedPipeline } = useMemo(() => {
    const total = filteredVenues.reduce((sum, v) => sum + (v.dealValue || 0), 0)
    const weighted = filteredVenues.reduce((sum, v) => {
      const stage = stages.find((s) => s.key === v.stage)
      return sum + ((v.dealValue || 0) * (stage?.probability || 0)) / 100
    }, 0)
    return { totalPipeline: total, weightedPipeline: weighted }
  }, [filteredVenues])

  // Drag handlers - wrapped in useCallback for performance
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const venue = venues.find((v) => v.id === event.active.id)
    if (venue) setActiveVenue(venue)
  }, [venues])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over, active } = event
    if (!over || !activeVenue) {
      setActiveDropTarget(null)
      setDropPlaceholder(null)
      dropPlaceholderRef.current = null
      return
    }

    let targetStage: VenueStage | null = null
    let insertBeforeIndex = -1 // -1 means at the end (after all cards)

    // Check if over a stage column directly
    if (stages.some((s) => s.key === over.id)) {
      targetStage = over.id as VenueStage
      // Dropped on column background - insert at end
      const stageVenues = venuesByStage.get(targetStage) || []
      insertBeforeIndex = stageVenues.length // Will show placeholder at end
    } else {
      // Over a card - find its stage and index
      const targetVenue = venues.find((v) => v.id === over.id)
      if (targetVenue) {
        targetStage = targetVenue.stage
        const stageVenues = venuesByStage.get(targetStage) || []
        const cardIndex = stageVenues.findIndex(v => v.id === targetVenue.id)

        // Check if dragged element is in the bottom half of the target card
        // If so, insert AFTER this card instead of BEFORE
        const overRect = over.rect
        const activeRect = active.rect.current.translated
        if (activeRect && overRect) {
          const activeCenterY = activeRect.top + activeRect.height / 2
          const overMidpointY = overRect.top + overRect.height / 2

          if (activeCenterY > overMidpointY) {
            // Dragging below midpoint - insert after this card
            insertBeforeIndex = cardIndex + 1
          } else {
            // Dragging above midpoint - insert before this card
            insertBeforeIndex = cardIndex
          }
        } else {
          insertBeforeIndex = cardIndex
        }
      }
    }

    // Show placeholder for both cross-column and within-column moves
    if (targetStage) {
      const isSameColumn = targetStage === activeVenue.stage
      // Only highlight column for cross-column moves
      setActiveDropTarget(isSameColumn ? null : targetStage)
      const newPlaceholder = { stage: targetStage, insertAfterIndex: insertBeforeIndex }
      // Update ref synchronously for reading in handleDragEnd
      dropPlaceholderRef.current = newPlaceholder
      setDropPlaceholder(prev => {
        // If position changed, trigger animation
        if (!prev || prev.stage !== targetStage || prev.insertAfterIndex !== insertBeforeIndex) {
          setPlaceholderExpanded(false)
          // Expand after a tiny delay to trigger CSS transition
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setPlaceholderExpanded(true)
            })
          })
        }
        return newPlaceholder
      })
    } else {
      setActiveDropTarget(null)
      setDropPlaceholder(null)
      dropPlaceholderRef.current = null
      setPlaceholderExpanded(false)
    }
  }, [activeVenue, venues, venuesByStage])

  const applyStageChange = useCallback((
    venueId: string,
    newStage: VenueStage,
    insertAfterVenueId?: string | null // null = insert at beginning, undefined = append at end
  ) => {
    // Optimistic local update with reordering
    setVenues((prev) => {
      // Remove the venue from its current position
      const venueToMove = prev.find(v => v.id === venueId)
      if (!venueToMove) return prev

      const updatedVenue = { ...venueToMove, stage: newStage, lastActivity: new Date().toISOString() }
      const withoutVenue = prev.filter(v => v.id !== venueId)

      if (insertAfterVenueId === undefined) {
        // Append at the end of the target stage
        // Find the last venue in the target stage and insert after it
        let lastIndexInStage = -1
        for (let i = withoutVenue.length - 1; i >= 0; i--) {
          if (withoutVenue[i].stage === newStage) {
            lastIndexInStage = i
            break
          }
        }
        if (lastIndexInStage === -1) {
          // No venues in target stage, just append
          return [...withoutVenue, updatedVenue]
        }
        // Insert after the last venue in the stage
        const result = [
          ...withoutVenue.slice(0, lastIndexInStage + 1),
          updatedVenue,
          ...withoutVenue.slice(lastIndexInStage + 1)
        ]
        // Save order of venues in the target stage
        const stageVenues = result.filter(v => v.stage === newStage)
        stageVenues.forEach((v, idx) => {
          localOrderRef.current.set(v.id, idx)
        })
        return result
      } else if (insertAfterVenueId === null) {
        // Insert at the beginning of the target stage
        // Find the first venue in the target stage
        const firstIndexInStage = withoutVenue.findIndex(v => v.stage === newStage)
        if (firstIndexInStage === -1) {
          // No venues in target stage, just append
          return [...withoutVenue, updatedVenue]
        }
        // Insert before the first venue in the stage
        const result = [
          ...withoutVenue.slice(0, firstIndexInStage),
          updatedVenue,
          ...withoutVenue.slice(firstIndexInStage)
        ]
        // Save order of venues in the target stage
        const stageVenues = result.filter(v => v.stage === newStage)
        stageVenues.forEach((v, idx) => {
          localOrderRef.current.set(v.id, idx)
        })
        return result
      } else {
        // Insert after a specific venue
        const insertIndex = withoutVenue.findIndex(v => v.id === insertAfterVenueId)
        if (insertIndex === -1) {
          // Target venue not found, append at end
          return [...withoutVenue, updatedVenue]
        }
        const result = [
          ...withoutVenue.slice(0, insertIndex + 1),
          updatedVenue,
          ...withoutVenue.slice(insertIndex + 1)
        ]
        // Save order of venues in the target stage to preserve when server data arrives
        const stageVenues = result.filter(v => v.stage === newStage)
        stageVenues.forEach((v, idx) => {
          localOrderRef.current.set(v.id, idx)
        })
        return result
      }
    })
    // Persist to server
    updateStageMutation.mutate({ id: venueId, stage: newStage })
  }, [updateStageMutation])

  // Reorder within the same stage (no stage change, just local reordering)
  const reorderWithinStage = useCallback((
    venueId: string,
    stage: VenueStage,
    insertAfterVenueId?: string | null // null = insert at beginning, undefined = append at end
  ) => {
    setVenues((prev) => {
      const venueToMove = prev.find(v => v.id === venueId)
      if (!venueToMove) return prev

      // Remove the venue from its current position
      const withoutVenue = prev.filter(v => v.id !== venueId)

      let result: Venue[]

      if (insertAfterVenueId === undefined) {
        // Append at the end of the stage
        let lastIndexInStage = -1
        for (let i = withoutVenue.length - 1; i >= 0; i--) {
          if (withoutVenue[i].stage === stage) {
            lastIndexInStage = i
            break
          }
        }
        if (lastIndexInStage === -1) {
          result = [...withoutVenue, venueToMove]
        } else {
          result = [
            ...withoutVenue.slice(0, lastIndexInStage + 1),
            venueToMove,
            ...withoutVenue.slice(lastIndexInStage + 1)
          ]
        }
      } else if (insertAfterVenueId === null) {
        // Insert at the beginning of the stage
        const firstIndexInStage = withoutVenue.findIndex(v => v.stage === stage)
        if (firstIndexInStage === -1) {
          result = [...withoutVenue, venueToMove]
        } else {
          result = [
            ...withoutVenue.slice(0, firstIndexInStage),
            venueToMove,
            ...withoutVenue.slice(firstIndexInStage)
          ]
        }
      } else {
        // Insert after a specific venue
        const insertIndex = withoutVenue.findIndex(v => v.id === insertAfterVenueId)
        if (insertIndex === -1) {
          result = [...withoutVenue, venueToMove]
        } else {
          result = [
            ...withoutVenue.slice(0, insertIndex + 1),
            venueToMove,
            ...withoutVenue.slice(insertIndex + 1)
          ]
        }
      }

      // Save order of venues in the stage to preserve when server data arrives
      const stageVenues = result.filter(v => v.stage === stage)
      stageVenues.forEach((v, idx) => {
        localOrderRef.current.set(v.id, idx)
      })

      return result
    })
    // No server mutation needed - ordering is local only
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    // Read placeholder position from ref (synchronous, avoids React state batching issues)
    const savedPlaceholder = dropPlaceholderRef.current

    // Clear all drag state
    setActiveVenue(null)
    setActiveDropTarget(null)
    setDropPlaceholder(null)
    dropPlaceholderRef.current = null
    setPlaceholderExpanded(false)

    if (!over) return

    const draggedVenue = venues.find((v) => v.id === active.id)
    if (!draggedVenue) return

    // Use the placeholder position that was shown during drag, not the over detection
    // This ensures the card goes exactly where the placeholder was
    let targetStage: VenueStage | null = null
    let insertAfterVenueId: string | null | undefined = undefined // undefined = end, null = beginning

    if (savedPlaceholder) {
      // Use the pre-calculated placeholder position
      targetStage = savedPlaceholder.stage
      const stageVenues = venuesByStage.get(targetStage) || []
      const placeholderIndex = savedPlaceholder.insertAfterIndex

      if (placeholderIndex === 0) {
        // Placeholder was at the beginning
        insertAfterVenueId = null
      } else if (placeholderIndex >= stageVenues.length) {
        // Placeholder was at the end
        insertAfterVenueId = undefined
      } else {
        // Placeholder was before card at placeholderIndex, so insert after card at placeholderIndex-1
        insertAfterVenueId = stageVenues[placeholderIndex - 1].id
      }
    } else {
      // Fallback: determine from over.id
      if (stages.some((s) => s.key === over.id)) {
        targetStage = over.id as VenueStage
        insertAfterVenueId = undefined
      } else {
        const targetVenue = venues.find((v) => v.id === over.id)
        if (targetVenue) {
          targetStage = targetVenue.stage
          const stageVenues = venuesByStage.get(targetStage) || []
          const targetIndex = stageVenues.findIndex(v => v.id === targetVenue.id)
          if (targetIndex === 0) {
            insertAfterVenueId = null
          } else {
            insertAfterVenueId = stageVenues[targetIndex - 1].id
          }
        }
      }
    }

    if (targetStage) {
      const isSameColumn = targetStage === draggedVenue.stage

      if (isSameColumn) {
        // Within-column reordering
        const stageVenues = venuesByStage.get(targetStage) || []
        const currentIndex = stageVenues.findIndex(v => v.id === draggedVenue.id)

        // Determine the target position
        let targetIndex: number
        if (insertAfterVenueId === null) {
          targetIndex = 0
        } else if (insertAfterVenueId === undefined) {
          targetIndex = stageVenues.length - 1
        } else {
          targetIndex = stageVenues.findIndex(v => v.id === insertAfterVenueId)
          // If dropping after a card that's before our current position, add 1
          if (targetIndex < currentIndex) {
            targetIndex += 1
          }
        }

        // Only reorder if position actually changed
        // No-op case (insertAfterVenueId = dragged card) already gives targetIndex === currentIndex
        if (targetIndex !== currentIndex) {
          // FLIP animation: capture old positions before state update
          const columnEl = document.querySelector(`[data-stage="${targetStage}"]`)
          const oldPositions = new Map<string, number>()
          if (columnEl) {
            const cards = columnEl.querySelectorAll('[data-venue-id]')
            cards.forEach(card => {
              const venueId = card.getAttribute('data-venue-id')
              if (venueId && venueId !== draggedVenue.id) {
                oldPositions.set(venueId, card.getBoundingClientRect().top)
              }
            })
          }

          setJustDroppedVenueId(draggedVenue.id)
          reorderWithinStage(draggedVenue.id, targetStage, insertAfterVenueId)

          // FLIP animation: after React re-renders, animate other cards from old to new positions
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              const animatedCards: HTMLElement[] = []
              if (columnEl) {
                const cards = columnEl.querySelectorAll('[data-venue-id]') as NodeListOf<HTMLElement>
                cards.forEach(card => {
                  const venueId = card.getAttribute('data-venue-id')
                  if (!venueId || venueId === draggedVenue.id) return

                  const oldTop = oldPositions.get(venueId)
                  if (oldTop !== undefined) {
                    const newTop = card.getBoundingClientRect().top
                    const delta = oldTop - newTop

                    if (Math.abs(delta) > 1) {
                      animatedCards.push(card)
                      // Immediately position at old location (no transition)
                      card.style.transform = `translateY(${delta}px)`
                      card.style.transition = 'none'

                      // Force reflow to ensure the transform is applied
                      card.offsetHeight

                      // Animate to new position
                      card.style.transition = 'transform 200ms ease-out'
                      card.style.transform = 'translateY(0)'
                    }
                  }
                })
              }

              // Clean up inline styles and clear state after animation completes
              setTimeout(() => {
                animatedCards.forEach(card => {
                  card.style.removeProperty('transform')
                  card.style.removeProperty('transition')
                })
                setJustDroppedVenueId(null)
              }, 250)
            })
          })
        }
      } else {
        // Cross-column move
        setJustDroppedVenueId(draggedVenue.id)
        setTimeout(() => setJustDroppedVenueId(null), 50)

        // Check if this is a "large" stage jump (more than 2 stages)
        const fromIndex = stages.findIndex((s) => s.key === draggedVenue.stage)
        const toIndex = stages.findIndex((s) => s.key === targetStage)
        const stageJump = Math.abs(toIndex - fromIndex)

        if (stageJump > 2) {
          // Capture the card's original position BEFORE the optimistic update
          const cardElement = document.querySelector(`[data-venue-id="${draggedVenue.id}"]`)
          const originalCardRect = cardElement?.getBoundingClientRect() || null

          // Calculate original index and insert position in the column
          const originalVenues = venuesByStage.get(draggedVenue.stage) || []
          const originalIndex = originalVenues.findIndex(v => v.id === draggedVenue.id)
          // If it was first in the column, insert at beginning (null), otherwise insert after the previous card
          const originalInsertAfterVenueId = originalIndex > 0 ? originalVenues[originalIndex - 1].id : null

          // Apply change optimistically so card stays at destination
          applyStageChange(draggedVenue.id, targetStage, insertAfterVenueId)
          // Show confirmation dialog (can revert if cancelled)
          setStageChangeDialog({
            venue: draggedVenue,
            fromStage: draggedVenue.stage,
            toStage: targetStage,
            originalCardRect,
            originalIndex,
            originalInsertAfterVenueId,
          })
        } else {
          // Apply change directly
          applyStageChange(draggedVenue.id, targetStage, insertAfterVenueId)
        }
      }
    }
  }, [venues, venuesByStage, applyStageChange, reorderWithinStage])

  const confirmStageChange = useCallback(() => {
    // Already applied optimistically, just close the dialog
    setStageChangeDialog(null)
  }, [])

  const cancelStageChange = useCallback(() => {
    if (stageChangeDialog) {
      // Get the card element at the current (destination) position
      const cardElement = document.querySelector(`[data-venue-id="${stageChangeDialog.venue.id}"]`)
      const startRect = cardElement?.getBoundingClientRect() || null

      // Use the stored original position (captured before the optimistic update)
      const endRect = stageChangeDialog.originalCardRect

      // Calculate card height for placeholder
      const cardHeight = startRect?.height || 100

      // Start with collapsed placeholder (height 0) in origin column - will expand
      setExpandingPlaceholder({
        venueId: stageChangeDialog.venue.id,
        stage: stageChangeDialog.fromStage,
        height: cardHeight,
        expanded: false,
        targetIndex: stageChangeDialog.originalIndex,
      })

      // Start with expanded placeholder in destination column - will collapse
      setCollapsingPlaceholder({
        venueId: stageChangeDialog.venue.id,
        stage: stageChangeDialog.toStage,
        height: cardHeight,
        collapsed: false,
      })

      // Start return animation
      setReturningCard({
        venue: stageChangeDialog.venue,
        fromStage: stageChangeDialog.toStage,
        toStage: stageChangeDialog.fromStage,
        startRect,
        endRect,
      })

      // Close dialog immediately
      setStageChangeDialog(null)

      // Expand/collapse placeholders after a brief delay (to trigger CSS transition)
      requestAnimationFrame(() => {
        setExpandingPlaceholder((prev) =>
          prev ? { ...prev, expanded: true } : null
        )
        setCollapsingPlaceholder((prev) =>
          prev ? { ...prev, collapsed: true } : null
        )
      })

      // After animation, revert the stage and clear animation state
      setTimeout(() => {
        applyStageChange(stageChangeDialog.venue.id, stageChangeDialog.fromStage, stageChangeDialog.originalInsertAfterVenueId)
        setReturningCard(null)
        setExpandingPlaceholder(null)
        setCollapsingPlaceholder(null)
      }, 300)
    }
  }, [stageChangeDialog, applyStageChange])

  // Show loading state while fetching initial data
  if (venuesLoading && localVenues.length === 0) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 lg:pl-64 flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading pipeline...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />

      <main className="flex-1 lg:pl-64 min-w-0 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="shrink-0 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Pipeline</h1>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(totalPipeline)} total · {formatCurrency(weightedPipeline)} weighted · {filteredVenues.length} deals
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
              </Button>
              <AddVenueModal />
            </div>
          </div>
        </header>

        {/* Content - fills remaining height */}
        <div className="flex-1 flex flex-col min-h-0 px-6 pt-6 space-y-4 overflow-hidden">
          {/* Filters and view toggle */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search venues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-[200px] h-9"
                />
              </div>

              <Select value={operatorFilter} onValueChange={setOperatorFilter}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="All Operators" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Operators</SelectItem>
                  {operatorsData.map((op: any) => (
                    <SelectItem key={op.id} value={op.id}>
                      {op.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[160px] h-9">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="stadium">Stadium</SelectItem>
                  <SelectItem value="arena">Arena</SelectItem>
                  <SelectItem value="amphitheater">Amphitheater</SelectItem>
                  <SelectItem value="theater">Theater</SelectItem>
                  <SelectItem value="convention-center">Convention Center</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
              <Button
                variant={viewMode === "kanban" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("kanban")}
                className="h-7 px-3 text-xs"
              >
                <LayoutGrid className="h-3.5 w-3.5 mr-1.5" />
                Kanban
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-7 px-3 text-xs"
              >
                <List className="h-3.5 w-3.5 mr-1.5" />
                List
              </Button>
              <Button
                variant={viewMode === "funnel" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("funnel")}
                className="h-7 px-3 text-xs"
              >
                <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
                Funnel
              </Button>
            </div>
          </div>

          {/* View content - fills remaining space */}
          {viewMode === "kanban" && (
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              {/* Kanban fills remaining height, scrolls horizontally */}
              <div className="flex-1 min-h-0 overflow-x-auto scrollbar-hide">
                <div className="flex gap-4 h-full">
                  {stages.map((stage) => {
                    const stageVenues = venuesByStage.get(stage.key) || []
                    return (
                      <StageColumn
                        key={stage.key}
                        stage={stage}
                        venues={stageVenues}
                        weightedValue={weightedValuesByStage.get(stage.key) || 0}
                        isActiveDropTarget={activeDropTarget === stage.key}
                        pendingVenueId={stageChangeDialog?.venue.id}
                        isOriginColumn={activeVenue?.stage === stage.key}
                        returningVenueId={returningCard?.venue.id}
                        justDroppedVenueId={justDroppedVenueId || undefined}
                        draggingVenueId={activeVenue?.stage === stage.key ? activeVenue.id : undefined}
                        dropPlaceholderIndex={
                          dropPlaceholder?.stage === stage.key
                            ? dropPlaceholder.insertAfterIndex
                            : undefined
                        }
                        dropPlaceholderExpanded={
                          dropPlaceholder?.stage === stage.key
                            ? placeholderExpanded
                            : undefined
                        }
                        columnRef={columnRefCallbacks.get(stage.key)}
                        expandingPlaceholder={
                          expandingPlaceholderByStage?.stage === stage.key
                            ? expandingPlaceholderByStage.data
                            : null
                        }
                        collapsingPlaceholder={
                          collapsingPlaceholderByStage?.stage === stage.key
                            ? collapsingPlaceholderByStage.data
                            : null
                        }
                      />
                    )
                  })}
                </div>
              </div>

              <DragOverlay>
                {activeVenue && <DealCard venue={activeVenue} isOverlay />}
              </DragOverlay>

              {/* Return animation overlay */}
              {returningCard && returningCard.startRect && returningCard.endRect && (
                <ReturnAnimationOverlay
                  venue={returningCard.venue}
                  startRect={returningCard.startRect}
                  endRect={returningCard.endRect}
                />
              )}
            </DndContext>
          )}

          {viewMode === "list" && <ListView venues={filteredVenues} />}

          {viewMode === "funnel" && <FunnelView venuesByStage={venuesByStage} />}
        </div>
      </main>

      {/* Stage change confirmation dialog */}
      <Dialog open={!!stageChangeDialog} onOpenChange={(open) => !open && cancelStageChange()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Stage Change</DialogTitle>
            <DialogDescription>
              You're moving{" "}
              <span className="font-semibold text-foreground">{stageChangeDialog?.venue.name}</span>{" "}
              from{" "}
              <span className="font-semibold text-foreground">
                {stages.find((s) => s.key === stageChangeDialog?.fromStage)?.label}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-foreground">
                {stages.find((s) => s.key === stageChangeDialog?.toStage)?.label}
              </span>
              .
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              This is a significant stage change (skipping multiple stages). Are you sure?
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancelStageChange}>
              Cancel
            </Button>
            <Button onClick={confirmStageChange}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
