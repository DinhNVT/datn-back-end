import { StatusCodes } from "http-status-codes";

const authRole = (role) => {
  return async (req, res, next) => {
    //find the login user
    const roleUser = await req.role;
    //check if admin
    if (roleUser === role) {
      next();
    } else {
      res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: `Access denied, ${role} only` });
    }
  };
};

export default authRole;
