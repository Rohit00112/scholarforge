# ScholarForge — Product Requirements Document (PRD)
## LLM Implementation Spec v1.0

> **Purpose of this document:** Feed this entire file to any capable LLM (Claude, GPT-4, Gemini, etc.) along with the companion `PROPOSAL.md`. The LLM should be able to scaffold, implement, and iterate ScholarForge without additional product context.
>
> **How to use with an LLM:**
> ```
> You are an expert Full-Stack Next.js developer.
> Read PROPOSAL.md (vision) and this PRD.md (spec).
> We build iteratively, phase by phase.
> DO NOT write code for future phases until I prompt you.
> Use modern Next.js conventions (Server Components by default,
> Client Components only when interactivity is needed).
> Provide complete, copy-pasteable code with file paths labeled.
> Acknowledge by saying "Context loaded. Ready for Phase N."
> ```

---

# 0. Product Identity

| Field | Value |
|-------|-------|
| Name | ScholarForge |
| Tagline | The living archive of student innovation |
| One-liner | Centralized project marketplace where college students publish, discover, collaborate on, and evolve academic projects across semesters. |
| Domain | Academic / EdTech / Developer tools |
| Users | Students, Faculty mentors, College admins |
| Deployment | Docker (Next.js standalone) on Linux college server |

---

# 1. Vision Recap (from PROPOSAL.md)

Students create projects. Projects die after evaluation. Knowledge is lost. Next cohort rebuilds the same thing.

ScholarForge makes every project a living institutional asset:

```
Create → Publish → Discover → Collaborate → Fork → Improve → Deploy → Showcase
```

**North-star story:**
- 2026: Student builds traffic prediction model
- 2027: Another student forks it, adds real-time inference
- 2028: College IoT team deploys it on campus
- Result: living lineage, not a forgotten ZIP file

**This is NOT:**
- GitHub (no academic context, no faculty, no semester lineage)
- Behance (no code, no collaboration)
- LMS / Moodle (no discovery, no public portfolio, no forks)
- Devpost (event-scoped, not institutional archive)

**This IS:** GitHub × Product Hunt × institutional memory, scoped to one college.

---

# 2. Tech Stack (LOCKED — do not change without asking)

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 15 (App Router) | SSR for SEO, API routes, RSC default |
| Language | TypeScript (strict) | Catch bugs before runtime |
| UI | React 19 | Server Components by default |
| Styling | Tailwind CSS v4 | Utility-first, no CSS modules |
| Icons | Lucide React | Consistent, tree-shakeable |
| Database | MongoDB + Mongoose 8 | Flexible schema, Atlas Search later |
| Auth | NextAuth.js v5 (Auth.js) | College-email domain restriction |
| Validation | Zod | Shared client/server schemas |
| Forms | React Hook Form + Zod | Client interactivity only |
| Object storage | MinIO (S3 API, self-hosted) | Covers, avatars, screenshots, research PDFs, docs. No AWS S3, no Cloudinary. |
| Markdown | `react-markdown` + `remark-gfm` | README rendering |
| Deployment | Docker + Next.js `output: 'standalone'` | Linux college server |
| Package manager | npm | Universal |

**Constraints:**
- Node.js 20+
- MongoDB 7+
- MinIO latest stable (S3-compatible). Client: `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`. Force path-style (`forcePathStyle: true`). Never point the SDK at `amazonaws.com`.
- No AWS S3, no Cloudinary, no Uploadthing, no Vercel Blob, no local `/public/uploads` as the store. MinIO is the only blob backend, including local dev (via Docker).
- No separate Express backend. All API = Next.js Route Handlers in `app/api/`.
- No Redux / Zustand unless a phase explicitly needs client global state. Prefer RSC + URL search params + server actions.
- No Shadcn unless a later phase asks. Build with Tailwind primitives first.
- No ORM besides Mongoose.

---

# 3. Information Architecture

## 3.1 Public routes (unauthenticated can view)

| Path | Page | RSC? |
|------|------|------|
| `/` | Home: featured + latest + search bar | Yes |
| `/projects` | Browse / search / filter catalog | Yes |
| `/projects/[slug]` | Project detail | Yes |
| `/students/[username]` | Public student profile | Yes |
| `/faculty/[id]` | Public faculty profile | Yes |
| `/about` | What ScholarForge is | Yes |
| `/login` | Sign in | Mixed |
| `/register` | Sign up (college email) | Mixed |

## 3.2 Authenticated routes

| Path | Page | Role |
|------|------|------|
| `/dashboard` | Personal hub (my projects, stars, requests) | student / faculty / admin |
| `/projects/new` | Publish wizard | student |
| `/projects/[slug]/edit` | Edit own project | owner |
| `/settings` | Profile, skills, social links | any |
| `/notifications` | In-app notifications | any |

## 3.3 Faculty / admin

| Path | Page | Role |
|------|------|------|
| `/mentor` | Mentorship requests + my mentee projects | faculty |
| `/admin` | Users, featured projects, reports | admin |

## 3.4 API surface (all under `app/api/`)

Prefix: `/api/v1`

```
AUTH
  POST   /api/auth/[...nextauth]     NextAuth handler
  GET    /api/auth/session

USERS
  GET    /api/v1/users/me
  PATCH  /api/v1/users/me
  GET    /api/v1/users/:username
  GET    /api/v1/users?q=&branch=&batch=

PROJECTS
  GET    /api/v1/projects            list + filters
  POST   /api/v1/projects            create (auth)
  GET    /api/v1/projects/:slug
  PATCH  /api/v1/projects/:slug      owner
  DELETE /api/v1/projects/:slug      owner or admin
  POST   /api/v1/projects/:slug/star toggle star
  POST   /api/v1/projects/:slug/fork create derivative (Phase 2)
  GET    /api/v1/projects/:slug/lineage

CONTRIBUTIONS (Phase 2)
  POST   /api/v1/projects/:slug/contribute-requests
  PATCH  /api/v1/contribute-requests/:id   accept/reject
  GET    /api/v1/projects/:slug/contributors

FACULTY (Phase 2)
  POST   /api/v1/projects/:slug/mentor-request
  PATCH  /api/v1/mentor-requests/:id
  GET    /api/v1/faculty/dashboard

UPLOADS (Phase 3 — MinIO)
  POST   /api/v1/uploads             multipart; kind=avatar|cover|screenshot|paper|doc
                                     → putObject to MinIO → returns public URL
  DELETE /api/v1/uploads             body: { key } owner or admin; deleteObject

SEARCH
  GET    /api/v1/search?q=&type=project|user|tag
```

---

# 4. Data Model (Mongoose)

All models live in `src/models/`. Every document has `createdAt`, `updatedAt` via `{ timestamps: true }`. Use MongoDB ObjectId refs. Soft-delete via `deletedAt: Date | null` on Project only.

## 4.1 Enums (put in `src/lib/constants.ts`)

```ts
export const USER_ROLES = ['student', 'faculty', 'admin'] as const

export const BRANCHES = [
  'CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AI-ML', 'DS', 'OTHER'
] as const

export const PROJECT_STATUS = [
  'draft',        // only owner sees
  'published',    // public catalog
  'archived',     // visible, marked inactive
  'deployed'      // published + live deployment
] as const

export const PROJECT_CATEGORIES = [
  'web', 'mobile', 'ml-ai', 'iot', 'systems', 'security',
  'data', 'design', 'research', 'other'
] as const

export const LICENSE_TYPES = [
  'MIT', 'Apache-2.0', 'GPL-3.0', 'BSD-3-Clause', 'CC-BY-4.0', 'Proprietary', 'Unlicensed'
] as const

export const CONTRIBUTION_ROLES = ['lead', 'contributor', 'mentor', 'reviewer'] as const

export const REQUEST_STATUS = ['pending', 'accepted', 'rejected'] as const
```

## 4.2 User

```ts
// src/models/User.ts
{
  email:            { type: String, required: true, unique: true, lowercase: true },
  emailVerified:    { type: Date, default: null },
  passwordHash:     { type: String, required: true }, // bcrypt, 12 rounds
  role:             { type: String, enum: USER_ROLES, default: 'student' },

  // identity
  name:             { type: String, required: true, trim: true, maxlength: 80 },
  username:         { type: String, required: true, unique: true, lowercase: true, match: /^[a-z0-9-]{3,30}$/ },
  avatarUrl:        { type: String, default: null },
  bio:              { type: String, maxlength: 500, default: '' },

  // academic (students)
  rollNumber:       { type: String, default: null, index: true },
  batch:            { type: String, default: null },     // e.g. "2022-2026"
  branch:           { type: String, enum: BRANCHES, default: null },
  semester:         { type: Number, min: 1, max: 10, default: null },

  // academic (faculty)
  department:       { type: String, default: null },
  researchAreas:    [{ type: String }],
  mentorshipCapacity: { type: Number, default: 5 },

  // profile
  skills:           [{ type: String, lowercase: true }],
  interests:        [{ type: String, lowercase: true }],
  githubUsername:   { type: String, default: null },
  linkedinUrl:      { type: String, default: null },
  portfolioUrl:     { type: String, default: null },

  // reputation (computed, denormalized)
  reputationScore:  { type: Number, default: 0 },
  badges:           [{ type: String }],

  // auth extras
  collegeEmailDomain: { type: String, required: true }, // extracted from email
}
```

Indexes: `{ username: 1 }`, `{ email: 1 }`, `{ role: 1, branch: 1 }`, text index on `name username bio skills`.

## 4.3 Project

```ts
// src/models/Project.ts
{
  title:            { type: String, required: true, trim: true, maxlength: 120 },
  slug:             { type: String, required: true, unique: true, lowercase: true },
  tagline:          { type: String, maxlength: 160, default: '' },
  description:      { type: String, required: true, maxlength: 4000 },      // markdown
  problemStatement: { type: String, maxlength: 2000, default: '' },
  readme:           { type: String, default: '' },                          // markdown, can sync from GitHub later

  // lineage
  parentProjectId:  { type: Schema.Types.ObjectId, ref: 'Project', default: null },
  version:          { type: Number, default: 1 },
  originalSemester: { type: String, required: true },  // "Fall 2026" or "2026-S1"
  originalYear:     { type: Number, required: true },

  // people
  ownerId:          { type: Schema.Types.ObjectId, ref: 'User', required: true },
  teamMemberIds:    [{ type: Schema.Types.ObjectId, ref: 'User' }],
  facultyMentorId:  { type: Schema.Types.ObjectId, ref: 'User', default: null },

  // technical
  techStack:        [{ type: String, lowercase: true }],  // ["python","tensorflow","nextjs"]
  category:         { type: String, enum: PROJECT_CATEGORIES, required: true },
  tags:             [{ type: String, lowercase: true }],
  license:          { type: String, enum: LICENSE_TYPES, default: 'MIT' },

  // links
  repositoryUrl:    { type: String, default: null },
  demoUrl:          { type: String, default: null },
  deploymentUrl:    { type: String, default: null },
  documentationUrl: { type: String, default: null },
  researchPaperUrl: { type: String, default: null },
  slidesUrl:        { type: String, default: null },

  // media
  coverImageUrl:    { type: String, default: null },
  screenshots:      [{ type: String }],                   // max 8
  videoUrl:         { type: String, default: null },      // youtube/vimeo

  // academic
  courseCode:       { type: String, default: null },      // "CS401"
  courseName:       { type: String, default: null },

  // collaboration
  lookingForContributors: { type: Boolean, default: false },
  requiredSkills:   [{ type: String, lowercase: true }],
  contributorNotes: { type: String, maxlength: 1000, default: '' },

  // lifecycle
  status:           { type: String, enum: PROJECT_STATUS, default: 'draft' },
  publishedAt:      { type: Date, default: null },
  featured:         { type: Boolean, default: false },    // admin/faculty flag
  deletedAt:        { type: Date, default: null },

  // denormalized counters (update atomically)
  starsCount:       { type: Number, default: 0 },
  forksCount:       { type: Number, default: 0 },
  viewsCount:       { type: Number, default: 0 },
  contributorsCount:{ type: Number, default: 1 },
}
```

Indexes:
- unique `{ slug: 1 }`
- `{ status: 1, publishedAt: -1 }`
- `{ category: 1, status: 1 }`
- `{ ownerId: 1 }`
- `{ parentProjectId: 1 }`
- `{ featured: 1, status: 1 }`
- `{ techStack: 1 }`
- text: `title tagline description tags techStack`

Slug generation: kebab-case of title + 4-char nanoid suffix if collision. Example: `traffic-prediction-model-a3f9`.

## 4.4 Star (join collection — don't embed)

```ts
// src/models/Star.ts
{
  userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
}
// unique compound index { userId: 1, projectId: 1 }
```

## 4.5 ContributionRequest (Phase 2)

```ts
{
  projectId:  { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  requesterId:{ type: Schema.Types.ObjectId, ref: 'User', required: true },
  message:    { type: String, maxlength: 500 },
  skillsOffered: [{ type: String }],
  status:     { type: String, enum: REQUEST_STATUS, default: 'pending' },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt: { type: Date, default: null },
}
```

## 4.6 Contribution (Phase 2 — accepted members)

```ts
{
  projectId: { type: Schema.Types.ObjectId, ref: 'User' wait — ref Project },
  userId:    { type: Schema.Types.ObjectId, ref: 'User' },
  role:      { type: String, enum: CONTRIBUTION_ROLES, default: 'contributor' },
  joinedAt:  Date,
  notes:     String, // what they worked on
}
```

## 4.7 Notification (Phase 2)

```ts
{
  userId:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type:    { type: String }, // 'star' | 'contribute_request' | 'accepted' | 'fork' | 'mention'
  title:   String,
  body:    String,
  href:    String,           // internal path
  read:    { type: Boolean, default: false },
  meta:    Schema.Types.Mixed,
}
```

## 4.8 Comment (Phase 3 — skip until asked)

Do not implement comments until Phase 3 is requested.

---

# 5. Auth Rules

- Sign-up: email + password + name + username + role (student default) + branch + batch + rollNumber.
- Email MUST match an allowed college domain list in env: `ALLOWED_EMAIL_DOMAINS=college.edu,univ.edu`.
- Reject any email not ending with those domains. Show: "Use your college email."
- Passwords: min 8 chars, bcrypt cost 12.
- Sessions: JWT strategy (NextAuth), 30-day maxAge, httpOnly cookie.
- Roles:
  - `student` — publish, star, fork, request to contribute
  - `faculty` — everything student can + mentor dashboard, feature-request projects
  - `admin` — everything + feature flag, user moderation, hard-delete
- Authorization helper: `src/lib/auth.ts` exports `requireUser()`, `requireRole(role)`, `canEditProject(user, project)`.
- Owner OR team member OR admin can edit a project.
- Only owner can delete (soft) or transfer.
- Drafts are invisible except to owner/team/admin.

---

# 6. Functional Requirements by Phase

**CRITICAL RULE FOR IMPLEMENTING LLM:**
Implement ONLY the phase the human asks for. Do not scaffold future-phase files "to save time." Do not add comments like `// TODO Phase 2`. Keep the tree clean.

---

## PHASE 1 — Core Marketplace
**Goal:** A student can register, publish a project, and another student can find it.
**Duration target:** one focused build session per slice below.
**Exit criteria:** All Phase 1 acceptance tests pass. App runs via `npm run dev` and via Docker.

### 1.0 Bootstrap (do this first, before any feature)

Scaffold:

```
scholarforge/
├── Dockerfile
├── docker-compose.yml          # app + mongo
├── .dockerignore
├── .env.example
├── .gitignore
├── next.config.ts              # output: 'standalone'
├── package.json
├── tsconfig.json
├── tailwind.config.ts          # if v4 uses CSS-first, follow that
├── postcss.config.mjs
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   ├── (auth)/login/page.tsx
│   │   ├── (auth)/register/page.tsx
│   │   ├── (main)/projects/page.tsx
│   │   ├── (main)/projects/[slug]/page.tsx
│   │   ├── (main)/projects/new/page.tsx
│   │   ├── (main)/students/[username]/page.tsx
│   │   ├── (main)/dashboard/page.tsx
│   │   ├── (main)/settings/page.tsx
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       └── v1/
│   ├── components/
│   │   ├── ui/                 # Button, Input, Badge, Card, Textarea, Select
│   │   ├── layout/Navbar.tsx
│   │   ├── layout/Footer.tsx
│   │   └── projects/
│   ├── lib/
│   │   ├── db.ts               # mongoose connect singleton
│   │   ├── minio.ts            # S3 client → MinIO endpoint (real impl Phase 3; stub OK in 1.0)
│   │   ├── auth.ts
│   │   ├── constants.ts
│   │   ├── slug.ts
│   │   └── utils.ts            # cn()
│   ├── models/
│   │   ├── User.ts
│   │   ├── Project.ts
│   │   └── Star.ts
│   ├── actions/                # server actions
│   ├── types/index.ts
│   └── middleware.ts           # protect /dashboard /projects/new /settings
├── public/
└── README.md                   # how to run locally + docker
```

**next.config.ts must include:**
```ts
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '9000', pathname: '/**' },
      { protocol: 'http', hostname: 'minio', port: '9000', pathname: '/**' },
      { protocol: 'https', hostname: process.env.MINIO_PUBLIC_HOST ?? 'localhost' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
    ],
  },
}
```

**.env.example:**
```
MONGODB_URI=mongodb://localhost:27017/scholarforge
NEXTAUTH_SECRET=change-me
NEXTAUTH_URL=http://localhost:3000
ALLOWED_EMAIL_DOMAINS=college.edu
COLLEGE_NAME=Your College

# MinIO (S3-compatible). Never set AWS_ENDPOINT to amazonaws.com.
MINIO_ENDPOINT=http://localhost:9000
MINIO_PUBLIC_URL=http://localhost:9000
MINIO_REGION=us-east-1
MINIO_ROOT_USER=scholarforge
MINIO_ROOT_PASSWORD=scholarforge-minio
MINIO_BUCKET=scholarforge
MINIO_USE_SSL=false
```

SDK env mapping (so `@aws-sdk/client-s3` works against MinIO):
```
AWS_ACCESS_KEY_ID=${MINIO_ROOT_USER}
AWS_SECRET_ACCESS_KEY=${MINIO_ROOT_PASSWORD}
AWS_ENDPOINT=${MINIO_ENDPOINT}
AWS_REGION=${MINIO_REGION}
S3_FORCE_PATH_STYLE=true
```
Do **not** introduce a second storage provider behind a feature flag.

**Docker:**
- Multi-stage Dockerfile: deps → builder → runner
- Runner uses `node server.js` from standalone output
- Runs as non-root
- `docker-compose.yml` services:
  - `app` :3000  (depends_on mongo + minio healthy)
  - `mongo` :27017 + named volume `mongo_data`
  - `minio` image `minio/minio:latest`, command `server /data --console-address ":9001"`
    - ports `9000` (S3 API) and `9001` (console)
    - env `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD`
    - volume `minio_data`
    - healthcheck: `mc ready local` or `curl -f http://localhost:9000/minio/health/live`
  - `minio-init` (oneshot profile, or `depends_on` entrypoint) using `minio/mc`:
    1. `mc alias set local http://minio:9000 $MINIO_ROOT_USER $MINIO_ROOT_PASSWORD`
    2. `mc mb --ignore-existing local/scholarforge`
    3. `mc anonymous set download local/scholarforge` (public-read for covers/avatars; papers stay behind app if needed — Phase 3 can split buckets)
- Healthcheck on app
- App env inside compose: `MINIO_ENDPOINT=http://minio:9000`, `MINIO_PUBLIC_URL=http://localhost:9000` (browser-reachable)

**MinIO client helper (`src/lib/minio.ts`) — implement for real in Phase 3, empty export OK in 1.0:**
```ts
import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3'

export const minio = new S3Client({
  region: process.env.MINIO_REGION ?? 'us-east-1',
  endpoint: process.env.MINIO_ENDPOINT,          // http://minio:9000 in docker
  forcePathStyle: true,                          // REQUIRED for MinIO
  credentials: {
    accessKeyId: process.env.MINIO_ROOT_USER!,
    secretAccessKey: process.env.MINIO_ROOT_PASSWORD!,
  },
})

export const MINIO_BUCKET = process.env.MINIO_BUCKET ?? 'scholarforge'

export function publicObjectUrl(key: string): string {
  const base = (process.env.MINIO_PUBLIC_URL ?? process.env.MINIO_ENDPOINT)!.replace(/\/$/, '')
  return `${base}/${MINIO_BUCKET}/${key}`
}

// keys: avatars/{userId}/{nanoid}.ext
//       covers/{projectId}/{nanoid}.ext
//       screenshots/{projectId}/{nanoid}.ext
//       papers/{projectId}/{nanoid}.pdf
//       docs/{projectId}/{nanoid}.pdf
```

**Design system (Phase 1 visual language):**
- Font: Inter (or `next/font` Geist)
- Dark-first UI. Background `#0B0F19`, surface `#121826`, border `#1F2937`, accent indigo `#6366F1`, text `#E5E7EB`, muted `#9CA3AF`
- Academic but not boring. Think Linear/Vercel, not Moodle.
- Max content width `max-w-6xl`
- Cards with 1px border, hover lift (`hover:-translate-y-0.5 hover:border-indigo-500/40`)
- Status pills: draft=zinc, published=indigo, deployed=emerald, archived=amber
- Tech badges: small outline pills

**Navbar:**
- Logo "ScholarForge" + spark/forge mark
- Links: Explore, (auth: Publish, Dashboard)
- Right: Login / Register OR avatar dropdown (Profile, Settings, Sign out)

**Footer:**
- Short tagline, About, GitHub (placeholder), college name env `COLLEGE_NAME`

### 1.1 Auth slice

Pages: `/register`, `/login`
- Register fields: name, username, email, password, confirm, branch, batch, roll number
- Client-side Zod validation + server action re-validation
- Duplicate email/username → 409 with field error
- After register → auto sign-in → `/dashboard`
- Login: email + password, redirect to `callbackUrl` or `/dashboard`
- Middleware: unauthenticated hitting `/dashboard`, `/projects/new`, `/settings` → `/login?callbackUrl=`
- Authenticated hitting `/login` or `/register` → `/dashboard`

### 1.2 Project publish slice

`/projects/new` — multi-section single page form (NOT a 5-step wizard yet):

**Required:** title, tagline, description (textarea markdown), category, originalSemester, originalYear, techStack (tag input)
**Optional:** problemStatement, repositoryUrl, demoUrl, deploymentUrl, documentationUrl, researchPaperUrl, courseCode, coverImageUrl (URL input in Phase 1 — file upload Phase 1.5), lookingForContributors, requiredSkills, license

On submit:
1. Validate with Zod (`src/lib/validators/project.ts`)
2. Generate unique slug
3. Set `ownerId`, `teamMemberIds: [ownerId]`, `status: 'published'`, `publishedAt: now` (include a "Save as draft" secondary button)
4. Redirect to `/projects/[slug]`

Edit: `/projects/[slug]/edit` — same form, prefilled. 404 if cannot edit.

### 1.3 Catalog + search slice

`/projects` — server-rendered list.

Query params (URL is source of truth):
```
?q=          text search
&category=   one of PROJECT_CATEGORIES
&tech=       comma-separated, AND match
&status=     published|deployed (drafts never public)
&semester=   
&year=
&looking=    1  (lookingForContributors)
&sort=       newest|stars|forks  (default newest)
&page=       1-indexed, 12 per page
```

UI:
- Left or top filter bar (category chips, tech input, sort select)
- Grid of `ProjectCard`
- Empty state: "No projects yet. Be the first to publish."
- Pagination with rel next/prev

`ProjectCard` shows: cover (or generated gradient from slug hash), title, tagline, tech badges (max 4 +N), category, stars, semester, owner avatar+name, "looking for contributors" ribbon if true, deployed badge if status=deployed.

Home `/`:
- Hero: headline "Don't let your project die after the demo.", sub, CTA Publish + Explore
- Featured row (featured=true, else fallback to most starred)
- Latest 8
- "Browse by category" chips

### 1.4 Project detail slice

`/projects/[slug]`

Layout:
1. Cover / header: title, tagline, status, category, star button, share (copy URL)
2. Meta row: owner, team avatars, faculty mentor (if any), semester, license
3. Action links: Repo, Demo, Live, Paper, Docs (only render if URL present)
4. Tabs or stacked sections: About (description + problem), README (markdown), Tech stack, Team, Lineage (parent link + "forked N times" — lineage tree UI is Phase 2, Phase 1 just shows parent if exists)
5. Sidebar: stats (stars, views, forks), required skills if looking, "Request to contribute" button **disabled with tooltip "Coming in Phase 2"** — do NOT implement the request flow
6. Increment `viewsCount` once per session (cookie or just +1 on server load; keep it simple: +1 per page load is OK for Phase 1)

Star button = Client Component. Optimistic toggle. POST `/api/v1/projects/:slug/star`. Unauth → redirect login.

### 1.5 Profiles + dashboard slice

`/students/[username]`:
- Avatar, name, username, branch/batch, bio, skills, social links
- Tabs: Created | Contributed (contributed = teamMemberIds) | Starred
- 404 if user missing

`/dashboard` (auth):
- Stats: projects published, stars received (sum), stars given
- My projects list with status + edit link
- Starred projects
- Empty CTAs

`/settings`:
- Edit name, bio, avatarUrl (URL), skills (tag input), github, linkedin, portfolio, branch, semester
- Cannot change email or username in Phase 1

### 1.6 Phase 1 NON-goals (do not build)

- Forking / lineage tree visualization
- Contribute requests / messaging
- Faculty dashboard
- File uploads to MinIO (URL fields only in Phase 1; MinIO container may still run in compose so Phase 3 is drop-in)
- GitHub API README sync
- Comments
- Notifications
- Admin panel
- Email sending
- Algolia / Atlas Search (Mongo text index is enough)
- Dark/light toggle (dark only)

### Phase 1 acceptance tests

Manual, but the implementing LLM must verify each:

1. Register with `alice@college.edu` succeeds; `alice@gmail.com` rejected.
2. Login / logout works; middleware protects `/projects/new`.
3. Alice publishes "Traffic Prediction Model" with tech `python,tensorflow`. Lands on detail page. Slug unique.
4. Save as draft → not listed on `/projects`. Publish later → listed.
5. `/projects?q=traffic&tech=python&sort=stars` returns Alice's project.
6. Bob registers, stars Alice's project. `starsCount` goes 0→1→0 on unstar. Bob's profile Starred tab shows it.
7. Alice's public profile shows the project under Created.
8. Unauthenticated user can browse catalog and detail, cannot star (redirect login), cannot visit `/dashboard`.
9. Alice can edit her project, Bob gets 403/redirect on `/projects/[slug]/edit`.
10. `docker compose up --build` serves the app on :3000 talking to mongo **and** minio (`:9000` API, `:9001` console). Bucket `scholarforge` exists.
11. Lighthouse-not-required, but pages are RSC: project list HTML contains project titles in initial response (view-source).
12. TypeScript `npm run build` succeeds with no errors.

---

## PHASE 2 — Collaboration
**Unlock when human says "Phase 2."**

### Features
1. **Fork project**
   - Button on detail: "Improve this project"
   - Creates new Project with `parentProjectId`, `version: parent.version+1` (version is per-lineage node, not global)
   - Prefills title as "Title (fork)", all tech/description copied, owner = current user, status = draft
   - Atomically `$inc` parent `forksCount`
   - Redirect to edit page of the fork

2. **Lineage tree**
   - On detail, section "Project lineage"
   - Fetch ancestors (walk parentProjectId) + direct children
   - Render vertical timeline: original → this → descendants
   - Each node: title, year, owner, stars

3. **Contribute requests**
   - Enable the Phase 1 placeholder button
   - Modal: message + skills offered
   - Owner sees requests on dashboard
   - Accept → add user to `teamMemberIds`, create Contribution, notify requester
   - Reject → notify
   - Duplicate pending request blocked

4. **Faculty mentor**
   - Project form: search faculty by name, set `facultyMentorId` (or request)
   - Faculty role users get `/mentor` dashboard: projects they mentor
   - Faculty can toggle `featured` on mentee projects

5. **Notifications**
   - Bell in navbar, unread count
   - List page `/notifications`
   - Types: star (optional, skip to reduce noise), contribute_request, accepted, rejected, fork, mentor_assigned

6. **Team on publish**
   - Invite by username; must be registered students
   - Pending invites (simple: add immediately if username exists, else error)

### Phase 2 acceptance
- Fork creates draft child, parent forksCount +1, lineage shows both.
- Contribute request → accept → Bob appears on team, can edit.
- Faculty user sees mentee projects and can feature one; featured appears on home.
- Notification created on accept; unread badge increments.

---

## PHASE 3 — Evolution, Deploy, Research
**Unlock when human says "Phase 3."**

1. Changelog field on Project (`changelog: [{ version, date, notes, authorId }]`) shown on detail.
2. Deployment status ping: optional daily check of `deploymentUrl` (HEAD request), store `lastSeenUpAt`. Badge green/red.
3. Research paper metadata: title, authors, venue, year, PDF URL, DOI. Citation copy button (APA + BibTeX).
4. Analytics page `/admin/insights` (admin/faculty): counts by category, top tech tags, forks over time (simple aggregations).
5. **MinIO uploads (the only blob store):**
   - Auth required. `POST /api/v1/uploads` multipart field `file` + `kind` ∈ `avatar | cover | screenshot | paper | doc`.
   - Allowlist MIME: `image/jpeg`, `image/png`, `image/webp`, `image/gif` (images, max 5 MB) and `application/pdf` (papers/docs, max 20 MB). Reject anything else (svg, html, exe, zip).
   - Sanitize: generate key server-side; never trust client filename. Extension from MIME map only.
   - `PutObject` to MinIO with `ContentType` set. Return `{ url, key, bucket }`.
   - Persist `url` onto User.avatarUrl / Project.coverImageUrl / screenshots[] / researchPaperUrl.
   - `DELETE /api/v1/uploads` with `{ key }` — only if key prefix belongs to that user/project; then `DeleteObject`.
   - Replace URL-only inputs on `/projects/new`, `/projects/[slug]/edit`, `/settings` with a file picker Client Component that hits this endpoint then stores the returned URL in the form.
   - On project soft-delete, do **not** purge MinIO in Phase 3 (orphan cleanup is admin/Phase 4).
   - No Cloudinary fallback. If MinIO is down, upload returns 503 with `error: "storage_unavailable"`.
6. GitHub README pull: if `repositoryUrl` is github.com, fetch README.md on publish/edit (server-side, cache 1h). Fail soft.
7. Comments on project (flat, markdown, 500 char, auth required).

### Phase 3 NON-goals
- Real CI/CD to deploy student apps
- Full Git hosting
- Real-time chat
- Mobile apps

---

## PHASE 4 — Advanced (future, spec only)

Do not implement until explicitly asked.

- Industry partner accounts + sponsorships
- Challenges / hackathons
- AI project recommendations
- Multi-college tenancy
- Email transactional (Resend)
- Public REST API with tokens
- Light theme
- Export portfolio PDF

---

# 7. UX Copy (use these strings)

**Hero h1:** Don't let your project die after the demo.
**Hero sub:** Publish once. Let the next semester make it better. ScholarForge is your college's living project archive.
**Primary CTA:** Publish a project
**Secondary CTA:** Explore projects
**Empty catalog:** No projects match. Try clearing filters — or publish the first one.
**Empty dashboard:** You haven't published yet. Your future teammates can't star what they can't find.
**Star (unauth tooltip):** Sign in with your college email to star this.
**Fork button (Phase 2):** Improve this project
**Looking ribbon:** Seeking contributors
**Footer tagline:** Built so student work outlives the semester.

Voice: direct, student-to-student, zero corporate. No "leverage synergies." No emoji unless in badges.

---

# 8. API Contracts (Phase 1)

All JSON. Errors: `{ error: string, fields?: Record<string,string> }` with proper HTTP codes (400 validation, 401 auth, 403 forbidden, 404, 409 conflict, 500).

### `GET /api/v1/projects`

Query as in 1.3. Response:
```json
{
  "data": [ { /* ProjectPublic */ } ],
  "page": 1,
  "pageSize": 12,
  "total": 40,
  "totalPages": 4
}
```

`ProjectPublic` = project document minus nothing sensitive (no drafts leakage). Populate `ownerId` as `{ username, name, avatarUrl, branch }` and `teamMemberIds` similarly. Never return `passwordHash`.

### `POST /api/v1/projects`

Auth required. Body = ProjectCreateInput (Zod). Response 201 `{ data: ProjectPublic }`.

### `GET /api/v1/projects/:slug`

404 if missing or draft-and-not-authorized. Include `starredByMe: boolean` if session exists.

### `PATCH /api/v1/projects/:slug`

Owner/team/admin. Partial update. Cannot change `ownerId`, `slug`, `starsCount`.

### `POST /api/v1/projects/:slug/star`

Toggle. Response `{ starred: boolean, starsCount: number }`.

### `GET /api/v1/users/:username`

Public profile + grouped projects.

Prefer **Server Actions** for form mutations (create/edit/settings) and **Route Handlers** for star toggle + JSON list used by any future client. Either is fine if consistent. Do not duplicate the same mutation in both.

---

# 9. Validation Schemas (Zod) — implement in Phase 1

```ts
// src/lib/validators/auth.ts
registerSchema = z.object({
  name: z.string().min(2).max(80),
  username: z.string().regex(/^[a-z0-9-]{3,30}$/),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  branch: z.enum(BRANCHES),
  batch: z.string().min(4).max(20),
  rollNumber: z.string().min(3).max(30),
})

loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// src/lib/validators/project.ts
projectCreateSchema = z.object({
  title: z.string().min(4).max(120),
  tagline: z.string().max(160).optional().default(''),
  description: z.string().min(20).max(4000),
  problemStatement: z.string().max(2000).optional().default(''),
  category: z.enum(PROJECT_CATEGORIES),
  techStack: z.array(z.string().min(1).max(30)).min(1).max(20),
  tags: z.array(z.string()).max(15).optional().default([]),
  originalSemester: z.string().min(3).max(40),
  originalYear: z.coerce.number().int().min(2000).max(2100),
  repositoryUrl: z.string().url().optional().or(z.literal('')),
  demoUrl: z.string().url().optional().or(z.literal('')),
  deploymentUrl: z.string().url().optional().or(z.literal('')),
  documentationUrl: z.string().url().optional().or(z.literal('')),
  researchPaperUrl: z.string().url().optional().or(z.literal('')),
  courseCode: z.string().max(20).optional().default(''),
  coverImageUrl: z.string().url().optional().or(z.literal('')),
  lookingForContributors: z.boolean().optional().default(false),
  requiredSkills: z.array(z.string()).max(15).optional().default([]),
  license: z.enum(LICENSE_TYPES).optional().default('MIT'),
  status: z.enum(['draft', 'published']).optional().default('published'),
})
```

Server must also enforce email domain independently of Zod.

---

# 10. Seed Data

`src/scripts/seed.ts` (run with `npx tsx src/scripts/seed.ts`):

- Admin: `admin@college.edu` / `Admin1234` / role admin
- Faculty: `mentor@college.edu` / `Mentor1234` / Dr. Rao, CSE
- Students: alice, bob, priya @college.edu / `Student1234`
- 6 published projects spanning categories web, ml-ai, iot, mobile, with mixed tech stacks
- 1 draft belonging to alice
- 1 project with `lookingForContributors: true`
- 1 project with `deploymentUrl` and status `deployed`
- 1 project with `parentProjectId` pointing at another (so lineage exists even before Phase 2 UI)
- Stars: bob stars 2 of alice's

Never seed in production. Guard with `NODE_ENV !== 'production'`.

---

# 11. Non-Functional Requirements

| Concern | Requirement |
|---------|-------------|
| Performance | `/projects` TTFB < 500ms locally with 100 docs; paginate always |
| SEO | Unique `<title>` + meta description per project; OG tags |
| A11y | Label every input; star button has `aria-pressed`; keyboard operable nav |
| Security | Helmet-equivalent headers via Next config; no secrets in client; mongoose queries parameterized (always); rate-limit auth routes simply (in-memory map, 10/min/IP) |
| Logging | `console.error` on 500s; never log passwords |
| Testing | Phase 1: none automated required. Phase 2+: add `vitest` unit tests for slug + auth domain + star toggle |
| Accessibility of deploys | README documents env, docker, first admin creation |

---

# 12. File-by-file implementation notes for the LLM

When implementing a phase, output **complete files**, not diffs of imaginary files. Label every block:

```
// File: src/lib/db.ts
```

Conventions:
- `'use client'` only on Navbar (dropdown), forms, star button, tag input, mobile menu.
- Server Components fetch via mongoose directly. Do not fetch your own API from a Server Component (no localhost waterfall).
- `connectDB()` singleton in `src/lib/db.ts` (global cache for hot reload).
- `cn()` = `clsx` + `tailwind-merge`.
- No `any`. If mongoose docs are messy, define `IUser` / `IProject` interfaces.
- Dates displayed with `Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' })`.
- External URLs `rel="noopener noreferrer" target="_blank"`.
- Image URLs: use `<img>` or `next/image` with remotePatterns. If URL missing, show initials avatar / hashed gradient cover.

---

# 13. Prompt Pack (copy these when talking to an LLM)

### Session start
```
You are an expert Full-Stack Next.js developer.
Product: ScholarForge — college project marketplace.
Read /PROPOSAL.md and /PRD.md in this repo before writing any code.
Tech is LOCKED (section 2 of PRD). Do not substitute.
We build iteratively. Implement ONLY the phase I name.
Server Components by default. Client Components only for interactivity.
Complete copy-pasteable files with paths labeled.
After loading context, reply exactly: "Context loaded. Ready for Phase N."
Do not write code until I say to start.
```

### Start Phase 1
```
Start Phase 1.0 Bootstrap as specified in PRD section 6.
Scaffold the repo, Docker, design tokens, Navbar/Footer, empty pages, mongoose singleton, env example.
Do not implement auth or project CRUD yet.
When 1.0 is done, stop and wait.
```

Then, in order, prompt:
1. `Start Phase 1.1 Auth slice.`
2. `Start Phase 1.2 Project publish slice.`
3. `Start Phase 1.3 Catalog + search slice.`
4. `Start Phase 1.4 Project detail slice.`
5. `Start Phase 1.5 Profiles + dashboard slice.`
6. `Start Phase 1.6 Seed script + Docker verify + run through the 12 acceptance tests. Fix anything that fails.`

### Start Phase 2
```
Phase 1 is done. Implement Phase 2 from PRD section 6. Do not start Phase 3.
```

---

# 14. Open Decisions (defaults if human is silent)

| Decision | Default |
|----------|---------|
| College name | env `COLLEGE_NAME=Your College` |
| Email domains | env list, default `college.edu` for local |
| Usernames | immutable after register (Phase 1) |
| Stars public | yes, count is public, who-starred list not public in Phase 1 |
| Drafts | owner/team/admin only |
| Delete | soft-delete, hide from catalog, 404 public |
| Markdown subset | GFM (tables, code fences, lists). No raw HTML. |
| Cover images | URL string Phase 1; MinIO upload Phase 3 |
| Object storage | MinIO only. Self-hosted. S3 API + path-style. No AWS, no Cloudinary. |
| MinIO bucket ACL | public-read on `scholarforge` for avatars/covers/screenshots; papers may share the same bucket (keys are unguessable nanoids). Split buckets only if asked. |
| Multi-college | no. Single tenant. |

If the human contradicts a default, human wins. Update this PRD.

---

# 15. Out of Scope Forever (unless PRD is revised)

- Hosting git repos (we link out to GitHub/GitLab)
- AWS S3, Cloudinary, Uploadthing, Vercel Blob, or disk writes under `/public/uploads`
- Executing student code on our servers
- Plagiarism detection
- Grading / marks integration with university ERP
- Native iOS/Android apps
- Crypto / tokens / NFTs
- Student-to-student payments

---

# 16. Definition of Done (per phase)

A phase is done when:
1. All features listed for that phase exist and match acceptance tests
2. `npm run build` passes
3. `docker compose up --build` serves a working app (mongo + minio + app)
4. No files exist whose only purpose is a future phase, **except** MinIO in compose + `src/lib/minio.ts` stub, which Phase 1.0 must ship so Phase 3 is drop-in
5. README documents how to run that phase locally, including MinIO console at `:9001`

---

**Document version:** 1.1  
**Date:** 2026-09-11  
**Changelog:** 1.1 — object storage locked to self-hosted MinIO (S3 API). AWS S3 / Cloudinary removed.  
**Companion:** `PROPOSAL.md` (narrative / stakeholders / budget)  
**Status:** Ready to feed an LLM. Begin at Phase 1.0.
