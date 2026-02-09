import { useUser } from "@/queries/users"
import { useDashboardSchedule, useDashboardTodos } from "@/queries/dashboard"

interface DashboardGreetingProps {
  userId: string
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 17) return "Good afternoon"
  return "Good evening"
}

function getWeekRange(): { start: Date; end: Date } {
  const today = new Date()
  const dayOfWeek = today.getDay()
  const start = new Date(today)
  start.setDate(today.getDate() - dayOfWeek)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return { start, end }
}

export function DashboardGreeting({ userId }: DashboardGreetingProps) {
  const { data: user } = useUser(userId)
  const firstName = user?.name?.split(" ")[0] || "there"

  // Get today's date in ISO format for filtering
  const today = new Date().toISOString().split("T")[0]

  // Fetch today's events
  const { data: scheduleData } = useDashboardSchedule(today)
  const todaysEvents = scheduleData?.items || []
  const meetingCount = todaysEvents.length

  // Fetch user's todos
  const { data: todosData } = useDashboardTodos(50)
  const allTodos = todosData?.items || []

  // Count tasks due this week
  const { end: weekEnd } = getWeekRange()
  const weekTodos = allTodos.filter((t: any) => new Date(t.dueDate) <= weekEnd)
  const tasksDueThisWeek = weekTodos.length

  // Count high priority items
  const highPriorityCount = allTodos.filter((t: any) => t.priority === "high").length

  return (
    <div className="rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
      <h1 className="text-2xl font-semibold text-foreground">
        {getGreeting()}, {firstName}
      </h1>
      <p className="mt-1 text-muted-foreground">
        {meetingCount === 0 && tasksDueThisWeek === 0 ? (
          "You're all caught up! No meetings today and no tasks due this week."
        ) : (
          <>
            You have{" "}
            {meetingCount > 0 && (
              <>
                <span className="font-medium text-foreground">
                  {meetingCount} {meetingCount === 1 ? "meeting" : "meetings"}
                </span>{" "}
                today
              </>
            )}
            {meetingCount > 0 && tasksDueThisWeek > 0 && " and "}
            {tasksDueThisWeek > 0 && (
              <>
                <span className="font-medium text-foreground">
                  {tasksDueThisWeek} {tasksDueThisWeek === 1 ? "task" : "tasks"}
                </span>{" "}
                due this week
              </>
            )}
            {highPriorityCount > 0 && (
              <>
                {" "}
                <span className="text-destructive">
                  ({highPriorityCount} high priority)
                </span>
              </>
            )}
            .
          </>
        )}
      </p>
    </div>
  )
}
