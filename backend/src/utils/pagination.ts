function getPagination(query) {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 20), 1), 100);
  return {
    page,
    limit,
    offset: (page - 1) * limit
  };
}

function paginated(data, total, page, limit) {
  return {
    data,
    meta: {
      total: Number(total),
      page,
      limit,
      pages: Math.ceil(Number(total) / limit)
    }
  };
}

module.exports = { getPagination, paginated };

export {};
