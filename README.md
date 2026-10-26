# ELITEX HACKATHON — 2026

> **Official Event Portal & Team Command Dashboard**  
> **FXEC × ELITE BATCH 2025-29**  
> Organised by **Elite Batch 2025-29** at **Francis Xavier Engineering College (Autonomous)**  
> Motto: *“IDEAS TODAY. IMPACT TOMORROW.”*  
> Tagline: *THINK / CODE / INNOVATE*  
> Duration: **7 HOURS SPRINT**

---

## ⚡ Key Highlights & Specifications

| Parameter | Official Specification |
| :--- | :--- |
| **Event Name** | **ELITEX HACKATHON — 2026** |
| **Organisers** | **FXEC × ELITE BATCH 2025-29** |
| **Duration** | **7 HOURS SPRINT** |
| **Team Size** | **EXACTLY 4 MEMBERS (Mandatory)** |
| **Participation Cap** | **STRICTLY 50 TEAMS (ELITEFX001 - ELITEFX050)** |
| **Eligibility** | **ONLY PBL AND ELITE STUDENTS** |
| **Rewards & Prizes** | **100 REWARD POINTS & PRIZES FOR WINNERS** *(Zero Cash/Monetary Prize Pool)* |
| **Phase 1 — PRELIMS** | **Monday, 2 November 2026 (Start: 9:30 AM · Deadline: 10:00 AM IST)** |
| **Phase 2 — FINAL HACKATHON**| **Wednesday, 4 November 2026 (9:30 AM – 4:00 PM IST · Campus Arena)** |

---

## 🔐 Registration & Email OTP Verification Workflow

Registration requires real email OTP verification on the backend:

1. **Registration Form Fields (in exact required order):**
   1. `Team Name`
   2. `Team Leader's Email ID`
   3. `Password`
   4. `Confirm Password`
   5. `GENERATE OTP` button
2. **OTP Generation:**
   - Cryptographically secure randomly generated **5-digit OTP** (preserving leading zeros, e.g. `04819`).
   - Single-use, 10-minute expiry, max 5 verification attempts.
   - 60-second resend cooldown timer.
3. **Sequential Team ID Allocation:**
   - Generated on the server upon successful OTP verification.
   - Sequence: `ELITEFX001` through `ELITEFX050`.
   - Concurrency-safe, never recycled or manually chosen.
   - Rejects additional registrations once all 50 slots are filled with: *"All 50 Team Slots Filled"*.
4. **Dashboard Redirection & Session Protection:**
   - On successful verification, the team leader is automatically redirected to the authenticated **Dashboard**.
   - Session token persists across page refreshes. Unauthenticated visitors cannot access registered team data.
   - Prominent Team ID display with a **Copy to Clipboard** button.

---

## 📧 Email Configuration (`.env`)

The backend uses **Nodemailer** for email delivery. Configure your SMTP provider in `.env`:

```env
PORT=5000
JWT_SECRET=elitex-2026-fxec-elite-batch-2025-29-secure-token-key

# SMTP Configuration (e.g. Gmail App Password, Brevo, SendGrid, Amazon SES)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_digit_app_password
SMTP_FROM=ELITEX Hackathon 2026 <no-reply@elitex2026.fxec.ac.in>

# Gmail Alternative Shortcut
GMAIL_USER=your_email@gmail.com
GMAIL_PASS=your_16_digit_app_password
```

> **Note on Testing:** If SMTP environment variables are left blank, the backend server automatically logs the 5-digit verification OTP directly to the server terminal console for testing.

---

## 🚀 Running the Project

### 1. Start the Backend API Server (Port 5000)
```bash
npm run server
```

### 2. Start the Frontend Development Server (Port 3000)
```bash
npm run dev
```

Visit **http://localhost:3000** in your web browser.
