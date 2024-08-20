export interface Ticket {
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
    Response: string
    Files: {
        File: File,
        FileName: string
    }[]
}

export interface TicketObject {
    id: string
    data: Ticket
}

