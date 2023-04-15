import { StatusCodes } from "http-status-codes";
import { isLoggedIn } from "./isLoggedIn.js";

const authRole = (roles) => {
  return async (req, res, next) => {
    isLoggedIn(req, res, async () => {
      //find the login user
      const roleUser = await req.role;
      //check if admin
      if (roles.includes(roleUser)) {
        next();
      } else {
        res
          .status(StatusCodes.UNAUTHORIZED)
          .json({ message: `Access denied ${roles} only` });
      }
    });
  };
};

export default authRole;
