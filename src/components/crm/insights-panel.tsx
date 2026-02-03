
import { 
  Lightbulb, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp,
  Target,
  ThumbsUp,
  ThumbsDown
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Interaction } from "@/lib/mock-data"

interface InsightsPanelProps {
  interactions: Interaction[]
  showFull?: boolean
}

export function InsightsPanel({ interactions, showFull }: InsightsPanelProps) {
  // Aggregate all highlights, wants, and concerns
  const allHighlights = interactions.flatMap((i) => i.highlights)
  const allWants = interactions.flatMap((i) => i.wants)
  const allConcerns = interactions.flatMap((i) => i.concerns)

  // Remove duplicates and count occurrences
  const countOccurrences = (arr: string[]) => {
    const counts: Record<string, number> = {}
    arr.forEach((item) => {
      const normalized = item.toLowerCase().trim()
      counts[item] = (counts[item] || 0) + 1
    })
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([item, count]) => ({ item, count }))
  }

  const highlightCounts = countOccurrences(allHighlights)
  const wantCounts = countOccurrences(allWants)
  const concernCounts = countOccurrences(allConcerns)

  // Calculate engagement score
  const engagementScore = Math.min(100, Math.round(
    (interactions.length * 10) +
    (interactions.filter(i => i.type === "video" || i.type === "meeting").length * 15)
  ))

  // Calculate sentiment
  const positiveSignals = allHighlights.length + allWants.length
  const negativeSignals = allConcerns.length
  const sentimentScore = positiveSignals > 0 ? Math.round((positiveSignals / (positiveSignals + negativeSignals)) * 100) : 50

  if (!showFull) {
    // Compact view for overview tab
    return (
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-card-foreground flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-warning" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Scores */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-secondary/50 p-3 text-center">
              <p className="text-2xl font-bold text-card-foreground">{engagementScore}</p>
              <p className="text-xs text-muted-foreground">Engagement</p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-3 text-center">
              <p className={cn(
                "text-2xl font-bold",
                sentimentScore >= 70 ? "text-success" : sentimentScore >= 40 ? "text-warning" : "text-destructive"
              )}>
                {sentimentScore}%
              </p>
              <p className="text-xs text-muted-foreground">Positive Sentiment</p>
            </div>
          </div>

          {/* Top Want */}
          {wantCounts[0] && (
            <div className="rounded-lg border border-success/30 bg-success/10 p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-success mb-1">
                <ThumbsUp className="h-4 w-4" />
                Top Priority
              </div>
              <p className="text-sm text-card-foreground">{wantCounts[0].item}</p>
            </div>
          )}

          {/* Top Concern */}
          {concernCounts[0] && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-destructive mb-1">
                <AlertCircle className="h-4 w-4" />
                Key Concern
              </div>
              <p className="text-sm text-card-foreground">{concernCounts[0].item}</p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Full view for insights tab
  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto mb-2 text-accent" />
            <p className="text-3xl font-bold text-card-foreground">{engagementScore}</p>
            <p className="text-sm text-muted-foreground">Engagement Score</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4 text-center">
            <Target className={cn(
              "h-8 w-8 mx-auto mb-2",
              sentimentScore >= 70 ? "text-success" : sentimentScore >= 40 ? "text-warning" : "text-destructive"
            )} />
            <p className="text-3xl font-bold text-card-foreground">{sentimentScore}%</p>
            <p className="text-sm text-muted-foreground">Positive Sentiment</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-success" />
            <p className="text-3xl font-bold text-card-foreground">{allWants.length}</p>
            <p className="text-sm text-muted-foreground">Identified Needs</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
            <p className="text-3xl font-bold text-card-foreground">{allConcerns.length}</p>
            <p className="text-sm text-muted-foreground">Concerns Raised</p>
          </CardContent>
        </Card>
      </div>

      {/* Key Highlights */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-card-foreground flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-warning" />
            Key Highlights
            <Badge variant="secondary" className="ml-auto">{highlightCounts.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {highlightCounts.map(({ item, count }, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <span className="text-card-foreground flex-1">{item}</span>
                {count > 1 && (
                  <Badge variant="secondary" className="text-xs">{count}x</Badge>
                )}
              </li>
            ))}
            {highlightCounts.length === 0 && (
              <p className="text-sm text-muted-foreground">No highlights recorded yet</p>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* What They Want */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-card-foreground flex items-center gap-2">
            <ThumbsUp className="h-4 w-4 text-success" />
            What They Want
            <Badge variant="secondary" className="ml-auto">{wantCounts.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {wantCounts.map(({ item, count }, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <span className="text-success font-bold">+</span>
                <span className="text-card-foreground flex-1">{item}</span>
                {count > 1 && (
                  <Badge variant="secondary" className="text-xs">Mentioned {count}x</Badge>
                )}
              </li>
            ))}
            {wantCounts.length === 0 && (
              <p className="text-sm text-muted-foreground">No specific wants identified yet</p>
            )}
          </ul>
        </CardContent>
      </Card>

      {/* Concerns & Objections */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-card-foreground flex items-center gap-2">
            <ThumbsDown className="h-4 w-4 text-destructive" />
            Concerns & Objections
            <Badge variant="secondary" className="ml-auto">{concernCounts.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {concernCounts.map(({ item, count }, i) => (
              <li key={i} className="flex items-start gap-3 text-sm">
                <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                <span className="text-card-foreground flex-1">{item}</span>
                {count > 1 && (
                  <Badge variant="secondary" className="text-xs">Mentioned {count}x</Badge>
                )}
              </li>
            ))}
            {concernCounts.length === 0 && (
              <p className="text-sm text-muted-foreground">No concerns recorded yet</p>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
