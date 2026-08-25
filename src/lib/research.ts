/**
 * SCRAN — smart-contract vulnerability detection. Texas A&M, Dec 2024 – May 2025.
 *
 * Every figure here is transcribed from the paper that ships at `paper.href`,
 * and the PDF is one click away on the same page. Where the paper reports a
 * weak result it is carried through unchanged; the comparison tables mark the
 * losses as plainly as the wins. Do not round anything up.
 */

export interface Author {
  name: string;
  department: string;
  institution: string;
  location: string;
  email: string;
  /** Renders with the accent treatment. */
  self?: boolean;
}

export interface ClassResult {
  /** Human-readable name, used everywhere the class is displayed. */
  name: string;
  /** The dataset's own label, shown small and in mono underneath. */
  label: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  auc: number;
}

export interface Stage {
  label: string;
  /** Set in mono under the label. Kept short enough to fit the diagram. */
  formula: string;
  note: string;
}

export const paper = {
  title: 'Smart Contract Residual Attention Net',
  acronym: 'SCRAN',
  subtitle: 'A hybrid residual-attention ensemble approach for vulnerability detection',
  href: '/research/Aman_Sriven_SCRAN_Smart_Contract_Vulnerability_Detection.pdf',
  pages: 7,
  year: '2025',
  period: 'December 2024 — May 2025',
  venue: 'Texas A&M University · MARE 491',
  award: '1st of 40 — 2025 undergraduate research symposium',
  /* Violet. Distinct from the four project accents, and it reads as ink on a
     dark page rather than as a product brand colour. */
  accent: '264 44% 66%',
  authors: [
    {
      name: 'Aman Sriven',
      department: 'Computer Science and Engineering',
      institution: 'Texas A&M University',
      location: 'College Station, TX',
      email: 'aman.sriven@tamu.edu',
      self: true,
    },
    {
      name: 'Dr. Irfan Khan',
      department: 'Computer Science and Engineering',
      institution: 'Texas A&M University at Galveston',
      location: 'Galveston, TX',
      email: 'irfankhan@tamu.edu',
    },
  ] satisfies Author[],
  abstract:
    'Smart Contracts (SCs) have transformed blockchain technology ecosystems, significantly improving transparency and automation across various industries. However, their increasing complexity highlights the importance of security and vulnerability detection. This research explores the comprehensive BCCC-SCsVul-2024 dataset, which consists of 111,897 Solidity source code samples and 11 vulnerability classes. We created a model named Smart Contract Residual Attention Net (SCRAN), which uses feed-forward neural networks and has an architecture specifically designed for smart contract vulnerability detection. SCRAN integrates residual connections and hierarchical scanning for preserving deep features and addressing vanishing gradient issues, along with multi-head attention mechanisms for identifying important feature relationships. The attention mechanisms, focal loss parameters, and use of balanced threshold selection in the model help address the class imbalance, which is persistent throughout the dataset. SCRAN employs an ensemble framework that combines the predictions of multiple models with varying hyperparameters for better generalization.',
  indexTerms: [
    'Smart contracts',
    'Vulnerability detection',
    'Deep learning',
    'Attention',
    'Class imbalance',
    'Ensemble learning',
  ],
} as const;

/** The four macro figures, precision included. It is the weakest of them. */
export const headline = [
  { value: '0.8703', label: 'macro F1' },
  { value: '0.9973', label: 'macro AUC' },
  { value: '0.9572', label: 'macro recall' },
  { value: '0.8069', label: 'macro precision' },
] as const;

export const dataset = [
  {
    term: 'Corpus',
    detail:
      'BCCC-SCsVul-2024 — 111,897 Solidity contracts, each reduced to 240 static features drawn from control-flow analysis and opcode statistics.',
  },
  {
    term: 'Labels',
    detail:
      'Eleven vulnerability classes plus a secure class, and a contract can carry more than one. The task is multi-label, not multi-class.',
  },
  {
    term: 'Imbalance',
    detail:
      'Some classes account for under one percent of samples. Nearly every design decision below exists because of that sentence.',
  },
  {
    term: 'Split',
    detail:
      '70 / 10 / 20 across train, validation, and test. The test set sees no oversampling, no augmentation, and no threshold tuning — thresholds are chosen on validation only.',
  },
] as const;

export const stages: Stage[] = [
  {
    label: 'Static features',
    formula: 'x ∈ ℝ²⁴⁰',
    note: 'Control-flow analysis and opcode statistics, z-score normalised per feature.',
  },
  {
    label: 'Residual FC ×2',
    formula: 'LayerNorm · ReLU · Dropout',
    note: 'Two fully connected blocks with skip connections, projected when the dimensions do not line up.',
  },
  {
    label: 'Multi-head attention',
    formula: 'softmax(QKᵀ/√d)·V',
    note: 'Positional encoding, scaled dot-product attention, then a residual LayerNorm and a GELU feed-forward block.',
  },
  {
    label: 'Class-specific heads',
    formula: 'αⱼ = softmax(aⱼ)',
    note: 'Eleven attention heads, one per vulnerability, each weighting the feature dimensions independently.',
  },
  {
    label: 'Per-class sigmoid',
    formula: 'ŷ ∈ [0,1]¹¹',
    note: 'Thresholds are chosen per class off the precision–recall curve rather than left at 0.5.',
  },
];

/** Paper order. Components sort as they need to. */
export const classes: ClassResult[] = [
  {
    name: 'External bug',
    label: 'ExternalBug',
    accuracy: 0.9866,
    precision: 0.7306,
    recall: 0.9254,
    f1: 0.8166,
    auc: 0.9967,
  },
  {
    name: 'Gas exception',
    label: 'GasException',
    accuracy: 0.9782,
    precision: 0.7598,
    recall: 0.9425,
    f1: 0.8414,
    auc: 0.9954,
  },
  {
    name: 'Mishandled exception',
    label: 'MishandledException',
    accuracy: 0.9786,
    precision: 0.7006,
    recall: 0.9277,
    f1: 0.7983,
    auc: 0.994,
  },
  {
    name: 'Timestamp dependence',
    label: 'Timestamp',
    accuracy: 0.9795,
    precision: 0.5434,
    recall: 0.8914,
    f1: 0.6752,
    auc: 0.9924,
  },
  {
    name: 'Transaction order dependence',
    label: 'TOD',
    accuracy: 0.9791,
    precision: 0.6213,
    recall: 0.9161,
    f1: 0.7404,
    auc: 0.9942,
  },
  {
    name: 'Unused return',
    label: 'UnusedReturn',
    accuracy: 0.9849,
    precision: 0.6497,
    recall: 0.9519,
    f1: 0.7723,
    auc: 0.9969,
  },
  {
    name: 'Weak access modifier',
    label: 'WeakAccessMod',
    accuracy: 0.9974,
    precision: 0.8736,
    recall: 0.9896,
    f1: 0.928,
    auc: 0.9999,
  },
  {
    name: 'Call to unknown',
    label: 'CallToUnknown',
    accuracy: 0.9934,
    precision: 0.9509,
    recall: 0.9865,
    f1: 0.9684,
    auc: 0.9995,
  },
  {
    name: 'Denial of service',
    label: 'DenialOfService',
    accuracy: 0.9942,
    precision: 0.9621,
    recall: 0.9857,
    f1: 0.9737,
    auc: 0.9995,
  },
  {
    name: 'Integer under/overflow',
    label: 'IntegerUO',
    accuracy: 0.992,
    precision: 0.9563,
    recall: 0.9926,
    f1: 0.9741,
    auc: 0.9996,
  },
  {
    name: 'Re-entrancy',
    label: 'Reentrancy',
    accuracy: 0.9898,
    precision: 0.9567,
    recall: 0.9799,
    f1: 0.9681,
    auc: 0.9994,
  },
  {
    name: 'Secure',
    label: 'NonVulnerable',
    accuracy: 0.9937,
    precision: 0.9775,
    recall: 0.9968,
    f1: 0.9871,
    auc: 0.9998,
  },
];

export const macro: ClassResult = {
  name: 'Macro average',
  label: 'macro',
  accuracy: 0.9873,
  precision: 0.8069,
  recall: 0.9572,
  f1: 0.8703,
  auc: 0.9973,
};

/**
 * Table II — the prior model on this exact dataset. Two-decimal values,
 * because that is the precision the paper prints them at.
 */
export const ega = {
  name: 'EGA profiling',
  citation: 'HajiHosseinKhani et al., 2024',
  approach:
    'An enhanced genetic algorithm that evolves feature subsets, built for explainability: every vulnerability maps back to named attributes of the source.',
  macro: { scranF1: 0.87, egaF1: 0.75, scranPrecision: 0.81, egaPrecision: 0.86 },
  rows: [
    { name: 'External bug', scranF1: 0.82, egaF1: 0.61 },
    { name: 'Gas exception', scranF1: 0.84, egaF1: 0.64 },
    { name: 'Mishandled exception', scranF1: 0.79, egaF1: 0.6 },
    { name: 'Timestamp dependence', scranF1: 0.68, egaF1: 0.58 },
    { name: 'Transaction order dependence', scranF1: 0.74, egaF1: 0.61 },
    { name: 'Unused return', scranF1: 0.77, egaF1: 0.56 },
    { name: 'Weak access modifier', scranF1: 0.93, egaF1: 0.75 },
    { name: 'Call to unknown', scranF1: 0.97, egaF1: 0.65 },
    { name: 'Denial of service', scranF1: 0.97, egaF1: 0.62 },
    { name: 'Integer under/overflow', scranF1: 0.97, egaF1: 0.75 },
    { name: 'Re-entrancy', scranF1: 0.97, egaF1: 0.67 },
    { name: 'Secure', scranF1: 0.99, egaF1: 0.96 },
  ],
} as const;

/**
 * Tables III–VI. These four models were evaluated on other corpora, so the
 * rows are indicative rather than like-for-like — and two of them beat SCRAN
 * on timestamp dependence. Both facts are on the page.
 */
export const baselines = [
  {
    model: 'EA-RGCN',
    citation: 'Chen et al., 2023',
    approach: 'Residual graph convolution with edge attention over semantic graphs.',
    metric: 'Accuracy',
    rows: [
      { name: 'Re-entrancy', scran: 0.9898, other: 0.912 },
      { name: 'Timestamp dependence', scran: 0.9795, other: 0.875 },
    ],
  },
  {
    model: 'MH-NEC',
    citation: 'He et al., 2024',
    approach: 'Handcrafted feature graphs fused by node and edge attention.',
    metric: 'F1',
    rows: [
      { name: 'Re-entrancy', scran: 0.9681, other: 0.9255 },
      { name: 'Timestamp dependence', scran: 0.6752, other: 0.8463 },
      { name: 'Weak access modifier', scran: 0.928, other: 0.6136 },
    ],
  },
  {
    model: 'MEVD',
    citation: 'Guo et al., 2024',
    approach: 'Transformer and CNN branches over a residual shrinkage network.',
    metric: 'F1',
    rows: [
      { name: 'Re-entrancy', scran: 0.9681, other: 0.8928 },
      { name: 'Timestamp dependence', scran: 0.6752, other: 0.9104 },
      { name: 'Denial of service', scran: 0.9737, other: 0.8621 },
    ],
  },
  {
    model: 'DeepFusion',
    citation: 'Deng et al., 2023',
    approach: 'Decision fusion across source, bytecode, and control-flow modalities.',
    metric: 'AUC',
    rows: [
      { name: 'Re-entrancy', scran: 0.9994, other: 0.852 },
      { name: 'Unused return', scran: 0.9969, other: 0.825 },
      { name: 'Integer under/overflow', scran: 0.9996, other: 0.834 },
      { name: 'Transaction order dependence', scran: 0.9942, other: 0.886 },
    ],
  },
] as const;

export interface Ablation {
  name: string;
  detail: string;
  /** Null where the paper reports the effect qualitatively instead. */
  f1: number | null;
  auc: number | null;
  /** The configuration the reported headline numbers come from. */
  shipped?: boolean;
}

export const ablation: Ablation[] = [
  {
    name: 'Full ensemble',
    detail: 'Three models, focal loss, SMOTE and augmentation, tuned thresholds.',
    f1: 0.8703,
    auc: 0.9973,
    shipped: true,
  },
  {
    name: 'Single model',
    detail: 'One instance rather than three. Higher F1, lower AUC.',
    f1: 0.8762,
    auc: 0.9964,
  },
  {
    name: 'No focal loss',
    detail: 'The focal objective replaced by ordinary weighted cross-entropy.',
    f1: 0.844,
    auc: 0.9951,
  },
  {
    name: 'No SMOTE or augmentation',
    detail: 'Recall on the minority classes falls by roughly 30%.',
    f1: null,
    auc: null,
  },
];

export const training = [
  {
    term: 'Oversampling',
    detail:
      'SMOTE per class where the positive count exceeds five, at a sampling ratio of min(0.3, 3nⱼ/N). Only the synthetic rows are appended, each one-hot for its own class, so the multi-label structure survives.',
  },
  {
    term: 'Augmentation',
    detail:
      'Twenty thousand perturbed samples: additive Gaussian noise at σ = 0.1, per-feature scaling drawn from U(0.9, 1.1), and Bernoulli(0.95) feature dropout.',
  },
  {
    term: 'Class weights',
    detail:
      'Positive weights scale with the imbalance ratio and are clipped to [1, 75], with an extra multiplier for classes past a ratio of ten and again for classes with fewer than ten positives.',
  },
  {
    term: 'Objective',
    detail:
      'Multi-label focal loss. The three ensemble members use different focusing parameters — γ ∈ {2.0, 2.5, 3.0} — so they fail on different things.',
  },
  {
    term: 'Optimisation',
    detail:
      'AdamW at weight decay 0.01, learning rates {3.0, 3.6, 4.2} × 10⁻⁵, batch size 32, 150 epochs, early stopping at a patience of 15.',
  },
  {
    term: 'Aggregation',
    detail:
      'Logits are averaged with per-class weights derived from each model’s validation F1, then thresholded per class off the precision–recall curve, maximising F1 subject to recall ≥ 0.5 wherever the imbalance ratio passes ten.',
  },
  {
    term: 'Cost',
    detail: 'All three models train in about twelve hours on a single GPU.',
  },
] as const;

export const citation = `@misc{sriven2025scran,
  title  = {Smart Contract Residual Attention Net (SCRAN): A Hybrid
            Residual-Attention Ensemble Approach for Vulnerability Detection},
  author = {Sriven, Aman and Khan, Irfan},
  year   = {2025},
  note   = {Undergraduate research, Texas A\\&M University}
}`;
