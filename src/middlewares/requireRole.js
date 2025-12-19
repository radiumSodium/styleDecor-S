module.exports = function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    const role = req.user?.role;

    if (!role) {
      return res.status(401).json({ ok: false, message: "Unauthorized" });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ ok: false, message: "Forbidden" });
    }

    // (admin stays allowed even if isActive is false)
    if (role === "decorator" && req.user?.isActive === false) {
      return res
        .status(403)
        .json({ ok: false, message: "Decorator account disabled" });
    }

    next();
  };
};
