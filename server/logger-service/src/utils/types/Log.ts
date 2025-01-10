export type LogMessage = {
    type: string,
    message: string,
    actor: {
        uid: string,
        username: string,
        role: string,
    },
    details: {
        method: string,
        endpoint: string,
        status: number,
    },
    timestamp: string,
    duration: string,
    data?: {
        createdData?: {
            id: string,
        },
        previousData?: {
            id: string,
        },
        updatedData?: {
            id: string,
        }
    }
}

export type SystemMessage = {
    type: string,
    message: string,
    timestamp: string,
}