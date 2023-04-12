import { checkAuth, checkPermissionAdminAndContentCreator, requiredAuth } from '@/middleware/auth';
import PublisherModel from '@/models/publisher';
import { ErrorCodes, MutationResolvers } from '@graphql/types/generated-graphql-types';
import { makeGraphqlError } from '@utils/error';
import { validatorCreatePublisher } from '@utils/validators';
import { JwtPayload } from 'jsonwebtoken';

export const updatePublisher = requiredAuth<MutationResolvers['updatePublisher']>(async (_, { id, input }, { auth }) => {
  const { name, description, logo, registedDate, address, numberOfWork } = input;
  const { isValid, error } = validatorCreatePublisher(input);

  if (!isValid) {
    throw makeGraphqlError(error.message, ErrorCodes.BadUserInput);
  }

  const hasPermission = await checkPermissionAdminAndContentCreator(auth.userId);

  if (!hasPermission) {
    throw makeGraphqlError('Only admin and content creator can update Publisher', ErrorCodes.Forbidden);
  }

  const publisher = await PublisherModel.findById(id);

  if (!publisher) {
    throw makeGraphqlError('Publisher does not exist!', ErrorCodes.BadUserInput);
  }

  if (publisher.name === name && publisher.id !== id) {
    throw makeGraphqlError('Publisher already exist!', ErrorCodes.BadUserInput);
  }

  publisher.name = name;
  publisher.description = description;
  publisher.address = address;
  publisher.logo = logo;
  publisher.numberOfWork = numberOfWork;
  publisher.registedDate = registedDate;
  await publisher.save().then((res) => {
    PublisherModel.findById(res._id)
      .populate([{ path: 'logo', match: { deleteAt: null }, model: 'Media' }])
      .exec();
  });

  return publisher;
});
