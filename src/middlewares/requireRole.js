module.exports = (...roles) => (req, res, next) => {
  if (!req.user?.role) return res.status(401).json({ ok: false, message: "No role" });
  if (!roles.includes(req.user.role))
    return res.status(403).json({ ok: false, message: "Forbidden" });
  next();
};