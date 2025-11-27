/**
 * PHASE 4: Pagination - Implementation Completed
 * 
 * This file documents the pagination implemented in critical endpoints.
 * 
 * ENDPOINTS WITH PAGINATION:
 * 
 * 1. GET /api/admin/users
 *    Query params: ?page=1&limit=10
 *    Response includes: { users[], pagination { page, limit, total, pages, hasNextPage, hasPrevPage } }
 *    Max limit: 100
 * 
 * 2. GET /api/admin/blog
 *    Query params: ?page=1&limit=10
 *    Response includes: { posts[], pagination { page, limit, total, pages, hasNextPage, hasPrevPage } }
 *    Max limit: 100
 * 
 * 3. GET /api/admin/purchases
 *    Query params: ?page=1&limit=20
 *    Response includes: { purchases[], pagination { page, limit, total, pages, hasNextPage, hasPrevPage } }
 *    Max limit: 100
 * 
 * 4. GET /api/blog (public)
 *    Query params: ?page=1&limit=10
 *    Response includes: { posts[], pagination { page, limit, total, pages, hasNextPage, hasPrevPage } }
 *    Max limit: 50 (public endpoint - more restrictive)
 * 
 * FEATURES:
 * - ✅ Parameter validation (page >= 1, limit between 1 and max)
 * - ✅ Total count calculations
 * - ✅ Navigation information (hasNextPage, hasPrevPage)
 * - ✅ Consistent responses
 * - ✅ Well-typed errors (ValidationError)
 * 
 * USAGE EXAMPLE:
 * 
 * // Get page 1 with 10 items
 * const response = await fetch('/api/admin/users?page=1&limit=10', {
 *   headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
 * });
 * 
 * const data = await response.json();
 * console.log(data.users);           // User array
 * console.log(data.pagination.total); // Total users in DB
 * console.log(data.pagination.pages); // Number of pages
 * 
 * // Client can iterate using hasNextPage
 * if (data.pagination.hasNextPage) {
 *   const nextPage = await fetch(`/api/admin/users?page=${page + 1}&limit=10`);
 * }
 */

export const PAGINATION_CONFIG = {
  defaults: {
    page: 1,
    limit: 10,
  },
  limits: {
    admin: 100,    // Admin endpoints - max 100
    public: 50,    // Public endpoints - max 50
  },
  endpoints: {
    users: { default: 10, max: 100 },
    blog: { default: 10, max: 100 },
    blog_public: { default: 10, max: 50 },
    purchases: { default: 20, max: 100 },
  },
};

/**
 * Helper function to build pagination URLs
 */
export function buildPaginationUrl(baseUrl: string, page: number, limit: number): string {
  const url = new URL(baseUrl);
  url.searchParams.set('page', String(page));
  url.searchParams.set('limit', String(limit));
  return url.toString();
}

/**
 * Interface for paginated responses
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
