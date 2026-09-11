import mongoose, { Schema, Document } from "mongoose";
import { PROJECT_CATEGORIES, LICENSE_TYPES, PROJECT_STATUS } from "@/lib/constants";

export interface IProject extends Document {
  title: string;
  slug: string;
  tagline: string;
  description: string;
  problemStatement: string;
  readme: string;
  parentProjectId: mongoose.Types.ObjectId | null;
  version: number;
  originalSemester: string;
  originalYear: number;
  ownerId: mongoose.Types.ObjectId;
  teamMemberIds: mongoose.Types.ObjectId[];
  facultyMentorId: mongoose.Types.ObjectId | null;
  techStack: string[];
  category: string;
  tags: string[];
  license: string;
  repositoryUrl: string | null;
  demoUrl: string | null;
  deploymentUrl: string | null;
  documentationUrl: string | null;
  researchPaperUrl: string | null;
  slidesUrl: string | null;
  coverImageUrl: string | null;
  screenshots: string[];
  videoUrl: string | null;
  courseCode: string | null;
  courseName: string | null;
  lookingForContributors: boolean;
  requiredSkills: string[];
  contributorNotes: string;
  status: string;
  publishedAt: Date | null;
  featured: boolean;
  deletedAt: Date | null;
  starsCount: number;
  forksCount: number;
  viewsCount: number;
  contributorsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true },
    tagline: { type: String, maxlength: 160, default: "" },
    description: { type: String, required: true, maxlength: 4000 },
    problemStatement: { type: String, maxlength: 2000, default: "" },
    readme: { type: String, default: "" },

    parentProjectId: { type: Schema.Types.ObjectId, ref: "Project", default: null },
    version: { type: Number, default: 1 },
    originalSemester: { type: String, required: true },
    originalYear: { type: Number, required: true },

    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    teamMemberIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
    facultyMentorId: { type: Schema.Types.ObjectId, ref: "User", default: null },

    techStack: [{ type: String, lowercase: true }],
    category: { type: String, enum: PROJECT_CATEGORIES, required: true },
    tags: [{ type: String, lowercase: true }],
    license: { type: String, enum: LICENSE_TYPES, default: "MIT" },

    repositoryUrl: { type: String, default: null },
    demoUrl: { type: String, default: null },
    deploymentUrl: { type: String, default: null },
    documentationUrl: { type: String, default: null },
    researchPaperUrl: { type: String, default: null },
    slidesUrl: { type: String, default: null },

    coverImageUrl: { type: String, default: null },
    screenshots: [{ type: String }],
    videoUrl: { type: String, default: null },

    courseCode: { type: String, default: null },
    courseName: { type: String, default: null },

    lookingForContributors: { type: Boolean, default: false },
    requiredSkills: [{ type: String, lowercase: true }],
    contributorNotes: { type: String, maxlength: 1000, default: "" },

    status: { type: String, enum: PROJECT_STATUS, default: "draft" },
    publishedAt: { type: Date, default: null },
    featured: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },

    starsCount: { type: Number, default: 0 },
    forksCount: { type: Number, default: 0 },
    viewsCount: { type: Number, default: 0 },
    contributorsCount: { type: Number, default: 1 },
  },
  { timestamps: true }
);

ProjectSchema.index({ slug: 1 }, { unique: true });
ProjectSchema.index({ status: 1, publishedAt: -1 });
ProjectSchema.index({ category: 1, status: 1 });
ProjectSchema.index({ ownerId: 1 });
ProjectSchema.index({ parentProjectId: 1 });
ProjectSchema.index({ featured: 1, status: 1 });
ProjectSchema.index({ techStack: 1 });
ProjectSchema.index({
  title: "text",
  tagline: "text",
  description: "text",
  tags: "text",
  techStack: "text",
});

export default mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);
