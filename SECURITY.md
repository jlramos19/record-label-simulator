# Security

## CVE-2025-55182 (React Server Components)
Record Label Simulator is a client-only Vite SPA. React Server Components (RSC) are not used here, so the CVE does not apply unless `react-server-dom-*` or `next` are installed.

### How to check for vulnerable packages
Run in the repo root (and in `ui-react/` if you use it):
```bash
npm ls react-server-dom-webpack react-server-dom-parcel react-server-dom-turbopack next
```

### Fixed versions (minimums)
If any of those packages appear, upgrade to patched releases:
- `react-server-dom-webpack` >= `18.3.1` (or `19.0.0+` if on React 19)
- `react-server-dom-parcel` >= `18.3.1`
- `react-server-dom-turbopack` >= `19.0.0`
- `next` >= `15.0.0`

If advisories require newer versions, follow the advisory minimums.
