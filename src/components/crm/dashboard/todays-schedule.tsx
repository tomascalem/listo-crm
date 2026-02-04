import { Link } from "react-router-dom"
import { Video, Phone, MapPin, ExternalLink, Calendar } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  getScheduledEventsForUser,
  getVenueById,
  getContactById,
  type ScheduledEvent,
} from "@/lib/mock-data"
import { LogActivityModal } from "@/components/crm/modals/log-activity-modal"

interface TodaysScheduleProps {
  userId: string
  date?: string
}

const eventTypeConfig: Record<ScheduledEvent["type"], { icon: typeof Video; label: string; color: string }> = {
  video: { icon: Video, label: "Video Call", color: "text-chart-2" },
  call: { icon: Phone, label: "Phone Call", color: "text-primary" },
  meeting: { icon: MapPin, label: "Meeting", color: "text-chart-4" },
}

function formatTime(isoString: string): string {
  const date = new Date(isoString)
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

function getTimeRange(start: string, end?: string): string {
  const startTime = formatTime(start)
  if (!end) return startTime
  const endTime = formatTime(end)
  return `${startTime} - ${endTime}`
}

function isEventNow(startTime: string, endTime?: string): boolean {
  const now = new Date()
  const start = new Date(startTime)
  const end = endTime ? new Date(endTime) : new Date(start.getTime() + 30 * 60 * 1000) // Default 30 min
  return now >= start && now <= end
}

function isEventUpcoming(startTime: string): boolean {
  const now = new Date()
  const start = new Date(startTime)
  const diffMinutes = (start.getTime() - now.getTime()) / (1000 * 60)
  return diffMinutes > 0 && diffMinutes <= 15
}

export function TodaysSchedule({ userId, date }: TodaysScheduleProps) {
  const events = getScheduledEventsForUser(userId, date)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-primary" />
          Today's Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>No meetings scheduled for today</p>
            <p className="text-sm mt-1">Enjoy your open calendar!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              const config = eventTypeConfig[event.type]
              const Icon = config.icon
              const venue = getVenueById(event.venueId)
              const contact = getContactById(event.contactId)
              const isNow = isEventNow(event.startTime, event.endTime)
              const isUpcoming = isEventUpcoming(event.startTime)

              return (
                <div
                  key={event.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                    isNow
                      ? "bg-primary/5 border-primary"
                      : isUpcoming
                        ? "bg-warning/5 border-warning/50"
                        : "bg-card border-border hover:bg-secondary/30"
                  }`}
                >
                  {/* Time & Icon */}
                  <div className="flex flex-col items-center min-w-[80px]">
                    <div className={`p-2 rounded-lg ${isNow ? "bg-primary/10" : "bg-secondary"}`}>
                      <Icon className={`h-4 w-4 ${isNow ? "text-primary" : config.color}`} />
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">
                      {formatTime(event.startTime)}
                    </span>
                    {(isNow || isUpcoming) && (
                      <Badge
                        variant="outline"
                        className={`mt-1 text-xs ${
                          isNow
                            ? "border-primary text-primary bg-primary/10"
                            : "border-warning text-warning bg-warning/10"
                        }`}
                      >
                        {isNow ? "Now" : "Soon"}
                      </Badge>
                    )}
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{event.title}</h4>
                    {venue && (
                      <Link
                        to={`/venues/${venue.id}`}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        {venue.name}
                      </Link>
                    )}
                    {contact && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        with {contact.name}
                      </p>
                    )}
                    {event.notes && (
                      <p className="text-xs text-muted-foreground mt-1 italic">
                        {event.notes}
                      </p>
                    )}
                    {event.location && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.location}
                      </p>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="flex-shrink-0">
                    {event.type === "video" && event.meetingLink ? (
                      <Button
                        size="sm"
                        className={isNow ? "bg-primary" : ""}
                        onClick={() => window.open(event.meetingLink, "_blank")}
                      >
                        <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                        Join
                      </Button>
                    ) : event.type === "call" ? (
                      <LogActivityModal
                        trigger={
                          <Button size="sm" variant={isNow ? "default" : "outline"}>
                            <Phone className="h-3.5 w-3.5 mr-1.5" />
                            Log Call
                          </Button>
                        }
                        venueId={event.venueId}
                        contactId={event.contactId}
                      />
                    ) : (
                      <Link to={`/venues/${event.venueId}`}>
                        <Button size="sm" variant="outline">
                          View
                        </Button>
                      </Link>
                    )}
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
