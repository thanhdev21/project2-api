import { Book } from '@graphql/types/generated-graphql-types';
import mongoose from 'mongoose';

interface IBook extends mongoose.Document, Book {
  _id: mongoose.Schema.Types.ObjectId;
}

const ViewSchema = new mongoose.Schema(
  {
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    viewAt: { type: Date, required: true },
  },
  { timestamps: true },
);

const ViewModel = mongoose.model('View', ViewSchema, 'View');

export default ViewModel;
