import { Phone, Video, Mail, Calendar, FileText, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useInteractions } from "@/queries/interactions"
import type { InteractionType } from "@/lib/mock-data"

function getInteractionIcon(type: InteractionType) {
  switch (type) {
    case "call":
      return <Phone className="h-4 w-4" />
    case "video":
      return <Video className="h-4 w-4" />
    case "email":
      return <Mail className="h-4 w-4" />
    case "meeting":
      return <Calendar className="h-4 w-4" />
    case "note":
      return <FileText className="h-4 w-4" />
  }
}

function formatRelativeTime(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

  if (diffHours < 1) return "Just now"
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffHours < 48) return "Yesterday"
  if (diffHours < 168) return `${Math.floor(diffHours / 24)}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function RecentActivity() {
  const { data: interactions = [], isLoading } = useInteractions()

  const recentInteractions = [...interactions]
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  if (isLoading) {
    return (
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-card-foreground">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-card-foreground">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentInteractions.map((interaction: any) => {
          // Use expanded relations from API
          const contact = interaction.contact || null
          const venue = interaction.venue || null
          const user = interaction.user || null

          return (
            <div key={interaction.id} className="flex items-start gap-3">
              <div className="mt-1 rounded-lg bg-secondary p-2 text-muted-foreground">
                {getInteractionIcon(interaction.type)}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm text-card-foreground">
                  <span className="font-medium">{user?.name}</span>
                  {" "}
                  {interaction.type === "call" && "had a call with"}
                  {interaction.type === "video" && "had a video call with"}
                  {interaction.type === "email" && "sent an email to"}
                  {interaction.type === "meeting" && "met with"}
                  {interaction.type === "note" && "added a note about"}
                  {" "}
                  <span className="font-medium">{contact?.name}</span>
                </p>
                <p className="text-sm text-muted-foreground line-clamp-1">{interaction.summary}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{venue?.name}</span>
                  <span>·</span>
                  <span>{formatRelativeTime(interaction.date)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
