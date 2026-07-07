export interface ApiSuccessResponse<T> {
    success: true;
    statusCode: number;
    message: string;
    data: T;
    timestamp: string;
}
export interface ApiErrorResponse {
    success: false;
    statusCode: number;
    message: string;
    error: string;
    path: string;
    timestamp: string;
}
