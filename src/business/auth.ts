import { hashPassword } from '@utils/password';
import UserModel from '@/models/user';
import { randomNumber } from '@utils/helpers';
import { UserTokenType } from '@constants/enum';
import UserTokenModel from '@/models/userToken';
import { dateNow } from '@utils/date';
import { v4 } from 'uuid';

import mongoose from 'mongoose';

export const genUserToken = async (parentId: mongoose.Schema.Types.ObjectId, userTokenType: UserTokenType, expiresInSeconds: number = 600) => {
  const userTokenRepo = new UserTokenModel({
    expiresAt: dateNow() + expiresInSeconds,
    type: userTokenType,
    user: parentId,
  });
  return userTokenRepo.save();
};

export const createUser = async (input: { firstName: string; lastName: string; phoneNumber?: string; email: string; password: string; isEmailVerified: boolean }) => {
  let otp = randomNumber(4);
  const userRepo = new UserModel({
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    password: hashPassword(input.password),
    confirmOTP: otp,
    otpExpireAt: dateNow() + 1800,
  });

  return userRepo.save();
};
