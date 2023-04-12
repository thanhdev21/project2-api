import { Feature } from '@graphql/types/generated-graphql-types';

import mongoose, { Model } from 'mongoose';

interface IFeature extends mongoose.Document, Feature {
  _id: mongoose.Schema.Types.ObjectId;
}

const FeatureSchema = new mongoose.Schema(
  {
    amountBook: { type: mongoose.Schema.Types.Number, nullable: true, required: false },
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    coverPhoto: { type: mongoose.Schema.Types.ObjectId, ref: 'Media' },
    deletedAt: { type: mongoose.Schema.Types.Date, nullable: true, default: null, required: false },
    description: { type: mongoose.Schema.Types.String, required: true },
    link: { type: mongoose.Schema.Types.String, required: false, nullable: true },
    title: { type: mongoose.Schema.Types.String, required: true },
    type: { type: mongoose.Schema.Types.String, required: true },
  },
  { timestamps: true },
);
const FeatureModel = mongoose.model('Feature', FeatureSchema, 'Feature');

export default FeatureModel;
