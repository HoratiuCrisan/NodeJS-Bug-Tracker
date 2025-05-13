export type LogMessage = {
    id: string;
    type: string;
    timestamp: number;
    message: string;
    requestDetails: {
        method: string;
        endpoint: string;
        status: number;
        duration: number;
    }
    user: LogUser;
    data: unknown;
}

export type LogUser = {
    id: string;
    email: string;
    displayName: string;
    role: string;
}