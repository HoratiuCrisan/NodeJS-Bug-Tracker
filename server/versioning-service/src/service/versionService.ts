import { Ticket, Task, Subtask, Version } from "../types/general";
import { v4 } from "uuid";
import { VersionRepository } from "../repository/versionRepository";
import { AppError } from "@bug-tracker/usermiddleware";
import env from "dotenv";
env.config();

export class VersionService {
    private _versionRepository: VersionRepository;
    private _itemTypes: Record<string, string>;

    constructor() {
        /* Verify if the env data was initialized */
        if (!process.env.TICKETS_VERSIONS || !process.env.TASKS_VERSIONS || !process.env.SUBTASK_VERSIONS) {
            throw new AppError(`InvalidEnvData`, 400, `Invalid env. data`);
        }

        this._versionRepository = new VersionRepository();
        this._itemTypes = {
            "ticket": process.env.TICKETS_VERSIONS,
            "task": process.env.TASKS_VERSIONS,
            "subtask": process.env.SUBTASK_VERSIONS,
        };
    } 

    /**
     * 
     * @param {string} type The type of item received
     * @param {Ticket | Task | Subtask} data The data of the item
     * @returns {Promise<Version>} The version of the item
     */
    async createItemVersion(type: string, data: Ticket | Task | Subtask): Promise<Version> {
        /* Check if the received type is part of the record */
        const itemType = this.checkItemType(type);
        
        /* Get the number value of the previous version of the item */
        const versionNumber = await this._versionRepository.getLasItemVersion(data.id, itemType);

        /* Create the version item object */
        const versionData = this.createItemVersionObject(data, versionNumber);

        /* Send the version object to the repository layer to add the version to the item */
        return await this._versionRepository.createItemVersion(data.id, itemType, versionData);
    }

    /**
     * 
     * @param {string} itemId The ID of the item 
     * @param {string} versionId The Id of the item version
     * @param {string} type  The type of item
     * @returns {Promise<Version>} The data of the item version
     */
    async getItemVersion(itemId: string, versionId: string, type: string): Promise<Version> {
        /* Get the collection type based on the item type received */
        const itemType = this.checkItemType(type)

        /* Send the data to the repository layer to get the version of the item */
        return this._versionRepository.getItemVersion(itemId, versionId, itemType);
    }

    /**
    * 
    * @param {string} itemId The ID of the item to retrieve the versions for
    * @param {string} type The type of item
    * @param {number} limit The number of versions to retrieve for the item
    * @param {string | undefined} startAfter The ID of the last item version retrieved at the previous fetching
    * @returns {Promise<Version[]>} The list of item versions
    */
    async getItemVersions(itemId: string, type: string, limit: number, startAfter?: string): Promise<Version[]> {
        /* Get the collection type based on the item type received */
        const itemType = this.checkItemType(type);

        /* Send the data to the version repository to retrieve the list of versions for the item */
        return await this._versionRepository.getItemVersions(itemId, itemType, limit, startAfter);
    }

    /**
     * 
     * @param {string} itemId The ID of the item of which versions to delete 
     * @param {string} versions The list of IDs of the versions to delete
     * @param {string} type The type of item
     * @returns {Promise<string>} "OK" if the versions were deleted
     */
    async deleteItemVersions(itemId: string, versions: string[], type: string): Promise<string> {
        /* Get the collection type based on the item type received */
        const itemType = this.checkItemType(type);

        /* Map over each version ID and send the data to the repository layer to delete the version */
        versions.forEach(async (versionId: string) => {
            await this._versionRepository.deleteItemVersion(itemId, versionId, itemType);
        });

        /* Return the success message */
        return "OK";
    }

    /**
     * 
     * @param {string} itemId The ID of the item to be deleted with its versions
     * @param {string} type The type of item
     * @returns {Promise<string>} "OK" if the item and its versions were deleted
     */
    async deleteItem(itemId: string, type: string): Promise<string> {
        /* Get the collection type based on the item type received */
        const itemType = this.checkItemType(type);

        /* Send the data to the repository layer to delete the item and its data */
        return await this._versionRepository.deleteItem(itemId, itemType);
    }
    
    /**
     * 
     * @param {Ticket | Task | Subtask} data The data of the version 
     * @param {number} version The number of the last version
     * @returns {Version} The version object
     */
    private createItemVersionObject(data: Ticket | Task | Subtask, version: number): Version {
        return {
            id: v4(), /* Generate and ID for the version */
            timestamp: Date.now(), 
            version: version + 1, /* Increment the version number of the item */
            deleted: false,
            data, /* Add the data of the item version */
        };
    }

    /**
     * 
     * @param {string} type The type of the item 
     * @returns {string} The collection name for the item type
     */
    private checkItemType(type: string): string {
        /* Check if the type of the item is present in the item types record */
        if (!(type in this._itemTypes)) {
            throw new AppError(`InvalidItemTypeError`, 405, `Unsupported item type`);
        }

        /* Return the collection name from the item types record for the item type */
        return this._itemTypes[type];
    }
}