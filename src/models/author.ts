import mongoose from 'mongoose';

const AuthorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, required: true },
    description: { type: String },
    likeCount: { type: Number, default: 0 },
    compositionCount: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null },
    avatar: { type: mongoose.Schema.Types.ObjectId, ref: 'Media' },
  },
  { timestamps: true },
);
const AuthorModel = mongoose.model('Author', AuthorSchema);

export default AuthorModel;
