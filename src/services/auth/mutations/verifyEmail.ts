import UserModel from '@/models/user';
import { ErrorCodes, MutationResolvers } from '@graphql/types/generated-graphql-types';
import { dateNow } from '@utils/date';
import { makeGraphqlError } from '@utils/error';
import { validatorVerifyEmail } from '@utils/validators';

export const verifyEmail: MutationResolvers['verifyEmail'] = async (_, { input }) => {
  const { email, otp } = input;
  const { isValid, error } = validatorVerifyEmail(input);

  if (!isValid) {
    throw makeGraphqlError(error.message, ErrorCodes.BadUserInput);
  }

  const user = await UserModel.findOne({ email });

  if (!user) {
    throw makeGraphqlError('User does not already exist!', ErrorCodes.BadUserInput);
  }

  if (!user.isConfirmed) {
    if (dateNow() < user.otpExpireAt) {
      if (user.confirmOTP === otp) {
        user.isConfirmed = true;
        user.confirmOTP = null;
        await user.save();
        return true;
      } else {
        throw makeGraphqlError('Otp does not match', ErrorCodes.BadUserInput);
      }
    } else {
      throw makeGraphqlError('Otp has been expired, resend otp and try again', ErrorCodes.OtpExpire);
    }
  } else {
    throw makeGraphqlError('Account already confirmed', ErrorCodes.Forbidden);
  }
};
