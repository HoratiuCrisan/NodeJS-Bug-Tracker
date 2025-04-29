import { TicketCard } from "../../utils/types/Ticket"

export const selectTickets = (tickets: TicketCard[], option: string) => {
    switch (option.toLowerCase()) {
        case "all":
            return tickets
        case "new":
            return tickets.filter(t => t.status.toLowerCase() === "new")
        case "in-progress":
            return tickets.filter(t => t.status.toLowerCase() === "in-progress")
        case "done":
            return tickets.filter(t => t.status.toLowerCase() === "done")
        default:
            return []
    }
}