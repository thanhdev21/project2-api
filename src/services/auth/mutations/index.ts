import { MutationResolvers } from '@graphql/types/generated-graphql-types';
import { adminLogin } from './adminLogin';
import { forgotPassword } from './forgotPassword';
import { login } from './login';
import { logout } from './logout';
import { refreshToken } from './refreshToken';
import { register } from './register';
import { resendOtp } from './resendOTP';
import { resetPassword } from './resetPassword';
import { verifyEmail } from './verifyEmail';
import { changePassword } from './changePassword';

export const authMutations: MutationResolvers = {
  register,
  login,
  verifyEmail,
  resendOtp,
  refreshToken,
  logout,
  adminLogin,
  forgotPassword,
  resetPassword,
  changePassword,
};
