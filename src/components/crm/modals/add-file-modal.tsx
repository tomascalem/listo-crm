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
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { File, FolderOpen, Building2, MapPin } from "lucide-react"
import { useVenues } from "@/queries/venues"
import { useCreateFile } from "@/queries/files"
import { type FileType } from "@/lib/mock-data"

interface AddFileModalProps {
  trigger?: React.ReactNode
  entityType: "venue" | "operator" | "concessionaire"
  entityId: string
  entityName: string
}

const fileTypes: { value: FileType; label: string }[] = [
  { value: "deck", label: "Deck / Presentation" },
  { value: "one-pager", label: "One-Pager" },
  { value: "proposal", label: "Proposal" },
  { value: "report", label: "Report" },
  { value: "other", label: "Other" },
]

export function AddFileModal({ trigger, entityType, entityId, entityName }: AddFileModalProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [fileType, setFileType] = useState<FileType | "">("")
  const [fileDate, setFileDate] = useState(new Date().toISOString().split('T')[0])
  const [url, setUrl] = useState("")
  const [description, setDescription] = useState("")
  const [applyToAll, setApplyToAll] = useState(true)
  const [selectedVenues, setSelectedVenues] = useState<string[]>([])

  const { data: allVenues = [] } = useVenues()
  const createFile = useCreateFile()

  // Get venues for operator/concessionaire
  const venues = entityType === "operator"
    ? allVenues.filter((v: any) => v.operatorId === entityId)
    : entityType === "concessionaire"
    ? allVenues.filter((v: any) => v.concessionaires?.some((c: any) => c.id === entityId))
    : []

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await createFile.mutateAsync({
        name,
        type: fileType,
        entityType,
        entityId,
        date: fileDate,
        url: url || undefined,
        description: description || undefined,
        isInheritable: applyToAll,
        venueIds: !applyToAll && selectedVenues.length > 0 ? selectedVenues : undefined,
      })
      // Reset form
      setName("")
      setFileType("")
      setFileDate(new Date().toISOString().split('T')[0])
      setUrl("")
      setDescription("")
      setApplyToAll(true)
      setSelectedVenues([])
      setOpen(false)
    } catch (error) {
      console.error("Failed to create file:", error)
    }
  }

  const toggleVenue = (venueId: string) => {
    setSelectedVenues(prev =>
      prev.includes(venueId)
        ? prev.filter(id => id !== venueId)
        : [...prev, venueId]
    )
  }

  const isOperatorOrConcessionaire = entityType === "operator" || entityType === "concessionaire"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <File className="h-4 w-4 mr-2" />
            Add File
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Add New File
          </DialogTitle>
          <DialogDescription>
            Add a file or document for {entityName}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* File Name */}
          <div className="space-y-2">
            <Label htmlFor="file-name">File Name *</Label>
            <Input
              id="file-name"
              placeholder="e.g., Q4 2024 Sales Deck"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* File Type and Date */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="file-type">File Type *</Label>
              <Select value={fileType} onValueChange={(v) => setFileType(v as FileType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {fileTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="file-date">Date *</Label>
              <Input
                id="file-date"
                type="date"
                value={fileDate}
                onChange={(e) => setFileDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* URL */}
          <div className="space-y-2">
            <Label htmlFor="file-url">File URL</Label>
            <Input
              id="file-url"
              type="url"
              placeholder="https://drive.google.com/file/d/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Link to the file in Google Drive, Dropbox, etc.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="file-description">Description</Label>
            <Textarea
              id="file-description"
              placeholder="Brief description of the file contents..."
              className="min-h-[80px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Sharing Options - Only for Operators/Concessionaires */}
          {isOperatorOrConcessionaire && venues.length > 0 && (
            <div className="space-y-4 p-4 rounded-lg bg-secondary/30 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-foreground">Share with Venues</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Make this file available to venues under this {entityType}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="apply-all" className="text-sm text-muted-foreground">
                    All venues
                  </Label>
                  <Switch
                    id="apply-all"
                    checked={applyToAll}
                    onCheckedChange={setApplyToAll}
                  />
                </div>
              </div>

              {!applyToAll && (
                <div className="space-y-3">
                  <Label className="text-sm">Select venues:</Label>
                  <div className="max-h-[200px] overflow-y-auto space-y-2 rounded-md border border-border p-3 bg-card">
                    {venues.map((venue: any) => (
                      <div
                        key={venue.id}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50 transition-colors"
                      >
                        <Checkbox
                          id={`venue-${venue.id}`}
                          checked={selectedVenues.includes(venue.id)}
                          onCheckedChange={() => toggleVenue(venue.id)}
                        />
                        <label
                          htmlFor={`venue-${venue.id}`}
                          className="flex items-center gap-2 flex-1 cursor-pointer"
                        >
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">{venue.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {venue.city}, {venue.state}
                            </p>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                  {selectedVenues.length === 0 && (
                    <p className="text-xs text-warning">
                      No venues selected. The file will only be visible at the {entityType} level.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="bg-transparent">
              Cancel
            </Button>
            <Button type="submit" disabled={createFile.isPending}>
              {createFile.isPending ? "Adding..." : "Add File"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
