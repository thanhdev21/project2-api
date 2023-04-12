import mongoose from 'mongoose';

const PublisherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    registedDate: { type: Date, default: new Date() },
    logo: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Media' },
    address: { type: String, required: true },
    numberOfWork: { type: Number },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);
const PublisherModel: any = mongoose.model('Publisher', PublisherSchema, 'Publisher');

export default PublisherModel;
