import { useState, useEffect, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Building2,
  Users,
  MapPin,
  Search,
  ArrowRight,
  Clock,
  Star,
} from "lucide-react"
import { useVenues } from "@/queries/venues"
import { useContacts } from "@/queries/contacts"
import { useOperators } from "@/queries/operators"
import { useConcessionaires } from "@/queries/concessionaires"
import type { Venue, Contact, Operator, Concessionaire } from "@/lib/mock-data"

interface SearchResult {
  type: "venue" | "contact" | "operator" | "concessionaire"
  item: Venue | Contact | Operator | Concessionaire
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([])
  const navigate = useNavigate()

  // Fetch all data for search
  const { data: venues = [] } = useVenues()
  const { data: contacts = [] } = useContacts()
  const { data: operators = [] } = useOperators()
  const { data: concessionaires = [] } = useConcessionaires()

  // Create operator lookup map
  const operatorMap = useMemo(() => {
    const map = new Map<string, any>()
    operators.forEach((op: any) => map.set(op.id, op))
    return map
  }, [operators])

  // Keyboard shortcut to open search
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  // Search function
  const search = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    const q = searchQuery.toLowerCase()
    const searchResults: SearchResult[] = []

    // Search venues
    venues.forEach((venue: any) => {
      if (
        venue.name.toLowerCase().includes(q) ||
        venue.city.toLowerCase().includes(q) ||
        venue.type.toLowerCase().includes(q)
      ) {
        searchResults.push({ type: "venue", item: venue })
      }
    })

    // Search operators
    operators.forEach((operator: any) => {
      if (
        operator.name.toLowerCase().includes(q) ||
        operator.description?.toLowerCase().includes(q)
      ) {
        searchResults.push({ type: "operator", item: operator })
      }
    })

    // Search concessionaires
    concessionaires.forEach((concessionaire: any) => {
      if (
        concessionaire.name.toLowerCase().includes(q) ||
        concessionaire.description?.toLowerCase().includes(q)
      ) {
        searchResults.push({ type: "concessionaire", item: concessionaire })
      }
    })

    // Search contacts
    contacts.forEach((contact: any) => {
      if (
        contact.name.toLowerCase().includes(q) ||
        contact.email.toLowerCase().includes(q) ||
        contact.role.toLowerCase().includes(q)
      ) {
        searchResults.push({ type: "contact", item: contact })
      }
    })

    setResults(searchResults.slice(0, 10))
  }, [venues, operators, concessionaires, contacts])

  useEffect(() => {
    const timeoutId = setTimeout(() => search(query), 150)
    return () => clearTimeout(timeoutId)
  }, [query, search])

  const handleSelect = (result: SearchResult) => {
    // Add to recent searches
    setRecentSearches((prev) => {
      const filtered = prev.filter(
        (r) => !(r.type === result.type && r.item.id === result.item.id)
      )
      return [result, ...filtered].slice(0, 5)
    })

    // Navigate
    switch (result.type) {
      case "venue":
        navigate(`/venues/${result.item.id}`)
        break
      case "operator":
        navigate(`/operators/${result.item.id}`)
        break
      case "concessionaire":
        navigate(`/concessionaires/${result.item.id}`)
        break
      case "contact":
        navigate(`/contacts/${result.item.id}`)
        break
    }
    setOpen(false)
    setQuery("")
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "venue":
        return <MapPin className="h-4 w-4" />
      case "operator":
        return <Building2 className="h-4 w-4" />
      case "concessionaire":
        return <Building2 className="h-4 w-4" />
      case "contact":
        return <Users className="h-4 w-4" />
      default:
        return null
    }
  }

  const getStatusBadge = (result: SearchResult) => {
    if (result.type === "venue") {
      const venue = result.item as Venue
      return (
        <Badge variant="secondary" className="text-xs">
          {venue.stage.replace("-", " ")}
        </Badge>
      )
    }
    if (result.type === "operator" || result.type === "concessionaire") {
      return (
        <Badge variant="secondary" className="text-xs capitalize">
          {result.type}
        </Badge>
      )
    }
    if (result.type === "contact") {
      const contact = result.item as Contact
      if (contact.isPrimary) {
        return <Star className="h-3 w-3 text-chart-3 fill-chart-3" />
      }
    }
    return null
  }

  const getSubtitle = (result: SearchResult) => {
    switch (result.type) {
      case "venue":
        const venue = result.item as Venue
        const operator = (venue as any).operator || operatorMap.get(venue.operatorId)
        return `${venue.type} · ${venue.city}, ${venue.state}${operator ? ` · ${operator.name}` : ''}`
      case "operator":
        return (result.item as Operator).description || "Operator"
      case "concessionaire":
        return (result.item as Concessionaire).description || "Concessionaire"
      case "contact":
        return (result.item as Contact).role
      default:
        return ""
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search...</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 gap-0 overflow-hidden">
          <div className="flex items-center border-b border-border px-4">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              placeholder="Search companies, venues, contacts..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-12"
              autoFocus
            />
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {/* Results */}
            {results.length > 0 && (
              <div className="p-2">
                <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Results</p>
                {results.map((result) => (
                  <button
                    key={`${result.type}-${result.item.id}`}
                    onClick={() => handleSelect(result)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-muted transition-colors group"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {getIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">{result.item.name}</span>
                        {getStatusBadge(result)}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {getSubtitle(result)}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}

            {/* No results */}
            {query && results.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-muted-foreground">No results found for &quot;{query}&quot;</p>
              </div>
            )}

            {/* Recent searches */}
            {!query && recentSearches.length > 0 && (
              <div className="p-2">
                <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  Recent
                </p>
                {recentSearches.map((result) => (
                  <button
                    key={`recent-${result.type}-${result.item.id}`}
                    onClick={() => handleSelect(result)}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-muted transition-colors group"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      {getIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium truncate">{result.item.name}</span>
                      <p className="text-sm text-muted-foreground truncate">
                        {getSubtitle(result)}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!query && recentSearches.length === 0 && (
              <div className="p-8 text-center">
                <Search className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium">Search your CRM</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Find companies, venues, and contacts quickly
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5">↑</kbd>
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5">↓</kbd>
                to navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5">↵</kbd>
                to select
              </span>
            </div>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5">esc</kbd>
              to close
            </span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
