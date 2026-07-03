import mongoose, { Document, Model, Schema } from 'mongoose';
import { ScheduledPost } from '../types/domain';

interface ScheduledPostDocument extends ScheduledPost, Document {}

const ScheduledPostSchema = new Schema<ScheduledPostDocument>({
  id: { type: String, required: true, unique: true },
  topic: { type: String, required: true },
  platform: { type: String, required: true, enum: ['facebook', 'instagram'] },
  content: { type: Object, required: true },
  scheduledFor: { type: String, required: true },
  createdAt: { type: String, required: true },
  status: { type: String, required: true, enum: ['scheduled', 'published'] },
});

export const ScheduledPostModel: Model<ScheduledPostDocument> = mongoose.model<ScheduledPostDocument>('ScheduledPost', ScheduledPostSchema);
