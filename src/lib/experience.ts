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

export const experience: Experience[] = [
  {
    year: '2026',
    org: 'Humana',
    role: 'Software Engineering Intern',
    location: 'Louisville, KY',
    period: 'May — Aug 2026',
    summary:
      'Architected a distributed AI gateway on Azure Kubernetes, routing model traffic through Envoy with Helm and ArgoCD delivery. Put internal APIs behind MCP servers with per-user tool scoping, and rebuilt the RAG ingestion, embedding, and ranking pipelines on Databricks Delta Lake.',
    stack: ['Kubernetes', 'Envoy', 'Helm', 'ArgoCD', 'Databricks', 'Spark'],
    metrics: [
      { value: '450K+', label: 'requests routed per day' },
      { value: '68% → 89%', label: 'tool-selection accuracy' },
      { value: '+40%', label: 'retrieval recall' },
    ],
  },
  {
    year: '2025',
    org: 'JAGGAER',
    role: 'AI Engineering Intern',
    location: 'Durham, NC',
    period: 'Jun — Aug 2025',
    summary:
      'Built a Python retrieval and orchestration agent over a four-million-supplier corpus, then automated the training, retraining, and inference pipelines behind it so the vector index stayed current without anyone babysitting a notebook.',
    stack: ['Python', 'Vector search', 'GitHub Actions'],
    metrics: [
      { value: '4M+', label: 'supplier corpus' },
      { value: '+25%', label: 'matching accuracy over baseline' },
      { value: '−40%', label: 'procurement cycle time' },
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
    metrics: [
      { value: '94–96%', label: 'balanced accuracy' },
      { value: '11 / 11', label: 'labels beating the 0.88 F1 benchmark' },
      { value: '1st of 40', label: '2025 research symposium' },
    ],
  },
];
