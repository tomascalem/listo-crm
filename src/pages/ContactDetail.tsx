import { Link, useParams } from "react-router-dom"
import { Sidebar } from "@/components/crm/sidebar"
import { InteractionTimeline } from "@/components/crm/interaction-timeline"
import { InsightsPanel } from "@/components/crm/insights-panel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building2,
  Landmark,
  TreePine,
  Drama,
  Building,
  Star,
  ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  getContactById,
  getVenueById,
  getOperatorById,
  interactions,
  type VenueType,
} from "@/lib/mock-data"

// Venue type icons
const venueTypeConfig: Record<VenueType, { icon: typeof Building2; color: string; bgColor: string }> = {
  stadium: { icon: Landmark, color: "text-primary", bgColor: "bg-primary/10" },
  arena: { icon: Building2, color: "text-chart-2", bgColor: "bg-chart-2/10" },
  amphitheater: { icon: TreePine, color: "text-success", bgColor: "bg-success/10" },
  theater: { icon: Drama, color: "text-chart-4", bgColor: "bg-chart-4/10" },
  "convention-center": { icon: Building, color: "text-chart-3", bgColor: "bg-chart-3/10" },
  other: { icon: Star, color: "text-muted-foreground", bgColor: "bg-muted" },
}

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>()
  const contact = id ? getContactById(id) : null

  if (!contact) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 pl-64 p-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-semibold">Contact not found</h1>
            <Link to="/contacts" className="text-primary hover:underline mt-2 inline-block">
              Back to Contacts
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const contactVenues = contact.venueIds.map(vid => getVenueById(vid)).filter(Boolean)
  const operator = contact.operatorId ? getOperatorById(contact.operatorId) : null

  // Get all interactions for this contact
  const contactInteractions = interactions
    .filter(i => i.contactId === contact.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 pl-64">
        {/* Header */}
        <div className="border-b border-border bg-card px-8 py-6">
          <div className="flex items-start gap-4">
            <Link to="/contacts">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>

            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                {contact.avatar || contact.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-card-foreground">{contact.name}</h1>
                {contact.isPrimary && (
                  <Badge variant="secondary" className="bg-success/20 text-success">
                    Primary Contact
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1">{contact.role}</p>

              {/* Quick contact actions */}
              <div className="flex items-center gap-4 mt-3">
                <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Mail className="h-4 w-4" />
                  {contact.email}
                </a>
                <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Phone className="h-4 w-4" />
                  {contact.phone}
                </a>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2" asChild>
                <a href={`mailto:${contact.email}`}>
                  <Mail className="h-4 w-4" />
                  Email
                </a>
              </Button>
              <Button variant="default" size="sm" className="gap-2" asChild>
                <a href={`tel:${contact.phone}`}>
                  <Phone className="h-4 w-4" />
                  Call
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs Content */}
        <div className="p-8">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="timeline">Timeline ({contactInteractions.length})</TabsTrigger>
              <TabsTrigger value="venues">Venues ({contactVenues.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                  {/* Recent Interactions */}
                  <InteractionTimeline interactions={contactInteractions.slice(0, 3)} />

                  {/* Associated Venues */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Associated Venues</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {contactVenues.map((venue) => {
                          if (!venue) return null
                          const typeConfig = venueTypeConfig[venue.type]
                          const TypeIcon = typeConfig.icon

                          return (
                            <Link key={venue.id} to={`/venues/${venue.id}`} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-secondary/50 transition-colors">
                              <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0", typeConfig.bgColor)}>
                                <TypeIcon className={cn("h-5 w-5", typeConfig.color)} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium">{venue.name}</p>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  {venue.city}, {venue.state}
                                </div>
                              </div>
                              <ExternalLink className="h-4 w-4 text-muted-foreground" />
                            </Link>
                          )
                        })}
                        {contactVenues.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">No associated venues</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Insights Panel */}
                <div>
                  <InsightsPanel interactions={contactInteractions} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="mt-6">
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <InteractionTimeline interactions={contactInteractions} showFull />
                </div>
                <div>
                  <InsightsPanel interactions={contactInteractions} showFull />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="venues" className="mt-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {contactVenues.map((venue) => {
                  if (!venue) return null
                  const typeConfig = venueTypeConfig[venue.type]
                  const TypeIcon = typeConfig.icon
                  const venueInteractions = contactInteractions.filter(i => i.venueId === venue.id)

                  return (
                    <Card key={venue.id} className="overflow-hidden hover:shadow-md transition-shadow">
                      <CardContent className="p-0">
                        <div className="p-4 border-b border-border">
                          <div className="flex items-center gap-3">
                            <div className={cn("h-12 w-12 rounded-lg flex items-center justify-center shrink-0", typeConfig.bgColor)}>
                              <TypeIcon className={cn("h-6 w-6", typeConfig.color)} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <Link to={`/venues/${venue.id}`} className="font-semibold hover:text-primary transition-colors">
                                {venue.name}
                              </Link>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {venue.city}, {venue.state}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 bg-secondary/20 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Type</span>
                            <span className="capitalize">{venue.type.replace('-', ' ')}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Interactions</span>
                            <span>{venueInteractions.length}</span>
                          </div>
                        </div>
                        <div className="p-3 border-t border-border">
                          <Button variant="outline" size="sm" className="w-full" asChild>
                            <Link to={`/venues/${venue.id}`}>
                              View Venue
                              <ExternalLink className="h-4 w-4 ml-2" />
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
