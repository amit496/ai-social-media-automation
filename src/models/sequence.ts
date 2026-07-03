import mongoose, { Document, Model, Schema } from 'mongoose';

interface SequenceDocument extends Document {
  name: string;
  value: number;
}

const SequenceSchema = new Schema<SequenceDocument>({
  name: { type: String, required: true, unique: true },
  value: { type: Number, required: true },
});

export const SequenceModel: Model<SequenceDocument> = mongoose.model<SequenceDocument>('Sequence', SequenceSchema);
