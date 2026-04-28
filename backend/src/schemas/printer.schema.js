const { z } = require("zod");

const printerCapabilitiesSchema = z.object({
  color: z.boolean().optional(),
  bw: z.boolean().optional(),
  duplex: z.boolean().optional()
});

const createPrinterSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    location: z.string().min(2).max(120),
    model: z.string().min(2).max(100),
    capabilities: printerCapabilitiesSchema,
    pricePerPage: z.coerce.number().nonnegative(),
    priceColor: z.coerce.number().nonnegative().nullable().optional(),
    status: z.enum(["ONLINE", "OFFLINE", "MAINTENANCE"]).optional()
  })
});

const listPrintersSchema = z.object({
  query: z.object({
    cursor: z.string().uuid().optional(),
    limit: z.coerce.number().int().min(1).max(50).optional(),
    model: z.string().optional(),
    location: z.string().optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional()
  })
});

const updateStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    status: z.enum(["ONLINE", "OFFLINE", "MAINTENANCE"])
  })
});

const updatePrinterSchema = z.object({
  params: z.object({
    id: z.string().uuid()
  }),
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    location: z.string().min(2).max(120).optional(),
    model: z.string().min(2).max(100).optional(),
    capabilities: printerCapabilitiesSchema.optional(),
    pricePerPage: z.coerce.number().nonnegative().optional(),
    priceColor: z.coerce.number().nonnegative().nullable().optional(),
    status: z.enum(["ONLINE", "OFFLINE", "MAINTENANCE"]).optional()
  })
});

module.exports = {
  createPrinterSchema,
  listPrintersSchema,
  updateStatusSchema,
  updatePrinterSchema
};
