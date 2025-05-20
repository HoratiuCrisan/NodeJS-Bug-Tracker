import { User } from "../types/User";

type Role = "user" | "developer" | "project-manager" | "admin";
type Action = 
    | "viewUsers"
    | "updateTicketStatus"
    | "editTicket"
    | "deleteTicket"
    | "updateUserRole";

type PolicyContext = {
    user: User;
    resource?: any;
};

type Policy = (ctx: PolicyContext) => boolean;

export const policies: Record<Action, Policy> = {
    viewUsers: ({user}) => 
        ["developer", "project-manager", "admin"].includes(user.role),

    updateUserRole: ({user}) =>
        user.role === "admin",

    updateTicketStatus: ({user, resource}) =>
        !!resource && !!resource.handlerId && resource.handlerId === user.id,

    editTicket: ({user, resource}) =>
        !!resource && resource.authorId === user.id,

    deleteTicket: ({user, resource}) =>
        !!resource && (resource.authorId === user.id || user.role === "admin")
}