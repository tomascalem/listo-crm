
import { useState } from "react"
import { Check, Circle, Plus, Calendar, User, MoreHorizontal, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { getVenueById, getContactById, getUserById } from "@/lib/mock-data"
import type { Todo } from "@/lib/mock-data"

interface TodosListProps {
  todos: Todo[]
  compact?: boolean
}

const priorityConfig = {
  high: { label: "High", className: "bg-destructive/20 text-destructive border-destructive/30" },
  medium: { label: "Medium", className: "bg-warning/20 text-warning border-warning/30" },
  low: { label: "Low", className: "bg-muted text-muted-foreground border-muted" },
}

function formatDueDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return { text: "Overdue", className: "text-destructive", isOverdue: true }
  if (diffDays === 0) return { text: "Today", className: "text-warning", isOverdue: false }
  if (diffDays === 1) return { text: "Tomorrow", className: "text-card-foreground", isOverdue: false }
  if (diffDays < 7) return { text: `In ${diffDays} days`, className: "text-muted-foreground", isOverdue: false }
  return { 
    text: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }), 
    className: "text-muted-foreground", 
    isOverdue: false 
  }
}

function TodoItem({ todo, onToggle }: { todo: Todo; onToggle: (id: string) => void }) {
  const venue = todo.venueId ? getVenueById(todo.venueId) : null
  const contact = todo.contactId ? getContactById(todo.contactId) : null
  const assignee = getUserById(todo.assignedTo)
  const dueInfo = formatDueDate(todo.dueDate)
  const priority = priorityConfig[todo.priority]

  return (
    <div className={cn(
      "flex items-start gap-3 rounded-lg border border-border p-4 transition-all",
      todo.completed ? "bg-muted/30 opacity-60" : "bg-card hover:bg-secondary/30"
    )}>
      <Checkbox
        checked={todo.completed}
        onCheckedChange={() => onToggle(todo.id)}
        className="mt-1"
      />
      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className={cn(
              "font-medium",
              todo.completed ? "line-through text-muted-foreground" : "text-card-foreground"
            )}>
              {todo.title}
            </p>
            {todo.description && (
              <p className="text-sm text-muted-foreground mt-1">{todo.description}</p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Reschedule</DropdownMenuItem>
              <DropdownMenuItem>Change assignee</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={cn("text-xs", priority.className)}>
            {priority.label}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {venue?.name}
          </Badge>
          {contact && (
            <Badge variant="secondary" className="text-xs">
              {contact.name}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className={cn("flex items-center gap-1", dueInfo.className)}>
            <Calendar className="h-3 w-3" />
            {dueInfo.text}
          </span>
          {assignee && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {assignee.name}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export function TodosList({ todos, compact }: TodosListProps) {
  const [completedIds, setCompletedIds] = useState<Set<string>>(
    new Set(todos.filter((t) => t.completed).map((t) => t.id))
  )
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("pending")
  const [priorityFilter, setPriorityFilter] = useState<"all" | "high" | "medium" | "low">("all")

  const toggleTodo = (id: string) => {
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

  // Apply filters
  let filteredTodos = todos.map((t) => ({
    ...t,
    completed: completedIds.has(t.id),
  }))

  if (filter === "pending") {
    filteredTodos = filteredTodos.filter((t) => !t.completed)
  } else if (filter === "completed") {
    filteredTodos = filteredTodos.filter((t) => t.completed)
  }

  if (priorityFilter !== "all") {
    filteredTodos = filteredTodos.filter((t) => t.priority === priorityFilter)
  }

  // Sort by due date, overdue first
  filteredTodos.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })

  const displayTodos = compact ? filteredTodos.slice(0, 5) : filteredTodos

  if (compact) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-medium text-card-foreground">
            Tasks ({todos.filter((t) => !completedIds.has(t.id)).length})
          </CardTitle>
          <Button size="sm" variant="ghost" className="text-muted-foreground">
            View all
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {displayTodos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center gap-3 rounded-lg p-2 hover:bg-secondary/50 transition-colors"
            >
              <Checkbox
                checked={completedIds.has(todo.id)}
                onCheckedChange={() => toggleTodo(todo.id)}
              />
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm truncate",
                  completedIds.has(todo.id) ? "line-through text-muted-foreground" : "text-card-foreground"
                )}>
                  {todo.title}
                </p>
                <p className="text-xs text-muted-foreground">{todo.venueId ? getVenueById(todo.venueId)?.name : null}</p>
              </div>
              <span className={cn("text-xs", formatDueDate(todo.dueDate).className)}>
                {formatDueDate(todo.dueDate).text}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base font-medium text-card-foreground">
          Tasks ({filteredTodos.length})
        </CardTitle>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
            <SelectTrigger className="w-32 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as typeof priorityFilter)}>
            <SelectTrigger className="w-32 h-9">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayTodos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} onToggle={toggleTodo} />
        ))}
        {displayTodos.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No tasks found</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
