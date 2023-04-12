import mongoose from 'mongoose';

export interface UserToken {
  type: number | null;
  tokenId: mongoose.Types.ObjectId | null;
  expiresAt: number | null;
  user: mongoose.Types.ObjectId;
}

const UserTokenSchema = new mongoose.Schema<UserToken>(
  {
    type: { type: Number, required: false },
    tokenId: { type: mongoose.Schema.Types.ObjectId, required: false },
    expiresAt: { type: Number, required: false },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
  },
  { timestamps: true },
);
const UserTokenModel = mongoose.model('UserToken', UserTokenSchema, 'UserToken');

export default UserTokenModel;
