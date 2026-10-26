import pg from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { gradeAssessment } from './data/questions.js';

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

const { Pool } = pg;

export const OFFICIAL_SLOTS = [
  { id: 'slot-1', slotNumber: 1, time: '9:30 AM – 10:30 AM', date: 'Monday, 2 November 2026', totalCapacity: 50 },
  { id: 'slot-2', slotNumber: 2, time: '11:00 AM – 12:00 PM', date: 'Monday, 2 November 2026', totalCapacity: 50 },
  { id: 'slot-3', slotNumber: 3, time: '1:30 PM – 2:30 PM', date: 'Monday, 2 November 2026', totalCapacity: 50 },
  { id: 'slot-4', slotNumber: 4, time: '2:45 PM – 3:45 PM', date: 'Monday, 2 November 2026', totalCapacity: 50 }
];

let pool = null;
let isConnected = false;
let connectionError = null;

/**
 * Sanitize error messages to prevent exposing credentials or passwords in logs
 */
export function sanitizeErrorMessage(message) {
  if (!message || typeof message !== 'string') return 'Unknown database error';
  return message
    .replace(/(postgres(?:ql)?:\/\/[^:]+:)(?:.*)(@[a-zA-Z0-9.-]+)/gi, '$1***$2')
    .replace(/(password[=:]\s*)[^\s;&]+/gi, '$1***');
}

/**
 * Resolve database configuration from DATABASE_URL or individual PG* variables
 */
export function getDatabaseConfig() {
  const dbUrl = (process.env.DATABASE_URL || '').trim();
  const host = (process.env.PGHOST || process.env.PG_HOST || '').trim();
  const database = (process.env.PGDATABASE || process.env.PG_DATABASE || process.env.PGNAME || 'neondb').trim();
  const user = (process.env.PGUSER || process.env.PG_USER || '').trim();
  const password = process.env.PGPASSWORD || process.env.PG_PASSWORD || '';
  const port = parseInt(process.env.PGPORT || process.env.PG_PORT || '5432', 10);

  // 1. Connection string provided
  if (dbUrl) {
    return {
      type: 'url',
      connectionString: dbUrl,
      ssl: {
        rejectUnauthorized: false
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    };
  }

  // 2. Individual parameters provided (PGHOST, PGUSER, PGPASSWORD)
  if (user || host || password) {
    return {
      type: 'params',
      user: user || undefined,
      password: password || undefined,
      host: host || undefined,
      database: database || 'neondb',
      port: isNaN(port) ? 5432 : port,
      ssl: {
        rejectUnauthorized: false
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    };
  }

  return null;
}

/**
 * Initialize or get PostgreSQL connection pool with Neon SSL
 */
export function getPool(forceNew = false) {
  const config = getDatabaseConfig();
  if (!config) {
    return null;
  }

  if (forceNew && pool) {
    pool.end().catch(() => {});
    pool = null;
  }

  if (!pool) {
    const { type, ...poolOptions } = config;
    pool = new Pool(poolOptions);

    pool.on('error', (err) => {
      console.error('[POSTGRES POOL ERROR]', sanitizeErrorMessage(err.message));
    });
  }

  return pool;
}

/**
 * Execute a safe database connection test (e.g. SELECT 1)
 */
export async function testConnection() {
  const config = getDatabaseConfig();
  if (!config) {
    return {
      connected: false,
      error: 'No database credentials configured in .env (provide DATABASE_URL or PGHOST, PGUSER, PGPASSWORD).'
    };
  }

  if (config.type === 'params' && !config.host) {
    return {
      connected: false,
      error: 'PGHOST is missing. In Neon, PGHOST (e.g. ep-xxxxxx.us-east-2.aws.neon.tech) is required to connect.'
    };
  }

  const currentPool = getPool();
  if (!currentPool) {
    return {
      connected: false,
      error: 'Unable to initialize PostgreSQL connection pool.'
    };
  }

  let client = null;
  try {
    client = await currentPool.connect();
    const result = await client.query('SELECT 1 AS alive, NOW() AS server_time, current_database() AS db_name, version() AS pg_version;');
    return {
      connected: true,
      database: result.rows[0]?.db_name,
      serverTime: result.rows[0]?.server_time,
      version: result.rows[0]?.pg_version
    };
  } catch (err) {
    return {
      connected: false,
      error: sanitizeErrorMessage(err.message)
    };
  } finally {
    if (client) client.release();
  }
}

/**
 * Test connectivity & run schema migrations safely
 */
export async function initPostgres() {
  const config = getDatabaseConfig();
  if (!config) {
    connectionError = 'Database credentials not configured in .env';
    console.warn(`\n[POSTGRES NOTICE] ${connectionError}`);
    console.warn(`Configure DATABASE_URL or (PGHOST, PGDATABASE, PGUSER, PGPASSWORD) in .env to connect to Neon.\n`);
    return { success: false, error: connectionError };
  }

  if (config.type === 'params' && !config.host) {
    connectionError = 'PGHOST is missing. Neon requires a remote host (e.g. ep-xxxxxx.aws.neon.tech).';
    console.warn(`\n[POSTGRES NOTICE] ${connectionError}\n`);
    return { success: false, error: connectionError };
  }

  try {
    const testResult = await testConnection();
    if (!testResult.connected) {
      throw new Error(testResult.error);
    }

    isConnected = true;
    connectionError = null;

    console.log(`\n==================================================`);
    console.log(`[NEON POSTGRESQL CONNECTED]`);
    console.log(`Database: ${testResult.database}`);
    console.log(`Timestamp: ${testResult.serverTime}`);
    console.log(`SSL: Enabled (Encrypted)`);
    console.log(`==================================================\n`);

    // Run schema migrations safely (DDL with IF NOT EXISTS)
    await runMigrations();

    return { 
      success: true, 
      database: testResult.database, 
      timestamp: testResult.serverTime 
    };
  } catch (err) {
    isConnected = false;
    connectionError = sanitizeErrorMessage(err.message);
    console.error(`\n[NEON POSTGRESQL CONNECTION FAILED]`, connectionError);
    return { success: false, error: connectionError };
  }
}

/**
 * Run safe DDL migrations to create required tables and seed official slots
 */
export async function runMigrations() {
  const currentPool = getPool();
  if (!currentPool) return;

  const client = await currentPool.connect();
  try {
    await client.query('BEGIN;');

    // 1. Teams Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS teams (
        team_id VARCHAR(10) PRIMARY KEY,
        team_name VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        squad_size INT DEFAULT 4,
        status VARCHAR(50) DEFAULT 'Verified & Confirmed',
        reward_points INT DEFAULT 100,
        role VARCHAR(50) DEFAULT 'team_leader',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Team Members Table (Strictly associated with team_id, unique register_number)
    await client.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id VARCHAR(60) PRIMARY KEY,
        team_id VARCHAR(10) NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        register_number VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL,
        year VARCHAR(50) NOT NULL,
        department VARCHAR(255) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        is_leader BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Official Slots Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS slots (
        slot_id VARCHAR(20) PRIMARY KEY,
        slot_number INT NOT NULL,
        time_display VARCHAR(100) NOT NULL,
        event_date VARCHAR(100) NOT NULL,
        max_capacity INT DEFAULT 50
      );
    `);

    // 4. Prelims Slot Bookings Table (1 active slot booking per member)
    await client.query(`
      CREATE TABLE IF NOT EXISTS slot_bookings (
        id SERIAL PRIMARY KEY,
        team_id VARCHAR(10) NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
        member_id VARCHAR(60) NOT NULL REFERENCES team_members(id) ON DELETE CASCADE,
        register_number VARCHAR(50) NOT NULL UNIQUE,
        slot_id VARCHAR(20) NOT NULL REFERENCES slots(slot_id) ON DELETE CASCADE,
        status VARCHAR(50) DEFAULT 'CONFIRMED',
        booked_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Seed the 4 official prelims slots for 2 Nov 2026
    for (const slot of OFFICIAL_SLOTS) {
      await client.query(`
        INSERT INTO slots (slot_id, slot_number, time_display, event_date, max_capacity)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (slot_id) DO UPDATE SET
          slot_number = EXCLUDED.slot_number,
          time_display = EXCLUDED.time_display,
          event_date = EXCLUDED.event_date,
          max_capacity = EXCLUDED.max_capacity;
      `, [slot.id, slot.slotNumber, slot.time, slot.date, slot.totalCapacity]);
    }

    // 6. Schema updates on Teams table for approvals
    await client.query(`
      ALTER TABLE teams ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
      ALTER TABLE teams ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
    `);

    // 7. Admins Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id VARCHAR(60) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role VARCHAR(50) DEFAULT 'super_admin',
        must_change_password BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 8. Assessment Results Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS assessment_results (
        id SERIAL PRIMARY KEY,
        team_id VARCHAR(10) NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
        register_number VARCHAR(50) NOT NULL UNIQUE,
        participant_name VARCHAR(255) NOT NULL,
        score INT DEFAULT 0,
        total_questions INT DEFAULT 12,
        max_score INT DEFAULT 12,
        percentage NUMERIC(5, 2) DEFAULT 0,
        time_spent_seconds INT DEFAULT 0,
        started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        submitted_at TIMESTAMPTZ,
        status VARCHAR(50) DEFAULT 'IN_PROGRESS'
      );
    `);

    // 9. Malpractice Records Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS malpractice_records (
        id SERIAL PRIMARY KEY,
        team_id VARCHAR(10) NOT NULL REFERENCES teams(team_id) ON DELETE CASCADE,
        register_number VARCHAR(50) NOT NULL,
        participant_name VARCHAR(255) NOT NULL,
        incident_type VARCHAR(100) NOT NULL,
        description TEXT,
        evidence TEXT,
        status VARCHAR(50) DEFAULT 'UNDER_REVIEW',
        action_taken VARCHAR(255) DEFAULT 'None',
        admin_notes TEXT,
        recorded_by VARCHAR(100) DEFAULT 'System',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 10. Audit Logs Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        admin_email VARCHAR(255) NOT NULL,
        action VARCHAR(100) NOT NULL,
        target_type VARCHAR(50),
        target_id VARCHAR(100),
        details TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 11. Announcements Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        priority VARCHAR(50) DEFAULT 'NORMAL',
        created_by VARCHAR(255) DEFAULT 'Admin',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 12. Idempotently Seed Initial Admin
    const ADMIN_EMAIL = 'eliteadmin@francisxavier.ac.in';
    const INITIAL_PASSWORD = 'elitexadmin';
    const adminCheck = await client.query('SELECT id FROM admins WHERE LOWER(email) = $1;', [ADMIN_EMAIL.toLowerCase()]);
    if (adminCheck.rows.length === 0) {
      const passwordHash = bcrypt.hashSync(INITIAL_PASSWORD, 10);
      await client.query(`
        INSERT INTO admins (id, email, password_hash, role, must_change_password)
        VALUES ($1, $2, $3, 'super_admin', TRUE);
      `, [`admin-${Date.now()}`, ADMIN_EMAIL, passwordHash]);
      console.log(`[POSTGRES SEED] Initial administrator account initialized (${ADMIN_EMAIL}).`);
    } else {
      console.log(`[POSTGRES SEED] Administrator account exists (${ADMIN_EMAIL}) — preserving existing credentials.`);
    }

    await client.query('COMMIT;');
    console.log('[POSTGRES MIGRATIONS] All database tables verified and slots seeded successfully.');
  } catch (err) {
    await client.query('ROLLBACK;');
    console.error('[POSTGRES MIGRATION ERROR]', err);
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Check if PostgreSQL is connected
 */
export function isPostgresConnected() {
  return isConnected;
}

export function getPostgresError() {
  return connectionError;
}

// ---------------------- POSTGRES DATABASE OPERATIONS ----------------------

/**
 * Get Team by ID (includes members and their booked slots)
 */
export async function pgGetTeamById(teamId) {
  const currentPool = getPool();
  if (!currentPool) return null;

  const normalizedId = teamId.trim().toUpperCase();

  const teamRes = await currentPool.query(`
    SELECT 
      team_id as "teamId",
      team_name as "teamName",
      email,
      password_hash as "passwordHash",
      squad_size as "squadSize",
      status,
      reward_points as "rewardPoints",
      role,
      created_at as "registeredAt"
    FROM teams
    WHERE team_id = $1;
  `, [normalizedId]);

  if (teamRes.rows.length === 0) return null;
  const team = teamRes.rows[0];

  // Fetch members and their slot bookings
  const membersRes = await currentPool.query(`
    SELECT 
      m.id,
      m.name,
      m.register_number as "registerNumber",
      m.email,
      m.year,
      m.department,
      m.phone,
      m.is_leader as "isLeader",
      m.updated_at as "updatedAt",
      b.slot_id as "slotId",
      s.time_display as "slotTime",
      b.booked_at as "slotBookedAt"
    FROM team_members m
    LEFT JOIN slot_bookings b ON m.register_number = b.register_number
    LEFT JOIN slots s ON b.slot_id = s.slot_id
    WHERE m.team_id = $1
    ORDER BY m.is_leader DESC, m.created_at ASC;
  `, [normalizedId]);

  team.members = membersRes.rows;
  return team;
}

/**
 * Get Team by Email
 */
export async function pgGetTeamByEmail(email) {
  const currentPool = getPool();
  if (!currentPool) return null;

  const normalizedEmail = email.trim().toLowerCase();
  const res = await currentPool.query(`
    SELECT 
      team_id as "teamId",
      team_name as "teamName",
      email,
      password_hash as "passwordHash",
      squad_size as "squadSize",
      status,
      reward_points as "rewardPoints",
      role,
      created_at as "registeredAt"
    FROM teams
    WHERE LOWER(email) = $1;
  `, [normalizedEmail]);

  if (res.rows.length === 0) return null;
  return await pgGetTeamById(res.rows[0].teamId);
}

/**
 * Get Team by Name
 */
export async function pgGetTeamByName(name) {
  const currentPool = getPool();
  if (!currentPool) return null;

  const normalizedName = name.trim().toLowerCase();
  const res = await currentPool.query(`
    SELECT team_id as "teamId"
    FROM teams
    WHERE LOWER(team_name) = $1;
  `, [normalizedName]);

  if (res.rows.length === 0) return null;
  return await pgGetTeamById(res.rows[0].teamId);
}

/**
 * Get Team Stats (Total registered, slots remaining, next ID)
 */
export async function pgGetTeamStats() {
  const currentPool = getPool();
  if (!currentPool) return { totalRegistered: 0, maxTeams: 50, slotsRemaining: 50, isFull: false, nextTeamId: 'ELITEFX001' };

  const res = await currentPool.query(`SELECT COUNT(*)::int as total FROM teams;`);
  const total = res.rows[0].total;
  const maxTeams = 50;

  return {
    totalRegistered: total,
    maxTeams,
    slotsRemaining: Math.max(0, maxTeams - total),
    isFull: total >= maxTeams,
    nextTeamId: total < maxTeams ? `ELITEFX${String(total + 1).padStart(3, '0')}` : null
  };
}

/**
 * Atomically create a new team with sequential Team ID (ELITEFX001 - ELITEFX050)
 * Uses concurrency-safe transaction with advisory lock
 */
export async function pgCreateTeam({ teamName, email, passwordHash }) {
  const currentPool = getPool();
  if (!currentPool) throw new Error('Database connection not available');

  const client = await currentPool.connect();
  try {
    await client.query('BEGIN;');

    // Advisory lock to guarantee zero duplicate sequential IDs under high concurrency
    await client.query('SELECT pg_advisory_xact_lock(2026);');

    // 1. Check capacity
    const countRes = await client.query('SELECT COUNT(*)::int as count FROM teams;');
    const currentCount = countRes.rows[0].count;

    if (currentCount >= 50) {
      const err = new Error('All 50 Team Slots Filled');
      err.code = 'SLOTS_FULL';
      throw err;
    }

    const normalizedName = teamName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // 2. Check duplicates
    const dupCheck = await client.query(`
      SELECT 
        EXISTS(SELECT 1 FROM teams WHERE LOWER(email) = $1) as email_exists,
        EXISTS(SELECT 1 FROM teams WHERE LOWER(team_name) = $2) as name_exists;
    `, [normalizedEmail, normalizedName.toLowerCase()]);

    if (dupCheck.rows[0].email_exists) {
      const err = new Error('A team with this email address has already been registered.');
      err.code = 'DUPLICATE_EMAIL';
      throw err;
    }

    if (dupCheck.rows[0].name_exists) {
      const err = new Error(`Team name "${normalizedName}" is already taken. Please choose another name.`);
      err.code = 'DUPLICATE_NAME';
      throw err;
    }

    // 3. Sequential Team ID
    const nextSeq = currentCount + 1;
    const teamId = `ELITEFX${String(nextSeq).padStart(3, '0')}`;

    const insertRes = await client.query(`
      INSERT INTO teams (
        team_id, team_name, email, password_hash, squad_size, status, reward_points, role
      )
      VALUES ($1, $2, $3, $4, 4, 'PENDING_APPROVAL', 100, 'team_leader')
      RETURNING 
        team_id as "teamId",
        team_name as "teamName",
        email,
        password_hash as "passwordHash",
        squad_size as "squadSize",
        status,
        reward_points as "rewardPoints",
        role,
        created_at as "registeredAt";
    `, [teamId, normalizedName, normalizedEmail, passwordHash]);

    await client.query('COMMIT;');

    const newTeam = insertRes.rows[0];
    newTeam.members = [];
    return newTeam;

  } catch (err) {
    await client.query('ROLLBACK;');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Update Team Members (Strictly max 4 members total, including leader)
 */
export async function pgUpdateTeamMembers(teamId, memberList) {
  if (!Array.isArray(memberList)) {
    throw new Error('Member list must be an array.');
  }

  if (memberList.length > 4) {
    throw new Error('A team cannot have more than 4 members in total, including the team leader.');
  }

  const currentPool = getPool();
  if (!currentPool) throw new Error('Database connection not available');

  const client = await currentPool.connect();
  try {
    await client.query('BEGIN;');

    const normalizedTeamId = teamId.trim().toUpperCase();

    // Check team exists
    const teamCheck = await client.query('SELECT team_id, team_name FROM teams WHERE team_id = $1;', [normalizedTeamId]);
    if (teamCheck.rows.length === 0) {
      throw new Error(`Team with ID ${teamId} not found.`);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;
    const seenRegsInTeam = new Set();
    const sanitizedList = [];

    // Validate members
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

      if (seenRegsInTeam.has(registerNumber)) {
        throw new Error(`Duplicate Register Number "${registerNumber}" entered within the team.`);
      }
      seenRegsInTeam.add(registerNumber);

      // Check duplicate register number across all other teams
      const regDup = await client.query(`
        SELECT t.team_name, t.team_id 
        FROM team_members tm
        JOIN teams t ON tm.team_id = t.team_id
        WHERE tm.register_number = $1 AND tm.team_id != $2;
      `, [registerNumber, normalizedTeamId]);

      if (regDup.rows.length > 0) {
        throw new Error(`Register Number "${registerNumber}" is already registered by Team ${regDup.rows[0].team_name} (${regDup.rows[0].team_id}).`);
      }

      sanitizedList.push({
        id: m.id || `mem-${Date.now()}-${i}`,
        teamId: normalizedTeamId,
        name,
        registerNumber,
        email,
        year,
        department,
        phone,
        isLeader
      });
    }

    // Delete existing members for this team not in the updated list
    const incomingIds = sanitizedList.map(m => m.id);
    if (incomingIds.length > 0) {
      await client.query(`
        DELETE FROM team_members 
        WHERE team_id = $1 AND id NOT IN (${incomingIds.map((_, idx) => `$${idx + 2}`).join(',')});
      `, [normalizedTeamId, ...incomingIds]);
    } else {
      await client.query(`DELETE FROM team_members WHERE team_id = $1;`, [normalizedTeamId]);
    }

    // Upsert members
    for (const m of sanitizedList) {
      await client.query(`
        INSERT INTO team_members (
          id, team_id, name, register_number, email, year, department, phone, is_leader, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
        ON CONFLICT (register_number) DO UPDATE SET
          name = EXCLUDED.name,
          email = EXCLUDED.email,
          year = EXCLUDED.year,
          department = EXCLUDED.department,
          phone = EXCLUDED.phone,
          is_leader = EXCLUDED.is_leader,
          updated_at = CURRENT_TIMESTAMP;
      `, [m.id, m.teamId, m.name, m.registerNumber, m.email, m.year, m.department, m.phone, m.isLeader]);
    }

    await client.query('COMMIT;');
    return await pgGetTeamById(normalizedTeamId);

  } catch (err) {
    await client.query('ROLLBACK;');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Get Live Slot Availability Statistics across all 4 slots
 */
export async function pgGetSlotStats() {
  const currentPool = getPool();
  if (!currentPool) return OFFICIAL_SLOTS;

  const res = await currentPool.query(`
    SELECT 
      s.slot_id as "id",
      s.slot_number as "slotNumber",
      s.time_display as "time",
      s.event_date as "date",
      s.max_capacity as "totalCapacity",
      COUNT(b.id)::int as "bookedCount"
    FROM slots s
    LEFT JOIN slot_bookings b ON s.slot_id = b.slot_id
    GROUP BY s.slot_id, s.slot_number, s.time_display, s.event_date, s.max_capacity
    ORDER BY s.slot_number ASC;
  `);

  return res.rows.map(slot => ({
    ...slot,
    remainingCount: Math.max(0, slot.totalCapacity - slot.bookedCount),
    isAvailable: (slot.totalCapacity - slot.bookedCount) > 0
  }));
}

/**
 * Concurrency-Safe Member Slot Booking with Row-Level Locking
 */
export async function pgBookMemberSlot(teamId, registerNumber, slotId) {
  const currentPool = getPool();
  if (!currentPool) throw new Error('Database connection not available');

  const normalizedSlot = (slotId || '').trim().toLowerCase();
  const normalizedReg = registerNumber.trim().toUpperCase();
  const normalizedTeamId = teamId.trim().toUpperCase();

  const client = await currentPool.connect();
  try {
    await client.query('BEGIN;');

    // 1. Lock the slot row for update to ensure concurrency safety
    const slotRes = await client.query(`
      SELECT slot_id, slot_number, time_display, max_capacity 
      FROM slots 
      WHERE slot_id = $1 
      FOR UPDATE;
    `, [normalizedSlot]);

    if (slotRes.rows.length === 0) {
      throw new Error(`Invalid Slot ID "${slotId}". Must be slot-1, slot-2, slot-3, or slot-4.`);
    }

    const slotDef = slotRes.rows[0];

    // 2. Verify member exists in this team
    const memberRes = await client.query(`
      SELECT id, name, register_number, team_id
      FROM team_members 
      WHERE register_number = $1 AND team_id = $2;
    `, [normalizedReg, normalizedTeamId]);

    if (memberRes.rows.length === 0) {
      throw new Error(`Member with Register Number "${registerNumber}" not found in your team. Please add member in Team Details first.`);
    }

    const member = memberRes.rows[0];

    // 3. Check if member already booked this exact slot
    const existingBooking = await client.query(`
      SELECT slot_id FROM slot_bookings WHERE register_number = $1;
    `, [normalizedReg]);

    if (existingBooking.rows.length > 0 && existingBooking.rows[0].slot_id === normalizedSlot) {
      await client.query('COMMIT;');
      const updatedTeam = await pgGetTeamById(normalizedTeamId);
      const slots = await pgGetSlotStats();
      return { team: updatedTeam, member, slots };
    }

    // 4. Check slot capacity (max 50)
    const countRes = await client.query(`
      SELECT COUNT(*)::int as count 
      FROM slot_bookings 
      WHERE slot_id = $1;
    `, [normalizedSlot]);

    const currentBookedCount = countRes.rows[0].count;
    if (currentBookedCount >= slotDef.max_capacity) {
      throw new Error(`Slot ${slotDef.slot_number} (${slotDef.time_display}) is completely full (50/50 bookings). Please choose an available slot.`);
    }

    // 5. Upsert booking (single active slot per register number)
    await client.query(`
      INSERT INTO slot_bookings (team_id, member_id, register_number, slot_id, status, booked_at)
      VALUES ($1, $2, $3, $4, 'CONFIRMED', CURRENT_TIMESTAMP)
      ON CONFLICT (register_number) DO UPDATE SET
        slot_id = EXCLUDED.slot_id,
        status = 'CONFIRMED',
        booked_at = CURRENT_TIMESTAMP;
    `, [normalizedTeamId, member.id, normalizedReg, normalizedSlot]);

    await client.query('COMMIT;');

    const updatedTeam = await pgGetTeamById(normalizedTeamId);
    const slots = await pgGetSlotStats();

    return {
      team: updatedTeam,
      member: {
        ...member,
        slotId: normalizedSlot,
        slotTime: slotDef.time_display
      },
      slots
    };

  } catch (err) {
    await client.query('ROLLBACK;');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Migrate existing teams from JSON storage into PostgreSQL if not already present
 */
export async function migrateFromJSON(jsonTeams) {
  if (!Array.isArray(jsonTeams) || jsonTeams.length === 0) return;
  const currentPool = getPool();
  if (!currentPool) return;

  console.log(`[POSTGRES MIGRATION] Checking for un-migrated JSON teams (${jsonTeams.length} total)...`);

  for (const t of jsonTeams) {
    try {
      const existing = await pgGetTeamById(t.teamId);
      if (!existing) {
        console.log(`[POSTGRES MIGRATION] Migrating team ${t.teamId} (${t.teamName})...`);
        await currentPool.query(`
          INSERT INTO teams (team_id, team_name, email, password_hash, squad_size, status, reward_points, role, created_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (team_id) DO NOTHING;
        `, [
          t.teamId,
          t.teamName,
          t.email,
          t.passwordHash,
          t.squadSize || 4,
          t.status || 'Verified & Confirmed',
          t.rewardPoints || 100,
          t.role || 'team_leader',
          t.registeredAt || new Date().toISOString()
        ]);

        if (Array.isArray(t.members) && t.members.length > 0) {
          for (const m of t.members) {
            await currentPool.query(`
              INSERT INTO team_members (id, team_id, name, register_number, email, year, department, phone, is_leader)
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
              ON CONFLICT (register_number) DO NOTHING;
            `, [
              m.id || `mem-${Date.now()}`,
              t.teamId,
              m.name,
              m.registerNumber,
              m.email,
              m.year,
              m.department,
              m.phone,
              m.isLeader || false
            ]);

            if (m.slotId) {
              await currentPool.query(`
                INSERT INTO slot_bookings (team_id, member_id, register_number, slot_id, status, booked_at)
                VALUES ($1, $2, $3, $4, 'CONFIRMED', $5)
                ON CONFLICT (register_number) DO NOTHING;
              `, [t.teamId, m.id, m.registerNumber, m.slotId, m.slotBookedAt || new Date().toISOString()]);
            }
          }
        }
      }
    } catch (migErr) {
      console.warn(`[POSTGRES MIGRATION WARNING] Skipping team ${t.teamId}:`, migErr.message);
    }
  }

  console.log('[POSTGRES MIGRATION] JSON migration verification complete.');
}

// ==============================================================================
// POSTGRESQL ADMIN OPERATIONS
// ==============================================================================

export async function pgGetAdminByEmail(email) {
  const currentPool = getPool();
  if (!currentPool) return null;

  const res = await currentPool.query(`
    SELECT id, email, password_hash as "passwordHash", role, must_change_password as "mustChangePassword", created_at as "createdAt", updated_at as "updatedAt"
    FROM admins
    WHERE LOWER(email) = $1;
  `, [(email || '').trim().toLowerCase()]);

  return res.rows[0] || null;
}

export async function pgGetAdminById(id) {
  const currentPool = getPool();
  if (!currentPool) return null;

  const res = await currentPool.query(`
    SELECT id, email, password_hash as "passwordHash", role, must_change_password as "mustChangePassword", created_at as "createdAt", updated_at as "updatedAt"
    FROM admins
    WHERE id = $1;
  `, [id]);

  return res.rows[0] || null;
}

export async function pgUpdateAdminPassword(adminId, newPasswordHash) {
  const currentPool = getPool();
  if (!currentPool) throw new Error('Database connection not available');

  const res = await currentPool.query(`
    UPDATE admins
    SET password_hash = $1, must_change_password = FALSE, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING id, email, role, must_change_password as "mustChangePassword", updated_at as "updatedAt";
  `, [newPasswordHash, adminId]);

  if (res.rows.length === 0) throw new Error('Administrator account not found.');
  return res.rows[0];
}

export async function pgAdminGetDashboardStats() {
  const currentPool = getPool();
  if (!currentPool) return null;

  const teamCountRes = await currentPool.query(`
    SELECT 
      COUNT(*)::int as total,
      COUNT(*) FILTER (WHERE status = 'APPROVED' OR status = 'Verified & Confirmed')::int as approved,
      COUNT(*) FILTER (WHERE status = 'PENDING_APPROVAL' OR status IS NULL)::int as pending,
      COUNT(*) FILTER (WHERE status = 'REJECTED')::int as rejected
    FROM teams;
  `);

  const participantCountRes = await currentPool.query(`SELECT COUNT(*)::int as total FROM team_members;`);
  const slotStats = await pgGetSlotStats();

  const assessCountRes = await currentPool.query(`
    SELECT 
      COUNT(*)::int as total,
      COUNT(*) FILTER (WHERE status = 'COMPLETED')::int as completed
    FROM assessment_results;
  `);

  const malCountRes = await currentPool.query(`
    SELECT COUNT(*)::int as flagged
    FROM malpractice_records
    WHERE status = 'CONFIRMED' OR status = 'UNDER_REVIEW';
  `);

  const tc = teamCountRes.rows[0];
  const totalParticipants = participantCountRes.rows[0].total;
  const completedAssessments = assessCountRes.rows[0].completed;

  return {
    totalTeams: tc.total,
    maxTeams: 50,
    totalParticipants,
    pendingApprovals: tc.pending,
    approvedTeams: tc.approved,
    rejectedTeams: tc.rejected,
    slots: slotStats,
    completedAssessments,
    awaitingAssessments: Math.max(0, totalParticipants - completedAssessments),
    availableResults: assessCountRes.rows[0].total,
    flaggedMalpractice: malCountRes.rows[0].flagged
  };
}

export async function pgAdminGetAllTeams({ search = '', status = '' } = {}) {
  const currentPool = getPool();
  if (!currentPool) return [];

  let query = `
    SELECT 
      t.team_id as "teamId",
      t.team_name as "teamName",
      t.email,
      t.squad_size as "squadSize",
      t.status,
      t.reward_points as "rewardPoints",
      t.role,
      t.created_at as "registeredAt",
      t.approved_at as "approvedAt",
      t.rejection_reason as "rejectionReason",
      COUNT(tm.id)::int as "membersCount",
      COUNT(sb.id)::int as "slotsBookedCount",
      COUNT(ar.id) FILTER (WHERE ar.status = 'COMPLETED')::int as "assessmentCompletedCount"
    FROM teams t
    LEFT JOIN team_members tm ON t.team_id = tm.team_id
    LEFT JOIN slot_bookings sb ON tm.register_number = sb.register_number
    LEFT JOIN assessment_results ar ON tm.register_number = ar.register_number
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    params.push(`%${search.trim().toLowerCase()}%`);
    query += ` AND (LOWER(t.team_id) LIKE $${params.length} OR LOWER(t.team_name) LIKE $${params.length} OR LOWER(t.email) LIKE $${params.length})`;
  }

  if (status) {
    if (status === 'APPROVED') {
      query += ` AND (t.status = 'APPROVED' OR t.status = 'Verified & Confirmed')`;
    } else {
      params.push(status);
      query += ` AND t.status = $${params.length}`;
    }
  }

  query += `
    GROUP BY t.team_id, t.team_name, t.email, t.squad_size, t.status, t.reward_points, t.role, t.created_at, t.approved_at, t.rejection_reason
    ORDER BY t.created_at ASC;
  `;

  const res = await currentPool.query(query, params);

  // Attach members for detailed display
  for (const team of res.rows) {
    const memRes = await currentPool.query(`
      SELECT 
        m.id, m.name, m.register_number as "registerNumber", m.email, m.year, m.department, m.phone, m.is_leader as "isLeader",
        sb.slot_id as "slotId", s.time_display as "slotTime"
      FROM team_members m
      LEFT JOIN slot_bookings sb ON m.register_number = sb.register_number
      LEFT JOIN slots s ON sb.slot_id = s.slot_id
      WHERE m.team_id = $1
      ORDER BY m.is_leader DESC, m.created_at ASC;
    `, [team.teamId]);
    team.members = memRes.rows;
  }

  return res.rows;
}

export async function pgAdminApproveTeam(teamId) {
  const currentPool = getPool();
  if (!currentPool) throw new Error('Database connection not available');

  const res = await currentPool.query(`
    UPDATE teams
    SET status = 'APPROVED', approved_at = CURRENT_TIMESTAMP
    WHERE team_id = $1
    RETURNING team_id as "teamId", team_name as "teamName", email, status, approved_at as "approvedAt";
  `, [teamId.trim().toUpperCase()]);

  if (res.rows.length === 0) throw new Error(`Team ${teamId} not found.`);
  return res.rows[0];
}

export async function pgAdminRejectTeam(teamId, reason = 'Registration requirements not met') {
  const currentPool = getPool();
  if (!currentPool) throw new Error('Database connection not available');

  const res = await currentPool.query(`
    UPDATE teams
    SET status = 'REJECTED', rejection_reason = $1
    WHERE team_id = $2
    RETURNING team_id as "teamId", team_name as "teamName", email, status, rejection_reason as "rejectionReason";
  `, [reason, teamId.trim().toUpperCase()]);

  if (res.rows.length === 0) throw new Error(`Team ${teamId} not found.`);
  return res.rows[0];
}

export async function pgAdminUpdateTeam(teamId, updates) {
  const currentPool = getPool();
  if (!currentPool) throw new Error('Database connection not available');

  const normalizedId = teamId.trim().toUpperCase();

  if (updates.teamName) {
    const dup = await currentPool.query(`SELECT team_id FROM teams WHERE LOWER(team_name) = $1 AND team_id != $2;`, [updates.teamName.trim().toLowerCase(), normalizedId]);
    if (dup.rows.length > 0) throw new Error(`Team name "${updates.teamName}" is already taken.`);
  }

  if (updates.email) {
    const dup = await currentPool.query(`SELECT team_id FROM teams WHERE LOWER(email) = $1 AND team_id != $2;`, [updates.email.trim().toLowerCase(), normalizedId]);
    if (dup.rows.length > 0) throw new Error(`Email "${updates.email}" is already used by another team.`);
  }

  const res = await currentPool.query(`
    UPDATE teams
    SET 
      team_name = COALESCE($1, team_name),
      email = COALESCE($2, email),
      status = COALESCE($3, status),
      updated_at = CURRENT_TIMESTAMP
    WHERE team_id = $4
    RETURNING team_id as "teamId", team_name as "teamName", email, status, updated_at as "updatedAt";
  `, [updates.teamName?.trim(), updates.email?.trim().toLowerCase(), updates.status, normalizedId]);

  if (res.rows.length === 0) throw new Error(`Team ${teamId} not found.`);
  return res.rows[0];
}

export async function pgAdminDeleteTeam(teamId) {
  const currentPool = getPool();
  if (!currentPool) throw new Error('Database connection not available');

  const normalizedId = teamId.trim().toUpperCase();
  const res = await currentPool.query(`
    DELETE FROM teams
    WHERE team_id = $1
    RETURNING team_id as "teamId", team_name as "teamName";
  `, [normalizedId]);

  if (res.rows.length === 0) throw new Error(`Team ${teamId} not found.`);
  return { success: true, deletedTeam: res.rows[0] };
}

export async function pgAdminGetAllParticipants({ search = '', teamId = '', slotId = '' } = {}) {
  const currentPool = getPool();
  if (!currentPool) return [];

  let query = `
    SELECT 
      m.id,
      m.name,
      m.register_number as "registerNumber",
      m.email,
      m.year,
      m.department,
      m.phone,
      m.is_leader as "isLeader",
      m.team_id as "teamId",
      t.team_name as "teamName",
      t.status as "teamStatus",
      sb.slot_id as "slotId",
      s.time_display as "slotTime",
      ar.status as "assessmentStatus",
      ar.score,
      ar.max_score as "maxScore",
      ar.percentage,
      COUNT(mp.id)::int as "malpracticeCount"
    FROM team_members m
    JOIN teams t ON m.team_id = t.team_id
    LEFT JOIN slot_bookings sb ON m.register_number = sb.register_number
    LEFT JOIN slots s ON sb.slot_id = s.slot_id
    LEFT JOIN assessment_results ar ON m.register_number = ar.register_number
    LEFT JOIN malpractice_records mp ON m.register_number = mp.register_number
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    params.push(`%${search.trim().toLowerCase()}%`);
    query += ` AND (LOWER(m.name) LIKE $${params.length} OR LOWER(m.register_number) LIKE $${params.length} OR LOWER(m.email) LIKE $${params.length} OR LOWER(m.team_id) LIKE $${params.length} OR LOWER(t.team_name) LIKE $${params.length})`;
  }

  if (teamId) {
    params.push(teamId.trim().toUpperCase());
    query += ` AND m.team_id = $${params.length}`;
  }

  if (slotId) {
    params.push(slotId.trim().toLowerCase());
    query += ` AND sb.slot_id = $${params.length}`;
  }

  query += `
    GROUP BY m.id, m.name, m.register_number, m.email, m.year, m.department, m.phone, m.is_leader, m.team_id, t.team_name, t.status, sb.slot_id, s.time_display, ar.status, ar.score, ar.max_score, ar.percentage
    ORDER BY m.team_id ASC, m.is_leader DESC;
  `;

  const res = await currentPool.query(query, params);
  return res.rows.map(r => ({
    ...r,
    assessmentStatus: r.assessmentStatus || 'NOT_STARTED',
    hasMalpractice: r.malpracticeCount > 0
  }));
}

export async function pgAdminUpdateParticipant(registerNumber, updates) {
  const currentPool = getPool();
  if (!currentPool) throw new Error('Database connection not available');

  const normalizedReg = registerNumber.trim().toUpperCase();

  const res = await currentPool.query(`
    UPDATE team_members
    SET 
      name = COALESCE($1, name),
      email = COALESCE($2, email),
      phone = COALESCE($3, phone),
      year = COALESCE($4, year),
      department = COALESCE($5, department),
      is_leader = COALESCE($6, is_leader),
      updated_at = CURRENT_TIMESTAMP
    WHERE register_number = $7
    RETURNING id, team_id as "teamId", name, register_number as "registerNumber", email, year, department, phone, is_leader as "isLeader", updated_at as "updatedAt";
  `, [
    updates.name?.trim(),
    updates.email?.trim().toLowerCase(),
    updates.phone?.trim(),
    updates.year?.trim(),
    updates.department?.trim(),
    updates.isLeader !== undefined ? Boolean(updates.isLeader) : null,
    normalizedReg
  ]);

  if (res.rows.length === 0) throw new Error(`Participant with Register Number "${registerNumber}" not found.`);
  return res.rows[0];
}

export async function pgAdminMoveParticipant(registerNumber, targetTeamId) {
  const currentPool = getPool();
  if (!currentPool) throw new Error('Database connection not available');

  const normalizedReg = registerNumber.trim().toUpperCase();
  const normalizedTargetTeam = targetTeamId.trim().toUpperCase();

  const client = await currentPool.connect();
  try {
    await client.query('BEGIN;');

    const memRes = await client.query(`SELECT team_id FROM team_members WHERE register_number = $1;`, [normalizedReg]);
    if (memRes.rows.length === 0) throw new Error(`Participant ${registerNumber} not found.`);

    if (memRes.rows[0].team_id === normalizedTargetTeam) throw new Error(`Participant is already in Team ${targetTeamId}.`);

    const targetTeamRes = await client.query(`
      SELECT t.team_id, t.team_name, COUNT(tm.id)::int as count
      FROM teams t
      LEFT JOIN team_members tm ON t.team_id = tm.team_id
      WHERE t.team_id = $1
      GROUP BY t.team_id, t.team_name;
    `, [normalizedTargetTeam]);

    if (targetTeamRes.rows.length === 0) throw new Error(`Target Team ${targetTeamId} not found.`);
    if (targetTeamRes.rows[0].count >= 4) throw new Error(`Target Team ${targetTeamRes.rows[0].team_name} already has 4 members.`);

    await client.query(`
      UPDATE team_members
      SET team_id = $1, is_leader = FALSE, updated_at = CURRENT_TIMESTAMP
      WHERE register_number = $2;
    `, [normalizedTargetTeam, normalizedReg]);

    await client.query(`
      UPDATE slot_bookings
      SET team_id = $1
      WHERE register_number = $2;
    `, [normalizedTargetTeam, normalizedReg]);

    await client.query(`
      UPDATE assessment_results
      SET team_id = $1
      WHERE register_number = $2;
    `, [normalizedTargetTeam, normalizedReg]);

    await client.query('COMMIT;');
    return { success: true, registerNumber, targetTeam: normalizedTargetTeam };

  } catch (err) {
    await client.query('ROLLBACK;');
    throw err;
  } finally {
    client.release();
  }
}

export async function pgAdminDeleteParticipant(registerNumber) {
  const currentPool = getPool();
  if (!currentPool) throw new Error('Database connection not available');

  const normalizedReg = registerNumber.trim().toUpperCase();
  const res = await currentPool.query(`
    DELETE FROM team_members
    WHERE register_number = $1
    RETURNING register_number as "registerNumber", name, team_id as "teamId";
  `, [normalizedReg]);

  if (res.rows.length === 0) throw new Error(`Participant with Register Number "${registerNumber}" not found.`);
  return { success: true, participant: res.rows[0] };
}

export async function pgAdminReassignSlot(registerNumber, newSlotId) {
  const currentPool = getPool();
  if (!currentPool) throw new Error('Database connection not available');

  const normalizedSlot = (newSlotId || '').trim().toLowerCase();
  const normalizedReg = registerNumber.trim().toUpperCase();

  const memRes = await currentPool.query(`SELECT team_id FROM team_members WHERE register_number = $1;`, [normalizedReg]);
  if (memRes.rows.length === 0) throw new Error(`Participant ${registerNumber} not found.`);

  return await pgBookMemberSlot(memRes.rows[0].team_id, normalizedReg, normalizedSlot);
}

export async function pgAdminCancelSlotBooking(registerNumber) {
  const currentPool = getPool();
  if (!currentPool) throw new Error('Database connection not available');

  const normalizedReg = registerNumber.trim().toUpperCase();
  const res = await currentPool.query(`
    DELETE FROM slot_bookings
    WHERE register_number = $1
    RETURNING register_number as "registerNumber", slot_id as "slotId";
  `, [normalizedReg]);

  if (res.rows.length === 0) throw new Error(`No booking found for Register Number ${registerNumber}.`);
  const slots = await pgGetSlotStats();
  return { success: true, cancelled: res.rows[0], slots };
}

export async function pgAdminGetAssessmentResults({ search = '', status = '' } = {}) {
  const currentPool = getPool();
  if (!currentPool) return [];

  let query = `
    SELECT 
      ar.id,
      ar.team_id as "teamId",
      t.team_name as "teamName",
      ar.register_number as "registerNumber",
      ar.participant_name as "participantName",
      ar.score,
      ar.total_questions as "totalQuestions",
      ar.max_score as "maxScore",
      ar.percentage,
      ar.time_spent_seconds as "timeSpentSeconds",
      ar.started_at as "startedAt",
      ar.submitted_at as "submittedAt",
      ar.status,
      sb.slot_id as "slotId",
      s.time_display as "slotTime"
    FROM assessment_results ar
    JOIN teams t ON ar.team_id = t.team_id
    LEFT JOIN slot_bookings sb ON ar.register_number = sb.register_number
    LEFT JOIN slots s ON sb.slot_id = s.slot_id
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    params.push(`%${search.trim().toLowerCase()}%`);
    query += ` AND (LOWER(ar.register_number) LIKE $${params.length} OR LOWER(ar.participant_name) LIKE $${params.length} OR LOWER(ar.team_id) LIKE $${params.length} OR LOWER(t.team_name) LIKE $${params.length})`;
  }

  if (status) {
    params.push(status);
    query += ` AND ar.status = $${params.length}`;
  }

  query += ` ORDER BY ar.submitted_at DESC NULLS LAST, ar.started_at DESC;`;

  const res = await currentPool.query(query, params);
  return res.rows;
}

export async function pgSaveAssessmentResult({ teamId, registerNumber, participantName, answers, timeSpentSeconds }) {
  const currentPool = getPool();
  if (!currentPool) throw new Error('Database connection not available');

  const normalizedReg = registerNumber.trim().toUpperCase();
  const normalizedTeam = teamId.trim().toUpperCase();
  const grading = gradeAssessment(answers);

  const res = await currentPool.query(`
    INSERT INTO assessment_results (
      team_id, register_number, participant_name, score, total_questions, max_score, percentage, time_spent_seconds, started_at, submitted_at, status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'COMPLETED')
    ON CONFLICT (register_number) DO UPDATE SET
      score = EXCLUDED.score,
      total_questions = EXCLUDED.total_questions,
      max_score = EXCLUDED.max_score,
      percentage = EXCLUDED.percentage,
      time_spent_seconds = EXCLUDED.time_spent_seconds,
      submitted_at = CURRENT_TIMESTAMP,
      status = 'COMPLETED'
    RETURNING 
      id, team_id as "teamId", register_number as "registerNumber", participant_name as "participantName",
      score, total_questions as "totalQuestions", max_score as "maxScore", percentage,
      time_spent_seconds as "timeSpentSeconds", started_at as "startedAt", submitted_at as "submittedAt", status;
  `, [normalizedTeam, normalizedReg, participantName || 'Participant', grading.score, grading.totalQuestions, grading.maxScore, grading.percentage, timeSpentSeconds || 0]);

  return res.rows[0];
}

export async function pgAdminGetMalpracticeRecords({ search = '', status = '' } = {}) {
  const currentPool = getPool();
  if (!currentPool) return [];

  let query = `
    SELECT 
      mp.id,
      mp.team_id as "teamId",
      t.team_name as "teamName",
      mp.register_number as "registerNumber",
      mp.participant_name as "participantName",
      mp.incident_type as "incidentType",
      mp.description,
      mp.evidence,
      mp.status,
      mp.action_taken as "actionTaken",
      mp.admin_notes as "adminNotes",
      mp.recorded_by as "recordedBy",
      mp.created_at as "createdAt",
      mp.updated_at as "updatedAt"
    FROM malpractice_records mp
    LEFT JOIN teams t ON mp.team_id = t.team_id
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    params.push(`%${search.trim().toLowerCase()}%`);
    query += ` AND (LOWER(mp.register_number) LIKE $${params.length} OR LOWER(mp.participant_name) LIKE $${params.length} OR LOWER(mp.team_id) LIKE $${params.length} OR LOWER(mp.incident_type) LIKE $${params.length})`;
  }

  if (status) {
    params.push(status);
    query += ` AND mp.status = $${params.length}`;
  }

  query += ` ORDER BY mp.created_at DESC;`;

  const res = await currentPool.query(query, params);
  return res.rows;
}

export async function pgCreateMalpracticeRecord({ teamId, registerNumber, participantName, incidentType, description, evidence, recordedBy }) {
  const currentPool = getPool();
  if (!currentPool) throw new Error('Database connection not available');

  const res = await currentPool.query(`
    INSERT INTO malpractice_records (
      team_id, register_number, participant_name, incident_type, description, evidence, status, action_taken, recorded_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, 'UNDER_REVIEW', 'None', $7)
    RETURNING 
      id, team_id as "teamId", register_number as "registerNumber", participant_name as "participantName",
      incident_type as "incidentType", description, evidence, status, action_taken as "actionTaken",
      admin_notes as "adminNotes", recorded_by as "recordedBy", created_at as "createdAt", updated_at as "updatedAt";
  `, [
    (teamId || '').toUpperCase(),
    (registerNumber || '').toUpperCase(),
    participantName || 'Participant',
    incidentType || 'SUSPICIOUS_ACTIVITY',
    description || '',
    evidence || '',
    recordedBy || 'System'
  ]);

  return res.rows[0];
}

export async function pgUpdateMalpracticeRecord(incidentId, { status, actionTaken, adminNotes }) {
  const currentPool = getPool();
  if (!currentPool) throw new Error('Database connection not available');

  const res = await currentPool.query(`
    UPDATE malpractice_records
    SET 
      status = COALESCE($1, status),
      action_taken = COALESCE($2, action_taken),
      admin_notes = COALESCE($3, admin_notes),
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $4
    RETURNING 
      id, team_id as "teamId", register_number as "registerNumber", participant_name as "participantName",
      incident_type as "incidentType", description, evidence, status, action_taken as "actionTaken",
      admin_notes as "adminNotes", recorded_by as "recordedBy", created_at as "createdAt", updated_at as "updatedAt";
  `, [status, actionTaken, adminNotes, parseInt(incidentId, 10)]);

  if (res.rows.length === 0) throw new Error(`Malpractice record "${incidentId}" not found.`);
  return res.rows[0];
}

export async function pgAdminGetAuditLogs(limit = 100) {
  const currentPool = getPool();
  if (!currentPool) return [];

  const res = await currentPool.query(`
    SELECT id, admin_email as "adminEmail", action, target_type as "targetType", target_id as "targetId", details, created_at as "createdAt"
    FROM audit_logs
    ORDER BY created_at DESC
    LIMIT $1;
  `, [limit]);

  return res.rows;
}

export async function pgCreateAuditLog({ adminEmail, action, targetType, targetId, details }) {
  const currentPool = getPool();
  if (!currentPool) return;

  await currentPool.query(`
    INSERT INTO audit_logs (admin_email, action, target_type, target_id, details)
    VALUES ($1, $2, $3, $4, $5);
  `, [adminEmail || 'Admin', action, targetType || 'SYSTEM', targetId || null, details || '']);
}

export async function pgAdminGetAnnouncements() {
  const currentPool = getPool();
  if (!currentPool) return [];

  const res = await currentPool.query(`
    SELECT id, title, message, priority, created_by as "createdBy", created_at as "createdAt"
    FROM announcements
    ORDER BY created_at DESC;
  `);

  return res.rows;
}

export async function pgCreateAnnouncement({ title, message, priority = 'NORMAL', createdBy = 'Admin' }) {
  const currentPool = getPool();
  if (!currentPool) throw new Error('Database connection not available');

  const res = await currentPool.query(`
    INSERT INTO announcements (title, message, priority, created_by)
    VALUES ($1, $2, $3, $4)
    RETURNING id, title, message, priority, created_by as "createdBy", created_at as "createdAt";
  `, [(title || '').trim(), (message || '').trim(), priority, createdBy]);

  return res.rows[0];
}

export async function pgDeleteAnnouncement(id) {
  const currentPool = getPool();
  if (!currentPool) throw new Error('Database connection not available');

  await currentPool.query(`DELETE FROM announcements WHERE id = $1;`, [parseInt(id, 10)]);
  return { success: true };
}

