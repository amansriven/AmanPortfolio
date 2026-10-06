import type { ImageMetadata } from 'astro';
import humanaLogo from '../assets/logos/humana.png';
import jaggaerLogo from '../assets/logos/jaggaer.png';
import tamuLogo from '../assets/logos/tamu.png';

/**
 * The two résumés the experience page can be read as. `swe` is the default,
 * and the one a visitor without JavaScript sees. `/experience?focus=ml`
 * opens on the other.
 */
export type Focus = 'swe' | 'ml';

export const focuses: { id: Focus; label: string }[] = [
  { id: 'swe', label: 'Software engineering' },
  { id: 'ml', label: 'AI / ML' },
];

export const defaultFocus: Focus = 'swe';

/** The parts of a role that change with the reader. */
export interface RoleStory {
  /** One short sentence. The metrics carry the numbers. */
  summary: string;
  /** Short, restrained. Not a wall of pills. */
  stack: string[];
  /** Optional hard numbers. Only real, resume-backed figures belong here. */
  metrics?: { value: string; label: string }[];
}

export interface Experience {
  /** Displayed large, in mono, as the left rail of the row. */
  year: string;
  org: string;
  role: string;
  location: string;
  period: string;
  /** Square mark shown beside the role. Without one, a monogram is drawn. */
  logo?: ImageMetadata;
  /**
   * The role as each résumé tells it. Leave a focus out to hide the role
   * there. When the story doesn't change, give both the same object and the
   * role is rendered once.
   */
  story: Partial<Record<Focus, RoleStory>>;
}

/* CARES Lab reads the same on both résumés, but its figures come from Table I
   of the paper, which is published at /research, not from the résumé. A
   visitor can click through and check them, so any figure here has to
   survive that. */
const caresStory: RoleStory = {
  summary:
    'Trained a PyTorch ensemble that flags eleven classes of smart-contract vulnerability despite severe class imbalance.',
  stack: ['PyTorch', 'Multi-head attention', 'Focal loss'],
  metrics: [
    { value: '0.8703', label: 'macro F1 across 12 classes' },
    { value: '0.9973', label: 'macro AUC' },
    // As the official results list it (tamug.edu/research/Symposium).
    { value: '1st', label: 'Computer Sciences, 2025 TAMUG research symposium' },
  ],
};

const sinnFundStory: RoleStory = {
  summary:
    'Built an event-driven options backtester in Python and C++, plus the data-to-execution pipelines the fund’s researchers run.',
  stack: ['Python', 'C++', 'Options data', 'Backtesting'],
  metrics: [
    { value: '150M+', label: 'options contracts modelled' },
    { value: '$80K+', label: 'fund under management' },
    { value: '−34%', label: 'simulation runtime for 7 researchers' },
  ],
};

/* Industry roles first, then research, then student organisations. Every
   figure below is lifted from the matching résumé; if it changes there,
   change it here. */
export const experience: Experience[] = [
  {
    year: '2026',
    org: 'Humana',
    role: 'Software Engineering Intern',
    location: 'Louisville, KY',
    period: 'May — Aug 2026',
    logo: humanaLogo,
    story: {
      swe: {
        summary:
          'Built a multi-provider AI gateway on Azure Kubernetes, with a FastAPI and PostgreSQL control plane for roles, sessions, and API keys.',
        stack: ['Kubernetes', 'Envoy', 'FastAPI', 'PostgreSQL', 'Redis', 'Prometheus', 'Grafana'],
        metrics: [
          { value: '450K+', label: 'requests routed per day' },
          { value: '<25 ms', label: 'p95 gateway overhead' },
          { value: '30+', label: 'MCP tool servers behind one policy' },
          { value: '100+', label: 'failure scenarios chaos-tested' },
        ],
      },
      /* No latency figure until it's reconciled with the team's benchmark
         (25 ms median, 40 ms p95). The ML résumé leaves it out for the same
         reason. */
      ml: {
        summary:
          'Built the gateway that routes model traffic to Azure OpenAI and Gemini, with bounded streaming retries and automatic provider failover.',
        stack: ['Azure OpenAI', 'Gemini', 'MCP', 'SSE', 'Envoy', 'Redis', 'Kubernetes'],
        metrics: [
          { value: '450K+', label: 'model requests routed per day' },
          { value: '30+', label: 'MCP tool servers rate-limited per user' },
          { value: '100+', label: 'failure scenarios chaos-tested' },
        ],
      },
    },
  },
  {
    year: '2025',
    org: 'JAGGAER',
    role: 'Software Engineering Intern',
    location: 'Durham, NC',
    period: 'Jun — Aug 2025',
    logo: jaggaerLogo,
    story: {
      swe: {
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
      ml: {
        summary:
          'Built search and LLM orchestration over supplier data, with one model-agnostic interface across Ollama, OpenAI, Gemini, and Anthropic.',
        stack: ['Python', 'FAISS', 'Ollama', 'OpenAI', 'Gemini', 'Anthropic', 'GitHub Actions'],
        metrics: [
          { value: '4M+', label: 'supplier records searched' },
          { value: '−40%', label: 'procurement cycle time' },
          { value: '+25%', label: 'supplier-matching accuracy' },
          { value: '10K+', label: 'labeled examples in evaluation' },
        ],
      },
    },
  },
  {
    year: '2024',
    org: 'Texas A&M University, CARES Lab',
    role: 'Machine Learning Research Engineer',
    location: 'College Station, TX',
    period: 'Dec 2024 — May 2025',
    logo: tamuLogo,
    story: { swe: caresStory, ml: caresStory },
  },
  {
    year: '2026',
    org: 'Sinn Fund, Aggie Investment Club',
    role: 'Software Developer',
    location: 'College Station, TX',
    period: 'Jan 2026 — Present',
    story: { swe: sinnFundStory, ml: sinnFundStory },
  },
  {
    year: '2025',
    org: 'Aggie Coding Club',
    role: 'Software Engineer',
    location: 'College Station, TX',
    period: 'Aug 2025 — Present',
    /* On the SWE résumé only. */
    story: {
      swe: {
        summary:
          'Contributing to Maroon Rides, a SvelteKit and Capacitor transit app for the Texas A&M bus system.',
        stack: ['SvelteKit', 'Capacitor', 'TypeScript'],
        metrics: [{ value: '5K+', label: 'downloads' }],
      },
    },
  },
];
