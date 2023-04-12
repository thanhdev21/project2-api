import { pubsub } from './index';
import { Book, SubscriptionOnViewedArgs } from '@graphql/types/generated-graphql-types';
import { withFilter } from 'graphql-subscriptions/dist/with-filter';

export const ViewCreatedPubsub = {
  publish: (book: Book) => pubsub.publish('VIEW_BOOK', book),
  filteredSubscription: withFilter(
    () => pubsub.asyncIterator(['VIEW_BOOK']),
    ({ _id }: Book, variables: SubscriptionOnViewedArgs) => {
      console.log('_id', _id, variables);

      return _id === variables.bookId;
    },
  ),
  resolve: (book: Book) => book,
};
