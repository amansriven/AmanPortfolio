import type { ImageMetadata } from 'astro';
import humanaLogo from '../assets/logos/humana.png';
import jaggaerLogo from '../assets/logos/jaggaer.png';
import tamuLogo from '../assets/logos/tamu.png';

export interface Experience {
  /** Displayed large, in mono, as the left rail of the row. */
  year: string;
  org: string;
  role: string;
  location: string;
  period: string;
  /** Square mark shown beside the role. Without one, a monogram is drawn. */
  logo?: ImageMetadata;
  /** One short sentence. The metrics carry the numbers. */
  summary: string;
  /** Short, restrained. Not a wall of pills. */
  stack: string[];
  /** Optional hard numbers. Only real, resume-backed figures belong here. */
  metrics?: { value: string; label: string }[];
}

/* Industry roles first, then research, then the student-run fund. Every
   figure below is lifted from the résumé; if it changes there, change it here. */
export const experience: Experience[] = [
  {
    year: '2026',
    org: 'Humana',
    role: 'Software Engineering Intern',
    location: 'Louisville, KY',
    period: 'May — Aug 2026',
    logo: humanaLogo,
    summary:
      'Built a distributed AI gateway on Azure Kubernetes with per-user auth, rate limiting, and automatic provider failover.',
    stack: ['Kubernetes', 'Envoy', 'Redis', 'MCP', 'SSE', 'Prometheus', 'Grafana'],
    metrics: [
      { value: '450K+', label: 'requests routed per day' },
      { value: '<25 ms', label: 'p95 gateway overhead' },
      { value: '30+', label: 'MCP tool servers behind one policy' },
      { value: '100+', label: 'failure scenarios chaos-tested' },
    ],
  },
  {
    year: '2025',
    org: 'JAGGAER',
    role: 'Software Engineering Intern',
    location: 'Durham, NC',
    period: 'Jun — Aug 2025',
    logo: jaggaerLogo,
    summary:
      'Built a Spring Boot supplier-data service and its async ingestion pipeline, then tuned MySQL and caching for high-volume reads.',
    stack: ['Java', 'Spring Boot', 'MySQL', 'REST'],
    metrics: [
      { value: '4M+', label: 'supplier records served' },
      { value: '−38%', label: 'p95 API latency' },
      { value: '4.2×', label: 'ingestion throughput' },
      { value: '−55%', label: 'read latency' },
    ],
  },
  {
    year: '2024',
    org: 'Texas A&M University, CARES Lab',
    role: 'Machine Learning Research Engineer',
    location: 'College Station, TX',
    period: 'Dec 2024 — May 2025',
    logo: tamuLogo,
    summary:
      'Trained a PyTorch ensemble that flags eleven classes of smart-contract vulnerability despite severe class imbalance.',
    stack: ['PyTorch', 'Multi-head attention', 'Focal loss'],
    /* Taken from Table I of the paper, which is now published at /research —
       a visitor can click through and check them. Any figure here has to
       survive that. */
    metrics: [
      { value: '0.8703', label: 'macro F1 across 12 classes' },
      { value: '0.9973', label: 'macro AUC' },
      { value: '1st of 40', label: '2025 research symposium' },
    ],
  },
  {
    year: '2026',
    org: 'Sinn Fund, Aggie Investment Club',
    role: 'Software Developer',
    location: 'College Station, TX',
    period: 'Jan 2026 — Present',
    summary:
      'Built an event-driven options backtester in Python and C++, plus the data-to-execution pipelines the fund’s researchers run.',
    stack: ['Python', 'C++', 'Options data', 'Backtesting'],
    metrics: [
      { value: '150M+', label: 'options contracts modelled' },
      { value: '$80K+', label: 'fund under management' },
      { value: '−34%', label: 'simulation runtime for 7 researchers' },
    ],
  },
];
