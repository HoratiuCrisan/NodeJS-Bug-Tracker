export type Ticket = {
    Author: string
    AuthorPicture: string
    Deadline: string
    Handler: string
    HandlerId: string
    Priority: string
    Status: string
    Title: string
    Type: string
    Description: string
    CreatedAt: string
    ClosedAt: string | null
    Response: string
    Files: {
        File: File,
        FileName: string
    }[],
    Notified: boolean
}

export type TicketObject = {
    id: string
    data: Ticket
}

export type LockTicketData = {
    lockedBy: string,
    lockedAt: Date,
};
