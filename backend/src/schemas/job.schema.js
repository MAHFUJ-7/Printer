const { z } = require("zod");

const submitJobSchema = z.object({
  body: z.object({
    printerId: z.string().uuid(),
    fileUrl: z.string().min(4),
    pageCount: z.coerce.number().int().positive(),
    isColor: z.boolean().optional()
  })
});

const updateJobStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"])
  })
});

module.exports = {
  submitJobSchema,
  updateJobStatusSchema
};
