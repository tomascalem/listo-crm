import { PrismaClient, VenueType, VenueStage, VenueStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Default password for all seeded users
const DEFAULT_PASSWORD = 'password123';

// Map hyphenated enum values to underscores
function mapVenueType(type: string): VenueType {
  const map: Record<string, VenueType> = {
    'stadium': 'stadium',
    'arena': 'arena',
    'amphitheater': 'amphitheater',
    'theater': 'theater',
    'convention-center': 'convention_center',
    'convention_center': 'convention_center',
    'other': 'other',
  };
  return map[type] || 'other';
}

function mapVenueStage(stage: string): VenueStage {
  const map: Record<string, VenueStage> = {
    'lead': 'lead',
    'qualified': 'qualified',
    'demo': 'demo',
    'proposal': 'proposal',
    'negotiation': 'negotiation',
    'closed-won': 'closed_won',
    'closed_won': 'closed_won',
    'closed-lost': 'closed_lost',
    'closed_lost': 'closed_lost',
  };
  return map[stage] || 'lead';
}

function mapVenueStatus(status: string): VenueStatus {
  const map: Record<string, VenueStatus> = {
    'client': 'client',
    'prospect': 'prospect',
    'churned': 'churned',
    'negotiating': 'negotiating',
  };
  return map[status] || 'prospect';
}

// Helper to generate random date within range
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper to pick random items from array
function randomPick<T>(arr: T[], count: number = 1): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function main() {
  console.log('🌱 Starting seed...');

  // Clear existing data in correct order
  console.log('Clearing existing data...');
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.importJob.deleteMany();
  await prisma.userPreference.deleteMany();
  await prisma.todoShare.deleteMany();
  await prisma.todo.deleteMany();
  await prisma.interaction.deleteMany();
  await prisma.scheduledEvent.deleteMany();
  await prisma.recommendedAction.deleteMany();
  await prisma.businessInsight.deleteMany();
  await prisma.contract.deleteMany();
  await prisma.venueFile.deleteMany();
  await prisma.contactVenue.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.venueAssignment.deleteMany();
  await prisma.venueConcessionaire.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.concessionaire.deleteMany();
  await prisma.operator.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  console.log('Creating users...');
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);

  const usersData = [
    { id: 'user-1', name: 'Sarah Chen', email: 'sarah@getlisto.io', avatar: 'SC', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face' },
    { id: 'user-2', name: 'Marcus Johnson', email: 'marcus@getlisto.io', avatar: 'MJ', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' },
    { id: 'user-3', name: 'Emily Rodriguez', email: 'emily@getlisto.io', avatar: 'ER', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face' },
    { id: 'user-4', name: 'James Wilson', email: 'james@getlisto.io', avatar: 'JW', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face' },
    { id: 'user-5', name: 'Sofia Martinez', email: 'sofia@getlisto.io', avatar: 'SM', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face' },
    { id: 'user-6', name: 'David Park', email: 'david@getlisto.io', avatar: 'DP', avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face' },
    { id: 'user-7', name: 'Rachel Kim', email: 'rachel@getlisto.io', avatar: 'RK', avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face' },
  ];

  for (const user of usersData) {
    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email,
        passwordHash,
        name: user.name,
        avatar: user.avatar,
        avatarUrl: user.avatarUrl,
      },
    });
  }
  console.log(`Created ${usersData.length} users`);

  // Create operators
  console.log('Creating operators...');
  const operatorsData = [
    { id: 'op-1', name: 'Live Nation Entertainment', logo: 'LN', website: 'https://livenation.com', description: 'The world\'s leading live entertainment company', headquarters: 'Beverly Hills, CA' },
    { id: 'op-2', name: 'Madison Square Garden Entertainment', logo: 'MSG', website: 'https://msg.com', description: 'Premier live entertainment company', headquarters: 'New York, NY' },
    { id: 'op-3', name: 'AEG Presents', logo: 'AEG', website: 'https://aegpresents.com', description: 'Global entertainment company with venues worldwide', headquarters: 'Los Angeles, CA' },
    { id: 'op-4', name: 'Oak View Group', logo: 'OVG', website: 'https://oakviewgroup.com', description: 'Venue development, advisory, and investment company', headquarters: 'Los Angeles, CA' },
    { id: 'op-5', name: 'Kroenke Sports & Entertainment', logo: 'KSE', website: 'https://kse.com', description: 'Owner and operator of Ball Arena and sports teams', headquarters: 'Denver, CO' },
    { id: 'op-6', name: 'ASM Global', logo: 'ASM', website: 'https://asmglobal.com', description: 'World\'s leading venue management and services company', headquarters: 'Los Angeles, CA' },
    { id: 'op-7', name: 'Spectra', logo: 'SP', website: 'https://spectraexperiences.com', description: 'Hospitality and venue management', headquarters: 'Philadelphia, PA' },
    { id: 'op-8', name: 'SMG', logo: 'SMG', website: 'https://smgworld.com', description: 'Venue management and marketing company', headquarters: 'West Conshohocken, PA' },
  ];

  for (const op of operatorsData) {
    await prisma.operator.create({ data: op });
  }
  console.log(`Created ${operatorsData.length} operators`);

  // Create concessionaires
  console.log('Creating concessionaires...');
  const concessionairesData = [
    { id: 'con-1', name: 'Levy Restaurants', logo: 'LR', website: 'https://levyrestaurants.com', description: 'Premier hospitality company', headquarters: 'Chicago, IL' },
    { id: 'con-2', name: 'Aramark', logo: 'AR', website: 'https://aramark.com', description: 'Food service and facilities management', headquarters: 'Philadelphia, PA' },
    { id: 'con-3', name: 'Sodexo', logo: 'SD', website: 'https://sodexo.com', description: 'Global food services company', headquarters: 'France' },
    { id: 'con-4', name: 'Delaware North', logo: 'DN', website: 'https://delawarenorth.com', description: 'Hospitality and food service company', headquarters: 'Buffalo, NY' },
    { id: 'con-5', name: 'Legends Hospitality', logo: 'LH', website: 'https://legends.net', description: 'Premium experiences company', headquarters: 'New York, NY' },
    { id: 'con-6', name: 'Compass Group', logo: 'CG', website: 'https://compass-group.com', description: 'Contract foodservice company', headquarters: 'Charlotte, NC' },
    { id: 'con-7', name: 'Centerplate', logo: 'CP', website: 'https://centerplate.com', description: 'Hospitality partner to venues', headquarters: 'Stamford, CT' },
  ];

  for (const con of concessionairesData) {
    await prisma.concessionaire.create({ data: con });
  }
  console.log(`Created ${concessionairesData.length} concessionaires`);

  // Create venues - expanded list
  console.log('Creating venues...');
  const venuesData = [
    // Closed Won (Clients)
    { id: 'venue-1', name: 'Madison Square Garden', address: '4 Pennsylvania Plaza', city: 'New York', state: 'NY', type: 'arena', capacity: 20789, stage: 'closed-won', status: 'client', dealValue: 450000, probability: 100, operatorId: 'op-2', assignedUserIds: ['user-1', 'user-2'], imageUrl: 'https://images.unsplash.com/photo-1587385789097-0197a7fbd179?w=800', teamLogoUrl: 'https://upload.wikimedia.org/wikipedia/en/2/25/New_York_Knicks_logo.svg', teamName: 'NY Knicks' },
    { id: 'venue-7', name: 'Greek Theatre', address: '2700 N Vermont Ave', city: 'Los Angeles', state: 'CA', type: 'amphitheater', capacity: 5870, stage: 'closed-won', status: 'client', dealValue: 180000, probability: 100, operatorId: 'op-3', assignedUserIds: ['user-1', 'user-3'], imageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800' },
    { id: 'venue-9', name: 'United Center', address: '1901 W Madison St', city: 'Chicago', state: 'IL', type: 'arena', capacity: 20917, stage: 'closed-won', status: 'client', dealValue: 520000, probability: 100, operatorId: 'op-4', assignedUserIds: ['user-4'], imageUrl: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800', teamLogoUrl: 'https://upload.wikimedia.org/wikipedia/en/6/67/Chicago_Bulls_logo.svg', teamName: 'Chicago Bulls' },
    { id: 'venue-18', name: 'Wrigley Field', address: '1060 W Addison St', city: 'Chicago', state: 'IL', type: 'stadium', capacity: 41649, stage: 'closed-won', status: 'client', dealValue: 680000, probability: 100, operatorId: 'op-1', assignedUserIds: ['user-1', 'user-6'], imageUrl: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800', teamLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/80/Chicago_Cubs_logo.svg', teamName: 'Chicago Cubs' },

    // Negotiation stage
    { id: 'venue-5', name: 'The Forum', address: '3900 W Manchester Blvd', city: 'Inglewood', state: 'CA', type: 'arena', capacity: 17505, stage: 'negotiation', status: 'negotiating', dealValue: 410000, probability: 80, operatorId: 'op-1', assignedUserIds: ['user-3'], imageUrl: 'https://images.unsplash.com/photo-1567593810070-7a3d471af022?w=800' },
    { id: 'venue-10', name: 'T-Mobile Arena', address: '3780 S Las Vegas Blvd', city: 'Las Vegas', state: 'NV', type: 'arena', capacity: 20000, stage: 'negotiation', status: 'negotiating', dealValue: 475000, probability: 75, operatorId: 'op-3', assignedUserIds: ['user-2', 'user-5'], imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800', teamLogoUrl: 'https://upload.wikimedia.org/wikipedia/en/a/ac/Vegas_Golden_Knights_logo.svg', teamName: 'Vegas Golden Knights' },
    { id: 'venue-19', name: 'Fenway Park', address: '4 Jersey St', city: 'Boston', state: 'MA', type: 'stadium', capacity: 37755, stage: 'negotiation', status: 'negotiating', dealValue: 590000, probability: 70, operatorId: 'op-6', assignedUserIds: ['user-3', 'user-7'], imageUrl: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800', teamLogoUrl: 'https://upload.wikimedia.org/wikipedia/en/6/6d/RedSoxPrimary_HangingSocks.svg', teamName: 'Boston Red Sox' },

    // Proposal stage
    { id: 'venue-2', name: 'Hollywood Bowl', address: '2301 N Highland Ave', city: 'Los Angeles', state: 'CA', type: 'amphitheater', capacity: 17500, stage: 'proposal', status: 'negotiating', dealValue: 320000, probability: 60, operatorId: 'op-3', assignedUserIds: ['user-3'], imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800' },
    { id: 'venue-8', name: 'Radio City Music Hall', address: '1260 6th Ave', city: 'New York', state: 'NY', type: 'theater', capacity: 5960, stage: 'proposal', status: 'negotiating', dealValue: 220000, probability: 55, operatorId: 'op-2', assignedUserIds: ['user-2'], imageUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?w=800' },
    { id: 'venue-11', name: 'Chase Center', address: '1 Warriors Way', city: 'San Francisco', state: 'CA', type: 'arena', capacity: 18064, stage: 'proposal', status: 'prospect', dealValue: 490000, probability: 60, operatorId: 'op-4', assignedUserIds: ['user-1', 'user-4'], imageUrl: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800', teamLogoUrl: 'https://upload.wikimedia.org/wikipedia/en/0/01/Golden_State_Warriors_logo.svg', teamName: 'Golden State Warriors' },
    { id: 'venue-20', name: 'Yankee Stadium', address: '1 E 161st St', city: 'Bronx', state: 'NY', type: 'stadium', capacity: 46537, stage: 'proposal', status: 'prospect', dealValue: 750000, probability: 50, operatorId: 'op-2', assignedUserIds: ['user-1', 'user-2'], imageUrl: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800', teamLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Yankees_logo.svg', teamName: 'NY Yankees' },

    // Demo stage
    { id: 'venue-3', name: 'Red Rocks Amphitheatre', address: '18300 W Alameda Pkwy', city: 'Morrison', state: 'CO', type: 'amphitheater', capacity: 9525, stage: 'demo', status: 'prospect', dealValue: 280000, probability: 40, operatorId: 'op-1', assignedUserIds: ['user-1'], imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800' },
    { id: 'venue-12', name: 'Crypto.com Arena', address: '1111 S Figueroa St', city: 'Los Angeles', state: 'CA', type: 'arena', capacity: 19068, stage: 'demo', status: 'prospect', dealValue: 510000, probability: 45, operatorId: 'op-3', assignedUserIds: ['user-5'], imageUrl: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800', teamLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3c/Los_Angeles_Lakers_logo.svg', teamName: 'LA Lakers' },
    { id: 'venue-15', name: 'Barclays Center', address: '620 Atlantic Ave', city: 'Brooklyn', state: 'NY', type: 'arena', capacity: 17732, stage: 'demo', status: 'prospect', dealValue: 420000, probability: 35, operatorId: 'op-4', assignedUserIds: ['user-6', 'user-7'], imageUrl: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800', teamLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Brooklyn_Nets_newlogo.svg', teamName: 'Brooklyn Nets' },
    { id: 'venue-21', name: 'Dodger Stadium', address: '1000 Vin Scully Ave', city: 'Los Angeles', state: 'CA', type: 'stadium', capacity: 56000, stage: 'demo', status: 'prospect', dealValue: 820000, probability: 40, operatorId: 'op-3', assignedUserIds: ['user-3', 'user-5'], imageUrl: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800', teamLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Los_Angeles_Dodgers_Logo.svg', teamName: 'LA Dodgers' },

    // Qualified stage
    { id: 'venue-4', name: 'Ball Arena', address: '1000 Chopper Cir', city: 'Denver', state: 'CO', type: 'arena', capacity: 19520, stage: 'qualified', status: 'prospect', dealValue: 380000, probability: 25, operatorId: 'op-5', assignedUserIds: ['user-2', 'user-4'], imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800', teamLogoUrl: 'https://upload.wikimedia.org/wikipedia/en/7/76/Denver_Nuggets.svg', teamName: 'Denver Nuggets' },
    { id: 'venue-13', name: 'Climate Pledge Arena', address: '334 1st Ave N', city: 'Seattle', state: 'WA', type: 'arena', capacity: 17151, stage: 'qualified', status: 'prospect', dealValue: 390000, probability: 30, operatorId: 'op-4', assignedUserIds: ['user-3'], imageUrl: 'https://images.unsplash.com/photo-1567593810070-7a3d471af022?w=800', teamLogoUrl: 'https://upload.wikimedia.org/wikipedia/en/4/49/Seattle_Kraken_official_logo.svg', teamName: 'Seattle Kraken' },
    { id: 'venue-16', name: 'Frost Bank Center', address: '1 AT&T Center Pkwy', city: 'San Antonio', state: 'TX', type: 'arena', capacity: 18418, stage: 'qualified', status: 'prospect', dealValue: 340000, probability: 25, operatorId: 'op-6', assignedUserIds: ['user-4'], imageUrl: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800', teamLogoUrl: 'https://upload.wikimedia.org/wikipedia/en/a/a2/San_Antonio_Spurs.svg', teamName: 'San Antonio Spurs' },
    { id: 'venue-22', name: 'Oracle Park', address: '24 Willie Mays Plaza', city: 'San Francisco', state: 'CA', type: 'stadium', capacity: 41915, stage: 'qualified', status: 'prospect', dealValue: 620000, probability: 30, operatorId: 'op-4', assignedUserIds: ['user-1'], imageUrl: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800', teamLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/49/San_Francisco_Giants_Cap_Insignia.svg', teamName: 'SF Giants' },

    // Lead stage
    { id: 'venue-6', name: 'Beacon Theatre', address: '2124 Broadway', city: 'New York', state: 'NY', type: 'theater', capacity: 2894, stage: 'lead', status: 'prospect', dealValue: 95000, probability: 10, operatorId: 'op-2', assignedUserIds: ['user-5'], imageUrl: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=800' },
    { id: 'venue-14', name: 'Bridgestone Arena', address: '501 Broadway', city: 'Nashville', state: 'TN', type: 'arena', capacity: 19816, stage: 'lead', status: 'prospect', dealValue: 360000, probability: 15, operatorId: 'op-6', assignedUserIds: ['user-7'], imageUrl: 'https://images.unsplash.com/photo-1567593810070-7a3d471af022?w=800', teamLogoUrl: 'https://upload.wikimedia.org/wikipedia/en/4/4c/Nashville_Predators_Logo_%282011%29.svg', teamName: 'Nashville Predators' },
    { id: 'venue-17', name: 'PPG Paints Arena', address: '1001 Fifth Ave', city: 'Pittsburgh', state: 'PA', type: 'arena', capacity: 18387, stage: 'lead', status: 'prospect', dealValue: 350000, probability: 10, operatorId: 'op-7', assignedUserIds: ['user-6'], imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800', teamLogoUrl: 'https://upload.wikimedia.org/wikipedia/en/b/b9/Pittsburgh_Penguins_logo_%282016%29.svg', teamName: 'Pittsburgh Penguins' },
    { id: 'venue-23', name: 'Petco Park', address: '100 Park Blvd', city: 'San Diego', state: 'CA', type: 'stadium', capacity: 40162, stage: 'lead', status: 'prospect', dealValue: 580000, probability: 15, operatorId: 'op-8', assignedUserIds: ['user-5'], imageUrl: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800', teamLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/San_Diego_Padres_logo.svg', teamName: 'SD Padres' },
    { id: 'venue-24', name: 'Coors Field', address: '2001 Blake St', city: 'Denver', state: 'CO', type: 'stadium', capacity: 50144, stage: 'lead', status: 'prospect', dealValue: 540000, probability: 10, operatorId: 'op-5', assignedUserIds: ['user-2'], imageUrl: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=800', teamLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/31/Colorado_Rockies_logo.svg', teamName: 'Colorado Rockies' },
    { id: 'venue-25', name: 'American Airlines Center', address: '2500 Victory Ave', city: 'Dallas', state: 'TX', type: 'arena', capacity: 19200, stage: 'lead', status: 'prospect', dealValue: 420000, probability: 12, operatorId: 'op-6', assignedUserIds: ['user-4', 'user-7'], imageUrl: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800', teamLogoUrl: 'https://upload.wikimedia.org/wikipedia/en/9/97/Dallas_Mavericks_logo.svg', teamName: 'Dallas Mavericks' },

    // Convention Centers
    { id: 'venue-26', name: 'Moscone Center', address: '747 Howard St', city: 'San Francisco', state: 'CA', type: 'convention-center', capacity: 87000, stage: 'qualified', status: 'prospect', dealValue: 290000, probability: 25, operatorId: 'op-6', assignedUserIds: ['user-1'] },
    { id: 'venue-27', name: 'McCormick Place', address: '2301 S King Dr', city: 'Chicago', state: 'IL', type: 'convention-center', capacity: 100000, stage: 'demo', status: 'prospect', dealValue: 350000, probability: 35, operatorId: 'op-8', assignedUserIds: ['user-6'] },
    { id: 'venue-28', name: 'Las Vegas Convention Center', address: '3150 Paradise Rd', city: 'Las Vegas', state: 'NV', type: 'convention-center', capacity: 200000, stage: 'lead', status: 'prospect', dealValue: 420000, probability: 15, operatorId: 'op-6', assignedUserIds: ['user-2', 'user-5'] },

    // More theaters
    { id: 'venue-29', name: 'The Orpheum', address: '842 S Broadway', city: 'Los Angeles', state: 'CA', type: 'theater', capacity: 2000, stage: 'proposal', status: 'prospect', dealValue: 85000, probability: 50, operatorId: 'op-3', assignedUserIds: ['user-3'] },
    { id: 'venue-30', name: 'Fox Theatre', address: '660 Peachtree St NE', city: 'Atlanta', state: 'GA', type: 'theater', capacity: 4665, stage: 'qualified', status: 'prospect', dealValue: 120000, probability: 25, operatorId: 'op-7', assignedUserIds: ['user-7'] },
  ];

  for (const venue of venuesData) {
    const { assignedUserIds, ...venueData } = venue;
    await prisma.venue.create({
      data: {
        ...venueData,
        type: mapVenueType(venueData.type),
        stage: mapVenueStage(venueData.stage),
        status: mapVenueStatus(venueData.status),
        lastActivity: randomDate(new Date('2025-01-01'), new Date('2026-02-01')),
        opportunity: {
          useCases: randomPick(['suites', 'back-of-house', 'warehouse', 'labor-tracking'], Math.floor(Math.random() * 3) + 1),
          licenses: {
            watches: Math.floor(Math.random() * 50) + 10,
            mobile: Math.floor(Math.random() * 100) + 20,
            tablets: Math.floor(Math.random() * 30) + 5,
          },
          onsiteInterest: Math.random() > 0.3,
          expectedReleaseDate: randomDate(new Date('2026-03-01'), new Date('2026-12-31')).toISOString(),
          intel: {
            source: randomPick(['Trade show', 'Referral', 'Website', 'Cold outreach', 'Industry event'])[0],
            interests: randomPick(['Real-time tracking', 'Mobile ordering', 'Inventory management', 'Staff scheduling', 'Analytics dashboard'], 2),
            painPoints: randomPick(['Manual processes', 'Slow service', 'Inventory waste', 'Staff coordination', 'Reporting delays'], 2),
          },
        },
        assignedUsers: {
          create: assignedUserIds.map(userId => ({ userId })),
        },
      },
    });
  }
  console.log(`Created ${venuesData.length} venues`);

  // Create venue-concessionaire relationships
  console.log('Creating venue-concessionaire relationships...');
  const venueConcessionaireData = [
    { venueId: 'venue-1', concessionaireId: 'con-1' },
    { venueId: 'venue-1', concessionaireId: 'con-5' },
    { venueId: 'venue-2', concessionaireId: 'con-1' },
    { venueId: 'venue-3', concessionaireId: 'con-4' },
    { venueId: 'venue-4', concessionaireId: 'con-2' },
    { venueId: 'venue-5', concessionaireId: 'con-5' },
    { venueId: 'venue-7', concessionaireId: 'con-1' },
    { venueId: 'venue-9', concessionaireId: 'con-1' },
    { venueId: 'venue-9', concessionaireId: 'con-5' },
    { venueId: 'venue-10', concessionaireId: 'con-5' },
    { venueId: 'venue-11', concessionaireId: 'con-1' },
    { venueId: 'venue-12', concessionaireId: 'con-5' },
    { venueId: 'venue-18', concessionaireId: 'con-1' },
    { venueId: 'venue-19', concessionaireId: 'con-2' },
    { venueId: 'venue-20', concessionaireId: 'con-5' },
    { venueId: 'venue-21', concessionaireId: 'con-5' },
  ];

  for (const vc of venueConcessionaireData) {
    await prisma.venueConcessionaire.create({ data: vc });
  }
  console.log(`Created ${venueConcessionaireData.length} venue-concessionaire relationships`);

  // Create contacts - expanded list
  console.log('Creating contacts...');
  const contactsData = [
    // MSG contacts
    { id: 'contact-1', name: 'John Smith', email: 'john.smith@msg.com', phone: '+1 212-555-0101', role: 'VP of Operations', isPrimary: true, avatar: 'JS', venueIds: ['venue-1', 'venue-6', 'venue-8'], operatorId: 'op-2' },
    { id: 'contact-2', name: 'Amanda Torres', email: 'amanda.torres@msg.com', phone: '+1 212-555-0102', role: 'Director of Technology', isPrimary: false, avatar: 'AT', venueIds: ['venue-1', 'venue-8'], operatorId: 'op-2' },
    { id: 'contact-3', name: 'Kevin O\'Brien', email: 'kobrien@msg.com', phone: '+1 212-555-0103', role: 'IT Manager', isPrimary: false, avatar: 'KO', venueIds: ['venue-1'], operatorId: 'op-2' },

    // AEG contacts
    { id: 'contact-4', name: 'Lisa Johnson', email: 'lisa.j@aegpresents.com', phone: '+1 310-555-0102', role: 'Director of Technology', isPrimary: true, avatar: 'LJ', venueIds: ['venue-2', 'venue-7', 'venue-12', 'venue-29'], operatorId: 'op-3' },
    { id: 'contact-5', name: 'Michael Chang', email: 'mchang@aegpresents.com', phone: '+1 310-555-0104', role: 'Operations Manager', isPrimary: false, avatar: 'MC', venueIds: ['venue-2', 'venue-21'], operatorId: 'op-3' },
    { id: 'contact-6', name: 'Rachel Green', email: 'rgreen@aegpresents.com', phone: '+1 310-555-0105', role: 'VP Business Development', isPrimary: true, avatar: 'RG', venueIds: ['venue-10', 'venue-12'], operatorId: 'op-3' },

    // Live Nation contacts
    { id: 'contact-7', name: 'Mike Williams', email: 'mike.w@livenation.com', phone: '+1 323-555-0103', role: 'Senior Manager', isPrimary: true, avatar: 'MW', venueIds: ['venue-3', 'venue-5', 'venue-18'], operatorId: 'op-1' },
    { id: 'contact-8', name: 'Diana Ross', email: 'dross@livenation.com', phone: '+1 323-555-0106', role: 'Regional Director', isPrimary: false, avatar: 'DR', venueIds: ['venue-5', 'venue-18'], operatorId: 'op-1' },

    // KSE contacts
    { id: 'contact-9', name: 'Jennifer Davis', email: 'jdavis@kse.com', phone: '+1 303-555-0104', role: 'Operations Director', isPrimary: true, avatar: 'JD', venueIds: ['venue-4', 'venue-24'], operatorId: 'op-5' },
    { id: 'contact-10', name: 'Tom Bradley', email: 'tbradley@kse.com', phone: '+1 303-555-0107', role: 'Tech Lead', isPrimary: false, avatar: 'TB', venueIds: ['venue-4'], operatorId: 'op-5' },

    // Oak View Group contacts
    { id: 'contact-11', name: 'Sarah Mitchell', email: 'smitchell@ovg.com', phone: '+1 206-555-0108', role: 'VP Operations', isPrimary: true, avatar: 'SM', venueIds: ['venue-9', 'venue-11', 'venue-13', 'venue-15', 'venue-22'], operatorId: 'op-4' },
    { id: 'contact-12', name: 'David Kim', email: 'dkim@ovg.com', phone: '+1 415-555-0109', role: 'Director of Innovation', isPrimary: false, avatar: 'DK', venueIds: ['venue-11', 'venue-22'], operatorId: 'op-4' },
    { id: 'contact-13', name: 'Laura Chen', email: 'lchen@ovg.com', phone: '+1 206-555-0110', role: 'Project Manager', isPrimary: false, avatar: 'LC', venueIds: ['venue-13'], operatorId: 'op-4' },

    // ASM Global contacts
    { id: 'contact-14', name: 'James Rodriguez', email: 'jrodriguez@asmglobal.com', phone: '+1 615-555-0111', role: 'Regional VP', isPrimary: true, avatar: 'JR', venueIds: ['venue-14', 'venue-16', 'venue-26', 'venue-28'], operatorId: 'op-6' },
    { id: 'contact-15', name: 'Emily Watson', email: 'ewatson@asmglobal.com', phone: '+1 214-555-0112', role: 'Operations Manager', isPrimary: false, avatar: 'EW', venueIds: ['venue-25', 'venue-26'], operatorId: 'op-6' },

    // Spectra contacts
    { id: 'contact-16', name: 'Mark Johnson', email: 'mjohnson@spectra.com', phone: '+1 412-555-0113', role: 'VP Technology', isPrimary: true, avatar: 'MJ', venueIds: ['venue-17', 'venue-30'], operatorId: 'op-7' },

    // SMG contacts
    { id: 'contact-17', name: 'Patricia Lee', email: 'plee@smg.com', phone: '+1 312-555-0114', role: 'Director', isPrimary: true, avatar: 'PL', venueIds: ['venue-27', 'venue-23'], operatorId: 'op-8' },

    // Concessionaire contacts
    { id: 'contact-18', name: 'Robert Chen', email: 'rchen@levy.com', phone: '+1 312-555-0105', role: 'Account Manager', isPrimary: true, avatar: 'RC', venueIds: ['venue-1', 'venue-2', 'venue-9', 'venue-18'], concessionaireId: 'con-1' },
    { id: 'contact-19', name: 'Nicole Adams', email: 'nadams@levy.com', phone: '+1 312-555-0115', role: 'Regional Director', isPrimary: false, avatar: 'NA', venueIds: ['venue-7', 'venue-11'], concessionaireId: 'con-1' },
    { id: 'contact-20', name: 'Chris Martin', email: 'cmartin@aramark.com', phone: '+1 215-555-0116', role: 'Account Executive', isPrimary: true, avatar: 'CM', venueIds: ['venue-4', 'venue-19'], concessionaireId: 'con-2' },
    { id: 'contact-21', name: 'Steve Wilson', email: 'swilson@legends.net', phone: '+1 212-555-0117', role: 'VP Partnerships', isPrimary: true, avatar: 'SW', venueIds: ['venue-5', 'venue-10', 'venue-12', 'venue-20', 'venue-21'], concessionaireId: 'con-5' },
  ];

  for (const contact of contactsData) {
    const { venueIds, ...contactData } = contact;
    await prisma.contact.create({
      data: {
        ...contactData,
        venues: {
          create: venueIds.map(venueId => ({ venueId })),
        },
      },
    });
  }
  console.log(`Created ${contactsData.length} contacts`);

  // Create interactions - expanded list
  console.log('Creating interactions...');
  const interactionTypes = ['call', 'meeting', 'email', 'video', 'note'];
  const summaries = [
    'Discussed implementation timeline and resource requirements',
    'Product demo with technical team - very positive reception',
    'Follow-up on pricing proposal and contract terms',
    'Initial discovery call to understand pain points',
    'Quarterly business review meeting',
    'Technical integration planning session',
    'Budget approval discussion with finance team',
    'Site visit to assess infrastructure needs',
    'Training requirements discussion',
    'Contract negotiation - close to final terms',
    'Onboarding kickoff meeting',
    'Feature request discussion for mobile app',
    'Addressed concerns about data migration',
    'Demo of new analytics dashboard features',
    'Escalation call regarding timeline delays',
  ];

  const interactionsData = [];
  const venueIds = venuesData.map(v => v.id);
  const contactIds = contactsData.map(c => c.id);
  const userIds = usersData.map(u => u.id);

  // Generate 50+ interactions
  for (let i = 0; i < 60; i++) {
    const venueId = randomPick(venueIds)[0];
    const venue = venuesData.find(v => v.id === venueId);
    const venueContacts = contactsData.filter(c => c.venueIds.includes(venueId));
    const contactId = venueContacts.length > 0 ? randomPick(venueContacts.map(c => c.id))[0] : randomPick(contactIds)[0];
    const userId = venue?.assignedUserIds ? randomPick(venue.assignedUserIds)[0] : randomPick(userIds)[0];

    interactionsData.push({
      venueId,
      contactId,
      userId,
      type: randomPick(interactionTypes)[0],
      date: randomDate(new Date('2025-01-01'), new Date('2026-02-05')),
      summary: randomPick(summaries)[0],
      highlights: randomPick(['Budget approved', 'Timeline confirmed', 'Positive feedback', 'Ready to move forward', 'Key stakeholder buy-in', 'Technical requirements met'], Math.floor(Math.random() * 3)),
      wants: randomPick(['Earlier deployment', 'Custom integrations', 'More training', 'Additional features', 'Volume discount'], Math.floor(Math.random() * 2)),
      concerns: randomPick(['Data migration', 'Contract length', 'Implementation timeline', 'Budget constraints', 'Staff adoption'], Math.floor(Math.random() * 2)),
    });
  }

  for (const interaction of interactionsData) {
    await prisma.interaction.create({
      data: {
        ...interaction,
        type: interaction.type as any,
      },
    });
  }
  console.log(`Created ${interactionsData.length} interactions`);

  // Create todos - expanded list
  console.log('Creating todos...');
  const todoTitles = [
    'Send follow-up proposal',
    'Schedule product demo',
    'Review contract terms',
    'Call to discuss requirements',
    'Prepare pricing options',
    'Send implementation timeline',
    'Follow up on decision',
    'Schedule site visit',
    'Send case study materials',
    'Prepare ROI analysis',
    'Review technical specifications',
    'Schedule training session',
    'Send onboarding materials',
    'Follow up on contract signature',
    'Prepare quarterly review',
  ];

  const todoTypes = ['email', 'call', 'meeting', 'document', 'follow_up', 'other'];
  const priorities = ['low', 'medium', 'high'];

  const todosData = [];
  for (let i = 0; i < 30; i++) {
    const venueId = randomPick(venueIds)[0];
    const venue = venuesData.find(v => v.id === venueId);
    const assignedToId = venue?.assignedUserIds ? randomPick(venue.assignedUserIds)[0] : randomPick(userIds)[0];
    const createdById = randomPick(userIds)[0];
    const venueContacts = contactsData.filter(c => c.venueIds.includes(venueId));
    const contactId = venueContacts.length > 0 && Math.random() > 0.5 ? randomPick(venueContacts.map(c => c.id))[0] : null;

    todosData.push({
      title: `${randomPick(todoTitles)[0]} for ${venue?.name || 'venue'}`,
      dueDate: randomDate(new Date('2026-02-01'), new Date('2026-03-31')),
      priority: randomPick(priorities)[0],
      type: randomPick(todoTypes)[0],
      completed: Math.random() > 0.8,
      assignedToId,
      createdById,
      venueId,
      contactId,
    });
  }

  for (const todo of todosData) {
    await prisma.todo.create({
      data: {
        ...todo,
        priority: todo.priority as any,
        type: todo.type as any,
      },
    });
  }
  console.log(`Created ${todosData.length} todos`);

  // Create scheduled events
  console.log('Creating scheduled events...');
  const eventTypes = ['call', 'meeting', 'video'];
  const eventsData = [];

  for (let i = 0; i < 20; i++) {
    const venueId = randomPick(venueIds)[0];
    const venue = venuesData.find(v => v.id === venueId);
    const userId = venue?.assignedUserIds ? randomPick(venue.assignedUserIds)[0] : randomPick(userIds)[0];
    const venueContacts = contactsData.filter(c => c.venueIds.includes(venueId));
    const contactId = venueContacts.length > 0 ? randomPick(venueContacts.map(c => c.id))[0] : null;

    const startTime = randomDate(new Date('2026-02-06'), new Date('2026-02-28'));
    const endTime = new Date(startTime.getTime() + (Math.floor(Math.random() * 2) + 1) * 60 * 60 * 1000);

    eventsData.push({
      type: randomPick(eventTypes)[0],
      title: `${randomPick(['Meeting', 'Call', 'Demo', 'Review'])[0]} with ${venue?.name || 'venue'}`,
      startTime,
      endTime,
      venueId,
      userId,
      contactId,
    });
  }

  for (const event of eventsData) {
    await prisma.scheduledEvent.create({
      data: {
        ...event,
        type: event.type as any,
      },
    });
  }
  console.log(`Created ${eventsData.length} scheduled events`);

  // Create notifications
  console.log('Creating notifications...');
  const notificationsData = [];

  for (const user of usersData.slice(0, 5)) {
    // Add a few notifications per user
    notificationsData.push(
      { userId: user.id, type: 'assignment', title: 'New venue assigned', message: 'You have been assigned to a new venue', read: false },
      { userId: user.id, type: 'reminder', title: 'Task due tomorrow', message: 'You have a task due tomorrow', read: Math.random() > 0.5 },
      { userId: user.id, type: 'due_date', title: 'Follow-up needed', message: 'A venue needs follow-up attention', read: Math.random() > 0.5 },
    );
  }

  for (const notification of notificationsData) {
    await prisma.notification.create({
      data: {
        ...notification,
        type: notification.type as any,
      },
    });
  }
  console.log(`Created ${notificationsData.length} notifications`);

  // Create venue files
  console.log('Creating venue files...');
  const filesData = [
    // Operator-level files (inheritable to all their venues)
    { name: 'Live Nation Corporate Overview 2025', type: 'deck', entityType: 'operator', operatorId: 'op-1', isInheritable: true, description: 'Company overview and partnership opportunities' },
    { name: 'Live Nation Pricing Guide', type: 'one_pager', entityType: 'operator', operatorId: 'op-1', isInheritable: true, description: 'Standard pricing tiers and volume discounts' },
    { name: 'MSG Entertainment Partnership Deck', type: 'deck', entityType: 'operator', operatorId: 'op-2', isInheritable: true, description: 'MSG partnership overview and venue portfolio' },
    { name: 'AEG Presents Venue Standards', type: 'report', entityType: 'operator', operatorId: 'op-3', isInheritable: true, description: 'Technical standards and requirements' },

    // Concessionaire-level files (inheritable)
    { name: 'Levy Restaurants Menu Options', type: 'deck', entityType: 'concessionaire', concessionaireId: 'con-1', isInheritable: true, description: 'Full menu catalog and customization options' },
    { name: 'Levy Integration Requirements', type: 'one_pager', entityType: 'concessionaire', concessionaireId: 'con-1', isInheritable: true, description: 'POS integration specifications' },
    { name: 'Legends Hospitality Overview', type: 'deck', entityType: 'concessionaire', concessionaireId: 'con-5', isInheritable: true, description: 'Partnership and service overview' },
    { name: 'Aramark Tech Stack', type: 'report', entityType: 'concessionaire', concessionaireId: 'con-2', isInheritable: true, description: 'Current technology infrastructure' },

    // Venue-specific files
    { name: 'MSG Implementation Proposal', type: 'proposal', entityType: 'venue', venueId: 'venue-1', isInheritable: false, description: 'Detailed implementation plan and timeline' },
    { name: 'MSG ROI Analysis', type: 'report', entityType: 'venue', venueId: 'venue-1', isInheritable: false, description: 'Projected ROI and cost savings analysis' },
    { name: 'Hollywood Bowl Pricing Quote', type: 'proposal', entityType: 'venue', venueId: 'venue-2', isInheritable: false, description: 'Custom pricing for amphitheater deployment' },
    { name: 'Red Rocks Site Assessment', type: 'report', entityType: 'venue', venueId: 'venue-3', isInheritable: false, description: 'Technical assessment and infrastructure review' },
    { name: 'Chase Center Demo Notes', type: 'other', entityType: 'venue', venueId: 'venue-11', isInheritable: false, description: 'Notes from on-site demo session' },
    { name: 'United Center Success Story', type: 'report', entityType: 'venue', venueId: 'venue-9', isInheritable: false, description: 'Post-implementation results and metrics' },
  ];

  for (const file of filesData) {
    const entityId = file.venueId || file.operatorId || file.concessionaireId;
    await prisma.venueFile.create({
      data: {
        name: file.name,
        type: file.type as any,
        entityType: file.entityType as any,
        isInheritable: file.isInheritable,
        description: file.description,
        s3Url: '#',
        s3Key: `files/${file.entityType}/${entityId}/${file.name.toLowerCase().replace(/\s+/g, '-')}.pdf`,
        size: Math.floor(Math.random() * 5000000) + 500000,
        mimeType: 'application/pdf',
        uploadedById: randomPick(userIds)[0],
        venueId: file.venueId || null,
        operatorId: file.operatorId || null,
        concessionaireId: file.concessionaireId || null,
      },
    });
  }
  console.log(`Created ${filesData.length} venue files`);

  // Create contracts
  console.log('Creating contracts...');
  const contractsData = [
    // Operator-level contracts (inheritable)
    { name: 'Live Nation Master Services Agreement', type: 'msa', status: 'active', entityType: 'operator', operatorId: 'op-1', isInheritable: true, effectiveDate: '2024-01-01', expirationDate: '2026-12-31' },
    { name: 'MSG Entertainment NDA', type: 'nda', status: 'active', entityType: 'operator', operatorId: 'op-2', isInheritable: true, effectiveDate: '2024-06-01', expirationDate: '2027-06-01' },
    { name: 'AEG Presents Partnership Agreement', type: 'msa', status: 'active', entityType: 'operator', operatorId: 'op-3', isInheritable: true, effectiveDate: '2024-03-15', expirationDate: '2027-03-15' },

    // Concessionaire-level contracts
    { name: 'Levy Restaurants Integration Agreement', type: 'sow', status: 'active', entityType: 'concessionaire', concessionaireId: 'con-1', isInheritable: true, effectiveDate: '2024-09-01', expirationDate: '2026-09-01' },
    { name: 'Legends Hospitality NDA', type: 'nda', status: 'active', entityType: 'concessionaire', concessionaireId: 'con-5', isInheritable: true, effectiveDate: '2024-05-01', expirationDate: '2026-05-01' },
    { name: 'Aramark Data Processing Agreement', type: 'other', status: 'pending', entityType: 'concessionaire', concessionaireId: 'con-2', isInheritable: true, effectiveDate: '2026-01-01', expirationDate: '2028-01-01' },

    // Venue-specific contracts
    { name: 'Madison Square Garden Implementation SOW', type: 'sow', status: 'active', entityType: 'venue', venueId: 'venue-1', isInheritable: false, effectiveDate: '2025-01-15', expirationDate: '2027-01-15' },
    { name: 'MSG NDA', type: 'nda', status: 'active', entityType: 'venue', venueId: 'venue-1', isInheritable: false, effectiveDate: '2024-11-01', expirationDate: '2026-11-01' },
    { name: 'United Center License Agreement', type: 'msa', status: 'active', entityType: 'venue', venueId: 'venue-9', isInheritable: false, effectiveDate: '2025-03-01', expirationDate: '2028-03-01' },
    { name: 'Wrigley Field NDA', type: 'nda', status: 'active', entityType: 'venue', venueId: 'venue-18', isInheritable: false, effectiveDate: '2025-06-01', expirationDate: '2027-06-01' },
    { name: 'Hollywood Bowl Pilot Agreement', type: 'sow', status: 'pending', entityType: 'venue', venueId: 'venue-2', isInheritable: false, effectiveDate: '2026-03-01', expirationDate: '2026-09-01' },
  ];

  for (const contract of contractsData) {
    const entityId = contract.venueId || contract.operatorId || contract.concessionaireId;
    await prisma.contract.create({
      data: {
        name: contract.name,
        type: contract.type as any,
        status: contract.status as any,
        entityType: contract.entityType as any,
        isInheritable: contract.isInheritable,
        effectiveDate: new Date(contract.effectiveDate),
        expirationDate: contract.expirationDate ? new Date(contract.expirationDate) : null,
        s3Key: `contracts/${contract.entityType}/${entityId}/${contract.name.toLowerCase().replace(/\s+/g, '-')}.pdf`,
        s3Url: '#',
        venueId: contract.venueId || null,
        operatorId: contract.operatorId || null,
        concessionaireId: contract.concessionaireId || null,
      },
    });
  }
  console.log(`Created ${contractsData.length} contracts`);

  // Create business insights
  console.log('Creating business insights...');
  const insightsData = [
    { type: 'engagement_metric', title: 'MSG Response Time Improved', description: 'Madison Square Garden\'s average response time has improved by 40% over the last 30 days. Consider scheduling a follow-up to discuss expansion.', priority: 'positive', venueId: 'venue-1', metric: { value: 40, unit: '%', trend: 'up', label: 'Response Time Improvement' } },
    { type: 'pipeline_alert', title: 'Q1 Pipeline at Risk', description: '3 deals worth $1.2M are at risk of slipping from Q1. Focus on Fenway Park, Yankee Stadium, and Chase Center.', priority: 'warning', metric: { value: 1200000, unit: '$', trend: 'down', label: 'At Risk Pipeline' } },
    { type: 'milestone', title: 'United Center Go-Live Complete', description: 'United Center successfully completed their go-live last week. Schedule post-implementation review.', priority: 'positive', venueId: 'venue-9' },
    { type: 'inbound_activity', title: 'Crypto.com Arena Engagement Spike', description: 'Crypto.com Arena has opened 5 emails and visited pricing page 3 times this week.', priority: 'info', venueId: 'venue-12', metric: { value: 8, unit: 'actions', trend: 'up', label: 'Weekly Engagement' } },
    { type: 'contract_news', title: 'MSG Contract Renewal Coming Up', description: 'Madison Square Garden\'s contract expires in 90 days. Start renewal conversations soon.', priority: 'warning', venueId: 'venue-1' },
    { type: 'engagement_metric', title: 'Live Nation Portfolio Engagement', description: 'Average engagement across Live Nation venues is up 25% this month.', priority: 'positive', operatorId: 'op-1', metric: { value: 25, unit: '%', trend: 'up', label: 'Portfolio Engagement' } },
    { type: 'pipeline_alert', title: 'High-Value Demo Scheduled', description: 'Dodger Stadium ($820K) has confirmed a demo for next week. Prepare custom presentation.', priority: 'info', venueId: 'venue-21' },
    { type: 'milestone', title: 'Wrigley Field Training Complete', description: 'All staff training sessions completed for Wrigley Field. Ready for phase 2 rollout.', priority: 'positive', venueId: 'venue-18' },
    { type: 'inbound_activity', title: 'OVG Venues Showing Interest', description: 'Multiple Oak View Group venues have been researching our product this week.', priority: 'info', operatorId: 'op-4' },
    { type: 'engagement_metric', title: 'Convention Center Segment Growing', description: 'Engagement from convention centers is up 60% compared to last quarter.', priority: 'positive', metric: { value: 60, unit: '%', trend: 'up', label: 'Segment Growth' } },
    { type: 'pipeline_alert', title: 'Greek Theatre Contract Pending', description: 'Greek Theatre contract has been in legal review for 3 weeks. Follow up with Lisa Johnson.', priority: 'warning', venueId: 'venue-7' },
    { type: 'contract_news', title: 'Levy Partnership Anniversary', description: 'Levy Restaurants partnership reaches 2-year anniversary. Consider case study.', priority: 'info' },
  ];

  for (const insight of insightsData) {
    await prisma.businessInsight.create({
      data: {
        type: insight.type,
        title: insight.title,
        description: insight.description,
        priority: insight.priority,
        venueId: insight.venueId || null,
        operatorId: insight.operatorId || null,
        metric: insight.metric || null,
        read: Math.random() > 0.7,
      },
    });
  }
  console.log(`Created ${insightsData.length} business insights`);

  // Create recommended actions
  console.log('Creating recommended actions...');
  const recommendedActionsData = [
    { type: 'follow_up_email', title: 'Follow up with John Smith at MSG', reason: 'No response to proposal sent 5 days ago. John typically responds within 3 days.', priority: 'high', venueId: 'venue-1', contactId: 'contact-1', userId: 'user-1', suggestedContent: 'Hi John, I wanted to follow up on the implementation proposal I sent last week. Do you have any questions I can help address?' },
    { type: 'schedule_call', title: 'Schedule demo for Fenway Park', reason: 'They\'ve been in qualified stage for 3 weeks. Time to push for demo.', priority: 'high', venueId: 'venue-19', contactId: 'contact-14', userId: 'user-3' },
    { type: 'send_proposal', title: 'Send proposal to Chase Center', reason: 'Demo was successful last week. Strike while interest is high.', priority: 'high', venueId: 'venue-11', contactId: 'contact-11', userId: 'user-1' },
    { type: 'check_in', title: 'Check in with United Center', reason: 'Been 2 weeks since go-live. Time for post-implementation check-in.', priority: 'medium', venueId: 'venue-9', contactId: 'contact-11', userId: 'user-4' },
    { type: 'follow_up_email', title: 'Follow up with Lisa Johnson', reason: 'Hollywood Bowl proposal has been pending for 10 days.', priority: 'medium', venueId: 'venue-2', contactId: 'contact-4', userId: 'user-3', suggestedContent: 'Hi Lisa, Just checking in on the Hollywood Bowl proposal. Let me know if you need any additional information or have questions.' },
    { type: 'schedule_call', title: 'Schedule quarterly review with Wrigley', reason: 'Q1 review is due. They\'ve been a client for 6 months.', priority: 'medium', venueId: 'venue-18', contactId: 'contact-7', userId: 'user-1' },
    { type: 'send_proposal', title: 'Prepare T-Mobile Arena proposal', reason: 'Negotiation stage for 4 weeks. Need to formalize terms.', priority: 'medium', venueId: 'venue-10', contactId: 'contact-6', userId: 'user-2' },
    { type: 'check_in', title: 'Check status of Ball Arena evaluation', reason: 'Been in qualified stage for 5 weeks with minimal activity.', priority: 'low', venueId: 'venue-4', contactId: 'contact-9', userId: 'user-2' },
    { type: 'follow_up_email', title: 'Re-engage Barclays Center', reason: 'Last interaction was 3 weeks ago. Demo feedback was positive.', priority: 'low', venueId: 'venue-15', contactId: 'contact-11', userId: 'user-6' },
    { type: 'schedule_call', title: 'Intro call with Bridgestone Arena', reason: 'New lead from trade show. Initial interest in mobile ordering.', priority: 'low', venueId: 'venue-14', contactId: 'contact-14', userId: 'user-7' },
  ];

  for (const action of recommendedActionsData) {
    await prisma.recommendedAction.create({
      data: {
        type: action.type,
        title: action.title,
        reason: action.reason,
        priority: action.priority,
        suggestedContent: action.suggestedContent || null,
        venueId: action.venueId,
        contactId: action.contactId,
        userId: action.userId,
        dismissed: false,
        completedAt: null,
      },
    });
  }
  console.log(`Created ${recommendedActionsData.length} recommended actions`);

  console.log('✅ Seed completed successfully!');
  console.log(`\nSummary:`);
  console.log(`  - ${usersData.length} users`);
  console.log(`  - ${operatorsData.length} operators`);
  console.log(`  - ${concessionairesData.length} concessionaires`);
  console.log(`  - ${venuesData.length} venues`);
  console.log(`  - ${contactsData.length} contacts`);
  console.log(`  - ${interactionsData.length} interactions`);
  console.log(`  - ${todosData.length} todos`);
  console.log(`  - ${eventsData.length} scheduled events`);
  console.log(`  - ${notificationsData.length} notifications`);
  console.log(`  - ${filesData.length} venue files`);
  console.log(`  - ${contractsData.length} contracts`);
  console.log(`  - ${insightsData.length} business insights`);
  console.log(`  - ${recommendedActionsData.length} recommended actions`);
  console.log(`\nYou can login with any of these users (password: ${DEFAULT_PASSWORD}):`);
  usersData.forEach(u => console.log(`  - ${u.email}`));
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
