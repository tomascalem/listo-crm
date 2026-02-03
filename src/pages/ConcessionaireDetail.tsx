import { Link, useParams } from "react-router-dom"
import { Sidebar } from "@/components/crm/sidebar"
import { InteractionTimeline } from "@/components/crm/interaction-timeline"
import { InsightsPanel } from "@/components/crm/insights-panel"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  MapPin,
  ExternalLink,
  Building2,
  ChefHat,
  Landmark,
  TreePine,
  Drama,
  Building,
  Star,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  getConcessionaireById,
  getVenuesByConcessionaireId,
  getContactsByConcessionaireId,
  interactions,
  type VenueStatus,
  type VenueType,
} from "@/lib/mock-data"

const statusConfig: Record<VenueStatus, { label: string; className: string }> = {
  client: { label: "Client", className: "bg-success/20 text-success" },
  prospect: { label: "Prospect", className: "bg-primary/20 text-primary" },
  negotiating: { label: "Negotiating", className: "bg-chart-3/20 text-chart-3" },
  churned: { label: "Churned", className: "bg-muted text-muted-foreground" },
}

// Venue type icons and colors
const venueTypeConfig: Record<VenueType, { icon: typeof Building2; color: string; bgColor: string }> = {
  stadium: { icon: Landmark, color: "text-primary", bgColor: "bg-primary/10" },
  arena: { icon: Building2, color: "text-chart-2", bgColor: "bg-chart-2/10" },
  amphitheater: { icon: TreePine, color: "text-success", bgColor: "bg-success/10" },
  theater: { icon: Drama, color: "text-chart-4", bgColor: "bg-chart-4/10" },
  "convention-center": { icon: Building, color: "text-chart-3", bgColor: "bg-chart-3/10" },
  other: { icon: Star, color: "text-muted-foreground", bgColor: "bg-muted" },
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function ConcessionaireDetail() {
  const { id } = useParams<{ id: string }>()
  const concessionaire = id ? getConcessionaireById(id) : null

  if (!concessionaire) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 pl-64 p-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-semibold">Concessionaire not found</h1>
            <Link to="/venues" className="text-primary hover:underline mt-2 inline-block">
              Back to Venues
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const venues = getVenuesByConcessionaireId(concessionaire.id)
  const contacts = getContactsByConcessionaireId(concessionaire.id)
  const totalValue = venues.reduce((sum, v) => sum + (v.dealValue || 0), 0)

  // Get interactions for this concessionaire's venues
  const venueIds = venues.map(v => v.id)
  const concessionaireInteractions = interactions
    .filter(i => venueIds.includes(i.venueId))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 pl-64">
        {/* Header */}
        <div className="border-b border-border bg-card px-8 py-6">
          <div className="flex items-start gap-4">
            <Link to="/venues">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>

            {/* Concessionaire Logo */}
            <div className="h-16 w-16 rounded-xl bg-warning/10 flex items-center justify-center shrink-0">
              <ChefHat className="h-8 w-8 text-warning" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-card-foreground">{concessionaire.name}</h1>
                <Badge variant="secondary" className="bg-warning/20 text-warning">
                  Concessionaire
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                {concessionaire.headquarters && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {concessionaire.headquarters}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {venues.length} venue{venues.length !== 1 ? 's' : ''}
                </span>
              </div>
              {concessionaire.website && (
                <a
                  href={concessionaire.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  {concessionaire.website.replace('https://', '')}
                </a>
              )}
            </div>

            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-card-foreground">{formatCurrency(totalValue)}</p>
              <p className="text-sm text-muted-foreground">Total Pipeline</p>
            </div>
          </div>
        </div>

        {/* Tabs Content */}
        <div className="p-8">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="venues">Venues ({venues.length})</TabsTrigger>
              <TabsTrigger value="contacts">Contacts ({contacts.length})</TabsTrigger>
              <TabsTrigger value="timeline">Timeline ({concessionaireInteractions.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                  {concessionaire.description && (
                    <Card>
                      <CardContent className="p-6">
                        <p className="text-muted-foreground">{concessionaire.description}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Recent Interactions */}
                  <InteractionTimeline interactions={concessionaireInteractions.slice(0, 3)} />

                  {/* Venues Preview */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Venues ({venues.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {venues.slice(0, 3).map((venue) => {
                          const status = statusConfig[venue.status]
                          const typeConfig = venueTypeConfig[venue.type]
                          const TypeIcon = typeConfig.icon

                          return (
                            <Link key={venue.id} to={`/venues/${venue.id}`} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-secondary/50 transition-colors">
                              <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0", typeConfig.bgColor)}>
                                <TypeIcon className={cn("h-5 w-5", typeConfig.color)} />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{venue.name}</p>
                                <p className="text-sm text-muted-foreground">{venue.city}, {venue.state}</p>
                              </div>
                              <Badge className={status.className}>{status.label}</Badge>
                              <span className="font-medium">{venue.dealValue ? formatCurrency(venue.dealValue) : '-'}</span>
                            </Link>
                          )
                        })}
                        {venues.length > 3 && (
                          <p className="text-sm text-muted-foreground text-center pt-2">
                            +{venues.length - 3} more venues
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Insights Panel */}
                <div>
                  <InsightsPanel interactions={concessionaireInteractions} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="venues" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Venues ({venues.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {venues.map((venue) => {
                      const status = statusConfig[venue.status]
                      const typeConfig = venueTypeConfig[venue.type]
                      const TypeIcon = typeConfig.icon

                      return (
                        <Link key={venue.id} to={`/venues/${venue.id}`} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-secondary/50 transition-colors">
                          <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0", typeConfig.bgColor)}>
                            <TypeIcon className={cn("h-5 w-5", typeConfig.color)} />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{venue.name}</p>
                            <p className="text-sm text-muted-foreground">{venue.city}, {venue.state}</p>
                          </div>
                          <Badge className={status.className}>{status.label}</Badge>
                          <span className="font-medium">{venue.dealValue ? formatCurrency(venue.dealValue) : '-'}</span>
                        </Link>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contacts" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contacts ({contacts.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {contacts.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No contacts associated with this concessionaire</p>
                    ) : (
                      contacts.map((contact) => (
                        <Link key={contact.id} to={`/contacts/${contact.id}`} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-secondary/50 transition-colors">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary border border-primary/20">
                            {contact.avatar || contact.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{contact.name}</p>
                            <p className="text-sm text-muted-foreground">{contact.role}</p>
                          </div>
                          <p className="text-sm text-muted-foreground">{contact.email}</p>
                        </Link>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="timeline" className="mt-6">
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <InteractionTimeline interactions={concessionaireInteractions} showFull />
                </div>
                <div>
                  <InsightsPanel interactions={concessionaireInteractions} showFull />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
