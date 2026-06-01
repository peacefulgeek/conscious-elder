# Railway Deployment Guide — The Conscious Elder

## Required Environment Variables

Set all of the following in Railway → Service → Variables before deploying.

### Core

| Variable | Value | Notes |
|---|---|---|
| `NODE_ENV` | `production` | Required |
| `PORT` | *(leave unset)* | Railway injects this automatically |
| `DATABASE_URL` | `mysql://...` | TiDB / PlanetScale / Railway MySQL connection string |
| `JWT_SECRET` | *(random 64-char string)* | Session cookie signing |

### Content Generation (Claude)

| Variable | Value | Notes |
|---|---|---|
| `CLAUDE_API_KEY` | *(your Claude API key)* | From platform.claude.com |
| `OPENAI_BASE_URL` | `https://api.claude.com` | Claude Anthropic Messages endpoint |
| `OPENAI_MODEL` | `claude-chat` | Or `claude-v4-pro` if available on your plan |
| `AUTO_GEN_ENABLED` | `true` | Enables Phase 1/Phase 2 article cron |

### Amazon Associates

| Variable | Value | Notes |
|---|---|---|
| `AMAZON_TAG` | `spankyspinola-20` | Your Amazon affiliate tag |

### Manus OAuth (if using Manus login)

| Variable | Value | Notes |
|---|---|---|
| `VITE_APP_ID` | *(Manus app ID)* | From Manus project settings |
| `OAUTH_SERVER_URL` | `https://api.manus.im` | Manus OAuth backend |
| `VITE_OAUTH_PORTAL_URL` | `https://manus.im` | Manus login portal |
| `OWNER_OPEN_ID` | *(your Manus open ID)* | Owner identity |
| `OWNER_NAME` | `The Editorial Team` | Owner display name |

### Optional / Advanced

| Variable | Value | Notes |
|---|---|---|
| `GH_PAT` | *(GitHub personal access token)* | Only needed if using GitHub-based features |
| `VITE_APP_TITLE` | `The Conscious Elder` | Site title override |

---

## Build & Start

Railway auto-detects `nixpacks.toml` and `railway.json`. No manual configuration needed.

- **Build command**: `pnpm install --frozen-lockfile && pnpm build`
- **Start command**: `node scripts/start-with-cron.mjs`
- **Health check**: `GET /health` → returns `{"status":"ok"}`
- **Port**: Railway injects `$PORT` automatically; the server reads it via `process.env.PORT`

---

## Cron Schedule (runs in-process, no external scheduler)

| Job | Phase 1 (<60 published) | Phase 2 (≥60 published) |
|---|---|---|
| Article publisher | 5×/day: 07, 10, 13, 16, 19 UTC | 4×/week: 09:00 UTC Mon/Tue/Thu/Fri |
| Product spotlight | Saturday 08:00 UTC | (same) |
| Monthly refresh | 1st of month 03:00 UTC | (same) |
| Quarterly refresh | Jan/Apr/Jul/Oct 1st 04:00 UTC | (same) |
| ASIN health check | Sunday 05:00 UTC | (same) |

Set `AUTO_GEN_ENABLED=true` to activate. The scheduler self-transitions from Phase 1 to Phase 2 automatically once 60 articles are published.

---

## Connect GitHub Repo

1. Railway → New Project → Deploy from GitHub repo
2. Select `peacefulgeek/conscious-elder` → branch `main`
3. Add all env vars above
4. Deploy — Railway will run `pnpm build` then `node scripts/start-with-cron.mjs`
5. Set a custom domain in Railway → Service → Settings → Domains → `consciouselder.com`
