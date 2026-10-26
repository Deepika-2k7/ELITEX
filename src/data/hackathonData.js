export const EVENT_INFO = {
  name: "ELITEX HACKATHON",
  year: "2026",
  title: "ELITEX HACKATHON — 2026",
  tagline: "THINK / CODE / INNOVATE",
  motto: "IDEAS TODAY. IMPACT TOMORROW.",
  durationBadge: "7 HOURS SPRINT",
  organizersPrimary: "FXEC × ELITE BATCH 2025-29",
  organizersSecondary: "ORGANISED BY ELITE BATCH 2025-29",
  institution: "Francis Xavier Engineering College (Autonomous)",
  venue: "Francis Xavier Engineering College Campus Arena, Tirunelveli",
  mode: "On-Campus Software Sprint",
  teamSize: "EXACTLY 4 MEMBERS",
  maxTeams: 50,
  eligibility: "ONLY PBL AND ELITE STUDENTS",
  rewardsSummary: "100 REWARD POINTS & PRIZES FOR WINNERS",
  // Phase 1 Prelims Schedule (Asia/Kolkata)
  phase1: {
    title: "PHASE 1 — PRELIMS",
    dateDisplay: "Monday, 2 November 2026",
    startTimeDisplay: "9:30 AM IST",
    deadlineDisplay: "Monday, 2 November 2026, 10:00 AM IST",
    targetDeadlineISO: "2026-11-02T10:00:00+05:30",
    overview: "Preliminary domain and problem-solving screening assessment. Top qualifying teams among the 50 registered squads advance to the Phase 2 Final Hackathon.",
    status: "Prelims Assessment Active"
  },
  // Phase 2 Final Hackathon Schedule (Asia/Kolkata)
  phase2: {
    title: "PHASE 2 — FINAL HACKATHON",
    dateDisplay: "Wednesday, 4 November 2026",
    timeDisplay: "9:30 AM – 4:00 PM IST",
    durationDisplay: "7 HOURS SPRINT",
    targetStartISO: "2026-11-04T09:30:00+05:30",
    overview: "The high-intensity 7-hour continuous software build sprint. Finalist squads turn conceptual solutions into functional working software prototypes for jury evaluation.",
    status: "Finalist Arena Frontier"
  }
};

export const DOMAINS = [
  {
    id: "ai-systems",
    name: "Artificial Intelligence & ML",
    short: "AI & ML",
    badge: "Core Track",
    description: "Build intelligent systems, predictive edge models, and autonomous software workflows that address real institutional and industrial problems.",
    techStack: ["Python", "PyTorch", "TensorFlow", "FastAPI", "Vector DBs"],
    proposedQuestions: 30,
    sampleProblem: "Real-time automated anomaly detector and automated response system for campus infrastructure."
  },
  {
    id: "software-dev",
    name: "Full-Stack Software Development",
    short: "Web & Mobile",
    badge: "High Impact",
    description: "Engineer responsive, scalable web and mobile software platforms with secure architectures, modern UX, and real-time data sync.",
    techStack: ["React", "Node.js", "PostgreSQL", "Docker", "Tailwind CSS"],
    proposedQuestions: 30,
    sampleProblem: "High-concurrency collaborative student portal with instant verification ledger."
  },
  {
    id: "cloud-devops",
    name: "Cloud Computing & DevOps",
    short: "Cloud & Systems",
    badge: "Infrastructure",
    description: "Construct resilient microservice meshes, auto-scaling deployment pipelines, and zero-downtime infrastructure solutions.",
    techStack: ["Docker", "Kubernetes", "AWS / GCP", "Prometheus", "CI/CD"],
    proposedQuestions: 30,
    sampleProblem: "Automated container failover mesh with edge caching and live telemetry monitoring."
  },
  {
    id: "cybersecurity",
    name: "Cybersecurity & InfoSec",
    short: "Cybersecurity",
    badge: "Defense Tech",
    description: "Harden authentication systems, build zero-trust access gateways, and engineer automated security audit instruments.",
    techStack: ["Cryptography", "JWT / OAuth", "Zero-Trust", "Penetration Tooling"],
    proposedQuestions: 30,
    sampleProblem: "Tamper-proof student credential validation service using verifiable cryptographic signatures."
  }
];

export const REWARDS_DATA = {
  title: "REWARDS & RECOGNITION",
  badge: "100 REWARD POINTS",
  subtitle: "PRIZES FOR WINNERS",
  overview: "ELITEX Hackathon 2026 rewards innovation, architectural precision, and speed with official institutional recognition, winner trophies, certificates, and academic reward points.",
  pointsAllocation: "100 REWARD POINTS",
  tiers: [
    {
      place: "1st Place",
      title: "CHAMPION SQUAD",
      reward: "Champion Trophy + 100 Reward Points",
      perks: [
        "Elite Batch Gold Champion Trophy",
        "Certificate of Exceptional Distinction",
        "100 Verified Academic Reward Points",
        "Direct Project Incubation & Mentorship"
      ],
      border: "border-emerald-500",
      glow: "shadow-neon-green",
      tagColor: "bg-emerald-500 text-white",
      iconColor: "text-emerald-500",
      rank: 1
    },
    {
      place: "2nd Place",
      title: "RUNNER-UP SQUAD",
      reward: "Runner-Up Trophy + 100 Reward Points",
      perks: [
        "Elite Batch Silver Runner-Up Trophy",
        "Certificate of High Distinction",
        "100 Verified Academic Reward Points",
        "Special Recognition Citation"
      ],
      border: "border-blue-500",
      glow: "shadow-neon-blue",
      tagColor: "bg-blue-600 text-white",
      iconColor: "text-blue-500",
      rank: 2
    },
    {
      place: "3rd Place",
      title: "SECOND RUNNER-UP",
      reward: "Second Runner-Up Trophy + 100 Reward Points",
      perks: [
        "Elite Batch Bronze Medallion",
        "Certificate of Distinction",
        "100 Verified Academic Reward Points",
        "Technical Commendation"
      ],
      border: "border-slate-400",
      glow: "shadow-glass-clean",
      tagColor: "bg-slate-700 text-white",
      iconColor: "text-slate-600",
      rank: 3
    }
  ],
  specialBadges: [
    { title: "Best Architecture Design", reward: "Special Citation Plaque", desc: "Awarded for clean code, security, and scalability." },
    { title: "Most Innovative Solution", reward: "Innovation Trophy", desc: "Awarded for novel problem framing and creative execution." },
    { title: "Fastest Working Prototype", reward: "Sprint Star Badge", desc: "Awarded for rapid deployment and functional completeness." }
  ]
};

export const FAQS = [
  {
    question: "What is ELITEX HACKATHON 2026?",
    answer: "ELITEX HACKATHON 2026 is an exclusive software hackathon organized by Elite Batch 2025-29 at Francis Xavier Engineering College (Autonomous). It features an intensive 7 Hours Sprint where squads turn bold ideas into impactful working prototypes."
  },
  {
    question: "Who is eligible to participate?",
    answer: "Eligibility is strictly restricted to ONLY PBL AND ELITE STUDENTS of Francis Xavier Engineering College. Outside registrations or non-eligible entries will be disqualified."
  },
  {
    question: "What is the team size requirement?",
    answer: "Team size is strictly EXACTLY 4 MEMBERS. Teams with fewer or more than 4 members will not be permitted. Only the team leader needs to register on behalf of the squad."
  },
  {
    question: "How many team registrations are available?",
    answer: "Participation is strictly limited to ONLY 50 TEAMS. Registrations are automatically assigned sequential Team IDs from ELITEFX001 to ELITEFX050 upon registration. Once 50 slots are filled, registration permanently closes."
  },
  {
    question: "What is the schedule for Phase 1 — PRELIMS?",
    answer: "Phase 1 (PRELIMS) starts on Monday, 2 November 2026 at 9:30 AM IST, with the screening submission deadline set at 10:00 AM IST. A live countdown is active on the dedicated Phase 1 page."
  },
  {
    question: "What is the schedule for Phase 2 — FINAL HACKATHON?",
    answer: "Phase 2 (FINAL HACKATHON) takes place on Wednesday, 4 November 2026 from 9:30 AM to 4:00 PM IST (7 Hours Sprint). Qualifying teams will build and present their software prototypes to the jury panel."
  },
  {
    question: "What rewards and prizes will be provided?",
    answer: "There is no monetary cash prize pool. Participants and winners earn 100 REWARD POINTS along with official trophies, distinctions, certificates of excellence, and project incubation support from the Elite Batch."
  },
  {
    question: "How does team registration work?",
    answer: "The team leader provides the team name, leader email, password, and confirmation. Upon clicking Register, a unique sequential Team ID (ELITEFX001 - ELITEFX050) is allocated automatically on the server, and the team leader is immediately redirected to the Dashboard."
  }
];

export const INITIAL_ANNOUNCEMENTS = [
  {
    id: "ann-1",
    title: "Official Registration Open: 50 Team Slots Available",
    time: "Today",
    category: "Registration",
    unread: true,
    content: "Team leaders may now register. Ensure your squad consists of exactly 4 PBL and Elite students. Team IDs ELITEFX001 through ELITEFX050 are allocated automatically upon registration."
  },
  {
    id: "ann-2",
    title: "Phase 1 Prelims Deadline Scheduled",
    time: "24 Oct 2026",
    category: "Prelims",
    unread: true,
    content: "Phase 1 PRELIMS screening submission deadline is Monday, 2 November 2026 at 10:00 AM IST. Check the Phase 1 portal for instructions."
  },
  {
    id: "ann-3",
    title: "Phase 2 Final Hackathon: 7 Hours Sprint",
    time: "22 Oct 2026",
    category: "Schedule",
    unread: false,
    content: "The final hackathon will run on Wednesday, 4 November 2026 from 9:30 AM to 4:00 PM IST at the FXEC campus arena."
  }
];

export const INITIAL_ACHIEVEMENTS = [
  { id: "ach-1", title: "Squad Verified", desc: "Successfully registered team and secured assigned Team ID.", icon: "ShieldCheck", unlocked: true, points: 25 },
  { id: "ach-2", title: "Elite Contender", desc: "Locked in 4-member squad for ELITEX Hackathon 2026.", icon: "Users", unlocked: true, points: 25 },
  { id: "ach-3", title: "Prelims Ready", desc: "Reviewed Phase 1 screening syllabus and test guidelines.", icon: "FileText", unlocked: false, points: 25 },
  { id: "ach-4", title: "Sprint Finisher", desc: "Complete the 7 Hours Sprint and submit prototype in Phase 2.", icon: "Trophy", unlocked: false, points: 25 }
];
