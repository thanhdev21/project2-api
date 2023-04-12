import env from '@/env';
import { checkAuth, requiredAuth } from '@/middleware/auth';
import { MediaModel } from '@/models/media';
import { createMedia } from '@business/media';
import { ErrorCodes, Media, MediaStatus, MediaType, MutationResolvers } from '@graphql/types/generated-graphql-types';
import { makeGraphqlError } from '@utils/error';

import { allowedPdfType, allowedPhotoType, allowedVideoType, genMediaType } from '@utils/helpers';
import { genFirebaseStorageFolderName, makeSlug, streamToBuffer, uploadFile } from '@utils/upload';

export const uploadMedia = requiredAuth<MutationResolvers['uploadMedia']>(async (_, { file }, { auth }) => {
  const {
    file: { createReadStream, filename: _filename, mimetype },
  } = await file;

  const stream = createReadStream();

  let uploadType: 'VIDEO' | 'IMAGE' | 'PDF' | null = null;

  if (allowedPhotoType(mimetype)) {
    uploadType = 'IMAGE';
  }
  if (allowedVideoType(mimetype)) {
    uploadType = 'VIDEO';
  }
  if (allowedPdfType(mimetype)) {
    uploadType = 'PDF';
  }

  if (!uploadType) {
    throw makeGraphqlError('Not allowed mime type', ErrorCodes.BadUserInput);
  }

  const folderDir = `${new Date().getFullYear()}/${new Date().getMonth() + 1}/${new Date().getDate()}`;

  const filename = makeSlug(_filename);

  const buffer = await streamToBuffer(stream);

  const uri = await uploadFile(buffer, filename, genFirebaseStorageFolderName(uploadType));

  const createData = {
    createdBy: auth.userId,
    path: `${folderDir}/${filename}`,
    fileName: filename,
    fileType: mimetype,
    status: MediaStatus.Ready,
    size: undefined,
    title: filename,
    originUrl: uri,
    type: genMediaType(uploadType),
  };

  const media = await createMedia(createData).then((res) => MediaModel.findById(res._id).populate('createdBy').exec());

  return media as unknown as Media;
});
