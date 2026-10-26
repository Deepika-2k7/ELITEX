/**
 * ELITEX HACKATHON 2026 — Official Backend Prelims Questions & Answer Key
 * Evaluated securely on the server
 */
export const OFFICIAL_PRELIMS_QUESTIONS = [
  {
    id: 1,
    category: "Algorithms & Complexity",
    question: "What is the worst-case time complexity of searching an element in a balanced Binary Search Tree (AVL or Red-Black Tree) containing n elements?",
    correctAnswer: "B"
  },
  {
    id: 2,
    category: "Data Structures",
    question: "Which data structure provides constant O(1) average-time complexity for insertions, deletions, and lookups?",
    correctAnswer: "A"
  },
  {
    id: 3,
    category: "Full-Stack Web Architecture",
    question: "In modern client-server architectures, which HTTP status code represents that a request was received and understood, but access is refused due to insufficient authorization permissions?",
    correctAnswer: "C"
  },
  {
    id: 4,
    category: "JavaScript & Concurrency",
    question: "In the JavaScript Event Loop, which queue takes highest execution priority immediately after the currently running script completes before handling macroscopic timer callbacks?",
    correctAnswer: "B"
  },
  {
    id: 5,
    category: "Software Engineering & Security",
    question: "Why should passwords never be hashed using standard cryptographic hash functions like MD5 or SHA-256 without key derivation algorithms such as bcrypt or Argon2?",
    correctAnswer: "B"
  },
  {
    id: 6,
    category: "System Design",
    question: "Which caching eviction policy removes the item that has not been accessed for the longest duration?",
    correctAnswer: "C"
  },
  {
    id: 7,
    category: "Database Systems",
    question: "In relational database ACID properties, what does 'Isolation' guarantee?",
    correctAnswer: "B"
  },
  {
    id: 8,
    category: "Networking & APIs",
    question: "What is the primary architectural purpose of a Reverse Proxy (such as Nginx) deployed in front of application backends?",
    correctAnswer: "B"
  },
  {
    id: 9,
    category: "Problem Solving & Logic",
    question: "An array of n integers contains values from 1 to n+1 with exactly one number missing. Which mathematical technique finds the missing number in O(n) time and O(1) auxiliary space?",
    correctAnswer: "A"
  },
  {
    id: 10,
    category: "Web & Frontend",
    question: "In modern React applications, why is the 'key' prop necessary when rendering dynamic lists of components?",
    correctAnswer: "B"
  },
  {
    id: 11,
    category: "Algorithms & Graphs",
    question: "Which algorithm finds the single-source shortest path in a weighted graph with non-negative edge weights in O((V + E) log V) time?",
    correctAnswer: "B"
  },
  {
    id: 12,
    category: "Cloud & DevOps",
    question: "What is the primary difference between a Docker container and a traditional Virtual Machine (VM)?",
    correctAnswer: "A"
  }
];

export function gradeAssessment(answers) {
  let score = 0;
  const total = OFFICIAL_PRELIMS_QUESTIONS.length;

  for (const q of OFFICIAL_PRELIMS_QUESTIONS) {
    if (answers && answers[q.id] === q.correctAnswer) {
      score += 1;
    }
  }

  const percentage = Math.round((score / total) * 100);
  return {
    score,
    totalQuestions: total,
    maxScore: total,
    percentage,
    passed: percentage >= 50
  };
}
