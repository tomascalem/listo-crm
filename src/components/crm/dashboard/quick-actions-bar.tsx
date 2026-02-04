import { Phone, Video, MapPin, User, CheckSquare, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { LogActivityModal } from "@/components/crm/modals/log-activity-modal"
import { AddVenueModal } from "@/components/crm/modals/add-venue-modal"
import { AddContactModal } from "@/components/crm/modals/add-contact-modal"
import { AddTaskModal } from "@/components/crm/modals/add-task-modal"
import { AddCompanyModal } from "@/components/crm/modals/add-company-modal"

const quickActions = [
  {
    id: "log-call",
    label: "Log Call",
    icon: Phone,
    modal: "log-activity-call",
  },
  {
    id: "log-meeting",
    label: "Log Meeting",
    icon: Video,
    modal: "log-activity-meeting",
  },
  {
    id: "add-venue",
    label: "Add Venue",
    icon: MapPin,
    modal: "add-venue",
  },
  {
    id: "add-contact",
    label: "Add Contact",
    icon: User,
    modal: "add-contact",
  },
  {
    id: "add-task",
    label: "Add Task",
    icon: CheckSquare,
    modal: "add-task",
  },
  {
    id: "add-operator",
    label: "Add Operator",
    icon: Building2,
    modal: "add-company",
  },
]

export function QuickActionsBar() {
  return (
    <div className="flex flex-wrap items-center gap-2 p-4 rounded-lg bg-secondary/30 border border-border">
      <span className="text-sm font-medium text-muted-foreground mr-2">Quick Actions:</span>
      <TooltipProvider>
        {quickActions.map((action) => {
          const Icon = action.icon

          // Render the appropriate modal for each action
          if (action.modal === "log-activity-call") {
            return (
              <LogActivityModal
                key={action.id}
                trigger={
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9">
                        <Icon className="h-4 w-4 mr-1.5" />
                        {action.label}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{action.label}</p>
                    </TooltipContent>
                  </Tooltip>
                }
              />
            )
          }

          if (action.modal === "log-activity-meeting") {
            return (
              <LogActivityModal
                key={action.id}
                trigger={
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9">
                        <Icon className="h-4 w-4 mr-1.5" />
                        {action.label}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{action.label}</p>
                    </TooltipContent>
                  </Tooltip>
                }
              />
            )
          }

          if (action.modal === "add-venue") {
            return (
              <AddVenueModal
                key={action.id}
                trigger={
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9">
                        <Icon className="h-4 w-4 mr-1.5" />
                        {action.label}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{action.label}</p>
                    </TooltipContent>
                  </Tooltip>
                }
              />
            )
          }

          if (action.modal === "add-contact") {
            return (
              <AddContactModal
                key={action.id}
                trigger={
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9">
                        <Icon className="h-4 w-4 mr-1.5" />
                        {action.label}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{action.label}</p>
                    </TooltipContent>
                  </Tooltip>
                }
              />
            )
          }

          if (action.modal === "add-task") {
            return (
              <AddTaskModal
                key={action.id}
                trigger={
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9">
                        <Icon className="h-4 w-4 mr-1.5" />
                        {action.label}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{action.label}</p>
                    </TooltipContent>
                  </Tooltip>
                }
              />
            )
          }

          if (action.modal === "add-company") {
            return (
              <AddCompanyModal
                key={action.id}
                trigger={
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9">
                        <Icon className="h-4 w-4 mr-1.5" />
                        {action.label}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{action.label}</p>
                    </TooltipContent>
                  </Tooltip>
                }
              />
            )
          }

          return null
        })}
      </TooltipProvider>
    </div>
  )
}
