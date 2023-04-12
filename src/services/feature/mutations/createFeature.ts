import { checkAuth, checkVerified, requiredAuth } from '@/middleware/auth';
import BookModel from '@/models/book';
import FeatureModel from '@/models/feature';
import { MediaModel } from '@/models/media';
import { ErrorCodes, Feature, MutationResolvers } from '@graphql/types/generated-graphql-types';
import { validateObjectIds } from '@utils/database';
import { makeGraphqlError } from '@utils/error';
import { validatorFeatureInput } from '@utils/validators';
import { JwtPayload } from 'jsonwebtoken';

export const createFeature = requiredAuth<MutationResolvers['createFeature']>(async (_, { input }, { auth }) => {
  const { title, description, coverPhoto, link, type, books } = input;
  const { isValid, error } = validatorFeatureInput(input);

  if (!isValid) {
    throw makeGraphqlError(error.message, ErrorCodes.BadUserInput);
  }

  const isVerified = await checkVerified(auth.userId);

  if (!isVerified) {
    throw makeGraphqlError('User is not verified', ErrorCodes.Forbidden);
  }

  if (input.coverPhoto) await validateObjectIds(MediaModel, [input.coverPhoto]);

  const newFeature = new FeatureModel({
    title,
    description,
    uploadedBy: auth.userId,
    coverPhoto: input.coverPhoto,
    books,
    type,
    link,
  });

  return await newFeature.save().then((res) => FeatureModel.findById(res._id).populate(['coverPhoto', 'books']).exec() as unknown as Feature);
});
