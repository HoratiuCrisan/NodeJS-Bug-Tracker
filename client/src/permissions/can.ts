import { User } from "../types/User";
import { policies } from "./policies";

export const can = (
    user: User,
    action: keyof typeof policies,
    resource?: unknown
): boolean => {
    const policy = policies[action];

    if (!policy) return false;

    return policy({user, resource});
}