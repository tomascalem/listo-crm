import { useState } from "react"
import { Link } from "react-router-dom"
import { CheckSquare, Circle, CheckCircle2, Mail, Phone, FileText, ExternalLink, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  getTodosForUser,
  getVenueById,
  getContactById,
  type Todo,
} from "@/lib/mock-data"
import { LogActivityModal } from "@/components/crm/modals/log-activity-modal"

interface TodoActionListProps {
  userId: string
  limit?: number
}

const priorityConfig = {
  high: { label: "High", color: "bg-destructive/20 text-destructive border-destructive/30" },
  medium: { label: "Medium", color: "bg-warning/20 text-warning border-warning/30" },
  low: { label: "Low", color: "bg-muted text-muted-foreground border-border" },
}

function getDueStatus(dueDate: string): { label: string; isOverdue: boolean; isDueToday: boolean } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(dueDate)
  due.setHours(0, 0, 0, 0)

  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return { label: `${Math.abs(diffDays)}d overdue`, isOverdue: true, isDueToday: false }
  } else if (diffDays === 0) {
    return { label: "Due today", isOverdue: false, isDueToday: true }
  } else if (diffDays === 1) {
    return { label: "Due tomorrow", isOverdue: false, isDueToday: false }
  } else {
    return { label: `Due in ${diffDays}d`, isOverdue: false, isDueToday: false }
  }
}

function getActionType(title: string): "email" | "call" | "proposal" | "general" {
  const lowerTitle = title.toLowerCase()
  if (lowerTitle.includes("email") || lowerTitle.includes("follow up") || lowerTitle.includes("send")) {
    return "email"
  }
  if (lowerTitle.includes("call") || lowerTitle.includes("schedule")) {
    return "call"
  }
  if (lowerTitle.includes("proposal") || lowerTitle.includes("document") || lowerTitle.includes("prepare")) {
    return "proposal"
  }
  return "general"
}

export function TodoActionList({ userId, limit = 5 }: TodoActionListProps) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const allTodos = getTodosForUser(userId)
  const todos = allTodos.filter((t) => !completedIds.has(t.id)).slice(0, limit)

  const toggleComplete = (id: string) => {
    setCompletedIds((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckSquare className="h-5 w-5 text-primary" />
            Your Tasks
          </CardTitle>
          <Link to="/tasks">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              View all
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {todos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-10 w-10 mx-auto mb-3 opacity-50 text-success" />
            <p>All tasks completed!</p>
            <p className="text-sm mt-1">Great work staying on top of things.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {todos.map((todo) => {
              const venue = todo.venueId ? getVenueById(todo.venueId) : null
              const contact = todo.contactId ? getContactById(todo.contactId) : null
              const dueStatus = getDueStatus(todo.dueDate)
              const actionType = getActionType(todo.title)
              const priorityStyle = priorityConfig[todo.priority]

              return (
                <div
                  key={todo.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                    dueStatus.isOverdue
                      ? "bg-destructive/5 border-destructive/30"
                      : dueStatus.isDueToday
                        ? "bg-warning/5 border-warning/30"
                        : "bg-card border-border hover:bg-secondary/30"
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleComplete(todo.id)}
                    className="mt-0.5 text-muted-foreground hover:text-primary transition-colors"
                  >
                    {completedIds.has(todo.id) ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </button>

                  {/* Task Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <h4 className="font-medium text-sm flex-1">{todo.title}</h4>
                      <Badge
                        variant="outline"
                        className={`text-xs shrink-0 ${priorityStyle.color}`}
                      >
                        {priorityStyle.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      {venue && (
                        <Link
                          to={`/venues/${venue.id}`}
                          className="hover:text-primary transition-colors"
                        >
                          {venue.name}
                        </Link>
                      )}
                      {venue && contact && <span>·</span>}
                      {contact && <span>{contact.name}</span>}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className={`h-3 w-3 ${dueStatus.isOverdue ? "text-destructive" : "text-muted-foreground"}`} />
                      <span
                        className={`text-xs ${
                          dueStatus.isOverdue
                            ? "text-destructive font-medium"
                            : dueStatus.isDueToday
                              ? "text-warning font-medium"
                              : "text-muted-foreground"
                        }`}
                      >
                        {dueStatus.label}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex-shrink-0">
                    {actionType === "email" && contact ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`mailto:${contact.email}`, "_blank")}
                      >
                        <Mail className="h-3.5 w-3.5 mr-1.5" />
                        Email
                      </Button>
                    ) : actionType === "call" && contact ? (
                      <LogActivityModal
                        trigger={
                          <Button size="sm" variant="outline">
                            <Phone className="h-3.5 w-3.5 mr-1.5" />
                            Call
                          </Button>
                        }
                        venueId={todo.venueId}
                        contactId={todo.contactId}
                      />
                    ) : actionType === "proposal" && venue ? (
                      <Link to={`/venues/${venue.id}`}>
                        <Button size="sm" variant="outline">
                          <FileText className="h-3.5 w-3.5 mr-1.5" />
                          View
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleComplete(todo.id)}
                      >
                        Done
                      </Button>
                    )}
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
