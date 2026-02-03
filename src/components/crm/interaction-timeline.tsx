
import React from "react"

import { useState } from "react"
import { 
  Phone, 
  Video, 
  Mail, 
  Calendar, 
  FileText, 
  Clock, 
  Play, 
  ChevronDown, 
  ChevronUp,
  Plus,
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  Reply,
  Forward,
  MoreHorizontal,
  Paperclip,
  Send,
  ArrowUp,
  ArrowDown,
  X
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { getContactById, getVenueById, getUserById } from "@/lib/mock-data"
import type { Interaction, InteractionType, EmailMessage } from "@/lib/mock-data"

interface InteractionTimelineProps {
  interactions: Interaction[]
  showFull?: boolean
}

const typeConfig: Record<InteractionType, { 
  icon: React.ElementType
  label: string
  color: string
  bgColor: string 
}> = {
  call: { icon: Phone, label: "Call", color: "text-chart-2", bgColor: "bg-chart-2/20" },
  video: { icon: Video, label: "Video Call", color: "text-accent", bgColor: "bg-accent/20" },
  email: { icon: Mail, label: "Email", color: "text-warning", bgColor: "bg-warning/20" },
  meeting: { icon: Calendar, label: "Meeting", color: "text-success", bgColor: "bg-success/20" },
  note: { icon: FileText, label: "Note", color: "text-muted-foreground", bgColor: "bg-muted/50" },
}

function formatDateTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

  let relative = ""
  if (diffHours < 1) relative = "Just now"
  else if (diffHours < 24) relative = `${diffHours}h ago`
  else if (diffHours < 48) relative = "Yesterday"
  else relative = date.toLocaleDateString("en-US", { month: "short", day: "numeric" })

  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  
  return { relative, time, full: date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }) }
}

function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

// Email Thread Component
function EmailThreadView({ 
  emails, 
  onReply 
}: { 
  emails: EmailMessage[]
  onReply: () => void 
}) {
  const [expandedEmails, setExpandedEmails] = useState<Set<string>>(new Set([emails[0]?.id]))
  
  const sortedEmails = [...emails].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const toggleEmail = (id: string) => {
    setExpandedEmails(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const formatEmailDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { 
      weekday: "short",
      month: "short", 
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    })
  }

  return (
    <div className="space-y-2">
      {sortedEmails.map((email, index) => {
        const isExpanded = expandedEmails.has(email.id)
        const isFirst = index === 0
        
        return (
          <div 
            key={email.id} 
            className={cn(
              "rounded-lg border transition-all",
              email.isInbound 
                ? "border-border bg-card" 
                : "border-primary/20 bg-primary/5",
              isFirst && "ring-1 ring-primary/20"
            )}
          >
            {/* Email Header - Always visible */}
            <button
              type="button"
              onClick={() => toggleEmail(email.id)}
              className="w-full p-3 flex items-start gap-3 text-left hover:bg-secondary/30 transition-colors rounded-t-lg"
            >
              <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                <AvatarFallback className={cn(
                  "text-xs font-medium",
                  email.isInbound ? "bg-muted text-muted-foreground" : "bg-primary/20 text-primary"
                )}>
                  {email.from.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-card-foreground">
                    {email.from.name}
                  </span>
                  {email.isInbound ? (
                    <ArrowDown className="h-3 w-3 text-muted-foreground" />
                  ) : (
                    <ArrowUp className="h-3 w-3 text-primary" />
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatEmailDate(email.date)}
                  </span>
                </div>
                
                <div className="text-xs text-muted-foreground truncate">
                  To: {email.to.map(t => t.name).join(', ')}
                  {email.cc && email.cc.length > 0 && ` · Cc: ${email.cc.map(c => c.name).join(', ')}`}
                </div>
                
                {!isExpanded && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                    {email.body.split('\n')[0]}
                  </p>
                )}
              </div>
              
              <ChevronDown className={cn(
                "h-4 w-4 text-muted-foreground transition-transform shrink-0",
                isExpanded && "rotate-180"
              )} />
            </button>
            
            {/* Email Body - Expandable */}
            {isExpanded && (
              <div className="px-3 pb-3 border-t border-border/50">
                <div className="pt-3 pb-2 px-2">
                  <p className="text-sm font-medium text-card-foreground mb-3">
                    {email.subject}
                  </p>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {email.body}
                  </div>
                </div>
                
                {/* Email Actions */}
                {isFirst && (
                  <div className="flex items-center gap-2 pt-3 mt-3 border-t border-border/50">
                    <Button 
                      size="sm" 
                      variant="default" 
                      className="gap-2"
                      onClick={(e) => {
                        e.stopPropagation()
                        onReply()
                      }}
                    >
                      <Reply className="h-3.5 w-3.5" />
                      Reply
                    </Button>
                    <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                      <Forward className="h-3.5 w-3.5" />
                      Forward
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem>Reply All</DropdownMenuItem>
                        <DropdownMenuItem>Mark as Unread</DropdownMenuItem>
                        <DropdownMenuItem>Create Task</DropdownMenuItem>
                        <DropdownMenuItem>Print</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Email Reply Composer
function EmailReplyComposer({ 
  replyTo, 
  onClose, 
  onSend 
}: { 
  replyTo: EmailMessage
  onClose: () => void
  onSend: (message: string) => void 
}) {
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)

  const handleSend = async () => {
    if (!message.trim()) return
    setIsSending(true)
    // Simulate sending
    await new Promise(resolve => setTimeout(resolve, 800))
    onSend(message)
    setIsSending(false)
  }

  return (
    <div className="rounded-lg border border-primary/30 bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-primary/5 border-b border-primary/20">
        <div className="flex items-center gap-2">
          <Reply className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">Reply to {replyTo.from.name}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="p-3 space-y-3">
        <div className="text-xs text-muted-foreground space-y-1">
          <p><span className="font-medium">To:</span> {replyTo.from.email}</p>
          <p><span className="font-medium">Subject:</span> Re: {replyTo.subject}</p>
        </div>
        
        <Textarea
          placeholder="Write your reply..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[120px] resize-none"
          autoFocus
        />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <Paperclip className="h-4 w-4" />
              Attach
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Discard
            </Button>
            <Button 
              size="sm" 
              className="gap-2" 
              onClick={handleSend}
              disabled={!message.trim() || isSending}
            >
              {isSending ? (
                <>
                  <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Quoted original message */}
      <div className="px-4 py-3 bg-muted/30 border-t border-border">
        <p className="text-xs text-muted-foreground mb-2">
          On {new Date(replyTo.date).toLocaleDateString("en-US", { 
            weekday: "long", 
            month: "long", 
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
          })}, {replyTo.from.name} wrote:
        </p>
        <div className="text-xs text-muted-foreground/70 pl-3 border-l-2 border-muted-foreground/30 line-clamp-4">
          {replyTo.body.split('\n').slice(0, 3).join('\n')}...
        </div>
      </div>
    </div>
  )
}

function InteractionCard({ interaction }: { interaction: Interaction }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isReplying, setIsReplying] = useState(false)
  const [replySent, setReplySent] = useState(false)
  const config = typeConfig[interaction.type]
  const Icon = config.icon
  const contact = getContactById(interaction.contactId)
  const venue = getVenueById(interaction.venueId)
  const user = getUserById(interaction.userId)
  const dateInfo = formatDateTime(interaction.date)
  
  const isEmail = interaction.type === "email" && interaction.emailThread && interaction.emailThread.length > 0
  const hasDetails = interaction.transcript || interaction.highlights.length > 0 || interaction.wants.length > 0 || interaction.concerns.length > 0 || isEmail

  const handleReplySent = (_message: string) => {
    setIsReplying(false)
    setReplySent(true)
    // In a real app, this would send the email via API and update the thread
  }

  return (
    <div className="relative pl-8">
      {/* Timeline line */}
      <div className="absolute left-[11px] top-8 bottom-0 w-px bg-border" />
      
      {/* Icon */}
      <div className={cn("absolute left-0 top-1 flex h-6 w-6 items-center justify-center rounded-full", config.bgColor)}>
        <Icon className={cn("h-3 w-3", config.color)} />
      </div>

      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <CollapsibleTrigger asChild>
            <div className="p-4 cursor-pointer hover:bg-secondary/30 transition-colors">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={cn("text-xs", config.bgColor, config.color)}>
                      {config.label}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{dateInfo.relative}</span>
                    {interaction.duration && (
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatDuration(interaction.duration)}
                      </span>
                    )}
                  </div>
                  <h4 className="font-medium text-card-foreground">{interaction.summary}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>with {contact?.name}</span>
                    <span>·</span>
                    <span>{venue?.name}</span>
                    <span>·</span>
                    <span>by {user?.name}</span>
                  </div>
                </div>
                {hasDetails && (
                  <Button variant="ghost" size="sm">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>

              {/* Quick highlights preview */}
              {!isExpanded && interaction.highlights.length > 0 && (
                <div className="mt-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-warning" />
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {interaction.highlights[0]}
                  </p>
                  {interaction.highlights.length > 1 && (
                    <Badge variant="secondary" className="text-xs">
                      +{interaction.highlights.length - 1}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="border-t border-border bg-secondary/20 p-4 space-y-4">
              {/* Email Thread View */}
              {isEmail && interaction.emailThread && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium text-card-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />
                      Email Thread ({interaction.emailThread.length} messages)
                    </h5>
                    {replySent && (
                      <Badge variant="secondary" className="bg-success/20 text-success">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Reply sent
                      </Badge>
                    )}
                  </div>
                  
                  <EmailThreadView 
                    emails={interaction.emailThread} 
                    onReply={() => setIsReplying(true)}
                  />
                  
                  {/* Reply Composer */}
                  {isReplying && interaction.emailThread[0] && (
                    <EmailReplyComposer
                      replyTo={interaction.emailThread.sort((a, b) => 
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                      )[0]}
                      onClose={() => setIsReplying(false)}
                      onSend={handleReplySent}
                    />
                  )}
                </div>
              )}
              
              {/* Recording */}
              {interaction.recordingUrl && (
                <div className="flex items-center gap-3 rounded-lg bg-card p-3">
                  <Button size="sm" variant="secondary" className="gap-2">
                    <Play className="h-4 w-4" />
                    Play Recording
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {interaction.type === "video" ? "Video recording available" : "Audio recording available"}
                  </span>
                </div>
              )}

              {/* Transcript */}
              {interaction.transcript && (
                <div>
                  <h5 className="text-sm font-medium text-card-foreground mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Transcript
                  </h5>
                  <p className="text-sm text-muted-foreground bg-card rounded-lg p-3 leading-relaxed">
                    {interaction.transcript}
                  </p>
                </div>
              )}

              {/* Highlights */}
              {interaction.highlights.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-card-foreground mb-2 flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-warning" />
                    Key Highlights
                  </h5>
                  <ul className="space-y-2">
                    {interaction.highlights.map((highlight, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Wants */}
              {interaction.wants.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-card-foreground mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    What They Want
                  </h5>
                  <ul className="space-y-2">
                    {interaction.wants.map((want, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-success">+</span>
                        <span className="text-muted-foreground">{want}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Concerns */}
              {interaction.concerns.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-card-foreground mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    Concerns & Objections
                  </h5>
                  <ul className="space-y-2">
                    {interaction.concerns.map((concern, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <span className="text-destructive">!</span>
                        <span className="text-muted-foreground">{concern}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2 border-t border-border">
                {isEmail ? (
                  <>
                    <Button 
                      size="sm" 
                      variant="default" 
                      className="gap-2"
                      onClick={() => setIsReplying(true)}
                      disabled={isReplying}
                    >
                      <Reply className="h-4 w-4" />
                      Reply
                    </Button>
                    <Button size="sm" variant="secondary">Create Task</Button>
                    <Button size="sm" variant="secondary">Add Note</Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="secondary">Create Task</Button>
                    <Button size="sm" variant="secondary">Add Note</Button>
                    <Button size="sm" variant="secondary">Share</Button>
                  </>
                )}
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  )
}

export function InteractionTimeline({ interactions, showFull }: InteractionTimelineProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base font-medium text-card-foreground">
          Timeline {showFull && `(${interactions.length})`}
        </CardTitle>
        <Button size="sm" variant="outline" className="gap-2 bg-transparent">
          <Plus className="h-4 w-4" />
          Log Interaction
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {interactions.map((interaction) => (
            <InteractionCard key={interaction.id} interaction={interaction} />
          ))}
          {interactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No interactions recorded yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
