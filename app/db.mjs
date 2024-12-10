import { Firestore } from '@google-cloud/firestore';

const serviceAccountPath = './config/databases-service-account.json';
const db = new Firestore({
    keyFilename: serviceAccountPath,
    databaseId: 'newsgram'
});

export default db;