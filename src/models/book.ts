import { Book, BookType } from '@graphql/types/generated-graphql-types';
import mongoose, { Mongoose, Model } from 'mongoose';

interface IBook extends mongoose.Document, Book {
  _id: mongoose.Schema.Types.ObjectId;
}

const BookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, index: { unique: true } },
    description: { type: String, required: true },
    isbn: { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    author: { type: String, required: true },
    coverPhoto: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', required: false },
    content: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', required: true },
    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    deletedAt: {
      type: Date,
      default: null,
      nullable: true,
    },
    bookType: { type: mongoose.Schema.Types.String, default: BookType.Book },
    price: { type: Number, required: true },
    releasedDate: { type: mongoose.Schema.Types.Date, required: true },
    relatedBooks: [{ type: mongoose.Schema.Types.ObjectId, required: false, ref: 'Book' }],
    views: { type: Number, default: 0 },
  },
  { timestamps: true },
);
BookSchema.index({ title: 'text' });
BookSchema.index({ description: 'text' });
BookSchema.index({ author: 'text' });

const BookModel = mongoose.model('Book', BookSchema, 'Book');

export default BookModel;
