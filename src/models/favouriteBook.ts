import { FavouriteBook } from '@graphql/types/generated-graphql-types';
import mongoose from 'mongoose';

interface IFavouriteBook extends mongoose.Document, FavouriteBook {
  _id: mongoose.Schema.Types.ObjectId;
}
const FavouriteBookSchema = new mongoose.Schema(
  {
    favouriteBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  },
  { timestamps: true },
);
const FavouriteBookModel = mongoose.model('FavouriteBook', FavouriteBookSchema, 'FavouriteBook');

export default FavouriteBookModel;
