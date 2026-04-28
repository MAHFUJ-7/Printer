const { z } = require("zod");

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    username: z.string().min(3).max(50),
    password: z.string().min(8),
    firstName: z.string().trim().min(1).max(60).optional(),
    lastName: z.string().trim().min(1).max(60).optional(),
    role: z.enum(["STUDENT", "PRINTER_OWNER"]).optional()
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8)
  })
});

const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(20)
  })
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshTokenSchema
};
