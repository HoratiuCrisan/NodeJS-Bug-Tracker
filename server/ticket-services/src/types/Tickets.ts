export type Ticket = {
    id: string;
    authorId: string;
    handlerId: string | null; 
    title: string;
    description: string;
    priority: string;
    status: string;
    type: string;
    response: string | null;
    createdAt: number;
    closedAt: number | null;
    deadline: number;
    files: {
        file: File;
        fileName: string;
    }[];
    notified: boolean;
};

export type LockTicketData = {
    lockedBy: string,
    lockedAt: Date,
};

export type TicketCard = {
    user: {
        displayName: string,
        photoUrl: string,
    };
    ticket: Ticket;
}
