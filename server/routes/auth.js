const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const User = require("../models/user");
const authController = require("../controllers/auth");

router.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom((value, { req }) => {
        User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject("Email is already in use");
          }
        });
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().isEmpty(),
  ],
  authController.signup
);

router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshToken);

module.exports = router;
