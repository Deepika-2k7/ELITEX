import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { 
  getAllTeams, 
  getTeamByEmail, 
  getTeamById, 
  getTeamByName, 
  getTeamStats, 
  createTeam,
  updateTeamMembers,
  getSlotStats,
  bookMemberSlot,
  OFFICIAL_SLOTS
} from './db.js';
import {
  initPostgres,
  isPostgresConnected,
  getPostgresError,
  pgGetTeamById,
  pgGetTeamByEmail,
  pgGetTeamByName,
  pgGetTeamStats,
  pgCreateTeam,
  pgUpdateTeamMembers,
  pgGetSlotStats,
  pgBookMemberSlot,
  migrateFromJSON
} from './postgres.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'elitex-hackathon-2026-fxec-secret-key';

app.use(cors());
app.use(express.json());

// Helper to generate JWT token
function generateToken(team) {
  return jwt.sign(
    { 
      teamId: team.teamId, 
      email: team.email, 
      teamName: team.teamName 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Authentication middleware (supports both PostgreSQL and local fallback)
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const team = isPostgresConnected() 
      ? await pgGetTeamById(decoded.teamId)
      : getTeamById(decoded.teamId);

    if (!team) {
      return res.status(404).json({ error: 'Registered team not found' });
    }
    req.team = team;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Session expired or invalid token' });
  }
}

// ---------------------- ROUTES ----------------------

/**
 * Health check & Event metadata
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    event: 'ELITEX HACKATHON 2026',
    organizers: 'FXEC × ELITE BATCH 2025-29',
    timestamp: new Date().toISOString()
  });
});

/**
 * Database Health & Connectivity Status
 */
app.get('/api/db/health', (req, res) => {
  const connected = isPostgresConnected();
  const error = getPostgresError();
  res.json({
    connected,
    engine: connected ? 'Neon PostgreSQL' : 'Local JSON Fallback',
    databaseUrlConfigured: Boolean(process.env.DATABASE_URL?.trim()),
    error: connected ? null : error,
    timestamp: new Date().toISOString()
  });
});

/**
 * Get registration statistics & remaining slots
 */
app.get('/api/teams/status', async (req, res) => {
  try {
    const stats = isPostgresConnected() ? await pgGetTeamStats() : getTeamStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve team status' });
  }
});

/**
 * Team Registration Endpoint
 */
app.post('/api/register', async (req, res) => {
  try {
    const { teamName, email, password, confirmPassword } = req.body;

    // 1. Validate required fields
    if (!teamName || !email || !password || !confirmPassword) {
      return res.status(400).json({ 
        error: 'All fields (Team Name, Team Leader Email, Password, Confirm Password) are required.' 
      });
    }

    const trimmedTeamName = teamName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // 2. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ 
        error: 'Please enter a valid email address.' 
      });
    }

    // 3. Validate password match
    if (password !== confirmPassword) {
      return res.status(400).json({ 
        error: 'Password and Confirm Password do not match.' 
      });
    }

    // 4. Validate minimum password length
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long.' 
      });
    }

    // 5. Enforce 50-team registration limit on the server
    const stats = isPostgresConnected() ? await pgGetTeamStats() : getTeamStats();
    if (stats.isFull) {
      return res.status(400).json({ 
        error: 'All 50 Team Slots Filled. Registration is now closed.' 
      });
    }

    // 6. Check for duplicate email registration
    const existingEmail = isPostgresConnected() ? await pgGetTeamByEmail(normalizedEmail) : getTeamByEmail(normalizedEmail);
    if (existingEmail) {
      return res.status(400).json({ 
        error: 'A team with this email address has already been registered.' 
      });
    }

    // 7. Check for duplicate team name
    const existingName = isPostgresConnected() ? await pgGetTeamByName(trimmedTeamName) : getTeamByName(trimmedTeamName);
    if (existingName) {
      return res.status(400).json({ 
        error: `Team name "${trimmedTeamName}" is already taken. Please choose a unique team name.` 
      });
    }

    // 8. Hash password securely using bcrypt (never store plaintext or confirmPassword)
    const passwordHash = bcrypt.hashSync(password, 10);

    // 9. Save registration with automatically assigned Team ID (ELITEFX001 - ELITEFX050)
    let newTeam;
    try {
      if (isPostgresConnected()) {
        newTeam = await pgCreateTeam({
          teamName: trimmedTeamName,
          email: normalizedEmail,
          passwordHash
        });
      } else {
        newTeam = createTeam({
          teamName: trimmedTeamName,
          email: normalizedEmail,
          passwordHash
        });
      }
    } catch (err) {
      if (err.code === 'SLOTS_FULL') {
        return res.status(400).json({ error: 'All 50 Team Slots Filled. Registration is now closed.' });
      }
      return res.status(400).json({ error: err.message });
    }

    // 10. Generate authenticated session token
    const token = generateToken(newTeam);

    // 11. Return sanitized team object (omit password hash)
    const { passwordHash: _, ...sanitizedTeam } = newTeam;

    res.status(201).json({
      success: true,
      message: `Registration successful! Team ID ${sanitizedTeam.teamId} assigned to ${sanitizedTeam.teamName}.`,
      team: sanitizedTeam,
      token
    });

  } catch (err) {
    console.error('Error during team registration:', err);
    res.status(500).json({ error: 'Server error during team registration. Please try again.' });
  }
});

/**
 * Team Login (for returning users)
 * Accepts Team Leader Email OR Team ID, plus Password
 */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, email, password } = req.body;
    const loginTarget = identifier || email;

    if (!loginTarget || !password) {
      return res.status(400).json({ error: 'Team ID/Email and Password are required.' });
    }

    const trimmed = loginTarget.trim();
    let team = null;

    if (isPostgresConnected()) {
      if (trimmed.toUpperCase().startsWith('ELITEFX')) {
        team = await pgGetTeamById(trimmed);
      } else {
        team = await pgGetTeamByEmail(trimmed.toLowerCase());
      }
    } else {
      if (trimmed.toUpperCase().startsWith('ELITEFX')) {
        team = getTeamById(trimmed);
      } else {
        team = getTeamByEmail(trimmed.toLowerCase());
      }
    }

    if (!team) {
      return res.status(401).json({ 
        error: 'No registered team found with this ID or Email. Please register first.' 
      });
    }

    const isMatch = bcrypt.compareSync(password, team.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password. Access denied.' });
    }

    const token = generateToken(team);
    const { passwordHash: _, ...sanitizedTeam } = team;

    res.json({
      success: true,
      message: `Welcome back, Team ${team.teamName}!`,
      team: sanitizedTeam,
      token
    });

  } catch (err) {
    console.error('Error during team login:', err);
    res.status(500).json({ error: 'Server error during login authentication.' });
  }
});

/**
 * Authenticated User / Session Verification
 */
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const { passwordHash: _, ...sanitizedTeam } = req.team;
  res.json({
    authenticated: true,
    team: sanitizedTeam
  });
});

// ---------------------- TEAM MEMBERS (TEAM DETAILS) ----------------------

/**
 * Get Team Members for authenticated team
 */
app.get('/api/team/members', authenticateToken, async (req, res) => {
  try {
    const team = isPostgresConnected() 
      ? await pgGetTeamById(req.team.teamId)
      : getTeamById(req.team.teamId);
    const members = team?.members || [];
    res.json({
      teamId: req.team.teamId,
      teamName: req.team.teamName,
      members,
      totalMembers: members.length,
      maxMembers: 4,
      isComplete: members.length === 4
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to retrieve team members.' });
  }
});

/**
 * Save/Update Team Members (Only authenticated team leader)
 * Max 4 members total, including team leader
 */
app.post('/api/team/members', authenticateToken, async (req, res) => {
  try {
    const { members } = req.body;
    if (!Array.isArray(members)) {
      return res.status(400).json({ error: 'Expected members array in request body.' });
    }

    const updatedTeam = isPostgresConnected()
      ? await pgUpdateTeamMembers(req.team.teamId, members)
      : updateTeamMembers(req.team.teamId, members);

    const { passwordHash: _, ...sanitizedTeam } = updatedTeam;

    res.json({
      success: true,
      message: 'Team members updated and saved successfully!',
      members: updatedTeam.members,
      team: sanitizedTeam
    });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to update team members.' });
  }
});

// ---------------------- PRELIMS SLOT BOOKING ----------------------

/**
 * Get Live Slot Availability Statistics across all 4 slots
 */
app.get('/api/slots/status', async (req, res) => {
  try {
    const slots = isPostgresConnected() ? await pgGetSlotStats() : getSlotStats();
    res.json({
      success: true,
      date: 'Monday, 2 November 2026',
      timezone: 'Asia/Kolkata (IST)',
      slots
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve slot availability.' });
  }
});

/**
 * Book an individual slot for a member
 */
app.post('/api/slots/book', authenticateToken, async (req, res) => {
  try {
    const { registerNumber, slotId } = req.body;

    if (!registerNumber || !slotId) {
      return res.status(400).json({ error: 'Register Number and Slot ID are required.' });
    }

    const result = isPostgresConnected()
      ? await pgBookMemberSlot(req.team.teamId, registerNumber, slotId)
      : bookMemberSlot(req.team.teamId, registerNumber, slotId);

    const { passwordHash: _, ...sanitizedTeam } = result.team;

    res.json({
      success: true,
      message: `Slot booked successfully for Register Number ${registerNumber}!`,
      booking: result.member,
      slots: result.slots,
      team: sanitizedTeam
    });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Slot booking failed.' });
  }
});

// Start Express Server
app.listen(PORT, async () => {
  console.log(`\n==================================================`);
  console.log(`[ELITEX HACKATHON 2026] Backend Server Active`);
  console.log(`Port: http://localhost:${PORT}`);
  console.log(`Organised by: ELITE BATCH 2025-29 (FXEC)`);
  console.log(`Sequential Team ID Capacity: 50 Teams (ELITEFX001 - ELITEFX050)`);
  console.log(`==================================================\n`);

  // Initialize PostgreSQL connection & migrations
  const pgInit = await initPostgres();
  if (pgInit.success) {
    const existingJsonTeams = getAllTeams();
    await migrateFromJSON(existingJsonTeams);
  }
});
