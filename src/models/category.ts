import { Category } from '@graphql/types/generated-graphql-types';
import mongoose, { Model } from 'mongoose';

interface ICategory extends mongoose.Document, Category {
  _id: mongoose.Schema.Types.ObjectId;
}

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);
const CategoryModel = mongoose.model('Category', CategorySchema, 'Category');

export default CategoryModel;
