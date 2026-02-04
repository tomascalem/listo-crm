import { useState } from "react"
import { Link } from "react-router-dom"
import { Sparkles, Mail, Phone, FileText, MessageSquare, ChevronDown, ChevronUp, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  getRecommendedActionsForUser,
  getVenueById,
  getContactById,
  type RecommendedAction,
  type RecommendedActionType,
} from "@/lib/mock-data"
import { EmailComposerModal } from "@/components/crm/modals/email-composer-modal"
import { AddTaskModal } from "@/components/crm/modals/add-task-modal"

interface RecommendedActionsProps {
  userId: string
  limit?: number
}

const actionTypeConfig: Record<
  RecommendedActionType,
  { icon: typeof Mail; label: string; buttonLabel: string }
> = {
  "follow-up-email": { icon: Mail, label: "Follow-up Email", buttonLabel: "Draft Email" },
  "schedule-call": { icon: Phone, label: "Schedule Call", buttonLabel: "Schedule" },
  "send-proposal": { icon: FileText, label: "Send Proposal", buttonLabel: "View Proposal" },
  "check-in": { icon: MessageSquare, label: "Check In", buttonLabel: "Send Message" },
}

const priorityConfig = {
  high: { label: "High Priority", color: "bg-destructive/20 text-destructive border-destructive/30" },
  medium: { label: "Suggested", color: "bg-warning/20 text-warning border-warning/30" },
  low: { label: "Optional", color: "bg-muted text-muted-foreground border-border" },
}

export function RecommendedActions({ userId, limit = 3 }: RecommendedActionsProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set())
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const allActions = getRecommendedActionsForUser(userId)
  const actions = allActions.filter((a) => !dismissedIds.has(a.id)).slice(0, limit)

  const dismissAction = (id: string) => {
    setDismissedIds((prev) => new Set(prev).add(id))
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          Recommended Actions
          <Badge variant="outline" className="ml-auto text-xs bg-primary/10 text-primary border-primary/30">
            AI Powered
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {actions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>No recommendations right now</p>
            <p className="text-sm mt-1">Check back later for AI-powered suggestions.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {actions.map((action) => {
              const config = actionTypeConfig[action.type]
              const Icon = config.icon
              const venue = getVenueById(action.venueId)
              const contact = getContactById(action.contactId)
              const priorityStyle = priorityConfig[action.priority]
              const isExpanded = expandedId === action.id

              return (
                <div
                  key={action.id}
                  className="p-3 rounded-lg border border-border bg-card hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-sm">{action.title}</h4>
                        <Badge variant="outline" className={`text-xs shrink-0 ${priorityStyle.color}`}>
                          {priorityStyle.label}
                        </Badge>
                      </div>

                      {venue && contact && (
                        <p className="text-xs text-muted-foreground mt-1">
                          <Link
                            to={`/venues/${venue.id}`}
                            className="hover:text-primary transition-colors"
                          >
                            {venue.name}
                          </Link>
                          {" · "}
                          {contact.name}
                        </p>
                      )}

                      {/* Expandable Reason */}
                      <button
                        onClick={() => toggleExpand(action.id)}
                        className="flex items-center gap-1 mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                        <span>{isExpanded ? "Hide" : "Why this recommendation?"}</span>
                      </button>

                      {isExpanded && (
                        <div className="mt-2 p-2 rounded bg-secondary/50 text-xs text-muted-foreground">
                          <Sparkles className="h-3 w-3 inline mr-1 text-primary" />
                          {action.reason}
                        </div>
                      )}
                    </div>

                    {/* Dismiss Button */}
                    <button
                      onClick={() => dismissAction(action.id)}
                      className="text-muted-foreground hover:text-foreground transition-colors p-1"
                      title="Dismiss"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Action Button */}
                  <div className="mt-3 flex justify-end">
                    {(action.type === "follow-up-email" || action.type === "check-in") && contact ? (
                      <EmailComposerModal
                        trigger={
                          <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                            <Mail className="h-3.5 w-3.5 mr-1.5" />
                            {config.buttonLabel}
                          </Button>
                        }
                        contactId={action.contactId}
                        venueId={action.venueId}
                        subject={`Following up - ${venue?.name || ""}`}
                        body={action.suggestedContent || ""}
                      />
                    ) : action.type === "schedule-call" ? (
                      <AddTaskModal
                        trigger={
                          <Button size="sm" variant="outline">
                            <Phone className="h-3.5 w-3.5 mr-1.5" />
                            {config.buttonLabel}
                          </Button>
                        }
                        venueId={action.venueId}
                        contactId={action.contactId}
                      />
                    ) : action.type === "send-proposal" && venue ? (
                      <Link to={`/venues/${venue.id}`}>
                        <Button size="sm" variant="outline">
                          <FileText className="h-3.5 w-3.5 mr-1.5" />
                          {config.buttonLabel}
                        </Button>
                      </Link>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
