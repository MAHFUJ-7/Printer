const roleInheritance = {
  ADMIN: ["ADMIN", "PRINTER_OWNER", "STUDENT"],
  PRINTER_OWNER: ["PRINTER_OWNER", "STUDENT"],
  STUDENT: ["STUDENT"]
};

function authorize(...allowedRoles) {
  return (req, res, next) => {
    const currentRole = req.user?.role;
    const effectiveRoles = roleInheritance[currentRole] || [];
    const isAllowed = allowedRoles.some((role) => effectiveRoles.includes(role));

    if (!currentRole || !isAllowed) {
      return res.status(403).json({
        status: "error",
        message: "Forbidden",
        code: 403
      });
    }

    return next();
  };
}

module.exports = authorize;
