import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "../models/User";
import Project from "../models/Project";
import Star from "../models/Star";

const SEED_PASSWORD = "College@123";

const domain = (process.env.ALLOWED_EMAIL_DOMAINS || "college.edu")
  .split(",")
  .map((d) => d.trim().toLowerCase())[0];

if (!domain) {
  console.error("ALLOWED_EMAIL_DOMAINS must contain at least one domain.");
  process.exit(1);
}

if (process.env.NODE_ENV === "production") {
  console.error("Refusing to seed in production.");
  process.exit(1);
}

async function main() {
  const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/scholarforge";
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to", MONGODB_URI);

  await Promise.all([User.deleteMany({}), Project.deleteMany({}), Star.deleteMany({})]);

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  const usersData = [
    {
      name: "Aanya Iyer",
      username: "admin",
      email: `admin@${domain}`,
      role: "admin",
      collegeEmailDomain: domain,
    },
    {
      name: "Dr. Priya Desai",
      username: "davis",
      email: `davis@${domain}`,
      role: "faculty",
      department: "Computer Science",
      researchAreas: ["Distributed Systems", "Edge Computing"],
      mentorshipCapacity: 8,
      bio: "Faculty mentor at the School of Computing Science and Engineering.",
      collegeEmailDomain: domain,
    },
    {
      name: "Alice Sharma",
      username: "alice",
      email: `alice@${domain}`,
      role: "student",
      branch: "CSE",
      semester: 6,
      batch: "2022-2026",
      rollNumber: "20220164",
      skills: ["python", "tensorflow", "react", "nodejs"],
      interests: ["machine-learning", "smart-cities"],
      githubUsername: "alice-sharma",
      linkedinUrl: "https://www.linkedin.com/in/alice-sharma",
      bio: "Building things at the intersection of transport and ML.",
      collegeEmailDomain: domain,
    },
    {
      name: "Bob Rao",
      username: "bob",
      email: `bob@${domain}`,
      role: "student",
      branch: "CSE",
      semester: 5,
      batch: "2023-2027",
      rollNumber: "20230218",
      skills: ["python", "react", "scikit-learn"],
      interests: ["security", "web"],
      githubUsername: "bob-rao",
      bio: "Skidding toward a security specialization.",
      collegeEmailDomain: domain,
    },
    {
      name: "Carol Menon",
      username: "carol",
      email: `carol@${domain}`,
      role: "student",
      branch: "AI-ML",
      semester: 7,
      batch: "2022-2026",
      rollNumber: "20220107",
      skills: ["react", "typescript", "nodejs"],
      interests: ["web", "data"],
      githubUsername: "carol-menon",
      bio: "Full-stack tinkerer and campus-app enthusiast.",
      collegeEmailDomain: domain,
    },
    {
      name: "Erin Kulkarni",
      username: "erin",
      email: `erin@${domain}`,
      role: "student",
      branch: "IT",
      semester: 4,
      batch: "2023-2027",
      rollNumber: "20230511",
      skills: ["nodejs", "mongodb", "docker"],
      interests: ["systems", "open-source"],
      githubUsername: "erin-k",
      collegeEmailDomain: domain,
    },
  ];

  const insertedUsers = await User.insertMany(usersData.map((u) => ({ ...u, passwordHash })));
  const byUsername = Object.fromEntries(insertedUsers.map((u) => [u.username, u]));

  const now = new Date();

  const projectsData = [
    {
      title: "Smart Campus Ride Share",
      slug: "smart-campus-ride-share",
      tagline: "Pool rides, cut queues, shrink the carbon footprint of campus commutes.",
      description:
        "A ride-pooling app that matches students headed in the same direction across campus. Live shuttle heatmaps, carpool leaderboards, and route-aware notifications.",
      problemStatement:
        "Long queues for campus shuttles waste hours each week. Detecting bidirectional ride intent requires both a location graph and a trust layer for matching strangers.",
      readme:
        "# Smart Campus Ride Share\n\nMatches students by destination corridor and departure window.\n\n## Highlights\n- Live shuttle position feed\n- Matching score based on route overlap\n- Driver reputation baked into match priority",
      originalSemester: "Spring",
      originalYear: 2025,
      ownerId: byUsername.alice._id,
      techStack: ["flutter", "firebase", "google-maps"],
      category: "mobile",
      tags: ["campus-life", "transport"],
      license: "MIT",
      repositoryUrl: "https://github.com/alice-sharma/smart-campus-ride-share",
      demoUrl: "https://rides.demo.scholarforge.dev",
      lookingForContributors: true,
      requiredSkills: ["flutter", "firebase"],
      contributorNotes: "Looking for a second Flutter dev and a designer.",
      status: "published",
      publishedAt: now,
      featured: true,
      starsCount: 3,
      forksCount: 0,
      viewsCount: 214,
      contributorsCount: 3,
    },
    {
      title: "Harvest Hub Irrigation Scheduler",
      slug: "harvest-hub-irrigation",
      tagline: "LoRa-driven drip irrigation governed by soil moisture, not guesswork.",
      description:
        "An ESP32 mesh that reads soil moisture and valve states across the campus nursery and pushes schedules to a dashboard. Saves roughly 30% of water per cycle.",
      problemStatement:
        "Manual irrigation over-waters and under-waters in cycles. Wired sensing is too brittle to deploy outdoors over campus-scale distances.",
      readme:
        "# Harvest Hub\n\nAutonomous irrigation scheduler.\n\n## Architecture\n- ESP32 + LoRa mesh sensor nodes\n- MQTT bridge to the dashboard\n- Rule engine thresholds per plant bed",
      originalSemester: "Fall",
      originalYear: 2024,
      ownerId: byUsername.alice._id,
      facultyMentorId: byUsername.davis._id,
      techStack: ["esp32", "lora", "mqtt", "react"],
      category: "iot",
      tags: ["sustainability", "hardware"],
      license: "GPL-3.0",
      repositoryUrl: "https://github.com/alice-sharma/harvest-hub",
      documentationUrl: "https://docs.harvesthub.scholarforge.dev",
      status: "published",
      publishedAt: now,
      starsCount: 2,
      forksCount: 0,
      viewsCount: 132,
      contributorsCount: 2,
    },
    {
      title: "Traffic Flow Anomaly Detector",
      slug: "traffic-flow-anomaly-detector",
      tagline: "Flags incident-prone stretches before they become gridlock.",
      description:
        "Streams GPS telemetry from the city's bus fleet, detects anomaly windows with an isolation-forest pipeline, and pushes alerts when a stretch's flow drops below its rolling baseline.",
      problemStatement:
        "Incident detection usually follows the incident. We need to score traffic-flow divergence in near real time from a noisy, sparse telemetry feed.",
      readme:
        "# Traffic Flow Anomaly Detector\n\n## Pipeline\n- Ingest: Kafka consumer for fleet GPS\n- Features: rolling velocity + heading entropy\n- Model: isolation forest per road segment\n- Alert: Webhook + dashboard",
      originalSemester: "Fall",
      originalYear: 2025,
      ownerId: byUsername.bob._id,
      techStack: ["python", "kafka", "scikit-learn"],
      category: "security",
      tags: ["smart-city", "ml"],
      license: "MIT",
      repositoryUrl: "https://github.com/bob-rao/traffic-flow-anomaly",
      deploymentUrl: "https://detector.demo.scholarforge.dev",
      lookingForContributors: true,
      requiredSkills: ["python", "kafka"],
      contributorNotes: "Happy to mentor any ML-curious junior.",
      status: "deployed",
      publishedAt: now,
      featured: true,
      starsCount: 0,
      forksCount: 0,
      viewsCount: 96,
      contributorsCount: 2,
    },
    {
      title: "Campus Seat Finder",
      slug: "campus-seat-finder",
      tagline: "Real-time seat availability for libraries and study halls.",
      description:
        "Map of every seat in the central library and both study halls, refreshed by a beacon floor-plan the moment a seat frees. Includes quiet-zone filtering.",
      problemStatement:
        "Peak-exam-week seat hunting is a slot machine. Capacity data exists across systems but never in one live map.",
      readme:
        "# Campus Seat Finder\n\n## Stack\n- React + Leaflet for the floor-plan\n- Node.js + Redis for occupancy counters",
      originalSemester: "Fall",
      originalYear: 2024,
      ownerId: byUsername.carol._id,
      techStack: ["react", "nodejs", "redis"],
      category: "web",
      tags: ["campus-life", "tools"],
      license: "MIT",
      repositoryUrl: "https://github.com/carol-menon/campus-seat-finder",
      demoUrl: "https://seats.demo.scholarforge.dev",
      status: "published",
      publishedAt: now,
      starsCount: 3,
      forksCount: 1,
      viewsCount: 187,
      contributorsCount: 2,
    },
    {
      title: "Campus Seat Finder Lite",
      slug: "campus-seat-finder-lite",
      tagline: "A lean rewrite of Seat Finder as a single-page navbar add-on.",
      description:
        "A forked, stripped-down variant of Campus Seat Finder that renders only the occupancy heatmap so it can live inside the campus portal's navbar without a full page load.",
      problemStatement: "The full Seat Finder experience is too heavy to embed in the portal navbar.",
      readme:
        "# Campus Seat Finder Lite\n\nForked from `campus-seat-finder`. Drops auth and beacon sync, keeps the live heatmap widget.",
      originalSemester: "Spring",
      originalYear: 2025,
      parentProjectId: null,
      version: 2,
      ownerId: byUsername.bob._id,
      techStack: ["react", "typescript"],
      category: "web",
      tags: ["campus-life", "tools"],
      license: "MIT",
      repositoryUrl: "https://github.com/bob-rao/campus-seat-finder-lite",
      status: "published",
      publishedAt: now,
      starsCount: 1,
      forksCount: 0,
      viewsCount: 41,
      contributorsCount: 1,
    },
    {
      title: "Scholarly Notes API",
      slug: "scholarly-notes-api",
      tagline: "Versioned course-notes API with citation-aware search.",
      description:
        "REST API that stores per-course notes as versioned documents, indexes them by topic, and surfaces citations back to the source lecture slides.",
      problemStatement:
        "Lecture notes fragment across drives and die with each batch. A versioned, searchable notes payload keeps institutional knowledge alive.",
      readme:
        "# Scholarly Notes API\n\n## Endpoints\n- `POST /notes` with version tag\n- `GET /notes?q=` full-text topic search\n- `GET /notes/:id/revisions`",
      originalSemester: "Fall",
      originalYear: 2025,
      ownerId: byUsername.erin._id,
      techStack: ["nodejs", "mongodb", "express"],
      category: "systems",
      tags: ["education", "api"],
      license: "Apache-2.0",
      repositoryUrl: "https://github.com/erin-k/scholarly-notes-api",
      status: "published",
      publishedAt: now,
      starsCount: 1,
      forksCount: 0,
      viewsCount: 64,
      contributorsCount: 1,
    },
    {
      title: "Gradebook Dashboard",
      slug: "gradebook-dashboard",
      tagline: "Visual analytics over raw gradebook exports.",
      description:
        "Turns the registrar's CSV export into a per-class analytics dashboard, complete with cohort distributions and early-warning flags for grade cliffs.",
      problemStatement:
        "Faculty eyeball grade cliffs in spreadsheets. A dashboard turns exports into early-warning signals.",
      readme:
        "# Gradebook Dashboard\n\n## Plug a CSV, get\n- grade distribution per component\n- cohort percentile bands\n- cliff detection",
      originalSemester: "Spring",
      originalYear: 2025,
      ownerId: byUsername.alice._id,
      techStack: ["react", "nextjs", "d3"],
      category: "data",
      tags: ["education", "analytics"],
      license: "MIT",
      status: "draft",
      publishedAt: null,
      starsCount: 0,
      forksCount: 0,
      viewsCount: 0,
      contributorsCount: 1,
    },
  ];

  const insertedProjects = await Project.insertMany(projectsData);

  const projectBySlug = Object.fromEntries(insertedProjects.map((p) => [p.slug, p]));

  projectBySlug["campus-seat-finder-lite"].parentProjectId = projectBySlug["campus-seat-finder"]._id;
  await projectBySlug["campus-seat-finder-lite"].save();

  const starPairs: Array<[string, string]> = [
    ["bob", "smart-campus-ride-share"],
    ["erin", "smart-campus-ride-share"],
    ["admin", "smart-campus-ride-share"],
    ["bob", "harvest-hub-irrigation"],
    ["erin", "harvest-hub-irrigation"],
    ["alice", "campus-seat-finder"],
    ["erin", "campus-seat-finder"],
    ["admin", "campus-seat-finder"],
    ["alice", "campus-seat-finder-lite"],
    ["carol", "scholarly-notes-api"],
  ];

  const starDocs = starPairs.map(([u, p]) => ({
    userId: byUsername[u]._id,
    projectId: projectBySlug[p]._id,
  }));
  await Star.insertMany(starDocs);

  const counts = {
    users: await User.countDocuments(),
    projects: await Project.countDocuments(),
    stars: await Star.countDocuments(),
  };

  console.log("Seed complete:", counts);
  console.log("Password for every seeded account:", SEED_PASSWORD);
  console.log("Users:", usersData.map((u) => `${u.email} (${u.role})`).join(", "));
  console.log("Published projects:", projectBySlug["smart-campus-ride-share"].title, "…");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });