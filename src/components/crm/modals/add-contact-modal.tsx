
import React from "react"

import { useState } from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Users } from "lucide-react"
import { venues } from "@/lib/mock-data"

interface AddContactModalProps {
  trigger?: React.ReactNode
  venueIds?: string[]
}

export function AddContactModal({ trigger, venueIds }: AddContactModalProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedVenues, setSelectedVenues] = useState<string[]>(venueIds || [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    setOpen(false)
  }

  const toggleVenue = (venueId: string) => {
    setSelectedVenues((prev) =>
      prev.includes(venueId) ? prev.filter((id) => id !== venueId) : [...prev, venueId]
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Add New Contact
          </DialogTitle>
          <DialogDescription>
            Add a new contact and associate them with one or more venues.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact-name">Full Name *</Label>
              <Input id="contact-name" placeholder="e.g., John Smith" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-role">Role / Title *</Label>
              <Input id="contact-role" placeholder="e.g., VP of Operations" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-email">Email *</Label>
              <Input id="contact-email" type="email" placeholder="john@company.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact-phone">Phone</Label>
              <Input id="contact-phone" type="tel" placeholder="+1 (555) 123-4567" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-linkedin">LinkedIn Profile</Label>
            <Input id="contact-linkedin" type="url" placeholder="https://linkedin.com/in/username" />
          </div>

          <div className="space-y-3">
            <Label>Associated Venues *</Label>
            <p className="text-sm text-muted-foreground">
              Select the venues this contact is associated with. Contacts can be shared across multiple venues.
            </p>
            <div className="max-h-48 overflow-y-auto border border-border rounded-lg p-3 space-y-2">
              {venues.map((venue) => (
                <div
                  key={venue.id}
                  className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer"
                  onClick={() => toggleVenue(venue.id)}
                >
                  <Checkbox
                    checked={selectedVenues.includes(venue.id)}
                    onCheckedChange={() => toggleVenue(venue.id)}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{venue.name}</p>
                    <p className="text-xs text-muted-foreground">{venue.city}, {venue.state}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox id="primary-contact" />
            <Label htmlFor="primary-contact" className="text-sm font-normal cursor-pointer">
              Mark as primary contact for selected venues
            </Label>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || selectedVenues.length === 0}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSubmitting ? "Creating..." : "Create Contact"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
