
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Phone, Video, Mail, Users, FileText, Upload } from "lucide-react"
import { useVenues } from "@/queries/venues"
import { useContacts } from "@/queries/contacts"
import { useCreateInteraction } from "@/queries/interactions"

interface LogActivityModalProps {
  trigger?: React.ReactNode
  venueId?: string
  contactId?: string
}

const activityTypes = [
  { value: "call", label: "Phone Call", icon: Phone },
  { value: "video", label: "Video Call", icon: Video },
  { value: "email", label: "Email", icon: Mail },
  { value: "meeting", label: "In-Person Meeting", icon: Users },
  { value: "note", label: "Note", icon: FileText },
]

export function LogActivityModal({ trigger, venueId, contactId }: LogActivityModalProps) {
  const [open, setOpen] = useState(false)
  const [activityType, setActivityType] = useState<string>("call")
  const [selectedVenueId, setSelectedVenueId] = useState(venueId || "")
  const [selectedContactId, setSelectedContactId] = useState(contactId || "")
  const [summary, setSummary] = useState("")
  const [highlights, setHighlights] = useState<string[]>([""])
  const [wants, setWants] = useState<string[]>([""])
  const [concerns, setConcerns] = useState<string[]>([""])
  const { data: venues = [] } = useVenues()
  const { data: contacts = [] } = useContacts()
  const createInteraction = useCreateInteraction()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await createInteraction.mutateAsync({
        type: activityType as "call" | "video" | "email" | "meeting" | "note",
        date: new Date().toISOString(),
        summary,
        highlights: highlights.filter(h => h.trim() !== ""),
        wants: wants.filter(w => w.trim() !== ""),
        concerns: concerns.filter(c => c.trim() !== ""),
        venueId: selectedVenueId,
        contactId: selectedContactId,
        userId: "user-1", // Would come from auth context
      })
      // Reset form
      setActivityType("call")
      setSelectedVenueId(venueId || "")
      setSelectedContactId(contactId || "")
      setSummary("")
      setHighlights([""])
      setWants([""])
      setConcerns([""])
      setOpen(false)
    } catch (error) {
      console.error("Failed to create interaction:", error)
    }
  }

  const addHighlight = () => setHighlights([...highlights, ""])
  const addWant = () => setWants([...wants, ""])
  const addConcern = () => setConcerns([...concerns, ""])

  const updateHighlight = (index: number, value: string) => {
    const updated = [...highlights]
    updated[index] = value
    setHighlights(updated)
  }

  const updateWant = (index: number, value: string) => {
    const updated = [...wants]
    updated[index] = value
    setWants(updated)
  }

  const updateConcern = (index: number, value: string) => {
    const updated = [...concerns]
    updated[index] = value
    setConcerns(updated)
  }

  const selectedType = activityTypes.find((t) => t.value === activityType)
  const Icon = selectedType?.icon || Phone

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Log Activity
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            Log Activity
          </DialogTitle>
          <DialogDescription>
            Record an interaction with a contact. Add highlights, wants, and concerns to track insights.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Activity Type */}
          <div className="flex gap-2">
            {activityTypes.map((type) => {
              const TypeIcon = type.icon
              return (
                <Button
                  key={type.value}
                  type="button"
                  variant={activityType === type.value ? "default" : "outline"}
                  className={activityType === type.value ? "bg-primary text-primary-foreground" : ""}
                  onClick={() => setActivityType(type.value)}
                >
                  <TypeIcon className="h-4 w-4 mr-2" />
                  {type.label}
                </Button>
              )
            })}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="activity-venue">Venue *</Label>
              <Select value={selectedVenueId} onValueChange={setSelectedVenueId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select venue" />
                </SelectTrigger>
                <SelectContent>
                  {venues.map((venue: any) => (
                    <SelectItem key={venue.id} value={venue.id}>
                      {venue.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="activity-contact">Contact *</Label>
              <Select value={selectedContactId} onValueChange={setSelectedContactId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select contact" />
                </SelectTrigger>
                <SelectContent>
                  {contacts.map((contact: any) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.name} - {contact.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="activity-date">Date & Time *</Label>
              <Input id="activity-date" type="datetime-local" required />
            </div>
            {(activityType === "call" || activityType === "video" || activityType === "meeting") && (
              <div className="space-y-2">
                <Label htmlFor="activity-duration">Duration (minutes)</Label>
                <Input id="activity-duration" type="number" placeholder="e.g., 30" />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="activity-summary">Summary *</Label>
            <Textarea
              id="activity-summary"
              placeholder="Brief summary of the interaction..."
              className="min-h-[80px]"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              required
            />
          </div>

          {(activityType === "call" || activityType === "video") && (
            <div className="space-y-2">
              <Label htmlFor="activity-transcript">Transcript</Label>
              <Textarea
                id="activity-transcript"
                placeholder="Paste or type the full transcript..."
                className="min-h-[100px]"
              />
            </div>
          )}

          {(activityType === "call" || activityType === "video") && (
            <div className="space-y-2">
              <Label>Recording</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Drag & drop a recording file or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  MP3, MP4, WAV up to 500MB
                </p>
              </div>
            </div>
          )}

          {/* Highlights */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Key Highlights</Label>
              <Button type="button" variant="ghost" size="sm" onClick={addHighlight}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            {highlights.map((highlight, index) => (
              <Input
                key={index}
                value={highlight}
                onChange={(e) => updateHighlight(index, e.target.value)}
                placeholder="e.g., They mentioned 20% increase in throughput"
              />
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Wants */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-success">What They Want</Label>
                <Button type="button" variant="ghost" size="sm" onClick={addWant}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              {wants.map((want, index) => (
                <Input
                  key={index}
                  value={want}
                  onChange={(e) => updateWant(index, e.target.value)}
                  placeholder="e.g., Dedicated account manager"
                  className="border-success/30 focus:border-success"
                />
              ))}
            </div>

            {/* Concerns */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-destructive">Concerns / Objections</Label>
                <Button type="button" variant="ghost" size="sm" onClick={addConcern}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
              {concerns.map((concern, index) => (
                <Input
                  key={index}
                  value={concern}
                  onChange={(e) => updateConcern(index, e.target.value)}
                  placeholder="e.g., Budget constraints"
                  className="border-destructive/30 focus:border-destructive"
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createInteraction.isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {createInteraction.isPending ? "Saving..." : "Save Activity"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
