
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VenuesList } from "@/components/crm/venues-list"
import { ContactsList } from "@/components/crm/contacts-list"
import { InteractionTimeline } from "@/components/crm/interaction-timeline"
import { InsightsPanel } from "@/components/crm/insights-panel"
import { TodosList } from "@/components/crm/todos-list"
import type { Company, Venue, Contact, Interaction, Todo } from "@/lib/mock-data"

interface CompanyTabsProps {
  company: Company
  venues: Venue[]
  contacts: Contact[]
  interactions: Interaction[]
  todos: Todo[]
}

export function CompanyTabs({ company, venues, contacts, interactions, todos }: CompanyTabsProps) {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="border-b border-border bg-card/50">
        <TabsList className="h-12 bg-transparent px-6 gap-1">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-secondary data-[state=active]:text-foreground"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="venues"
            className="data-[state=active]:bg-secondary data-[state=active]:text-foreground"
          >
            Venues ({venues.length})
          </TabsTrigger>
          <TabsTrigger 
            value="contacts"
            className="data-[state=active]:bg-secondary data-[state=active]:text-foreground"
          >
            Contacts ({contacts.length})
          </TabsTrigger>
          <TabsTrigger 
            value="timeline"
            className="data-[state=active]:bg-secondary data-[state=active]:text-foreground"
          >
            Timeline ({interactions.length})
          </TabsTrigger>
          <TabsTrigger 
            value="tasks"
            className="data-[state=active]:bg-secondary data-[state=active]:text-foreground"
          >
            Tasks ({todos.filter(t => !t.completed).length})
          </TabsTrigger>
          <TabsTrigger 
            value="insights"
            className="data-[state=active]:bg-secondary data-[state=active]:text-foreground"
          >
            Insights
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="p-6">
        <TabsContent value="overview" className="mt-0 space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <InteractionTimeline interactions={interactions.slice(0, 5)} />
              <VenuesList venues={venues} compact />
            </div>
            <div className="space-y-6">
              <InsightsPanel interactions={interactions} />
              <TodosList todos={todos.filter(t => !t.completed).slice(0, 5)} compact />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="venues" className="mt-0">
          <VenuesList venues={venues} />
        </TabsContent>

        <TabsContent value="contacts" className="mt-0">
          <ContactsList contacts={contacts} />
        </TabsContent>

        <TabsContent value="timeline" className="mt-0">
          <InteractionTimeline interactions={interactions} showFull />
        </TabsContent>

        <TabsContent value="tasks" className="mt-0">
          <TodosList todos={todos} />
        </TabsContent>

        <TabsContent value="insights" className="mt-0">
          <InsightsPanel interactions={interactions} showFull />
        </TabsContent>
      </div>
    </Tabs>
  )
}
