import { Message } from "../types/Chat";

export const groupMessagesByDate = (messages: Message[]) => {
    const groups: Record<string, Message[]> = {};

    messages.forEach((message) => {
        const dateKey = new Date(message.timestamp).toLocaleDateString();
        if (!groups[dateKey]) groups[dateKey] = [];

        groups[dateKey].push(message);
    });

    return groups;
}

export const formatDateHeader = (dateString: string) => {
    const today = new Date();
    const targetDate = new Date(dateString);

    const isToday = today.toDateString() === targetDate.toDateString();

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const isYesterday = yesterday.toDateString() === targetDate.toDateString();

    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";

    return targetDate.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}