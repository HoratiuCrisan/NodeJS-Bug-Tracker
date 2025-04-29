export type User = {
    id: string;
    displayName: string;
    email: string;
    photoUrl: string;
    role: string;
    status: "online" | "offline";
    lastConnectedAt: number | null;
    lastDisconnectedAt: number | null;
};