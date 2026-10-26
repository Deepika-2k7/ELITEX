import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
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
  OFFICIAL_SLOTS,
  getAdminByEmail,
  getAdminById,
  updateAdminPassword,
  adminGetDashboardStats,
  adminGetAllTeams,
  adminApproveTeam,
  adminRejectTeam,
  adminUpdateTeam,
  adminDeleteTeam,
  adminGetAllParticipants,
  adminUpdateParticipant,
  adminMoveParticipant,
  adminDeleteParticipant,
  adminReassignSlot,
  adminCancelSlotBooking,
  adminGetAssessmentResults,
  saveAssessmentResult,
  adminGetMalpracticeRecords,
  createMalpracticeRecord,
  updateMalpracticeRecord,
  adminGetAuditLogs,
  createAuditLog,
  adminGetAnnouncements,
  createAnnouncement,
  deleteAnnouncement
} from './db.js';

import {
  initPostgres,
  isPostgresConnected,
  getPostgresError,
  testConnection,
  getDatabaseConfig,
  pgGetTeamById,
  pgGetTeamByEmail,
  pgGetTeamByName,
  pgGetTeamStats,
  pgCreateTeam,
  pgUpdateTeamMembers,
  pgGetSlotStats,
  pgBookMemberSlot,
  migrateFromJSON,
  pgGetAdminByEmail,
  pgGetAdminById,
  pgUpdateAdminPassword,
  pgAdminGetDashboardStats,
  pgAdminGetAllTeams,
  pgAdminApproveTeam,
  pgAdminRejectTeam,
  pgAdminUpdateTeam,
  pgAdminDeleteTeam,
  pgAdminGetAllParticipants,
  pgAdminUpdateParticipant,
  pgAdminMoveParticipant,
  pgAdminDeleteParticipant,
  pgAdminReassignSlot,
  pgAdminCancelSlotBooking,
  pgAdminGetAssessmentResults,
  pgSaveAssessmentResult,
  pgAdminGetMalpracticeRecords,
  pgCreateMalpracticeRecord,
  pgUpdateMalpracticeRecord,
  pgAdminGetAuditLogs,
  pgCreateAuditLog,
  pgAdminGetAnnouncements,
  pgCreateAnnouncement,
  pgDeleteAnnouncement
} from './postgres.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Reliably load .env from project root, server directory, and process.cwd()
const envPaths = [
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '.env'),
  path.resolve(process.cwd(), '.env')
];

for (const envPath of envPaths) {
  dotenv.config({ path: envPath });
}

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'elitex-hackathon-2026-fxec-secret-key';
const AUTHORIZED_ADMIN_EMAIL = 'eliteadmin@francisxavier.ac.in';

app.use(cors());
app.use(express.json());

// In-memory rate limiter for Admin Login (max 5 failed attempts per 15 minutes per IP)
const adminLoginAttempts = new Map();

function checkAdminRateLimit(ip) {
  const record = adminLoginAttempts.get(ip);
  if (!record) return { allowed: true };

  const now = Date.now();
  if (now - record.firstAttempt > 15 * 60 * 1000) {
    adminLoginAttempts.delete(ip);
    return { allowed: true };
  }

  if (record.count >= 5) {
    const minutesLeft = Math.ceil((15 * 60 * 1000 - (now - record.firstAttempt)) / 60000);
    return { 
      allowed: false, 
      message: `Too many failed administrator login attempts. Access temporarily restricted. Try again in ${minutesLeft} minute(s).` 
    };
  }

  return { allowed: true };
}

function recordAdminFailedAttempt(ip) {
  const now = Date.now();
  const record = adminLoginAttempts.get(ip) || { count: 0, firstAttempt: now };
  record.count += 1;
  adminLoginAttempts.set(ip, record);
}

function clearAdminRateLimit(ip) {
  adminLoginAttempts.delete(ip);
}

// ---------------------- TOKENS & MIDDLEWARE ----------------------

function generateStudentToken(team) {
  return jwt.sign(
    { 
      teamId: team.teamId, 
      email: team.email, 
      teamName: team.teamName,
      role: 'team_leader'
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function generateAdminToken(admin) {
  return jwt.sign(
    {
      adminId: admin.id,
      email: admin.email,
      role: admin.role || 'super_admin',
      mustChangePassword: Boolean(admin.mustChangePassword)
    },
    JWT_SECRET,
    { expiresIn: '12h' }
  );
}

// Student Authentication Middleware
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const team = isPostgresConnected() 
      ? await pgGetTeamById(decoded.teamId)
      : getTeamById(decoded.teamId);

    if (!team) {
      return res.status(404).json({ error: 'Registered team not found.' });
    }

    // Recheck approval status for protected student APIs
    const isApproved = ['APPROVED', 'Verified & Confirmed', 'CONFIRMED'].includes(team.status);
    if (!isApproved) {
      if (team.status === 'REJECTED') {
        return res.status(403).json({ error: 'Your team registration was rejected by the ELITEX organizing committee.' });
      }
      return res.status(403).json({ error: 'Your team registration is pending administrator approval.' });
    }

    req.team = team;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Session expired or invalid token.' });
  }
}

// Admin Authentication Middleware
async function authenticateAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Administrator authorization required.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin' && decoded.role !== 'super_admin') {
      return res.status(403).json({ error: 'Access denied: Valid administrator credentials required.' });
    }

    const admin = isPostgresConnected()
      ? await pgGetAdminById(decoded.adminId)
      : getAdminById(decoded.adminId);

    if (!admin) {
      return res.status(403).json({ error: 'Administrator account not found or access revoked.' });
    }

    req.admin = admin;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Administrator session expired or invalid token.' });
  }
}

// ---------------------- PUBLIC SYSTEM ROUTES ----------------------

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    event: 'ELITEX HACKATHON 2026',
    organizers: 'FXEC × ELITE BATCH 2025-29',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/db/health', async (req, res) => {
  const testRes = await testConnection();
  const config = getDatabaseConfig();
  res.json({
    connected: testRes.connected,
    engine: testRes.connected ? 'Neon PostgreSQL' : 'Local JSON Fallback',
    configMode: config ? (config.type === 'url' ? 'DATABASE_URL' : 'Individual Variables (PGHOST/PGUSER)') : 'None',
    database: testRes.database || null,
    error: testRes.connected ? null : (testRes.error || getPostgresError()),
    timestamp: new Date().toISOString()
  });
});

app.post('/api/db/test', async (req, res) => {
  const testRes = await testConnection();
  res.json(testRes);
});

// ---------------------- STUDENT AUTH & REGISTRATION ----------------------

app.get('/api/teams/status', async (req, res) => {
  try {
    const stats = isPostgresConnected() ? await pgGetTeamStats() : getTeamStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve team status.' });
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { teamName, email, password, confirmPassword } = req.body;

    if (!teamName || !email || !password || !confirmPassword) {
      return res.status(400).json({ 
        error: 'All fields (Team Name, Team Leader Email, Password, Confirm Password) are required.' 
      });
    }

    const trimmedTeamName = teamName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Password and Confirm Password do not match.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const stats = isPostgresConnected() ? await pgGetTeamStats() : getTeamStats();
    if (stats.isFull) {
      return res.status(400).json({ error: 'All 50 Team Slots Filled. Registration is now closed.' });
    }

    const existingEmail = isPostgresConnected() ? await pgGetTeamByEmail(normalizedEmail) : getTeamByEmail(normalizedEmail);
    if (existingEmail) {
      return res.status(400).json({ error: 'A team with this email address has already been registered.' });
    }

    const existingName = isPostgresConnected() ? await pgGetTeamByName(trimmedTeamName) : getTeamByName(trimmedTeamName);
    if (existingName) {
      return res.status(400).json({ error: `Team name "${trimmedTeamName}" is already taken. Please choose a unique team name.` });
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    let newTeam;
    if (isPostgresConnected()) {
      newTeam = await pgCreateTeam({ teamName: trimmedTeamName, email: normalizedEmail, passwordHash });
    } else {
      newTeam = createTeam({ teamName: trimmedTeamName, email: normalizedEmail, passwordHash });
    }

    const token = generateStudentToken(newTeam);
    const { passwordHash: _, ...sanitizedTeam } = newTeam;

    // Record audit log
    const auditData = {
      adminEmail: 'System',
      action: 'TEAM_REGISTERED',
      targetType: 'TEAM',
      targetId: newTeam.teamId,
      details: `Team ${newTeam.teamName} (${newTeam.teamId}) registered with leader email ${newTeam.email}. Status: PENDING_APPROVAL.`
    };
    if (isPostgresConnected()) await pgCreateAuditLog(auditData);
    else createAuditLog(auditData);

    res.status(201).json({
      success: true,
      message: `Registration submitted! Team ID ${sanitizedTeam.teamId} assigned to ${sanitizedTeam.teamName}. Awaiting administrator approval.`,
      team: sanitizedTeam,
      token,
      pendingApproval: true
    });

  } catch (err) {
    console.error('Error during team registration:', err);
    res.status(500).json({ error: err.message || 'Server error during team registration.' });
  }
});

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
      team = trimmed.toUpperCase().startsWith('ELITEFX')
        ? await pgGetTeamById(trimmed)
        : await pgGetTeamByEmail(trimmed.toLowerCase());
    } else {
      team = trimmed.toUpperCase().startsWith('ELITEFX')
        ? getTeamById(trimmed)
        : getTeamByEmail(trimmed.toLowerCase());
    }

    if (!team) {
      return res.status(401).json({ error: 'No registered team found with this ID or Email. Please register first.' });
    }

    const isMatch = bcrypt.compareSync(password, team.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Incorrect password. Access denied.' });
    }

    // Server-enforced approval check on student login
    const isApproved = ['APPROVED', 'Verified & Confirmed', 'CONFIRMED'].includes(team.status);
    if (!isApproved) {
      if (team.status === 'REJECTED') {
        return res.status(403).json({
          error: `Your team registration was rejected by the ELITEX organizing committee. Reason: ${team.rejectionReason || 'Requirements not met'}. Contact eliteadmin@francisxavier.ac.in for assistance.`,
          status: 'REJECTED'
        });
      }
      return res.status(403).json({
        error: 'Your team registration is pending approval by the ELITEX organizing committee. Please wait for the organizing committee to review and approve your registration.',
        status: 'PENDING_APPROVAL'
      });
    }

    const token = generateStudentToken(team);
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

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const { passwordHash: _, ...sanitizedTeam } = req.team;
  res.json({
    authenticated: true,
    team: sanitizedTeam
  });
});

// ---------------------- TEAM MEMBERS (TEAM DETAILS) ----------------------

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

// ---------------------- PRELIMS SLOTS ----------------------

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

// ---------------------- STUDENT ASSESSMENT EVALUATION ----------------------

app.post('/api/assessment/start', authenticateToken, async (req, res) => {
  try {
    const { registerNumber } = req.body;
    if (!registerNumber) return res.status(400).json({ error: 'Register Number is required.' });

    res.json({
      success: true,
      message: 'Assessment session started.',
      startedAt: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/assessment/submit', authenticateToken, async (req, res) => {
  try {
    const { registerNumber, answers, timeSpentSeconds } = req.body;
    if (!registerNumber) return res.status(400).json({ error: 'Register Number is required.' });

    const member = (req.team.members || []).find(m => m.registerNumber.toUpperCase() === registerNumber.trim().toUpperCase());
    const participantName = member ? member.name : 'Team Participant';

    const result = isPostgresConnected()
      ? await pgSaveAssessmentResult({
          teamId: req.team.teamId,
          registerNumber,
          participantName,
          answers,
          timeSpentSeconds
        })
      : saveAssessmentResult({
          teamId: req.team.teamId,
          registerNumber,
          participantName,
          answers,
          timeSpentSeconds
        });

    res.json({
      success: true,
      message: 'Assessment submitted and scored successfully.',
      result
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to submit assessment.' });
  }
});

app.post('/api/assessment/log-event', authenticateToken, async (req, res) => {
  try {
    const { registerNumber, eventType, description } = req.body;
    if (!registerNumber) return res.status(400).json({ error: 'Register Number required.' });

    const member = (req.team.members || []).find(m => m.registerNumber.toUpperCase() === registerNumber.trim().toUpperCase());
    const participantName = member ? member.name : 'Team Participant';

    const incidentData = {
      teamId: req.team.teamId,
      registerNumber,
      participantName,
      incidentType: eventType || 'SUSPICIOUS_ACTIVITY',
      description: description || 'Assessment event flagged by browser client',
      evidence: `Timestamp: ${new Date().toISOString()}`,
      recordedBy: 'Client Proctor'
    };

    const incident = isPostgresConnected()
      ? await pgCreateMalpracticeRecord(incidentData)
      : createMalpracticeRecord(incidentData);

    res.json({ success: true, incident });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================================================================
// SEPARATE ADMIN PANEL ENDPOINTS
// ==============================================================================

/**
 * Dedicated Admin Login
 */
app.post('/api/admin/login', async (req, res) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  // Rate Limiting Check
  const rateLimit = checkAdminRateLimit(clientIp);
  if (!rateLimit.allowed) {
    return res.status(429).json({ error: rateLimit.message });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Administrator Email and Password are required.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Verify authorized email
    if (normalizedEmail !== AUTHORIZED_ADMIN_EMAIL.toLowerCase()) {
      recordAdminFailedAttempt(clientIp);
      return res.status(401).json({ error: 'Unauthorized administrator email address.' });
    }

    const admin = isPostgresConnected()
      ? await pgGetAdminByEmail(normalizedEmail)
      : getAdminByEmail(normalizedEmail);

    if (!admin) {
      recordAdminFailedAttempt(clientIp);
      return res.status(401).json({ error: 'Administrator account not configured.' });
    }

    const isMatch = bcrypt.compareSync(password, admin.passwordHash);
    if (!isMatch) {
      recordAdminFailedAttempt(clientIp);
      return res.status(401).json({ error: 'Incorrect administrator password. Access denied.' });
    }

    // Clear rate limit counter upon successful login
    clearAdminRateLimit(clientIp);

    const token = generateAdminToken(admin);

    // Audit log
    const auditData = {
      adminEmail: admin.email,
      action: 'ADMIN_LOGIN',
      targetType: 'ADMIN',
      targetId: admin.id,
      details: `Administrator logged in from IP ${clientIp}.`
    };
    if (isPostgresConnected()) await pgCreateAuditLog(auditData);
    else createAuditLog(auditData);

    res.json({
      success: true,
      message: 'Administrator authentication successful.',
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        mustChangePassword: Boolean(admin.mustChangePassword)
      }
    });

  } catch (err) {
    console.error('Error in admin login:', err);
    res.status(500).json({ error: 'Internal server error during administrator login.' });
  }
});

/**
 * Verify current Admin Session
 */
app.get('/api/admin/me', authenticateAdmin, (req, res) => {
  res.json({
    authenticated: true,
    admin: {
      id: req.admin.id,
      email: req.admin.email,
      role: req.admin.role,
      mustChangePassword: Boolean(req.admin.mustChangePassword)
    }
  });
});

/**
 * Change Administrator Password
 */
app.post('/api/admin/change-password', authenticateAdmin, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: 'Current password, new password, and confirmation are required.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'New password and confirmation do not match.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters long.' });
    }

    const isMatch = bcrypt.compareSync(currentPassword, req.admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect. Verification failed.' });
    }

    const newHash = bcrypt.hashSync(newPassword, 10);

    const updatedAdmin = isPostgresConnected()
      ? await pgUpdateAdminPassword(req.admin.id, newHash)
      : updateAdminPassword(req.admin.id, newHash);

    // Audit log
    const auditData = {
      adminEmail: req.admin.email,
      action: 'ADMIN_PASSWORD_CHANGED',
      targetType: 'ADMIN',
      targetId: req.admin.id,
      details: 'Administrator successfully changed password.'
    };
    if (isPostgresConnected()) await pgCreateAuditLog(auditData);
    else createAuditLog(auditData);

    const freshToken = generateAdminToken({ ...updatedAdmin, mustChangePassword: false });

    res.json({
      success: true,
      message: 'Administrator password changed successfully.',
      token: freshToken,
      admin: {
        id: updatedAdmin.id,
        email: updatedAdmin.email,
        role: updatedAdmin.role,
        mustChangePassword: false
      }
    });

  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to update administrator password.' });
  }
});

/**
 * Admin Dashboard Live Overview Statistics
 */
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
  try {
    const stats = isPostgresConnected()
      ? await pgAdminGetDashboardStats()
      : adminGetDashboardStats();

    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to retrieve dashboard statistics.' });
  }
});

/**
 * Team Management: Get All Teams with Search & Filters
 */
app.get('/api/admin/teams', authenticateAdmin, async (req, res) => {
  try {
    const { search, status } = req.query;
    const teams = isPostgresConnected()
      ? await pgAdminGetAllTeams({ search, status })
      : adminGetAllTeams({ search, status });

    res.json({ success: true, count: teams.length, teams });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to retrieve teams.' });
  }
});

/**
 * Team Management: Get Team Details
 */
app.get('/api/admin/teams/:teamId', authenticateAdmin, async (req, res) => {
  try {
    const { teamId } = req.params;
    const team = isPostgresConnected()
      ? await pgGetTeamById(teamId)
      : getTeamById(teamId);

    if (!team) return res.status(404).json({ error: `Team ${teamId} not found.` });

    const { passwordHash: _, ...sanitized } = team;
    res.json({ success: true, team: sanitized });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to retrieve team details.' });
  }
});

/**
 * Team Management: Approve Team Registration
 */
app.post('/api/admin/teams/:teamId/approve', authenticateAdmin, async (req, res) => {
  try {
    const { teamId } = req.params;
    const approved = isPostgresConnected()
      ? await pgAdminApproveTeam(teamId)
      : adminApproveTeam(teamId);

    // Audit Log
    const auditData = {
      adminEmail: req.admin.email,
      action: 'TEAM_APPROVED',
      targetType: 'TEAM',
      targetId: teamId,
      details: `Administrator approved registration for Team ${approved.teamName} (${teamId}).`
    };
    if (isPostgresConnected()) await pgCreateAuditLog(auditData);
    else createAuditLog(auditData);

    res.json({
      success: true,
      message: `Team ${approved.teamName} (${teamId}) has been successfully approved!`,
      team: approved
    });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to approve team.' });
  }
});

/**
 * Team Management: Reject Team Registration
 */
app.post('/api/admin/teams/:teamId/reject', authenticateAdmin, async (req, res) => {
  try {
    const { teamId } = req.params;
    const { reason } = req.body;
    const rejected = isPostgresConnected()
      ? await pgAdminRejectTeam(teamId, reason)
      : adminRejectTeam(teamId, reason);

    // Audit Log
    const auditData = {
      adminEmail: req.admin.email,
      action: 'TEAM_REJECTED',
      targetType: 'TEAM',
      targetId: teamId,
      details: `Administrator rejected Team ${rejected.teamName} (${teamId}). Reason: ${reason || 'Not specified'}.`
    };
    if (isPostgresConnected()) await pgCreateAuditLog(auditData);
    else createAuditLog(auditData);

    res.json({
      success: true,
      message: `Team ${rejected.teamName} (${teamId}) has been rejected.`,
      team: rejected
    });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to reject team.' });
  }
});

/**
 * Team Management: Edit Team Details
 */
app.put('/api/admin/teams/:teamId', authenticateAdmin, async (req, res) => {
  try {
    const { teamId } = req.params;
    const updates = req.body;

    const updated = isPostgresConnected()
      ? await pgAdminUpdateTeam(teamId, updates)
      : adminUpdateTeam(teamId, updates);

    // Audit Log
    const auditData = {
      adminEmail: req.admin.email,
      action: 'TEAM_UPDATED',
      targetType: 'TEAM',
      targetId: teamId,
      details: `Administrator modified Team ${teamId} details.`
    };
    if (isPostgresConnected()) await pgCreateAuditLog(auditData);
    else createAuditLog(auditData);

    res.json({
      success: true,
      message: `Team ${teamId} updated successfully.`,
      team: updated
    });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to update team.' });
  }
});

/**
 * Team Management: Delete Team
 */
app.delete('/api/admin/teams/:teamId', authenticateAdmin, async (req, res) => {
  try {
    const { teamId } = req.params;
    const result = isPostgresConnected()
      ? await pgAdminDeleteTeam(teamId)
      : adminDeleteTeam(teamId);

    // Audit Log
    const auditData = {
      adminEmail: req.admin.email,
      action: 'TEAM_DELETED',
      targetType: 'TEAM',
      targetId: teamId,
      details: `Administrator deleted Team ${teamId}.`
    };
    if (isPostgresConnected()) await pgCreateAuditLog(auditData);
    else createAuditLog(auditData);

    res.json({
      success: true,
      message: `Team ${teamId} and associated records successfully removed.`,
      result
    });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to delete team.' });
  }
});

/**
 * Participant Management: Get All Participants with Filters
 */
app.get('/api/admin/participants', authenticateAdmin, async (req, res) => {
  try {
    const { search, teamId, slotId } = req.query;
    const participants = isPostgresConnected()
      ? await pgAdminGetAllParticipants({ search, teamId, slotId })
      : adminGetAllParticipants({ search, teamId, slotId });

    res.json({ success: true, count: participants.length, participants });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to retrieve participants.' });
  }
});

/**
 * Participant Management: Edit Participant
 */
app.put('/api/admin/participants/:registerNumber', authenticateAdmin, async (req, res) => {
  try {
    const { registerNumber } = req.params;
    const updates = req.body;

    const updated = isPostgresConnected()
      ? await pgAdminUpdateParticipant(registerNumber, updates)
      : adminUpdateParticipant(registerNumber, updates);

    // Audit Log
    const auditData = {
      adminEmail: req.admin.email,
      action: 'PARTICIPANT_UPDATED',
      targetType: 'PARTICIPANT',
      targetId: registerNumber,
      details: `Administrator updated participant ${registerNumber}.`
    };
    if (isPostgresConnected()) await pgCreateAuditLog(auditData);
    else createAuditLog(auditData);

    res.json({
      success: true,
      message: `Participant ${registerNumber} updated successfully.`,
      participant: updated
    });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to update participant.' });
  }
});

/**
 * Participant Management: Move Participant to Another Team
 */
app.post('/api/admin/participants/:registerNumber/move', authenticateAdmin, async (req, res) => {
  try {
    const { registerNumber } = req.params;
    const { targetTeamId } = req.body;

    if (!targetTeamId) return res.status(400).json({ error: 'Target Team ID is required.' });

    const result = isPostgresConnected()
      ? await pgAdminMoveParticipant(registerNumber, targetTeamId)
      : adminMoveParticipant(registerNumber, targetTeamId);

    // Audit Log
    const auditData = {
      adminEmail: req.admin.email,
      action: 'PARTICIPANT_MOVED',
      targetType: 'PARTICIPANT',
      targetId: registerNumber,
      details: `Administrator moved participant ${registerNumber} to Team ${targetTeamId}.`
    };
    if (isPostgresConnected()) await pgCreateAuditLog(auditData);
    else createAuditLog(auditData);

    res.json({
      success: true,
      message: `Participant ${registerNumber} transferred to Team ${targetTeamId} successfully.`,
      result
    });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to transfer participant.' });
  }
});

/**
 * Participant Management: Delete Participant
 */
app.delete('/api/admin/participants/:registerNumber', authenticateAdmin, async (req, res) => {
  try {
    const { registerNumber } = req.params;
    const result = isPostgresConnected()
      ? await pgAdminDeleteParticipant(registerNumber)
      : adminDeleteParticipant(registerNumber);

    // Audit Log
    const auditData = {
      adminEmail: req.admin.email,
      action: 'PARTICIPANT_DELETED',
      targetType: 'PARTICIPANT',
      targetId: registerNumber,
      details: `Administrator deleted participant ${registerNumber}.`
    };
    if (isPostgresConnected()) await pgCreateAuditLog(auditData);
    else createAuditLog(auditData);

    res.json({
      success: true,
      message: `Participant ${registerNumber} removed successfully.`,
      result
    });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to delete participant.' });
  }
});

/**
 * Slot Management: Get All Slot Bookings & Capacities
 */
app.get('/api/admin/slots', authenticateAdmin, async (req, res) => {
  try {
    const slots = isPostgresConnected() ? await pgGetSlotStats() : getSlotStats();
    const participants = isPostgresConnected()
      ? await pgAdminGetAllParticipants()
      : adminGetAllParticipants();

    res.json({
      success: true,
      date: 'Monday, 2 November 2026',
      timezone: 'Asia/Kolkata (IST)',
      slots,
      participants
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to retrieve slot bookings.' });
  }
});

/**
 * Slot Management: Reassign Slot
 */
app.post('/api/admin/slots/reassign', authenticateAdmin, async (req, res) => {
  try {
    const { registerNumber, newSlotId } = req.body;
    if (!registerNumber || !newSlotId) {
      return res.status(400).json({ error: 'Register Number and New Slot ID are required.' });
    }

    const result = isPostgresConnected()
      ? await pgAdminReassignSlot(registerNumber, newSlotId)
      : adminReassignSlot(registerNumber, newSlotId);

    // Audit Log
    const auditData = {
      adminEmail: req.admin.email,
      action: 'SLOT_REASSIGNED',
      targetType: 'SLOT',
      targetId: registerNumber,
      details: `Administrator reassigned participant ${registerNumber} to ${newSlotId}.`
    };
    if (isPostgresConnected()) await pgCreateAuditLog(auditData);
    else createAuditLog(auditData);

    res.json({
      success: true,
      message: `Participant ${registerNumber} reassigned to ${newSlotId} successfully.`,
      result
    });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to reassign slot.' });
  }
});

/**
 * Slot Management: Cancel Booking
 */
app.post('/api/admin/slots/cancel', authenticateAdmin, async (req, res) => {
  try {
    const { registerNumber } = req.body;
    if (!registerNumber) return res.status(400).json({ error: 'Register Number is required.' });

    const result = isPostgresConnected()
      ? await pgAdminCancelSlotBooking(registerNumber)
      : adminCancelSlotBooking(registerNumber);

    // Audit Log
    const auditData = {
      adminEmail: req.admin.email,
      action: 'SLOT_CANCELLED',
      targetType: 'SLOT',
      targetId: registerNumber,
      details: `Administrator cancelled slot booking for ${registerNumber}.`
    };
    if (isPostgresConnected()) await pgCreateAuditLog(auditData);
    else createAuditLog(auditData);

    res.json({
      success: true,
      message: `Slot booking cancelled for ${registerNumber}.`,
      result
    });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to cancel slot booking.' });
  }
});

/**
 * Assessment Results: Get All Results
 */
app.get('/api/admin/assessments', authenticateAdmin, async (req, res) => {
  try {
    const { search, status } = req.query;
    const results = isPostgresConnected()
      ? await pgAdminGetAssessmentResults({ search, status })
      : adminGetAssessmentResults({ search, status });

    res.json({ success: true, count: results.length, results });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to retrieve assessment results.' });
  }
});

/**
 * Malpractice Records: Get Records
 */
app.get('/api/admin/malpractice', authenticateAdmin, async (req, res) => {
  try {
    const { search, status } = req.query;
    const records = isPostgresConnected()
      ? await pgAdminGetMalpracticeRecords({ search, status })
      : adminGetMalpracticeRecords({ search, status });

    res.json({ success: true, count: records.length, records });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to retrieve malpractice records.' });
  }
});

/**
 * Malpractice Records: Log New Incident
 */
app.post('/api/admin/malpractice', authenticateAdmin, async (req, res) => {
  try {
    const { teamId, registerNumber, participantName, incidentType, description, evidence } = req.body;
    if (!registerNumber || !incidentType) {
      return res.status(400).json({ error: 'Register Number and Incident Type are required.' });
    }

    const record = isPostgresConnected()
      ? await pgCreateMalpracticeRecord({
          teamId,
          registerNumber,
          participantName,
          incidentType,
          description,
          evidence,
          recordedBy: req.admin.email
        })
      : createMalpracticeRecord({
          teamId,
          registerNumber,
          participantName,
          incidentType,
          description,
          evidence,
          recordedBy: req.admin.email
        });

    // Audit Log
    const auditData = {
      adminEmail: req.admin.email,
      action: 'MALPRACTICE_RECORDED',
      targetType: 'MALPRACTICE',
      targetId: registerNumber,
      details: `Administrator recorded ${incidentType} incident for ${registerNumber}.`
    };
    if (isPostgresConnected()) await pgCreateAuditLog(auditData);
    else createAuditLog(auditData);

    res.json({ success: true, message: 'Malpractice incident recorded successfully.', record });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to log malpractice incident.' });
  }
});

/**
 * Malpractice Records: Update Review Status / Action Taken
 */
app.put('/api/admin/malpractice/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = isPostgresConnected()
      ? await pgUpdateMalpracticeRecord(id, updates)
      : updateMalpracticeRecord(id, updates);

    // Audit Log
    const auditData = {
      adminEmail: req.admin.email,
      action: 'MALPRACTICE_UPDATED',
      targetType: 'MALPRACTICE',
      targetId: id,
      details: `Administrator updated incident ${id} status to ${updates.status || 'unchanged'}.`
    };
    if (isPostgresConnected()) await pgCreateAuditLog(auditData);
    else createAuditLog(auditData);

    res.json({ success: true, message: 'Incident record updated successfully.', record: updated });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to update malpractice record.' });
  }
});

/**
 * Audit Logs: View Audit Trail
 */
app.get('/api/admin/audit-logs', authenticateAdmin, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '100', 10);
    const logs = isPostgresConnected()
      ? await pgAdminGetAuditLogs(limit)
      : adminGetAuditLogs(limit);

    res.json({ success: true, count: logs.length, logs });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to retrieve audit logs.' });
  }
});

/**
 * Announcements: Get Announcements
 */
app.get('/api/admin/announcements', authenticateAdmin, async (req, res) => {
  try {
    const announcements = isPostgresConnected()
      ? await pgAdminGetAnnouncements()
      : adminGetAnnouncements();

    res.json({ success: true, count: announcements.length, announcements });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Failed to retrieve announcements.' });
  }
});

/**
 * Announcements: Broadcast Announcement
 */
app.post('/api/admin/announcements', authenticateAdmin, async (req, res) => {
  try {
    const { title, message, priority } = req.body;
    if (!title || !message) return res.status(400).json({ error: 'Title and Message are required.' });

    const announcement = isPostgresConnected()
      ? await pgCreateAnnouncement({ title, message, priority, createdBy: req.admin.email })
      : createAnnouncement({ title, message, priority, createdBy: req.admin.email });

    res.json({ success: true, message: 'Announcement broadcasted successfully.', announcement });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to broadcast announcement.' });
  }
});

/**
 * Announcements: Delete Announcement
 */
app.delete('/api/admin/announcements/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = isPostgresConnected()
      ? await pgDeleteAnnouncement(id)
      : deleteAnnouncement(id);

    res.json({ success: true, message: 'Announcement deleted.', result });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Failed to delete announcement.' });
  }
});

// Start Express Server
app.listen(PORT, async () => {
  console.log(`\n==================================================`);
  console.log(`[ELITEX HACKATHON 2026] Backend Server Active`);
  console.log(`Port: http://localhost:${PORT}`);
  console.log(`Organised by: ELITE BATCH 2025-29 (FXEC)`);
  console.log(`Admin Portal: eliteadmin@francisxavier.ac.in`);
  console.log(`Sequential Team ID Capacity: 50 Teams (ELITEFX001 - ELITEFX050)`);
  console.log(`==================================================\n`);

  // Initialize PostgreSQL connection & migrations
  const pgInit = await initPostgres();
  if (pgInit.success) {
    const existingJsonTeams = getAllTeams();
    await migrateFromJSON(existingJsonTeams);
  }
});
