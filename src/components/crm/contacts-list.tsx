
import { Mail, Phone, Linkedin, MoreHorizontal, Plus, Star, Building2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getVenueById } from "@/lib/mock-data"
import type { Contact } from "@/lib/mock-data"

interface ContactsListProps {
  contacts: Contact[]
  compact?: boolean
}

function ContactCard({ contact }: { contact: Contact }) {
  const venues = contact.venueIds.map((id) => getVenueById(id)).filter(Boolean)

  return (
    <div className="rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary/30">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Avatar className="h-12 w-12 border-2 border-border">
            <AvatarFallback className="bg-accent text-accent-foreground font-medium">
              {contact.avatar}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-card-foreground">{contact.name}</h3>
              {contact.isPrimary && (
                <Badge variant="outline" className="gap-1 bg-warning/10 text-warning border-warning/30">
                  <Star className="h-3 w-3" />
                  Primary
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{contact.role}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View full profile</DropdownMenuItem>
            <DropdownMenuItem>Log interaction</DropdownMenuItem>
            <DropdownMenuItem>Send email</DropdownMenuItem>
            <DropdownMenuItem>Set as primary</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4 space-y-2">
        <a
          href={`mailto:${contact.email}`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Mail className="h-4 w-4" />
          {contact.email}
        </a>
        <a
          href={`tel:${contact.phone}`}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Phone className="h-4 w-4" />
          {contact.phone}
        </a>
        {contact.linkedIn && (
          <a
            href={contact.linkedIn}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Linkedin className="h-4 w-4" />
            LinkedIn Profile
          </a>
        )}
      </div>

      {venues.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Building2 className="h-4 w-4" />
            <span>Associated venues</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {venues.map((venue) => venue && (
              <Badge key={venue.id} variant="secondary" className="text-xs">
                {venue.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-2">
        <Button size="sm" variant="secondary" className="flex-1">
          <Mail className="h-4 w-4 mr-2" />
          Email
        </Button>
        <Button size="sm" variant="secondary" className="flex-1">
          <Phone className="h-4 w-4 mr-2" />
          Call
        </Button>
      </div>
    </div>
  )
}

export function ContactsList({ contacts, compact }: ContactsListProps) {
  const displayContacts = compact ? contacts.slice(0, 4) : contacts

  // Sort to show primary contacts first
  const sortedContacts = [...displayContacts].sort((a, b) => {
    if (a.isPrimary && !b.isPrimary) return -1
    if (!a.isPrimary && b.isPrimary) return 1
    return 0
  })

  return (
    <Card className="border-border bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-base font-medium text-card-foreground">
          Contacts {!compact && `(${contacts.length})`}
        </CardTitle>
        <Button size="sm" variant="outline" className="gap-2 bg-transparent">
          <Plus className="h-4 w-4" />
          Add Contact
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          {sortedContacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </div>
        {compact && contacts.length > 4 && (
          <Button variant="ghost" className="w-full mt-4 text-muted-foreground">
            View all {contacts.length} contacts
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
