import { Storage } from '@google-cloud/storage';

const serviceAccountPath = './config/databases-service-account.json';
const bucketDB = new Storage({
    keyFilename: serviceAccountPath
}).bucket('newsgram-123456-bucket');

export default bucketDB;