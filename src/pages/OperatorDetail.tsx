import { Link, useParams } from "react-router-dom"
import { Sidebar } from "@/components/crm/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, MapPin, ExternalLink, Building2 } from "lucide-react"
import {
  getOperatorById,
  getVenuesByOperatorId,
  getContactsByOperatorId,
  type VenueStatus,
} from "@/lib/mock-data"

const statusConfig: Record<VenueStatus, { label: string; className: string }> = {
  client: { label: "Client", className: "bg-success/20 text-success" },
  prospect: { label: "Prospect", className: "bg-primary/20 text-primary" },
  negotiating: { label: "Negotiating", className: "bg-chart-3/20 text-chart-3" },
  churned: { label: "Churned", className: "bg-muted text-muted-foreground" },
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function OperatorDetail() {
  const { id } = useParams<{ id: string }>()
  const operator = id ? getOperatorById(id) : null

  if (!operator) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 pl-64 p-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-semibold">Operator not found</h1>
            <Link to="/venues" className="text-primary hover:underline mt-2 inline-block">
              Back to Venues
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const venues = getVenuesByOperatorId(operator.id)
  const contacts = getContactsByOperatorId(operator.id)
  const totalValue = venues.reduce((sum, v) => sum + (v.dealValue || 0), 0)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 pl-64">
        <div className="border-b border-border bg-background px-8 py-6">
          <div className="flex items-center gap-4">
            <Link to="/venues">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center text-xl font-semibold text-primary">
              {operator.logo || operator.name.slice(0, 2)}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-semibold">{operator.name}</h1>
              <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                {operator.headquarters && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {operator.headquarters}
                  </span>
                )}
                {operator.website && (
                  <a href={operator.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary">
                    <ExternalLink className="h-4 w-4" />
                    Website
                  </a>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-semibold">{formatCurrency(totalValue)}</p>
              <p className="text-sm text-muted-foreground">Total Pipeline</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {operator.description && (
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">{operator.description}</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Venues ({venues.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {venues.map((venue) => {
                  const status = statusConfig[venue.status]
                  return (
                    <Link key={venue.id} to={`/venues/${venue.id}`} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-secondary/50 transition-colors">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
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

          <Card>
            <CardHeader>
              <CardTitle>Contacts ({contacts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contacts.map((contact) => (
                  <Link key={contact.id} to={`/contacts/${contact.id}`} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-secondary/50 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                      {contact.avatar || contact.name.slice(0, 2)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.role}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{contact.email}</p>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
