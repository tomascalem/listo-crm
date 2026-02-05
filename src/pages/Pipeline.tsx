import { useState, useMemo } from "react"
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
  venues as allVenues,
  operators,
  users,
  getOperatorById,
  getContactsByVenueId,
  type Venue,
  type VenueStage,
  type VenueType,
} from "@/lib/mock-data"
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

function needsAttention(venue: Venue): boolean {
  const now = new Date()
  const lastActivity = new Date(venue.lastActivity)
  const diffDays = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))

  // More selective criteria:
  // 1. In negotiation stage with no activity in 10+ days (critical stage)
  // 2. High-value deal (>$300K) with no activity in 14+ days
  // 3. Any deal with no activity in 30+ days
  if (venue.stage === "negotiation" && diffDays >= 10) return true
  if ((venue.dealValue || 0) > 300000 && diffDays >= 14) return true
  if (diffDays >= 30) return true

  return false
}

// Draggable deal card component
interface DealCardProps {
  venue: Venue
  isOverlay?: boolean
}

function DealCard({ venue, isOverlay }: DealCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const operator = getOperatorById(venue.operatorId)
  const typeConfig = venueTypeConfig[venue.type]
  const TypeIcon = typeConfig.icon
  const attention = needsAttention(venue)
  const contacts = getContactsByVenueId(venue.id)
  const primaryContact = contacts.find((c) => c.isPrimary) || contacts[0]
  const assignedUsers = venue.assignedUserIds.map(id => users.find(u => u.id === id)).filter(Boolean)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: venue.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
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
      className={`bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all cursor-grab active:cursor-grabbing ${
        isOverlay ? "shadow-xl ring-2 ring-primary/50 rotate-2" : "shadow-sm"
      } ${attention ? "ring-1 ring-warning/50" : ""}`}
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
                {attention && (
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
                contactId={primaryContact?.id}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Phone className="h-4 w-4 mr-2" />
                    Log Call
                  </DropdownMenuItem>
                }
              />
              <LogActivityModal
                venueId={venue.id}
                contactId={primaryContact?.id}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    <Mail className="h-4 w-4 mr-2" />
                    Log Email
                  </DropdownMenuItem>
                }
              />
              <AddTaskModal
                venueId={venue.id}
                contactId={primaryContact?.id}
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
      >
        {cardContent}
      </div>
    </>
  )
}

// Droppable stage column component
interface StageColumnProps {
  stage: (typeof stages)[0]
  venues: Venue[]
  weightedValue: number
}

function StageColumn({ stage, venues, weightedValue }: StageColumnProps) {
  const totalValue = venues.reduce((sum, v) => sum + (v.dealValue || 0), 0)

  const { setNodeRef, isOver } = useDroppable({
    id: stage.key,
  })

  // Determine add button text
  const addButtonText = stage.key === "lead" ? "Add Lead" : "Add Deal"
  const showAddButton = stage.key === "lead" || stage.key === "qualified"

  return (
    <div className="flex flex-col min-w-[300px] w-[300px] shrink-0 h-full">
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
        className={`flex-1 min-h-0 rounded-lg p-2 transition-colors border flex flex-col ${
          isOver ? "bg-primary/10 ring-2 ring-primary/30 ring-dashed border-primary/30" : "bg-muted/30 border-border/50"
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

        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
          <SortableContext items={venues.map((v) => v.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {venues.length === 0 ? (
                // Empty state
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Inbox className="h-8 w-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">No deals</p>
                  <p className="text-xs text-muted-foreground/70">Drag a deal here</p>
                </div>
              ) : (
                venues.map((venue) => (
                  <DealCard key={venue.id} venue={venue} />
                ))
              )}
            </div>
          </SortableContext>
        </div>
      </div>
    </div>
  )
}

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
            const operator = getOperatorById(venue.operatorId)
            const typeConfig = venueTypeConfig[venue.type]
            const TypeIcon = typeConfig.icon
            const stageConfig = stages.find((s) => s.key === venue.stage)
            const attention = needsAttention(venue)
            const contacts = getContactsByVenueId(venue.id)
            const primaryContact = contacts.find((c) => c.isPrimary) || contacts[0]

            return (
              <tr key={venue.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {attention && (
                      <AlertCircle className="h-4 w-4 text-warning shrink-0" />
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
                        contactId={primaryContact?.id}
                        trigger={
                          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                            <Phone className="h-4 w-4 mr-2" />
                            Log Call
                          </DropdownMenuItem>
                        }
                      />
                      <AddTaskModal
                        venueId={venue.id}
                        contactId={primaryContact?.id}
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

export default function Pipeline() {
  const [venues, setVenues] = useState(allVenues.filter((v) => v.stage !== "closed-lost"))
  const [viewMode, setViewMode] = useState<ViewMode>("kanban")
  const [searchQuery, setSearchQuery] = useState("")
  const [operatorFilter, setOperatorFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [activeVenue, setActiveVenue] = useState<Venue | null>(null)
  const [stageChangeDialog, setStageChangeDialog] = useState<{
    venue: Venue
    fromStage: VenueStage
    toStage: VenueStage
  } | null>(null)

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

  // Calculate totals
  const totalPipeline = filteredVenues.reduce((sum, v) => sum + (v.dealValue || 0), 0)
  const weightedPipeline = filteredVenues.reduce((sum, v) => {
    const stage = stages.find((s) => s.key === v.stage)
    return sum + ((v.dealValue || 0) * (stage?.probability || 0)) / 100
  }, 0)

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    const venue = venues.find((v) => v.id === event.active.id)
    if (venue) setActiveVenue(venue)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveVenue(null)
    const { active, over } = event

    if (!over) return

    const draggedVenue = venues.find((v) => v.id === active.id)
    if (!draggedVenue) return

    // Determine target stage - could be dropping on a column or on another card
    let targetStage: VenueStage | null = null

    // Check if dropped on a stage column directly
    if (stages.some((s) => s.key === over.id)) {
      targetStage = over.id as VenueStage
    } else {
      // Dropped on another card - find its stage
      const targetVenue = venues.find((v) => v.id === over.id)
      if (targetVenue) {
        targetStage = targetVenue.stage
      }
    }

    if (targetStage && targetStage !== draggedVenue.stage) {
      // Check if this is a "large" stage jump (more than 2 stages)
      const fromIndex = stages.findIndex((s) => s.key === draggedVenue.stage)
      const toIndex = stages.findIndex((s) => s.key === targetStage)
      const stageJump = Math.abs(toIndex - fromIndex)

      if (stageJump > 2) {
        // Show confirmation dialog
        setStageChangeDialog({
          venue: draggedVenue,
          fromStage: draggedVenue.stage,
          toStage: targetStage,
        })
      } else {
        // Apply change directly
        applyStageChange(draggedVenue.id, targetStage)
      }
    }
  }

  const applyStageChange = (venueId: string, newStage: VenueStage) => {
    setVenues((prev) =>
      prev.map((v) =>
        v.id === venueId ? { ...v, stage: newStage, lastActivity: new Date().toISOString() } : v
      )
    )
  }

  const confirmStageChange = () => {
    if (stageChangeDialog) {
      applyStageChange(stageChangeDialog.venue.id, stageChangeDialog.toStage)
      setStageChangeDialog(null)
    }
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
                  {operators.map((op) => (
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
              onDragEnd={handleDragEnd}
            >
              {/* Kanban fills remaining height, scrolls horizontally */}
              <div className="flex-1 min-h-0 overflow-x-auto scrollbar-hide">
                <div className="flex gap-4 h-full">
                  {stages.map((stage) => {
                    const stageVenues = venuesByStage.get(stage.key) || []
                    const weightedValue = stageVenues.reduce(
                      (sum, v) => sum + ((v.dealValue || 0) * stage.probability) / 100,
                      0
                    )
                    return (
                      <StageColumn
                        key={stage.key}
                        stage={stage}
                        venues={stageVenues}
                        weightedValue={weightedValue}
                      />
                    )
                  })}
                </div>
              </div>

              <DragOverlay>
                {activeVenue && <DealCard venue={activeVenue} isOverlay />}
              </DragOverlay>
            </DndContext>
          )}

          {viewMode === "list" && <ListView venues={filteredVenues} />}

          {viewMode === "funnel" && <FunnelView venuesByStage={venuesByStage} />}
        </div>
      </main>

      {/* Stage change confirmation dialog */}
      <Dialog open={!!stageChangeDialog} onOpenChange={() => setStageChangeDialog(null)}>
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
            <Button variant="outline" onClick={() => setStageChangeDialog(null)}>
              Cancel
            </Button>
            <Button onClick={confirmStageChange}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
