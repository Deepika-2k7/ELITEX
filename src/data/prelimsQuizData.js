/**
 * ELITEX HACKATHON 2026 — Phase 1 Prelims Assessment Questions
 * Problem-Solving, Algorithmic Thinking, Full-Stack Architecture & Systems
 */
export const PRELIMS_QUESTIONS = [
  {
    id: 1,
    category: "Algorithms & Complexity",
    question: "What is the worst-case time complexity of searching an element in a balanced Binary Search Tree (AVL or Red-Black Tree) containing n elements?",
    options: [
      { id: "A", text: "O(1)" },
      { id: "B", text: "O(log n)" },
      { id: "C", text: "O(n)" },
      { id: "D", text: "O(n log n)" }
    ],
    correctAnswer: "B"
  },
  {
    id: 2,
    category: "Data Structures",
    question: "Which data structure provides constant O(1) average-time complexity for insertions, deletions, and lookups?",
    options: [
      { id: "A", text: "Hash Table" },
      { id: "B", text: "Binary Heap" },
      { id: "C", text: "Sorted Doubly Linked List" },
      { id: "D", text: "Trie" }
    ],
    correctAnswer: "A"
  },
  {
    id: 3,
    category: "Full-Stack Web Architecture",
    question: "In modern client-server architectures, which HTTP status code represents that a request was received and understood, but access is refused due to insufficient authorization permissions?",
    options: [
      { id: "A", text: "400 Bad Request" },
      { id: "B", text: "401 Unauthorized" },
      { id: "C", text: "403 Forbidden" },
      { id: "D", text: "404 Not Found" }
    ],
    correctAnswer: "C"
  },
  {
    id: 4,
    category: "JavaScript & Concurrency",
    question: "In the JavaScript Event Loop, which queue takes highest execution priority immediately after the currently running script completes before handling macroscopic timer callbacks?",
    options: [
      { id: "A", text: "Macro-task Queue (setTimeout / setInterval)" },
      { id: "B", text: "Micro-task Queue (Promise callbacks / queueMicrotask)" },
      { id: "C", text: "I/O Polling Queue" },
      { id: "D", text: "Rendering Animation Queue" }
    ],
    correctAnswer: "B"
  },
  {
    id: 5,
    category: "Software Engineering & Security",
    question: "Why should passwords never be hashed using standard cryptographic hash functions like MD5 or SHA-256 without key derivation algorithms such as bcrypt or Argon2?",
    options: [
      { id: "A", text: "Standard SHA-256 hashes produce passwords longer than database limits" },
      { id: "B", text: "Standard hashes are too fast and vulnerable to GPU rainbow table cracking" },
      { id: "C", text: "MD5 algorithms cannot process special characters" },
      { id: "D", text: "bcrypt automatically transmits credentials to third-party ledgers" }
    ],
    correctAnswer: "B"
  },
  {
    id: 6,
    category: "System Design",
    question: "Which caching eviction policy removes the item that has not been accessed for the longest duration?",
    options: [
      { id: "A", text: "FIFO (First In, First Out)" },
      { id: "B", text: "LFU (Least Frequently Used)" },
      { id: "C", text: "LRU (Least Recently Used)" },
      { id: "D", text: "MRU (Most Recently Used)" }
    ],
    correctAnswer: "C"
  },
  {
    id: 7,
    category: "Database Systems",
    question: "In relational database ACID properties, what does 'Isolation' guarantee?",
    options: [
      { id: "A", text: "Transactions are executed in absolute isolation from the network" },
      { id: "B", text: "Concurrent transactions execute without interfering with one another as if serialized" },
      { id: "C", text: "Data is permanently saved to non-volatile disk storage" },
      { id: "D", text: "All database tables are decoupled from foreign key constraints" }
    ],
    correctAnswer: "B"
  },
  {
    id: 8,
    category: "Networking & APIs",
    question: "What is the primary architectural purpose of a Reverse Proxy (such as Nginx) deployed in front of application backends?",
    options: [
      { id: "A", text: "To directly render React JSX templates on client machines" },
      { id: "B", text: "Load balancing, SSL termination, and protecting backend services from direct public exposure" },
      { id: "C", text: "To replace database indexing algorithms" },
      { id: "D", text: "To generate random 5-digit verification tokens" }
    ],
    correctAnswer: "B"
  },
  {
    id: 9,
    category: "Problem Solving & Logic",
    question: "An array of n integers contains values from 1 to n+1 with exactly one number missing. Which mathematical technique finds the missing number in O(n) time and O(1) auxiliary space?",
    options: [
      { id: "A", text: "Calculate the expected Gauss sum (n*(n+1)/2) and subtract the actual array sum" },
      { id: "B", text: "Sort the array using Quicksort and check consecutive differences" },
      { id: "C", text: "Convert the array to a complete binary tree" },
      { id: "D", text: "Run breadth-first search across all index nodes" }
    ],
    correctAnswer: "A"
  },
  {
    id: 10,
    category: "Web & Frontend",
    question: "In modern React applications, why is the 'key' prop necessary when rendering dynamic lists of components?",
    options: [
      { id: "A", text: "It assigns CSS styles to each individual DOM node" },
      { id: "B", text: "It allows React's Virtual DOM reconciliation engine to identify which items changed, were added, or were removed" },
      { id: "C", text: "It automatically saves list state into browser localStorage" },
      { id: "D", text: "It encrypts list data before network transmission" }
    ],
    correctAnswer: "B"
  },
  {
    id: 11,
    category: "Algorithms & Graphs",
    question: "Which algorithm finds the single-source shortest path in a weighted graph with non-negative edge weights in O((V + E) log V) time?",
    options: [
      { id: "A", text: "Depth First Search (DFS)" },
      { id: "B", text: "Dijkstra's Algorithm with a Priority Queue" },
      { id: "C", text: "Kruskal's Minimum Spanning Tree Algorithm" },
      { id: "D", text: "Floyd-Warshall Algorithm" }
    ],
    correctAnswer: "B"
  },
  {
    id: 12,
    category: "Cloud & DevOps",
    question: "What is the primary difference between a Docker container and a traditional Virtual Machine (VM)?",
    options: [
      { id: "A", text: "Containers share the host operating system kernel, making them lightweight and fast to boot" },
      { id: "B", text: "Virtual machines cannot execute Node.js or Python runtimes" },
      { id: "C", text: "Containers require dedicated hypervisor emulation hardware" },
      { id: "D", text: "Docker containers can only run in isolated local air-gapped environments" }
    ],
    correctAnswer: "A"
  }
];
