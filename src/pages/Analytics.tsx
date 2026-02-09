import { Sidebar } from "@/components/crm/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Bell, TrendingUp, DollarSign, Users, Target, Loader2 } from "lucide-react"
import { useVenues } from "@/queries/venues"
import { useContacts } from "@/queries/contacts"
import { useTodos } from "@/queries/todos"
import { useInteractions } from "@/queries/interactions"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function Analytics() {
  const { data: venues = [], isLoading: venuesLoading } = useVenues()
  const { data: contacts = [] } = useContacts()
  const { data: interactions = [] } = useInteractions()
  const { data: todos = [] } = useTodos()

  if (venuesLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 lg:pl-64 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </div>
    )
  }

  const totalPipeline = venues.reduce((sum: number, v: any) => sum + (v.dealValue || 0), 0)
  const weightedPipeline = venues.reduce(
    (sum: number, v: any) => sum + ((v.dealValue || 0) * (v.probability || 0)) / 100,
    0
  )
  const closedWon = venues.filter((v: any) => v.stage === "closed-won")
  const closedWonValue = closedWon.reduce((sum: number, v: any) => sum + (v.dealValue || 0), 0)
  const winRate = venues.length > 0 ? (closedWon.length / venues.length) * 100 : 0

  const stats = {
    totalPipeline,
    weightedPipeline,
    closedWonValue,
    winRate,
    totalVenues: venues.length,
    totalContacts: contacts.length,
    totalInteractions: interactions.length,
    pendingTasks: todos.filter((t: any) => !t.completed).length,
  }

  const stageDistribution = [
    { stage: "Lead", count: venues.filter((v: any) => v.stage === "lead").length, color: "bg-muted-foreground" },
    { stage: "Qualified", count: venues.filter((v: any) => v.stage === "qualified").length, color: "bg-primary" },
    { stage: "Demo", count: venues.filter((v: any) => v.stage === "demo").length, color: "bg-chart-2" },
    { stage: "Proposal", count: venues.filter((v: any) => v.stage === "proposal").length, color: "bg-chart-3" },
    { stage: "Negotiation", count: venues.filter((v: any) => v.stage === "negotiation").length, color: "bg-chart-4" },
    { stage: "Closed Won", count: venues.filter((v: any) => v.stage === "closed-won").length, color: "bg-success" },
  ]

  const topVenues = [...venues]
    .sort((a: any, b: any) => (b.dealValue || 0) - (a.dealValue || 0))
    .slice(0, 5)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Analytics</h1>
              <p className="text-sm text-muted-foreground">Pipeline and performance metrics</p>
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </header>

        <div className="p-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Pipeline</p>
                    <p className="text-2xl font-semibold">{formatCurrency(stats.totalPipeline)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-chart-2/10 flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-chart-2" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Weighted Pipeline</p>
                    <p className="text-2xl font-semibold">{formatCurrency(stats.weightedPipeline)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                    <Target className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Win Rate</p>
                    <p className="text-2xl font-semibold">{stats.winRate.toFixed(0)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-chart-3/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-chart-3" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Closed Won</p>
                    <p className="text-2xl font-semibold">{formatCurrency(stats.closedWonValue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Pipeline by Stage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stageDistribution.map((item) => (
                    <div key={item.stage} className="flex items-center gap-4">
                      <div className={`h-3 w-3 rounded-full ${item.color}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{item.stage}</span>
                          <span className="text-sm text-muted-foreground">{item.count} venues</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full mt-1">
                          <div
                            className={`h-2 rounded-full ${item.color}`}
                            style={{ width: `${venues.length > 0 ? (item.count / venues.length) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Venues by Deal Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topVenues.map((venue: any, index: number) => (
                    <div key={venue.id} className="flex items-center gap-4">
                      <span className="text-lg font-semibold text-muted-foreground w-6">{index + 1}</span>
                      <div className="flex-1">
                        <p className="font-medium">{venue.name}</p>
                        <p className="text-sm text-muted-foreground">{venue.city}, {venue.state}</p>
                      </div>
                      <span className="font-semibold">{formatCurrency(venue.dealValue || 0)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Venues</p>
                <p className="text-2xl font-semibold">{stats.totalVenues}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Contacts</p>
                <p className="text-2xl font-semibold">{stats.totalContacts}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Interactions</p>
                <p className="text-2xl font-semibold">{stats.totalInteractions}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Pending Tasks</p>
                <p className="text-2xl font-semibold">{stats.pendingTasks}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
