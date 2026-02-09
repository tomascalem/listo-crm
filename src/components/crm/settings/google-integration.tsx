import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Calendar,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Unlink,
  ExternalLink,
} from "lucide-react";
import {
  useGoogleStatus,
  useConnectGoogle,
  useDisconnectGoogle,
  useSyncCalendar,
} from "@/queries/google";
import { toast } from "sonner";

export function GoogleIntegration() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: status, isLoading, error } = useGoogleStatus();
  const connectGoogle = useConnectGoogle();
  const disconnectGoogle = useDisconnectGoogle();
  const syncCalendar = useSyncCalendar();

  // Handle OAuth callback results from URL params
  useEffect(() => {
    const googleResult = searchParams.get("google");
    const email = searchParams.get("email");
    const message = searchParams.get("message");

    if (googleResult === "success") {
      toast.success(`Successfully connected Google account: ${email}`);
      // Clean up URL params
      searchParams.delete("google");
      searchParams.delete("email");
      setSearchParams(searchParams, { replace: true });
    } else if (googleResult === "error") {
      toast.error(`Failed to connect Google account: ${message || "Unknown error"}`);
      // Clean up URL params
      searchParams.delete("google");
      searchParams.delete("message");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleConnect = () => {
    connectGoogle.mutate();
  };

  const handleDisconnect = async () => {
    if (
      window.confirm(
        "Are you sure you want to disconnect your Google account? This will stop email and calendar sync."
      )
    ) {
      try {
        await disconnectGoogle.mutateAsync();
        toast.success("Google account disconnected");
      } catch (err) {
        toast.error("Failed to disconnect Google account");
      }
    }
  };

  const handleSyncCalendar = async (fullSync = false) => {
    try {
      const result = await syncCalendar.mutateAsync(fullSync);
      toast.success(
        `Calendar sync completed: ${result.imported} imported, ${result.updated} updated`
      );
    } catch (err: any) {
      toast.error(err.message || "Calendar sync failed");
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Never";
    return new Date(date).toLocaleString();
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  // Handle case where Google OAuth is not configured
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google Workspace
          </CardTitle>
          <CardDescription>
            Connect Gmail and Google Calendar for email sync and scheduling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-2">
              Google integration is not configured yet.
            </p>
            <p className="text-sm text-muted-foreground">
              Set up GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your environment.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google Workspace
            </CardTitle>
            <CardDescription>
              Connect Gmail and Google Calendar for email sync and scheduling
            </CardDescription>
          </div>
          {status?.connected && (
            <Badge variant="outline" className="bg-success/10 text-success border-success/30">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!status?.connected ? (
          <div className="text-center py-8">
            <div className="h-16 w-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">
              Connect your Google account to sync emails and calendar events
            </p>
            <Button onClick={handleConnect} disabled={connectGoogle.isPending}>
              {connectGoogle.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              <ExternalLink className="h-4 w-4 mr-2" />
              Connect Google Account
            </Button>
          </div>
        ) : (
          <>
            {/* Connected Account Info */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/30">
              <div>
                <p className="font-medium">{status.email}</p>
                <p className="text-sm text-muted-foreground">
                  Connected {formatDate(status.connectedAt)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisconnect}
                disabled={disconnectGoogle.isPending}
                className="text-destructive hover:text-destructive"
              >
                {disconnectGoogle.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Unlink className="h-4 w-4 mr-2" />
                )}
                Disconnect
              </Button>
            </div>

            <Separator />

            {/* Gmail Add-on */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/10">
                    <Mail className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="font-medium">Gmail</p>
                    <p className="text-sm text-muted-foreground">
                      Use the Gmail Add-on to send emails to CRM
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-chart-2/10 text-chart-2 border-chart-2/30">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Add-on
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground pl-11">
                Install the Listo CRM Gmail Add-on to manually import email threads. Open any email in Gmail and click "Send to CRM" in the sidebar.
              </p>
            </div>

            <Separator />

            {/* Calendar Sync */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-chart-2/10">
                    <Calendar className="h-5 w-5 text-chart-2" />
                  </div>
                  <div>
                    <p className="font-medium">Google Calendar Sync</p>
                    <p className="text-sm text-muted-foreground">
                      Last synced: {formatDate(status.lastCalendarSync)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {status.syncStatus?.calendarSyncStatus === "syncing" ? (
                    <Badge variant="outline">
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      Syncing...
                    </Badge>
                  ) : status.syncStatus?.calendarSyncStatus === "error" ? (
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Error
                    </Badge>
                  ) : null}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSyncCalendar(false)}
                    disabled={
                      syncCalendar.isPending ||
                      status.syncStatus?.calendarSyncStatus === "syncing"
                    }
                  >
                    {syncCalendar.isPending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Sync Now
                  </Button>
                </div>
              </div>
              {status.syncStatus?.lastCalendarError && (
                <p className="text-sm text-destructive pl-11">
                  {status.syncStatus.lastCalendarError}
                </p>
              )}
              <p className="text-xs text-muted-foreground pl-11">
                Calendar events are imported and appear in your schedule
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
