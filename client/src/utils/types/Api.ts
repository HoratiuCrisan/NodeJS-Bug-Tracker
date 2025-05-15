export type ApiSuccess<T> = {
    success: true;
    data: T;
    message: string;
};

export type ApiError = {
    success: false;
    name: string;
    message: string;
}