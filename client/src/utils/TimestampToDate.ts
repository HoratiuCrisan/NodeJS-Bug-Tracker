interface FirebaseTimestamp {
    _seconds: number;
    _nanoseconds: number;
}

const convertTimestampToDate = (timestamp: FirebaseTimestamp | Date | null | undefined): Date => {
    /* If the timestamp is invalid, return a new error */
    if (timestamp instanceof Date) {
        return timestamp;
    }

    // If the timestamp is not valid, throw an error
    if (!timestamp || typeof timestamp._seconds !== 'number' || typeof timestamp._nanoseconds !== 'number') {
        throw new Error("Invalid timestamp: " + JSON.stringify(timestamp));
    }

    /* convert the nanoseconds to seconds and add them to the timestamp seconds */
    const seconds = (timestamp._seconds + timestamp._nanoseconds * 10**-9);
    
    /* Convert the seconds to milliseconds and return a new date */
    /* To convert the seconds to milliseconds, muitiply the seconds by 1000 */
    return new Date(seconds * 1000);
}

export default convertTimestampToDate;