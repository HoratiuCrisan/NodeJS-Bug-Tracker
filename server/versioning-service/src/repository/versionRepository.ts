import admin from "../../config/firebase";
import { Version } from "../types/general";
import { AppError, executeWithHandling } from "@bug-tracker/usermiddleware";
import env from "dotenv";
env.config();

const db = admin.firestore();

export class VersionRepository {
    private _dbVersionsCollection: string;

    constructor() {
        /* Verify if the env data was initialized */
        if (!process.env.VERSIONS_COLLECTION) {
            throw new AppError(`InvalidEnvData`, 401, `Invalid env. data`);
        }
        this._dbVersionsCollection = process.env.VERSIONS_COLLECTION;
    }
    
    /**
     * 
     * @param {string} itemId The ID of the item 
     * @param {string} itemType The type of item
     * @param {Version} data The version data of the item
     * @returns {Promise<Version>} The created version data
     */
    async createItemVersion(itemId: string, itemType: string, data: Version): Promise<Version> {
        return executeWithHandling(
            async () => {
                /* Create the item version document */
                const versionRef = db
                    .collection(itemType)
                    .doc(itemId)
                    .collection(this._dbVersionsCollection)
                    .doc(data.id);

                /* Add the version data into the document */
                await versionRef.set({
                    ...data
                });

                /* Return the created version data */
                return (await versionRef.get()).data() as Version;
            },
            `CreateItemVersionError`,
            500,
            `Failed to create item version`
        );
    }

    /**
     * 
     * @param {string} itemId The ID of the item
     * @param {string} itemType The type of document
     * @returns {Promise<number>} The number of the last version of the item
     */
    async getLastItemVersion(itemId: string, itemType: string): Promise<number> {
        return executeWithHandling(
            async () => {
                /* Get the versions subcollection for the item */
                const versionsRef = db.collection(itemType).doc(itemId).collection(this._dbVersionsCollection);

                /* Get the last version of the item, and select the value of its version */
                let orderedVersios = await versionsRef.orderBy("timestamp", "desc").limit(1).select("version").get();

                if (orderedVersios.empty) {
                    return 0;
                }

                const doc = orderedVersios.docs[0];
                const data = doc.data();

                /* Return the value of the version */
                return data.version ?? 0;
            },
            `GetLastTicketVersionError`,
            500,
            `Failed to get the last version of the ticket`
        );
    } 

    /**
     * 
     * @param {string} itemId The ID of the item 
     * @param {string} versionId The Id of the item version
     * @param {string} itemType  The type of item
     * @returns {Promise<Version>} The data of the item version
     */
    async getItemVersion(itemId: string, versionId: string, itemType: string): Promise<Version> {
        return executeWithHandling(
            async () => {
                /* Get the reference of the item version */
                const itemVersionRef = db
                    .collection(itemType)
                    .doc(itemId)
                    .collection(this._dbVersionsCollection)
                    .doc(versionId);

                /* Get the item version document */
                const itemVersionDoc = await itemVersionRef.get();

                /* Check if the document exists */
                if (!itemVersionDoc.exists) {
                    throw new AppError(`ItemVersionNotFound`, 404, `Item version not found. Failed to retrieve item version data`);
                }

                /* Return the data of the item version */
                return itemVersionDoc.data() as Version;
            },  
            `GetItemVersionError`,
            500,
            `Failed to get item version data`,
        );
    }

    /**
     * 
     * @param {string} itemId The ID of the item to retrieve the versions for
     * @param {string} itemType The type of item
     * @param {number} limit The number of versions to retrieve for the item
     * @param {string | undefined} startAfter The ID of the last item version retrieved at the previous fetching
     * @returns {Promise<Version[]>} The list of item versions
     */
    async getItemVersions(itemId: string, itemType: string, limit: number, startAfter?: string): Promise<Version[]> {
        return executeWithHandling(
            async () => {
                console.log(itemId, itemType)
                /* Get the item versions reference */
                const itemVersionsRef = db
                    .collection(itemType)
                    .doc(itemId)
                    .collection(this._dbVersionsCollection);

                /* Order the item versions */
                let orderedItemVersions = itemVersionsRef.orderBy("timestamp", "asc");

                /* Check if the ID of the last item version was passed */
                if (startAfter) {
                    /* Get the snapshot of the last item version */
                    const lastVersionSnapshot = await itemVersionsRef.doc(startAfter).get();

                    /* If the snapshot exists, start the fetching process after that document */
                    if (lastVersionSnapshot.exists) {
                        orderedItemVersions = orderedItemVersions.startAfter(lastVersionSnapshot);
                    }
                }

                /* Limit the number of versions to retrieve at a fetching */
                orderedItemVersions = orderedItemVersions.limit(limit);

                /* Get the document lists of the item versions */
                const itemVersionsDocs = await orderedItemVersions.get();

                const itemVersions: Version[] = [];

                /* Add each item version to the list created above */
                itemVersionsDocs.forEach((doc) => {
                    itemVersions.push(doc.data() as Version);
                }); 

                /* Return the list of item versions */
                return itemVersions;
            },
            `GetItemVersionsError`,
            500,
            `Failed to get item versions`,
        );
    }

    /**
     * 
     * @param {string} itemId The ID of the item with the version to delete
     * @param {string} versionId The ID of the version of the item
     * @param {string} itemType The type of item
     * @returns {Promise<string>} "OK" if the item version was deleted
     */
    async deleteItemVersion(itemId: string, versionId: string, itemType: string): Promise<string> {
        return executeWithHandling(
            async () => {
                /* Get the item version reference */
                const itemVersionRef = db
                    .collection(itemType)
                    .doc(itemId)
                    .collection(this._dbVersionsCollection)
                    .doc(versionId);

                /* Get the item version document */
                const itemVersionDoc = await itemVersionRef.get();

                /* Check if the document exists */
                if (!itemVersionDoc.exists) {
                    throw new AppError(`ItemVersionNotFound`, 404, `Item version not found. Failed to delete item version`);
                }   

                /* Delete the version of the item */
                await itemVersionRef.delete();

                /* Return the success message */
                return "OK";
            },
            `DeleteItemVersionError`,
            500,
            `Failed to delete item version`
        );
    }

    /**
     * 
     * @param {string} itemId The ID of the item to delete 
     * @param itemType The type of item
     * @returns {Promsie<string>} "OK" if the item was deleted
     */
    async deleteItem(itemId: string, itemType: string): Promise<string> {
        return executeWithHandling(
            async () => {
                /* Get the item reference */
                const itemRef = db.collection(itemType).doc(itemId);

                /* Get the item document */
                const itemDoc = await itemRef.get();

                /* Check if the document exists */
                if (!itemDoc.exists) {  
                    throw new AppError(`ItemNotFound`, 404, `Item not found. Failed to delete item`);
                }

                /* Delete the document and its versions */
                await itemRef.delete();

                /* Return the success message */
                return "OK";
            },
            `DeleteItemError`,
            500,
            `Faield to delete item`
        );
    }
}