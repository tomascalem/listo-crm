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
import { ScrollText, MapPin } from "lucide-react"
import { useVenues } from "@/queries/venues"
import { useCreateContract } from "@/queries/contracts"
import {
  type ContractType,
  type ContractStatus,
} from "@/lib/mock-data"

interface AddContractModalProps {
  trigger?: React.ReactNode
  entityType: "venue" | "operator" | "concessionaire"
  entityId: string
  entityName: string
}

const contractTypes: { value: ContractType; label: string }[] = [
  { value: "msa", label: "MSA (Master Service Agreement)" },
  { value: "sow", label: "SOW (Statement of Work)" },
  { value: "nda", label: "NDA (Non-Disclosure Agreement)" },
  { value: "other", label: "Other" },
]

const contractStatuses: { value: ContractStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
  { value: "terminated", label: "Terminated" },
]

export function AddContractModal({ trigger, entityType, entityId, entityName }: AddContractModalProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [contractType, setContractType] = useState<ContractType | "">("")
  const [contractStatus, setContractStatus] = useState<ContractStatus>("pending")
  const [effectiveDate, setEffectiveDate] = useState("")
  const [expirationDate, setExpirationDate] = useState("")
  const [url, setUrl] = useState("")
  const [description, setDescription] = useState("")
  const [applyToAll, setApplyToAll] = useState(true)
  const [selectedVenues, setSelectedVenues] = useState<string[]>([])
  const [hasExpiration, setHasExpiration] = useState(true)

  const { data: allVenues = [] } = useVenues()
  const createContract = useCreateContract()

  // Get venues for operator/concessionaire
  const venues = entityType === "operator"
    ? allVenues.filter((v: any) => v.operatorId === entityId)
    : entityType === "concessionaire"
    ? allVenues.filter((v: any) => v.concessionaires?.some((c: any) => c.id === entityId))
    : []

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await createContract.mutateAsync({
        name,
        type: contractType,
        status: contractStatus,
        entityType,
        entityId,
        effectiveDate,
        expirationDate: hasExpiration ? expirationDate : undefined,
        url: url || undefined,
        description: description || undefined,
        isInheritable: applyToAll,
        venueIds: !applyToAll && selectedVenues.length > 0 ? selectedVenues : undefined,
      })
      // Reset form
      setName("")
      setContractType("")
      setContractStatus("pending")
      setEffectiveDate("")
      setExpirationDate("")
      setUrl("")
      setDescription("")
      setApplyToAll(true)
      setSelectedVenues([])
      setHasExpiration(true)
      setOpen(false)
    } catch (error) {
      console.error("Failed to create contract:", error)
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
            <ScrollText className="h-4 w-4 mr-2" />
            Add Contract
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ScrollText className="h-5 w-5" />
            Add New Contract
          </DialogTitle>
          <DialogDescription>
            Add a contract or agreement for {entityName}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* Contract Name */}
          <div className="space-y-2">
            <Label htmlFor="contract-name">Contract Name *</Label>
            <Input
              id="contract-name"
              placeholder="e.g., Master Service Agreement 2025"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Contract Type and Status */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contract-type">Contract Type *</Label>
              <Select value={contractType} onValueChange={(v) => setContractType(v as ContractType)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {contractTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contract-status">Status *</Label>
              <Select value={contractStatus} onValueChange={(v) => setContractStatus(v as ContractStatus)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {contractStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="effective-date">Effective Date *</Label>
                <Input
                  id="effective-date"
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="expiration-date">Expiration Date</Label>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="has-expiration" className="text-xs text-muted-foreground">
                      Has expiration
                    </Label>
                    <Switch
                      id="has-expiration"
                      checked={hasExpiration}
                      onCheckedChange={setHasExpiration}
                    />
                  </div>
                </div>
                <Input
                  id="expiration-date"
                  type="date"
                  value={expirationDate}
                  onChange={(e) => setExpirationDate(e.target.value)}
                  disabled={!hasExpiration}
                  className={!hasExpiration ? "opacity-50" : ""}
                />
              </div>
            </div>
          </div>

          {/* URL */}
          <div className="space-y-2">
            <Label htmlFor="contract-url">Contract URL</Label>
            <Input
              id="contract-url"
              type="url"
              placeholder="https://drive.google.com/file/d/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Link to the contract document in Google Drive, Dropbox, etc.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="contract-description">Description</Label>
            <Textarea
              id="contract-description"
              placeholder="Brief description of the contract terms..."
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
                  <h3 className="text-sm font-medium text-foreground">Apply to Venues</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Make this contract visible to venues under this {entityType}
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
                      No venues selected. The contract will only be visible at the {entityType} level.
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
            <Button type="submit" disabled={createContract.isPending}>
              {createContract.isPending ? "Adding..." : "Add Contract"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
