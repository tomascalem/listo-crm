import { Link, useParams } from "react-router-dom"
import { Sidebar } from "@/components/crm/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, MapPin, DollarSign, Phone, Mail, Building2 } from "lucide-react"
import {
  getVenueById,
  getOperatorById,
  getConcessionaireById,
  getContactsByVenueId,
  getInteractionsByVenueId,
  getTodosByVenueId,
  type VenueStage,
} from "@/lib/mock-data"

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

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 pl-64">
        <div className="border-b border-border bg-background px-8 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link to="/venues">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold">{venue.name}</h1>
                <Badge className={`${stageColors[venue.stage]} text-white`}>
                  {stageLabels[venue.stage]}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {venue.city}, {venue.state}
                </span>
                {operator && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {operator.name}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold">{venue.dealValue ? formatCurrency(venue.dealValue) : '-'}</p>
              <p className="text-sm text-muted-foreground">Deal Value</p>
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
            </TabsContent>

            <TabsContent value="contacts" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {contacts.map((contact) => (
                      <div key={contact.id} className="flex items-center gap-4 p-4 rounded-lg border">
                        <Avatar>
                          <AvatarFallback>{contact.avatar || contact.name.slice(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{contact.name}</p>
                          <p className="text-sm text-muted-foreground">{contact.role}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon">
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Phone className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="interactions" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {interactions.map((interaction) => (
                      <div key={interaction.id} className="p-4 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="capitalize">{interaction.type}</Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(interaction.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="font-medium">{interaction.summary}</p>
                        {interaction.highlights.length > 0 && (
                          <ul className="mt-2 text-sm text-muted-foreground">
                            {interaction.highlights.slice(0, 2).map((h, i) => (
                              <li key={i}>• {h}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
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
