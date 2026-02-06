import { useState } from "react"
import { Link } from "react-router-dom"
import {
  CheckSquare,
  Check,
  Mail,
  Phone,
  FileText,
  Calendar,
  Clock,
  Bot,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  getTodosForUser,
  getVenueById,
  getContactById,
  type Todo,
} from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface TodoActionListProps {
  userId: string
  limit?: number
}

const taskTypeConfig: Record<
  Todo["type"],
  { icon: typeof Mail; label: string; color: string }
> = {
  email: { icon: Mail, label: "Email", color: "text-sky-500" },
  call: { icon: Phone, label: "Call", color: "text-emerald-500" },
  meeting: { icon: Calendar, label: "Meeting", color: "text-violet-500" },
  document: { icon: FileText, label: "Document", color: "text-amber-500" },
  other: { icon: CheckSquare, label: "Task", color: "text-muted-foreground" },
}

const sourceTypeIcons: Record<string, typeof Mail> = {
  email: Mail,
  call: Phone,
  meeting: Calendar,
  ai: Bot,
}

export function TodoActionList({ userId, limit = 5 }: TodoActionListProps) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [flashingIds, setFlashingIds] = useState<Set<string>>(new Set())
  const [animatingIds, setAnimatingIds] = useState<Set<string>>(new Set())
  const [enteringIds, setEnteringIds] = useState<Set<string>>(new Set())

  const allTodos = getTodosForUser(userId)
  const todos = allTodos
    .filter((t) => !t.completed && !completedIds.has(t.id))
    .slice(0, limit)

  const toggleComplete = (id: string) => {
    // Find which task will enter when this one is removed
    const visibleTodos = allTodos.filter((t) => !t.completed && !completedIds.has(t.id))
    const nextTask = visibleTodos[limit] // The task that will slide into view

    // Phase 1: Flash green
    setFlashingIds((prev) => new Set(prev).add(id))

    // Phase 2: After flash, start collapse animation
    setTimeout(() => {
      setAnimatingIds((prev) => new Set(prev).add(id))
    }, 150)

    // Phase 3: After collapse, clean up and mark complete
    setTimeout(() => {
      setFlashingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      setAnimatingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
      // Mark the next task as entering (for fade-in animation)
      if (nextTask) {
        setEnteringIds((prev) => new Set(prev).add(nextTask.id))
      }
      setCompletedIds((prev) => new Set(prev).add(id))
    }, 450)

    // Phase 4: Clear entering animation after it completes
    setTimeout(() => {
      if (nextTask) {
        setEnteringIds((prev) => {
          const next = new Set(prev)
          next.delete(nextTask.id)
          return next
        })
      }
    }, 750) // 450 + 300 for the enter animation
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
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              View all
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="px-3">
        {todos.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="h-12 w-12 mx-auto mb-3 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Check className="h-6 w-6 text-emerald-500" />
            </div>
            <p className="font-medium text-foreground">All tasks completed!</p>
            <p className="text-sm mt-1">Great work staying on top of things.</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {todos.map((todo, index) => {
              const venue = todo.venueId ? getVenueById(todo.venueId) : null
              const contact = todo.contactId
                ? getContactById(todo.contactId)
                : null
              const cfg = taskTypeConfig[todo.type]
              const Icon = cfg.icon
              const SourceIcon = todo.source
                ? sourceTypeIcons[todo.source.type]
                : null
              const isFlashing = flashingIds.has(todo.id)
              const isAnimating = animatingIds.has(todo.id)
              const isEntering = enteringIds.has(todo.id)

              return (
                <div
                  key={todo.id}
                  className={cn(
                    "group flex items-start gap-3 py-3 px-3 rounded-lg overflow-hidden transition-all duration-300 ease-out",
                    !isFlashing && !isAnimating && !isEntering && "hover:bg-muted/40",
                    isFlashing && !isAnimating && "bg-emerald-500/20",
                    isAnimating && "bg-emerald-500/20 -translate-y-2 opacity-0 h-0 py-0 my-0",
                    isEntering && "animate-fade-in-up"
                  )}
                >
                  {/* Checkbox */}
                  <button
                    type="button"
                    onClick={() => toggleComplete(todo.id)}
                    aria-label="Mark as complete"
                    className="mt-0.5 h-[18px] w-[18px] rounded-full border-[1.5px] border-muted-foreground/30 flex items-center justify-center shrink-0 transition-all cursor-pointer hover:border-emerald-400 hover:bg-emerald-500/10"
                  />

                  {/* Icon */}
                  <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", cfg.color)} />

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm leading-snug font-medium text-foreground truncate">
                        {todo.title}
                      </p>
                      {todo.dueTime && (
                        <span className="text-[11px] text-muted-foreground flex items-center gap-0.5 shrink-0">
                          <Clock className="h-3 w-3" />
                          {todo.dueTime}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                      {venue && (
                        <Link
                          to={`/venues/${venue.id}`}
                          className="text-[11px] text-muted-foreground hover:text-primary transition-colors"
                        >
                          {venue.name}
                        </Link>
                      )}
                      {contact && (
                        <span className="text-[11px] text-muted-foreground">
                          {contact.name}
                        </span>
                      )}
                      {todo.source && SourceIcon && (
                        <span className="text-[11px] text-muted-foreground/70 flex items-center gap-1">
                          {todo.source.type === "ai" ? (
                            <Bot className="h-3 w-3" />
                          ) : (
                            <SourceIcon className="h-3 w-3" />
                          )}
                          {todo.source.label}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quick action on hover */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10"
                    onClick={() => toggleComplete(todo.id)}
                  >
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Done
                  </Button>
                </div>
              )
            })}
            {/* Remaining count */}
            {allTodos.filter((t) => !t.completed && !completedIds.has(t.id)).length > limit && (
              <div className="px-3 py-2 text-xs text-muted-foreground">
                +{allTodos.filter((t) => !t.completed && !completedIds.has(t.id)).length - limit} more tasks remaining
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
