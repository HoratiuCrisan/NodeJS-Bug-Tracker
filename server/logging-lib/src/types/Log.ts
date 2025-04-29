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
    user: {
        id: string;
        email: string;
        displayName: string;
        role: string;
    },
    data: unknown;
}