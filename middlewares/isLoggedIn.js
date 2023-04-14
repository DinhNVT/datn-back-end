import { getTokenFromHeader } from "../utils/getTokenFromHeader.js";
import { verifyAccessToken } from "../utils/verifyToken.js";
import { StatusCodes } from "http-status-codes";

export const isLoggedIn = (req, res, next) => {
  //get token from header
  const token = getTokenFromHeader(req);
  //verify the token
  const decodedUser = verifyAccessToken(token);
  if (!decodedUser) {
    return res.status(StatusCodes.FORBIDDEN).json({message: "You need to sign in"});
  } else {
    //save the user into req obj
    req.userAuthId = decodedUser?.id;
    req.role = decodedUser?.role;
    next();
  }
};
