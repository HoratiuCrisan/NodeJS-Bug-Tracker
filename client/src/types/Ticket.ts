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

export type TicketCardType = {
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

export type TicketFormDataType = {
    title: string;
    description: string;
    priority: { value: string, label: string };
    type: { value: string, label: string };
    deadline: number;
}

export interface TicketOptions {
    value: string
    label: string
}

export type TicketFormType = {
    formData: TicketFormDataType;
    formError: string | null;
    onSubmit: (e: React.FormEvent) => void;
    onInputChange: (
        value: string | number | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | undefined,
        field: keyof TicketFormDataType
    ) => void;
    priority: TicketOptions[];
    type: TicketOptions[];
}

export interface TicketFormProps {
    formData: TicketFormDataType
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
    items: TicketCardType[]
    options: {label: string, value: string}[]
    setItems: (tickets: TicketCardType[]) => void
    setOrderValue: (value: string) => void
    orderStyle: string
    styles: any // TODO: ADD A TYPE 
    order: string
}

export interface TicketViewNumberProps {
    items: TicketCardType[]
    options: {label: string, value: number}[]
    styles: any // TODO: ADD A TYPE
    viewStyle: string
    setItemsNumbers: (value: number) => void
}