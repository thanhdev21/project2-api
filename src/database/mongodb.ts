import mongoose from 'mongoose';

export const connect = async (logging: boolean = false) => {
  const { MONGODB_URL } = process.env;

  mongoose.connection.on('connected', () => {
    if (logging) console.log('Connected to MongoDB!');
  });
  mongoose.connection.on('error', (e) => {
    console.error(e);
    if (logging) console.log('Connect to MongoDB failed!');
  });
  mongoose.connection.on('close', (e) => {
    mongoose.connection.removeAllListeners();
  });
  return mongoose.connect(MONGODB_URL, {});
};
