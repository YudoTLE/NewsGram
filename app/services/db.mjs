import firestoreDB from '../db/firestore-db.mjs';
import bucketDB from '../db/bucket-db.mjs';

export const uploadImage = async (img, fileName) => {
    try {
        return await new Promise((resolve) => {
            const blob = bucketDB.file(fileName);
            const blobStream = blob.createWriteStream({
                resumable: false,
                metadata: {
                    contentType: img.mimetype,
                },
            });

            blobStream.on('finish', () => {
                const imgUrl = `https://storage.googleapis.com/${ bucketDB.name }/${ fileName }`;
                resolve(imgUrl);
            });

            blobStream.on('error', () => {
                resolve(undefined);
            });

            blobStream.end(img.buffer);
        });
    } catch (error) {
        console.error("Unexpected error during image upload:", error);
        return undefined;
    }
};

export const createArticle = async (articleData) => {
    const { title, content, category, authorId, img } = articleData;

    const articleRef = await firestoreDB.collection('articles').add({
        title,
        content,
        category,
        authorId,
        createdAt: new Date()
    });

    const imgUrl = await uploadImage(img, articleRef.id);
    if (imgUrl)
        await articleRef.update({ imgUrl });

    return (await articleRef.get()).data();
};