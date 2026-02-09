
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
import { Plus, MapPin } from "lucide-react"
import { useOperators } from "@/queries/operators"
import { useConcessionaires } from "@/queries/concessionaires"
import { useCreateVenue } from "@/queries/venues"

interface AddVenueModalProps {
  trigger?: React.ReactNode
  operatorId?: string
}

export function AddVenueModal({ trigger, operatorId }: AddVenueModalProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [type, setType] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [state, setState] = useState("")
  const [capacity, setCapacity] = useState("")
  const [selectedOperatorId, setSelectedOperatorId] = useState(operatorId || "")
  const [selectedConcessionaires, setSelectedConcessionaires] = useState<string[]>([])
  const [status, setStatus] = useState("prospect")
  const [stage, setStage] = useState("lead")
  const [dealValue, setDealValue] = useState("")
  const [notes, setNotes] = useState("")

  const { data: operators = [] } = useOperators()
  const { data: concessionaires = [] } = useConcessionaires()
  const createVenue = useCreateVenue()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      await createVenue.mutateAsync({
        name,
        type,
        address: address || undefined,
        city,
        state,
        capacity: capacity ? parseInt(capacity) : undefined,
        operatorId: selectedOperatorId,
        concessionaireIds: selectedConcessionaires.length > 0 ? selectedConcessionaires : undefined,
        status,
        stage,
        dealValue: dealValue ? parseInt(dealValue) : undefined,
        notes: notes || undefined,
      })
      // Reset form
      setName("")
      setType("")
      setAddress("")
      setCity("")
      setState("")
      setCapacity("")
      setSelectedOperatorId(operatorId || "")
      setSelectedConcessionaires([])
      setStatus("prospect")
      setStage("lead")
      setDealValue("")
      setNotes("")
      setOpen(false)
    } catch (error) {
      console.error("Failed to create venue:", error)
    }
  }

  const toggleConcessionaire = (id: string) => {
    setSelectedConcessionaires(prev => 
      prev.includes(id) 
        ? prev.filter(c => c !== id)
        : [...prev, id]
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            Add Venue
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Add New Venue
          </DialogTitle>
          <DialogDescription>
            Add a new venue to your CRM. Connect it with an operator and concessionaire(s).
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Basic Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="venue-name">Venue Name *</Label>
              <Input
                id="venue-name"
                placeholder="e.g., Madison Square Garden"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="venue-type">Venue Type *</Label>
              <Select value={type} onValueChange={setType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stadium">Stadium</SelectItem>
                  <SelectItem value="arena">Arena</SelectItem>
                  <SelectItem value="amphitheater">Amphitheater</SelectItem>
                  <SelectItem value="theater">Theater</SelectItem>
                  <SelectItem value="convention-center">Convention Center</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="Street address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                placeholder="e.g., NY"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input
                id="capacity"
                type="number"
                placeholder="e.g., 20000"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
            </div>
          </div>

          {/* Relationships */}
          <div className="space-y-4 p-4 rounded-lg bg-secondary/30 border border-border">
            <h3 className="text-sm font-medium text-foreground">Relationships</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="operator">Operator *</Label>
                <Select value={selectedOperatorId} onValueChange={setSelectedOperatorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select operator" />
                  </SelectTrigger>
                  <SelectContent>
                    {operators.map((op: any) => (
                      <SelectItem key={op.id} value={op.id}>{op.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Company that owns/operates this venue
                </p>
              </div>
              <div className="space-y-2">
                <Label>Concessionaire(s)</Label>
                <div className="flex flex-wrap gap-2">
                  {concessionaires.map((con: any) => (
                    <button
                      key={con.id}
                      type="button"
                      onClick={() => toggleConcessionaire(con.id)}
                      className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                        selectedConcessionaires.includes(con.id)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-card-foreground border-border hover:border-primary/50"
                      }`}
                    >
                      {con.name}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Food & beverage partners
                </p>
              </div>
            </div>
          </div>

          {/* Sales Info */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prospect">Prospect</SelectItem>
                  <SelectItem value="negotiating">Negotiating</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="churned">Churned</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stage">Pipeline Stage *</Label>
              <Select value={stage} onValueChange={setStage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="qualified">Qualified</SelectItem>
                  <SelectItem value="demo">Demo</SelectItem>
                  <SelectItem value="proposal">Proposal</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                  <SelectItem value="closed-won">Closed Won</SelectItem>
                  <SelectItem value="closed-lost">Closed Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deal-value">Deal Value ($)</Label>
              <Input
                id="deal-value"
                type="number"
                placeholder="e.g., 250000"
                value={dealValue}
                onChange={(e) => setDealValue(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue-notes">Notes</Label>
            <Textarea
              id="venue-notes"
              placeholder="Add any notes about this venue..."
              className="min-h-[80px]"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="bg-transparent">
              Cancel
            </Button>
            <Button type="submit" disabled={createVenue.isPending}>
              {createVenue.isPending ? "Creating..." : "Create Venue"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
