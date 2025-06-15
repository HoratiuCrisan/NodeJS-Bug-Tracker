import { CustomRequest, handleResponseSuccess, measureTime, validateData } from "@bug-tracker/usermiddleware";
import { Response, NextFunction } from "express";
import { VersionService } from "../service/versionService";
import {
    getItemVersionSchema,
    getItemVersionsSchema,
    deleteItemVersionSchema,
    deleteItemSchema,
} from "../schemas/versionSchemas";

const versionService = new VersionService();

export class VersionController {
    static async getItemVersion(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            /* Validate the data based on the schema */
            const inputData = validateData(
                {
                    itemId: req.params.itemId, /* The ID of the item */
                    versionId: req.params.versionId, /* The ID of the item version */
                    type: req.params.type, /* The type of item */
                },
                getItemVersionSchema, /* The validation schema */
            );

            /* Send the data to the service layer to retrieve the data of the item version */
            const { data: itemVersion, duration } = await measureTime(async () => versionService.getItemVersion(
                inputData.itemId, 
                inputData.versionId, 
                inputData.type
            ), `Get-item-version`);

            /* Generate the log data */
            const logDetails = {
                message: `Version "${inputData.versionId}" of the item "${inputData.itemId}" of type "${inputData.type}" retrieved by ${req.user?.user_id}`,
                type: `info`,
                status: 201,
                duration,
                user: req.user!,
                data: itemVersion,
            };

            /* Return the data with the success message */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Item version retrieved successfully`,
                data: itemVersion,
                logDetails,
            });
        } catch (error) {
            next(error);
        }
    }

    static async getItemVersions(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            /* Validate the input data based on the schema */
            const inputData = validateData(
                {
                    itemId: req.params.itemId, /* The ID of the item */
                    type: req.params.type, /* The type of the item */
                    limit: Number(req.query.limit), /* The number of versions to retrieve */
                    startAfter: req.query.startAfter, /* The ID of the last item retrieved */
                },
                getItemVersionsSchema, /* Validation schema */
            );

            let lastItem = undefined;

            console.log(inputData);

            /* Check if the ID of the last item retrieved at the previous fetching request was sent */
            if (inputData.startAfter && inputData.startAfter !== "undefined") {
                /* Convert the ID to a string and store it in the variable created above */
                lastItem = String(inputData.startAfter);
            }

            /* Send the data to the service layer to retrieve the list of item versions */
            const { data: itemVersions, duration } = await measureTime(async () => versionService.getItemVersions(
                inputData.itemId,
                inputData.type,
                inputData.limit,
                lastItem,
            ), `Get-item-versions`);

            /* Generate the log data */
            const logDetails = {
                message: `"${inputData.limit}" items of type "${inputData.type}" for item ${inputData.itemId} retrieved by "${req.user?.user_id}"`,
                type: `info`,
                status: 201,
                duration,
                user: req.user!,
                data: itemVersions,
            };

            /* Return the data with the success message */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Item versions retrieved successfully`,
                data: itemVersions,
                logDetails,
            });
        } catch (error) {
            next(error);
        }
    }

    static async deleteItemVersions(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            /* Validate the data based on the schema */
            const inputData = validateData(
                {
                    itemId: req.params.itemId, /* The ID of the item */
                    type: req.params.type, /* The type of item */
                    versions: req.body.versions, /* The list of versions IDs */
                },
                deleteItemVersionSchema, /* The validation schema */
            );

            /* Send the data to the service layer to delete the versions of the item */
            const { data: deletedVersions, duration } = await measureTime(async () => versionService.deleteItemVersions(
                inputData.itemId, 
                inputData.versions, 
                inputData.type
            ), `Delete-item-versions`);

            /* Generate the log data */
            const logDetails = {
                message: `The versions "${inputData.versions}" of type "${inputData.type}" for the item "${inputData.itemId}" deleted by "${req.user?.user_id}"`,
                type: `audit`,
                status: 201,
                duration,
                user: req.user!,
                data: deletedVersions,
            };

            /* Return the data with the success message */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Item versions deleted successfully`,
                data: deletedVersions,
                logDetails,
            });
        } catch (error) {
            next(error);
        }
    }

    static async deleteItem(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            /* Validate the data based on the schema */
            const inputData = validateData(
                {
                    itemId: req.params.itemId, /* The ID of the item to delete */
                    type: req.params.type, /* The type of item */
                },
                deleteItemSchema, /* Validation schema */
            );

            /* Send the data to the service layer to delete the item */
            const { data: deletedItem, duration } = await measureTime(
                async () => (await versionService.deleteItem(inputData.itemId, inputData.type)),
                `Delete-item-type`
            );

            /* Generate log data */
            const logDetails = {
                message: `Item "${inputData.itemId}" of type "${inputData.type}" deleted by "${req.user?.user_id}"`,
                type: `audit`,
                status: 201,
                duration,
                user: req.user!,
                data: deletedItem,
            };

            /* Return the data with the success message */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Item and its versions deleted successfully`,
                data: deletedItem,
                logDetails,
            });
        } catch (error) {
            next(error);
        }
    }
}