import truncate from "html-truncate";

export const stripHtml = (htmlText: string, size: number) => {
    return truncate(htmlText, size);
}