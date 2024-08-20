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

export interface TicketProps {
    ticket: TicketObject
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
    items: TicketObject[]
    options: {label: string, value: string}[]
    setItems: (tickets: TicketObject[]) => void
    setOrderValue: (value: string) => void
    orderStyle: string
    styles: any // TODO: ADD A TYPE 
    order: string
}

export interface TicketViewNumberProps {
    items: TicketObject[]
    options: {label: string, value: number}[]
    styles: any // TODO: ADD A TYPE
    viewStyle: string
    setItemsNumbers: (value: number) => void
}