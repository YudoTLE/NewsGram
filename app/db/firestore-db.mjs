import { Firestore } from '@google-cloud/firestore';

const serviceAccountPath = './config/databases-service-account.json';
const firestoreDB = new Firestore({
    keyFilename: serviceAccountPath,
    databaseId: 'newsgram'
});

export default firestoreDB;