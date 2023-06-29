import jwt from "jsonwebtoken";

export const generateAccessToken = (userId, userRole) => {
  return jwt.sign({ userId, userRole }, process.env.JWT_ACCESS_KEY, {
    // expiresIn: "1h",
    expiresIn: "1200s",
  });
};

export const generateRefreshToken = (userId, userRole) => {
  return jwt.sign({ userId, userRole }, process.env.JWT_REFRESH_KEY, {
    expiresIn: "1d",
  });
};
