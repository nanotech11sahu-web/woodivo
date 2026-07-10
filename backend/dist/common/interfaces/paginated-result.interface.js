"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPaginationMeta = buildPaginationMeta;
function buildPaginationMeta(total, page, limit) {
    const totalPages = Math.max(Math.ceil(total / limit), 1);
    return {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
    };
}
//# sourceMappingURL=paginated-result.interface.js.map