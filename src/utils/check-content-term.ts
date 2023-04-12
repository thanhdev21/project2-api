import { ErrorCodes } from '@graphql/types/generated-graphql-types';
import { UserError } from './error';

export const checkTermContent = (data: any) => {
  if (!data || data.deletedAt) {
    throw new UserError('Record not found', ErrorCodes.NotFound);
  }
};
