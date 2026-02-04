import { Sidebar } from "@/components/crm/sidebar"
import { StatsCards } from "@/components/crm/stats-cards"
import { AddVenueModal } from "@/components/crm/modals/add-venue-modal"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"

// New dashboard components
import { DashboardGreeting } from "@/components/crm/dashboard/dashboard-greeting"
import { QuickActionsBar } from "@/components/crm/dashboard/quick-actions-bar"
import { TodaysSchedule } from "@/components/crm/dashboard/todays-schedule"
import { TodoActionList } from "@/components/crm/dashboard/todo-action-list"
import { RecommendedActions } from "@/components/crm/dashboard/recommended-actions"
import { BusinessInsights } from "@/components/crm/dashboard/business-insights"

// Current user ID - in a real app, this would come from auth context
const CURRENT_USER_ID = "user-1"

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-foreground">Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
            </Button>
            <AddVenueModal />
          </div>
        </header>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Personalized Greeting */}
          <DashboardGreeting userId={CURRENT_USER_ID} />

          {/* Quick Actions Bar */}
          <QuickActionsBar />

          {/* Main Action Grid - 2 columns */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Left Column - Schedule & Tasks */}
            <div className="space-y-6">
              <TodaysSchedule userId={CURRENT_USER_ID} />
              <TodoActionList userId={CURRENT_USER_ID} limit={5} />
            </div>

            {/* Right Column - AI Recommendations & Insights */}
            <div className="space-y-6">
              <RecommendedActions userId={CURRENT_USER_ID} limit={3} />
              <BusinessInsights limit={4} />
            </div>
          </div>

          {/* Stats Overview at bottom */}
          <div className="pt-4">
            <h2 className="text-lg font-semibold text-foreground mb-4">Overview</h2>
            <StatsCards />
          </div>
        </div>
      </main>
    </div>
  )
}
