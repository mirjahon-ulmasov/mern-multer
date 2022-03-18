const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const client = require("./redis");

module.exports = {
  create_access_token: (userId) => {
    const token = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });
    if (!token) throw createError.InternalServerError();
    return token;
  },

  verify_access_token: (req, res, next) => {
    const authHeader = req.get("Authorization");
    if (!authHeader) throw createError.Unauthorized();
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) throw createError.Unauthorized();
      req.payload = decoded;
      next();
    });
  },

  create_refresh_token: (userId) => {
    const token = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "7d",
    });
    if (!token) throw createError.InternalServerError();
    client.SET(userId, token, { EX: 7 * 24 * 60 * 60 }).catch(() => {
      throw createError.InternalServerError();
    });
    return token;
  },

  verify_refresh_token: (refreshToken) => {
    let userID;
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err) throw createError.Unauthorized();
        userID = decoded.userId;
      }
    );
    return client
      .GET(userID)
      .then((result) => {
        if (result === refreshToken) return userID;
        throw createError.Unauthorized();
      })
      .catch((err) => {
        throw err;
      });
  },
};
