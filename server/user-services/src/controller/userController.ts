import { Response, NextFunction } from "express";
import { CustomRequest, validateData, measureTime, handleResponseSuccess, NotificationDetails } from "@bug-tracker/usermiddleware";
import { UserService } from "../service/userService";
import {
    createUserSchema,
    loginUserSchema,
    getUsersSchema,
    getUsersDataSchema,
    getUserSchema,
    getNonUsersSchema,
    updateDisplayNameSchema,
    updateEmailSchema,
    updatePhotoUrlSchema,
    updatePasswordSchema,
    updateUserRoleSchema,
    deleteUserSchema,
    updateUserStatusSchema,
} from "../schemas/userSchemas";

const userService = new UserService();

export class UserController {
    /* POST requests */
    public static async createUser(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const inputData = validateData(
                {
                    userId: req.body.userId, /* The ID of the new user */
                    displayName: req.body.displayName, /* The username of the user */
                    email: req.body.email, 
                    photoUrl: req.body.photoUrl,
                },
                createUserSchema, /* Validate the data based on the schema */
            );
            
            /* Send the data to the service layer to create the user */
            const { data: user, duration } = await measureTime(async () => userService.createUser(
                inputData.userId,
                inputData.displayName,
                inputData.email,
                inputData.photoUrl,
            ), `Create-user`);

            /* Generate log data */
            const logDetails = {
                message: `User "${inputData.displayName}" registered successfully`,
                type: `info`,
                status: 201,
                duration,
                user: req.user!,
                data: user,
            };
            
            /* Return the success message with the user data */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `User created successfully`,
                data: user,
                logDetails,
            });
        } catch (error) {
            next(error);
        }
    }

    public static async loginUser(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const inputData = validateData(
                {
                    userId: req.user?.user_id, /* The ID of the user that sent the login request */
                },
                loginUserSchema, /* Validate the ID based on the schema */
            );

            /* Send the ID to the service layer to login the uesr */
            const { data: user, duration } = await measureTime(
                async () =>  userService.loginUser(inputData.userId!),
                `User-login`
            );

            /* Generate log data */
            const logDetails = {
                message: `User "${inputData.userId}" logged in`,
                type: `info`,
                status: 201,
                duration,
                user: req.user!,
                data: user,
            };

            /* Return the success message with the user data */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `User logged in successfully`,
                data: user,
                logDetails,
            });
        } catch (error) {
            next(error);
        }
    }

    /* GET requests */

    public static async getUsers(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const inputData = validateData(
                {
                    orderBy: String(req.query.orderBy), /* Cast the order criteria to string */
                    orderDirection: String(req.query.orderDirection), /* Cast the order direction to string */
                    limit: Number(req.query.limit), /* Cast the fetching limit to number */
                    startAfter: String(req.query.startAfter), /* Cast the starting offset to string */
                },
                getUsersSchema, /* Validate the data based on the schema */
            );

            /* Send the data to the service layer to retrieve the users list */
            const { data: users, duration } = await measureTime(async () => userService.getUsers(
                inputData.orderBy,
                inputData.orderDirection,
                inputData.limit,
                inputData.startAfter,
            ), `Get-users`);

            /* Generate log data */
            const logDetails = {
                message: `User "${req.user?.user_id}" retrieved users data`,
                type: `info`,
                status: 201,
                duration,
                user: req.user!,
                data: users,
            };

            /* Return the success message with the users list */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Users retreived successfully`,
                data: users,
                logDetails,
            });
        } catch (error) {
            next(error);
        }
    }

    public static async getNonUsers(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const inputData = validateData(
                {
                    userId: req.user?.user_id
                },
                getNonUsersSchema,
            );

            const {data: users, duration } = await measureTime(
                async () => userService.getNonUsers(),
                "Get-Non-Users"
            );

            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Users retrieved successfully`,
                data: users
            });
        } catch (error) {
            next(error);
        }
    }

    public static async getUsersData(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const inputData = validateData(
                {
                    userId: req.user?.user_id,
                    userIds: userService.parseIds((req.query['userIds[]']) as unknown),
                },
                getUsersDataSchema
            );

            console.log(inputData);

            /* Send the request to the service layer to retrieve the users data */
            const {data: users, duration } = await measureTime(
                async () => userService.getUsersData(inputData.userIds), 
                "Get-Users-Data"
            );

            /* Generate log data */
            const logDetails = {
                message: `User "${req.user?.user_id}" retrieved users data`,
                type: `info`,
                status: 201,
                duration,
                user: req.user!,
                data: users,
            };

            /* Return the success message with the users list */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Users retreived successfully`,
                data: users,
                logDetails,
            });
        } catch (error) {
            next(error);
        }
    }

    public static async getUser(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const inputData = validateData(
                {
                    userId: req.params.userId, /* The ID of the user to be fetched */
                },
                getUserSchema, /* Validate the data based on the schema */
            );

            /* Send the ID of the user to retrieve the user data */
            const { data: user, duration } = await measureTime(
                async () => userService.getUser(inputData.userId),
                `Get-user-data`
            );

            /* Generate log data */
            const logDetails = {
                message: `User "${req.user?.user_id} retrieved user "${inputData.userId}'s" data`,
                type: `info`,
                status: 201,
                duration,
                user: req.user!,
                data: user,
            };

            /* Return the success message with the user data */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `User data retreived successfully`,
                data: user,
                logDetails,
            });

            return;
        } catch (error) {
            next(error);
        }
    }

    /* PUT requests */

    public static async updateDisplayName(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const inputData = validateData(
                {
                    userId: req.user?.user_id, /* The ID of the user that sent the request */
                    displayName: req.body.displayName, /* The new display name of the user */
                },
                updateDisplayNameSchema, /* Validate the data based on the schema */
            );

            /* Send the data to the service layer to update the display name of the user */
            const { data: user, duration } = await measureTime(
                async () => userService.updateUserDisplayName(inputData.userId!, inputData.displayName),
                `Update-user-name`
            );

            /* Generate log data */
            const logDetails = {
                message: `User "${inputData.userId}" updated the display name`,
                type: `audit`,
                status: 201,
                duration,
                user: req.user!,
                data: user,
            };

            /* Return the success message with the updated user data */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Display name updated successfully`,
                data: user,
                logDetails,
            });
        } catch (error) {
            next(error);
        }
    }

    public static async updateEmail(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const inputData = validateData(
                {
                    userId: req.user?.user_id, /* The ID of the user that sent the request */
                    email: req.body.email, /* The new email of the user */
                },
                updateEmailSchema, /* Validate the data based on the schema */
            );

            /* Send the data to the service layer to update the email of the user */
            const { data: user, duration } = await measureTime(
                async () => userService.updateUserEmail(inputData.userId!, inputData.email),
                `Update-user-email`
            );

            /* Generate log data */
            const logDetails = {
                message: `User "${inputData.userId}" updated the email address`,
                type: `audit`,
                status: 201,
                duration,
                user: req.user!,
                data: user,
            };

            /* Return the success message with the updated user data */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Email address updated successfully`,
                data: user,
                logDetails,
            });
        } catch (error) {
            next(error);
        }
    }

    public static async updatePhotoUrl(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const inputData = validateData(
                {
                    userId: req.user?.user_id, /* The ID of the user that sent the request */
                    photoUrl: req.body.photoUrl, /* The new photo of the user */
                },
                updatePhotoUrlSchema, /* Validate the data based on the schema */
            );

            /* Send the data to the service layer to update the photo of the user */
            const { data: user, duration } = await measureTime(
                async () => userService.updateUserPhoto(inputData.userId!, inputData.photoUrl),
                `Update-user-photo`
            );

            /* Generate log data */
            const logDetails = {
                message: `User "${inputData.userId}" updated profile photo`,
                type: `audit`,
                status: 201,
                duration,
                user: req.user!,
                data: user,
            };

            /* Return the success message with the updated user data */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Photo updated successfully`,
                data: user,
                logDetails,
            });
        } catch (error) {
            next(error);
        }
    }

    public static async updatePassword(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const inputData = validateData(
                {
                    userId: req.user?.user_id, /* The ID of the user that sent the request */
                    password: req.body.password, /* The new password of the user */
                },
                updatePasswordSchema, /* Validate the data based on the schema */
            );

            /* Send the data to the service layer to update the password of the user */
            const { data: user, duration } = await measureTime(
                async () =>  userService.updateUserPassword(inputData.userId!, inputData.password),
                `User-password-update`
            );

            /* Generate log data */
            const logDetails = {
                message: `User "${inputData.userId}" updated the account password`,
                type: `audit`,
                status: 201,
                duration,
                user: req.user!,
                data: null,
            };

            /* Return the success message with the updated user data */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Password updated successfully`,
                data: user,
                logDetails,
            });
        } catch (error) {
            next(error);
        }
    }

    public static async updateRole(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const inputData = validateData(
                {
                    userId: req.params.userId, /* The ID of the user that sent the request */
                    role: req.body.role, /* The new role of the user */
                    userEmail: req.body.userEmail,
                },
                updateUserRoleSchema, /* Validate the data based on the schema */
            );

            /* Send the data to the service layer to update the role of the user */
            const { data: user, duration } = await measureTime(
                async () => userService.updateUserRole(inputData.userId!, inputData.role),
                `Update-user-role`
            );

            /* Generate log data */
            const logDetails = {
                message: `User "${req.user?.user_id}" updated "${inputData.userId}" to "${inputData.role}"`,
                type: `audit`,
                status: 201,
                duration,
                user: req.user!,
                data: user,
            };

            /* Generate notification data for the updated user */
            const notificationDetails: NotificationDetails = {
                users: [
                    {
                        id: inputData.userId,
                        email: inputData.userEmail,
                        message: `Your role was updated to "${inputData.role}"`,
                    }
                ],
                type: `email`,
                channel: "messages",
                data: null,
            };

            /* Return the success message with the updated user data */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `User role updated successfully`,
                data: user,
                logDetails,
                notificationDetails,
            });
        } catch (error) {
            next(error);
        }
    }

    public static async updateUserStatus(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const inputData = validateData(
                {
                    userId: req.user?.user_id,
                    status: req.body.status,
                },
                updateUserStatusSchema,
            );

            const { data: user, duration } = await measureTime(
                async () => userService.updateUserStatus(inputData.userId!, inputData.status),
                "Update-user-status"
            );
            
            const logDetails = {
                message: `User "${req.user?.user_id}" is now ${inputData.status}`,
                type: `audit`,
                status: 201,
                duration,
                user: req.user!,
                data: user,
            };

            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `Updated user status successfully`,
                data: user,
                logDetails,
            });
        } catch (error) {
            next(error);
        }
    }

    /* DELETE requests */

    public static async deleteUser(req: CustomRequest, res: Response, next: NextFunction) {
        try {
            const inputData = validateData(
                {
                    uuid: req.user?.user_id, /* The ID of the user that sent the request */
                    role: req.user?.role, /* The role of the user that sent the request */
                    userId: req.params.userId, /* The ID of the user to delete */
                },
                deleteUserSchema, /* Validate the data based on the schema */
            );

            /* Send the data to the service layer to delete the user */
            const { data: user, duration } = await measureTime(
                async () => userService.deleteUser(inputData.uuid!, inputData.userId, inputData.role!),
                `Delete-user`
            );

            /* Generate log details */
            const logDetails = {
                message: `User "${inputData.uuid}" removed user "${inputData.userId}"`,
                type: `audit`,
                status: 201,
                duration,
                user: req.user!,
                data: user,
            };

            /* Return the success message */
            await handleResponseSuccess({
                req,
                res,
                httpCode: 201,
                message: `User deleted successfully`,
                data: user,
                logDetails,
            });
        } catch (error) {
            next(error);
        }
    }
}