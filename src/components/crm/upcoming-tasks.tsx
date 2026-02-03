
import { useState } from "react"
import { Check, Circle, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { todos, getVenueById, getContactById, getUserById } from "@/lib/mock-data"
import type { Todo } from "@/lib/mock-data"

function PriorityIndicator({ priority }: { priority: Todo["priority"] }) {
  const colors = {
    high: "bg-destructive",
    medium: "bg-warning",
    low: "bg-muted-foreground",
  }

  return <div className={cn("h-2 w-2 rounded-full", colors[priority])} />
}

function formatDueDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return { text: "Overdue", className: "text-destructive" }
  if (diffDays === 0) return { text: "Today", className: "text-warning" }
  if (diffDays === 1) return { text: "Tomorrow", className: "text-card-foreground" }
  if (diffDays < 7) return { text: `In ${diffDays} days`, className: "text-muted-foreground" }
  return { text: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }), className: "text-muted-foreground" }
}

export function UpcomingTasks() {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set())

  const upcomingTodos = todos
    .filter((t) => !t.completed && !completedTasks.has(t.id))
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5)

  const toggleTask = (taskId: string) => {
    setCompletedTasks((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-card-foreground">Upcoming Tasks</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {upcomingTodos.map((todo) => {
          const venue = getVenueById(todo.venueId)
          const contact = todo.contactId ? getContactById(todo.contactId) : null
          const dueInfo = formatDueDate(todo.dueDate)
          const isCompleted = completedTasks.has(todo.id)

          return (
            <div
              key={todo.id}
              className={cn(
                "flex items-start gap-3 rounded-lg p-3 transition-all",
                isCompleted ? "bg-muted/50 opacity-60" : "hover:bg-secondary/50"
              )}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 shrink-0 mt-0.5"
                onClick={() => toggleTask(todo.id)}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4 text-success" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <PriorityIndicator priority={todo.priority} />
                  <p className={cn("text-sm font-medium", isCompleted ? "line-through text-muted-foreground" : "text-card-foreground")}>
                    {todo.title}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{venue?.name}</span>
                  {contact && (
                    <>
                      <span>·</span>
                      <span>{contact.name}</span>
                    </>
                  )}
                </div>
              </div>
              <span className={cn("text-xs font-medium", dueInfo.className)}>{dueInfo.text}</span>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
