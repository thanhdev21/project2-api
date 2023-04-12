import { checkAuth, checkPermissionAdminAndContentCreator, requiredAuth } from '@/middleware/auth';
import CategoryModel from '@/models/category';
import AuthorModel from '@/models/author';
import { Author, AuthorResolvers, ErrorCodes, MutationResolvers } from '@graphql/types/generated-graphql-types';
import { makeGraphqlError } from '@utils/error';
import { validatorCreateAuthor } from '@utils/validators';
import { JwtPayload } from 'jsonwebtoken';

export const createAuthor = requiredAuth<MutationResolvers['createAuthor']>(async (_, { input }, { auth }) => {
  const { name, description, avatar, gender, dateOfBirth } = input;
  const { isValid, error } = validatorCreateAuthor(input);

  if (!isValid) {
    throw makeGraphqlError(error.message, ErrorCodes.BadUserInput);
  }

  const hasPermission = await checkPermissionAdminAndContentCreator(auth.userId);

  if (!hasPermission) {
    throw makeGraphqlError('Only admin and content creator can create author', ErrorCodes.Forbidden);
  }

  const author = await AuthorModel.findOne({ name, deletedAt: null });

  if (author) {
    throw makeGraphqlError('Author is already exist!', ErrorCodes.BadUserInput);
  }

  const newAuthor = new AuthorModel({
    name,
    dateOfBirth,
    gender,
    description,
    avatar,
  });
  await newAuthor.save();

  return newAuthor as unknown as Author;
});
