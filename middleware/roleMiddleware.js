// Kiểm tra xem người dùng có thuộc các vai trò được phép không
const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
      // Nếu chưa có người dùng (chưa qua authMiddleware)
      if (!req.user || !req.user.role) {
        return res.status(401).json({ message: 'Unauthorized: No user context' });
      }
  
      // Kiểm tra quyền
      const userRole = req.user.role;
  
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ message: 'Access denied: insufficient permissions' });
      }
  
      // Được phép
      next();
    };
  };
  
  module.exports = roleMiddleware;
  