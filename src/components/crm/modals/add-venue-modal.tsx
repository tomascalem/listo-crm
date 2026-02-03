
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
import { operators, concessionaires } from "@/lib/mock-data"

interface AddVenueModalProps {
  trigger?: React.ReactNode
  operatorId?: string
}

export function AddVenueModal({ trigger, operatorId }: AddVenueModalProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedConcessionaires, setSelectedConcessionaires] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    setOpen(false)
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
              <Input id="venue-name" placeholder="e.g., Madison Square Garden" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="venue-type">Venue Type *</Label>
              <Select>
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
            <Input id="address" placeholder="Street address" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input id="city" placeholder="City" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input id="state" placeholder="e.g., NY" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input id="capacity" type="number" placeholder="e.g., 20000" />
            </div>
          </div>

          {/* Relationships */}
          <div className="space-y-4 p-4 rounded-lg bg-secondary/30 border border-border">
            <h3 className="text-sm font-medium text-foreground">Relationships</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="operator">Operator *</Label>
                <Select defaultValue={operatorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select operator" />
                  </SelectTrigger>
                  <SelectContent>
                    {operators.map((op) => (
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
                  {concessionaires.map((con) => (
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
              <Select defaultValue="prospect">
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
              <Select defaultValue="lead">
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
              <Input id="deal-value" type="number" placeholder="e.g., 250000" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue-notes">Notes</Label>
            <Textarea
              id="venue-notes"
              placeholder="Add any notes about this venue..."
              className="min-h-[80px]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="bg-transparent">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Venue"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
