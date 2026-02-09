import { useState } from "react"
import { Link } from "react-router-dom"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import {
  MapPin,
  Building2,
  Calendar,
  Watch,
  Smartphone,
  Tablet,
  Users,
  Phone,
  Mail,
  ExternalLink,
  Lightbulb,
  Target,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle2,
  Landmark,
  TreePine,
  Drama,
  Building,
  Star,
  Sparkles,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import {
  type Venue,
  type VenueType,
  type UseCase,
} from "@/lib/mock-data"
import { useVenueContacts, useVenueInteractions } from "@/queries/venues"

interface OpportunityModalProps {
  venue: Venue
  open: boolean
  onOpenChange: (open: boolean) => void
}

const stageConfig: Record<string, { label: string; color: string; bgColor: string; dotColor: string }> = {
  lead: { label: "Lead", color: "text-slate-100", bgColor: "bg-slate-600/80", dotColor: "bg-slate-400" },
  qualified: { label: "Qualified", color: "text-teal-100", bgColor: "bg-teal-600/80", dotColor: "bg-teal-400" },
  demo: { label: "Demo", color: "text-blue-100", bgColor: "bg-blue-600/80", dotColor: "bg-blue-400" },
  proposal: { label: "Proposal", color: "text-amber-100", bgColor: "bg-amber-600/80", dotColor: "bg-amber-400" },
  negotiation: { label: "Negotiation", color: "text-pink-100", bgColor: "bg-pink-600/80", dotColor: "bg-pink-400" },
  "closed-won": { label: "Closed Won", color: "text-green-100", bgColor: "bg-green-600/80", dotColor: "bg-green-400" },
  "closed-lost": { label: "Closed Lost", color: "text-red-100", bgColor: "bg-red-600/80", dotColor: "bg-red-400" },
}

const venueTypeConfig: Record<VenueType, { icon: typeof Building2; color: string }> = {
  stadium: { icon: Landmark, color: "text-primary" },
  arena: { icon: Building2, color: "text-chart-2" },
  amphitheater: { icon: TreePine, color: "text-success" },
  theater: { icon: Drama, color: "text-chart-4" },
  "convention-center": { icon: Building, color: "text-chart-3" },
  other: { icon: Star, color: "text-muted-foreground" },
}

const useCaseLabels: Record<UseCase, string> = {
  suites: "Suites",
  "back-of-house": "Back of House",
  warehouse: "Warehouse",
  "labor-tracking": "Labor Tracking",
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

// Generate AI-like deal status analysis
function generateDealStatus(venue: Venue, interactionCount: number): {
  health: "healthy" | "attention" | "at-risk"
  healthLabel: string
  summary: string
  reason: string | null
  nextStep: string
} {
  const now = new Date()
  const lastActivity = new Date(venue.lastActivity)
  const diffDays = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
  const stage = venue.stage
  const dealValue = venue.dealValue || 0

  // Determine health status
  let health: "healthy" | "attention" | "at-risk" = "healthy"
  let reason: string | null = null

  if (stage === "negotiation" && diffDays >= 10) {
    health = "at-risk"
    reason = `No activity for ${diffDays} days in the critical negotiation stage`
  } else if (dealValue > 300000 && diffDays >= 14) {
    health = "at-risk"
    reason = `This high-value deal ($${(dealValue / 1000).toFixed(0)}K) has been inactive for ${diffDays} days`
  } else if (diffDays >= 30) {
    health = "at-risk"
    reason = `No touchpoint recorded in the last ${diffDays} days`
  } else if (diffDays >= 14 || (stage === "proposal" && diffDays >= 7)) {
    health = "attention"
    reason = diffDays >= 14
      ? `It's been ${diffDays} days since the last interaction`
      : `Proposal stage deals typically need follow-up within a week`
  }

  const healthLabels = {
    healthy: "On Track",
    attention: "Needs Attention",
    "at-risk": "At Risk",
  }

  // Generate contextual summary based on stage and activity
  let summary = ""
  let nextStep = ""

  switch (stage) {
    case "lead":
      summary = interactionCount === 0
        ? "New lead that hasn't been contacted yet. Initial outreach is needed to qualify the opportunity."
        : `Lead with ${interactionCount} interaction${interactionCount > 1 ? "s" : ""} logged. Consider qualifying by understanding their needs and timeline.`
      nextStep = interactionCount === 0 ? "Make initial contact to introduce your solution" : "Schedule a discovery call to qualify the opportunity"
      break
    case "qualified":
      summary = `Qualified opportunity showing interest. ${interactionCount} interaction${interactionCount > 1 ? "s" : ""} recorded. Ready to move toward a demo or deeper engagement.`
      nextStep = "Schedule a product demo to showcase capabilities"
      break
    case "demo":
      summary = `Demo stage with ${interactionCount} logged interaction${interactionCount > 1 ? "s" : ""}. The prospect has seen the product and is evaluating fit.`
      nextStep = "Follow up on demo feedback and address any concerns"
      break
    case "proposal":
      summary = `Proposal has been sent. ${diffDays === 0 ? "Sent today" : diffDays === 1 ? "Sent yesterday" : `Last activity ${diffDays} days ago`}. Awaiting response or negotiation.`
      nextStep = diffDays >= 5 ? "Follow up on proposal status" : "Allow time for internal review, then follow up"
      break
    case "negotiation":
      summary = `Active negotiation phase with ${interactionCount} interaction${interactionCount > 1 ? "s" : ""}. Terms and pricing are being discussed.`
      nextStep = diffDays >= 7 ? "Re-engage to keep momentum and close the deal" : "Continue negotiations and address any blockers"
      break
    case "closed-won":
      summary = "Deal successfully closed! This venue is now a customer."
      nextStep = "Begin onboarding and implementation process"
      break
    case "closed-lost":
      summary = "This opportunity did not convert. Consider documenting learnings for future reference."
      nextStep = "Log reasons for loss and plan re-engagement strategy"
      break
    default:
      summary = `Deal in ${stage} stage with ${interactionCount} recorded interactions.`
      nextStep = "Review deal status and plan next action"
  }

  return {
    health,
    healthLabel: healthLabels[health],
    summary,
    reason,
    nextStep,
  }
}

export function OpportunityModal({ venue, open, onOpenChange }: OpportunityModalProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // Fetch contacts and interactions from API
  const { data: contacts = [] } = useVenueContacts(venue.id)
  const { data: interactions = [] } = useVenueInteractions(venue.id)

  // Use data from the venue object (already populated by API)
  const operator = venue.operator
  const concessionaires = venue.concessionaires || []
  const assignedUsers = venue.assignedUsers || []
  const stage = stageConfig[venue.stage]
  const typeConfig = venueTypeConfig[venue.type]
  const TypeIcon = typeConfig.icon

  const probability = venue.stage === "closed-won" ? 100 : venue.stage === "closed-lost" ? 0 : venue.probability || 0
  const weightedValue = (venue.dealValue || 0) * probability / 100
  const totalLicenses = venue.opportunity
    ? venue.opportunity.licenses.watches + venue.opportunity.licenses.mobile + venue.opportunity.licenses.tablets
    : 0

  // Generate AI deal status
  const dealStatus = generateDealStatus(venue, interactions.length)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[960px] w-[960px] max-h-[85vh] overflow-hidden p-0" showCloseButton={false}>
        {/* Hero Header */}
        <div className="relative h-44 bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden">
          {venue.imageUrl && (
            <img
              src={venue.imageUrl}
              alt={venue.name}
              className="absolute inset-0 w-full h-full object-cover opacity-50"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />

          {/* Close button */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/50 hover:bg-black/70 text-white/90 hover:text-white flex items-center justify-center transition-colors z-10"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 1l12 12M13 1L1 13" />
            </svg>
          </button>

          {/* Venue info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="flex items-end justify-between gap-4">
              <div className="flex items-end gap-4">
                {/* Team logo */}
                {venue.teamLogoUrl && (
                  <div className="h-14 w-14 bg-white rounded-lg shadow-lg p-1.5 flex items-center justify-center shrink-0">
                    <img
                      src={venue.teamLogoUrl}
                      alt={venue.teamName || "Team"}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge className={`${stage.bgColor} ${stage.color} border-0 font-medium backdrop-blur-sm`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${stage.dotColor} mr-1.5`} />
                      {stage.label}
                    </Badge>
                    {venue.teamName && (
                      <span className="text-xs text-white bg-black/40 px-2 py-0.5 rounded backdrop-blur-sm">
                        {venue.teamName}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2 drop-shadow-lg">
                    <TypeIcon className="h-4 w-4 text-white/90" />
                    {venue.name}
                  </h2>
                  <div className="flex items-center gap-3 mt-1 text-xs text-white/90 drop-shadow">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {venue.city}, {venue.state}
                    </span>
                    <span>{venue.capacity?.toLocaleString()} capacity</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="text-2xl font-bold text-white drop-shadow-lg">
                  {venue.dealValue ? formatCurrency(venue.dealValue) : "-"}
                </p>
                <p className="text-xs text-white/90 drop-shadow">
                  {formatCurrency(weightedValue)} weighted ({probability}%)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col overflow-hidden" style={{ height: 'calc(85vh - 11rem)' }}>
          {/* Quick stats bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30 shrink-0">
            <div className="flex items-center gap-8">
              {/* Assigned users with avatars */}
              {assignedUsers.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {assignedUsers.map((user) => (
                      <Avatar key={user!.id} className="h-9 w-9 border-2 border-background">
                        {user!.avatarUrl ? (
                          <AvatarImage src={user!.avatarUrl} alt={user!.name} />
                        ) : null}
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {user!.avatar}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <div>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Assigned to</p>
                    <p className="text-sm font-medium">
                      {assignedUsers.length === 1
                        ? assignedUsers[0]!.name
                        : assignedUsers.map(u => u!.name.split(' ')[0]).join(', ')}
                    </p>
                  </div>
                </div>
              )}

              {operator && (
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Operator</p>
                  <p className="text-sm font-medium">{operator.name}</p>
                </div>
              )}

              {concessionaires.length > 0 && (
                <div>
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Concessionaire</p>
                  <p className="text-sm font-medium">{concessionaires.map((c) => c?.name).join(", ")}</p>
                </div>
              )}
            </div>

            <Button variant="default" size="sm" asChild>
              <Link to={`/venues/${venue.id}`} onClick={() => onOpenChange(false)}>
                <ExternalLink className="h-4 w-4 mr-1.5" />
                Full Details
              </Link>
            </Button>
          </div>

          {/* Tabs content */}
          <div className="flex-1 overflow-y-auto p-6 pb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="contacts">Contacts ({contacts.length})</TabsTrigger>
                <TabsTrigger value="activity">Activity ({interactions.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-0 space-y-6">
                {/* AI Deal Status Summary */}
                <div className={`rounded-lg border overflow-hidden ${
                  dealStatus.health === "healthy" ? "border-success/30 bg-success/5" :
                  dealStatus.health === "attention" ? "border-warning/30 bg-warning/5" :
                  "border-destructive/30 bg-destructive/5"
                }`}>
                  <div className={`flex items-start gap-3 p-4 border-l-4 ${
                    dealStatus.health === "healthy" ? "border-l-success" :
                    dealStatus.health === "attention" ? "border-l-warning" :
                    "border-l-destructive"
                  }`}>
                    <div className={`p-2 rounded-lg shrink-0 ${
                      dealStatus.health === "healthy" ? "bg-success/20" :
                      dealStatus.health === "attention" ? "bg-warning/20" :
                      "bg-destructive/20"
                    }`}>
                      {dealStatus.health === "healthy" && <CheckCircle className="h-4 w-4 text-success" />}
                      {dealStatus.health === "attention" && <AlertCircle className="h-4 w-4 text-warning" />}
                      {dealStatus.health === "at-risk" && <AlertTriangle className="h-4 w-4 text-destructive" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm font-semibold ${
                          dealStatus.health === "healthy" ? "text-success" :
                          dealStatus.health === "attention" ? "text-warning" :
                          "text-destructive"
                        }`}>{dealStatus.healthLabel}</span>
                        <span className="text-xs text-muted-foreground">·</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Sparkles className="h-3 w-3" />
                          AI Analysis
                        </span>
                      </div>
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {dealStatus.summary}
                        {dealStatus.reason && (
                          <span className={`font-medium ${dealStatus.health === "at-risk" ? "text-destructive" : "text-warning"}`}>
                            {" "}{dealStatus.reason}.
                          </span>
                        )}
                      </p>
                      <div className={`flex items-center gap-2 mt-3 pt-3 border-t ${
                        dealStatus.health === "healthy" ? "border-success/20" :
                        dealStatus.health === "attention" ? "border-warning/20" :
                        "border-destructive/20"
                      }`}>
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Suggested action:</span>
                        <span className={`text-sm font-medium px-2.5 py-1 rounded-md ${
                          dealStatus.health === "healthy" ? "bg-success/10 text-success" :
                          dealStatus.health === "attention" ? "bg-warning/10 text-warning" :
                          "bg-destructive/10 text-destructive"
                        }`}>{dealStatus.nextStep}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {venue.opportunity && (
                  <>
                    {/* Use Cases & Licenses - side by side */}
                    <div className="grid grid-cols-2 gap-6">
                      <Card>
                        <CardContent className="p-5">
                          <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                            <Target className="h-4 w-4 text-primary" />
                            Use Cases
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {venue.opportunity.useCases.map((uc) => (
                              <Badge key={uc} variant="secondary" className="text-xs px-3 py-1">
                                {useCaseLabels[uc]}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-5">
                          <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-chart-2" />
                            Licenses
                            <span className="text-muted-foreground font-normal">({totalLicenses} total)</span>
                          </h4>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-3 rounded-lg bg-muted/50">
                              <Watch className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-xl font-bold">{venue.opportunity.licenses.watches}</p>
                              <p className="text-xs text-muted-foreground">Watches</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-muted/50">
                              <Smartphone className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-xl font-bold">{venue.opportunity.licenses.mobile}</p>
                              <p className="text-xs text-muted-foreground">Mobile</p>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-muted/50">
                              <Tablet className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-xl font-bold">{venue.opportunity.licenses.tablets}</p>
                              <p className="text-xs text-muted-foreground">Tablets</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Timeline info - 3 columns */}
                    <div className="grid grid-cols-3 gap-6">
                      <Card>
                        <CardContent className="p-5">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className={`h-4 w-4 ${venue.opportunity.onsiteInterest ? "text-success" : "text-muted-foreground"}`} />
                            <span className="text-xs text-muted-foreground uppercase tracking-wide">Onsite Interest</span>
                          </div>
                          <p className="text-xl font-bold">
                            {venue.opportunity.onsiteInterest ? "Yes" : "No"}
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-5">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-chart-2" />
                            <span className="text-xs text-muted-foreground uppercase tracking-wide">Expected Release</span>
                          </div>
                          <p className="text-xl font-bold">
                            {venue.opportunity.expectedReleaseDate
                              ? formatDate(venue.opportunity.expectedReleaseDate)
                              : "TBD"}
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-5">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="h-4 w-4 text-chart-4" />
                            <span className="text-xs text-muted-foreground uppercase tracking-wide">Last Activity</span>
                          </div>
                          <p className="text-xl font-bold">
                            {formatDate(venue.lastActivity)}
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Intel Section */}
                    {venue.opportunity.intel && (
                      <Card>
                        <CardContent className="p-5">
                          <h4 className="text-sm font-semibold mb-5 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4 text-warning" />
                            Intelligence
                            <span className="text-xs font-normal text-muted-foreground">(AI Generated)</span>
                          </h4>
                          <div className="grid grid-cols-3 gap-8">
                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground uppercase tracking-wide">How they heard about us</span>
                              </div>
                              <p className="text-sm font-medium">
                                {venue.opportunity.intel.source || "Unknown"}
                              </p>
                            </div>

                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <Target className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground uppercase tracking-wide">Interests</span>
                              </div>
                              {venue.opportunity.intel.interests && venue.opportunity.intel.interests.length > 0 ? (
                                <ul className="space-y-1.5">
                                  {venue.opportunity.intel.interests.map((interest, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm">
                                      <span className="text-success mt-1">•</span>
                                      <span>{interest}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-muted-foreground">None recorded</p>
                              )}
                            </div>

                            <div>
                              <div className="flex items-center gap-2 mb-3">
                                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground uppercase tracking-wide">Pain Points</span>
                              </div>
                              {venue.opportunity.intel.painPoints && venue.opportunity.intel.painPoints.length > 0 ? (
                                <ul className="space-y-1.5">
                                  {venue.opportunity.intel.painPoints.map((pain, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm">
                                      <span className="text-destructive mt-1">•</span>
                                      <span>{pain}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-sm text-muted-foreground">None recorded</p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </TabsContent>

              <TabsContent value="contacts" className="mt-0 space-y-3">
                {contacts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-12">
                    No contacts associated with this venue yet.
                  </p>
                ) : (
                  contacts.map((contact: any) => (
                    <Card key={contact.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                {contact.avatar || contact.name.split(" ").map((n: string) => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{contact.name}</p>
                                {contact.isPrimary && (
                                  <Badge variant="outline" className="text-[10px] h-5 bg-success/10 text-success border-success/30">
                                    Primary
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">{contact.role}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                              <a href={`mailto:${contact.email}`}>
                                <Mail className="h-4 w-4" />
                              </a>
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                              <a href={`tel:${contact.phone}`}>
                                <Phone className="h-4 w-4" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="activity" className="mt-0 space-y-3">
                {interactions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-12">
                    No activity recorded yet.
                  </p>
                ) : (
                  interactions.slice(0, 5).map((interaction: any) => {
                    const user = interaction.user
                    return (
                      <Card key={interaction.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg shrink-0 ${
                              interaction.type === "call" ? "bg-chart-2/10" :
                              interaction.type === "email" ? "bg-primary/10" :
                              interaction.type === "meeting" ? "bg-success/10" :
                              interaction.type === "video" ? "bg-chart-4/10" :
                              "bg-muted"
                            }`}>
                              {interaction.type === "call" && <Phone className="h-4 w-4 text-chart-2" />}
                              {interaction.type === "email" && <Mail className="h-4 w-4 text-primary" />}
                              {interaction.type === "meeting" && <Users className="h-4 w-4 text-success" />}
                              {interaction.type === "video" && <Users className="h-4 w-4 text-chart-4" />}
                              {interaction.type === "note" && <Calendar className="h-4 w-4 text-muted-foreground" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-medium capitalize">{interaction.type}</p>
                                <span className="text-xs text-muted-foreground">
                                  {formatDate(interaction.date)}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {interaction.summary}
                              </p>
                              {user && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  by {user.name}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
                {interactions.length > 5 && (
                  <Button variant="outline" className="w-full" asChild>
                    <Link to={`/venues/${venue.id}`} onClick={() => onOpenChange(false)}>
                      View all {interactions.length} activities
                    </Link>
                  </Button>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
