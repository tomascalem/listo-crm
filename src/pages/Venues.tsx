import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { Sidebar } from "@/components/crm/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Bell, Search, MoreHorizontal, MapPin, Users, Building2, ChefHat, ExternalLink, ChevronRight, ChevronDown, List } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  venues,
  operators,
  concessionaires,
  getOperatorById,
  getConcessionaireById,
  getVenuesByOperatorId,
  getVenuesByConcessionaireId,
  type VenueStatus,
  type VenueStage,
  type VenueType,
  type Venue,
} from "@/lib/mock-data"

type ViewMode = "all" | "by-operator" | "by-concessionaire"

const statusConfig: Record<VenueStatus, { label: string; className: string }> = {
  client: { label: "Client", className: "bg-success/20 text-success" },
  prospect: { label: "Prospect", className: "bg-primary/20 text-primary" },
  negotiating: { label: "Negotiating", className: "bg-chart-3/20 text-chart-3" },
  churned: { label: "Churned", className: "bg-muted text-muted-foreground" },
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

const typeLabels: Record<VenueType, string> = {
  stadium: "Stadium",
  arena: "Arena",
  amphitheater: "Amphitheater",
  theater: "Theater",
  "convention-center": "Convention Center",
  other: "Other",
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatCapacity(capacity?: number) {
  if (!capacity) return "-"
  return new Intl.NumberFormat("en-US").format(capacity)
}

function VenueRow({ venue }: { venue: Venue }) {
  const status = statusConfig[venue.status]
  const stage = stageConfig[venue.stage]

  return (
    <Link
      to={`/venues/${venue.id}`}
      className="flex items-center gap-4 py-2.5 px-4 hover:bg-secondary/50 rounded-md transition-colors group"
    >
      <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-card-foreground group-hover:text-primary truncate">
          {venue.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {venue.city}, {venue.state} · {typeLabels[venue.type]}
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className={cn("h-2 w-2 rounded-full", stage.color)} />
          <span className="text-xs text-muted-foreground">{stage.label}</span>
        </div>
        <Badge className={cn("text-xs", status.className)}>
          {status.label}
        </Badge>
        {venue.dealValue && (
          <span className="text-sm font-medium w-16 text-right">
            {formatCurrency(venue.dealValue)}
          </span>
        )}
      </div>
    </Link>
  )
}

function TreeItem({
  name,
  logo,
  href,
  venueCount,
  totalValue,
  venues: itemVenues,
}: {
  name: string
  logo?: string
  href: string
  venueCount: number
  totalValue: number
  venues: Venue[]
  icon: typeof Building2
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="flex items-center">
          <CollapsibleTrigger asChild>
            <button className="flex items-center gap-3 p-4 hover:bg-secondary/50 transition-colors flex-1">
              <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                {logo || name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="font-semibold text-card-foreground truncate">{name}</p>
                <p className="text-sm text-muted-foreground">
                  {venueCount} venue{venueCount !== 1 ? "s" : ""} · {formatCurrency(totalValue)} total value
                </p>
              </div>
            </button>
          </CollapsibleTrigger>
          <Link
            to={href}
            className="flex items-center gap-2 px-4 py-2 mr-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            View details
          </Link>
        </div>

        <CollapsibleContent>
          <div className="border-t border-border bg-secondary/20 py-2 px-2">
            {itemVenues.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No venues</p>
            ) : (
              <div className="space-y-0.5">
                {itemVenues.map((venue) => (
                  <VenueRow key={venue.id} venue={venue} />
                ))}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}

export default function Venues() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [viewMode, setViewMode] = useState<ViewMode>("all")

  const filteredVenues = useMemo(() => {
    return venues.filter((venue) => {
      const matchesSearch = venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venue.state.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === "all" || venue.status === statusFilter
      const matchesType = typeFilter === "all" || venue.type === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })
  }, [searchQuery, statusFilter, typeFilter])

  const operatorsWithVenues = useMemo(() => {
    return operators.map((op) => {
      let opVenues = getVenuesByOperatorId(op.id)

      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        opVenues = opVenues.filter(v =>
          v.name.toLowerCase().includes(query) ||
          v.city.toLowerCase().includes(query)
        )
      }
      if (statusFilter !== "all") {
        opVenues = opVenues.filter(v => v.status === statusFilter)
      }
      if (typeFilter !== "all") {
        opVenues = opVenues.filter(v => v.type === typeFilter)
      }

      const totalValue = opVenues.reduce((sum, v) => sum + (v.dealValue || 0), 0)
      return { ...op, venues: opVenues, totalValue }
    }).filter(op => op.venues.length > 0 || !searchQuery)
  }, [searchQuery, statusFilter, typeFilter])

  const concessionairesWithVenues = useMemo(() => {
    return concessionaires.map((con) => {
      let conVenues = getVenuesByConcessionaireId(con.id)

      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        conVenues = conVenues.filter(v =>
          v.name.toLowerCase().includes(query) ||
          v.city.toLowerCase().includes(query)
        )
      }
      if (statusFilter !== "all") {
        conVenues = conVenues.filter(v => v.status === statusFilter)
      }
      if (typeFilter !== "all") {
        conVenues = conVenues.filter(v => v.type === typeFilter)
      }

      const totalValue = conVenues.reduce((sum, v) => sum + (v.dealValue || 0), 0)
      return { ...con, venues: conVenues, totalValue }
    }).filter(con => con.venues.length > 0 || !searchQuery)
  }, [searchQuery, statusFilter, typeFilter])

  const stats = useMemo(() => ({
    total: venues.length,
    clients: venues.filter(v => v.status === "client").length,
    prospects: venues.filter(v => v.status === "prospect").length,
    pipeline: venues.reduce((sum, v) => sum + (v.dealValue || 0) * (v.probability || 0) / 100, 0),
  }), [])

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Venues</h1>
              <p className="text-sm text-muted-foreground">
                {venues.length} venues · {formatCurrency(stats.pipeline)} weighted pipeline
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Total Venues</p>
              <p className="text-2xl font-semibold">{stats.total}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Active Clients</p>
              <p className="text-2xl font-semibold text-success">{stats.clients}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Prospects</p>
              <p className="text-2xl font-semibold text-primary">{stats.prospects}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">Weighted Pipeline</p>
              <p className="text-2xl font-semibold">{formatCurrency(stats.pipeline)}</p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex gap-1 p-1 rounded-lg bg-secondary/50 border border-border">
              <button
                onClick={() => setViewMode("all")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  viewMode === "all"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <List className="h-4 w-4" />
                All Venues
              </button>
              <button
                onClick={() => setViewMode("by-operator")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  viewMode === "by-operator"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Building2 className="h-4 w-4" />
                By Operator
              </button>
              <button
                onClick={() => setViewMode("by-concessionaire")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  viewMode === "by-concessionaire"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <ChefHat className="h-4 w-4" />
                By Concessionaire
              </button>
            </div>

            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search venues..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                  <SelectItem value="negotiating">Negotiating</SelectItem>
                  <SelectItem value="churned">Churned</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="stadium">Stadium</SelectItem>
                  <SelectItem value="arena">Arena</SelectItem>
                  <SelectItem value="amphitheater">Amphitheater</SelectItem>
                  <SelectItem value="theater">Theater</SelectItem>
                  <SelectItem value="convention-center">Convention Center</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {viewMode === "all" && (
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Venue</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Operator</TableHead>
                    <TableHead>Concessionaire(s)</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Deal Value</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVenues.map((venue) => {
                    const operator = getOperatorById(venue.operatorId)
                    const venueConcessionaires = venue.concessionaireIds.map(id => getConcessionaireById(id)).filter(Boolean)
                    const stage = stageConfig[venue.stage]
                    const status = statusConfig[venue.status]

                    return (
                      <TableRow key={venue.id} className="group">
                        <TableCell>
                          <Link to={`/venues/${venue.id}`} className="block group/link">
                            <p className="font-medium text-card-foreground group-hover/link:text-primary transition-colors">
                              {venue.name}
                            </p>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {venue.city}, {venue.state}
                              {venue.capacity && (
                                <>
                                  <span className="mx-1">·</span>
                                  <Users className="h-3 w-3" />
                                  {formatCapacity(venue.capacity)}
                                </>
                              )}
                            </div>
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {typeLabels[venue.type]}
                          </Badge>
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
                            {venueConcessionaires.slice(0, 2).map((con) => con && (
                              <Link key={con.id} to={`/concessionaires/${con.id}`}>
                                <Badge variant="outline" className="text-xs cursor-pointer hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors">
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
                          <Badge className={cn("text-xs", status.className)}>
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <p className="font-medium">{venue.dealValue ? formatCurrency(venue.dealValue) : "-"}</p>
                          {venue.probability !== undefined && venue.probability < 100 && (
                            <p className="text-xs text-muted-foreground">{venue.probability}% prob</p>
                          )}
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
                              <DropdownMenuItem>Edit venue</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              {filteredVenues.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  No venues found matching your filters
                </div>
              )}
            </div>
          )}

          {viewMode === "by-operator" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {operators.length} operators · Click to expand and see venues
              </p>
              <div className="space-y-3">
                {operatorsWithVenues.map((op) => (
                  <TreeItem
                    key={op.id}
                    name={op.name}
                    logo={op.logo}
                    href={`/operators/${op.id}`}
                    venueCount={op.venues.length}
                    totalValue={op.totalValue}
                    venues={op.venues}
                    icon={Building2}
                  />
                ))}
              </div>
            </div>
          )}

          {viewMode === "by-concessionaire" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {concessionaires.length} concessionaires · Click to expand and see venues
              </p>
              <div className="space-y-3">
                {concessionairesWithVenues.map((con) => (
                  <TreeItem
                    key={con.id}
                    name={con.name}
                    logo={con.logo}
                    href={`/concessionaires/${con.id}`}
                    venueCount={con.venues.length}
                    totalValue={con.totalValue}
                    venues={con.venues}
                    icon={ChefHat}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
