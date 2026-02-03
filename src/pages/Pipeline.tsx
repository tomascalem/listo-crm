import { Link } from "react-router-dom"
import { Sidebar } from "@/components/crm/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, MapPin } from "lucide-react"
import { venues, getOperatorById, type VenueStage } from "@/lib/mock-data"

const stages: { key: VenueStage; label: string; color: string }[] = [
  { key: "lead", label: "Lead", color: "bg-muted-foreground" },
  { key: "qualified", label: "Qualified", color: "bg-primary" },
  { key: "demo", label: "Demo", color: "bg-chart-2" },
  { key: "proposal", label: "Proposal", color: "bg-chart-3" },
  { key: "negotiation", label: "Negotiation", color: "bg-chart-4" },
  { key: "closed-won", label: "Closed Won", color: "bg-success" },
]

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function Pipeline() {
  const venuesByStage = stages.map((stage) => ({
    ...stage,
    venues: venues.filter((v) => v.stage === stage.key),
    totalValue: venues
      .filter((v) => v.stage === stage.key)
      .reduce((sum, v) => sum + (v.dealValue || 0), 0),
  }))

  const totalPipeline = venues.reduce((sum, v) => sum + (v.dealValue || 0), 0)
  const weightedPipeline = venues.reduce(
    (sum, v) => sum + ((v.dealValue || 0) * (v.probability || 0)) / 100,
    0
  )

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Pipeline</h1>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(totalPipeline)} total · {formatCurrency(weightedPipeline)} weighted
              </p>
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <div className="p-6">
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {venuesByStage.map((stage) => (
              <div key={stage.key} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${stage.color}`} />
                    <h3 className="font-medium">{stage.label}</h3>
                  </div>
                  <Badge variant="secondary">{stage.venues.length}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{formatCurrency(stage.totalValue)}</p>

                <div className="space-y-2">
                  {stage.venues.map((venue) => {
                    const operator = getOperatorById(venue.operatorId)
                    return (
                      <Link key={venue.id} to={`/venues/${venue.id}`}>
                        <Card className="hover:bg-secondary/50 transition-colors cursor-pointer">
                          <CardContent className="p-3">
                            <p className="font-medium text-sm">{venue.name}</p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3" />
                              {venue.city}, {venue.state}
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-muted-foreground">
                                {operator?.name.split(' ').slice(0, 2).join(' ')}
                              </span>
                              <span className="text-sm font-medium">
                                {venue.dealValue ? formatCurrency(venue.dealValue) : '-'}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
