import { Link, useParams } from "react-router-dom"
import { Sidebar } from "@/components/crm/sidebar"
import { InteractionTimeline } from "@/components/crm/interaction-timeline"
import { InsightsPanel } from "@/components/crm/insights-panel"
import { AddFileModal } from "@/components/crm/modals/add-file-modal"
import { AddContractModal } from "@/components/crm/modals/add-contract-modal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  MapPin,
  ExternalLink,
  Building2,
  Briefcase,
  Landmark,
  TreePine,
  Drama,
  Building,
  Star,
  FileText,
  FileCheck,
  FileBarChart,
  File,
  Presentation,
  FolderOpen,
  ScrollText,
  Share2,
  Calendar,
  Clock,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useOperator, useOperatorVenues, useOperatorContacts, useOperatorInteractions } from "@/queries/operators"
import { useFiles } from "@/queries/files"
import { useContracts } from "@/queries/contracts"

type VenueType = "stadium" | "arena" | "amphitheater" | "theater" | "convention-center" | "other"
type VenueStatus = "client" | "prospect" | "negotiating" | "churned"
type FileType = "deck" | "one-pager" | "proposal" | "report" | "other"
type ContractType = "msa" | "sow" | "nda" | "other"
type ContractStatus = "active" | "pending" | "expired" | "terminated"

// File type icons and colors
const fileTypeConfig: Record<FileType, { icon: typeof FileText; color: string; label: string }> = {
  deck: { icon: Presentation, color: "text-chart-2", label: "Deck" },
  "one-pager": { icon: FileText, color: "text-primary", label: "One-Pager" },
  proposal: { icon: FileCheck, color: "text-success", label: "Proposal" },
  report: { icon: FileBarChart, color: "text-chart-4", label: "Report" },
  other: { icon: File, color: "text-muted-foreground", label: "Other" },
}

// Contract type labels
const contractTypeLabels: Record<ContractType, string> = {
  msa: "MSA",
  sow: "SOW",
  nda: "NDA",
  other: "Other",
}

// Contract status colors
const contractStatusConfig: Record<ContractStatus, { color: string; bgColor: string }> = {
  active: { color: "text-success", bgColor: "bg-success/20" },
  pending: { color: "text-warning", bgColor: "bg-warning/20" },
  expired: { color: "text-muted-foreground", bgColor: "bg-muted" },
  terminated: { color: "text-destructive", bgColor: "bg-destructive/20" },
}

// Helper to group files by month
function groupFilesByMonth<T extends { createdAt?: string; date?: string }>(files: T[]): { month: string; files: T[] }[] {
  const groups: Record<string, T[]> = {}

  files.forEach(file => {
    const dateStr = (file as any).createdAt || (file as any).date || new Date().toISOString()
    const date = new Date(dateStr)
    const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    if (!groups[monthKey]) groups[monthKey] = []
    groups[monthKey].push(file)
  })

  return Object.entries(groups)
    .sort((a, b) => {
      const dateA = (a[1][0] as any).createdAt || (a[1][0] as any).date
      const dateB = (b[1][0] as any).createdAt || (b[1][0] as any).date
      return new Date(dateB).getTime() - new Date(dateA).getTime()
    })
    .map(([month, files]) => ({ month, files }))
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
  const { data: operator, isLoading } = useOperator(id || '')
  const { data: venues = [] } = useOperatorVenues(id || '')
  const { data: contacts = [] } = useOperatorContacts(id || '')
  const { data: interactions = [] } = useOperatorInteractions(id || '')
  const { data: files = [] } = useFiles('operator', id || '')
  const { data: operatorContracts = [] } = useContracts('operator', id || '')

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 pl-64 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </main>
      </div>
    )
  }

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

  const totalValue = venues.reduce((sum: number, v: any) => sum + (v.dealValue || 0), 0)

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

            {/* Operator Logo */}
            <div className="h-16 w-16 rounded-xl bg-chart-2/10 flex items-center justify-center shrink-0">
              <Briefcase className="h-8 w-8 text-chart-2" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-card-foreground">{operator.name}</h1>
                <Badge variant="secondary" className="bg-chart-2/20 text-chart-2">
                  Operator
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                {operator.headquarters && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    {operator.headquarters}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {venues.length} venue{venues.length !== 1 ? 's' : ''}
                </span>
              </div>
              {operator.website && (
                <a
                  href={operator.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  {operator.website.replace('https://', '')}
                </a>
              )}
            </div>

            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-card-foreground">{formatCurrency(totalValue)}</p>
              <p className="text-sm text-muted-foreground">Total Pipeline</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="venues">Venues ({venues.length})</TabsTrigger>
              <TabsTrigger value="contacts">Contacts ({contacts.length})</TabsTrigger>
              <TabsTrigger value="files">Files ({files.length})</TabsTrigger>
              <TabsTrigger value="contracts">Contracts ({operatorContracts.length})</TabsTrigger>
              <TabsTrigger value="timeline">Timeline ({interactions.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                  {operator.description && (
                    <Card>
                      <CardContent className="p-6">
                        <p className="text-muted-foreground">{operator.description}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Recent Interactions */}
                  <InteractionTimeline interactions={interactions.slice(0, 3)} />

                  {/* Venues Preview */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Venues ({venues.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {venues.slice(0, 3).map((venue: any) => {
                          const status = statusConfig[venue.status as VenueStatus] || statusConfig.prospect
                          const typeConfig = venueTypeConfig[venue.type as VenueType] || venueTypeConfig.other
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
                  <InsightsPanel interactions={interactions} />
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
                    {venues.map((venue: any) => {
                      const status = statusConfig[venue.status as VenueStatus] || statusConfig.prospect
                      const typeConfig = venueTypeConfig[venue.type as VenueType] || venueTypeConfig.other
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
                      <p className="text-muted-foreground text-center py-4">No contacts associated with this operator</p>
                    ) : (
                      contacts.map((contact: any) => (
                        <Link key={contact.id} to={`/contacts/${contact.id}`} className="flex items-center gap-4 p-4 rounded-lg border hover:bg-secondary/50 transition-colors">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary border border-primary/20">
                            {contact.avatar || contact.name.split(' ').map((n: string) => n[0]).join('')}
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

            {/* Files Tab */}
            <TabsContent value="files" className="mt-6 space-y-6">
              {/* Header with Add button */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Files & Documents</h2>
                  <p className="text-sm text-muted-foreground mt-1">{files.length} files</p>
                </div>
                <AddFileModal
                  entityType="operator"
                  entityId={operator.id}
                  entityName={operator.name}
                />
              </div>

              {files.length > 0 ? (
                <div className="space-y-6">
                  {groupFilesByMonth(files).map(({ month, files: monthFiles }) => (
                    <div key={month} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">{month}</span>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {monthFiles.map((file: any) => {
                          const typeConfig = fileTypeConfig[file.type as FileType] || fileTypeConfig.other
                          const FileIcon = typeConfig.icon
                          return (
                            <a
                              key={file.id}
                              href={file.url || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group relative bg-card border border-border rounded-xl p-4 hover:shadow-lg hover:border-chart-2/30 transition-all duration-200"
                            >
                              {file.isInheritable && (
                                <div className="absolute -top-2 -right-2">
                                  <Badge className="bg-chart-2/20 text-chart-2 text-xs gap-1">
                                    <Share2 className="h-3 w-3" />
                                    Shared
                                  </Badge>
                                </div>
                              )}
                              <div className="flex items-start gap-3">
                                <div className={cn(
                                  "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                                  typeConfig.color === "text-chart-2" ? "bg-chart-2/10" :
                                  typeConfig.color === "text-primary" ? "bg-primary/10" :
                                  typeConfig.color === "text-success" ? "bg-success/10" :
                                  typeConfig.color === "text-chart-4" ? "bg-chart-4/10" : "bg-muted"
                                )}>
                                  <FileIcon className={cn("h-6 w-6", typeConfig.color)} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-card-foreground group-hover:text-chart-2 transition-colors line-clamp-1">
                                    {file.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
                                    {file.description}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="secondary" className="text-xs">
                                      {typeConfig.label}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(file.createdAt || file.date).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                              </div>
                            </a>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center">
                    <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No files uploaded yet</p>
                    <AddFileModal
                      entityType="operator"
                      entityId={operator.id}
                      entityName={operator.name}
                      trigger={
                        <Button variant="outline" className="mt-4">
                          <File className="h-4 w-4 mr-2" />
                          Upload First File
                        </Button>
                      }
                    />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Contracts Tab */}
            <TabsContent value="contracts" className="mt-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Contracts & Agreements</h2>
                  <p className="text-sm text-muted-foreground mt-1">{operatorContracts.length} contracts</p>
                </div>
                <AddContractModal
                  entityType="operator"
                  entityId={operator.id}
                  entityName={operator.name}
                />
              </div>

              {operatorContracts.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {operatorContracts.map((contract: any) => {
                    const sConfig = contractStatusConfig[contract.status as ContractStatus] || contractStatusConfig.pending
                    const isExpiringSoon = contract.expirationDate &&
                      new Date(contract.expirationDate).getTime() - Date.now() < 90 * 24 * 60 * 60 * 1000 &&
                      contract.status === 'active'

                    return (
                      <a
                        key={contract.id}
                        href={contract.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "group relative bg-card border rounded-xl p-5 hover:shadow-lg transition-all duration-200",
                          isExpiringSoon ? "border-warning/50 bg-warning/5" : "border-border hover:border-chart-2/30"
                        )}
                      >
                        {isExpiringSoon && (
                          <div className="absolute -top-2 -right-2">
                            <Badge className="bg-warning text-warning-foreground text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              Expiring Soon
                            </Badge>
                          </div>
                        )}
                        {contract.isInheritable && !isExpiringSoon && (
                          <div className="absolute -top-2 -right-2">
                            <Badge className="bg-chart-2/20 text-chart-2 text-xs gap-1">
                              <Share2 className="h-3 w-3" />
                              Shared
                            </Badge>
                          </div>
                        )}
                        <div className="flex items-start gap-4">
                          <div className={cn(
                            "h-12 w-12 rounded-xl flex items-center justify-center shrink-0",
                            contract.status === 'active' ? "bg-success/10" :
                            contract.status === 'pending' ? "bg-warning/10" :
                            contract.status === 'expired' ? "bg-muted" : "bg-destructive/10"
                          )}>
                            <ScrollText className={cn(
                              "h-6 w-6",
                              contract.status === 'active' ? "text-success" :
                              contract.status === 'pending' ? "text-warning" :
                              contract.status === 'expired' ? "text-muted-foreground" : "text-destructive"
                            )} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs font-medium">
                                {contractTypeLabels[contract.type as ContractType] || contract.type}
                              </Badge>
                              <Badge className={cn(sConfig.bgColor, sConfig.color, "capitalize text-xs")}>
                                {contract.status}
                              </Badge>
                            </div>
                            <p className="font-semibold text-card-foreground group-hover:text-chart-2 transition-colors line-clamp-1">
                              {contract.name}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{new Date(contract.effectiveDate).toLocaleDateString()}</span>
                              {contract.expirationDate && (
                                <>
                                  <span>→</span>
                                  <span>{new Date(contract.expirationDate).toLocaleDateString()}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </a>
                    )
                  })}
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center">
                    <ScrollText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                    <p className="text-muted-foreground">No contracts yet</p>
                    <AddContractModal
                      entityType="operator"
                      entityId={operator.id}
                      entityName={operator.name}
                      trigger={
                        <Button variant="outline" className="mt-4">
                          <ScrollText className="h-4 w-4 mr-2" />
                          Add First Contract
                        </Button>
                      }
                    />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="timeline" className="mt-6">
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <InteractionTimeline interactions={interactions} showFull />
                </div>
                <div>
                  <InsightsPanel interactions={interactions} showFull />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
