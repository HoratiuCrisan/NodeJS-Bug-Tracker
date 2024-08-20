import { TicketObject } from "../../utils/interfaces/Ticket"

export const selectTickets = (tickets: TicketObject[], option: string) => {
    switch (option.toLowerCase()) {
        case "all":
            return tickets
        case "new":
            return tickets.filter(t => t.data.Status.toLowerCase() === "new")
        case "in-progress":
            return tickets.filter(t => t.data.Status.toLowerCase() === "in-progress")
        case "done":
            return tickets.filter(t => t.data.Status.toLowerCase() === "done")
        default:
            return []
    }
}