import UserModel from '@/models/user';
import { ErrorCodes, MutationResolvers } from '@graphql/types/generated-graphql-types';
import { dateNow } from '@utils/date';
import { makeGraphqlError } from '@utils/error';
import { randomNumber } from '@utils/helpers';
import mailer, { MAILER_CONFIG_ACCOUNT } from '@utils/mailer';
import { validatorResendOTP } from '@utils/validators';

export const resendOtp: MutationResolvers['resendOtp'] = async (_, { email }) => {
  const { isValid, error } = validatorResendOTP(email);
  const otp = randomNumber(4);
  if (!isValid) {
    throw makeGraphqlError(error.message, ErrorCodes.BadUserInput);
  }

  const user = await UserModel.findOne({ email });

  if (!user) {
    throw makeGraphqlError('User does not already exist!', ErrorCodes.BadUserInput);
  }

  if (!user.isConfirmed) {
    mailer.send(MAILER_CONFIG_ACCOUNT.confirmEmails.from, email, 'Please confirm your account', mailer.mailTemplate(otp));
    user.isConfirmed = false;
    user.confirmOTP = otp.toString();
    user.otpExpireAt = dateNow() + 1800;
    await user.save();
    return true;
  } else {
    throw makeGraphqlError('Account already confirmed', ErrorCodes.Forbidden);
  }
};
