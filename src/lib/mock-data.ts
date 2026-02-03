export type VenueStatus = "client" | "prospect" | "churned" | "negotiating"
export type VenueStage = "lead" | "qualified" | "demo" | "proposal" | "negotiation" | "closed-won" | "closed-lost"
export type InteractionType = "call" | "video" | "email" | "meeting" | "note"
export type VenueType = "stadium" | "arena" | "amphitheater" | "theater" | "convention-center" | "other"

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

export const todos: Todo[] = [
  {
    id: "todo-1",
    title: "Send Beacon Theatre proposal",
    description: "Updated pricing proposal with multi-venue discount",
    dueDate: "2025-01-30",
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
    dueDate: "2025-02-01",
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
    dueDate: "2025-01-31",
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
    dueDate: "2025-02-05",
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
    dueDate: "2025-02-10",
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
    dueDate: "2025-01-29",
    completed: false,
    priority: "medium",
    assignedTo: "user-1",
    venueId: "ven-5",
    contactId: "con-4",
  },
  {
    id: "todo-7",
    title: "MSG quarterly report preparation",
    dueDate: "2025-02-15",
    completed: false,
    priority: "medium",
    assignedTo: "user-1",
    venueId: "ven-1",
    contactId: "con-1",
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
