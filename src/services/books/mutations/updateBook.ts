import { checkAuth, checkPermissionAdminAndContentCreator, requiredAuth } from '@/middleware/auth';
import BookModel from '@/models/book';

import { Book, ErrorCodes, MutationResolvers } from '@graphql/types/generated-graphql-types';
import { makeGraphqlError } from '@utils/error';
import { validatorCreatBook } from '@utils/validators';
import { JwtPayload } from 'jsonwebtoken';

export const updateBook = requiredAuth<MutationResolvers['updateBook']>(async (_, { id, input }, { auth }) => {
  const { title, coverPhoto, categories, description, isbn, author, releasedDate, price, content, bookType } = input;
  const { isValid, error } = validatorCreatBook(input);

  if (!isValid) {
    throw makeGraphqlError(error.message, ErrorCodes.BadUserInput);
  }

  const hasPermission = await checkPermissionAdminAndContentCreator(auth.userId);

  if (!hasPermission) {
    throw makeGraphqlError('Only admin and content creator can update book', ErrorCodes.Forbidden);
  }

  const book = await BookModel.findById(id);

  if (!book) {
    throw makeGraphqlError('Book does not exist!', ErrorCodes.BadUserInput);
  }

  const conditions: any = {};
  conditions.categories = { $in: categories };
  conditions._id = { $ne: book._id };
  const newRelatedBook = await BookModel.find({ ...conditions }).distinct('_id');

  book.title = title;
  book.description = description;
  book.coverPhoto = coverPhoto;
  book.author = author;
  book.isbn = isbn;
  book.categories = categories as any;
  book.relatedBooks = newRelatedBook;
  book.releasedDate = releasedDate || new Date();
  book.price = price;
  book.content = content;
  book.bookType = bookType;
  await book.save().then((res) =>
    BookModel.findById(res._id)
      .populate([
        { path: 'categories', match: { deletedAt: null }, model: 'Category' },
        'coverPhoto',
        'uploadedBy',
        'content',
        {
          path: 'relatedBooks',
          populate: [
            { path: 'categories', match: { deletedAt: null }, model: 'Category' },
            { path: 'coverPhoto', match: { deleteAt: null }, model: 'Media' },
            { path: 'content', match: { deleteAt: null }, model: 'Media' },
            { path: 'uploadedBy', model: 'User' },
          ],
          // model: 'Book',
        },
      ])
      .exec(),
  );

  return book as unknown as Book;
});
