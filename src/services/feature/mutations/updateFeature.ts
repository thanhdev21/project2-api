import { checkAuth, checkPermissionAdminAndContentCreator, requiredAuth } from '@/middleware/auth';
import FeatureModel from '@/models/feature';
import { ErrorCodes, Feature, MutationResolvers } from '@graphql/types/generated-graphql-types';
import { makeGraphqlError } from '@utils/error';
import { validatorFeatureInput } from '@utils/validators';
import { JwtPayload } from 'jsonwebtoken';

export const updateFeature = requiredAuth<MutationResolvers['updateFeature']>(async (_, { id, input }, { auth }) => {
  const { title, coverPhoto, description, books, type, link } = input;
  const { isValid, error } = validatorFeatureInput(input);

  if (!isValid) {
    throw makeGraphqlError(error.message, ErrorCodes.BadUserInput);
  }

  const hasPermission = await checkPermissionAdminAndContentCreator(auth.userId);

  if (!hasPermission) {
    throw makeGraphqlError('Only admin and content creator can update feature', ErrorCodes.Forbidden);
  }

  const feature = await FeatureModel.findById(id);

  if (!feature) {
    throw makeGraphqlError('Feature does not exist!', ErrorCodes.BadUserInput);
  }

  feature.title = title;
  feature.description = description;
  coverPhoto;
  feature.link = link;
  feature.books = books as any;
  feature.type = type;
  await feature.save().then((res) => FeatureModel.findById(res._id).populate(['coverPhoto', 'books']).exec());

  return feature as unknown as Feature;
});
