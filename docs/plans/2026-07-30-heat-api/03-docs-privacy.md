# Plan 03 — Docs 隐私与遥测说明

**独占：**  
- `apps/web/src/components/install/DocsHome.tsx`（或 docs 页专用组件）  
- `apps/web/src/messages/{zh,en}/pages.json`  
- 可选 `InstallHub.tsx` 增加链到遥测 FAQ（不改 Home）

**禁止：** api/** · skills/** · lib/heat/**

## 实现清单

1. Docs 增加「隐私与遥测」章节：采集/不采集、关闭方式、TELEMETRY_URL、热度≠质量、复制不进主榜  
2. zh/en 键对称  
3. build 通过  
4. `reports/03-report.md`  
