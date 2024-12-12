import 'dotenv/config';

import { Storage } from '@google-cloud/storage';

const serviceAccountPath = './config/databases-service-account.json';
const bucketDB = new Storage({
    keyFilename: serviceAccountPath
}).bucket(process.env.BUCKET_ID);

export default bucketDB;