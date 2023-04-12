import { checkAuth } from '@/middleware/auth';
import ViewModel from '@/models/view';
import { Book, MutationResolvers } from '@graphql/types/generated-graphql-types';
import { requiredAuth } from '@middleware/auth';

import { ViewCreatedPubsub } from '@/pubsubs/view';
import BookModel from '@/models/book';

export const views = requiredAuth<MutationResolvers['views']>(async (_, { bookId }, { auth }) => {
  const newView = new ViewModel({
    bookId,
    viewAt: new Date(),
  });

  await newView.save();
  const book = await BookModel.findById(bookId);
  ViewCreatedPubsub.publish(book as unknown as Book);
  return true;
});
