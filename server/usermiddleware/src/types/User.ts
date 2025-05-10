export type FirebaseUser = {
    name: string;
    picture: string;
    role: string;
    iss: string;
    aud: string;
    auth_time: number;
    user_id: string;
    sub: string;
    iat: number;
    exp: number;
    email: string;
    email_verified: boolean;
    firebase: unknown;
}

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

export type VersionDetails = {
    id: string;
    type: string;
    data: unknown;
}