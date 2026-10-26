import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { gradeAssessment } from './data/questions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const TEAMS_FILE = path.join(DATA_DIR, 'teams.json');
const ADMINS_FILE = path.join(DATA_DIR, 'admins.json');
const ASSESSMENTS_FILE = path.join(DATA_DIR, 'assessments.json');
const MALPRACTICE_FILE = path.join(DATA_DIR, 'malpractice.json');
const AUDIT_LOGS_FILE = path.join(DATA_DIR, 'audit_logs.json');
const ANNOUNCEMENTS_FILE = path.join(DATA_DIR, 'announcements.json');

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

[
  { file: TEAMS_FILE, def: [] },
  { file: ADMINS_FILE, def: [] },
  { file: ASSESSMENTS_FILE, def: [] },
  { file: MALPRACTICE_FILE, def: [] },
  { file: AUDIT_LOGS_FILE, def: [] },
  { file: ANNOUNCEMENTS_FILE, def: [] }
].forEach(({ file, def }) => {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(def, null, 2), 'utf-8');
  }
});

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

// ---------------------- ADMIN SEED & ACCOUNT ----------------------

const DEFAULT_ADMIN_EMAIL = 'eliteadmin@francisxavier.ac.in';
const DEFAULT_ADMIN_PASS = 'elitexadmin';

export function seedInitialAdminJSON() {
  const admins = readJSON(ADMINS_FILE, []);
  const existing = admins.find(a => a.email.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase());

  if (!existing) {
    const passwordHash = bcrypt.hashSync(DEFAULT_ADMIN_PASS, 10);
    const newAdmin = {
      id: `admin-${Date.now()}`,
      email: DEFAULT_ADMIN_EMAIL,
      passwordHash,
      role: 'super_admin',
      mustChangePassword: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    admins.push(newAdmin);
    writeJSON(ADMINS_FILE, admins);
    console.log(`[JSON SEED] Initial administrator account initialized (${DEFAULT_ADMIN_EMAIL}).`);
  } else {
    console.log(`[JSON SEED] Administrator account exists (${DEFAULT_ADMIN_EMAIL}) — preserving password.`);
  }
}

// Initialize seed
seedInitialAdminJSON();

export function getAdminByEmail(email) {
  const admins = readJSON(ADMINS_FILE, []);
  return admins.find(a => a.email.toLowerCase() === (email || '').trim().toLowerCase()) || null;
}

export function getAdminById(id) {
  const admins = readJSON(ADMINS_FILE, []);
  return admins.find(a => a.id === id) || null;
}

export function updateAdminPassword(adminId, newPasswordHash) {
  const admins = readJSON(ADMINS_FILE, []);
  const idx = admins.findIndex(a => a.id === adminId);
  if (idx === -1) throw new Error('Administrator not found.');

  admins[idx].passwordHash = newPasswordHash;
  admins[idx].mustChangePassword = false;
  admins[idx].updatedAt = new Date().toISOString();
  writeJSON(ADMINS_FILE, admins);
  return admins[idx];
}

// ---------------------- TEAMS & AUTH ----------------------

export function getAllTeams() {
  return readJSON(TEAMS_FILE, []);
}

export function getTeamByEmail(email) {
  const teams = getAllTeams();
  const normalized = email.trim().toLowerCase();
  return teams.find(t => t.email.toLowerCase() === normalized) || null;
}

export function getTeamById(teamId) {
  const teams = getAllTeams();
  const normalized = teamId.trim().toUpperCase();
  return teams.find(t => t.teamId.toUpperCase() === normalized) || null;
}

export function getTeamByName(name) {
  const teams = getAllTeams();
  const normalized = name.trim().toLowerCase();
  return teams.find(t => t.teamName.trim().toLowerCase() === normalized) || null;
}

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

export function createTeam({ teamName, email, passwordHash }) {
  const teams = getAllTeams();

  if (teams.length >= MAX_TEAMS) {
    const error = new Error('All 50 Team Slots Filled');
    error.code = 'SLOTS_FULL';
    throw error;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedTeamName = teamName.trim();

  if (teams.some(t => t.email.toLowerCase() === normalizedEmail)) {
    const error = new Error('A team with this email address has already been registered.');
    error.code = 'DUPLICATE_EMAIL';
    throw error;
  }

  if (teams.some(t => t.teamName.toLowerCase() === normalizedTeamName.toLowerCase())) {
    const error = new Error('This Team Name is already taken. Please choose another name.');
    error.code = 'DUPLICATE_NAME';
    throw error;
  }

  const nextSeq = teams.length + 1;
  const teamId = `ELITEFX${String(nextSeq).padStart(3, '0')}`;

  const newTeam = {
    teamId,
    teamName: normalizedTeamName,
    email: normalizedEmail,
    passwordHash,
    squadSize: 4,
    registeredAt: new Date().toISOString(),
    status: 'PENDING_APPROVAL', // Default approval status for new registrations
    rewardPoints: 100,
    role: 'team_leader',
    members: []
  };

  teams.push(newTeam);
  writeJSON(TEAMS_FILE, teams);

  return newTeam;
}

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

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\d{10}$/;
  const seenRegsInTeam = new Set();
  const otherTeamsMembers = teams
    .filter((_, idx) => idx !== teamIndex)
    .flatMap(t => (t.members || []).map(m => ({ reg: m.registerNumber, teamName: t.teamName, teamId: t.teamId })));

  const sanitizedList = memberList.map((m, idx) => {
    const name = (m.name || '').trim();
    const registerNumber = (m.registerNumber || '').trim().toUpperCase();
    const email = (m.email || '').trim().toLowerCase();
    const year = (m.year || '').trim();
    const department = (m.department || '').trim();
    const phone = (m.phone || '').trim().replace(/\D/g, '');
    const isLeader = Boolean(m.isLeader || idx === 0);

    if (!name || !registerNumber || !email || !year || !department || !phone) {
      throw new Error(`Member #${idx + 1} (${name || 'Unnamed'}) has missing required fields. All 6 fields are required.`);
    }

    if (!emailRegex.test(email)) {
      throw new Error(`Member #${idx + 1} (${name}) has an invalid email format: ${email}`);
    }

    if (!phoneRegex.test(phone)) {
      throw new Error(`Member #${idx + 1} (${name}) phone number must be exactly 10 digits.`);
    }

    if (seenRegsInTeam.has(registerNumber)) {
      throw new Error(`Duplicate Register Number "${registerNumber}" entered within the team.`);
    }
    seenRegsInTeam.add(registerNumber);

    const dupAcrossTeams = otherTeamsMembers.find(o => o.reg.toUpperCase() === registerNumber);
    if (dupAcrossTeams) {
      throw new Error(`Register Number "${registerNumber}" is already registered by Team ${dupAcrossTeams.teamName} (${dupAcrossTeams.teamId}).`);
    }

    const existingMember = (teams[teamIndex].members || []).find(old => old.registerNumber.toUpperCase() === registerNumber);

    return {
      id: m.id || existingMember?.id || `mem-${Date.now()}-${idx}`,
      name,
      registerNumber,
      email,
      year,
      department,
      phone,
      isLeader,
      slotId: existingMember?.slotId || m.slotId || null,
      slotTime: existingMember?.slotTime || m.slotTime || null,
      slotBookedAt: existingMember?.slotBookedAt || m.slotBookedAt || null,
      updatedAt: new Date().toISOString()
    };
  });

  teams[teamIndex].members = sanitizedList;
  writeJSON(TEAMS_FILE, teams);

  return teams[teamIndex];
}

// ---------------------- SLOTS ----------------------

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

  if (currentMember.slotId === normalizedSlot) {
    return {
      team,
      member: currentMember,
      slots: getSlotStats()
    };
  }

  const allMembers = teams.flatMap(t => t.members || []);
  const currentSlotBookings = allMembers.filter(m => m.slotId === normalizedSlot).length;

  if (currentSlotBookings >= slotDef.totalCapacity) {
    throw new Error(`Slot ${slotDef.slotNumber} (${slotDef.time}) is completely full (50/50 bookings). Please select another slot.`);
  }

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

// ---------------------- ADMIN SPECIFIC OPERATIONS ----------------------

export function adminGetDashboardStats() {
  const teams = getAllTeams();
  const allMembers = teams.flatMap(t => t.members || []);
  const assessments = readJSON(ASSESSMENTS_FILE, []);
  const malpractices = readJSON(MALPRACTICE_FILE, []);
  const slotStats = getSlotStats();

  const isApproved = (status) => ['APPROVED', 'Verified & Confirmed', 'CONFIRMED'].includes(status);
  const isPending = (status) => !status || status === 'PENDING_APPROVAL';
  const isRejected = (status) => status === 'REJECTED';

  const approvedTeams = teams.filter(t => isApproved(t.status)).length;
  const pendingApprovals = teams.filter(t => isPending(t.status)).length;
  const rejectedTeams = teams.filter(t => isRejected(t.status)).length;

  const completedAssessments = assessments.filter(a => a.status === 'COMPLETED').length;
  const awaitingAssessments = Math.max(0, allMembers.length - completedAssessments);
  const flaggedMalpractice = malpractices.filter(m => m.status === 'CONFIRMED' || m.status === 'UNDER_REVIEW').length;

  return {
    totalTeams: teams.length,
    maxTeams: MAX_TEAMS,
    totalParticipants: allMembers.length,
    pendingApprovals,
    approvedTeams,
    rejectedTeams,
    slots: slotStats,
    completedAssessments,
    awaitingAssessments,
    availableResults: assessments.length,
    flaggedMalpractice
  };
}

export function adminGetAllTeams({ search = '', status = '' } = {}) {
  let teams = getAllTeams();
  const assessments = readJSON(ASSESSMENTS_FILE, []);

  if (search) {
    const s = search.toLowerCase();
    teams = teams.filter(t => 
      t.teamId.toLowerCase().includes(s) || 
      t.teamName.toLowerCase().includes(s) || 
      t.email.toLowerCase().includes(s)
    );
  }

  if (status) {
    if (status === 'APPROVED') {
      teams = teams.filter(t => ['APPROVED', 'Verified & Confirmed'].includes(t.status));
    } else {
      teams = teams.filter(t => (t.status || 'PENDING_APPROVAL') === status);
    }
  }

  return teams.map(t => {
    const { passwordHash: _, ...rest } = t;
    const members = rest.members || [];
    const completedCount = members.filter(m => assessments.some(a => a.registerNumber === m.registerNumber && a.status === 'COMPLETED')).length;

    return {
      ...rest,
      membersCount: members.length,
      slotsBookedCount: members.filter(m => m.slotId).length,
      assessmentCompletedCount: completedCount
    };
  });
}

export function adminApproveTeam(teamId) {
  const teams = getAllTeams();
  const idx = teams.findIndex(t => t.teamId.toUpperCase() === teamId.trim().toUpperCase());
  if (idx === -1) throw new Error(`Team ${teamId} not found.`);

  teams[idx].status = 'APPROVED';
  teams[idx].approvedAt = new Date().toISOString();
  writeJSON(TEAMS_FILE, teams);

  const { passwordHash: _, ...sanitized } = teams[idx];
  return sanitized;
}

export function adminRejectTeam(teamId, reason = 'Registration requirements not met') {
  const teams = getAllTeams();
  const idx = teams.findIndex(t => t.teamId.toUpperCase() === teamId.trim().toUpperCase());
  if (idx === -1) throw new Error(`Team ${teamId} not found.`);

  teams[idx].status = 'REJECTED';
  teams[idx].rejectionReason = reason;
  teams[idx].rejectedAt = new Date().toISOString();
  writeJSON(TEAMS_FILE, teams);

  const { passwordHash: _, ...sanitized } = teams[idx];
  return sanitized;
}

export function adminUpdateTeam(teamId, updates) {
  const teams = getAllTeams();
  const idx = teams.findIndex(t => t.teamId.toUpperCase() === teamId.trim().toUpperCase());
  if (idx === -1) throw new Error(`Team ${teamId} not found.`);

  if (updates.teamName) {
    const dup = teams.find(t => t.teamId !== teamId && t.teamName.toLowerCase() === updates.teamName.trim().toLowerCase());
    if (dup) throw new Error(`Team name "${updates.teamName}" is already taken.`);
    teams[idx].teamName = updates.teamName.trim();
  }

  if (updates.email) {
    const dup = teams.find(t => t.teamId !== teamId && t.email.toLowerCase() === updates.email.trim().toLowerCase());
    if (dup) throw new Error(`Email "${updates.email}" is already used by another team.`);
    teams[idx].email = updates.email.trim().toLowerCase();
  }

  if (updates.status) {
    teams[idx].status = updates.status;
  }

  teams[idx].updatedAt = new Date().toISOString();
  writeJSON(TEAMS_FILE, teams);

  const { passwordHash: _, ...sanitized } = teams[idx];
  return sanitized;
}

export function adminDeleteTeam(teamId) {
  const teams = getAllTeams();
  const normalizedId = teamId.trim().toUpperCase();
  const idx = teams.findIndex(t => t.teamId.toUpperCase() === normalizedId);
  if (idx === -1) throw new Error(`Team ${teamId} not found.`);

  const deletedTeam = teams[idx];
  const remaining = teams.filter(t => t.teamId.toUpperCase() !== normalizedId);
  writeJSON(TEAMS_FILE, remaining);

  // Clean up related assessments & malpractice
  const assessments = readJSON(ASSESSMENTS_FILE, []).filter(a => a.teamId !== normalizedId);
  writeJSON(ASSESSMENTS_FILE, assessments);

  const malpractices = readJSON(MALPRACTICE_FILE, []).filter(m => m.teamId !== normalizedId);
  writeJSON(MALPRACTICE_FILE, malpractices);

  return { success: true, deletedTeam: { teamId: deletedTeam.teamId, teamName: deletedTeam.teamName } };
}

export function adminGetAllParticipants({ search = '', teamId = '', slotId = '' } = {}) {
  const teams = getAllTeams();
  const assessments = readJSON(ASSESSMENTS_FILE, []);
  const malpractices = readJSON(MALPRACTICE_FILE, []);

  let participants = [];

  for (const t of teams) {
    for (const m of (t.members || [])) {
      const assess = assessments.find(a => a.registerNumber === m.registerNumber);
      const mal = malpractices.filter(mp => mp.registerNumber === m.registerNumber);

      participants.push({
        ...m,
        teamId: t.teamId,
        teamName: t.teamName,
        teamStatus: t.status,
        assessmentStatus: assess ? assess.status : 'NOT_STARTED',
        score: assess ? assess.score : null,
        maxScore: assess ? assess.maxScore : 12,
        percentage: assess ? assess.percentage : null,
        malpracticeCount: mal.length,
        hasMalpractice: mal.some(item => item.status === 'CONFIRMED' || item.status === 'UNDER_REVIEW')
      });
    }
  }

  if (search) {
    const s = search.toLowerCase();
    participants = participants.filter(p => 
      p.name.toLowerCase().includes(s) ||
      p.registerNumber.toLowerCase().includes(s) ||
      p.email.toLowerCase().includes(s) ||
      p.teamId.toLowerCase().includes(s) ||
      p.teamName.toLowerCase().includes(s)
    );
  }

  if (teamId) {
    participants = participants.filter(p => p.teamId.toUpperCase() === teamId.toUpperCase());
  }

  if (slotId) {
    participants = participants.filter(p => p.slotId === slotId);
  }

  return participants;
}

export function adminUpdateParticipant(registerNumber, updates) {
  const teams = getAllTeams();
  const normalizedReg = registerNumber.trim().toUpperCase();

  let foundTeam = null;
  let foundMemberIndex = -1;

  for (const t of teams) {
    const idx = (t.members || []).findIndex(m => m.registerNumber.toUpperCase() === normalizedReg);
    if (idx !== -1) {
      foundTeam = t;
      foundMemberIndex = idx;
      break;
    }
  }

  if (!foundTeam || foundMemberIndex === -1) {
    throw new Error(`Participant with Register Number "${registerNumber}" not found.`);
  }

  const member = foundTeam.members[foundMemberIndex];
  if (updates.name) member.name = updates.name.trim();
  if (updates.email) member.email = updates.email.trim().toLowerCase();
  if (updates.phone) member.phone = updates.phone.trim();
  if (updates.year) member.year = updates.year.trim();
  if (updates.department) member.department = updates.department.trim();
  if (updates.isLeader !== undefined) member.isLeader = Boolean(updates.isLeader);

  member.updatedAt = new Date().toISOString();
  foundTeam.members[foundMemberIndex] = member;

  const teamIdx = teams.findIndex(t => t.teamId === foundTeam.teamId);
  teams[teamIdx] = foundTeam;
  writeJSON(TEAMS_FILE, teams);

  return member;
}

export function adminMoveParticipant(registerNumber, targetTeamId) {
  const teams = getAllTeams();
  const normalizedReg = registerNumber.trim().toUpperCase();
  const normalizedTargetTeam = targetTeamId.trim().toUpperCase();

  let sourceTeam = null;
  let member = null;

  for (const t of teams) {
    const m = (t.members || []).find(mem => mem.registerNumber.toUpperCase() === normalizedReg);
    if (m) {
      sourceTeam = t;
      member = m;
      break;
    }
  }

  if (!sourceTeam || !member) {
    throw new Error(`Participant ${registerNumber} not found.`);
  }

  if (sourceTeam.teamId === normalizedTargetTeam) {
    throw new Error(`Participant is already in Team ${targetTeamId}.`);
  }

  const targetIdx = teams.findIndex(t => t.teamId.toUpperCase() === normalizedTargetTeam);
  if (targetIdx === -1) {
    throw new Error(`Target Team ${targetTeamId} not found.`);
  }

  const targetTeam = teams[targetIdx];
  if ((targetTeam.members || []).length >= 4) {
    throw new Error(`Target Team ${targetTeam.teamName} (${targetTeam.teamId}) already has the maximum of 4 members.`);
  }

  // Remove from source
  sourceTeam.members = sourceTeam.members.filter(m => m.registerNumber.toUpperCase() !== normalizedReg);
  // Add to target
  member.updatedAt = new Date().toISOString();
  member.isLeader = false; // Moved participant becomes regular member
  targetTeam.members.push(member);

  writeJSON(TEAMS_FILE, teams);
  return { success: true, movedParticipant: member, targetTeam: targetTeam.teamId };
}

export function adminDeleteParticipant(registerNumber) {
  const teams = getAllTeams();
  const normalizedReg = registerNumber.trim().toUpperCase();

  let found = false;
  let participantName = '';

  for (const t of teams) {
    const idx = (t.members || []).findIndex(m => m.registerNumber.toUpperCase() === normalizedReg);
    if (idx !== -1) {
      participantName = t.members[idx].name;
      t.members.splice(idx, 1);
      found = true;
      break;
    }
  }

  if (!found) {
    throw new Error(`Participant with Register Number "${registerNumber}" not found.`);
  }

  writeJSON(TEAMS_FILE, teams);

  // Remove assessments & malpractice
  const assessments = readJSON(ASSESSMENTS_FILE, []).filter(a => a.registerNumber !== normalizedReg);
  writeJSON(ASSESSMENTS_FILE, assessments);

  const malpractices = readJSON(MALPRACTICE_FILE, []).filter(m => m.registerNumber !== normalizedReg);
  writeJSON(MALPRACTICE_FILE, malpractices);

  return { success: true, registerNumber, participantName };
}

export function adminReassignSlot(registerNumber, newSlotId) {
  const normalizedSlot = (newSlotId || '').trim().toLowerCase();
  const slotDef = OFFICIAL_SLOTS.find(s => s.id === normalizedSlot);
  if (!slotDef) throw new Error(`Invalid Slot ID "${newSlotId}".`);

  const teams = getAllTeams();
  const allMembers = teams.flatMap(t => t.members || []);
  const currentSlotBookings = allMembers.filter(m => m.slotId === normalizedSlot).length;

  if (currentSlotBookings >= slotDef.totalCapacity) {
    throw new Error(`Slot ${slotDef.slotNumber} (${slotDef.time}) is full (50/50 capacity).`);
  }

  const normalizedReg = registerNumber.trim().toUpperCase();
  let found = false;
  let updatedMember = null;

  for (const t of teams) {
    const idx = (t.members || []).findIndex(m => m.registerNumber.toUpperCase() === normalizedReg);
    if (idx !== -1) {
      t.members[idx].slotId = normalizedSlot;
      t.members[idx].slotTime = slotDef.time;
      t.members[idx].slotBookedAt = new Date().toISOString();
      updatedMember = t.members[idx];
      found = true;
      break;
    }
  }

  if (!found) throw new Error(`Participant with Register Number ${registerNumber} not found.`);

  writeJSON(TEAMS_FILE, teams);
  return { success: true, member: updatedMember, slots: getSlotStats() };
}

export function adminCancelSlotBooking(registerNumber) {
  const teams = getAllTeams();
  const normalizedReg = registerNumber.trim().toUpperCase();
  let found = false;
  let member = null;

  for (const t of teams) {
    const idx = (t.members || []).findIndex(m => m.registerNumber.toUpperCase() === normalizedReg);
    if (idx !== -1) {
      t.members[idx].slotId = null;
      t.members[idx].slotTime = null;
      t.members[idx].slotBookedAt = null;
      member = t.members[idx];
      found = true;
      break;
    }
  }

  if (!found) throw new Error(`Participant with Register Number ${registerNumber} not found.`);

  writeJSON(TEAMS_FILE, teams);
  return { success: true, member, slots: getSlotStats() };
}

// ---------------------- ASSESSMENTS ----------------------

export function adminGetAssessmentResults({ search = '', status = '' } = {}) {
  let assessments = readJSON(ASSESSMENTS_FILE, []);
  const teams = getAllTeams();

  if (search) {
    const s = search.toLowerCase();
    assessments = assessments.filter(a => 
      a.registerNumber.toLowerCase().includes(s) ||
      (a.participantName || '').toLowerCase().includes(s) ||
      a.teamId.toLowerCase().includes(s)
    );
  }

  if (status) {
    assessments = assessments.filter(a => a.status === status);
  }

  return assessments.map(a => {
    const t = teams.find(team => team.teamId === a.teamId);
    const m = (t?.members || []).find(mem => mem.registerNumber === a.registerNumber);
    return {
      ...a,
      teamName: t?.teamName || a.teamId,
      slotId: m?.slotId || null,
      slotTime: m?.slotTime || 'Not Assigned'
    };
  });
}

export function saveAssessmentResult({ teamId, registerNumber, participantName, answers, timeSpentSeconds }) {
  const assessments = readJSON(ASSESSMENTS_FILE, []);
  const normalizedReg = registerNumber.trim().toUpperCase();
  const normalizedTeam = teamId.trim().toUpperCase();

  const grading = gradeAssessment(answers);

  const idx = assessments.findIndex(a => a.registerNumber.toUpperCase() === normalizedReg);
  const now = new Date().toISOString();

  const resultObj = {
    id: idx !== -1 ? assessments[idx].id : `assess-${Date.now()}`,
    teamId: normalizedTeam,
    registerNumber: normalizedReg,
    participantName: participantName || 'Team Participant',
    score: grading.score,
    totalQuestions: grading.totalQuestions,
    maxScore: grading.maxScore,
    percentage: grading.percentage,
    timeSpentSeconds: timeSpentSeconds || 0,
    startedAt: idx !== -1 ? assessments[idx].startedAt : now,
    submittedAt: now,
    status: 'COMPLETED'
  };

  if (idx !== -1) {
    assessments[idx] = resultObj;
  } else {
    assessments.push(resultObj);
  }

  writeJSON(ASSESSMENTS_FILE, assessments);
  return resultObj;
}

// ---------------------- MALPRACTICE RECORDS ----------------------

export function adminGetMalpracticeRecords({ search = '', status = '' } = {}) {
  let records = readJSON(MALPRACTICE_FILE, []);
  const teams = getAllTeams();

  if (search) {
    const s = search.toLowerCase();
    records = records.filter(r => 
      r.registerNumber.toLowerCase().includes(s) ||
      (r.participantName || '').toLowerCase().includes(s) ||
      r.teamId.toLowerCase().includes(s) ||
      r.incidentType.toLowerCase().includes(s)
    );
  }

  if (status) {
    records = records.filter(r => r.status === status);
  }

  return records.map(r => {
    const t = teams.find(team => team.teamId === r.teamId);
    return {
      ...r,
      teamName: t?.teamName || r.teamId
    };
  });
}

export function createMalpracticeRecord({ teamId, registerNumber, participantName, incidentType, description, evidence, recordedBy }) {
  const records = readJSON(MALPRACTICE_FILE, []);
  const newRecord = {
    id: `mal-${Date.now()}`,
    teamId: (teamId || '').toUpperCase(),
    registerNumber: (registerNumber || '').toUpperCase(),
    participantName: participantName || 'Participant',
    incidentType: incidentType || 'SUSPICIOUS_ACTIVITY',
    description: description || '',
    evidence: evidence || '',
    status: 'UNDER_REVIEW',
    actionTaken: 'None',
    adminNotes: '',
    recordedBy: recordedBy || 'System',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  records.unshift(newRecord);
  writeJSON(MALPRACTICE_FILE, records);
  return newRecord;
}

export function updateMalpracticeRecord(incidentId, { status, actionTaken, adminNotes }) {
  const records = readJSON(MALPRACTICE_FILE, []);
  const idx = records.findIndex(r => r.id === incidentId);
  if (idx === -1) throw new Error(`Malpractice record "${incidentId}" not found.`);

  if (status) records[idx].status = status;
  if (actionTaken !== undefined) records[idx].actionTaken = actionTaken;
  if (adminNotes !== undefined) records[idx].adminNotes = adminNotes;
  records[idx].updatedAt = new Date().toISOString();

  writeJSON(MALPRACTICE_FILE, records);
  return records[idx];
}

// ---------------------- AUDIT LOGS ----------------------

export function adminGetAuditLogs(limit = 100) {
  const logs = readJSON(AUDIT_LOGS_FILE, []);
  return logs.slice(0, limit);
}

export function createAuditLog({ adminEmail, action, targetType, targetId, details }) {
  const logs = readJSON(AUDIT_LOGS_FILE, []);
  const newLog = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    adminEmail: adminEmail || 'Admin',
    action,
    targetType: targetType || 'SYSTEM',
    targetId: targetId || null,
    details: details || '',
    createdAt: new Date().toISOString()
  };

  logs.unshift(newLog);
  writeJSON(AUDIT_LOGS_FILE, logs.slice(0, 500)); // Cap at 500
  return newLog;
}

// ---------------------- ANNOUNCEMENTS ----------------------

export function adminGetAnnouncements() {
  return readJSON(ANNOUNCEMENTS_FILE, []);
}

export function createAnnouncement({ title, message, priority = 'NORMAL', createdBy = 'Admin' }) {
  const list = readJSON(ANNOUNCEMENTS_FILE, []);
  const ann = {
    id: `ann-${Date.now()}`,
    title: (title || '').trim(),
    message: (message || '').trim(),
    priority,
    createdBy,
    createdAt: new Date().toISOString()
  };
  list.unshift(ann);
  writeJSON(ANNOUNCEMENTS_FILE, list);
  return ann;
}

export function deleteAnnouncement(id) {
  const list = readJSON(ANNOUNCEMENTS_FILE, []);
  const filtered = list.filter(a => a.id !== id);
  writeJSON(ANNOUNCEMENTS_FILE, filtered);
  return { success: true };
}
