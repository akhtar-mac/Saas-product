import { Request } from 'express';

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export function getPagination(req: Request, defaultLimit = 20, maxLimit = 100): PaginationParams {
  const pageRaw = parseInt(String(req.query.page || '1'), 10);
  const limitRaw = parseInt(String(req.query.limit || defaultLimit), 10);

  const page = isNaN(pageRaw) || pageRaw < 1 ? 1 : pageRaw;
  const limit = isNaN(limitRaw) || limitRaw < 1 ? defaultLimit : Math.min(limitRaw, maxLimit);
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip,
    take: limit,
  };
}

export function formatPaginatedResponse<T>(
  items: T[],
  total: number,
  pagination: PaginationParams
) {
  const totalPages = Math.ceil(total / pagination.limit) || 1;
  return {
    items,
    meta: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages,
      hasNextPage: pagination.page < totalPages,
      hasPrevPage: pagination.page > 1,
    },
  };
}

export default {
  getPagination,
  formatPaginatedResponse,
};
