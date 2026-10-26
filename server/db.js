import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const TEAMS_FILE = path.join(DATA_DIR, 'teams.json');

const MAX_TEAMS = 50;

export const OFFICIAL_SLOTS = [
  { id: 'slot-1', slotNumber: 1, time: '9:30 AM – 10:30 AM', date: 'Monday, 2 November 2026', totalCapacity: 50 },
  { id: 'slot-2', slotNumber: 2, time: '11:00 AM – 12:00 PM', date: 'Monday, 2 November 2026', totalCapacity: 50 },
  { id: 'slot-3', slotNumber: 3, time: '1:30 PM – 2:30 PM', date: 'Monday, 2 November 2026', totalCapacity: 50 },
  { id: 'slot-4', slotNumber: 4, time: '2:45 PM – 3:45 PM', date: 'Monday, 2 November 2026', totalCapacity: 50 }
];

// Ensure data directory and files exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(TEAMS_FILE)) {
  fs.writeFileSync(TEAMS_FILE, JSON.stringify([], null, 2), 'utf-8');
}

// Helper to safely read JSON
function readJSON(filePath, defaultValue) {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return defaultValue;
  }
}

// Helper to safely write JSON atomically
function writeJSON(filePath, data) {
  const tempPath = `${filePath}.${Date.now()}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempPath, filePath);
}

/**
 * Get all registered teams
 */
export function getAllTeams() {
  return readJSON(TEAMS_FILE, []);
}

/**
 * Get team by email
 */
export function getTeamByEmail(email) {
  const teams = getAllTeams();
  const normalized = email.trim().toLowerCase();
  return teams.find(t => t.email.toLowerCase() === normalized) || null;
}

/**
 * Get team by Team ID
 */
export function getTeamById(teamId) {
  const teams = getAllTeams();
  const normalized = teamId.trim().toUpperCase();
  return teams.find(t => t.teamId.toUpperCase() === normalized) || null;
}

/**
 * Check if a team name is already taken
 */
export function getTeamByName(name) {
  const teams = getAllTeams();
  const normalized = name.trim().toLowerCase();
  return teams.find(t => t.teamName.trim().toLowerCase() === normalized) || null;
}

/**
 * Get current team registration statistics
 */
export function getTeamStats() {
  const teams = getAllTeams();
  return {
    totalRegistered: teams.length,
    maxTeams: MAX_TEAMS,
    slotsRemaining: Math.max(0, MAX_TEAMS - teams.length),
    isFull: teams.length >= MAX_TEAMS,
    nextTeamId: teams.length < MAX_TEAMS 
      ? `ELITEFX${String(teams.length + 1).padStart(3, '0')}` 
      : null
  };
}

/**
 * Atomically assign the next sequential Team ID and register the team.
 * Sequence: ELITEFX001 to ELITEFX050 (strictly 50 slots).
 */
export function createTeam({ teamName, email, passwordHash }) {
  const teams = getAllTeams();

  if (teams.length >= MAX_TEAMS) {
    const error = new Error('All 50 Team Slots Filled');
    error.code = 'SLOTS_FULL';
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedTeamName = teamName.trim();

  // Check duplicate email
  if (teams.some(t => t.email.toLowerCase() === normalizedEmail)) {
    const error = new Error('A team with this email address has already been registered.');
    error.code = 'DUPLICATE_EMAIL';
    throw error;
  }

  // Check duplicate team name
  if (teams.some(t => t.teamName.toLowerCase() === normalizedTeamName.toLowerCase())) {
    const error = new Error('This Team Name is already taken. Please choose another name.');
    error.code = 'DUPLICATE_NAME';
    throw error;
  }

  // Generate next sequential ID: ELITEFX001 ... ELITEFX050
  const nextSeq = teams.length + 1;
  const teamId = `ELITEFX${String(nextSeq).padStart(3, '0')}`;

  const newTeam = {
    teamId,
    teamName: normalizedTeamName,
    email: normalizedEmail,
    passwordHash,
    squadSize: 4, // Strictly 4 members
    registeredAt: new Date().toISOString(),
    status: 'Verified & Confirmed',
    rewardPoints: 100,
    role: 'team_leader',
    members: [] // Initialized empty array for 4 member slots
  };

  teams.push(newTeam);
  writeJSON(TEAMS_FILE, teams);

  return newTeam;
}

/**
 * Update Team Members (Strictly max 4 members total, including leader)
 */
export function updateTeamMembers(teamId, memberList) {
  if (!Array.isArray(memberList)) {
    throw new Error('Member list must be an array.');
  }

  if (memberList.length > 4) {
    throw new Error('A team cannot have more than 4 members in total, including the team leader.');
  }

  const teams = getAllTeams();
  const teamIndex = teams.findIndex(t => t.teamId.toUpperCase() === teamId.trim().toUpperCase());

  if (teamIndex === -1) {
    throw new Error(`Team with ID ${teamId} not found.`);
  }

  const currentTeam = teams[teamIndex];
  const existingMembers = currentTeam.members || [];

  // Validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\d{10}$/;

  const seenRegsInTeam = new Set();
  const sanitizedMembers = [];

  for (let i = 0; i < memberList.length; i++) {
    const m = memberList[i];
    const name = (m.name || '').trim();
    const registerNumber = (m.registerNumber || '').trim().toUpperCase();
    const email = (m.email || '').trim().toLowerCase();
    const year = (m.year || '').trim();
    const department = (m.department || '').trim();
    const phone = (m.phone || '').trim().replace(/\D/g, '');
    const isLeader = Boolean(m.isLeader || i === 0);

    if (!name || !registerNumber || !email || !year || !department || !phone) {
      throw new Error(`Member #${i + 1} (${name || 'Unnamed'}) has missing required fields. All 6 fields are required.`);
    }

    if (!emailRegex.test(email)) {
      throw new Error(`Member #${i + 1} (${name}) has an invalid email format: ${email}`);
    }

    if (!phoneRegex.test(phone)) {
      throw new Error(`Member #${i + 1} (${name}) phone number must be exactly 10 digits.`);
    }

    // Duplicate check within same team
    if (seenRegsInTeam.has(registerNumber)) {
      throw new Error(`Duplicate Register Number "${registerNumber}" entered within the team.`);
    }
    seenRegsInTeam.add(registerNumber);

    // Duplicate check across ALL OTHER teams
    for (let t = 0; t < teams.length; t++) {
      if (t === teamIndex) continue; // skip current team
      const otherMembers = teams[t].members || [];
      for (const om of otherMembers) {
        if ((om.registerNumber || '').trim().toUpperCase() === registerNumber) {
          throw new Error(`Register Number "${registerNumber}" is already registered by Team ${teams[t].teamName} (${teams[t].teamId}).`);
        }
      }
    }

    // Find if member previously had slot bookings
    const prevMember = existingMembers.find(
      em => (em.id && em.id === m.id) || (em.registerNumber && em.registerNumber.toUpperCase() === registerNumber)
    );

    sanitizedMembers.push({
      id: m.id || `mem-${Date.now()}-${i}`,
      name,
      registerNumber,
      email,
      year,
      department,
      phone,
      isLeader,
      slotId: prevMember?.slotId || m.slotId || null,
      slotTime: prevMember?.slotTime || m.slotTime || null,
      slotBookedAt: prevMember?.slotBookedAt || m.slotBookedAt || null,
      updatedAt: new Date().toISOString()
    });
  }

  // Save sanitized members
  teams[teamIndex].members = sanitizedMembers;
  writeJSON(TEAMS_FILE, teams);

  return teams[teamIndex];
}

/**
 * Get Live Slot Availability Statistics across all registered teams
 */
export function getSlotStats() {
  const teams = getAllTeams();
  const allMembers = teams.flatMap(t => t.members || []);

  return OFFICIAL_SLOTS.map(slot => {
    const bookedCount = allMembers.filter(m => m.slotId === slot.id).length;
    const remainingCount = Math.max(0, slot.totalCapacity - bookedCount);
    return {
      ...slot,
      bookedCount,
      remainingCount,
      isAvailable: remainingCount > 0
    };
  });
}

/**
 * Book an individual slot for a member
 */
export function bookMemberSlot(teamId, registerNumber, slotId) {
  const normalizedSlot = (slotId || '').trim().toLowerCase();
  const slotDef = OFFICIAL_SLOTS.find(s => s.id === normalizedSlot);

  if (!slotDef) {
    throw new Error(`Invalid Slot ID "${slotId}". Must be slot-1, slot-2, slot-3, or slot-4.`);
  }

  const teams = getAllTeams();
  const teamIndex = teams.findIndex(t => t.teamId.toUpperCase() === teamId.trim().toUpperCase());

  if (teamIndex === -1) {
    throw new Error(`Team ${teamId} not found.`);
  }

  const team = teams[teamIndex];
  const members = team.members || [];
  const normalizedReg = registerNumber.trim().toUpperCase();
  const memberIndex = members.findIndex(m => m.registerNumber.toUpperCase() === normalizedReg);

  if (memberIndex === -1) {
    throw new Error(`Member with Register Number "${registerNumber}" not found in Team ${team.teamName}. Please add the member in Team Details first.`);
  }

  const currentMember = members[memberIndex];

  // If member already has this slot, nothing changes
  if (currentMember.slotId === normalizedSlot) {
    return {
      team,
      member: currentMember,
      slots: getSlotStats()
    };
  }

  // Check if target slot is full
  const allMembers = teams.flatMap(t => t.members || []);
  const currentSlotBookings = allMembers.filter(m => m.slotId === normalizedSlot).length;

  if (currentSlotBookings >= slotDef.totalCapacity) {
    throw new Error(`Slot ${slotDef.slotNumber} (${slotDef.time}) is completely full (50/50 bookings). Please select another slot.`);
  }

  // Assign slot to member
  currentMember.slotId = normalizedSlot;
  currentMember.slotTime = slotDef.time;
  currentMember.slotBookedAt = new Date().toISOString();

  teams[teamIndex].members[memberIndex] = currentMember;
  writeJSON(TEAMS_FILE, teams);

  return {
    team: teams[teamIndex],
    member: currentMember,
    slots: getSlotStats()
  };
}
