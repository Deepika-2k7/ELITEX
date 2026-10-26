import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

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
 * Initialize PostgreSQL connection pool with Neon SSL
 */
export function getPool() {
  const dbUrl = process.env.DATABASE_URL?.trim();
  if (!dbUrl) {
    return null;
  }

  if (!pool) {
    pool = new Pool({
      connectionString: dbUrl,
      ssl: {
        rejectUnauthorized: false
      },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000
    });

    pool.on('error', (err) => {
      console.error('[POSTGRES POOL ERROR]', err.message);
    });
  }

  return pool;
}

/**
 * Test connectivity & run schema migrations safely
 */
export async function initPostgres() {
  const currentPool = getPool();
  if (!currentPool) {
    connectionError = 'DATABASE_URL environment variable is not configured in .env';
    console.warn(`\n[POSTGRES NOTICE] ${connectionError}`);
    console.warn(`Configure DATABASE_URL=<neon_connection_string> in .env to connect to Neon.\n`);
    return { success: false, error: connectionError };
  }

  try {
    // 1. Test basic connectivity
    const client = await currentPool.connect();
    const testResult = await client.query('SELECT NOW() AS current_time, current_database() AS db_name, version() AS pg_version;');
    client.release();

    isConnected = true;
    connectionError = null;

    console.log(`\n==================================================`);
    console.log(`[NEON POSTGRESQL CONNECTED]`);
    console.log(`Database: ${testResult.rows[0].db_name}`);
    console.log(`Timestamp: ${testResult.rows[0].current_time}`);
    console.log(`SSL: Enabled (Encrypted)`);
    console.log(`==================================================\n`);

    // 2. Run schema migrations
    await runMigrations();

    return { 
      success: true, 
      database: testResult.rows[0].db_name, 
      timestamp: testResult.rows[0].current_time 
    };
  } catch (err) {
    isConnected = false;
    connectionError = err.message;
    console.error(`\n[NEON POSTGRESQL CONNECTION FAILED]`, err.message);
    console.error(`Ensure DATABASE_URL in .env has valid Neon credentials and sslmode=require.\n`);
    return { success: false, error: err.message };
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
      VALUES ($1, $2, $3, $4, 4, 'Verified & Confirmed', 100, 'team_leader')
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
