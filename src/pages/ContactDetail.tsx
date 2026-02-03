import { Link, useParams } from "react-router-dom"
import { Sidebar } from "@/components/crm/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft, Mail, Phone, MapPin } from "lucide-react"
import { getContactById, getVenueById, getOperatorById } from "@/lib/mock-data"

export default function ContactDetail() {
  const { id } = useParams<{ id: string }>()
  const contact = id ? getContactById(id) : null

  if (!contact) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 pl-64 p-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-semibold">Contact not found</h1>
            <Link to="/contacts" className="text-primary hover:underline mt-2 inline-block">
              Back to Contacts
            </Link>
          </div>
        </main>
      </div>
    )
  }

  const contactVenues = contact.venueIds.map(vid => getVenueById(vid)).filter(Boolean)
  const operator = contact.operatorId ? getOperatorById(contact.operatorId) : null

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 pl-64">
        <div className="border-b border-border bg-background px-8 py-6">
          <div className="flex items-center gap-4">
            <Link to="/contacts">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl">{contact.avatar || contact.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-semibold">{contact.name}</h1>
              <p className="text-muted-foreground">{contact.role}</p>
            </div>
          </div>
        </div>

        <div className="p-8 grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <a href={`mailto:${contact.email}`} className="text-primary hover:underline">{contact.email}</a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <a href={`tel:${contact.phone}`} className="text-primary hover:underline">{contact.phone}</a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Associated Venues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contactVenues.map((venue) => venue && (
                  <Link key={venue.id} to={`/venues/${venue.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{venue.name}</p>
                      <p className="text-sm text-muted-foreground">{venue.city}, {venue.state}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
