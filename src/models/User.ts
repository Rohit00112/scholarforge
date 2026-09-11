import mongoose, { Schema, Document } from "mongoose";
import { USER_ROLES, BRANCHES } from "@/lib/constants";

export interface IUser extends Document {
  email: string;
  emailVerified: Date | null;
  passwordHash: string;
  role: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  bio: string;
  rollNumber: string | null;
  batch: string | null;
  branch: string | null;
  semester: number | null;
  department: string | null;
  researchAreas: string[];
  mentorshipCapacity: number;
  skills: string[];
  interests: string[];
  githubUsername: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  reputationScore: number;
  badges: string[];
  collegeEmailDomain: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    emailVerified: { type: Date, default: null },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: USER_ROLES, default: "student" },

    name: { type: String, required: true, trim: true, maxlength: 80 },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^[a-z0-9-]{3,30}$/,
    },
    avatarUrl: { type: String, default: null },
    bio: { type: String, maxlength: 500, default: "" },

    rollNumber: { type: String, default: null, index: true },
    batch: { type: String, default: null },
    branch: { type: String, enum: BRANCHES, default: null },
    semester: { type: Number, min: 1, max: 10, default: null },

    department: { type: String, default: null },
    researchAreas: [{ type: String }],
    mentorshipCapacity: { type: Number, default: 5 },

    skills: [{ type: String, lowercase: true }],
    interests: [{ type: String, lowercase: true }],
    githubUsername: { type: String, default: null },
    linkedinUrl: { type: String, default: null },
    portfolioUrl: { type: String, default: null },

    reputationScore: { type: Number, default: 0 },
    badges: [{ type: String }],

    collegeEmailDomain: { type: String, required: true },
  },
  { timestamps: true }
);

UserSchema.index({ username: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1, branch: 1 });
UserSchema.index({ name: "text", username: "text", bio: "text", skills: "text" });

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
