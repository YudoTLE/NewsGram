import 'dotenv/config';

import { Firestore } from '@google-cloud/firestore';

const serviceAccountPath = './config/databases-service-account.json';
const firestoreDB = new Firestore({
    keyFilename: serviceAccountPath,
    databaseId: process.env.FIRESTORE_DATABASE_ID 
});

export default firestoreDB;