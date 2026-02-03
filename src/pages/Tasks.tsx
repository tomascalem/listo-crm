import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { Sidebar } from "@/components/crm/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Bell, Search, Calendar, CheckCircle2, Circle } from "lucide-react"
import { todos, getVenueById, getUserById, getContactById } from "@/lib/mock-data"

export default function Tasks() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      const matchesSearch = todo.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "completed" && todo.completed) ||
        (statusFilter === "pending" && !todo.completed)
      const matchesPriority = priorityFilter === "all" || todo.priority === priorityFilter
      return matchesSearch && matchesStatus && matchesPriority
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  }, [searchQuery, statusFilter, priorityFilter])

  const stats = {
    total: todos.length,
    pending: todos.filter(t => !t.completed).length,
    overdue: todos.filter(t => !t.completed && new Date(t.dueDate) < new Date()).length,
    completed: todos.filter(t => t.completed).length,
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Tasks</h1>
              <p className="text-sm text-muted-foreground">
                {stats.pending} pending · {stats.overdue} overdue
              </p>
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-semibold">{stats.total}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-semibold text-chart-3">{stats.pending}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-semibold text-destructive">{stats.overdue}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-semibold text-success">{stats.completed}</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-3 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {filteredTodos.map((todo) => {
              const venue = getVenueById(todo.venueId)
              const assignee = getUserById(todo.assignedTo)
              const contact = todo.contactId ? getContactById(todo.contactId) : null
              const isOverdue = !todo.completed && new Date(todo.dueDate) < new Date()

              return (
                <Card key={todo.id} className={todo.completed ? "opacity-60" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="pt-0.5">
                        {todo.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-success" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className={`font-medium ${todo.completed ? "line-through" : ""}`}>
                            {todo.title}
                          </p>
                          <Badge variant={todo.priority === "high" ? "destructive" : todo.priority === "medium" ? "default" : "secondary"}>
                            {todo.priority}
                          </Badge>
                        </div>
                        {todo.description && (
                          <p className="text-sm text-muted-foreground mt-1">{todo.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          {venue && (
                            <Link to={`/venues/${venue.id}`} className="hover:text-primary">
                              {venue.name}
                            </Link>
                          )}
                          {assignee && <span>Assigned to {assignee.name}</span>}
                          <span className={`flex items-center gap-1 ${isOverdue ? "text-destructive" : ""}`}>
                            <Calendar className="h-4 w-4" />
                            {new Date(todo.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
