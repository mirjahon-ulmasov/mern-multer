const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const {
  create_refresh_token,
  create_access_token,
  verify_refresh_token,
} = require("../config/jwt");
const createError = require("http-errors");

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty) {
    const error = new Error("Validation failed");
    error.data = errors.array();
    error.statusCode = 422;
    throw error;
  }
  const { email, name, password } = req.body;

  bcrypt
    .hash(password, 12)
    .then((hashPw) => {
      const user = new User({
        email,
        name,
        password: hashPw,
      });
      return user.save();
    })
    .then((user) => {
      const access_token = create_access_token(loadedUser._id.toString());
      const refresh_token = create_refresh_token(loadedUser._id.toString());

      res
        .status(201)
        .json({
          message: "User created",
          userId: user._id,
          access_token,
          refresh_token,
        });
    })
    .catch((err) => {
      err.statusCode = err.statusCode || 500;
      next(err);
    });
};

exports.login = (req, res, next) => {
  const { email, password } = req.body;
  let loadedUser;
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        const error = new Error("User with this email does not exist");
        error.statusCode = 401;
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        const error = new Error("Wrong password");
        error.statusCode = 401;
        throw error;
      }

      const access_token = create_access_token(loadedUser._id.toString());
      const refresh_token = create_refresh_token(loadedUser._id.toString());

      res.status(200).json({
        userId: loadedUser._id.toString(),
        token: access_token,
        refresh_token,
      });
    })
    .catch((err) => {
      err.statusCode = err.statusCode || 500;
      next(err);
    });
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refresh_token } = req.body;
    if (!refresh_token) throw createError.BadRequest();
    const userId = await verify_refresh_token(refresh_token);

    const access_token = create_access_token(userId);
    const refresh_new_token = create_refresh_token(userId);
    res
      .status(200)
      .json({ access_token: access_token, refresh_token: refresh_new_token });
  } catch (err) {
    next(err);
  }
};
