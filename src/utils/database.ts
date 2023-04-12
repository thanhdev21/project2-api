import mongoose from 'mongoose';
import { ValidationError } from 'apollo-server-express';

export const validateObjectIds = async (model: typeof mongoose.Model, ids: Array<string>): Promise<boolean> => {
  const invalidIds = [];
  ids.map((id) => {
    const valid = mongoose.Types.ObjectId.isValid(id);
    if (!valid) invalidIds.push(id);
    return id;
  });
  if (invalidIds.length > 0) throw new ValidationError(`ObjectIds validation failed at: ${invalidIds.join(',')}`);
  const totalDocs = await model.countDocuments({ _id: { $in: ids } });
  if (totalDocs !== ids.length) throw new ValidationError(`ObjectIds validation failed at model: ${model.modelName}!`);
  return true;
};

export const validateMongoObjectIds = (ids: Array<string>) => {
  const invalidIds = [];
  ids.map((id) => {
    const valid = mongoose.Types.ObjectId.isValid(id);
    if (!valid) invalidIds.push(id);
    return id;
  });
  if (invalidIds.length > 0) throw new ValidationError(`ObjectIds validation failed at: ${invalidIds.join(',')}`);
};

export const makeMongoId = mongoose.Types.ObjectId;
