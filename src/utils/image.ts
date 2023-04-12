import ImageMin from 'imagemin';
import MozJpeg from 'imagemin-mozjpeg';
export const reduceImageBuffer = async (buffer: Buffer) => {
  return ImageMin.buffer(buffer, {
    plugins: [MozJpeg({ quality: 90 })],
  });
};
