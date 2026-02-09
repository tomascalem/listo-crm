import { Link, useParams } from "react-router-dom"
import { Sidebar } from "@/components/crm/sidebar"
import { InteractionTimeline } from "@/components/crm/interaction-timeline"
import { InsightsPanel } from "@/components/crm/insights-panel"
import { AddFileModal } from "@/components/crm/modals/add-file-modal"
import { AddContractModal } from "@/components/crm/modals/add-contract-modal"
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
  ExternalLink,
  FileText,
  FileCheck,
  FileBarChart,
  File,
  Presentation,
  FolderOpen,
  ScrollText,
  Download,
  Link as LinkIcon,
  Calendar,
  Clock,
  Briefcase,
  ChefHat,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  useVenue,
  useVenueContacts,
  useVenueInteractions,
  useVenueTodos,
} from "@/queries/venues"
import { useFiles } from "@/queries/files"
import { useContracts } from "@/queries/contracts"
import {
  type VenueStage,
  type VenueType,
  type FileType,
  type ContractType,
  type ContractStatus,
} from "@/lib/mock-data"

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
function groupFilesByMonth<T extends { date: string }>(files: T[]): { month: string; files: T[] }[] {
  const groups: Record<string, T[]> = {}

  files.forEach(file => {
    const date = new Date(file.date)
    const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    if (!groups[monthKey]) groups[monthKey] = []
    groups[monthKey].push(file)
  })

  return Object.entries(groups)
    .sort((a, b) => new Date(b[1][0].date).getTime() - new Date(a[1][0].date).getTime())
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

// Helper to convert API venue type (underscore) to frontend type (hyphen)
function normalizeVenueType(type: string): VenueType {
  return type.replace(/_/g, '-') as VenueType
}

// Helper to convert API stage (underscore) to frontend stage (hyphen)
function normalizeStage(stage: string): VenueStage {
  return stage.replace(/_/g, '-') as VenueStage
}

export default function VenueDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: venue, isLoading: venueLoading } = useVenue(id || '')
  const { data: contacts = [] } = useVenueContacts(id || '')
  const { data: interactions = [] } = useVenueInteractions(id || '')
  const { data: todos = [] } = useVenueTodos(id || '')

  // Fetch files and contracts from API
  const { data: venueFilesData = [] } = useFiles('venue', id || '')
  const { data: venueContractsData = [] } = useContracts('venue', id || '')

  if (venueLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 pl-64 p-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </main>
      </div>
    )
  }

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

  // Get related data from venue object (populated by API)
  const operator = venue.operator
  const venueConcessionaires = venue.concessionaires || []

  // Files and contracts are fetched from API hooks above
  // For now, we only show venue-specific files/contracts
  // TODO: Add inherited files from operator/concessionaires when API supports it
  const venueFiles = venueFilesData.map((f: any) => ({
    ...f,
    date: f.createdAt || f.date || new Date().toISOString(),
    url: f.s3Url || f.url || '#',
  }))
  const inheritedFilesOperator: any[] = []
  const inheritedFilesConcessionaire: any[] = []

  const venueContracts = venueContractsData.map((c: any) => ({
    ...c,
    date: c.effectiveDate || c.createdAt || new Date().toISOString(),
    url: c.s3Url || c.url || '#',
  }))
  const inheritedContractsOperator: any[] = []
  const inheritedContractsConcessionaire: any[] = []

  // Normalize venue type and stage from API format (underscores) to frontend format (hyphens)
  const normalizedType = normalizeVenueType(venue.type)
  const normalizedStage = normalizeStage(venue.stage)

  const venueConfig = venueTypeConfig[normalizedType] || venueTypeConfig.other
  const VenueIcon = venueConfig.icon

  const totalFiles = venueFiles.length + inheritedFilesOperator.length + inheritedFilesConcessionaire.length
  const totalContracts = venueContracts.length + inheritedContractsOperator.length + inheritedContractsConcessionaire.length

  // Get interactions for each contact from the API data
  const getContactInteractions = (contactId: string) => {
    return interactions.filter((i: any) => i.contactId === contactId)
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
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
                <Badge className={`${stageColors[normalizedStage]} text-white`}>
                  {stageLabels[normalizedStage]}
                </Badge>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {venue.city}, {venue.state}
                </span>
                <span className="flex items-center gap-1 capitalize">
                  <VenueIcon className="h-4 w-4" />
                  {normalizedType.replace('-', ' ')}
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
              <TabsTrigger value="files">Files ({totalFiles})</TabsTrigger>
              <TabsTrigger value="contracts">Contracts ({totalContracts})</TabsTrigger>
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
                          <p className="capitalize">{normalizedType.replace('-', ' ')}</p>
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
                          {venueConcessionaires.map((con: any) => con && (
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
                {contacts.map((contact: any) => {
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
                                {contact.avatar || contact.name.split(' ').map((n: string) => n[0]).join('')}
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

            {/* Files Tab */}
            <TabsContent value="files" className="mt-6">
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content - Venue Files */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Header with Add button */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">Files & Documents</h2>
                      <p className="text-sm text-muted-foreground mt-1">{venueFiles.length} venue files</p>
                    </div>
                    <AddFileModal
                      entityType="venue"
                      entityId={venue.id}
                      entityName={venue.name}
                    />
                  </div>

                  {/* Venue Files - Grouped by Month */}
                  {venueFiles.length > 0 ? (
                    <div className="space-y-6">
                      {groupFilesByMonth(venueFiles).map(({ month, files: monthFiles }) => (
                        <div key={month} className="space-y-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground">{month}</span>
                          </div>
                          <div className="grid gap-3 md:grid-cols-2">
                            {monthFiles.map((file: any) => {
                              const typeConfig = fileTypeConfig[file.type as FileType] || fileTypeConfig.other
                              const FileIcon = typeConfig.icon
                              return (
                                <a
                                  key={file.id}
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group relative bg-card border border-border rounded-xl p-4 hover:shadow-lg hover:border-primary/30 transition-all duration-200"
                                >
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
                                      <p className="font-medium text-card-foreground group-hover:text-primary transition-colors line-clamp-1">
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
                                          {new Date(file.date).toLocaleDateString()}
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
                        <p className="text-muted-foreground">No files uploaded for this venue yet</p>
                        <AddFileModal
                          entityType="venue"
                          entityId={venue.id}
                          entityName={venue.name}
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
                </div>

                {/* Right Sidebar - Inherited Files */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium text-muted-foreground">Inherited Files</h3>
                  </div>

                  {(inheritedFilesOperator.length > 0 || inheritedFilesConcessionaire.length > 0) ? (
                    <div className="space-y-4">
                      {/* From Operator */}
                      {inheritedFilesOperator.length > 0 && operator && (
                        <Card className="border-chart-2/30 bg-chart-2/5">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Briefcase className="h-4 w-4 text-chart-2" />
                              <span className="text-sm font-medium text-chart-2">{operator.name}</span>
                            </div>
                            <div className="space-y-2">
                              {inheritedFilesOperator.map((file: any) => {
                                const typeConfig = fileTypeConfig[file.type as FileType] || fileTypeConfig.other
                                const FileIcon = typeConfig.icon
                                return (
                                  <a
                                    key={file.id}
                                    href={file.url || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center gap-2 p-2 rounded-lg hover:bg-chart-2/10 transition-colors"
                                  >
                                    <FileIcon className={cn("h-4 w-4 shrink-0", typeConfig.color)} />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium line-clamp-1 group-hover:text-chart-2 transition-colors">
                                        {file.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">{typeConfig.label}</p>
                                    </div>
                                    <LinkIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                                  </a>
                                )
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* From Concessionaires */}
                      {inheritedFilesConcessionaire.length > 0 && (
                        <Card className="border-warning/30 bg-warning/5">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <ChefHat className="h-4 w-4 text-warning" />
                              <span className="text-sm font-medium text-warning">Concessionaires</span>
                            </div>
                            <div className="space-y-2">
                              {inheritedFilesConcessionaire.map((file: any) => {
                                const typeConfig = fileTypeConfig[file.type as FileType] || fileTypeConfig.other
                                const FileIcon = typeConfig.icon
                                return (
                                  <a
                                    key={file.id}
                                    href={file.url || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center gap-2 p-2 rounded-lg hover:bg-warning/10 transition-colors"
                                  >
                                    <FileIcon className={cn("h-4 w-4 shrink-0", typeConfig.color)} />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium line-clamp-1 group-hover:text-warning transition-colors">
                                        {file.name}
                                      </p>
                                      <p className="text-xs text-muted-foreground">{typeConfig.label}</p>
                                    </div>
                                    <LinkIcon className="h-3 w-3 text-muted-foreground shrink-0" />
                                  </a>
                                )
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ) : (
                    <Card className="border-dashed">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-muted-foreground">No inherited files</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Contracts Tab */}
            <TabsContent value="contracts" className="mt-6">
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content - Venue Contracts */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">Contracts & Agreements</h2>
                      <p className="text-sm text-muted-foreground mt-1">{venueContracts.length} venue contracts</p>
                    </div>
                    <AddContractModal
                      entityType="venue"
                      entityId={venue.id}
                      entityName={venue.name}
                    />
                  </div>

                  {/* Venue Contracts */}
                  {venueContracts.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {venueContracts.map((contract: any) => {
                        const sConfig = contractStatusConfig[contract.status as ContractStatus] || contractStatusConfig.pending
                        const isExpiringSoon = contract.expirationDate &&
                          new Date(contract.expirationDate).getTime() - Date.now() < 90 * 24 * 60 * 60 * 1000 &&
                          contract.status === 'active'

                        return (
                          <a
                            key={contract.id}
                            href={contract.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                              "group relative bg-card border rounded-xl p-5 hover:shadow-lg transition-all duration-200",
                              isExpiringSoon ? "border-warning/50 bg-warning/5" : "border-border hover:border-primary/30"
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
                                <p className="font-semibold text-card-foreground group-hover:text-primary transition-colors line-clamp-1">
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
                        <p className="text-muted-foreground">No contracts for this venue yet</p>
                        <AddContractModal
                          entityType="venue"
                          entityId={venue.id}
                          entityName={venue.name}
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
                </div>

                {/* Right Sidebar - Inherited Contracts */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium text-muted-foreground">Inherited Contracts</h3>
                  </div>

                  {(inheritedContractsOperator.length > 0 || inheritedContractsConcessionaire.length > 0) ? (
                    <div className="space-y-4">
                      {/* From Operator */}
                      {inheritedContractsOperator.length > 0 && operator && (
                        <Card className="border-chart-2/30 bg-chart-2/5">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <Briefcase className="h-4 w-4 text-chart-2" />
                              <span className="text-sm font-medium text-chart-2">{operator.name}</span>
                            </div>
                            <div className="space-y-2">
                              {inheritedContractsOperator.map((contract: any) => {
                                const sConfig = contractStatusConfig[contract.status as ContractStatus] || contractStatusConfig.pending
                                return (
                                  <a
                                    key={contract.id}
                                    href={contract.url || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group block p-2 rounded-lg hover:bg-chart-2/10 transition-colors"
                                  >
                                    <div className="flex items-center gap-2 mb-1">
                                      <ScrollText className="h-4 w-4 text-chart-2 shrink-0" />
                                      <p className="text-sm font-medium line-clamp-1 group-hover:text-chart-2 transition-colors flex-1">
                                        {contract.name}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2 pl-6">
                                      <Badge variant="outline" className="text-xs">{contractTypeLabels[contract.type as ContractType] || contract.type}</Badge>
                                      <Badge className={cn(sConfig.bgColor, sConfig.color, "capitalize text-xs")}>
                                        {contract.status}
                                      </Badge>
                                    </div>
                                  </a>
                                )
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* From Concessionaires */}
                      {inheritedContractsConcessionaire.length > 0 && (
                        <Card className="border-warning/30 bg-warning/5">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                              <ChefHat className="h-4 w-4 text-warning" />
                              <span className="text-sm font-medium text-warning">Concessionaires</span>
                            </div>
                            <div className="space-y-2">
                              {inheritedContractsConcessionaire.map((contract: any) => {
                                const sConfig = contractStatusConfig[contract.status as ContractStatus] || contractStatusConfig.pending
                                return (
                                  <a
                                    key={contract.id}
                                    href={contract.url || '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group block p-2 rounded-lg hover:bg-warning/10 transition-colors"
                                  >
                                    <div className="flex items-center gap-2 mb-1">
                                      <ScrollText className="h-4 w-4 text-warning shrink-0" />
                                      <p className="text-sm font-medium line-clamp-1 group-hover:text-warning transition-colors flex-1">
                                        {contract.name}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2 pl-6 flex-wrap">
                                      <Badge variant="outline" className="text-xs">{contractTypeLabels[contract.type as ContractType] || contract.type}</Badge>
                                      <Badge className={cn(sConfig.bgColor, sConfig.color, "capitalize text-xs")}>
                                        {contract.status}
                                      </Badge>
                                    </div>
                                  </a>
                                )
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  ) : (
                    <Card className="border-dashed">
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-muted-foreground">No inherited contracts</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
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
                    {todos.map((todo: any) => (
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
