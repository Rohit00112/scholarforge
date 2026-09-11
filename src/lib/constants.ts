export const USER_ROLES = ["student", "faculty", "admin"] as const;

export const BRANCHES = [
  "CSE", "IT", "ECE", "EEE", "MECH", "CIVIL", "AI-ML", "DS", "OTHER",
] as const;

export const PROJECT_STATUS = [
  "draft",       // only owner sees
  "published",   // public catalog
  "archived",    // visible, marked inactive
  "deployed",    // published + live deployment
] as const;

export const PROJECT_CATEGORIES = [
  "web", "mobile", "ml-ai", "iot", "systems", "security",
  "data", "design", "research", "other",
] as const;

export const LICENSE_TYPES = [
  "MIT", "Apache-2.0", "GPL-3.0", "BSD-3-Clause", "CC-BY-4.0", "Proprietary", "Unlicensed",
] as const;

export const CONTRIBUTION_ROLES = ["lead", "contributor", "mentor", "reviewer"] as const;

export const REQUEST_STATUS = ["pending", "accepted", "rejected"] as const;
