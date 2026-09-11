import mongoose, { Schema, Document } from "mongoose";

export interface IStar extends Document {
  userId: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StarSchema = new Schema<IStar>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  },
  { timestamps: true }
);

StarSchema.index({ userId: 1, projectId: 1 }, { unique: true });

export default mongoose.models.Star || mongoose.model<IStar>("Star", StarSchema);
