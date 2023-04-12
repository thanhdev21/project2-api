import { MediaType, MediaFilterInput, MediaStatus } from '@graphql/types/generated-graphql-types';
import { MediaModel } from '@/models/media';

export const createMedia = async (input: { path: string; createdBy: string; fileName: string; fileType: string; type: MediaType; status?: MediaStatus; duration?: number; size?: number; title?: string }) => {
  const media = new MediaModel(input);
  return media.save();
};

export const getMedia = async (id: string) => {
  return MediaModel.findById(id);
};

export const getMedias = async (take: number, skip: number, filter?: MediaFilterInput) => {
  const conditions: any = {};

  //   if (filter) {
  //     const { query, type } = filter;

  //     if (query) {
  //       const _query = query.trim();
  //       conditions.
  //     }

  //     if (type) {
  //       queryBuilder.andWhere('media.type = :type', { type });
  //     }
  //   }
  let queryBuilder = MediaModel.find(conditions);

  queryBuilder = queryBuilder.sort({ createdAt: -1 });

  //   queryBuilder.take(take).skip(skip);
  return queryBuilder.lean().exec();
};
