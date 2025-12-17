module.exports = function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role) {
      return res.status(401).json({ ok: false, message: "Unauthorized" });
    }
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({ ok: false, message: "Forbidden" });
    }
    next();
  };
};