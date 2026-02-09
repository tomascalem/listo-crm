import { Link } from "react-router-dom"
import { Building2, MapPin, MoreHorizontal, ChefHat, Users, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import { useVenues } from "@/queries/venues"
import type { VenueStatus, VenueStage } from "@/lib/mock-data"

const statusConfig: Record<VenueStatus, { label: string; className: string }> = {
  client: { label: "Client", className: "bg-success/20 text-success border-success/30" },
  prospect: { label: "Prospect", className: "bg-primary/20 text-primary border-primary/30" },
  negotiating: { label: "Negotiating", className: "bg-chart-3/20 text-chart-3 border-chart-3/30" },
  churned: { label: "Churned", className: "bg-muted text-muted-foreground border-muted" },
}

const stageConfig: Record<VenueStage, { label: string; color: string }> = {
  lead: { label: "Lead", color: "bg-muted-foreground" },
  qualified: { label: "Qualified", color: "bg-primary" },
  demo: { label: "Demo", color: "bg-chart-2" },
  proposal: { label: "Proposal", color: "bg-chart-3" },
  negotiation: { label: "Negotiation", color: "bg-chart-4" },
  "closed-won": { label: "Won", color: "bg-success" },
  "closed-lost": { label: "Lost", color: "bg-destructive" },
}

function formatCurrency(amount: number) {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`
  }
  return `$${amount}`
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function CompanyList() {
  const { data: venues = [], isLoading } = useVenues()

  // Show most recently active venues
  const recentVenues = [...venues]
    .sort((a: any, b: any) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
    .slice(0, 6)

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="text-muted-foreground">Venue</TableHead>
            <TableHead className="text-muted-foreground">Operator</TableHead>
            <TableHead className="text-muted-foreground">Concessionaire</TableHead>
            <TableHead className="text-muted-foreground">Stage</TableHead>
            <TableHead className="text-muted-foreground">Deal Value</TableHead>
            <TableHead className="text-muted-foreground">Last Activity</TableHead>
            <TableHead className="w-10"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentVenues.map((venue: any) => {
            // Use expanded relations from API
            const operator = venue.operator || null
            const venueConcessionaires = venue.concessionaires || []
            const status = statusConfig[venue.status as VenueStatus] || statusConfig.prospect
            const stage = stageConfig[venue.stage as VenueStage] || stageConfig.lead
            
            return (
              <TableRow key={venue.id} className="border-border group">
                <TableCell>
                  <Link to={`/venues/${venue.id}`} className="flex items-center gap-3 hover:opacity-80">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                      <MapPin className="h-5 w-5 text-secondary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-card-foreground">{venue.name}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        {venue.city}, {venue.state}
                        {venue.capacity && (
                          <>
                            <span className="mx-1">·</span>
                            <Users className="h-3 w-3" />
                            {venue.capacity.toLocaleString()}
                          </>
                        )}
                      </p>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  {operator && (
                    <Link to={`/operators/${operator.id}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                      <div className="h-6 w-6 rounded bg-muted flex items-center justify-center text-xs font-medium">
                        {operator.logo}
                      </div>
                      <span className="text-sm">{operator.name.split(' ').slice(0, 2).join(' ')}</span>
                    </Link>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {venueConcessionaires.slice(0, 2).map((con: any) => con && (
                      <Link key={con.id} to={`/concessionaires/${con.id}`}>
                        <Badge variant="outline" className="text-xs hover:bg-primary/10 hover:text-primary transition-colors">
                          {con.name.split(' ')[0]}
                        </Badge>
                      </Link>
                    ))}
                    {venueConcessionaires.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{venueConcessionaires.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full", stage.color)} />
                    <span className="text-sm">{stage.label}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-card-foreground">
                    {venue.dealValue ? formatCurrency(venue.dealValue) : "-"}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-muted-foreground">{formatDate(venue.lastActivity)}</span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/venues/${venue.id}`}>View details</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>Log interaction</DropdownMenuItem>
                      <DropdownMenuItem>Create task</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
