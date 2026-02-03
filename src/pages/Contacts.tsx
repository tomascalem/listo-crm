import { useState, useMemo } from "react"
import { Link } from "react-router-dom"
import { Sidebar } from "@/components/crm/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Bell, Search, Mail, Phone } from "lucide-react"
import { contacts, getVenueById, interactions } from "@/lib/mock-data"

// Get last interaction for a contact
function getLastInteraction(contactId: string) {
  return interactions
    .filter(i => i.contactId === contactId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
}

export default function Contacts() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      const matchesSearch =
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.role.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesSearch
    })
  }, [searchQuery])

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <main className="flex-1 lg:pl-64">
        <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Contacts</h1>
              <p className="text-sm text-muted-foreground">{contacts.length} contacts</p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Venues</TableHead>
                  <TableHead>Last Interaction</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => {
                  const contactVenues = contact.venueIds.map(vid => getVenueById(vid)).filter(Boolean)
                  const lastInteraction = getLastInteraction(contact.id)

                  return (
                    <TableRow key={contact.id}>
                      <TableCell>
                        <Link to={`/contacts/${contact.id}`} className="flex items-center gap-3 hover:text-primary">
                          <Avatar className="border border-primary/20">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {contact.avatar || contact.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{contact.name}</p>
                            <p className="text-sm text-muted-foreground">{contact.email}</p>
                          </div>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{contact.role}</span>
                        {contact.isPrimary && (
                          <Badge variant="secondary" className="ml-2 bg-success/20 text-success text-xs">
                            Primary
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {contactVenues.slice(0, 2).map((venue) => venue && (
                            <Link key={venue.id} to={`/venues/${venue.id}`}>
                              <Badge variant="outline" className="text-xs hover:bg-primary/10 hover:text-primary transition-colors">
                                {venue.name}
                              </Badge>
                            </Link>
                          ))}
                          {contactVenues.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{contactVenues.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {lastInteraction ? (
                          <div>
                            <Badge variant="outline" className="text-xs capitalize">{lastInteraction.type}</Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(lastInteraction.date).toLocaleDateString()}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <a href={`mailto:${contact.email}`}>
                            <Button variant="ghost" size="icon-sm">
                              <Mail className="h-4 w-4" />
                            </Button>
                          </a>
                          <a href={`tel:${contact.phone}`}>
                            <Button variant="ghost" size="icon-sm">
                              <Phone className="h-4 w-4" />
                            </Button>
                          </a>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/contacts/${contact.id}`}>View</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {filteredContacts.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No contacts found matching your search
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
