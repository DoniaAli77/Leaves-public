import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  uri: process.env.MONGODB_URI,
  dbName: process.env.DATABASE_NAME,
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true,
  },
}));