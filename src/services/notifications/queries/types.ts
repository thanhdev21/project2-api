import { NotificationType, QueryResolvers } from '@graphql/types/generated-graphql-types';
import { requiredAuth } from '@middleware/auth';

export const getNotificationTypes = requiredAuth<QueryResolvers['getNotificationTypes']>(async () => {
  return [NotificationType.System, NotificationType.RepliedComment, NotificationType.AddedComment];
});
