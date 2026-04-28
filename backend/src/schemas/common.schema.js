const { z } = require("zod");

const cursorPaginationSchema = z.object({
  query: z.object({
    cursor: z.string().uuid().optional(),
    limit: z.coerce.number().int().min(1).max(100).optional()
  })
});

module.exports = {
  cursorPaginationSchema
};
