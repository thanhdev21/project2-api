import { checkAuth, checkPermissionAdminAndContentCreator, requiredAuth } from '@/middleware/auth';
import AuthorModel from '@/models/author';
import { Author, ErrorCodes, MutationResolvers } from '@graphql/types/generated-graphql-types';
import { makeGraphqlError } from '@utils/error';
import { validatorCreateAuthor } from '@utils/validators';
import { JwtPayload } from 'jsonwebtoken';

export const updateAuthor = requiredAuth<MutationResolvers['updateAuthor']>(async (_, { id, input }, { auth }) => {
  const { name, description, avatar, gender, dateOfBirth } = input;
  const { isValid, error } = validatorCreateAuthor(input);

  if (!isValid) {
    throw makeGraphqlError(error.message, ErrorCodes.BadUserInput);
  }

  const hasPermission = await checkPermissionAdminAndContentCreator(auth.userId);

  if (!hasPermission) {
    throw makeGraphqlError('Only admin and content creator can update Author', ErrorCodes.Forbidden);
  }

  const author = await AuthorModel.findById(id);

  if (!author) {
    throw makeGraphqlError('Author does not exist!', ErrorCodes.BadUserInput);
  }

  if (author.name === name && author.id !== id) {
    throw makeGraphqlError('Author already exist!', ErrorCodes.BadUserInput);
  }

  author.name = name;
  author.description = description;
  author.dateOfBirth = dateOfBirth;
  author.avatar = avatar;
  author.gender = gender;
  await author.save().then((res) =>
    AuthorModel.findById(res._id)
      .populate([{ path: 'avatar', match: { deleteAt: null }, model: 'Media' }])
      .exec(),
  );

  return author as unknown as Author;
});
