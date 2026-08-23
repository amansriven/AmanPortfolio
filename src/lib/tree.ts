export interface TreeNodeData {
  label: string;
  detail?: string;
  /** `deterministic` nodes are highlighted: code decides, not a model. */
  kind?: 'model' | 'deterministic' | 'group' | 'default';
  /** Small mono annotation shown beside the label. */
  note?: string;
  children?: TreeNodeData[];
}
