import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { Link } from "react-router-dom"
import { Sidebar } from "@/components/crm/sidebar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Mail,
  Phone,
  Calendar,
  FileText,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  ArrowUpToLine,
  Sparkles,
  Circle,
  Check,
  Send,
  Copy,
  Pencil,
  Trash2,
  UserPlus,
  Users,
  ExternalLink,
  X,
  Search,
  Bot,
  Clock,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTodos } from "@/queries/todos"
import { useUsers } from "@/queries/users"
import { AddTaskModal } from "@/components/crm/modals/add-task-modal"
import confetti from "canvas-confetti"

type TaskType = "email" | "call" | "meeting" | "document" | "follow-up" | "other"

interface Todo {
  id: string
  title: string
  description?: string
  type: TaskType
  priority: "high" | "medium" | "low"
  dueDate: string
  dueTime?: string
  completed: boolean
  assignedTo: string
  createdBy: string
  venueId?: string
  contactId?: string
  sharedWith?: string[]
  source?: {
    type: "email" | "call" | "meeting" | "ai" | "manual"
    label: string
    interactionId?: string
  }
  venue?: any
  contact?: any
  assignee?: any
  creator?: any
}

const taskTypeConfig: Record<TaskType, { icon: typeof Mail; label: string; color: string }> = {
  email: { icon: Mail, label: "Email", color: "text-sky-600 dark:text-sky-400" },
  call: { icon: Phone, label: "Call", color: "text-emerald-600 dark:text-emerald-400" },
  meeting: { icon: Calendar, label: "Meeting", color: "text-violet-600 dark:text-violet-400" },
  document: { icon: FileText, label: "Document", color: "text-amber-600 dark:text-amber-400" },
  "follow-up": { icon: RotateCcw, label: "Follow-up", color: "text-orange-500 dark:text-orange-400" },
  other: { icon: Circle, label: "Task", color: "text-muted-foreground" },
}

const sourceTypeIcons: Record<string, typeof Mail> = {
  email: Mail,
  call: Phone,
  meeting: Calendar,
  ai: Bot,
  manual: Circle,
}

function formatDateLabel(date: Date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const compare = new Date(date)
  compare.setHours(0, 0, 0, 0)
  const diff = Math.floor((compare.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return "Today"
  if (diff === 1) return "Tomorrow"
  if (diff === -1) return "Yesterday"
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}

function formatFullDate(date: Date) {
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
}

/* ------------------------------------------------------------------ */
/*  Team Member Popover                                               */
/* ------------------------------------------------------------------ */
function TeamMemberPopover({
  todo,
  sharedUsers,
  onShare,
  onRemoveShare,
  users = [],
  getUserById,
}: {
  todo: Todo
  sharedUsers: any[]
  onShare?: (userId: string) => void
  onRemoveShare?: (userId: string) => void
  users?: any[]
  getUserById: (id: string) => any
}) {
  const [search, setSearch] = useState("")
  const [recentlyAdded, setRecentlyAdded] = useState<Set<string>>(new Set())

  const owner = getUserById(todo.assignedTo)
  const sharedUserIds = new Set(todo.sharedWith ?? [])

  // All team members except owner, sorted: added first, then available
  const allTeamMembers = users.filter((u: any) => u.id !== todo.assignedTo)
  const filteredMembers = allTeamMembers.filter(
    (u: any) => u.name.toLowerCase().includes(search.toLowerCase()) ||
           u.email.toLowerCase().includes(search.toLowerCase())
  )

  const handleToggle = (userId: string) => {
    if (sharedUserIds.has(userId)) {
      onRemoveShare?.(userId)
    } else {
      onShare?.(userId)
      setRecentlyAdded((prev) => new Set(prev).add(userId))
      setTimeout(() => {
        setRecentlyAdded((prev) => {
          const next = new Set(prev)
          next.delete(userId)
          return next
        })
      }, 1500)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 data-[state=open]:bg-muted"
          onClick={(e) => e.stopPropagation()}
        >
          <UserPlus className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-72 p-0"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with search */}
        <div className="p-3 border-b border-border space-y-2.5">
          <div>
            <h4 className="text-sm font-medium">Collaborators</h4>
            <p className="text-xs text-muted-foreground">Add team members to this task</p>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search team members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 pl-8 text-sm"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        {/* Scrollable list */}
        <div className="max-h-72 overflow-y-auto">
          {/* Owner - always visible at top */}
          {owner && (!search || owner.name.toLowerCase().includes(search.toLowerCase())) && (
            <div className="px-3 py-2 flex items-center gap-2.5 bg-muted/30">
              <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                <AvatarImage src={owner.avatarUrl} alt={owner.name} />
                <AvatarFallback className="text-[10px] bg-primary/10 text-primary">{owner.avatar}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{owner.name}</p>
                <p className="text-[10px] text-muted-foreground">{owner.email}</p>
              </div>
              <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-primary/10 text-primary border-0">
                Owner
              </Badge>
            </div>
          )}

          {/* Team members list */}
          {filteredMembers.length > 0 ? (
            <div className="py-1">
              {filteredMembers.map((user) => {
                const isAdded = sharedUserIds.has(user.id)
                const justAdded = recentlyAdded.has(user.id)

                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => handleToggle(user.id)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 hover:bg-muted/50 transition-all text-left group/member",
                      justAdded && "bg-emerald-500/10",
                      isAdded && !justAdded && "bg-primary/5"
                    )}
                  >
                    <div className="relative">
                      <Avatar className={cn("h-8 w-8", isAdded && "ring-2 ring-primary/30")}>
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback className="text-[10px]">{user.avatar}</AvatarFallback>
                      </Avatar>
                      {isAdded && (
                        <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary flex items-center justify-center ring-2 ring-background">
                          <Check className="h-2.5 w-2.5 text-primary-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                    </div>
                    {justAdded ? (
                      <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-emerald-500/15 text-emerald-600 border-0">
                        <Check className="h-3 w-3 mr-0.5" />
                        Added
                      </Badge>
                    ) : isAdded ? (
                      <Badge
                        variant="secondary"
                        className="text-[10px] h-5 px-1.5 bg-primary/10 text-primary border-0"
                      >
                        Added
                      </Badge>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10"
                        onClick={(e) => { e.stopPropagation(); handleToggle(user.id) }}
                      >
                        Add
                      </Button>
                    )}
                  </button>
                )
              })}
            </div>
          ) : search ? (
            <div className="px-3 py-8 text-center">
              <Search className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No results for "{search}"</p>
            </div>
          ) : null}
        </div>

        {/* Footer showing count */}
        {sharedUserIds.size > 0 && (
          <div className="px-3 py-2 border-t border-border bg-muted/30">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{sharedUserIds.size}</span> collaborator{sharedUserIds.size !== 1 ? 's' : ''} added
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

/* ------------------------------------------------------------------ */
/*  Task Row                                                          */
/* ------------------------------------------------------------------ */
function TaskRow({
  todo,
  done,
  onToggle,
  onDraft,
  onPull,
  onDelete,
  onShare,
  onRemoveShare,
  onClick,
  isFuture,
  variant = "own",
  isFlashing = false,
  isAnimating = false,
  users = [],
  getUserById,
}: {
  todo: Todo
  done: boolean
  onToggle: () => void
  onDraft?: () => void
  onPull?: () => void
  onDelete?: () => void
  onShare?: (userId: string) => void
  onRemoveShare?: (userId: string) => void
  onClick?: () => void
  isFuture?: boolean
  variant?: "own" | "shared"
  isFlashing?: boolean
  isAnimating?: boolean
  users?: any[]
  getUserById: (id: string) => any
}) {
  const venue = todo.venue
  const contact = todo.contact
  const cfg = taskTypeConfig[todo.type] || taskTypeConfig.other
  const Icon = cfg.icon
  const assignee = variant === "shared" ? getUserById(todo.assignedTo) : null
  const sharedUsers = todo.sharedWith?.map((id: string) => getUserById(id)).filter(Boolean) ?? []
  const SourceIcon = todo.source ? sourceTypeIcons[todo.source.type] : null

  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 py-3 px-3 rounded-lg overflow-hidden",
        // Normal states
        !isFlashing && !isAnimating && (done ? "opacity-60 hover:opacity-80" : "hover:bg-muted/40"),
        !isFlashing && !isAnimating && "max-h-40 transition-colors duration-150",
        // Flashing state - green highlight
        isFlashing && !isAnimating && "bg-emerald-500/20 max-h-40 transition-colors duration-150",
        // Animating state - collapse and fade
        isAnimating && "bg-emerald-500/20 max-h-0 py-0 my-0 opacity-0 transition-all duration-300 ease-out",
      )}
    >
      {/* Checkbox */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onToggle() }}
        aria-label={done ? "Mark as incomplete" : "Mark as complete"}
        className={cn(
          "mt-0.5 h-[18px] w-[18px] rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-all cursor-pointer",
          done
            ? "bg-emerald-500 border-emerald-500 hover:bg-emerald-400 hover:border-emerald-400"
            : "border-muted-foreground/30 hover:border-emerald-400 hover:bg-emerald-500/10",
        )}
      >
        {done && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
      </button>

      {/* Icon */}
      <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", done ? "text-muted-foreground" : cfg.color)} />

      {/* Content - clickable area */}
      <button
        type="button"
        className="flex-1 min-w-0 text-left cursor-pointer"
        onClick={onClick}
      >
        <div className="flex items-center gap-2">
          <p className={cn(
            "text-sm leading-snug",
            done ? "line-through text-muted-foreground" : "text-foreground font-medium",
          )}>
            {todo.title}
          </p>
          {todo.dueTime && !done && (
            <span className="text-[11px] text-muted-foreground flex items-center gap-0.5 shrink-0">
              <Clock className="h-3 w-3" />
              {todo.dueTime}
            </span>
          )}
        </div>

        {todo.description && (
          <p className={cn("text-xs mt-0.5 line-clamp-1", done ? "text-muted-foreground/60" : "text-muted-foreground")}>
            {todo.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
          {venue && (
            <span className="text-[11px] text-muted-foreground">{venue.name}</span>
          )}
          {contact && (
            <span className="text-[11px] text-muted-foreground">{contact.name}</span>
          )}
          {variant === "shared" && assignee && (
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Avatar className="h-3.5 w-3.5">
                <AvatarFallback className="text-[7px] bg-muted">{assignee.avatar}</AvatarFallback>
              </Avatar>
              {assignee.name}
            </span>
          )}
          {variant === "own" && sharedUsers.length > 0 && (
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <Users className="h-3 w-3" />
              {sharedUsers.length <= 2
                ? sharedUsers.map((u) => u!.name.split(" ")[0]).join(", ")
                : `${sharedUsers.slice(0, 2).map((u) => u!.name.split(" ")[0]).join(", ")} +${sharedUsers.length - 2}`}
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
      </button>

      {/* Hover actions - top right */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 has-[[data-state=open]]:opacity-100 transition-opacity shrink-0">
        {isFuture && !done && onPull && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => { e.stopPropagation(); onPull() }}
            title="Pull to today"
          >
            <ArrowUpToLine className="h-3.5 w-3.5" />
          </Button>
        )}
        <TeamMemberPopover
          todo={todo}
          sharedUsers={sharedUsers}
          onShare={onShare}
          onRemoveShare={onRemoveShare}
          users={users}
          getUserById={getUserById}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 data-[state=open]:bg-muted" onClick={(e) => e.stopPropagation()}>
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem>
              <Pencil className="h-3.5 w-3.5 mr-2" />
              Edit task
            </DropdownMenuItem>
            {isFuture && !done && (
              <DropdownMenuItem onClick={onPull}>
                <ArrowUpToLine className="h-3.5 w-3.5 mr-2" />
                Pull to today
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={onDelete}>
              <Trash2 className="h-3.5 w-3.5 mr-2" />
              Delete task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Draft button - bottom right */}
      {todo.type === "email" && !done && onDraft && (
        <Button
          variant="ghost"
          size="sm"
          className="group/draft absolute bottom-1.5 right-2 h-6 px-2 text-xs gap-1.5 opacity-0 group-hover:opacity-100 transition-all hover:bg-violet-500/10 hover:text-violet-600 dark:hover:text-violet-400"
          onClick={(e) => { e.stopPropagation(); onDraft() }}
        >
          <Sparkles className="h-3 w-3 group-hover/draft:animate-pulse" />
          <span className="relative overflow-hidden">
            Draft
            <span className="absolute inset-0 -translate-x-full group-hover/draft:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-violet-400/30 to-transparent" />
          </span>
        </Button>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Task Detail Panel                                                 */
/* ------------------------------------------------------------------ */
function TaskDetail({
  todo,
  onClose,
  onToggle,
  onDraft,
  done,
  getUserById,
}: {
  todo: Todo
  onClose: () => void
  onToggle: () => void
  onDraft: () => void
  done: boolean
  getUserById: (id: string) => any
}) {
  const venue = todo.venue
  const contact = todo.contact
  const cfg = taskTypeConfig[todo.type] || taskTypeConfig.other
  const Icon = cfg.icon
  const sharedUsers = todo.sharedWith?.map((id: string) => getUserById(id)).filter(Boolean) ?? []
  const creator = getUserById(todo.createdBy)
  const SourceIcon = todo.source ? sourceTypeIcons[todo.source.type] : null

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={onToggle}
              className={cn(
                "mt-1 h-5 w-5 rounded-full border-[1.5px] flex items-center justify-center shrink-0 cursor-pointer transition-all",
                done
                  ? "bg-emerald-500 border-emerald-500 hover:bg-emerald-400"
                  : "border-muted-foreground/30 hover:border-emerald-400 hover:bg-emerald-500/10",
              )}
            >
              {done && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
            </button>
            <div>
              <DialogTitle className={cn("text-base", done && "line-through text-muted-foreground")}>
                {todo.title}
              </DialogTitle>
              <DialogDescription className="mt-1">
                {todo.description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 pt-3 border-t border-border">
          {/* Type */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Type</span>
            <span className="flex items-center gap-1.5 text-sm">
              <Icon className={cn("h-3.5 w-3.5", cfg.color)} />
              {cfg.label}
            </span>
          </div>

          {/* Priority */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Priority</span>
            <Badge variant="secondary" className={cn("text-xs capitalize",
              todo.priority === "high" && "bg-amber-500/10 text-amber-700 dark:text-amber-400",
              todo.priority === "medium" && "bg-sky-500/10 text-sky-700 dark:text-sky-400",
              todo.priority === "low" && "bg-muted text-muted-foreground",
            )}>
              {todo.priority}
            </Badge>
          </div>

          {/* Due */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Due</span>
            <span className="text-sm">
              {new Date(todo.dueDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              {todo.dueTime && <span className="text-muted-foreground ml-1.5">{todo.dueTime}</span>}
            </span>
          </div>

          {/* Venue */}
          {venue && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Venue</span>
              <Link to={`/venues/${venue.id}`} className="text-sm text-primary hover:underline">{venue.name}</Link>
            </div>
          )}

          {/* Contact */}
          {contact && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Contact</span>
              <Link to={`/contacts/${contact.id}`} className="text-sm text-primary hover:underline">{contact.name}</Link>
            </div>
          )}

          {/* Created by */}
          {creator && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Created by</span>
              <span className="flex items-center gap-1.5 text-sm">
                <Avatar className="h-4 w-4">
                  <AvatarFallback className="text-[8px] bg-muted">{creator.avatar}</AvatarFallback>
                </Avatar>
                {creator.name}
              </span>
            </div>
          )}

          {/* Shared with */}
          {sharedUsers.length > 0 && (
            <div className="flex items-start justify-between">
              <span className="text-xs text-muted-foreground pt-0.5">Shared with</span>
              <div className="flex flex-wrap items-center gap-1 justify-end max-w-[200px]">
                {sharedUsers.slice(0, 4).map((u) => (
                  <Avatar key={u!.id} className="h-6 w-6 ring-2 ring-background" title={u!.name}>
                    <AvatarImage src={u!.avatarUrl} alt={u!.name} />
                    <AvatarFallback className="text-[9px] bg-muted">{u!.avatar}</AvatarFallback>
                  </Avatar>
                ))}
                {sharedUsers.length > 4 && (
                  <span className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-medium text-muted-foreground ring-2 ring-background">
                    +{sharedUsers.length - 4}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Source / Origin */}
          {todo.source && SourceIcon && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Origin</span>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                {todo.source.type === "ai" ? <Bot className="h-3.5 w-3.5" /> : <SourceIcon className="h-3.5 w-3.5" />}
                {todo.source.label}
                {todo.source.interactionId && (
                  <ExternalLink className="h-3 w-3 text-primary" />
                )}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-3 border-t border-border">
          {todo.type === "email" && !done && (
            <Button size="sm" className="flex-1" onClick={onDraft}>
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Draft email
            </Button>
          )}
          <Button
            variant={done ? "default" : "outline"}
            size="sm"
            className={cn("flex-1", !done && "bg-transparent")}
            onClick={onToggle}
          >
            {done ? "Mark incomplete" : "Mark complete"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/*  Email Draft Modal                                                 */
/* ------------------------------------------------------------------ */
function EmailDraftModal({ open, onClose, todo }: { open: boolean; onClose: () => void; todo: Todo | null }) {
  const contact = todo?.contact
  const venue = todo?.venue
  const [copied, setCopied] = useState(false)

  const generateDraft = useCallback(() => {
    if (!contact) return { subject: "", body: "" }
    const first = contact.name.split(" ")[0]

    if (todo?.title.toLowerCase().includes("proposal") || todo?.title.toLowerCase().includes("pricing") || todo?.title.toLowerCase().includes("terms") || todo?.title.toLowerCase().includes("timeline")) {
      return {
        subject: `Updated Proposal for ${venue?.name || "Your Venue"}`,
        body: `Hi ${first},\n\nI hope this finds you well. Following up on our recent conversation, I wanted to share the updated proposal we discussed.\n\nKey highlights of the revised offer:\n- Customized pricing structure tailored to your requirements\n- Flexible implementation timeline aligned with your event calendar\n- Dedicated support and onboarding team during rollout\n- Performance-based terms with clear KPIs\n\nI've attached the full proposal document for your review. I'd love to schedule a 30-minute call later this week to walk through it together.\n\nLooking forward to hearing your thoughts.\n\nBest regards,\nSarah Chen\nAccount Director | List`,
      }
    }

    if (todo?.title.toLowerCase().includes("follow up") || todo?.title.toLowerCase().includes("check") || todo?.title.toLowerCase().includes("specs") || todo?.title.toLowerCase().includes("dashboard")) {
      return {
        subject: `Following Up - ${venue?.name || "Next Steps"}`,
        body: `Hi ${first},\n\nI wanted to touch base and see if you had any updates from your end since we last spoke.\n\nI have the details you requested ready to go and would love to walk you through them at your convenience.\n\nWould a 20-minute call this week work for you? I'm flexible on timing.\n\nBest regards,\nSarah Chen\nAccount Director | List`,
      }
    }

    if (todo?.title.toLowerCase().includes("thank")) {
      return {
        subject: "Thank You!",
        body: `Hi ${first},\n\nI just wanted to take a moment to thank you for your help recently. Your support in moving things forward has made a real difference, and it hasn't gone unnoticed.\n\nLooking forward to continuing our work together.\n\nWarm regards,\nSarah Chen\nAccount Director | List`,
      }
    }

    if (todo?.title.toLowerCase().includes("intro") || todo?.title.toLowerCase().includes("outreach")) {
      return {
        subject: `Introduction - List for ${venue?.name || "Your Venue"}`,
        body: `Hi ${first},\n\nMy name is Sarah Chen and I lead accounts at List, a mobile ordering and fan experience platform built specifically for live entertainment venues.\n\nWe currently work with venues like Madison Square Garden, The Forum, and Ball Arena, helping them reduce concession wait times by up to 60% while increasing per-cap revenue.\n\nI'd love to learn more about your current setup at ${venue?.name || "your venue"} and see if there might be a fit. Would you have 20 minutes this week for a quick call?\n\nBest regards,\nSarah Chen\nAccount Director | List`,
      }
    }

    return {
      subject: `${venue?.name || "List"} - Quick Update`,
      body: `Hi ${first},\n\nI wanted to reach out regarding ${todo?.description || "our ongoing discussions"}.\n\nPlease let me know if you have any questions or would like to schedule a call to discuss further.\n\nBest regards,\nSarah Chen\nAccount Director | List`,
    }
  }, [todo, contact, venue])

  const draft = generateDraft()
  const [emailBody, setEmailBody] = useState(draft.body)

  useEffect(() => {
    if (open) { setEmailBody(generateDraft().body); setCopied(false) }
  }, [todo, open, generateDraft])

  const handleCopy = () => {
    navigator.clipboard.writeText(emailBody)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Mail className="h-4 w-4" />
            Draft Email
          </DialogTitle>
          <DialogDescription>
            AI-generated draft based on your task context. Edit before sending.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground w-12">To</span>
            <span className="text-sm">{contact?.name} ({contact?.email || "email@example.com"})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground w-12">Subject</span>
            <span className="text-sm">{draft.subject}</span>
          </div>
          <Textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)} className="min-h-[240px] text-sm leading-relaxed" />
        </div>
        <div className="flex justify-between pt-2">
          <Button variant="outline" size="sm" onClick={handleCopy} className="bg-transparent">
            {copied ? <Check className="h-3.5 w-3.5 mr-1.5" /> : <Copy className="h-3.5 w-3.5 mr-1.5" />}
            {copied ? "Copied" : "Copy"}
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="bg-transparent">Cancel</Button>
            <Button size="sm" onClick={onClose}>
              <Send className="h-3.5 w-3.5 mr-1.5" />
              Open in email
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/*  Success Screen                                                    */
/* ------------------------------------------------------------------ */
function SuccessModal({ open, onClose, onWorkAhead, tomorrowCount }: { open: boolean; onClose: () => void; onWorkAhead: () => void; tomorrowCount: number }) {
  const fired = useRef(false)
  useEffect(() => {
    if (open && !fired.current) {
      fired.current = true
      confetti({ particleCount: 80, spread: 60, origin: { y: 0.65 } })
    }
    if (!open) fired.current = false
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm text-center">
        <div className="flex flex-col items-center py-4">
          <div className="h-16 w-16 rounded-full bg-emerald-500/15 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
          </div>
          <DialogHeader className="text-center">
            <DialogTitle className="text-xl">All done for today!</DialogTitle>
            <DialogDescription className="mt-1.5">
              {tomorrowCount > 0
                ? `You have ${tomorrowCount} task${tomorrowCount === 1 ? "" : "s"} lined up for tomorrow.`
                : "No tasks scheduled for tomorrow either. Enjoy your day!"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-5">
            <Button variant="outline" size="sm" onClick={onClose} className="bg-transparent">Close</Button>
            {tomorrowCount > 0 && <Button size="sm" onClick={onWorkAhead}>Work ahead</Button>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                         */
/* ------------------------------------------------------------------ */
export default function TasksPage() {
  const userId = "user-1"
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  // Fetch data from API
  const { data: allTodos = [], isLoading: todosLoading } = useTodos()
  const { data: users = [] } = useUsers()

  // Helper to get user by ID
  const getUserById = useCallback((id: string) => {
    return users.find((u: any) => u.id === id)
  }, [users])

  const [tab, setTab] = useState<"mine" | "shared">("mine")
  const [selectedDate, setSelectedDate] = useState(now)
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [pulled, setPulled] = useState<Set<string>>(new Set())
  const [deleted, setDeleted] = useState<Set<string>>(new Set())
  const [sharedExtra, setSharedExtra] = useState<Record<string, string[]>>({})
  const [flashingIds, setFlashingIds] = useState<Set<string>>(new Set())
  const [animatingIds, setAnimatingIds] = useState<Set<string>>(new Set())
  const [showSuccess, setShowSuccess] = useState(false)
  const [emailTodo, setEmailTodo] = useState<Todo | null>(null)
  const [detailTodo, setDetailTodo] = useState<Todo | null>(null)

  // Initialize completedIds from API data
  useEffect(() => {
    if (allTodos.length > 0) {
      setCompletedIds(new Set(allTodos.filter((t: any) => t.completed).map((t: any) => t.id)))
    }
  }, [allTodos])

  const isToday = selectedDate.toDateString() === now.toDateString()
  const isFuture = selectedDate.getTime() > now.getTime()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)

  // Build effective todo list
  const effectiveTodos = useMemo(() => allTodos
    .filter((t: any) => !deleted.has(t.id))
    .map((t: any) => ({
      ...t,
      completed: completedIds.has(t.id),
      dueDate: pulled.has(t.id) ? now.toISOString().split("T")[0] : t.dueDate,
      sharedWith: [...(t.sharedWith ?? []), ...(sharedExtra[t.id] ?? [])],
    })), [allTodos, deleted, completedIds, pulled, sharedExtra, now])

  const forDate = (date: Date, includeOverdue: boolean) =>
    effectiveTodos.filter((t: any) => {
      const d = new Date(t.dueDate + "T12:00:00")
      d.setHours(0, 0, 0, 0)
      if (includeOverdue && date.getTime() === now.getTime()) return d <= date
      return d.toDateString() === date.toDateString()
    })

  // Loading state
  if (todosLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="pl-64 flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </div>
    )
  }

  // My tasks for current date
  const myAll = forDate(selectedDate, isToday).filter((t: any) => t.assignedTo === userId)
  const myPending = myAll.filter((t: any) => !t.completed)
  const myDone = myAll.filter((t: any) => t.completed)
  const overdue = isToday
    ? myPending.filter((t: any) => {
        const d = new Date(t.dueDate + "T12:00:00"); d.setHours(0, 0, 0, 0)
        return d < now
      })
    : []
  const dateTasks = myPending.filter((t: any) => {
    const d = new Date(t.dueDate + "T12:00:00"); d.setHours(0, 0, 0, 0)
    return d.toDateString() === selectedDate.toDateString()
  })

  // Shared with me for current date
  const shared = forDate(selectedDate, isToday).filter(
    (t: any) => t.assignedTo !== userId && t.sharedWith?.includes(userId),
  )
  const sharedPending = shared.filter((t: any) => !t.completed)

  // Tomorrow counts
  const tomorrowMy = forDate(tomorrow, false).filter((t: any) => t.assignedTo === userId && !t.completed)
  const tomorrowShared = forDate(tomorrow, false).filter(
    (t: any) => t.assignedTo !== userId && t.sharedWith?.includes(userId) && !t.completed,
  )

  const allDoneToday = isToday && myPending.length === 0 && myAll.length > 0

  // Toggle with animation
  const toggle = (id: string) => {
    const wasCompleted = completedIds.has(id)

    if (wasCompleted) {
      // Uncompleting - just remove from completed, no animation
      setCompletedIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    } else {
      // Completing - two phase animation:
      // Phase 1: Flash green
      setFlashingIds((prev) => new Set(prev).add(id))

      // Phase 2: After flash, start collapse animation
      setTimeout(() => {
        setAnimatingIds((prev) => new Set(prev).add(id))
      }, 150) // Brief green flash

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
        setCompletedIds((prev) => {
          const next = new Set(prev)
          next.add(id)
          // Check if all done for today
          if (isToday && tab === "mine") {
            const still = myPending.filter((t: any) => t.id !== id && !next.has(t.id))
            if (still.length === 0 && myPending.length > 0) {
              setTimeout(() => setShowSuccess(true), 200)
            }
          }
          return next
        })
      }, 450) // Flash (150) + collapse animation (300)
    }
  }

  const pull = (id: string) => setPulled((p) => new Set(p).add(id))
  const del = (id: string) => { setDeleted((p) => new Set(p).add(id)); setDetailTodo(null) }
  const share = (todoId: string, targetUserId: string) =>
    setSharedExtra((prev) => ({ ...prev, [todoId]: [...(prev[todoId] ?? []), targetUserId] }))

  const removeShare = (todoId: string, targetUserId: string) =>
    setSharedExtra((prev) => ({
      ...prev,
      [todoId]: (prev[todoId] ?? []).filter((id) => id !== targetUserId),
    }))

  const nav = (dir: number) => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + dir)
    setSelectedDate(d)
  }

  // Inactive tab badge counts (pending tasks on the date being viewed)
  const inactiveMineBadge = tab === "shared" ? myPending.length + overdue.length : 0
  const inactiveSharedBadge = tab === "mine" ? sharedPending.length : 0

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 backdrop-blur px-6">
          <h1 className="text-lg font-semibold text-foreground">Tasks</h1>
          <AddTaskModal />
        </header>

        <div className="max-w-2xl mx-auto px-6 py-6 space-y-5">
          {/* ---- Date navigation (centered) ---- */}
          <div className="flex items-center justify-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => nav(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center min-w-[140px]">
              <h2 className="text-lg font-semibold leading-tight">{formatDateLabel(selectedDate)}</h2>
              <p className="text-[11px] text-muted-foreground">{formatFullDate(selectedDate)}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => nav(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            {!isToday && (
              <button type="button" onClick={() => setSelectedDate(now)} className="ml-2 text-xs text-primary hover:underline">
                Back to today
              </button>
            )}
          </div>

          {/* ---- Tabs + Progress ---- */}
          <div className="flex items-center justify-between border-b border-border">
            <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setTab("mine")}
              className={cn(
                "relative px-4 py-2 text-sm font-medium transition-colors",
                tab === "mine" ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              My Tasks
              {inactiveMineBadge > 0 && (
                <span className="ml-2 inline-flex items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mr-1" />
                  <span className="text-xs text-muted-foreground">{inactiveMineBadge}</span>
                </span>
              )}
              {tab === "mine" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-full" />}
            </button>

            <button
              type="button"
              onClick={() => setTab("shared")}
              className={cn(
                "relative px-4 py-2 text-sm font-medium transition-colors",
                tab === "shared" ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              Shared with me
              {inactiveSharedBadge > 0 && (
                <span className="ml-2 inline-flex items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mr-1" />
                  <span className="text-xs text-muted-foreground">{inactiveSharedBadge}</span>
                </span>
              )}
              {tab === "shared" && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground rounded-full" />}
            </button>
            </div>

            {tab === "mine" && myAll.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground pb-0.5">
                <span>{myDone.length}/{myAll.length}</span>
                <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${(myDone.length / myAll.length) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* ================================================================ */}
          {/*  MY TASKS TAB                                                    */}
          {/* ================================================================ */}
          {tab === "mine" && (
            <div className="space-y-5">
              {/* All done banner */}
              {allDoneToday && (
                <Card className="border-emerald-500/20 bg-emerald-500/5">
                  <CardContent className="py-8 flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-emerald-500/15 flex items-center justify-center mb-3">
                      <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                    </div>
                    <p className="text-sm font-medium text-foreground">All done for today</p>
                    {tomorrowMy.length > 0 && (
                      <button type="button" onClick={() => nav(1)} className="text-xs text-primary hover:underline mt-1">
                        {tomorrowMy.length} task{tomorrowMy.length !== 1 && "s"} for tomorrow
                      </button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Overdue */}
              {overdue.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-2 px-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">Overdue</span>
                    <Badge className="h-4 min-w-4 px-1 text-[10px] bg-amber-500/15 text-amber-600 dark:text-amber-400 border-0">{overdue.length}</Badge>
                  </div>
                  <Card className="border-amber-500/20 py-2">
                    <CardContent className="p-1">
                      {overdue.map((t: any) => (
                        <TaskRow
                          key={t.id} todo={t} done={false}
                          onToggle={() => toggle(t.id)}
                          onClick={() => setDetailTodo(t)}
                          onDraft={t.type === "email" ? () => setEmailTodo(t) : undefined}
                          onDelete={() => del(t.id)}
                          onShare={(uid) => share(t.id, uid)}
                          onRemoveShare={(uid) => removeShare(t.id, uid)}
                          isFlashing={flashingIds.has(t.id)}
                          isAnimating={animatingIds.has(t.id)}
                          users={users}
                          getUserById={getUserById}
                        />
                      ))}
                    </CardContent>
                  </Card>
                </section>
              )}

              {/* Day tasks */}
              {dateTasks.length > 0 && (
                <section>
                  {overdue.length > 0 && (
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 px-1">
                      {formatDateLabel(selectedDate)}
                    </p>
                  )}
                  <Card className="py-2">
                    <CardContent className="p-1">
                      {dateTasks.map((t: any) => (
                        <TaskRow
                          key={t.id} todo={t} done={false}
                          onToggle={() => toggle(t.id)}
                          onClick={() => setDetailTodo(t)}
                          onDraft={t.type === "email" ? () => setEmailTodo(t) : undefined}
                          isFuture={isFuture}
                          onPull={() => pull(t.id)}
                          onDelete={() => del(t.id)}
                          onShare={(uid) => share(t.id, uid)}
                          onRemoveShare={(uid) => removeShare(t.id, uid)}
                          isFlashing={flashingIds.has(t.id)}
                          isAnimating={animatingIds.has(t.id)}
                          users={users}
                          getUserById={getUserById}
                        />
                      ))}
                    </CardContent>
                  </Card>
                </section>
              )}

              {/* Completed */}
              {myDone.length > 0 && (
                <section>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 px-1 flex items-center gap-2">
                    Completed
                    <Badge variant="secondary" className="h-4 min-w-4 px-1 text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0">{myDone.length}</Badge>
                  </p>
                  <Card className="border-dashed py-2">
                    <CardContent className="p-1">
                      {myDone.map((t: any) => (
                        <TaskRow
                          key={t.id} todo={t} done
                          onToggle={() => toggle(t.id)}
                          onClick={() => setDetailTodo(t)}
                          onDelete={() => del(t.id)}
                          onShare={(uid) => share(t.id, uid)}
                          onRemoveShare={(uid) => removeShare(t.id, uid)}
                          isFlashing={flashingIds.has(t.id)}
                          isAnimating={animatingIds.has(t.id)}
                          users={users}
                          getUserById={getUserById}
                        />
                      ))}
                    </CardContent>
                  </Card>
                </section>
              )}

              {/* Empty */}
              {myAll.length === 0 && !allDoneToday && (
                <div className="text-center py-16">
                  <CheckCircle2 className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No tasks for this day</p>
                </div>
              )}

              {/* Tomorrow preview (on today view only) */}
              {isToday && tomorrowMy.length > 0 && !allDoneToday && (
                <section>
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Tomorrow &middot; {tomorrowMy.length} task{tomorrowMy.length !== 1 && "s"}
                    </span>
                    <button type="button" onClick={() => nav(1)} className="text-xs text-primary hover:underline">View</button>
                  </div>
                  <Card className="border-dashed py-2">
                    <CardContent className="p-1">
                      {tomorrowMy.slice(0, 3).map((t: any) => (
                        <TaskRow
                          key={t.id} todo={t} done={false}
                          onToggle={() => toggle(t.id)}
                          onClick={() => setDetailTodo(t)}
                          onDraft={t.type === "email" ? () => setEmailTodo(t) : undefined}
                          isFuture
                          onPull={() => pull(t.id)}
                          onDelete={() => del(t.id)}
                          onShare={(uid) => share(t.id, uid)}
                          onRemoveShare={(uid) => removeShare(t.id, uid)}
                          isFlashing={flashingIds.has(t.id)}
                          isAnimating={animatingIds.has(t.id)}
                          users={users}
                          getUserById={getUserById}
                        />
                      ))}
                      {tomorrowMy.length > 3 && (
                        <button type="button" onClick={() => nav(1)} className="text-xs text-primary hover:underline px-3 py-2 block">
                          +{tomorrowMy.length - 3} more
                        </button>
                      )}
                    </CardContent>
                  </Card>
                </section>
              )}
            </div>
          )}

          {/* ================================================================ */}
          {/*  SHARED WITH ME TAB                                              */}
          {/* ================================================================ */}
          {tab === "shared" && (
            <div className="space-y-5">
              {sharedPending.length > 0 && (
                <section>
                  <Card className="py-2">
                    <CardContent className="p-1">
                      {sharedPending.map((t: any) => (
                        <TaskRow
                          key={t.id} todo={t} done={false}
                          onToggle={() => toggle(t.id)}
                          onClick={() => setDetailTodo(t)}
                          variant="shared"
                          onDelete={() => del(t.id)}
                          onShare={(uid) => share(t.id, uid)}
                          onRemoveShare={(uid) => removeShare(t.id, uid)}
                          isFlashing={flashingIds.has(t.id)}
                          isAnimating={animatingIds.has(t.id)}
                          users={users}
                          getUserById={getUserById}
                        />
                      ))}
                    </CardContent>
                  </Card>
                </section>
              )}

              {/* Shared completed */}
              {shared.filter((t: any) => t.completed).length > 0 && (
                <section>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 px-1 flex items-center gap-2">
                    Completed
                    <Badge variant="secondary" className="h-4 min-w-4 px-1 text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0">
                      {shared.filter((t: any) => t.completed).length}
                    </Badge>
                  </p>
                  <Card className="border-dashed py-2">
                    <CardContent className="p-1">
                      {shared.filter((t: any) => t.completed).map((t: any) => (
                        <TaskRow
                          key={t.id} todo={t} done
                          onToggle={() => toggle(t.id)}
                          onClick={() => setDetailTodo(t)}
                          variant="shared"
                          onDelete={() => del(t.id)}
                          onShare={(uid) => share(t.id, uid)}
                          onRemoveShare={(uid) => removeShare(t.id, uid)}
                          isFlashing={flashingIds.has(t.id)}
                          isAnimating={animatingIds.has(t.id)}
                          users={users}
                          getUserById={getUserById}
                        />
                      ))}
                    </CardContent>
                  </Card>
                </section>
              )}

              {/* Tomorrow shared preview */}
              {isToday && tomorrowShared.length > 0 && (
                <section>
                  <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Tomorrow &middot; {tomorrowShared.length} task{tomorrowShared.length !== 1 && "s"}
                    </span>
                    <button type="button" onClick={() => nav(1)} className="text-xs text-primary hover:underline">View</button>
                  </div>
                  <Card className="border-dashed py-2">
                    <CardContent className="p-1">
                      {tomorrowShared.map((t: any) => (
                        <TaskRow
                          key={t.id} todo={t} done={false}
                          onToggle={() => toggle(t.id)}
                          onClick={() => setDetailTodo(t)}
                          variant="shared"
                          isFuture
                          onPull={() => pull(t.id)}
                          onDelete={() => del(t.id)}
                          onShare={(uid) => share(t.id, uid)}
                          onRemoveShare={(uid) => removeShare(t.id, uid)}
                          isFlashing={flashingIds.has(t.id)}
                          isAnimating={animatingIds.has(t.id)}
                          users={users}
                          getUserById={getUserById}
                        />
                      ))}
                    </CardContent>
                  </Card>
                </section>
              )}

              {shared.length === 0 && tomorrowShared.length === 0 && (
                <div className="text-center py-16">
                  <Users className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No shared tasks for this day</p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">Tasks teammates share with you appear here</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Email draft modal */}
      <EmailDraftModal open={emailTodo !== null} onClose={() => setEmailTodo(null)} todo={emailTodo} />

      {/* Task detail modal */}
      {detailTodo && (
        <TaskDetail
          todo={detailTodo}
          done={completedIds.has(detailTodo.id)}
          onClose={() => setDetailTodo(null)}
          onToggle={() => toggle(detailTodo.id)}
          onDraft={() => { setDetailTodo(null); setEmailTodo(detailTodo) }}
          getUserById={getUserById}
        />
      )}

      {/* Success modal */}
      <SuccessModal
        open={showSuccess}
        onClose={() => setShowSuccess(false)}
        tomorrowCount={tomorrowMy.length}
        onWorkAhead={() => { setShowSuccess(false); nav(1) }}
      />
    </div>
  )
}
