import UserModel from '@/models/user';
import { ErrorCodes, MutationResolvers } from '@graphql/types/generated-graphql-types';
import { dateNow } from '@utils/date';
import { makeGraphqlError } from '@utils/error';
import { JWTAuthTokenType } from '@utils/jwt';
import mailer, { MAILER_CONFIG_ACCOUNT } from '@utils/mailer';
import { validatorResendOTP } from '@utils/validators';
import jwt from 'jsonwebtoken';

export const forgotPassword: MutationResolvers['forgotPassword'] = async (_, { email }) => {
  const { isValid, error } = validatorResendOTP(email);

  if (!isValid) {
    throw makeGraphqlError(error.message, ErrorCodes.BadUserInput);
  }

  const user = await UserModel.findOne({ email });

  if (!user) {
    throw makeGraphqlError('User does not already exist!', ErrorCodes.BadUserInput);
  }

  const resetPasswordToken = jwt.sign({ userId: user._id, type: JWTAuthTokenType.RESET_PASSWORD }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_RESET_PASWORD_TOKEN_EXPIRES,
    algorithm: 'HS256',
  });

  const resetPasswordlink = `http://book-admin-reactjs-tranning.s3-website-ap-southeast-1.amazonaws.com/forgot-password/new-password?token=${resetPasswordToken}`;

  mailer.send(MAILER_CONFIG_ACCOUNT.confirmEmails.from, email, 'RESET YOUR PASSWORD', mailer.mailTemplateResetPassword(resetPasswordlink));
  user.resetPasswordToken = resetPasswordToken;
  user.resetPasswordTokenExpiredAt = dateNow() + 1800;
  await user.save();
  return true;
};
