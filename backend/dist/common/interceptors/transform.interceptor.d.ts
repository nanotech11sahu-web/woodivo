import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import type { ApiSuccessResponse } from './response.interface';
export declare class TransformInterceptor<T> implements NestInterceptor<T, ApiSuccessResponse<T>> {
    intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiSuccessResponse<T>>;
}
