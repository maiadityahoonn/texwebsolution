<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# CRM Architecture & File Size Enforcement Rules

## 1. Strict File Size Constraint
- **Absolute Hard Limit**: No single CRM file in `src/components/crm/`, `src/services/crm/`, or `src/app/(crm)/` may exceed **30 KB**.
- **Ideal Target Range**: Every file should stay between **15 KB and 25 KB** (smaller focused components/utilities under 15 KB are completely fine).
- **Proactive Threshold**: If any file reaches **22 KB - 25 KB**, it must NOT receive direct feature additions. Instead, sub-components, tabs, or helper hooks must be extracted.

## 2. Rules for Adding New Features, Upgrades & Modifications
Whenever a new CRM feature, enhancement, or field is added:
1. **Never bloat existing files**:
   - Do NOT dump new UI blocks or modals into `CrmWorkspaceView.jsx`, `PipelineView.jsx`, `CrmAppLayout.jsx`, or existing large files.
   - Do NOT add large handler blocks directly to `useCrmWorkspaceModals.js` or `useCrmCalculations.js`.
2. **Dedicated Modular Structure**:
   - **New Section / View**: Create a new folder/file under `src/components/crm/[module]/[ViewName].jsx`
   - **New Popup Modal or Drawer**: Create a dedicated component in `src/components/crm/shared/modals/[FeatureModal].jsx` (keep it under 20 KB)
   - **Complex Modal Tabs**: Extract individual tabs into `src/components/crm/shared/modals/[modal-name]/[TabName].jsx`
   - **Business Logic & State**: Create a dedicated custom hook in `src/components/crm/hooks/use[FeatureName].js`
   - **API & Database Queries**: Add to or create a service in `src/services/crm/[feature]Service.js`
   - **Pure Utilities / Formatters**: Create `src/components/crm/shared/[feature]Utils.js`
3. **Verification**:
   - Run `npm run check:crm-size` to verify that all files remain strictly under 30 KB.
   - Run `npm run build` to ensure 0 compiler/runtime errors.
