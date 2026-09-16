export interface Experience {
  /** Displayed large, in mono, as the left rail of the row. */
  year: string;
  org: string;
  role: string;
  location: string;
  period: string;
  /** One or two sentences. Editorial, not resume bullets. */
  summary: string;
  /** Short, restrained. Not a wall of pills. */
  stack: string[];
  /** Optional hard numbers. Only real, resume-backed figures belong here. */
  metrics?: { value: string; label: string }[];
}

/* Ordered by start date, newest first. Every figure below is lifted from the
   résumé; if it changes there, change it here. */
export const experience: Experience[] = [
  {
    year: '2026',
    org: 'Humana',
    role: 'Software Engineering Intern',
    location: 'Louisville, KY',
    period: 'May — Aug 2026',
    summary:
      'Architected a distributed AI gateway on Azure Kubernetes that routes model traffic at under 25 ms of p95 overhead. Enforced per-user authorization and Redis token-bucket rate limits across thirty-plus MCP tool servers at the Envoy layer, hardened the SSE token streams with bounded retries and automated provider failover, and chaos-tested the whole thing against a hundred-plus provider-failure and retry-storm scenarios under Prometheus and Grafana.',
    stack: ['Kubernetes', 'Envoy', 'Redis', 'MCP', 'SSE', 'Prometheus', 'Grafana'],
    metrics: [
      { value: '450K+', label: 'requests routed per day' },
      { value: '<25 ms', label: 'p95 gateway overhead' },
      { value: '30+', label: 'MCP tool servers behind one policy' },
      { value: '100+', label: 'failure scenarios chaos-tested' },
    ],
  },
  {
    year: '2026',
    org: 'Sinn Fund, Aggie Investment Club',
    role: 'Software Developer',
    location: 'College Station, TX',
    period: 'Jan 2026 — Present',
    summary:
      'Built an event-driven backtester in Python and C++ over a hundred and fifty million options contracts, modelling the risk and transaction costs behind a student-run fund. Productionised the strategies through data, signal, and execution pipelines that the researchers run themselves.',
    stack: ['Python', 'C++', 'Options data', 'Backtesting'],
    metrics: [
      { value: '150M+', label: 'options contracts modelled' },
      { value: '$80K+', label: 'fund under management' },
      { value: '−34%', label: 'simulation runtime for 7 researchers' },
    ],
  },
  {
    year: '2025',
    org: 'JAGGAER',
    role: 'Software Engineering Intern',
    location: 'Durham, NC',
    period: 'Jun — Aug 2025',
    summary:
      'Engineered a Java and Spring Boot microservice exposing REST APIs over four million supplier records, then fed it with an asynchronous ingestion and normalisation pipeline built on idempotent writes and retries. Tuned the MySQL queries and caching underneath so high-volume reads stopped being the bottleneck.',
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
    org: 'Texas A&M University',
    role: 'Undergraduate Researcher',
    location: 'College Station, TX',
    period: 'Dec 2024 — May 2025',
    summary:
      'Trained an ensemble PyTorch classifier that detects eleven classes of smart-contract vulnerability across a hundred thousand contracts, pairing residual connections and multi-head attention with an adaptive focal loss to survive severe label imbalance.',
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
];
