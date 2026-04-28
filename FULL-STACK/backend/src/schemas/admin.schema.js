const { z } = require("zod");

const patchCreditsSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    amount: z.number().finite().refine((value) => value !== 0, {
      message: "Amount must be non-zero"
    })
  })
});

const deletePrinterSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  })
});

const patchUserRoleSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    role: z.enum(["STUDENT", "PRINTER_OWNER", "ADMIN"])
  })
});

const patchPrinterStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    status: z.enum(["ONLINE", "OFFLINE", "MAINTENANCE"])
  })
});

module.exports = {
  patchCreditsSchema,
  deletePrinterSchema,
  patchUserRoleSchema,
  patchPrinterStatusSchema
};
