# Plan — Skills 全方位整改（2026-07-30）

权威 Spec：[16-Skills全方位整改-SPE](../../specs/16-Skills全方位整改-SPE.md)

## Waves

| Plan | Wave | Owner lane | 文件焦点 |
|------|------|------------|----------|
| [01-content-seed](./01-content-seed.md) | A | Data | `data/catalog/*` |
| [02-global-search](./02-global-search.md) | B | Chrome | `site/*`, `ui/command`, `ui/dialog` |
| [03-catalog-layout](./03-catalog-layout.md) | C | Catalog | `skills/SkillsCatalog*` |
| [04-detail-page](./04-detail-page.md) | D | Detail | `skills/SkillDetail*` |
| [05-verify](./05-verify.md) | E | Lead | build · i18n · detector |

## 并行

```text
A ──┬──► C ──┐
    │        ├──► E
B ──┘   D ──┘
```

B 可先用 `getCatalog()`；C/D 需 A 的字段与种子。
