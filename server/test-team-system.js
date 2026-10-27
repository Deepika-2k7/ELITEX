/**
 * ELITEX Hackathon 2026 - Verification Suite for Team System, Slot Locking & Admin Login
 */

const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('==================================================');
  console.log('STARTING ELITEX TEAM SYSTEM & ADMIN VERIFICATION');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  // 1. ADMIN LOGIN VERIFICATION
  try {
    const adminRes = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'eliteadmin@francisxavier.ac.in',
        password: 'elitexadmin'
      })
    });
    const adminData = await adminRes.json();
    assert(adminRes.ok && adminData.token, 'Configured Admin logs in successfully with elitexadmin');
    assert(adminData.admin?.email === 'eliteadmin@francisxavier.ac.in', 'Admin email matches eliteadmin@francisxavier.ac.in');
    assert(adminData.admin?.mustChangePassword === true, 'Admin has mustChangePassword flag set for first login');
  } catch (err) {
    assert(false, `Admin login error: ${err.message}`);
  }

  // 2. CREATE TEAM WORKFLOW (With Leader as Member #1)
  const uniqueSuffix = Date.now();
  const testTeamName = `QUANTUM_LEAP_${uniqueSuffix}`;
  const testLeaderEmail = `leader_${uniqueSuffix}@francisxavier.ac.in`;
  const leaderReg = `950721${String(uniqueSuffix).slice(-6)}`;
  let createdTeam = null;
  let teamCode = null;

  try {
    const createRes = await fetch(`${BASE_URL}/api/teams/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teamName: testTeamName,
        email: testLeaderEmail,
        password: 'password123',
        confirmPassword: 'password123',
        leaderDetails: {
          name: 'Captain Quantum',
          registerNumber: leaderReg,
          email: testLeaderEmail,
          department: 'Computer Science & Engineering',
          year: '3rd Year',
          phone: '9876543210'
        }
      })
    });
    const createData = await createRes.json();
    assert(createRes.ok, 'Team creation succeeds with 201 Created');
    assert(createData.team && createData.team.teamId, `Assigned sequential Team ID: ${createData.team?.teamId}`);
    assert(/^\d{6}$/.test(createData.teamCode), `Generated valid 6-digit numeric Team Code: ${createData.teamCode}`);
    assert(createData.team.members.length === 1, `Leader is included in member roster (1/4 members)`);
    assert(createData.team.members[0].isLeader === true, `Member #1 marked as Leader`);

    createdTeam = createData.team;
    teamCode = createData.teamCode;
  } catch (err) {
    assert(false, `Create team error: ${err.message}`);
  }

  // 3. PREVIEW TEAM BY 6-DIGIT CODE
  try {
    const previewRes = await fetch(`${BASE_URL}/api/teams/preview-code/${teamCode}`);
    const previewData = await previewRes.json();
    assert(previewRes.ok, 'Team code preview endpoint returns 200 OK');
    assert(previewData.teamName === testTeamName, 'Preview matches created team name');
    assert(previewData.currentMembers === 1, 'Preview shows 1 member present');
    assert(previewData.remainingSlots === 3, 'Preview shows 3 slots remaining');
    assert(previewData.isFull === false, 'Preview shows squad is NOT full');
  } catch (err) {
    assert(false, `Preview code error: ${err.message}`);
  }

  // 4. INVALID CODE REJECTION
  try {
    const invalidRes = await fetch(`${BASE_URL}/api/teams/preview-code/000000`);
    assert(invalidRes.status === 404, 'Invalid 6-digit code returns 404 Not Found');
  } catch (err) {
    assert(false, `Invalid code test error: ${err.message}`);
  }

  // 5. JOIN TEAM (Add Member #2, #3, #4)
  try {
    for (let i = 2; i <= 4; i++) {
      const memReg = `950721${String(uniqueSuffix + i).slice(-6)}`;
      const joinRes = await fetch(`${BASE_URL}/api/teams/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamCode: teamCode,
          name: `Operative ${i}`,
          registerNumber: memReg,
          email: `op${i}_${uniqueSuffix}@francisxavier.ac.in`,
          department: 'Information Technology',
          year: '3rd Year',
          phone: `987654320${i}`
        })
      });
      const joinData = await joinRes.json();
      assert(joinRes.ok, `Operative #${i} successfully joins team using 6-digit code`);
      assert(joinData.team.members.length === i, `Roster count updated to ${i}/4 members`);
    }
  } catch (err) {
    assert(false, `Join team error: ${err.message}`);
  }

  // 6. ENFORCE TEAM FULL (5th Member Join Attempt Must Be Rejected)
  try {
    const fullRes = await fetch(`${BASE_URL}/api/teams/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teamCode: teamCode,
        name: 'Excess Member 5',
        registerNumber: `950721999999`,
        email: `excess_${uniqueSuffix}@francisxavier.ac.in`,
        department: 'Artificial Intelligence',
        year: '3rd Year',
        phone: '9876543299'
      })
    });
    const fullData = await fullRes.json();
    assert(fullRes.status === 400, '5th member join rejected with 400 Bad Request');
    assert(fullData.error.includes('TEAM FULL'), `Error message indicates TEAM FULL: "${fullData.error}"`);
  } catch (err) {
    assert(false, `Team full test error: ${err.message}`);
  }

  // 7. DUPLICATE STUDENT JOIN REJECTION
  try {
    const dupRes = await fetch(`${BASE_URL}/api/teams/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teamCode: teamCode,
        name: 'Duplicate Leader',
        registerNumber: leaderReg,
        email: testLeaderEmail,
        department: 'Computer Science',
        year: '3rd Year',
        phone: '9876543210'
      })
    });
    assert(dupRes.status === 400, 'Duplicate member registration rejected');
  } catch (err) {
    assert(false, `Duplicate test error: ${err.message}`);
  }

  // 8. PHASE 1 SLOT BOOKING & LOCK VERIFICATION
  try {
    // Login as team leader to get student token
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: createdTeam.teamId,
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();

    // First, approve the team using admin token so student can perform actions if approval required
    const adminLoginRes = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'eliteadmin@francisxavier.ac.in',
        password: 'elitexadmin'
      })
    });
    const adminToken = (await adminLoginRes.json()).token;

    await fetch(`${BASE_URL}/api/admin/teams/${createdTeam.teamId}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    const studentToken = (await (await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: createdTeam.teamId, password: 'password123' })
    })).json()).token;

    // Step A: Book Slot-1
    const bookRes = await fetch(`${BASE_URL}/api/slots/book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        registerNumber: leaderReg,
        slotId: 'slot-1'
      })
    });
    const bookData = await bookRes.json();
    assert(bookRes.ok, `Leader successfully books slot-1`);

    // Step B: Attempt to change to Slot-2 -> MUST BE BLOCKED
    const changeRes = await fetch(`${BASE_URL}/api/slots/book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        registerNumber: leaderReg,
        slotId: 'slot-2'
      })
    });
    const changeData = await changeRes.json();
    assert(changeRes.status === 400, 'Student attempt to change confirmed slot rejected with 400 Bad Request');
    assert(
      changeData.error === 'YOUR PHASE 1 SLOT IS CONFIRMED. SLOT CHANGES ARE NOT PERMITTED.',
      `Exact required error returned: "${changeData.error}"`
    );

    // Step C: Confirming the same slot again returns existing booking idempotently
    const reconfirmRes = await fetch(`${BASE_URL}/api/slots/book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`
      },
      body: JSON.stringify({
        registerNumber: leaderReg,
        slotId: 'slot-1'
      })
    });
    assert(reconfirmRes.ok, 'Reconfirming the exact same slot is accepted idempotently without error');

  } catch (err) {
    assert(false, `Slot locking error: ${err.message}`);
  }

  console.log('\n==================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================\n');

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runTests();
