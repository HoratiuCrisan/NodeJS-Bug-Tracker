import { UserRepository } from "../repository/userRepository";
import { AppError } from "@bug-tracker/usermiddleware";
import { User } from "../types/User";
import { SocketService } from "./socketService";
import { eventBus } from "../utils/eventBus";

export class UserService {
    private _userRepository: UserRepository;
    private _socketService: SocketService;

    constructor() {
        this._userRepository = new UserRepository();
        this._socketService = new SocketService();
    
        eventBus.on("user-status-changed", async(userId: string, status: string) => {
            await this.updateUserStatus(userId, status);
        });
    }
    /**
     * 
     * @param {string} userId The ID of the user
     * @param {string} displayName The name of the user
     * @param {string} email The email of the user
     * @returns {Promise<User>} The user data
     */
    async createUser(
        userId: string, 
        displayName: string, 
        email: string, 
        photoUrl: string,
    ): Promise<User> {
        /* Create a new user object */
        const user: User = {
            id: userId,
            displayName,
            email,
            photoUrl,
            role: "user",
            status: "offline", /* Set the status to offline until the user connects */
            lastConnectedAt: null, /* Set the lastConnectedAt to null untill the user connects */
            lastDisconnectedAt: null /* Set the lastDisconnectedAt to null untill the user disconnects */
        };

        /* Send the user data to the service layer to create the user */
        return this._userRepository.createUser(user);
    }

    /**
     * 
     * @param {string} userId The ID of the user that sent the login request
     * @returns {Promise<User>} The retrieved user data 
     */
    async loginUser(userId: string): Promise<User> {
        /* Send the user ID to the repository layer to retrieve the data of the user */
        return this._userRepository.loginUser(userId);
    }

    /**
     * 
     * @param {string} orderBy The ordering criteria 
     * @param {string} orderDirection The fetching direction: "asc" or "desc"
     * @param {number} limit The number of users to retrieve at a fetch request
     * @param {string | undefined} startAfter The ID of the user retrieved at the last fetching
     * @returns {Promise<User[]>} The retrieved users list
     */
    getUsers(orderBy: string, orderDirection: string, limit: number, startAfter?: string): Promise<User[]> {
        /* Check if the direction is asc or desc */
        /* Throw an error otherwise */
        if (orderDirection !== "asc" && orderDirection !== "desc") {
            throw new AppError(`InvalidOrderDirection`, 415, `Invalid order direction`);
        }

        /* Send the data to the repository layer to retrieve the users list */
        return this._userRepository.getUsers(orderBy, orderDirection, limit, startAfter);
    }

    /**
     * 
     * @param {string} userId The ID of the user to retrieve
     * @returns {Promise<User>} The retrieved user data
     */
    async getUser(userId: string): Promise<User> {
        /* Send the data to the repository layer to retrieve the user data */
        return await this._userRepository.getUser(userId);
    }

    /**
     * 
     * @param {string} userIds The list of users IDs
     * @returns {Promise<User[]>} The list of users retrieved based on the IDs
     */
    async getUsersData(userIds: string[]): Promise<User[]> {
        return await this._userRepository.getUsersData(userIds);
    }

    /**
     * 
     * @param {string} userId The ID of the user to update
     * @param {string} displayName The new name of the user
     * @returns {Promise<User>} The updated user data
     */
    async updateUserDisplayName(userId: string, displayName: string): Promise<User> {
        /* Send the data to the repository layer to update the displayName */
        return this._userRepository.updateUserDisplayName(userId, displayName);
    }

    /**
     * 
     * @param {string} userId The ID of the user to update
     * @param {string} email The new email of the user
     * @returns {Promise<User>} The updated user data
     */
    async updateUserEmail(userId: string, email: string): Promise<User> {
        /* Send the data to the repository layer to update the email of the user */
        return await this._userRepository.updateUserEmail(userId, email);
    }

    /**
     * 
     * @param {string} userId The ID of the user to update
     * @param displayName The new url of the photo
     * @returns {Promise<User>} The updated user data
     */
    async updateUserPhoto(userId: string, photoUrl: string): Promise<User> {
        /* Send the data to the repository layer to update the photoUrl */
        return this._userRepository.updateUserDisplayName(userId, photoUrl);
    }

    /**
     * 
     * @param {string} userId The ID of the user to update
     * @param {string} role The new role of the user
     * @returns {Promise<User>} The updated user data
     */
    async updateUserRole(userId: string, role: string): Promise<User> {
        /* Send the data to the repository layer to update the role of the user */
        const user = await this._userRepository.updateUserRole(userId, role);

        /* Notify the user about his role change */
        this._socketService.emitToUser(userId, "role-update", {
            message: `Your role was changed to: ${role}`,
            data: user,
        });

        /* Return the updated user data */
        return user;
    }

    /**
     * 
     * @param {string} userId The ID of the user 
     * @param {string} password The new password for the user account 
     * @returns {Promise<String>} "OK" if the password was updated
     */
    async updateUserPassword(userId: string, password: string): Promise<string> {
        /* Send the data to the repository layer to update the password */
        return await this._userRepository.updateUserPassword(userId, password);
    }

    /**
     * 
     * @param {string} userId The ID of the user to update
     * @param {strin} status The new status of the user: online or offline
     * @returns {Promise<User>} The updated user data
     */
    async updateUserStatus(userId: string, status: string): Promise<User> {
        /* Check if the status is online or offline */
        /* Otherwise throw an error */
        if (status !== "online" && status !== "offline") {
            throw new AppError(`InvalidUserStatus`, 415, `Invalid user status`);
        }

        /* Send the data to the repository layer to update the satatus */
        return this._userRepository.updateUserStatus(userId, status);
    }

    /**
     * 
     * @param {string} userId The ID of the user that sent the requestS
     * @param {string} role 
     * @returns {Promise<string>} "OK" if the user was deleted
     */
    async deleteUser(uuid: string, userId: string, role: string): Promise<string> {
        /* Check if the ID of the user that sent the request is the same as the ID of the user to be deleted,
            or if the user that sent the request is an admin */
        if (uuid !== userId && role !== "admin") {
            throw new AppError(`UnauthorizedUser`, 401, `Unauthorized user. User was data was not deleted`);
        }

        /* Send the ID of the user to the repository layer to delete the user data */
        return this._userRepository.deleteUser(userId);
    }
}