import { Project, SkillCategory } from '../types';

export const PERSONAL_INFO = {
  name: 'PKFire',
  handle: 'PKFire-223',
  title: 'Full-Stack Developer & Systems Builder',
  tagline: 'Designing tactile interfaces, resilient backend architectures, and high-performance developer tools.',
  bio: 'Passionate software engineer specializing in modern TypeScript, web runtimes, and real-time systems. Focused on clean code, seamless user interactions, and robust application architecture.',
  location: 'Earth / Remote',
  status: 'Available for collaboration & projects',
  github: 'https://github.com/PKFire-223',
  repository: 'https://github.com/PKFire-223/WEBSITE',
  email: 'buiquang0123@gmail.com',
};

export const PROJECTS: Project[] = [
  {
    id: 'ignite-dashboard',
    title: 'Ignite Realtime Monitor',
    tagline: 'High-throughput telemetry and metrics dashboard with sub-second streaming updates.',
    description: 'A responsive real-time analytics suite built for monitoring distributed web services, background tasks, and resource utilization with instant alerting.',
    category: 'web',
    tags: ['React', 'TypeScript', 'Tailwind CSS', 'WebSockets', 'Chart Engine'],
    githubUrl: 'https://github.com/PKFire-223',
    featured: true,
    metrics: { label: 'Latency', value: '< 24ms' },
    highlights: [
      'Live metric aggregation with automated anomaly detection',
      'Configurable chart views with dark/light visual telemetry',
      'Zero-dependency canvas charting engine with smooth 60fps rendering'
    ]
  },
  {
    id: 'ember-cli',
    title: 'Ember CLI Tools',
    tagline: 'Lightweight command-line utility for local developer automation and container workflows.',
    description: 'A developer productivity CLI providing fast project templating, linting orchestration, and Docker-less micro-service prototyping.',
    category: 'tools',
    tags: ['Node.js', 'TypeScript', 'CLI', 'Docker API'],
    githubUrl: 'https://github.com/PKFire-223',
    featured: true,
    metrics: { label: 'Execution', value: '10x Faster' },
    highlights: [
      'Rapid scaffolding for modern Vite and Express micro-services',
      'Self-contained configuration linter with auto-fixing capabilities',
      'Cross-platform support across macOS, Linux, and Windows'
    ]
  },
  {
    id: 'flux-state-kit',
    title: 'Flux State Sync',
    tagline: 'Minimalist reactive state container with persistent offline-first cache.',
    description: 'An open-source, ultra-lightweight (<2KB) state manager designed for seamless synchronization between IndexedDB, browser memory, and WebSocket feeds.',
    category: 'opensource',
    tags: ['TypeScript', 'State Management', 'IndexedDB', 'Open Source'],
    githubUrl: 'https://github.com/PKFire-223',
    featured: true,
    metrics: { label: 'Bundle Size', value: '1.8 KB' },
    highlights: [
      'Zero external dependencies with full TypeScript type inference',
      'Automatic conflict resolution using hybrid logical timestamps',
      'Battle-tested with 10,000+ synthetic concurrent state mutations'
    ]
  },
  {
    id: 'nexus-api-gateway',
    title: 'Nexus Edge Gateway',
    tagline: 'Modular API routing layer with dynamic rate limiting and token authentication.',
    description: 'High-performance HTTP reverse proxy and security perimeter crafted for internal microservices, featuring JWT verification and distributed token bucket rate limiting.',
    category: 'systems',
    tags: ['Node.js', 'Express', 'JWT', 'Security', 'Edge'],
    githubUrl: 'https://github.com/PKFire-223',
    featured: false,
    metrics: { label: 'Requests/sec', value: '45,000+' },
    highlights: [
      'Token bucket algorithm ensuring strict burst control',
      'Automated OpenAPI spec generation and schema validation',
      'Structured audit logging with structured JSON output'
    ]
  }
];

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    title: 'Frontend & UI Engineering',
    description: 'Crafting responsive, accessible, and tactile user interfaces with modern toolchains.',
    skills: [
      { name: 'TypeScript', level: 'Advanced', years: '4+ yrs' },
      { name: 'React & Next.js', level: 'Advanced', years: '4+ yrs' },
      { name: 'Tailwind CSS', level: 'Expert', years: '3+ yrs' },
      { name: 'Motion / Framer', level: 'Proficient', years: '2+ yrs' },
      { name: 'State Management (Zustand, Redux)', level: 'Advanced', years: '3+ yrs' },
    ]
  },
  {
    title: 'Backend & System Architecture',
    description: 'Building secure, scalable APIs, micro-services, and resilient data processing pipelines.',
    skills: [
      { name: 'Node.js & Express', level: 'Advanced', years: '4+ yrs' },
      { name: 'REST & GraphQL APIs', level: 'Advanced', years: '3+ yrs' },
      { name: 'PostgreSQL & SQLite', level: 'Proficient', years: '3+ yrs' },
      { name: 'Redis & Caching', level: 'Proficient', years: '2+ yrs' },
      { name: 'WebSocket & Realtime', level: 'Proficient', years: '2+ yrs' },
    ]
  },
  {
    title: 'Developer Tools & Cloud',
    description: 'Optimizing development workflows, CI/CD pipelines, and cloud container deployments.',
    skills: [
      { name: 'Vite & esbuild', level: 'Advanced', years: '3+ yrs' },
      { name: 'Git & GitHub Workflows', level: 'Expert', years: '5+ yrs' },
      { name: 'Docker & Containers', level: 'Proficient', years: '2+ yrs' },
      { name: 'Google Cloud / Cloud Run', level: 'Proficient', years: '2+ yrs' },
      { name: 'Linux & Shell Scripting', level: 'Proficient', years: '3+ yrs' },
    ]
  }
];
