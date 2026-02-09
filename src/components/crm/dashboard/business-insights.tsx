import { Link } from "react-router-dom"
import {
  Newspaper,
  TrendingUp,
  AlertCircle,
  Trophy,
  Inbox,
  FileSignature,
  ArrowUpRight,
  ArrowRight,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useBusinessInsights } from "@/queries/dashboard"

type InsightType = "engagement-metric" | "pipeline-alert" | "milestone" | "inbound-activity" | "contract-news"
type InsightPriority = "positive" | "warning" | "urgent" | "info"

interface BusinessInsightsProps {
  limit?: number
}

const insightTypeConfig: Record<InsightType, { icon: typeof TrendingUp; label: string }> = {
  "engagement-metric": { icon: TrendingUp, label: "Engagement" },
  "pipeline-alert": { icon: AlertCircle, label: "Pipeline" },
  milestone: { icon: Trophy, label: "Milestone" },
  "inbound-activity": { icon: Inbox, label: "Inbound" },
  "contract-news": { icon: FileSignature, label: "Contract" },
}

const priorityConfig: Record<InsightPriority, { borderColor: string; iconColor: string; bgColor: string }> = {
  positive: { borderColor: "border-l-success", iconColor: "text-success", bgColor: "bg-success/5" },
  warning: { borderColor: "border-l-warning", iconColor: "text-warning", bgColor: "bg-warning/5" },
  urgent: { borderColor: "border-l-destructive", iconColor: "text-destructive", bgColor: "bg-destructive/5" },
  info: { borderColor: "border-l-chart-2", iconColor: "text-chart-2", bgColor: "bg-chart-2/5" },
}

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return "Yesterday"
  return `${diffDays}d ago`
}

function formatMetricValue(metric: { value: number; change: number; unit: string }): string {
  if (metric.unit === "$") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 0,
    }).format(metric.value)
  }
  if (metric.unit === "%") {
    const sign = metric.change > 0 ? "+" : ""
    return `${sign}${metric.value}%`
  }
  return `${metric.value}${metric.unit}`
}

export function BusinessInsights({ limit = 4 }: BusinessInsightsProps) {
  const { data: insightsData, isLoading } = useBusinessInsights(limit)

  // Sort by timestamp descending
  const insights = [...(insightsData?.items || [])]
    .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Newspaper className="h-5 w-5 text-primary" />
          Business Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : insights.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Newspaper className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>No insights yet</p>
            <p className="text-sm mt-1">News and updates will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight: any) => {
              const typeConfig = insightTypeConfig[insight.type as InsightType] || insightTypeConfig["engagement-metric"]
              const prioConfig = priorityConfig[insight.priority as InsightPriority] || priorityConfig.info
              const Icon = typeConfig.icon
              const venue = insight.venue || null
              const operator = insight.operator || null

              return (
                <div
                  key={insight.id}
                  className={`p-3 rounded-lg border border-l-4 ${prioConfig.borderColor} ${prioConfig.bgColor} transition-colors hover:bg-secondary/30`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={`p-1.5 rounded ${prioConfig.bgColor}`}>
                      <Icon className={`h-4 w-4 ${prioConfig.iconColor}`} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-sm">{insight.title}</h4>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {formatRelativeTime(insight.timestamp)}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {insight.description}
                      </p>

                      <div className="flex items-center gap-2 mt-2">
                        {insight.metric && (
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              insight.priority === "positive"
                                ? "bg-success/10 text-success border-success/30"
                                : insight.priority === "urgent"
                                  ? "bg-destructive/10 text-destructive border-destructive/30"
                                  : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {insight.metric.change !== 0 && (
                              <ArrowUpRight className="h-3 w-3 mr-0.5" />
                            )}
                            {formatMetricValue(insight.metric)}
                          </Badge>
                        )}

                        {venue && (
                          <Link
                            to={`/venues/${venue.id}`}
                            className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                          >
                            {venue.name}
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        )}

                        {operator && (
                          <Link
                            to={`/operators/${operator.id}`}
                            className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                          >
                            {operator.name}
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
