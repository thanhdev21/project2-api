import { Media, MediaStatus } from '@graphql/types/generated-graphql-types';
import mongoose, { Model } from 'mongoose';
interface IMedia extends mongoose.Document, Media {
  _id: mongoose.Schema.Types.ObjectId;
}

const MediaSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: false },
    fileName: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    size: { type: Number, required: false },
    type: { type: String, required: true },
    fileType: { type: String, required: true },
    status: { type: String, required: false, default: MediaStatus.Processing },
    path: { type: String, required: false },
    originUrl: { type: String, required: false },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);
export const MediaModel = mongoose.model('Media', MediaSchema, 'Media');
