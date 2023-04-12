import { checkAuth, checkVerified, requiredAuth } from '@/middleware/auth';
import BookModel from '@/models/book';
import { MediaModel } from '@/models/media';
import { Book, ErrorCodes, MutationResolvers } from '@graphql/types/generated-graphql-types';
import { validateObjectIds } from '@utils/database';
import { makeGraphqlError } from '@utils/error';
import { validatorCreatBook } from '@utils/validators';

export const createBook = requiredAuth<MutationResolvers['createBook']>(async (_, { input }, { auth }) => {
  const { title, description, isbn, categories, author, price, releasedDate, content, bookType } = input;
  const { isValid, error } = validatorCreatBook(input);

  if (!isValid) {
    throw makeGraphqlError(error.message, ErrorCodes.BadUserInput);
  }

  const isVerified = await checkVerified(auth.userId);

  if (!isVerified) {
    throw makeGraphqlError('User is not verified', ErrorCodes.Forbidden);
  }

  const book = await BookModel.findOne({ title, deletedAt: null });

  if (input.coverPhoto) await validateObjectIds(MediaModel, [input.coverPhoto]);

  if (book) {
    throw makeGraphqlError('Book is already exist!', ErrorCodes.BadUserInput);
  }
  const conditions: any = {};
  conditions.categories = { $in: categories };
  const relatedBooks = await BookModel.find({ ...conditions })
    .distinct('_id')
    .exec();

  const newBook = new BookModel({
    title,
    description,
    isbn,
    author,
    uploadedBy: auth.userId,
    coverPhoto: input.coverPhoto,
    categories,
    price,
    releasedDate: releasedDate || new Date(),
    relatedBooks,
    content,
    bookType,
  });

  return await newBook.save().then(
    (res) =>
      BookModel.findById(res._id)
        .populate([
          { path: 'categories', match: { deletedAt: null } },
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
          },
        ])
        .exec() as unknown as Book,
  );
});
