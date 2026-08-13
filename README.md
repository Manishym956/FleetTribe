# FleetTribe — Fleet Intelligence Platform

FleetTribe transforms driver behaviour and vehicle telemetry into explainable risk and maintenance insights. Built for the **VexarDrive Technologies — Data Science Intern Assignment**.

| Metric | Value |
|--------|-------|
| Drivers | 30 |
| Vehicles | 30 |
| Trips | 450 |
| Telemetry records | 12,987 |

---

## Project Structure

```
V/
├── analysis/          # Python analytical pipeline
│   ├── pipeline.py    # Main pipeline runner
│   └── outputs/       # Generated JSON (canonical source)
├── app/               # Next.js 16 application
│   ├── app/           # App Router pages
│   ├── components/    # UI components
│   └── lib/data/      # Copied JSON at build/dev time
├── docs/              # Technical documentation
└── LOGGER.md          # Engineering decision log
```

---

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | 20+ | Next.js frontend |
| **npm** | 10+ | Package manager |
| **Python** | 3.10+ | Analytical pipeline |
| **openpyxl** | latest | Excel parsing (`pip install openpyxl pandas numpy`) |
| **Supabase account** | free tier | Google OAuth (required for `/app/*` routes) |

---

## 1. Run the Analytical Pipeline (Optional)

The app ships with precomputed JSON in `analysis/outputs/`. Re-run the pipeline only if you change scoring logic or receive a new dataset.

```powershell
# From the project root (V/)
pip install pandas numpy openpyxl

python analysis/pipeline.py
```

This reads `VEXAR_Fleet_Dataset_CANDIDATE_VERSION.xlsx` and writes:

- `analysis/outputs/driver_features.json`
- `analysis/outputs/vehicle_features.json`
- `analysis/outputs/trip_features.json`
- `analysis/outputs/fleet_summary.json`
- `analysis/outputs/methodology.json`

Validate outputs (optional):

```powershell
python analysis/test_outputs.py
```

---

## 2. Run the Frontend Application

```powershell
# Install dependencies (first time only)
cd app
npm install

# Start development server (auto-copies JSON → app/lib/data/)
npm run dev
```

Open **http://localhost:3000**

### Available Routes

| Route | Auth required | Description |
|-------|---------------|-------------|
| `/` | No | Landing page |
| `/auth` | No | Google sign-in |
| `/app` | **Yes** | Fleet overview dashboard |
| `/app/drivers` | **Yes** | Driver intelligence table |
| `/app/drivers/D19` | **Yes** | Driver detail (30 SSG pages) |
| `/app/vehicles` | **Yes** | Vehicle health table |
| `/app/vehicles/V19` | **Yes** | Vehicle detail (30 SSG pages) |
| `/app/methodology` | **Yes** | Methodology documentation |

### Production Build

```powershell
cd app
npm run build    # copies data + builds 70 static pages
npm start        # serves on http://localhost:3000
```

---

## 3. OAuth — Current Status

**OAuth is implemented in code but NOT yet configured in this workspace.**

Evidence:

- Auth page (`/auth`) and callback route (`/auth/callback`) exist
- Middleware protects all `/app/*` routes
- **No `.env.local` file is present** — Supabase credentials must be added by you

Without environment variables, the landing page works, but signing in will fail and `/app` redirects to `/auth` without a working OAuth flow.

---

## 4. Enable Google OAuth (Step-by-Step)

### Step A — Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click **New project**
3. Choose an organization, name (e.g. `fleettribe`), database password, and region
4. Wait for the project to finish provisioning

### Step B — Get Supabase API Keys

1. In Supabase Dashboard → **Project Settings** → **API**
2. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> Never commit the **service_role** key. Only the anon key belongs in the frontend.

### Step C — Enable Google Provider in Supabase

1. Supabase Dashboard → **Authentication** → **Providers**
2. Enable **Google**
3. You will need a Google OAuth Client ID and Secret (Step D)
4. Paste them into the Google provider settings in Supabase
5. Note the **Callback URL** Supabase shows — it looks like:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```

### Step D — Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Application type: **Web application**
6. Add **Authorized redirect URIs**:
   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```
7. Copy the **Client ID** and **Client Secret** back into Supabase (Step C)

> For local testing, Google OAuth works through Supabase's callback — you do not need a separate `localhost` redirect in Google Cloud unless you bypass Supabase.

### Step E — Configure Redirect URLs in Supabase

1. Supabase Dashboard → **Authentication** → **URL Configuration**
2. Set **Site URL**:
   - Development: `http://localhost:3000`
   - Production: `https://your-domain.vercel.app`
3. Add **Redirect URLs**:
   ```
   http://localhost:3000/auth/callback
   https://your-domain.vercel.app/auth/callback
   ```

### Step F — Create Local Environment File

Create `app/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Restart the dev server after creating or changing this file:

```powershell
cd app
npm run dev
```

### Step G — Test OAuth

1. Open http://localhost:3000/auth
2. Click **Continue with Google**
3. Complete Google sign-in
4. You should land on `/app` (Fleet Overview)

If sign-in fails, check:

- `.env.local` values are correct and the dev server was restarted
- Google provider is enabled in Supabase with valid Client ID/Secret
- `http://localhost:3000/auth/callback` is in Supabase Redirect URLs
- Browser console and Supabase **Authentication → Logs** for error details

---

## 5. Deploy to Vercel

### Step 1 — Push to GitHub

```powershell
git init
git add .
git commit -m "FleetTribe initial release"
git remote add origin https://github.com/your-username/fleettribe.git
git push -u origin main
```

### Step 2 — Import to Vercel

1. Go to [https://vercel.com](https://vercel.com) and sign in
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. **Important — set Root Directory to `app`**

   Vercel must build from the `app/` folder, not the repo root.

### Step 3 — Configure Build Settings

Vercel should auto-detect Next.js. Confirm:

| Setting | Value |
|---------|-------|
| Root Directory | `app` |
| Build Command | `npm run build` (default) |
| Output Directory | `.next` (default) |
| Install Command | `npm install` (default) |

The build script automatically runs `node ../analysis/copy_to_app.js` to copy JSON from `analysis/outputs/` into `app/lib/data/` before compilation. This requires the full repo (not just the `app/` folder) to be present — which is the case when deploying from the monorepo root with Root Directory set to `app`.

> If Vercel cannot find `../analysis/outputs`, ensure the `analysis/outputs/*.json` files are committed to Git (they are precomputed and safe to commit).

### Step 4 — Add Environment Variables in Vercel

In Vercel → Project → **Settings** → **Environment Variables**, add:

| Name | Value | Environments |
|------|-------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project-ref.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon key | Production, Preview, Development |

Redeploy after adding variables.

### Step 5 — Update Supabase for Production

1. Supabase → **Authentication** → **URL Configuration**
2. Set **Site URL** to your Vercel domain:
   ```
   https://your-project.vercel.app
   ```
3. Add production redirect URL:
   ```
   https://your-project.vercel.app/auth/callback
   ```

### Step 6 — Deploy and Verify

After deployment completes, verify these routes:

| URL | Expected |
|-----|----------|
| `https://your-domain.vercel.app/` | Landing page loads |
| `https://your-domain.vercel.app/auth` | Sign-in page |
| `https://your-domain.vercel.app/app` | Redirects to `/auth` when logged out |
| Sign in with Google | Lands on `/app` dashboard |
| `/app/drivers/D19` | Senthil Pillai, score 77 |
| `/app/vehicles/V19` | TVS Ntorq, health score 19 |
| `/app/methodology` | Pipeline documentation |

### Custom Domain (Optional)

1. Vercel → Project → **Settings** → **Domains**
2. Add your domain and follow DNS instructions
3. Add the custom domain callback to Supabase Redirect URLs:
   ```
   https://yourdomain.com/auth/callback
   ```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes (for auth) | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes (for auth) | Supabase anonymous/public key |

Copy `app/.env.example` to `app/.env.local` and fill in values.

---

## Documentation

| Document | Description |
|----------|-------------|
| [docs/TECHNICAL_REPORT.md](docs/TECHNICAL_REPORT.md) | Full system report |
| [docs/AUTHENTICATION.md](docs/AUTHENTICATION.md) | Auth flow details |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Deployment reference |
| [docs/DATA_PIPELINE.md](docs/DATA_PIPELINE.md) | Scoring pipeline |
| [LOGGER.md](LOGGER.md) | Engineering log |

---

## Analytical Truth (Do Not Alter)

These values come from the analytical pipeline and must not be changed in the UI:

- **Highest-risk driver**: Senthil Pillai · D19 · Risk Score **77** · High Risk
- **Highest maintenance candidate**: V19 · TVS Ntorq · Health Score **19** · Maintenance Attention
- **Scoring weights**: 35% Speed · 30% Acceleration · 25% Gyroscope · 10% Behavioural Variability
- Vehicle health is a **sensor anomaly signal**, not a mechanical failure probability

---

## License

VexarDrive Technologies — Data Science Intern Assignment
