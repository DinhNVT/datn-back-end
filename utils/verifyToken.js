import jwt from "jsonwebtoken";

export const verifyAccessToken = async (token) => {
  return await jwt.verify(token, process.env.JWT_ACCESS_KEY, (err, decoded) => {
    if (err) {
      return false;
    } else {
      return decoded;
    }
  });
};

export const verifyRefreshToken = async (token) => {
  return await jwt.verify(
    token,
    process.env.JWT_REFRESH_KEY,
    (err, decoded) => {
      if (err) {
        return false;
      } else {
        return decoded;
      }
    }
  );
};
