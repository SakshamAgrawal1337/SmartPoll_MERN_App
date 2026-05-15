import ApiError from "../utils/api-error.js";
import { verifyAccessToken } from "../utils/jwt.utils.js";
import User from "../../modules/auth/auth.model.js";

// Optional authentication middleware
// - If Authorization: Bearer <token> is present, sets req.user.
// - If missing, continues without throwing.
const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return next();

    const token = authHeader.split(" ")[1];
    if (!token) return next();

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);

    if (user) {
      req.user = {
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
      };
    }

    return next();
  } catch (err) {
    // If token is invalid/expired, we still allow anonymous access
    // for endpoints that use this middleware.
    return next();
  }
};

export { optionalAuthenticate };

