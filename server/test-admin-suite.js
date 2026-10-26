// Comprehensive End-to-End Test Suite for ELITEX Hackathon Admin Panel

const BASE_URL = 'http://localhost:5000';

async function runTests() {
  console.log('==================================================');
  console.log('STARTING ELITEX ADMIN PANEL VERIFICATION SUITE');
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

  // TEST 1: Unauthorized Admin Login (Wrong Email)
  try {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'hacker@example.com', password: 'randompassword' })
    });
    assert(res.status === 401, 'Unauthorized admin email is rejected with 401');
  } catch (err) {
    assert(false, `Test 1 threw error: ${err.message}`);
  }

  // TEST 2: Wrong Password for Authorized Email
  try {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'eliteadmin@francisxavier.ac.in', password: 'wrongpassword' })
    });
    assert(res.status === 401, 'Wrong password for authorized admin is rejected with 401');
  } catch (err) {
    assert(false, `Test 2 threw error: ${err.message}`);
  }

  // TEST 3: Successful Initial Admin Login
  let adminToken = '';
  try {
    const res = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'eliteadmin@francisxavier.ac.in', password: 'elitexadmin' })
    });
    const data = await res.json();
    assert(res.status === 200 && data.token, 'Authorized admin logins successfully and receives JWT token');
    assert(data.admin.email === 'eliteadmin@francisxavier.ac.in', 'Admin email matches configured account');
    assert(data.admin.mustChangePassword === true, 'First-login flag mustChangePassword is TRUE for default password');
    adminToken = data.token;
  } catch (err) {
    assert(false, `Test 3 threw error: ${err.message}`);
  }

  // TEST 4: Admin API Endpoint Protection (Unauthenticated & Student)
  try {
    const unauth = await fetch(`${BASE_URL}/api/admin/teams`);
    assert(unauth.status === 401, 'Admin endpoint without token rejected with 401');

    // Register student to get student token
    const studentReg = await fetch(`${BASE_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teamName: `ALPHA_TEST_${Date.now()}`,
        email: `alpha_${Date.now()}@francisxavier.ac.in`,
        password: 'password123',
        confirmPassword: 'password123'
      })
    });
    const sData = await studentReg.json();
    const studentToken = sData.token;

    const forbidden = await fetch(`${BASE_URL}/api/admin/teams`, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(forbidden.status === 403, 'Student token calling admin endpoint rejected with 403');
  } catch (err) {
    assert(false, `Test 4 threw error: ${err.message}`);
  }

  // TEST 5: First-Time Student Approval Workflow
  let pendingTeamId = '';
  let pendingTeamEmail = '';
  try {
    const teamName = `CYBER_VIPERS_${Date.now()}`;
    pendingTeamEmail = `vipers_${Date.now()}@francisxavier.ac.in`;

    const regRes = await fetch(`${BASE_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teamName,
        email: pendingTeamEmail,
        password: 'password123',
        confirmPassword: 'password123'
      })
    });
    const regData = await regRes.json();
    assert(regData.pendingApproval === true, 'New student registration defaults to pendingApproval: true');
    pendingTeamId = regData.team.teamId;

    // Student tries to login before approval
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: pendingTeamEmail,
        password: 'password123'
      })
    });
    assert(loginRes.status === 403, 'Unapproved student team login blocked with 403 pending approval');

    // Admin approves the team
    const appRes = await fetch(`${BASE_URL}/api/admin/teams/${pendingTeamId}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const appData = await appRes.json();
    assert(appRes.status === 200 && appData.team.status === 'APPROVED', 'Admin approves pending team');

    // Student can now login successfully
    const approvedLogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: pendingTeamEmail,
        password: 'password123'
      })
    });
    assert(approvedLogin.status === 200, 'Approved student team logs in successfully');
  } catch (err) {
    assert(false, `Test 5 threw error: ${err.message}`);
  }

  // TEST 6: Admin Overview Stats Calculation
  try {
    const statsRes = await fetch(`${BASE_URL}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const statsData = await statsRes.json();
    assert(statsRes.status === 200 && statsData.success, 'Admin stats endpoint returns 200');
    assert(statsData.stats.totalTeams >= 1, `Total teams accurately counted (${statsData.stats.totalTeams})`);
    assert(statsData.stats.slots.length === 4, '4 official prelims slots present in telemetry');
  } catch (err) {
    assert(false, `Test 6 threw error: ${err.message}`);
  }

  // TEST 7: Slot Booking Management
  try {
    // Add member to approved team
    const studentLogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: pendingTeamEmail, password: 'password123' })
    });
    const sLoginData = await studentLogin.json();
    const sToken = sLoginData.token;

    const regNo = `950721${Math.floor(100000 + Math.random() * 900000)}`;
    await fetch(`${BASE_URL}/api/team/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sToken}`
      },
      body: JSON.stringify({
        members: [{
          name: 'Test Member',
          registerNumber: regNo,
          email: pendingTeamEmail,
          year: '3rd Year',
          department: 'Computer Science',
          phone: '9876543210',
          isLeader: true
        }]
      })
    });

    // Book slot 1 for member
    const bookRes = await fetch(`${BASE_URL}/api/slots/book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sToken}`
      },
      body: JSON.stringify({
        registerNumber: regNo,
        slotId: 'slot-1'
      })
    });
    assert(bookRes.status === 200, 'Member books slot-1 successfully');

    // Admin reassigns to slot-2
    const reassignRes = await fetch(`${BASE_URL}/api/admin/slots/reassign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        registerNumber: regNo,
        newSlotId: 'slot-2'
      })
    });
    assert(reassignRes.status === 200, 'Admin reassigns member to slot-2');

    // Admin cancels booking
    const cancelRes = await fetch(`${BASE_URL}/api/admin/slots/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ registerNumber: regNo })
    });
    assert(cancelRes.status === 200, 'Admin cancels member booking');
  } catch (err) {
    assert(false, `Test 7 threw error: ${err.message}`);
  }

  // TEST 8: Server-Side Assessment Grading & Results Persistence
  try {
    const studentLogin = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: pendingTeamEmail, password: 'password123' })
    });
    const { token: sToken } = await studentLogin.json();

    // Submit answers: all correct answers
    const answers = {
      1: 'B', 2: 'A', 3: 'C', 4: 'B', 5: 'B', 6: 'C', 7: 'B', 8: 'B', 9: 'A', 10: 'B', 11: 'B', 12: 'A'
    };
    const submitRes = await fetch(`${BASE_URL}/api/assessment/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${sToken}`
      },
      body: JSON.stringify({
        registerNumber: 'TEST_REG_100',
        answers,
        timeSpentSeconds: 650
      })
    });
    const submitData = await submitRes.json();
    assert(submitRes.status === 200 && submitData.result.score === 12, 'Server-side evaluation scored 12/12 for correct answers');

    // Admin checks assessment results
    const assessListRes = await fetch(`${BASE_URL}/api/admin/assessments`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const assessListData = await assessListRes.json();
    assert(assessListData.results.some(r => r.registerNumber === 'TEST_REG_100' && r.score === 12), 'Evaluated assessment score verified in Admin Results');
  } catch (err) {
    assert(false, `Test 8 threw error: ${err.message}`);
  }

  // TEST 9: Malpractice Incident Logging & Committee Review
  try {
    const malRes = await fetch(`${BASE_URL}/api/admin/malpractice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        teamId: pendingTeamId,
        registerNumber: 'TEST_REG_100',
        participantName: 'Test Participant',
        incidentType: 'FULLSCREEN_EXIT',
        description: 'Candidate exited fullscreen mode 3 times',
        evidence: 'Timestamp: 2026-11-02T10:15:00Z'
      })
    });
    const malData = await malRes.json();
    assert(malRes.status === 200 && malData.record.status === 'UNDER_REVIEW', 'Malpractice incident recorded with initial status UNDER_REVIEW');
    const incidentId = malData.record.id;

    // Review & dismiss false positive
    const updateRes = await fetch(`${BASE_URL}/api/admin/malpractice/${incidentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'DISMISSED',
        actionTaken: 'None - OS Notification glitch verified',
        adminNotes: 'Committee reviewed browser logs and confirmed innocent system notification popup.'
      })
    });
    const updateData = await updateRes.json();
    assert(updateRes.status === 200 && updateData.record.status === 'DISMISSED', 'Admin reviews and dismisses false positive incident');
  } catch (err) {
    assert(false, `Test 9 threw error: ${err.message}`);
  }

  // TEST 10: Audit Log Tracking
  try {
    const auditRes = await fetch(`${BASE_URL}/api/admin/audit-logs`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const auditData = await auditRes.json();
    assert(auditRes.status === 200 && auditData.logs.length > 0, `Audit trail logs operations successfully (${auditData.logs.length} actions captured)`);
    assert(auditData.logs[0].adminEmail, 'Audit log records actor administrator identity');
  } catch (err) {
    assert(false, `Test 10 threw error: ${err.message}`);
  }

  console.log('\n==================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('==================================================');

  if (failed > 0) process.exit(1);
}

runTests();
