import { User } from "./User";

export type Ticket = {
    id: string;
    authorId: string;
    handlerId: string | null;
    title: string;
    description: string;
    type: string;
    priority: string;
    status: string;
    createdAt: number;
    deadline: number;
    closedAt: number | null;
    response: string | null;
    files: {
        file: File,
        fileName: string,
    }[];
    notified: boolean;
};

export type RequestTicket = {
    ticket: Ticket,
    user: User,
}

export type TicketCard = {
    authorPhoto: string;
    id: string;
    authorId: string;
    title: string;
    status: string;
    priority: string;
    deadline: number;
};

export type TicketObject = {
    ticket: Ticket;
    author: User;
    handler: User | null;
};

export interface TicketProps {
    ticket: Ticket
}

export interface TicketFormData {
    title: string
    description: string
    priority: {
        value: string
        label: string
    }
    type: {
        value: string
        label: string
    }
    deadline: string
}

export interface TicketOptions {
    value: string
    label: string
}

export interface TicketFormProps {
    formData: TicketFormData
    formError: string | null
    onSubmit: (e: React.FormEvent) => void
    onInputChange: (
        value : React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | 
        string | 
        undefined,
        type: string
    ) => void
    priority: TicketOptions[]
    type: TicketOptions[]
}

export interface TicketsOrderProps {
    items: TicketCard[]
    options: {label: string, value: string}[]
    setItems: (tickets: TicketCard[]) => void
    setOrderValue: (value: string) => void
    orderStyle: string
    styles: any // TODO: ADD A TYPE 
    order: string
}

export interface TicketViewNumberProps {
    items: TicketCard[]
    options: {label: string, value: number}[]
    styles: any // TODO: ADD A TYPE
    viewStyle: string
    setItemsNumbers: (value: number) => void
}