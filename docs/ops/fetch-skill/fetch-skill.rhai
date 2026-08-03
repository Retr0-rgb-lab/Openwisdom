let meta = #{
    name: "fetch-skill",
    description: "Discover open-source social-science agent skills from public sources, filter and score them, pause for human review, optionally sketch community drafts under docs/ops",
    when_to_use: "Periodic Openwisdom community skill refresh (GitHub, X, Reddit, Xiaohongshu)",
    phases: [
        #{ title: "Scoop", detail: "parallel source search" },
        #{ title: "Normalize", detail: "merge, dedupe, hard filter" },
        #{ title: "DeepDive", detail: "score shortlisted candidates" },
        #{ title: "Report", detail: "write run report under docs/ops" },
        #{ title: "Gate", detail: "human review pause" },
        #{ title: "Draft", detail: "optional draft notes (no skills/ write)" },
    ],
};

// --- args (no wall clock in host; pass since explicitly) ---
let root = "E:/学习软件/Openwisdom";
let since = "2026-01-01";
let max_per_source = 6;
let max_deep = 8;
let write_drafts = false;
let run_label = "manual";

if args != () {
    if args.root != () { root = args.root; }
    if args.since != () { since = args.since; }
    if args.max_per_source != () { max_per_source = args.max_per_source; }
    if args.max_deep != () { max_deep = args.max_deep; }
    if args.write_drafts != () { write_drafts = args.write_drafts; }
    if args.run_label != () { run_label = args.run_label; }
}

let ops = root + "/docs/ops/fetch-skill";
let criteria_path = ops + "/CRITERIA.md";
let blocklist_path = ops + "/blocklist.json";
let watchlist_path = ops + "/watchlist.json";
let catalog_path = root + "/apps/web/public/registry/catalog.json";
let skills_root = root + "/skills";
let runs_dir = ops + "/runs/" + run_label;
let report_template = ops + "/templates/run-report.md";

// --- output schemas ---
let scoop_schema = #{
    "type": "object",
    "required": ["items"],
    "properties": #{
        "items": #{
            "type": "array",
            "maxItems": 8,
            "items": #{
                "type": "object",
                "required": ["title", "url", "channel"],
                "properties": #{
                    "title": #{ "type": "string" },
                    "url": #{ "type": "string" },
                    "channel": #{ "type": "string" },
                    "snippet": #{ "type": "string" },
                    "repo": #{ "type": "string" },
                    "confidence": #{ "type": "number" },
                },
            },
        },
        "notes": #{ "type": "string" },
        "source_ok": #{ "type": "boolean" },
    },
};

let normalize_schema = #{
    "type": "object",
    "required": ["candidates", "counts"],
    "properties": #{
        "candidates": #{
            "type": "array",
            "maxItems": 24,
            "items": #{
                "type": "object",
                "required": ["id", "status", "title", "url", "channel"],
                "properties": #{
                    "id": #{ "type": "string" },
                    "status": #{ "type": "string" },
                    "title": #{ "type": "string" },
                    "url": #{ "type": "string" },
                    "channel": #{ "type": "string" },
                    "repo": #{ "type": "string" },
                    "skill_path": #{ "type": "string" },
                    "snippet": #{ "type": "string" },
                    "license": #{ "type": "string" },
                    "language": #{ "type": "string" },
                    "reject_reason": #{ "type": "string" },
                },
            },
        },
        "counts": #{
            "type": "object",
            "required": ["discovered", "shortlisted", "filtered_out"],
            "properties": #{
                "discovered": #{ "type": "number" },
                "shortlisted": #{ "type": "number" },
                "filtered_out": #{ "type": "number" },
            },
        },
        "notes": #{ "type": "string" },
    },
};

let deep_schema = #{
    "type": "object",
    "required": ["scored"],
    "properties": #{
        "scored": #{
            "type": "array",
            "maxItems": 12,
            "items": #{
                "type": "object",
                "required": ["id", "status", "title", "url"],
                "properties": #{
                    "id": #{ "type": "string" },
                    "status": #{ "type": "string" },
                    "title": #{ "type": "string" },
                    "url": #{ "type": "string" },
                    "repo": #{ "type": "string" },
                    "license": #{ "type": "string" },
                    "proposed_layer": #{ "type": "string" },
                    "proposed_scope": #{ "type": "string" },
                    "disciplines": #{ "type": "array", "items": #{ "type": "string" } },
                    "fit": #{ "type": "number" },
                    "quality": #{ "type": "number" },
                    "license_clear": #{ "type": "number" },
                    "maintainability": #{ "type": "number" },
                    "notes": #{ "type": "string" },
                    "reject_reason": #{ "type": "string" },
                },
            },
        },
        "ready_count": #{ "type": "number" },
        "notes": #{ "type": "string" },
    },
};

let report_schema = #{
    "type": "object",
    "required": ["report_path", "summary", "ready_count"],
    "properties": #{
        "report_path": #{ "type": "string" },
        "summary": #{ "type": "string" },
        "ready_count": #{ "type": "number" },
        "next_actions": #{ "type": "array", "items": #{ "type": "string" } },
    },
};

let draft_schema = #{
    "type": "object",
    "required": ["draft_dir", "written"],
    "properties": #{
        "draft_dir": #{ "type": "string" },
        "written": #{ "type": "array", "items": #{ "type": "string" } },
        "notes": #{ "type": "string" },
    },
};

// ========== Scoop ==========
phase("Scoop");
log("fetch-skill Scoop: github / x / reddit / xhs (fail-open per source)");

let common_ctx = "";
common_ctx += "Openwisdom is an open-source SOCIAL-SCIENCE agent skills library (psychology, sociology, history, political-science, economics; orientation scenarios; critical thinking / research methods). ";
common_ctx += "NOT a general coding-skills dump, NOT a hosted chatbot. ";
common_ctx += "Read criteria file with read_file: " + criteria_path + ". ";
common_ctx += "Read blocklist if present: " + blocklist_path + " and skip those URLs/slugs. ";
common_ctx += "Search window lower bound since=" + since + ". ";
common_ctx += "Return at most " + max_per_source.to_string() + " items. Empty items is valid ONLY after real tool searches. ";
common_ctx += "Each item needs title, url, channel, optional snippet/repo/confidence 0-1. Prefer links to GitHub repos containing SKILL.md. ";

let gh_prompt = common_ctx;
gh_prompt += "You are the GitHub scoop agent. Use web_search and open_page/web_fetch tools. ";
gh_prompt += "Query ideas: SKILL.md agent skills social science, Claude skills research methodology, psychology sociology history political science economics agent skill repo, agentskills.io style packs. ";
gh_prompt += "channel must be \"github\". Prefer MIT/Apache repos. Set source_ok true if searches ran.";

let x_prompt = common_ctx;
x_prompt += "You are the X (Twitter) scoop agent. Use x_keyword_search / x_semantic_search / web_search. ";
x_prompt += "Find posts linking open agent skills / SKILL.md relevant to social science, research methods, critical thinking, decision frameworks. ";
x_prompt += "channel must be \"x\". Always prefer extracting a github URL into repo when present. Set source_ok true if searches ran.";

let reddit_prompt = common_ctx;
reddit_prompt += "You are the Reddit scoop agent. Use web_search with site:reddit.com. ";
reddit_prompt += "Look for threads about Claude/Cursor/Codex skills packs for research, academia, social science, critical thinking. ";
reddit_prompt += "channel must be \"reddit\". Link to underlying GitHub when possible. Set source_ok true if searches ran.";

let xhs_prompt = common_ctx;
xhs_prompt += "You are the Xiaohongshu (小红书) scoop agent. Use web_search for 小红书 agent skill / Claude skill / Cursor skill 社科 研究方法 方法. ";
xhs_prompt += "channel must be \"xhs\". Most posts lack source code: still record useful titles/urls as low confidence clues; do not invent GitHub links. ";
xhs_prompt += "If tools cannot access xhs, set source_ok false, items [], notes explaining fail-open. Empty is OK after attempting search.";

let scoop_jobs = [
    #{
        label: "scoop-github",
        capability_mode: "read-only",
        output_schema: scoop_schema,
        prompt: gh_prompt,
    },
    #{
        label: "scoop-x",
        capability_mode: "read-only",
        output_schema: scoop_schema,
        prompt: x_prompt,
    },
    #{
        label: "scoop-reddit",
        capability_mode: "read-only",
        output_schema: scoop_schema,
        prompt: reddit_prompt,
    },
    #{
        label: "scoop-xhs",
        capability_mode: "read-only",
        output_schema: scoop_schema,
        prompt: xhs_prompt,
    },
];

let scoop_results = parallel(scoop_jobs);

let raw_items = [];
let scoop_notes = [];
let si = 0;
for r in scoop_results {
    let src_name = "source-" + si.to_string();
    if si == 0 { src_name = "github"; }
    if si == 1 { src_name = "x"; }
    if si == 2 { src_name = "reddit"; }
    if si == 3 { src_name = "xhs"; }

    if r == () || !r.success {
        scoop_notes.push(src_name + ": failed or empty slot (fail-open)");
        log("Scoop " + src_name + " failed — continue");
    } else if r.output.items == () {
        scoop_notes.push(src_name + ": no items field");
    } else {
        let n = 0;
        for it in r.output.items {
            if n >= max_per_source {
                log("Scoop " + src_name + ": truncated to max_per_source=" + max_per_source.to_string());
                break;
            }
            if it != () && it.url != () && it.title != () {
                raw_items.push(it);
                n += 1;
            }
        }
        if r.output.notes != () {
            scoop_notes.push(src_name + ": " + r.output.notes);
        }
    }
    si += 1;
}

log("Scoop collected raw_items=" + raw_items.len().to_string());

// ========== Normalize ==========
phase("Normalize");
log("fetch-skill Normalize: merge, dedupe vs catalog/skills, hard filter");

let raw_json = json_encode(raw_items);
let notes_json = json_encode(scoop_notes);

let norm_prompt = "";
norm_prompt += "You are the Openwisdom fetch-skill Normalize agent. Use read-only tools.\n";
norm_prompt += "Repo root: " + root + "\n";
norm_prompt += "MUST read: " + criteria_path + "\n";
norm_prompt += "MUST read blocklist: " + blocklist_path + " and watchlist: " + watchlist_path + "\n";
norm_prompt += "MUST inspect existing catalog and skills to dedupe: try " + catalog_path + " and list_dir/grep under " + skills_root + "\n";
norm_prompt += "Input raw scoop items (JSON):\n" + raw_json + "\n";
norm_prompt += "Scoop notes (JSON):\n" + notes_json + "\n";
norm_prompt += "Tasks:\n";
norm_prompt += "1) Normalize URLs; collapse duplicates by repo or url.\n";
norm_prompt += "2) Hard-filter per CRITERIA (license if known, domain fit, skill shape, not coding-marketing junk).\n";
norm_prompt += "3) Status shortlisted | filtered_out only at this stage (or deferred if watch-only clue).\n";
norm_prompt += "4) Assign stable id (slug or host-path style). channel one of github|x|reddit|xhs|other.\n";
norm_prompt += "5) Fill counts.discovered / shortlisted / filtered_out.\n";
norm_prompt += "proposed_scope is always community when relevant. Do NOT invent skills not in the input without a real url.\n";
norm_prompt += "Return schema candidates + counts. Empty shortlist is valid after real filtering.\n";

let norm = agent(norm_prompt, #{
    label: "normalize",
    capability_mode: "read-only",
    output_schema: normalize_schema,
});

let candidates = [];
let counts_discovered = raw_items.len();
let counts_shortlisted = 0;
let counts_filtered = 0;
let norm_notes = "";

if norm != () && norm.success && norm.output.candidates != () {
    candidates = norm.output.candidates;
    if norm.output.counts != () {
        if norm.output.counts.discovered != () { counts_discovered = norm.output.counts.discovered; }
        if norm.output.counts.shortlisted != () { counts_shortlisted = norm.output.counts.shortlisted; }
        if norm.output.counts.filtered_out != () { counts_filtered = norm.output.counts.filtered_out; }
    }
    if norm.output.notes != () { norm_notes = norm.output.notes; }
} else {
    log("Normalize failed — continuing with empty shortlist (fail closed for shortlist)");
    norm_notes = "normalize_failed";
}

let shortlisted = [];
for c in candidates {
    if c != () && c.status != () && c.status == "shortlisted" {
        shortlisted.push(c);
    }
}

// Cap deep-dive list in script (agents don't enforce caps)
let deep_input = [];
let di = 0;
for c in shortlisted {
    if di >= max_deep {
        log("DeepDive input truncated to max_deep=" + max_deep.to_string());
        break;
    }
    deep_input.push(c);
    di += 1;
}

log("Normalize shortlisted=" + shortlisted.len().to_string() + " deep_input=" + deep_input.len().to_string());

// ========== DeepDive ==========
phase("DeepDive");
log("fetch-skill DeepDive: score shortlist");

let deep_json = json_encode(deep_input);
let deep_prompt = "";
deep_prompt += "You are the Openwisdom fetch-skill DeepDive agent. Use read-only tools (web_fetch/open_page/web_search).\n";
deep_prompt += "Criteria: " + criteria_path + "\n";
deep_prompt += "Shortlisted candidates JSON:\n" + deep_json + "\n";
deep_prompt += "For EACH candidate: try to open the URL/repo; look for SKILL.md or skill folders; note license if visible.\n";
deep_prompt += "Score fit/quality/license_clear/maintainability 0-5. Threshold for ready_for_review: fit>=3 AND quality>=3 AND license_clear>=3; else rejected or deferred.\n";
deep_prompt += "proposed_scope MUST be \"community\". proposed_layer scenario|reference when possible.\n";
deep_prompt += "disciplines from: psychology, sociology, history, political-science, economics (subset).\n";
deep_prompt += "status: scored intermediate ok, but final status field must be ready_for_review | rejected | deferred | fetch_failed.\n";
deep_prompt += "If deep_input is empty, return scored=[] and ready_count=0 after acknowledging empty input.\n";
deep_prompt += "Do not write any files.\n";

let deep = agent(deep_prompt, #{
    label: "deep-dive",
    capability_mode: "read-only",
    output_schema: deep_schema,
});

let scored = [];
let ready_count = 0;
let deep_notes = "";
if deep != () && deep.success && deep.output.scored != () {
    scored = deep.output.scored;
    if deep.output.ready_count != () {
        ready_count = deep.output.ready_count;
    } else {
        for s in scored {
            if s != () && s.status != () && s.status == "ready_for_review" {
                ready_count += 1;
            }
        }
    }
    if deep.output.notes != () { deep_notes = deep.output.notes; }
} else {
    log("DeepDive failed or empty — ready_count=0");
    deep_notes = "deep_dive_failed";
}

// ========== Report ==========
phase("Report");
log("fetch-skill Report: write under docs/ops and scratch");

let scored_json = json_encode(scored);
let candidates_json = json_encode(candidates);

let report_prompt = "";
report_prompt += "You are the Openwisdom fetch-skill Report agent. WRITE files under the ops runs directory.\n";
report_prompt += "Root: " + root + "\n";
report_prompt += "Create directory if needed: " + runs_dir + "\n";
report_prompt += "Read template: " + report_template + "\n";
report_prompt += "Write markdown report to: " + runs_dir + "/report.md\n";
report_prompt += "Also write JSON snapshot to: " + runs_dir + "/candidates.json combining normalize+scored.\n";
report_prompt += "run_label=" + run_label + " since=" + since + "\n";
report_prompt += "counts: discovered=" + counts_discovered.to_string();
report_prompt += " shortlisted=" + counts_shortlisted.to_string();
report_prompt += " filtered_out=" + counts_filtered.to_string();
report_prompt += " ready_for_review=" + ready_count.to_string() + "\n";
report_prompt += "Normalize notes: " + norm_notes + "\n";
report_prompt += "DeepDive notes: " + deep_notes + "\n";
report_prompt += "Scored JSON:\n" + scored_json + "\n";
report_prompt += "All normalize candidates JSON:\n" + candidates_json + "\n";
report_prompt += "Report must list ready_for_review rows with scores and explicit human next actions.\n";
report_prompt += "Remind: never auto-write skills/official; catalog truth only via skills/ + catalog:build.\n";
report_prompt += "Return report_path, summary (short), ready_count, next_actions array.\n";

let rep = agent(report_prompt, #{
    label: "report",
    capability_mode: "read-write",
    output_schema: report_schema,
});

let report_path = runs_dir + "/report.md";
let report_summary = "fetch-skill report";
let next_actions = [
    "Review ready_for_review rows in the run report",
    "Update docs/ops/fetch-skill/blocklist.json and watchlist.json",
    "Manually adapt approved skills into skills/community then pnpm catalog:build",
];

if rep != () && rep.success {
    if rep.output.report_path != () { report_path = rep.output.report_path; }
    if rep.output.summary != () { report_summary = rep.output.summary; }
    if rep.output.ready_count != () { ready_count = rep.output.ready_count; }
    if rep.output.next_actions != () { next_actions = rep.output.next_actions; }
} else {
    log("Report agent failed — writing minimal scratch report only");
}

let scratch_body = "";
scratch_body += "# fetch-skill " + run_label + "\n\n";
scratch_body += report_summary + "\n\n";
scratch_body += "- report_path: " + report_path + "\n";
scratch_body += "- discovered: " + counts_discovered.to_string() + "\n";
scratch_body += "- shortlisted: " + counts_shortlisted.to_string() + "\n";
scratch_body += "- filtered_out: " + counts_filtered.to_string() + "\n";
scratch_body += "- ready_for_review: " + ready_count.to_string() + "\n\n";
scratch_body += "## Scored (JSON)\n\n```\n" + scored_json + "\n```\n";
let scratch_path = write_scratch_file("report.md", scratch_body);
log("scratch report: " + scratch_path);

// ========== Gate ==========
phase("Gate");
let gate_msg = "";
gate_msg += "fetch-skill human gate. Review report: " + report_path + " (and scratch report.md). ";
gate_msg += "ready_for_review=" + ready_count.to_string() + ". ";
gate_msg += "On resume: if write_drafts=true was passed, Draft phase will write ops draft notes only (still NOT skills/). ";
gate_msg += "Otherwise resume completes the run. Update blocklist/watchlist as needed.";
await_user("user", gate_msg);

// ========== Draft (optional) ==========
phase("Draft");
let draft_written = [];
let draft_dir = runs_dir + "/drafts";
let draft_notes = "skipped";

if write_drafts {
    log("Draft phase enabled — ops drafts only, no skills/ mutation");
    let draft_prompt = "";
    draft_prompt += "You are the Openwisdom fetch-skill Draft agent.\n";
    draft_prompt += "Write ONLY under: " + draft_dir + "\n";
    draft_prompt += "Do NOT modify " + skills_root + " or apps/web or packages.\n";
    draft_prompt += "For each scored item with status ready_for_review, write a markdown draft note ";
    draft_prompt += "<id>.md with: proposed path skills/community/{scenarios|references}/<slug>/SKILL.md, ";
    draft_prompt += "frontmatter sketch (name, description, layer, scope=community, disciplines, language, tags, version 0.1.0), ";
    draft_prompt += "provenance (source url, license), and TODO checklist for a human editor.\n";
    draft_prompt += "Scored JSON:\n" + scored_json + "\n";
    draft_prompt += "If none ready, create " + draft_dir + "/README.md saying none.\n";
    draft_prompt += "Return draft_dir, written (list of paths), notes.\n";

    let dr = agent(draft_prompt, #{
        label: "draft-ops",
        capability_mode: "read-write",
        output_schema: draft_schema,
    });

    if dr != () && dr.success {
        if dr.output.draft_dir != () { draft_dir = dr.output.draft_dir; }
        if dr.output.written != () { draft_written = dr.output.written; }
        if dr.output.notes != () { draft_notes = dr.output.notes; }
    } else {
        draft_notes = "draft_agent_failed";
        log("Draft agent failed");
    }
} else {
    log("write_drafts=false — skip Draft file writes");
    draft_notes = "write_drafts_false";
}

complete(#{
    summary: report_summary,
    run_label: run_label,
    root: root,
    since: since,
    report_path: report_path,
    scratch_path: scratch_path,
    counts: #{
        discovered: counts_discovered,
        shortlisted: counts_shortlisted,
        filtered_out: counts_filtered,
        ready_for_review: ready_count,
    },
    next_actions: next_actions,
    draft_dir: draft_dir,
    draft_written: draft_written,
    draft_notes: draft_notes,
    write_drafts: write_drafts,
});
