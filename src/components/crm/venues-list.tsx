
import { useState } from "react"
import { MapPin, Users, Calendar, TrendingUp, MoreHorizontal, Plus, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import type { Venue, VenueStage } from "@/lib/mock-data"

interface VenuesListProps {
  venues: Venue[]
  compact?: boolean
}

const stageConfig: Record<VenueStage, { label: string; color: string; bgColor: string }> = {
  lead: { label: "Lead", color: "text-muted-foreground", bgColor: "bg-muted-foreground/20" },
  qualified: { label: "Qualified", color: "text-accent", bgColor: "bg-accent/20" },
  demo: { label: "Demo", color: "text-chart-2", bgColor: "bg-chart-2/20" },
  proposal: { label: "Proposal", color: "text-warning", bgColor: "bg-warning/20" },
  negotiation: { label: "Negotiation", color: "text-chart-4", bgColor: "bg-chart-4/20" },
  "closed-won": { label: "Won", color: "text-success", bgColor: "bg-success/20" },
  "closed-lost": { label: "Lost", color: "text-destructive", bgColor: "bg-destructive/20" },
}

function formatCurrency(amount: number) {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`
  return `$${amount}`
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function VenueCard({ venue }: { venue: Venue }) {
  const [isOpen, setIsOpen] = useState(false)
  // Use expanded relations from API if available
  const contacts = (venue as any).contacts || []
  const interactions = (venue as any).interactions || []
  const todos = (venue as any).todos || []
  const stage = stageConfig[venue.stage] || stageConfig.lead

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <CollapsibleTrigger asChild>
          <div className="p-4 cursor-pointer hover:bg-secondary/30 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-card-foreground">{venue.name}</h3>
                    <Badge className={cn("text-xs", stage.bgColor, stage.color)} variant="secondary">
                      {stage.label}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {venue.city}, {venue.state}
                    </span>
                    <span>{venue.type}</span>
                    {venue.capacity && <span>{venue.capacity.toLocaleString()} capacity</span>}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-card-foreground">{formatCurrency(venue.dealValue || 0)}</p>
                <p className="text-sm text-muted-foreground">{venue.probability}% probability</p>
              </div>
            </div>
            {venue.stage !== "closed-won" && venue.stage !== "closed-lost" && (
              <div className="mt-3 pl-7">
                <div className="flex items-center gap-2">
                  <Progress value={venue.probability} className="h-1.5 flex-1" />
                  <span className="text-xs text-muted-foreground w-10">{venue.probability}%</span>
                </div>
              </div>
            )}
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t border-border bg-secondary/20 p-4 space-y-4">
            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-card p-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Contacts</span>
                </div>
                <p className="mt-1 font-semibold text-card-foreground">{contacts.length}</p>
              </div>
              <div className="rounded-lg bg-card p-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  <span>Interactions</span>
                </div>
                <p className="mt-1 font-semibold text-card-foreground">{interactions.length}</p>
              </div>
              <div className="rounded-lg bg-card p-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Open Tasks</span>
                </div>
                <p className="mt-1 font-semibold text-card-foreground">
                  {todos.filter((t: any) => !t.completed).length}
                </p>
              </div>
            </div>

            {/* Contacts */}
            {contacts.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-card-foreground mb-2">Key Contacts</h4>
                <div className="flex flex-wrap gap-2">
                  {contacts.map((contact: any) => (
                    <div
                      key={contact.id}
                      className="flex items-center gap-2 rounded-lg bg-card px-3 py-1.5 text-sm"
                    >
                      <div className="h-6 w-6 rounded-full bg-accent flex items-center justify-center text-xs text-accent-foreground">
                        {contact.avatar}
                      </div>
                      <span className="text-card-foreground">{contact.name}</span>
                      {contact.isPrimary && (
                        <Badge variant="outline" className="text-xs">Primary</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Next Follow-up */}
            {venue.nextFollowUp && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Next follow-up:</span>
                <span className="font-medium text-card-foreground">{formatDate(venue.nextFollowUp)}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <Button size="sm" variant="secondary">Log Interaction</Button>
              <Button size="sm" variant="secondary">Add Task</Button>
              <Button size="sm" variant="secondary">Update Stage</Button>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

export function VenuesList({ venues, compact }: VenuesListProps) {
  const displayVenues = compact ? venues.slice(0, 3) : venues

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base font-medium text-card-foreground">
          Venues {!compact && `(${venues.length})`}
        </CardTitle>
        <Button size="sm" variant="outline" className="gap-2 bg-transparent">
          <Plus className="h-4 w-4" />
          Add Venue
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayVenues.map((venue) => (
          <VenueCard key={venue.id} venue={venue} />
        ))}
        {compact && venues.length > 3 && (
          <Button variant="ghost" className="w-full text-muted-foreground">
            View all {venues.length} venues
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
