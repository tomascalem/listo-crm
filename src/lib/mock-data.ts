export type VenueStatus = "client" | "prospect" | "churned" | "negotiating"
export type VenueStage = "lead" | "qualified" | "demo" | "proposal" | "negotiation" | "closed-won" | "closed-lost"
export type InteractionType = "call" | "video" | "email" | "meeting" | "note"
export type VenueType = "stadium" | "arena" | "amphitheater" | "theater" | "convention-center" | "other"
export type FileType = "deck" | "one-pager" | "proposal" | "report" | "other"
export type ContractType = "msa" | "sow" | "nda" | "other"
export type ContractStatus = "active" | "expired" | "pending" | "terminated"

// Files - decks, one-pagers, proposals, reports
export interface VenueFile {
  id: string
  name: string
  type: FileType
  date: string // When the file was created/uploaded
  url?: string // External link (Google Drive, Dropbox, etc.)
  description?: string
  entityType: "venue" | "operator" | "concessionaire"
  entityId: string
  isInheritable?: boolean // If true, venues under this entity will see this file
  createdAt: string
}

// Contracts - MSAs, SOWs, NDAs
export interface Contract {
  id: string
  name: string
  type: ContractType
  effectiveDate: string
  expirationDate?: string
  status: ContractStatus
  url?: string
  description?: string
  entityType: "venue" | "operator" | "concessionaire"
  entityId: string
  isInheritable?: boolean
  createdAt: string
}

// Operators run/own venues (e.g., Live Nation, MSG, AEG, Oak View Group)
export interface Operator {
  id: string
  name: string
  logo?: string
  website?: string
  description?: string
  headquarters?: string
  venueCount?: number
}

// Concessionaires handle food & beverage (e.g., Levy, Aramark, Sodexo, Delaware North, Legends)
export interface Concessionaire {
  id: string
  name: string
  logo?: string
  website?: string
  description?: string
  headquarters?: string
  venueCount?: number
}

export interface Contact {
  id: string
  name: string
  email: string
  phone: string
  role: string
  isPrimary: boolean
  avatar?: string
  linkedIn?: string
  venueIds: string[]
  operatorId?: string
  concessionaireId?: string
}

export interface EmailMessage {
  id: string
  from: { name: string; email: string }
  to: { name: string; email: string }[]
  cc?: { name: string; email: string }[]
  subject: string
  body: string
  date: string
  isInbound: boolean
}

export interface Interaction {
  id: string
  type: InteractionType
  date: string
  duration?: number
  summary: string
  transcript?: string
  recordingUrl?: string
  highlights: string[]
  wants: string[]
  concerns: string[]
  contactId: string
  venueId: string
  userId: string
  emailThread?: EmailMessage[]
}

export interface Todo {
  id: string
  title: string
  description?: string
  dueDate: string
  completed: boolean
  priority: "low" | "medium" | "high"
  assignedTo: string
  venueId: string
  contactId?: string
}

// Venues are the main entity - each has an operator and concessionaire(s)
export interface Venue {
  id: string
  name: string
  address: string
  city: string
  state: string
  type: VenueType
  capacity?: number
  stage: VenueStage
  status: VenueStatus
  dealValue?: number
  probability?: number
  nextFollowUp?: string
  notes?: string
  operatorId: string
  concessionaireIds: string[]
  createdAt: string
  lastActivity: string
}

export interface Company {
  id: string
  name: string
  logo: string
  website: string
  industry: string
  status: VenueStatus
  relationshipType: string
  annualRevenue: number
  totalDealValue: number
  createdAt: string
  lastActivity: string
}

export const users = [
  { id: "user-1", name: "Sarah Chen", email: "sarah@getlisto.io", avatar: "SC" },
  { id: "user-2", name: "Marcus Johnson", email: "marcus@getlisto.io", avatar: "MJ" },
  { id: "user-3", name: "Emily Rodriguez", email: "emily@getlisto.io", avatar: "ER" },
]

// Operators - companies that own/operate venues
export const operators: Operator[] = [
  {
    id: "op-1",
    name: "Live Nation Entertainment",
    logo: "LN",
    website: "https://livenation.com",
    description: "The world's leading live entertainment company",
    headquarters: "Beverly Hills, CA",
  },
  {
    id: "op-2",
    name: "Madison Square Garden Entertainment",
    logo: "MSG",
    website: "https://msg.com",
    description: "Premier live entertainment company",
    headquarters: "New York, NY",
  },
  {
    id: "op-3",
    name: "AEG Presents",
    logo: "AEG",
    website: "https://aegpresents.com",
    description: "Global entertainment company with venues worldwide",
    headquarters: "Los Angeles, CA",
  },
  {
    id: "op-4",
    name: "Oak View Group",
    logo: "OVG",
    website: "https://oakviewgroup.com",
    description: "Venue development, advisory, and investment company",
    headquarters: "Los Angeles, CA",
  },
  {
    id: "op-5",
    name: "Kroenke Sports & Entertainment",
    logo: "KSE",
    website: "https://kse.com",
    description: "Owner and operator of Ball Arena and sports teams",
    headquarters: "Denver, CO",
  },
]

// Concessionaires - companies that handle food & beverage at venues
export const concessionaires: Concessionaire[] = [
  {
    id: "con-1",
    name: "Levy Restaurants",
    logo: "LR",
    website: "https://levyrestaurants.com",
    description: "Premier hospitality company for sports and entertainment venues",
    headquarters: "Chicago, IL",
  },
  {
    id: "con-2",
    name: "Aramark",
    logo: "AR",
    website: "https://aramark.com",
    description: "Food service, facilities, and uniform provider",
    headquarters: "Philadelphia, PA",
  },
  {
    id: "con-3",
    name: "Sodexo",
    logo: "SD",
    website: "https://sodexo.com",
    description: "Global food services and facilities management company",
    headquarters: "Issy-les-Moulineaux, France",
  },
  {
    id: "con-4",
    name: "Delaware North",
    logo: "DN",
    website: "https://delawarenorth.com",
    description: "Hospitality and food service company",
    headquarters: "Buffalo, NY",
  },
  {
    id: "con-5",
    name: "Legends Hospitality",
    logo: "LH",
    website: "https://legends.net",
    description: "Premium experiences company for sports and entertainment",
    headquarters: "New York, NY",
  },
]

export const companies: Company[] = [
  {
    id: "comp-1",
    name: "Madison Square Garden Entertainment",
    logo: "MSG",
    website: "https://msg.com",
    industry: "Sports & Entertainment",
    status: "client",
    relationshipType: "concessionaire",
    annualRevenue: 1800000000,
    totalDealValue: 450000,
    createdAt: "2024-03-15",
    lastActivity: "2025-01-28",
  },
  {
    id: "comp-2",
    name: "Live Nation Entertainment",
    logo: "LN",
    website: "https://livenation.com",
    industry: "Live Events",
    status: "client",
    relationshipType: "venue",
    annualRevenue: 16000000000,
    totalDealValue: 780000,
    createdAt: "2024-01-10",
    lastActivity: "2025-01-27",
  },
  {
    id: "comp-3",
    name: "AEG Presents",
    logo: "AEG",
    website: "https://aegpresents.com",
    industry: "Sports & Entertainment",
    status: "prospect",
    relationshipType: "team",
    annualRevenue: 8500000000,
    totalDealValue: 320000,
    createdAt: "2024-11-20",
    lastActivity: "2025-01-25",
  },
  {
    id: "comp-4",
    name: "Kroenke Sports & Entertainment",
    logo: "KSE",
    website: "https://kse.com",
    industry: "Sports",
    status: "negotiating",
    relationshipType: "team",
    annualRevenue: 2500000000,
    totalDealValue: 550000,
    createdAt: "2024-08-05",
    lastActivity: "2025-01-26",
  },
  {
    id: "comp-5",
    name: "Oak View Group",
    logo: "OVG",
    website: "https://oakviewgroup.com",
    industry: "Venue Development",
    status: "prospect",
    relationshipType: "venue",
    annualRevenue: 1200000000,
    totalDealValue: 200000,
    createdAt: "2025-01-05",
    lastActivity: "2025-01-24",
  },
  {
    id: "comp-6",
    name: "Delaware North",
    logo: "DN",
    website: "https://delawarenorth.com",
    industry: "Hospitality",
    status: "churned",
    relationshipType: "concessionaire",
    annualRevenue: 3700000000,
    totalDealValue: 0,
    createdAt: "2023-06-12",
    lastActivity: "2024-09-15",
  },
]

export const venues: Venue[] = [
  {
    id: "ven-1",
    name: "Madison Square Garden",
    address: "4 Pennsylvania Plaza",
    city: "New York",
    state: "NY",
    type: "arena",
    capacity: 20789,
    stage: "closed-won",
    status: "client",
    dealValue: 250000,
    probability: 100,
    operatorId: "op-2",
    concessionaireIds: ["con-1"],
    createdAt: "2024-03-15",
    lastActivity: "2025-01-28",
  },
  {
    id: "ven-2",
    name: "Radio City Music Hall",
    address: "1260 Avenue of the Americas",
    city: "New York",
    state: "NY",
    type: "theater",
    capacity: 5960,
    stage: "closed-won",
    status: "client",
    dealValue: 120000,
    probability: 100,
    operatorId: "op-2",
    concessionaireIds: ["con-1"],
    createdAt: "2024-03-20",
    lastActivity: "2025-01-25",
  },
  {
    id: "ven-3",
    name: "The Beacon Theatre",
    address: "2124 Broadway",
    city: "New York",
    state: "NY",
    type: "theater",
    capacity: 2894,
    stage: "proposal",
    status: "negotiating",
    dealValue: 80000,
    probability: 60,
    nextFollowUp: "2025-02-03",
    operatorId: "op-2",
    concessionaireIds: ["con-4"],
    createdAt: "2024-11-10",
    lastActivity: "2025-01-26",
  },
  {
    id: "ven-4",
    name: "The Forum",
    address: "3900 W Manchester Blvd",
    city: "Inglewood",
    state: "CA",
    type: "arena",
    capacity: 17500,
    stage: "closed-won",
    status: "client",
    dealValue: 300000,
    probability: 100,
    operatorId: "op-1",
    concessionaireIds: ["con-5"],
    createdAt: "2024-01-10",
    lastActivity: "2025-01-27",
  },
  {
    id: "ven-5",
    name: "Hollywood Bowl",
    address: "2301 N Highland Ave",
    city: "Los Angeles",
    state: "CA",
    type: "amphitheater",
    capacity: 17500,
    stage: "closed-won",
    status: "client",
    dealValue: 280000,
    probability: 100,
    operatorId: "op-1",
    concessionaireIds: ["con-1", "con-5"],
    createdAt: "2024-02-15",
    lastActivity: "2025-01-24",
  },
  {
    id: "ven-6",
    name: "Red Rocks Amphitheatre",
    address: "18300 W Alameda Pkwy",
    city: "Morrison",
    state: "CO",
    type: "amphitheater",
    capacity: 9545,
    stage: "demo",
    status: "prospect",
    dealValue: 200000,
    probability: 40,
    nextFollowUp: "2025-02-01",
    operatorId: "op-1",
    concessionaireIds: ["con-2"],
    createdAt: "2024-12-01",
    lastActivity: "2025-01-27",
  },
  {
    id: "ven-7",
    name: "Crypto.com Arena",
    address: "1111 S Figueroa St",
    city: "Los Angeles",
    state: "CA",
    type: "arena",
    capacity: 20000,
    stage: "qualified",
    status: "prospect",
    dealValue: 180000,
    probability: 25,
    nextFollowUp: "2025-02-05",
    operatorId: "op-3",
    concessionaireIds: ["con-1"],
    createdAt: "2024-11-20",
    lastActivity: "2025-01-25",
  },
  {
    id: "ven-8",
    name: "Ball Arena",
    address: "1000 Chopper Circle",
    city: "Denver",
    state: "CO",
    type: "arena",
    capacity: 19520,
    stage: "negotiation",
    status: "negotiating",
    dealValue: 350000,
    probability: 75,
    nextFollowUp: "2025-01-31",
    operatorId: "op-5",
    concessionaireIds: ["con-1", "con-3"],
    createdAt: "2024-08-05",
    lastActivity: "2025-01-26",
  },
  {
    id: "ven-9",
    name: "Climate Pledge Arena",
    address: "334 1st Ave N",
    city: "Seattle",
    state: "WA",
    type: "arena",
    capacity: 17100,
    stage: "lead",
    status: "prospect",
    dealValue: 200000,
    probability: 10,
    nextFollowUp: "2025-02-10",
    operatorId: "op-4",
    concessionaireIds: ["con-4"],
    createdAt: "2025-01-05",
    lastActivity: "2025-01-24",
  },
  {
    id: "ven-10",
    name: "SoFi Stadium",
    address: "1001 Stadium Dr",
    city: "Inglewood",
    state: "CA",
    type: "stadium",
    capacity: 70240,
    stage: "lead",
    status: "prospect",
    dealValue: 500000,
    probability: 15,
    nextFollowUp: "2025-02-15",
    operatorId: "op-5",
    concessionaireIds: ["con-5"],
    createdAt: "2025-01-10",
    lastActivity: "2025-01-20",
  },
  {
    id: "ven-11",
    name: "T-Mobile Arena",
    address: "3780 Las Vegas Blvd S",
    city: "Las Vegas",
    state: "NV",
    type: "arena",
    capacity: 20000,
    stage: "demo",
    status: "prospect",
    dealValue: 275000,
    probability: 35,
    nextFollowUp: "2025-02-08",
    operatorId: "op-3",
    concessionaireIds: ["con-2"],
    createdAt: "2024-10-15",
    lastActivity: "2025-01-22",
  },
  {
    id: "ven-12",
    name: "Barclays Center",
    address: "620 Atlantic Ave",
    city: "Brooklyn",
    state: "NY",
    type: "arena",
    capacity: 17732,
    stage: "proposal",
    status: "negotiating",
    dealValue: 290000,
    probability: 55,
    nextFollowUp: "2025-02-04",
    operatorId: "op-4",
    concessionaireIds: ["con-1", "con-4"],
    createdAt: "2024-09-20",
    lastActivity: "2025-01-28",
  },
]

export const contacts: Contact[] = [
  {
    id: "con-1",
    name: "David Fernandez",
    email: "dfernandez@msg.com",
    phone: "+1 (212) 465-6000",
    role: "VP of Operations",
    isPrimary: true,
    avatar: "DF",
    venueIds: ["ven-1", "ven-2", "ven-3"],
  },
  {
    id: "con-2",
    name: "Michelle Park",
    email: "mpark@msg.com",
    phone: "+1 (212) 465-6001",
    role: "F&B Director",
    isPrimary: false,
    avatar: "MP",
    venueIds: ["ven-1"],
  },
  {
    id: "con-3",
    name: "James Wilson",
    email: "jwilson@msg.com",
    phone: "+1 (212) 465-6002",
    role: "Technology Manager",
    isPrimary: false,
    avatar: "JW",
    venueIds: ["ven-1", "ven-2"],
  },
  {
    id: "con-4",
    name: "Amanda Torres",
    email: "atorres@livenation.com",
    phone: "+1 (310) 867-7000",
    role: "Chief Operations Officer",
    isPrimary: true,
    avatar: "AT",
    venueIds: ["ven-4", "ven-5", "ven-6"],
  },
  {
    id: "con-5",
    name: "Robert Kim",
    email: "rkim@livenation.com",
    phone: "+1 (310) 867-7001",
    role: "Venue General Manager",
    isPrimary: false,
    avatar: "RK",
    venueIds: ["ven-4"],
  },
  {
    id: "con-6",
    name: "Lisa Chen",
    email: "lchen@aegpresents.com",
    phone: "+1 (213) 763-7000",
    role: "VP Business Development",
    isPrimary: true,
    avatar: "LC",
    venueIds: ["ven-7"],
  },
  {
    id: "con-7",
    name: "Michael Brown",
    email: "mbrown@kse.com",
    phone: "+1 (303) 405-1000",
    role: "President of Operations",
    isPrimary: true,
    avatar: "MB",
    venueIds: ["ven-8"],
  },
  {
    id: "con-8",
    name: "Jennifer Adams",
    email: "jadams@oakviewgroup.com",
    phone: "+1 (206) 555-0100",
    role: "General Manager",
    isPrimary: true,
    avatar: "JA",
    venueIds: ["ven-9"],
  },
]

export const interactions: Interaction[] = [
  {
    id: "int-1",
    type: "video",
    date: "2025-01-28T14:00:00Z",
    duration: 45,
    summary: "Quarterly business review with MSG leadership team",
    transcript: "Meeting started with review of Q4 performance metrics. David highlighted 23% increase in order throughput since List implementation. Michelle mentioned positive feedback from staff about the mobile ordering interface. Discussed expansion to Beacon Theatre - David confirmed internal approval process underway. Action items: Send updated proposal for Beacon, schedule training session for new hires.",
    recordingUrl: "/recordings/msg-qbr-jan2025.mp4",
    highlights: [
      "23% increase in order throughput since implementation",
      "Staff giving positive feedback on mobile interface",
      "Internal approval for Beacon expansion underway",
    ],
    wants: [
      "Dedicated account manager for all MSG properties",
      "Custom reporting dashboard for F&B metrics",
      "Integration with their new POS system",
    ],
    concerns: [
      "Timeline for Beacon rollout needs to align with spring season",
      "Staff training capacity during busy months",
    ],
    contactId: "con-1",
    venueId: "ven-1",
    userId: "user-1",
  },
  {
    id: "int-2",
    type: "email",
    date: "2025-01-27T10:30:00Z",
    summary: "Follow-up on Red Rocks demo scheduling",
    highlights: [
      "Demo scheduled for February 15th",
      "Key stakeholders confirmed attendance",
    ],
    wants: [
      "Integration with outdoor venue weather systems",
      "Offline mode for connectivity issues",
    ],
    concerns: [],
    contactId: "con-4",
    venueId: "ven-6",
    userId: "user-2",
    emailThread: [
      {
        id: "email-1",
        from: { name: "Marcus Johnson", email: "marcus@getlisto.io" },
        to: [{ name: "David Park", email: "david.park@livenation.com" }],
        subject: "Re: Red Rocks Amphitheatre - Demo Scheduling",
        body: `Hi David,

Thanks for the quick response! February 15th works perfectly for us. We'll have our full demo team ready.

For the demo, we'll showcase:
- Mobile ordering flow optimized for outdoor venues
- Real-time inventory management with weather-adjusted predictions
- Offline mode capabilities for connectivity challenges
- Integration options with your current POS system

Could you confirm the attendee list so we can tailor the presentation accordingly?

Best regards,
Marcus Johnson
Account Executive | List
marcus@getlisto.io`,
        date: "2025-01-27T10:30:00Z",
        isInbound: false,
      },
      {
        id: "email-2",
        from: { name: "David Park", email: "david.park@livenation.com" },
        to: [{ name: "Marcus Johnson", email: "marcus@getlisto.io" }],
        cc: [{ name: "Jennifer Walsh", email: "j.walsh@livenation.com" }],
        subject: "Re: Red Rocks Amphitheatre - Demo Scheduling",
        body: `Marcus,

Great to hear back from you. After discussing with Jennifer Walsh (our VP of Operations), we'd like to propose February 15th for the demo.

We're particularly interested in your offline capabilities given Red Rocks' unique outdoor challenges. The venue can have 9,500 attendees and connectivity is always a concern.

Key stakeholders who will attend:
- Jennifer Walsh, VP Operations
- Tom Richards, IT Director
- Sarah Mitchell, Concessions Manager
- Myself

Please let me know if this date works on your end.

Best,
David Park
Operations Manager | Red Rocks Amphitheatre`,
        date: "2025-01-26T15:45:00Z",
        isInbound: true,
      },
      {
        id: "email-3",
        from: { name: "Marcus Johnson", email: "marcus@getlisto.io" },
        to: [{ name: "David Park", email: "david.park@livenation.com" }],
        subject: "Red Rocks Amphitheatre - Demo Scheduling",
        body: `Hi David,

It was great meeting you at the Venue Operations Summit last week. As discussed, I wanted to follow up about scheduling a demo of List for Red Rocks Amphitheatre.

Our platform has been specifically designed to handle the unique challenges of outdoor venues like Red Rocks. I think you'll be particularly impressed with our weather-adaptive inventory management and offline-first architecture.

Would you have availability in the next few weeks for a 60-minute demo? I'm happy to work around your schedule.

Looking forward to hearing from you.

Best regards,
Marcus Johnson
Account Executive | List`,
        date: "2025-01-24T09:15:00Z",
        isInbound: false,
      },
    ],
  },
  {
    id: "int-3",
    type: "call",
    date: "2025-01-26T16:00:00Z",
    duration: 30,
    summary: "Ball Arena negotiation call - pricing discussion",
    transcript: "Michael expressed strong interest in moving forward. Main concern is implementation timeline given their event schedule. Discussed phased rollout approach starting with VIP suites. He mentioned competitor quote was 15% lower but prefers our platform capabilities. Need to get creative on pricing structure.",
    recordingUrl: "/recordings/ballarena-jan26.mp3",
    highlights: [
      "Strong interest in moving forward",
      "Considering phased rollout starting with VIP suites",
      "Competitor quote 15% lower but prefers our capabilities",
    ],
    wants: [
      "Flexible payment terms",
      "Phased implementation approach",
      "VIP suite priority features",
    ],
    concerns: [
      "Implementation timeline vs event schedule",
      "Budget constraints - competitor pricing pressure",
    ],
    contactId: "con-7",
    venueId: "ven-8",
    userId: "user-1",
  },
  {
    id: "int-4",
    type: "meeting",
    date: "2025-01-25T11:00:00Z",
    duration: 90,
    summary: "On-site visit at Crypto.com Arena with AEG team",
    transcript: "Site walkthrough focused on concession stand layouts and WiFi infrastructure. Lisa showed us the current pain points with long lines at main concourse. Discussed potential for mobile ordering stations. Their IT team has concerns about integration with legacy systems. Next step is technical architecture review.",
    highlights: [
      "Identified key pain points at main concourse",
      "Mobile ordering stations could reduce wait times by 40%",
      "IT team needs technical architecture review",
    ],
    wants: [
      "Reduced wait times at concessions",
      "Better inventory management",
      "Real-time sales analytics",
    ],
    concerns: [
      "Integration with legacy systems",
      "IT team capacity for implementation",
    ],
    contactId: "con-6",
    venueId: "ven-7",
    userId: "user-3",
  },
  {
    id: "int-5",
    type: "note",
    date: "2025-01-24T09:00:00Z",
    summary: "Internal note: Climate Pledge Arena opportunity assessment",
    highlights: [
      "New venue with modern infrastructure",
      "OVG expanding rapidly - could lead to more venues",
      "Decision maker identified: Jennifer Adams",
    ],
    wants: [],
    concerns: [
      "Early stage - need to build relationship",
      "May have existing vendor commitments",
    ],
    contactId: "con-8",
    venueId: "ven-9",
    userId: "user-2",
  },
  {
    id: "int-6",
    type: "video",
    date: "2025-01-20T15:00:00Z",
    duration: 60,
    summary: "Product demo for Hollywood Bowl team",
    transcript: "Demonstrated full platform capabilities including mobile ordering, inventory management, and analytics dashboard. Robert was particularly impressed with the weather-based demand forecasting. Questions about handling large crowds during major events. Amanda confirmed she will present to leadership next week.",
    recordingUrl: "/recordings/hollywoodbowl-demo.mp4",
    highlights: [
      "Strong interest in weather-based demand forecasting",
      "Amanda to present to leadership",
      "Impressed with analytics capabilities",
    ],
    wants: [
      "Weather-based demand forecasting",
      "Large crowd management features",
      "Quick service during intermissions",
    ],
    concerns: [
      "Handling 17,500 concurrent users",
      "Network reliability during events",
    ],
    contactId: "con-5",
    venueId: "ven-5",
    userId: "user-1",
  },
]

// Dynamic due dates for todos
const todayDate = new Date()
const formatTodoDate = (daysFromNow: number) => {
  const d = new Date(todayDate.getTime() + daysFromNow * 24 * 60 * 60 * 1000)
  return d.toISOString().split("T")[0]
}

export const todos: Todo[] = [
  {
    id: "todo-1",
    title: "Send Beacon Theatre proposal",
    description: "Updated pricing proposal with multi-venue discount",
    dueDate: formatTodoDate(-2), // 2 days overdue
    completed: false,
    priority: "high",
    assignedTo: "user-1",
    venueId: "ven-3",
    contactId: "con-1",
  },
  {
    id: "todo-2",
    title: "Schedule Red Rocks demo",
    description: "Confirm stakeholder availability for Feb 15th demo",
    dueDate: formatTodoDate(1),
    completed: false,
    priority: "high",
    assignedTo: "user-2",
    venueId: "ven-6",
    contactId: "con-4",
  },
  {
    id: "todo-3",
    title: "Prepare Ball Arena pricing proposal",
    description: "Creative pricing structure to address budget concerns",
    dueDate: formatTodoDate(0), // Due today
    completed: false,
    priority: "high",
    assignedTo: "user-1",
    venueId: "ven-8",
    contactId: "con-7",
  },
  {
    id: "todo-4",
    title: "Technical architecture document for AEG",
    description: "Address IT team concerns about legacy system integration",
    dueDate: formatTodoDate(3),
    completed: false,
    priority: "medium",
    assignedTo: "user-3",
    venueId: "ven-7",
    contactId: "con-6",
  },
  {
    id: "todo-5",
    title: "Initial outreach to Climate Pledge Arena",
    description: "Schedule introductory call with Jennifer Adams",
    dueDate: formatTodoDate(7),
    completed: false,
    priority: "low",
    assignedTo: "user-2",
    venueId: "ven-9",
    contactId: "con-8",
  },
  {
    id: "todo-6",
    title: "Follow up on Amanda's leadership presentation",
    description: "Check if leadership approved moving forward",
    dueDate: formatTodoDate(-1), // 1 day overdue
    completed: false,
    priority: "medium",
    assignedTo: "user-1",
    venueId: "ven-5",
    contactId: "con-4",
  },
  {
    id: "todo-7",
    title: "MSG quarterly report preparation",
    dueDate: formatTodoDate(12),
    completed: false,
    priority: "medium",
    assignedTo: "user-1",
    venueId: "ven-1",
    contactId: "con-1",
  },
  {
    id: "todo-8",
    title: "Call SoFi Stadium VP back",
    description: "Respond to inbound inquiry within 24 hours",
    dueDate: formatTodoDate(0), // Due today
    completed: false,
    priority: "high",
    assignedTo: "user-1",
    venueId: "ven-10",
    contactId: "con-5",
  },
  {
    id: "todo-9",
    title: "Review Barclays Center contract terms",
    description: "Legal team needs feedback on proposed terms",
    dueDate: formatTodoDate(2),
    completed: false,
    priority: "medium",
    assignedTo: "user-1",
    venueId: "ven-12",
    contactId: "con-8",
  },
  {
    id: "todo-10",
    title: "Update CRM with T-Mobile Arena notes",
    description: "Add meeting notes and next steps from site walk",
    dueDate: formatTodoDate(1),
    completed: false,
    priority: "low",
    assignedTo: "user-2",
    venueId: "ven-11",
    contactId: "con-6",
  },
  {
    id: "todo-11",
    title: "Send MSG success metrics to marketing",
    description: "23% throughput increase data for case study",
    dueDate: formatTodoDate(5),
    completed: false,
    priority: "medium",
    assignedTo: "user-1",
    venueId: "ven-1",
    contactId: "con-1",
  },
  {
    id: "todo-12",
    title: "Prep demo environment for Red Rocks",
    description: "Configure outdoor venue settings and offline mode",
    dueDate: formatTodoDate(10),
    completed: false,
    priority: "medium",
    assignedTo: "user-3",
    venueId: "ven-6",
    contactId: "con-4",
  },
]

// Files - documents associated with venues, operators, and concessionaires
export const files: VenueFile[] = [
  // Operator files (inheritable to venues)
  {
    id: "file-1",
    name: "Live Nation Corporate Overview 2024",
    type: "deck",
    date: "2024-01-15",
    url: "https://drive.google.com/file/d/live-nation-overview",
    description: "Corporate overview deck for all Live Nation partnerships",
    entityType: "operator",
    entityId: "op-1",
    isInheritable: true,
    createdAt: "2024-01-15",
  },
  {
    id: "file-2",
    name: "Live Nation Partnership Guidelines",
    type: "one-pager",
    date: "2024-03-01",
    url: "https://drive.google.com/file/d/ln-guidelines",
    description: "Standard partnership guidelines and requirements",
    entityType: "operator",
    entityId: "op-1",
    isInheritable: true,
    createdAt: "2024-03-01",
  },
  {
    id: "file-3",
    name: "MSG Entertainment Brand Standards",
    type: "deck",
    date: "2024-02-20",
    url: "https://drive.google.com/file/d/msg-brand",
    description: "Brand guidelines for MSG properties",
    entityType: "operator",
    entityId: "op-2",
    isInheritable: true,
    createdAt: "2024-02-20",
  },
  {
    id: "file-4",
    name: "Oak View Group Venue Standards",
    type: "report",
    date: "2024-06-10",
    url: "https://drive.google.com/file/d/ovg-standards",
    description: "Operational standards for OVG managed venues",
    entityType: "operator",
    entityId: "op-4",
    isInheritable: true,
    createdAt: "2024-06-10",
  },
  // Concessionaire files (inheritable to venues)
  {
    id: "file-5",
    name: "Levy Menu Standards 2024",
    type: "deck",
    date: "2024-04-01",
    url: "https://drive.google.com/file/d/levy-menu",
    description: "Standard menu offerings and pricing guidelines",
    entityType: "concessionaire",
    entityId: "con-1",
    isInheritable: true,
    createdAt: "2024-04-01",
  },
  {
    id: "file-6",
    name: "Levy Hospitality Training Guide",
    type: "other",
    date: "2024-05-15",
    url: "https://drive.google.com/file/d/levy-training",
    description: "Staff training materials",
    entityType: "concessionaire",
    entityId: "con-1",
    isInheritable: true,
    createdAt: "2024-05-15",
  },
  {
    id: "file-7",
    name: "Aramark Food Safety Standards",
    type: "report",
    date: "2024-03-20",
    url: "https://drive.google.com/file/d/aramark-safety",
    description: "Food safety and hygiene requirements",
    entityType: "concessionaire",
    entityId: "con-2",
    isInheritable: true,
    createdAt: "2024-03-20",
  },
  {
    id: "file-8",
    name: "Legends VIP Experience Guide",
    type: "deck",
    date: "2024-07-01",
    url: "https://drive.google.com/file/d/legends-vip",
    description: "Premium hospitality service standards",
    entityType: "concessionaire",
    entityId: "con-5",
    isInheritable: true,
    createdAt: "2024-07-01",
  },
  // Venue-specific files
  {
    id: "file-9",
    name: "MSG Q4 2024 Sales Deck",
    type: "deck",
    date: "2024-12-15",
    url: "https://drive.google.com/file/d/msg-q4-deck",
    description: "Q4 sales presentation for Madison Square Garden",
    entityType: "venue",
    entityId: "ven-1",
    createdAt: "2024-12-15",
  },
  {
    id: "file-10",
    name: "MSG Venue One-Pager",
    type: "one-pager",
    date: "2024-11-20",
    url: "https://drive.google.com/file/d/msg-one-pager",
    description: "Overview document for MSG partnership",
    entityType: "venue",
    entityId: "ven-1",
    createdAt: "2024-11-20",
  },
  {
    id: "file-11",
    name: "The Forum Partnership Proposal",
    type: "proposal",
    date: "2024-01-05",
    url: "https://drive.google.com/file/d/forum-proposal",
    description: "Initial partnership proposal",
    entityType: "venue",
    entityId: "ven-4",
    createdAt: "2024-01-05",
  },
  {
    id: "file-12",
    name: "Hollywood Bowl Seasonal Analysis",
    type: "report",
    date: "2024-09-30",
    url: "https://drive.google.com/file/d/hb-analysis",
    description: "Seasonal performance analysis",
    entityType: "venue",
    entityId: "ven-5",
    createdAt: "2024-09-30",
  },
  {
    id: "file-13",
    name: "Ball Arena Proposal Draft",
    type: "proposal",
    date: "2025-01-20",
    url: "https://drive.google.com/file/d/ball-arena-proposal",
    description: "Draft proposal for Ball Arena partnership",
    entityType: "venue",
    entityId: "ven-8",
    createdAt: "2025-01-20",
  },
  {
    id: "file-14",
    name: "Red Rocks Demo Presentation",
    type: "deck",
    date: "2025-01-25",
    url: "https://drive.google.com/file/d/redrocks-demo",
    description: "Demo presentation for upcoming meeting",
    entityType: "venue",
    entityId: "ven-6",
    createdAt: "2025-01-25",
  },
]

// Contracts - legal agreements with venues, operators, and concessionaires
export const contracts: Contract[] = [
  // Operator contracts (inheritable to venues)
  {
    id: "contract-1",
    name: "Live Nation Master Service Agreement",
    type: "msa",
    effectiveDate: "2024-01-01",
    expirationDate: "2026-12-31",
    status: "active",
    url: "https://drive.google.com/file/d/ln-msa",
    description: "Master agreement covering all Live Nation venues",
    entityType: "operator",
    entityId: "op-1",
    isInheritable: true,
    createdAt: "2024-01-01",
  },
  {
    id: "contract-2",
    name: "MSG Entertainment MSA",
    type: "msa",
    effectiveDate: "2024-03-15",
    expirationDate: "2027-03-14",
    status: "active",
    url: "https://drive.google.com/file/d/msg-msa",
    description: "Master service agreement with MSG Entertainment",
    entityType: "operator",
    entityId: "op-2",
    isInheritable: true,
    createdAt: "2024-03-15",
  },
  {
    id: "contract-3",
    name: "Oak View Group NDA",
    type: "nda",
    effectiveDate: "2025-01-05",
    status: "active",
    url: "https://drive.google.com/file/d/ovg-nda",
    description: "Non-disclosure agreement for partnership discussions",
    entityType: "operator",
    entityId: "op-4",
    isInheritable: false,
    createdAt: "2025-01-05",
  },
  // Concessionaire contracts (inheritable to venues)
  {
    id: "contract-4",
    name: "Levy Restaurants Partnership Agreement",
    type: "msa",
    effectiveDate: "2024-02-01",
    expirationDate: "2027-01-31",
    status: "active",
    url: "https://drive.google.com/file/d/levy-msa",
    description: "Master partnership agreement with Levy",
    entityType: "concessionaire",
    entityId: "con-1",
    isInheritable: true,
    createdAt: "2024-02-01",
  },
  {
    id: "contract-5",
    name: "Aramark Venue Services Agreement",
    type: "msa",
    effectiveDate: "2024-06-01",
    expirationDate: "2026-05-31",
    status: "active",
    url: "https://drive.google.com/file/d/aramark-msa",
    description: "Service agreement for Aramark managed concessions",
    entityType: "concessionaire",
    entityId: "con-2",
    isInheritable: true,
    createdAt: "2024-06-01",
  },
  {
    id: "contract-6",
    name: "Legends Hospitality MSA",
    type: "msa",
    effectiveDate: "2024-04-01",
    expirationDate: "2027-03-31",
    status: "active",
    url: "https://drive.google.com/file/d/legends-msa",
    description: "Master service agreement for premium hospitality",
    entityType: "concessionaire",
    entityId: "con-5",
    isInheritable: true,
    createdAt: "2024-04-01",
  },
  // Venue-specific contracts
  {
    id: "contract-7",
    name: "Madison Square Garden SOW",
    type: "sow",
    effectiveDate: "2024-03-20",
    expirationDate: "2025-03-19",
    status: "active",
    url: "https://drive.google.com/file/d/msg-sow",
    description: "Statement of work for MSG implementation",
    entityType: "venue",
    entityId: "ven-1",
    createdAt: "2024-03-20",
  },
  {
    id: "contract-8",
    name: "Radio City Music Hall SOW",
    type: "sow",
    effectiveDate: "2024-04-01",
    expirationDate: "2025-03-31",
    status: "active",
    url: "https://drive.google.com/file/d/rcmh-sow",
    description: "Implementation scope for Radio City",
    entityType: "venue",
    entityId: "ven-2",
    createdAt: "2024-04-01",
  },
  {
    id: "contract-9",
    name: "The Forum Implementation Agreement",
    type: "sow",
    effectiveDate: "2024-01-15",
    expirationDate: "2025-01-14",
    status: "active",
    url: "https://drive.google.com/file/d/forum-sow",
    description: "SOW for The Forum rollout",
    entityType: "venue",
    entityId: "ven-4",
    createdAt: "2024-01-15",
  },
  {
    id: "contract-10",
    name: "Hollywood Bowl Seasonal Contract",
    type: "sow",
    effectiveDate: "2024-05-01",
    expirationDate: "2024-10-31",
    status: "expired",
    url: "https://drive.google.com/file/d/hb-seasonal",
    description: "2024 season implementation",
    entityType: "venue",
    entityId: "ven-5",
    createdAt: "2024-05-01",
  },
  {
    id: "contract-11",
    name: "Hollywood Bowl 2025 Season",
    type: "sow",
    effectiveDate: "2025-05-01",
    expirationDate: "2025-10-31",
    status: "pending",
    url: "https://drive.google.com/file/d/hb-2025",
    description: "2025 season contract",
    entityType: "venue",
    entityId: "ven-5",
    createdAt: "2025-01-10",
  },
  {
    id: "contract-12",
    name: "Ball Arena NDA",
    type: "nda",
    effectiveDate: "2024-08-05",
    status: "active",
    url: "https://drive.google.com/file/d/ball-nda",
    description: "NDA for partnership discussions",
    entityType: "venue",
    entityId: "ven-8",
    createdAt: "2024-08-05",
  },
]

// Operator helper functions
export function getOperatorById(id: string) {
  return operators.find((o) => o.id === id)
}

export function getVenuesByOperatorId(operatorId: string) {
  return venues.filter((v) => v.operatorId === operatorId)
}

// Concessionaire helper functions
export function getConcessionaireById(id: string) {
  return concessionaires.find((c) => c.id === id)
}

export function getVenuesByConcessionaireId(concessionaireId: string) {
  return venues.filter((v) => v.concessionaireIds.includes(concessionaireId))
}

export function getConcessionairesByVenueId(venueId: string) {
  const venue = venues.find((v) => v.id === venueId)
  if (!venue) return []
  return venue.concessionaireIds.map((id) => getConcessionaireById(id)).filter(Boolean)
}

// Legacy company functions (kept for backward compatibility)
export function getCompanyById(id: string) {
  return companies.find((c) => c.id === id)
}

export function getVenuesByCompanyId(companyId: string) {
  // Map old company IDs to new operator IDs for backward compatibility
  const operatorMapping: Record<string, string> = {
    "comp-1": "op-2", // MSG
    "comp-2": "op-1", // Live Nation
    "comp-3": "op-3", // AEG
    "comp-4": "op-5", // KSE
    "comp-5": "op-4", // OVG
  }
  const operatorId = operatorMapping[companyId]
  if (operatorId) {
    return venues.filter((v) => v.operatorId === operatorId)
  }
  return []
}

// Venue helper functions
export function getVenueById(id: string) {
  return venues.find((v) => v.id === id)
}

export function getContactsByVenueId(venueId: string) {
  return contacts.filter((c) => c.venueIds.includes(venueId))
}

export function getContactsByOperatorId(operatorId: string) {
  const operatorVenues = getVenuesByOperatorId(operatorId)
  const venueIds = operatorVenues.map((v) => v.id)
  return contacts.filter((c) => c.venueIds.some((vid) => venueIds.includes(vid)))
}

export function getContactsByConcessionaireId(concessionaireId: string) {
  const conVenues = getVenuesByConcessionaireId(concessionaireId)
  const venueIds = conVenues.map((v) => v.id)
  return contacts.filter((c) => c.venueIds.some((vid) => venueIds.includes(vid)))
}

// Legacy function
export function getContactsByCompanyId(companyId: string) {
  const companyVenues = getVenuesByCompanyId(companyId)
  const venueIds = companyVenues.map((v) => v.id)
  return contacts.filter((c) => c.venueIds.some((vid) => venueIds.includes(vid)))
}

export function getInteractionsByVenueId(venueId: string) {
  return interactions.filter((i) => i.venueId === venueId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getInteractionsByOperatorId(operatorId: string) {
  const operatorVenues = getVenuesByOperatorId(operatorId)
  const venueIds = operatorVenues.map((v) => v.id)
  return interactions.filter((i) => venueIds.includes(i.venueId)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// Legacy function
export function getInteractionsByCompanyId(companyId: string) {
  const companyVenues = getVenuesByCompanyId(companyId)
  const venueIds = companyVenues.map((v) => v.id)
  return interactions.filter((i) => venueIds.includes(i.venueId)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getTodosByVenueId(venueId: string) {
  return todos.filter((t) => t.venueId === venueId)
}

export function getTodosByOperatorId(operatorId: string) {
  const operatorVenues = getVenuesByOperatorId(operatorId)
  const venueIds = operatorVenues.map((v) => v.id)
  return todos.filter((t) => venueIds.includes(t.venueId))
}

// Legacy function
export function getTodosByCompanyId(companyId: string) {
  const companyVenues = getVenuesByCompanyId(companyId)
  const venueIds = companyVenues.map((v) => v.id)
  return todos.filter((t) => venueIds.includes(t.venueId))
}

export function getUserById(id: string) {
  return users.find((u) => u.id === id)
}

export function getContactById(id: string) {
  return contacts.find((c) => c.id === id)
}

// File helper functions
export function getFilesByEntityId(entityType: "venue" | "operator" | "concessionaire", entityId: string) {
  return files
    .filter((f) => f.entityType === entityType && f.entityId === entityId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getFilesForVenue(venueId: string) {
  const venue = getVenueById(venueId)
  if (!venue) return { venueFiles: [], inheritedFromOperator: [], inheritedFromConcessionaire: [] }

  // Get venue-specific files
  const venueFiles = files
    .filter((f) => f.entityType === "venue" && f.entityId === venueId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Get inherited files from operator
  const inheritedFromOperator = files
    .filter((f) => f.entityType === "operator" && f.entityId === venue.operatorId && f.isInheritable)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  // Get inherited files from concessionaires
  const inheritedFromConcessionaire = files
    .filter((f) => f.entityType === "concessionaire" && venue.concessionaireIds.includes(f.entityId) && f.isInheritable)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return { venueFiles, inheritedFromOperator, inheritedFromConcessionaire }
}

// Contract helper functions
export function getContractsByEntityId(entityType: "venue" | "operator" | "concessionaire", entityId: string) {
  return contracts
    .filter((c) => c.entityType === entityType && c.entityId === entityId)
    .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())
}

export function getContractsForVenue(venueId: string) {
  const venue = getVenueById(venueId)
  if (!venue) return { venueContracts: [], inheritedFromOperator: [], inheritedFromConcessionaire: [] }

  // Get venue-specific contracts
  const venueContracts = contracts
    .filter((c) => c.entityType === "venue" && c.entityId === venueId)
    .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())

  // Get inherited contracts from operator
  const inheritedFromOperator = contracts
    .filter((c) => c.entityType === "operator" && c.entityId === venue.operatorId && c.isInheritable)
    .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())

  // Get inherited contracts from concessionaires
  const inheritedFromConcessionaire = contracts
    .filter((c) => c.entityType === "concessionaire" && venue.concessionaireIds.includes(c.entityId) && c.isInheritable)
    .sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime())

  return { venueContracts, inheritedFromOperator, inheritedFromConcessionaire }
}

// ============================================
// Dashboard Types and Data
// ============================================

// Scheduled events - calls, meetings on calendar
export interface ScheduledEvent {
  id: string
  type: "call" | "video" | "meeting"
  title: string
  startTime: string // ISO datetime
  endTime?: string
  venueId: string
  contactId: string
  userId: string
  meetingLink?: string // For video calls
  location?: string // For in-person meetings
  notes?: string
}

// AI-recommended actions
export type RecommendedActionType = "follow-up-email" | "schedule-call" | "send-proposal" | "check-in"

export interface RecommendedAction {
  id: string
  type: RecommendedActionType
  priority: "high" | "medium" | "low"
  title: string
  reason: string // Why AI suggests this
  suggestedContent?: string // Pre-written email/message
  venueId: string
  contactId: string
  userId: string
  dueBy?: string
}

// Business insights/news
export type InsightType = "contract-news" | "engagement-metric" | "pipeline-alert" | "milestone" | "inbound-activity"
export type InsightPriority = "info" | "positive" | "warning" | "urgent"

export interface BusinessInsight {
  id: string
  type: InsightType
  title: string
  description: string
  timestamp: string
  venueId?: string
  operatorId?: string
  metric?: { value: number; change: number; unit: string }
  priority: InsightPriority
}

// Scheduled events for today - using dynamic date for demo purposes
const today = new Date().toISOString().split("T")[0]

export const scheduledEvents: ScheduledEvent[] = [
  {
    id: "evt-1",
    type: "video",
    title: "Ball Arena Contract Review",
    startTime: `${today}T10:00:00Z`,
    endTime: `${today}T10:30:00Z`,
    venueId: "ven-8",
    contactId: "con-7",
    userId: "user-1",
    meetingLink: "https://meet.google.com/abc-defg-hij",
    notes: "Review final pricing structure",
  },
  {
    id: "evt-2",
    type: "call",
    title: "Follow-up: Beacon Theatre Proposal",
    startTime: `${today}T14:00:00Z`,
    endTime: `${today}T14:30:00Z`,
    venueId: "ven-3",
    contactId: "con-1",
    userId: "user-1",
  },
  {
    id: "evt-3",
    type: "meeting",
    title: "Red Rocks Site Visit Planning",
    startTime: `${today}T16:00:00Z`,
    venueId: "ven-6",
    contactId: "con-4",
    userId: "user-2",
    location: "Live Nation HQ, Denver",
  },
  {
    id: "evt-4",
    type: "video",
    title: "AEG Technical Review",
    startTime: `${today}T11:30:00Z`,
    endTime: `${today}T12:00:00Z`,
    venueId: "ven-7",
    contactId: "con-6",
    userId: "user-3",
    meetingLink: "https://zoom.us/j/123456789",
    notes: "Discuss legacy system integration",
  },
  {
    id: "evt-5",
    type: "video",
    title: "MSG Quarterly Strategy Call",
    startTime: `${today}T09:00:00Z`,
    endTime: `${today}T09:45:00Z`,
    venueId: "ven-1",
    contactId: "con-1",
    userId: "user-1",
    meetingLink: "https://teams.microsoft.com/l/meetup-join/abc123",
    notes: "Q1 planning and roadmap review",
  },
  {
    id: "evt-6",
    type: "call",
    title: "Barclays Center Follow-up",
    startTime: `${today}T15:30:00Z`,
    endTime: `${today}T16:00:00Z`,
    venueId: "ven-12",
    contactId: "con-8",
    userId: "user-1",
  },
  {
    id: "evt-7",
    type: "meeting",
    title: "T-Mobile Arena Site Walk",
    startTime: `${today}T13:00:00Z`,
    endTime: `${today}T14:30:00Z`,
    venueId: "ven-11",
    contactId: "con-6",
    userId: "user-2",
    location: "T-Mobile Arena, Las Vegas",
  },
  {
    id: "evt-8",
    type: "video",
    title: "Climate Pledge Intro Call",
    startTime: `${today}T11:00:00Z`,
    endTime: `${today}T11:30:00Z`,
    venueId: "ven-9",
    contactId: "con-8",
    userId: "user-2",
    meetingLink: "https://zoom.us/j/987654321",
    notes: "Initial discovery call with OVG team",
  },
]

// AI-recommended actions
export const recommendedActions: RecommendedAction[] = [
  {
    id: "rec-1",
    type: "follow-up-email",
    priority: "high",
    title: "Follow up with Michael Brown on pricing",
    reason:
      "Ball Arena negotiation call was 7 days ago. They mentioned competitor pricing was 15% lower - time to present revised proposal.",
    suggestedContent: `Hi Michael,

Thank you for our productive call last week. I've been working with our team on a flexible pricing structure that addresses your budget considerations while maintaining the full platform capabilities you valued.

I'd love to walk you through our revised proposal. Would you have 30 minutes this week?

Best regards`,
    venueId: "ven-8",
    contactId: "con-7",
    userId: "user-1",
    dueBy: "2025-02-03",
  },
  {
    id: "rec-2",
    type: "check-in",
    priority: "medium",
    title: "Check in with Lisa Chen on technical review",
    reason:
      "Crypto.com Arena site visit was 9 days ago. IT team needed architecture review - follow up on their evaluation.",
    suggestedContent: `Hi Lisa,

I wanted to follow up on the technical architecture review we discussed during my visit. Has your IT team had a chance to review the integration documentation I sent over?

I'm happy to schedule a call with our technical team to address any questions.

Best regards`,
    venueId: "ven-7",
    contactId: "con-6",
    userId: "user-3",
    dueBy: "2025-02-05",
  },
  {
    id: "rec-3",
    type: "schedule-call",
    priority: "high",
    title: "Schedule demo confirmation with Amanda Torres",
    reason: "Red Rocks demo is scheduled for Feb 15th. Confirm attendee list and equipment requirements 2 weeks ahead.",
    venueId: "ven-6",
    contactId: "con-4",
    userId: "user-2",
  },
  {
    id: "rec-4",
    type: "follow-up-email",
    priority: "medium",
    title: "Send Beacon Theatre proposal",
    reason: "David Fernandez mentioned internal approval is underway. Send updated proposal with multi-venue discount.",
    suggestedContent: `Hi David,

Following up on our quarterly review - I've attached the updated proposal for Beacon Theatre that includes the multi-venue discount we discussed.

The pricing reflects our commitment to the MSG partnership and I'm confident this will align with your budget expectations.

Let me know if you have any questions.

Best regards`,
    venueId: "ven-3",
    contactId: "con-1",
    userId: "user-1",
    dueBy: "2025-02-04",
  },
  {
    id: "rec-5",
    type: "check-in",
    priority: "low",
    title: "Reach out to Jennifer Adams at Climate Pledge",
    reason: "New venue with modern infrastructure. OVG is expanding rapidly - building this relationship could lead to more venues.",
    suggestedContent: `Hi Jennifer,

I hope this message finds you well. I'm reaching out because Climate Pledge Arena caught our attention as a leader in sustainable venue operations.

We work with several venues in the OVG portfolio and I'd love to share how we've helped them improve their concessions operations.

Would you be open to a brief introductory call?

Best regards`,
    venueId: "ven-9",
    contactId: "con-8",
    userId: "user-2",
  },
  {
    id: "rec-6",
    type: "follow-up-email",
    priority: "high",
    title: "Send ROI analysis to MSG leadership",
    reason: "Q4 performance data shows 23% throughput increase. Package this into an executive summary for expansion discussions.",
    suggestedContent: `Hi David,

I wanted to share some exciting numbers from Q4. Madison Square Garden saw a 23% increase in order throughput, and Radio City is tracking similarly.

I've put together an executive summary with the full ROI analysis. Would it be helpful if I presented this to your leadership team to support the Beacon Theatre expansion discussion?

Best regards`,
    venueId: "ven-1",
    contactId: "con-1",
    userId: "user-1",
    dueBy: "2025-02-05",
  },
  {
    id: "rec-7",
    type: "send-proposal",
    priority: "medium",
    title: "Share case study with Barclays Center",
    reason: "Jennifer Adams expressed interest in seeing results from similar venues. MSG case study would be highly relevant.",
    venueId: "ven-12",
    contactId: "con-8",
    userId: "user-1",
  },
  {
    id: "rec-8",
    type: "schedule-call",
    priority: "high",
    title: "Book SoFi Stadium discovery call",
    reason: "New inbound lead from VP of Operations. Large venue with $500K potential - respond within 24 hours.",
    venueId: "ven-10",
    contactId: "con-5",
    userId: "user-1",
  },
  {
    id: "rec-9",
    type: "check-in",
    priority: "medium",
    title: "Touch base with Robert Kim at The Forum",
    reason: "No interaction in 3 weeks. The Forum is a successful client - maintain relationship and explore upsell opportunities.",
    suggestedContent: `Hi Robert,

I hope everything is running smoothly at The Forum! I wanted to check in and see how things are going with the platform.

Are there any new features or improvements you'd like to discuss? I'd also love to hear about any upcoming events where we could provide additional support.

Best regards`,
    venueId: "ven-4",
    contactId: "con-5",
    userId: "user-1",
  },
  {
    id: "rec-10",
    type: "follow-up-email",
    priority: "low",
    title: "Re-engage T-Mobile Arena contact",
    reason: "Demo was 2 weeks ago but no response since. Light touch follow-up to keep the conversation warm.",
    suggestedContent: `Hi there,

I wanted to follow up on the demo we did a couple weeks ago for T-Mobile Arena. I know things get busy, so I just wanted to check if you had any questions or if there's anything else I can provide to help with your evaluation.

Happy to jump on a quick call whenever works for you.

Best regards`,
    venueId: "ven-11",
    contactId: "con-6",
    userId: "user-2",
  },
]

// Business insights/news - using dynamic timestamps
const insightDate = new Date()
const formatInsightTime = (hoursAgo: number) => {
  const d = new Date(insightDate.getTime() - hoursAgo * 60 * 60 * 1000)
  return d.toISOString()
}

export const businessInsights: BusinessInsight[] = [
  {
    id: "ins-1",
    type: "engagement-metric",
    title: "MSG venues showing strong engagement",
    description:
      "Madison Square Garden reported 23% increase in order throughput since implementation. Radio City also seeing similar gains.",
    timestamp: formatInsightTime(1),
    operatorId: "op-2",
    metric: { value: 23, change: 23, unit: "%" },
    priority: "positive",
  },
  {
    id: "ins-2",
    type: "pipeline-alert",
    title: "Ball Arena deal in final negotiation",
    description: "High-value deal ($350K) at 75% probability. Contract decision expected by end of week.",
    timestamp: formatInsightTime(2),
    venueId: "ven-8",
    metric: { value: 350000, change: 0, unit: "$" },
    priority: "urgent",
  },
  {
    id: "ins-3",
    type: "milestone",
    title: "Quarterly milestone: 5 venues closed",
    description: "You've closed 5 venues this quarter, totaling $1.23M in deal value. 2 more in final stages.",
    timestamp: formatInsightTime(6),
    priority: "positive",
  },
  {
    id: "ins-4",
    type: "inbound-activity",
    title: "New inbound interest from SoFi Stadium",
    description: "Website inquiry from VP of Operations. Large stadium (70K capacity) with $500K potential deal value.",
    timestamp: formatInsightTime(12),
    venueId: "ven-10",
    priority: "info",
  },
  {
    id: "ins-5",
    type: "contract-news",
    title: "Hollywood Bowl 2025 contract pending",
    description: "Seasonal contract for 2025 awaiting signature. Effective date: May 1st.",
    timestamp: formatInsightTime(24),
    venueId: "ven-5",
    priority: "warning",
  },
  {
    id: "ins-6",
    type: "engagement-metric",
    title: "The Forum hits record orders",
    description: "Saturday night concert saw 15,000+ mobile orders processed with 99.8% uptime. New single-event record.",
    timestamp: formatInsightTime(3),
    venueId: "ven-4",
    metric: { value: 15000, change: 12, unit: "%" },
    priority: "positive",
  },
  {
    id: "ins-7",
    type: "pipeline-alert",
    title: "Beacon Theatre moving to proposal stage",
    description: "David Fernandez confirmed budget approval. Ready for final proposal review.",
    timestamp: formatInsightTime(4),
    venueId: "ven-3",
    metric: { value: 80000, change: 0, unit: "$" },
    priority: "info",
  },
  {
    id: "ins-8",
    type: "inbound-activity",
    title: "3 new demo requests this week",
    description: "Inbound demos requested from Chase Center, United Center, and Fenway Park. Total potential: $850K.",
    timestamp: formatInsightTime(8),
    metric: { value: 850000, change: 0, unit: "$" },
    priority: "positive",
  },
  {
    id: "ins-9",
    type: "contract-news",
    title: "Live Nation MSA renewal due in 60 days",
    description: "Master service agreement with Live Nation expires March 31st. Begin renewal discussions soon.",
    timestamp: formatInsightTime(18),
    operatorId: "op-1",
    priority: "warning",
  },
  {
    id: "ins-10",
    type: "milestone",
    title: "Customer satisfaction score: 4.8/5",
    description: "Latest NPS survey shows 4.8/5 satisfaction across all active venues. Up from 4.5 last quarter.",
    timestamp: formatInsightTime(36),
    metric: { value: 4.8, change: 0.3, unit: "" },
    priority: "positive",
  },
  {
    id: "ins-11",
    type: "pipeline-alert",
    title: "Red Rocks demo scheduled",
    description: "Demo confirmed for Feb 15th with VP Operations and IT Director attending. High-interest opportunity.",
    timestamp: formatInsightTime(5),
    venueId: "ven-6",
    metric: { value: 200000, change: 0, unit: "$" },
    priority: "info",
  },
  {
    id: "ins-12",
    type: "engagement-metric",
    title: "Average order value up 18%",
    description: "Cross-sell recommendations driving higher AOV across all venues. Top performer: Hollywood Bowl at $24.50.",
    timestamp: formatInsightTime(48),
    metric: { value: 18, change: 18, unit: "%" },
    priority: "positive",
  },
]

// Dashboard helper functions
export function getScheduledEventsForUser(userId: string, date?: string) {
  const targetDate = date || new Date().toISOString().split("T")[0]
  return scheduledEvents
    .filter((e) => e.userId === userId && e.startTime.startsWith(targetDate))
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
}

export function getRecommendedActionsForUser(userId: string) {
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  return recommendedActions
    .filter((a) => a.userId === userId)
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
}

export function getTodosForUser(userId: string) {
  return todos
    .filter((t) => t.assignedTo === userId && !t.completed)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
}
