# Plan A: Logo tokens + purge copper primary

> **For agentic workers:** independent; ~0.5d  
> **Spec:** 07 §2–3 · 11 W1  
> **工作目录:** `E:\学习软件\Openwisdom\apps\web`

### Task A.1: Remap globals.css
**Files:** Modify `src/app/globals.css`

- [ ] Set field `#F8F9FA`, primary `#1C4BD1`, structure `#2E6975`, signal `#E69622`, mist `#88ADC0`
- [ ] Map shadcn `--primary` / `--ring` / `--accent` per Spec 07
- [ ] Remove or alias `--ow-datum` copper; document one-release alias if needed
- [ ] Update discipline CSS vars

### Task A.2: Grep purge
- [ ] `rg "B87333|text-datum|bg-datum|border-datum|ow-datum" src`
- [ ] Replace with primary/signal/structure utilities

### Task A.3: Build
```bash
pnpm build
```

## Acceptance
- [ ] No copper as `--primary`
- [ ] Build green
