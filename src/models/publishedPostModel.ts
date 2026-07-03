import mongoose, { Document, Model, Schema } from 'mongoose';
import { PublishedPost } from '../types/domain';

interface PublishedPostDocument extends PublishedPost, Document {}

const PublishedPostSchema = new Schema<PublishedPostDocument>({
  id: { type: String, required: true, unique: true },
  topic: { type: String, required: true },
  platform: { type: String, required: true, enum: ['facebook', 'instagram'] },
  content: { type: Object, required: true },
  publishedAt: { type: String, required: true },
  status: { type: String, required: true, enum: ['published'] },
  externalId: { type: String },
  publishMessage: { type: String },
});

export const PublishedPostModel: Model<PublishedPostDocument> = mongoose.model<PublishedPostDocument>('PublishedPost', PublishedPostSchema);
