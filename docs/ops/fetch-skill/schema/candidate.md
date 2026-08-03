# Candidate 字段约定

与 workflow 内 JSON Schema 对齐；落盘 `candidates.json` 时尽量遵循。

```ts
type Channel = "github" | "x" | "reddit" | "xhs" | "other";

type CandidateStatus =
  | "discovered"
  | "normalized"
  | "filtered_out"
  | "shortlisted"
  | "fetch_failed"
  | "scored"
  | "rejected"
  | "ready_for_review"
  | "deferred"
  | "approved"
  | "declined";

type SkillCandidate = {
  /** Stable id: prefer repo+path hash or slug-url */
  id: string;
  status: CandidateStatus;
  channel: Channel;
  title: string;
  url: string;
  repo?: string;
  skill_path?: string;
  snippet?: string;
  license?: string;
  language?: string;
  proposed_layer?: "scenario" | "reference";
  proposed_scope?: "community"; // automatic path always community
  disciplines?: string[];
  tags?: string[];
  scores?: {
    fit: number;          // 0-5
    quality: number;      // 0-5
    license_clear: number; // 0-5
    maintainability?: number;
    notes?: string;
  };
  reject_reason?: string;
  provenance?: string;
};
```

## Run 摘要字段

```ts
type FetchSkillRunSummary = {
  run_label: string;
  root: string;
  since: string;
  counts: {
    discovered: number;
    shortlisted: number;
    ready_for_review: number;
    filtered_out: number;
  };
  report_path?: string;
  next_actions: string[];
};
```
