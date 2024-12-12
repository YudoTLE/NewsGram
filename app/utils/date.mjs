export const formatDate = (timestamp) => {
    if (!timestamp) return '';

    // Convert Firestore Timestamp to JavaScript Date
    const date = new Date(timestamp.seconds * 1000);  // _seconds is in seconds, so multiply by 1000 for milliseconds

    // Define the options for the formatting
    const options = {
        weekday: 'long', // "Monday"
        year: 'numeric', // "2021"
        month: 'long', // "December"
        day: 'numeric', // "12"
    };

    return date.toLocaleDateString('en-GB', options);  // Use 'en-GB' for the day/month/year format
};
