import { plainToClass } from 'class-transformer';
import { PaginationMeta } from 'src/classes/pagination-meta';
import {
    FindOptionsOrder,
    FindOptionsWhere,
    ObjectLiteral,
    Repository,
} from 'typeorm';

export interface PaginationResult<T> {
    result: T[];
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        q?: string;
    };
}

export async function paginate<
    T extends ObjectLiteral,
    DTO extends ObjectLiteral,
>(
    repository: Repository<T>,
    where: FindOptionsWhere<T> | FindOptionsWhere<T>[],
    query: PaginationMeta,
    dtoClass: new () => DTO, // Thêm tham số để chỉ định DTO class
    options?: { order?: FindOptionsOrder<T>; relations?: any },
): Promise<PaginationResult<DTO>> {
    const currentPage = query.page || 1;
    const currentLimit = query.limit || 10;
    const skip = (currentPage - 1) * currentLimit;

    const [items, total] = await repository.findAndCount({
        where,
        skip,
        take: currentLimit,
        ...options,
    });

    // Ánh xạ mảng Entity sang mảng DTO
    const dtoItems = plainToClass(dtoClass, items, {
        excludeExtraneousValues: true,
        enableImplicitConversion: true,
    });

    return {
        result: dtoItems,
        meta: {
            page: currentPage,
            limit: currentLimit,
            total,
            totalPages: Math.ceil(total / currentLimit),
            q: query.q || '',
        },
    };
}
