import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Mail, Send, ExternalLink, Sparkles, User } from "lucide-react"
import { getContactById, getVenueById } from "@/lib/mock-data"

interface EmailComposerModalProps {
  trigger: React.ReactNode
  contactId: string
  venueId: string
  subject?: string
  body?: string
  onSend?: (data: { to: string; subject: string; body: string }) => void
}

export function EmailComposerModal({
  trigger,
  contactId,
  venueId,
  subject: initialSubject = "",
  body: initialBody = "",
  onSend,
}: EmailComposerModalProps) {
  const [open, setOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [subject, setSubject] = useState(initialSubject)
  const [body, setBody] = useState(initialBody)

  const contact = getContactById(contactId)
  const venue = getVenueById(venueId)

  // Reset form when modal opens with new content
  useEffect(() => {
    if (open) {
      setSubject(initialSubject)
      setBody(initialBody)
    }
  }, [open, initialSubject, initialBody])

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!contact) return

    setIsSending(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (onSend) {
      onSend({ to: contact.email, subject, body })
    }

    setIsSending(false)
    setOpen(false)
  }

  const handleOpenInGmail = () => {
    if (!contact) return
    const mailtoUrl = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.open(mailtoUrl, "_blank")
  }

  if (!contact) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Compose Email
            {initialBody && (
              <Badge variant="outline" className="ml-2 text-xs bg-primary/10 text-primary border-primary/30">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Draft
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Send an email to {contact.name} at {venue?.name || "this venue"}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSend} className="space-y-4 mt-4">
          {/* To Field */}
          <div className="space-y-2">
            <Label htmlFor="email-to">To</Label>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30 border border-border">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium">
                {contact.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{contact.name}</p>
                <p className="text-xs text-muted-foreground">{contact.email}</p>
              </div>
              <Badge variant="outline" className="text-xs">
                {contact.role}
              </Badge>
            </div>
          </div>

          {/* Subject Field */}
          <div className="space-y-2">
            <Label htmlFor="email-subject">Subject</Label>
            <Input
              id="email-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter email subject..."
              required
            />
          </div>

          {/* Body Field */}
          <div className="space-y-2">
            <Label htmlFor="email-body">Message</Label>
            <Textarea
              id="email-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message..."
              className="min-h-[200px] font-normal"
              required
            />
            {initialBody && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                This draft was generated based on your recent interactions. Feel free to edit it.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleOpenInGmail}
              className="text-muted-foreground"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open in Email Client
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSending || !subject || !body}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isSending ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Email
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
