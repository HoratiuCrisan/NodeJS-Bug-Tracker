import { User } from "../types/User";

type Role = "user" | "developer" | "project-manager" | "admin";
type Action = 
    | "viewConsole"
    | "viewAdmin"
    | "viewUsers"
    | "updateTicketStatus"
    | "assignTicket"
    | "editTicket"
    | "deleteTicket"
    | "updateTicketHandler"
    | "updateUserRole"
    | "createSubtask"
    | "updateSubtaskDescription"
    | "updateSubtaskHandler"
    | "updateSubtaskStatus"
    | "updateGroup";

type PolicyContext = {
    user: User;
    resource?: any;
};

type Policy = (ctx: PolicyContext) => boolean;

export const policies: Record<Action, Policy> = {
    viewConsole: ({user}) => 
        user.role === "admin",

    viewAdmin: ({user}) => 
        user.role === "admin",

    viewUsers: ({user}) => 
        ["developer", "project-manager", "admin"].includes(user.role),

    updateUserRole: ({user}) =>
        user.role === "admin",

    updateTicketStatus: ({user, resource}) =>
        !!resource && !!resource.handlerId && resource.handlerId === user.id,

    assignTicket: ({user}) => 
        user.role === "admin",

    editTicket: ({user, resource}) =>
        !!resource && resource.authorId === user.id || user.role === "admin",

    updateTicketHandler: ({user}) =>
        user.role === "admin",

    deleteTicket: ({user, resource}) =>
        !!resource && (resource.authorId === user.id || user.role === "admin"),

    createSubtask: ({user, resource}) =>
        !!resource && (resource === user.id || user.role === "admin"),

    updateSubtaskDescription: ({user, resource}) =>
        !!resource && (resource.authorId === user.id || user.role === "admin"),
    
    updateSubtaskHandler: ({user, resource}) =>
        !!resource && (resource.authorId === user.id || user.role === "admin"),

    updateSubtaskStatus: ({user, resource}) =>
        !!resource && resource.handlerId === user.id,

    updateGroup: ({user, resource}) =>
        !!resource && resource.admin === user.id,
}