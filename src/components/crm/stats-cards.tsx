import React from "react"
import { MapPin, Users, DollarSign, TrendingUp, Target, CheckCircle2, Building2, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useVenues } from "@/queries/venues"

interface StatCardProps {
  title: string
  value: string
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: React.ReactNode
}

function StatCard({ title, value, change, changeType = "neutral", icon }: StatCardProps) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-card-foreground">{value}</p>
            {change && (
              <p
                className={`text-sm font-medium ${
                  changeType === "positive"
                    ? "text-success"
                    : changeType === "negative"
                    ? "text-destructive"
                    : "text-muted-foreground"
                }`}
              >
                {change}
              </p>
            )}
          </div>
          <div className="rounded-lg bg-primary/10 p-3 text-primary">{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

export function StatsCards() {
  const { data: venues = [], isLoading } = useVenues()

  const totalVenues = venues.length
  const activeDeals = venues.filter((v: any) => v.stage !== "closed-won" && v.stage !== "closed-lost").length
  const clientVenues = venues.filter((v: any) => v.status === "client").length
  const pipelineValue = venues.reduce((sum: number, v: any) => sum + (v.dealValue || 0), 0)
  const wonDeals = venues.filter((v: any) => v.stage === "closed-won").length
  const winRate = totalVenues > 0 ? Math.round((wonDeals / totalVenues) * 100) : 0

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`
    return `$${amount}`
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-6 flex items-center justify-center h-[120px]">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Venues"
        value={totalVenues.toString()}
        change={`${clientVenues} clients`}
        changeType="positive"
        icon={<MapPin className="h-5 w-5" />}
      />
      <StatCard
        title="Active Deals"
        value={activeDeals.toString()}
        change="In pipeline"
        changeType="neutral"
        icon={<Target className="h-5 w-5" />}
      />
      <StatCard
        title="Pipeline Value"
        value={formatCurrency(pipelineValue)}
        change="+18% from last quarter"
        changeType="positive"
        icon={<DollarSign className="h-5 w-5" />}
      />
      <StatCard
        title="Win Rate"
        value={`${winRate}%`}
        change={`${wonDeals} won deals`}
        changeType="positive"
        icon={<TrendingUp className="h-5 w-5" />}
      />
    </div>
  )
}
