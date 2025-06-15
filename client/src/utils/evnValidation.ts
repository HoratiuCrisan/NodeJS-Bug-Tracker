import zod from "zod";

const envSchema = zod.object({
    REACT_APP_TICKETS_END_POINT: zod.string().nonempty(),
    REACT_APP_USERS_END_POINT: zod.string().nonempty(),
    REACT_APP_LOGS_END_POINT: zod.string().nonempty(),
    REACT_APP_NOTIFICATIONS_END_POINT: zod.string().nonempty(),
    REACT_APP_VERSIONS_END_POINT: zod.string().nonempty(),
    REACT_APP_TASKS_END_POINT: zod.string().nonempty(),
    REACT_APP_PROJECTS_END_POINT: zod.string().nonempty(),
    REACT_APP_CONVERSATIONS_END_POINT: zod.string().nonempty(),
    REACT_APP_GROUPS_END_POINT: zod.string().nonempty(),
    REACT_APP_CLIENT_END_POINT: zod.string().nonempty(),
});

export const env = envSchema.parse(process.env);