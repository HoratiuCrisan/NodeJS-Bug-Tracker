import admin from "../../config/firebase";
import { AppError, executeWithHandling } from "@bug-tracker/usermiddleware";
import { User } from "../types/User";
import env from "dotenv";
env.config();

const db = admin.firestore();
const  getAuth = admin.auth;
const FieldPath = admin.firestore.FieldPath;

export class UserRepository {
    private _dbUsersCollection: string;

    constructor() {
        /* Verify if the env data was initialized */
        if (!process.env.USERS_COLLECTION) {
            throw new AppError(`InvalidEnvData`, 400, `Invalid env. data`);
        }

        this._dbUsersCollection = process.env.USERS_COLLECTION;
    }

    /**
     * 
     * @param {User} user The user data 
     * @returns {Promise<User>} The data of the user from the database
     */
    async createUser(user: User): Promise<User> {
        return executeWithHandling(
            async () => {
                /* Create a user document and get the reference */
                const userRef = db.collection(this._dbUsersCollection).doc(user.id);

                /* Add the user data to the document */
                await userRef.set(user);

                /* Return the user data */
                return (await userRef.get()).data() as User;
            },
            `CreateUserError`,
            500,
            `Failed to create user`,
        );
    }

    /**
     * 
     * @param {string} userId The ID of the user to retrieve
     * @returns {Promise<User>} The retrieved user data
     */
    async loginUser(userId: string): Promise<User> {
        return executeWithHandling(
            async () => {
                /* Get the user reference */
                const userRef = db.collection(this._dbUsersCollection).doc(userId);

                /* Get the user document */
                const userDoc = await userRef.get();

                /* Check if the user document exists */
                if (!userDoc.exists) {
                    throw new AppError(`UserNotFound`, 404, `User not found. Failed to login user`);
                }

                /* Return the user data */
                return userDoc.data() as User;
            },
            `LoginUserError`,
            500,
            `Failed to login user`,
        );
    }

    /**
     * 
     * @param {string} orderBy The ordering criteria 
     * @param {"asc" | "desc"} orderDirection The direction of the fetching
     * @param {number} limit The number of users retrieved at a fetch
     * @param {string | undefined} startAfter The ID of the last user retrieved at the previous fetching
     * @returns {Promise<User[]>} The list of users fetched
     */
    async getUsers(
        orderBy: string,
        orderDirection: "asc" | "desc",
        limit: number, 
        startAfter?: string
    ): Promise<User[]> {
        return executeWithHandling(
            async () => {
                /* Get the users reference for the user collection */
                const usersRef = db.collection(this._dbUsersCollection);

                /* Order the references by the order criteria and in the direction sent from the function params */
                let orderedUsers = usersRef.orderBy(orderBy, orderDirection);

                /* Check if the ID of the last user fetched was sent */ 
                if (startAfter) {
                    /* Get the snapshot for the last user ID */
                    const lastUserSnapshot = await usersRef.doc(startAfter).get();

                    /* Check if the snapshot exists */
                    if (!lastUserSnapshot.exists) {
                        /* Start the fetching process after the last user ID */
                        orderedUsers = orderedUsers.startAfter(lastUserSnapshot);
                    }
                }

                /* Add the fetching limitation */
                orderedUsers = orderedUsers.limit(limit);

                /* Create a users list to store the users fetched */
                const users: User[] = [];

                /* Get the collection documents */
                const usersDoc = await orderedUsers.get();

                /* Map over the user documents */
                usersDoc.forEach((userDoc) => {
                    /* Add each user to the list */
                    users.push(userDoc.data() as User);
                });

                /* Return the list of users */
                return users;
            },
            `GetUsersError`,
            500,
            `Failed to retrieve users`
        );
    }

    /**
     * 
     * @param {string} userId The ID of the user document to retrieve
     * @returns {Promise<User>} The retrieved user data
     */
    async getUser(userId: string): Promise<User> {
        return executeWithHandling(
            async () => {
                /* Get the usre reference */
                const userRef = db.collection(this._dbUsersCollection).doc(userId);

                /* Get the user document */
                const userDoc = await userRef.get();

                /* Check if the document exists */
                if (!userDoc.exists) {
                    throw new AppError(`UserNotFound`, 404, `User not found. Failed to retrieve user data`);
                }

                /* Return the user document data */
                return userDoc.data() as User;
            },
            `GetUserError`,
            500,
            `Failed to retrieve user data`
        );
    }

    /**
     * 
     * @param {string} userIds The list of user IDs
     * @returns {Promise<User[]>} The list of retrieved data for the user IDs
     */
    async getUsersData(userIds: string[]): Promise<User[]> {
        return executeWithHandling(
            async () => {
                const users: User[] = [];

                /* Iterate over the list of user IDs and generate chunks of items to retrieve */
                for (let i = 0; i < userIds.length; i+= 10) {
                    /* Set the chunk to 10 (max allowed chunk for the free plan) */
                    const chunk = userIds.slice(i, i + 10);

                    /* Get the snapshots for the chunk of users */
                    const snapshot = await db   
                        .collection(this._dbUsersCollection)
                        .where(FieldPath.documentId(), "in", chunk)
                        .get();

                    /* Add the data of each user to the users list */
                    snapshot.forEach((doc) => {
                        users.push(doc.data() as User);
                    });
                }

                return users;
            },
            `GetUsersDataError`,
            500,
            `Failed to retrieve users data based on the IDs`
        );
    }

    /**
     * 
     * @param {string} userId The ID of the user to update 
     * @param {string} displayName The new displayName of the user
     * @returns {Promise<User>} The updated user data
     */
    async updateUserDisplayName(userId: string, displayName: string): Promise<User> {
        return executeWithHandling(
            async () => {
                /* Get the user reference */
                const userRef = db.collection(this._dbUsersCollection).doc(userId);

                /* Get the user document */
                const userDoc = await userRef.get();

                /* Check if the document exists */
                if (!userDoc.exists) {
                    throw new AppError(`UserNotFound`, 404, `User not found. Failed to update user displayName`);
                }

                /* Update the displayName of the user */
                await userRef.update({
                    displayName,
                });

                /* Update authentication displayName for the user */
                await getAuth().updateUser(userId, {
                    displayName
                });

                /* Return the updated user data */
                return (await userRef.get()).data() as User;
            },
            `UpdateUserDisplayNameError`,
            500,
            `Failed to update user displayName`
        );
    }

    /**
     * 
     * @param {string} userId The ID of the user to update 
     * @param {string} email The new email of the user
     * @returns {Promise<User>} The updated user data
     */
    async updateUserEmail(userId: string, email: string): Promise<User> {
        return executeWithHandling(
            async () => {
                /* Get the user reference */
                const userRef = db.collection(this._dbUsersCollection).doc(userId);

                /* Get the user document */
                const userDoc = await userRef.get();

                /* Check if the document exists */
                if (!userDoc.exists) {
                    throw new AppError(`UserNotFound`, 404, `User not found. Failed to update user email`);
                }

                /* Update the user email */
                await userRef.update({
                    email,
                });

                /* Update authentication email for the user */
                await getAuth().updateUser(userId, {
                    email,
                });

                /* Return the updated user data */
                return (await userRef.get()).data() as User;
            },
            `UpdateUserEmailError`,
            500,
            `Failed to update user email`
        );
    }

    /**
     * 
     * @param {string} userId The ID of the user to update 
     * @param {string} photoUrl The new photo of the user
     * @returns {Promise<User>} The updated user data
     */
    async updateUserPhoto(userId: string, photoUrl: string): Promise<User> {
        return executeWithHandling(
            async () => {
                /* Get the user reference */
                const userRef = db.collection(this._dbUsersCollection).doc(userId);

                /* Get the user document */
                const userDoc = await userRef.get();

                /* Check if the document exists */
                if (!userDoc.exists) {
                    throw new AppError(`UserNotFound`, 404, `User not found. Failed to update user photo`);
                }

                /* Update the user photo */
                await userRef.update({
                    photoUrl,
                });

                /* Update authentication photo for the user */
                await getAuth().updateUser(userId, {
                    photoURL: photoUrl,
                });

                /* Return the updated user data */
                return (await userRef.get()).data() as User;
            },
            `UpdateUserPhotoError`,
            500,
            `Failed to update user photo`
        );
    }

    /**
     * 
     * @param {string} userId The ID of the user to update 
     * @param {string} password The new password of the user
     * @returns {Promise<string>} "OK" if the password was updated
     */
    async updateUserPassword(userId: string, password: string): Promise<string> {
        return executeWithHandling(
            async () => {
                /* Update authentication password for the user */
                await getAuth().updateUser(userId, {
                    password,
                });

                return "OK";
            },
            `UpdateUserPasswordError`,
            500,
            `Failed to update user password`
        );
    }

    /**
     * 
     * @param {string} userId The ID of the user to update 
     * @param {string} role The new role for the user
     * @returns {Promise<User>} The updated user data
     */
    async updateUserRole(userId: string, role: string): Promise<User> {
        return executeWithHandling(
            async () => {
                /* Get the user reference */
                const userRef = db.collection(this._dbUsersCollection).doc(userId);

                /* Get the user document */
                const userDoc = await userRef.get();

                /* Check if the user document exists */
                if (!userDoc.exists) {
                    throw new AppError(`UserNotFound`, 404, `User not found. Failed to update user role`);
                }

                /* Update the user role */
                await userRef.update({
                    role,
                });

                /* Set claims for user by updating the user role */
                await admin.auth().setCustomUserClaims(
                    userId, {role: role}
                );

                /* Return the updated user data */
                return (await userRef.get()).data() as User;
            },
            `UpdateUserRoleError`,
            500,
            `Failed to update the user role`
        );
    }

    /**
     * 
     * @param {string} userId The ID of the user to update
     * @param {"online" | "offline"} status The new status of the user
     * @returns {Promise<User>} The updated user data
     */
    async updateUserStatus(userId: string, status: "online" | "offline"): Promise<User> {
        return executeWithHandling(
            async () => {
                /* Get the user reference */
                const userRef = db.collection(this._dbUsersCollection).doc(userId);

                /* Get the user document */
                const userDoc = await userRef.get();

                /* Check if the user document exists */
                if (!userDoc.exists) {
                    throw new AppError(`UserNotFound`, 404, `User not found. Failed to update user status`);
                }

                /* Check if the user is now online */
                if (status === "online") {
                    await userRef.update({
                        status, /* Update the status to online */
                        lastConnectedAt: Date.now(), /* Update the lastConnectedAt to the current time */
                    });
                } else {
                    /* Check if the user is now offline */
                    await userRef.update({
                        status, /* Update the status to offline */
                        lastDisconnectedAt: Date.now(), /* Update the lastDisconnectedAt to the current time */
                    });
                }

                /* Return the updated user data */
                return (await userRef.get()).data() as User;
            },
            `UpdateUserStatusError`,
            500,
            `Failed to update user status`,
        );
    }

    /**
     * 
     * @param {string} userId The ID of the user to be deleted
     * @returns {Promise<string>} "OK" if the user was deleted successfully
     */
    async deleteUser(userId: string): Promise<string> {
        return executeWithHandling(
            async () => {
                /* Get the user reference */
                const userRef = db.collection(this._dbUsersCollection).doc(userId);

                /* Get the user document */
                const userDoc = await userRef.get();

                /* Check if the user document exists */
                if (!userDoc.exists) {
                    throw new AppError(`UserNotFound`, 404, `User not found. Failed to delete user data`);
                }

                /* Delete the user */
                await userRef.delete();

                /* Delete the user from the authentication panel */
                await getAuth().deleteUser(userId);

                return "OK";
            },
            `DeleteUserError`,
            500,
            `Failed to delete user`,
        );
    }
}