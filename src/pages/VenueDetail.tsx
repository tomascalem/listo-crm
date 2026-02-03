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
  MapPin,
  Phone,
  Mail,
  Building2,
  Users,
  Landmark,
  TreePine,
  Drama,
  Building,
  Star,
  ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  getVenueById,
  getOperatorById,
  getConcessionaireById,
  getContactsByVenueId,
  getInteractionsByVenueId,
  getTodosByVenueId,
  interactions as allInteractions,
  type VenueStage,
  type VenueType,
} from "@/lib/mock-data"

// Venue type icons and colors
const venueTypeConfig: Record<VenueType, { icon: typeof Building2; color: string; bgColor: string }> = {
  stadium: { icon: Landmark, color: "text-primary", bgColor: "bg-primary/10" },
  arena: { icon: Building2, color: "text-chart-2", bgColor: "bg-chart-2/10" },
  amphitheater: { icon: TreePine, color: "text-success", bgColor: "bg-success/10" },
  theater: { icon: Drama, color: "text-chart-4", bgColor: "bg-chart-4/10" },
  "convention-center": { icon: Building, color: "text-chart-3", bgColor: "bg-chart-3/10" },
  other: { icon: Star, color: "text-muted-foreground", bgColor: "bg-muted" },
}

const stageColors: Record<VenueStage, string> = {
  lead: "bg-muted-foreground/70",
  qualified: "bg-primary",
  demo: "bg-chart-2",
  proposal: "bg-chart-3",
  negotiation: "bg-chart-4",
  "closed-won": "bg-success",
  "closed-lost": "bg-destructive",
}

const stageLabels: Record<VenueStage, string> = {
  lead: "Lead",
  qualified: "Qualified",
  demo: "Demo",
  proposal: "Proposal",
  negotiation: "Negotiation",
  "closed-won": "Closed Won",
  "closed-lost": "Closed Lost",
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function VenueDetail() {
  const { id } = useParams<{ id: string }>()
  const venue = id ? getVenueById(id) : null

  if (!venue) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 pl-64 p-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-semibold">Venue not found</h1>
            <Link to="/venues" className="text-primary hover:underline mt-2 inline-block">
              Back to Venues
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const operator = getOperatorById(venue.operatorId)
  const venueConcessionaires = venue.concessionaireIds.map(cid => getConcessionaireById(cid)).filter(Boolean)
  const contacts = getContactsByVenueId(venue.id)
  const interactions = getInteractionsByVenueId(venue.id)
  const todos = getTodosByVenueId(venue.id)
  const venueConfig = venueTypeConfig[venue.type]
  const VenueIcon = venueConfig.icon

  // Get interactions for each contact
  const getContactInteractions = (contactId: string) => {
    return allInteractions.filter(i => i.contactId === contactId && i.venueId === venue.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 pl-64">
        <div className="border-b border-border bg-card px-8 py-6">
          <div className="flex items-start gap-4">
            <Link to="/venues">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>

            {/* Venue Logo/Icon */}
            <div className={cn("h-16 w-16 rounded-xl flex items-center justify-center shrink-0", venueConfig.bgColor)}>
              <VenueIcon className={cn("h-8 w-8", venueConfig.color)} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-card-foreground">{venue.name}</h1>
                <Badge className={`${stageColors[venue.stage]} text-white`}>
                  {stageLabels[venue.stage]}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {venue.city}, {venue.state}
                </span>
                <span className="flex items-center gap-1 capitalize">
                  <VenueIcon className="h-4 w-4" />
                  {venue.type.replace('-', ' ')}
                </span>
                {venue.capacity && (
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {new Intl.NumberFormat().format(venue.capacity)} capacity
                  </span>
                )}
              </div>
              {operator && (
                <Link to={`/operators/${operator.id}`} className="inline-flex items-center gap-2 mt-2 text-sm text-primary hover:underline">
                  <div className="h-5 w-5 rounded bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                    {operator.logo}
                  </div>
                  {operator.name}
                  <ExternalLink className="h-3 w-3" />
                </Link>
              )}
            </div>

            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-card-foreground">{venue.dealValue ? formatCurrency(venue.dealValue) : '-'}</p>
              <p className="text-sm text-muted-foreground">Deal Value</p>
              {venue.probability !== undefined && venue.probability < 100 && (
                <p className="text-xs text-muted-foreground mt-1">{venue.probability}% probability</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-8">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="contacts">Contacts ({contacts.length})</TabsTrigger>
              <TabsTrigger value="interactions">Interactions ({interactions.length})</TabsTrigger>
              <TabsTrigger value="tasks">Tasks ({todos.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                  {/* Recent Interactions */}
                  <InteractionTimeline interactions={interactions.slice(0, 3)} />

                  {/* Venue Info & Concessionaires */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Venue Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Address</p>
                          <p>{venue.address}</p>
                          <p>{venue.city}, {venue.state}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Type</p>
                          <p className="capitalize">{venue.type}</p>
                        </div>
                        {venue.capacity && (
                          <div>
                            <p className="text-sm text-muted-foreground">Capacity</p>
                            <p>{new Intl.NumberFormat().format(venue.capacity)}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Concessionaires</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {venueConcessionaires.map((con) => con && (
                            <Link key={con.id} to={`/concessionaires/${con.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary">
                              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                                {con.logo}
                              </div>
                              <div>
                                <p className="font-medium">{con.name}</p>
                                <p className="text-sm text-muted-foreground">{con.headquarters}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Insights Panel */}
                <div>
                  <InsightsPanel interactions={interactions} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="contacts" className="mt-6">
              <div className="grid gap-4 md:grid-cols-2">
                {contacts.map((contact) => {
                  const contactInteractions = getContactInteractions(contact.id)
                  const lastInteraction = contactInteractions[0]

                  return (
                    <Card key={contact.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        {/* Contact Header */}
                        <div className="p-4 border-b border-border bg-card">
                          <div className="flex items-start gap-4">
                            <Avatar className="h-12 w-12 border-2 border-primary/20">
                              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                {contact.avatar || contact.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <Link to={`/contacts/${contact.id}`} className="font-semibold text-card-foreground hover:text-primary transition-colors">
                                {contact.name}
                              </Link>
                              <p className="text-sm text-muted-foreground">{contact.role}</p>
                              {contact.isPrimary && (
                                <Badge variant="secondary" className="mt-1 bg-success/20 text-success text-xs">
                                  Primary Contact
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Contact Details */}
                        <div className="p-4 space-y-3 bg-secondary/20">
                          <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                            <Mail className="h-4 w-4" />
                            {contact.email}
                          </a>
                          <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                            <Phone className="h-4 w-4" />
                            {contact.phone}
                          </a>

                          {/* Last Interaction Summary */}
                          {lastInteraction && (
                            <div className="pt-3 mt-3 border-t border-border">
                              <p className="text-xs text-muted-foreground mb-1">Last Interaction</p>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs capitalize">{lastInteraction.type}</Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(lastInteraction.date).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-sm text-card-foreground mt-1 line-clamp-2">{lastInteraction.summary}</p>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="p-3 border-t border-border bg-card flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1 gap-2" asChild>
                            <a href={`mailto:${contact.email}`}>
                              <Mail className="h-4 w-4" />
                              Email
                            </a>
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 gap-2" asChild>
                            <a href={`tel:${contact.phone}`}>
                              <Phone className="h-4 w-4" />
                              Call
                            </a>
                          </Button>
                          <Button variant="default" size="sm" asChild>
                            <Link to={`/contacts/${contact.id}`}>
                              View
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
              {contacts.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No contacts associated with this venue yet</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="interactions" className="mt-6">
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <InteractionTimeline interactions={interactions} showFull />
                </div>
                <div>
                  <InsightsPanel interactions={interactions} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {todos.map((todo) => (
                      <div key={todo.id} className="flex items-center gap-4 p-4 rounded-lg border">
                        <input type="checkbox" checked={todo.completed} readOnly className="h-4 w-4" />
                        <div className="flex-1">
                          <p className={`font-medium ${todo.completed ? 'line-through text-muted-foreground' : ''}`}>
                            {todo.title}
                          </p>
                          {todo.description && (
                            <p className="text-sm text-muted-foreground">{todo.description}</p>
                          )}
                        </div>
                        <Badge variant={todo.priority === 'high' ? 'destructive' : 'secondary'}>
                          {todo.priority}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
