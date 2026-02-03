import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { venues, getOperatorById, getCompanyById } from "@/lib/mock-data"
import type { VenueStage } from "@/lib/mock-data"

const stages: { id: VenueStage; label: string; color: string }[] = [
  { id: "lead", label: "Lead", color: "bg-muted-foreground/70" },
  { id: "qualified", label: "Qualified", color: "bg-primary" },
  { id: "demo", label: "Demo", color: "bg-chart-2" },
  { id: "proposal", label: "Proposal", color: "bg-chart-3" },
  { id: "negotiation", label: "Negotiation", color: "bg-chart-4" },
  { id: "closed-won", label: "Won", color: "bg-success" },
]

function formatCurrency(amount: number) {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`
  }
  return `$${amount}`
}

export function PipelinePreview() {
  const activeVenues = venues.filter((v) => v.stage !== "closed-lost" && v.stage !== "closed-won")
  const wonVenues = venues.filter((v) => v.stage === "closed-won")

  const pipelineByStage = stages.map((stage) => {
    const stageVenues = stage.id === "closed-won" ? wonVenues : activeVenues.filter((v) => v.stage === stage.id)
    const totalValue = stageVenues.reduce((sum, v) => sum + (v.dealValue || 0), 0)
    const weightedValue = stageVenues.reduce((sum, v) => sum + ((v.dealValue || 0) * (v.probability || 0)) / 100, 0)

    return {
      ...stage,
      venues: stageVenues,
      count: stageVenues.length,
      totalValue,
      weightedValue,
    }
  })

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium text-card-foreground">Pipeline Overview</CardTitle>
        <Link to="/pipeline">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            View full pipeline
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {pipelineByStage.map((stage) => (
            <div key={stage.id} className="min-w-[160px] flex-1">
              <div className="mb-3 flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${stage.color}`} />
                <span className="text-sm font-medium text-card-foreground">{stage.label}</span>
                <span className="ml-auto text-xs text-muted-foreground">{stage.count}</span>
              </div>
              <div className="space-y-2">
                {stage.venues.slice(0, 2).map((venue) => {
                  const operator = getOperatorById(venue.operatorId)
                  return (
                    <Link key={venue.id} to={`/venues/${venue.id}`}>
                      <div className="rounded-lg border border-border bg-secondary/50 p-3 transition-colors hover:bg-secondary">
                        <p className="text-sm font-medium text-card-foreground truncate">{venue.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{operator?.name}</p>
                        <div className="mt-2 flex items-center justify-between text-xs">
                          <span className="text-card-foreground font-medium">
                            {formatCurrency(venue.dealValue || 0)}
                          </span>
                          <span className="text-muted-foreground">{venue.probability}%</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
                {stage.count > 2 && (
                  <p className="text-center text-xs text-muted-foreground">+{stage.count - 2} more</p>
                )}
                {stage.count === 0 && (
                  <div className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                    No venues
                  </div>
                )}
              </div>
              <div className="mt-3 pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Total: {formatCurrency(stage.totalValue)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
