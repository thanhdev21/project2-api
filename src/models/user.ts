import { User, UserStatus } from '@graphql/types/generated-graphql-types';
import mongoose, { Schema } from 'mongoose';

interface IUser extends mongoose.Document, User {
  _id: string;
}
const ObjectId = Schema.Types.ObjectId;

const UserSchema = new mongoose.Schema(
  {
    // _id: { type: mongoose.Schema.Types.ObjectId, required: false },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    isConfirmed: { type: Boolean, required: true, default: false },
    confirmOTP: { type: String, required: false, nullable: true },
    status: { type: String, required: true, default: UserStatus.Active },
    otpExpireAt: { type: Number, required: false, nullable: true },
    role: { type: Number, required: true },
    resetPasswordToken: { type: String, required: false, nullable: true },
    resetPasswordTokenExpiredAt: { type: Number, required: false, nullable: true },
    unreadSystemNoticeIds: [ObjectId],
    unsubscribeNotificationTypes: [String],
    subscribedFirebaseTokens: [String],
    socketIds: [String],
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true, strict: false },
);

// Virtual for user's full name
UserSchema.virtual('fullName').get(function (this: User) {
  return this.firstName + ' ' + this.lastName;
});
UserSchema.index({ email: 1 });

const UserModel = mongoose.model('User', UserSchema);
export default UserModel;
