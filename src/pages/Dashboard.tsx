import { Link } from "react-router-dom"
import { Sidebar } from "@/components/crm/sidebar"
import { StatsCards } from "@/components/crm/stats-cards"
import { CompanyList } from "@/components/crm/company-list"
import { RecentActivity } from "@/components/crm/recent-activity"
import { UpcomingTasks } from "@/components/crm/upcoming-tasks"
import { PipelinePreview } from "@/components/crm/pipeline-preview"
import { AddVenueModal } from "@/components/crm/modals/add-venue-modal"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"

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
          {/* Stats */}
          <StatsCards />

          {/* Pipeline Preview */}
          <PipelinePreview />

          {/* Main Grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Company List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Recent Venues</h2>
                <Button variant="ghost" size="sm" className="text-muted-foreground" asChild>
                  <Link to="/venues">View all</Link>
                </Button>
              </div>
              <CompanyList />
            </div>

            {/* Sidebar Content */}
            <div className="space-y-6">
              <UpcomingTasks />
              <RecentActivity />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
