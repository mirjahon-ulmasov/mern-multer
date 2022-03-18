const express = require("express");
const { body } = require("express-validator");
const { verify_access_token } = require("../config/jwt");
const feedController = require("../controllers/feed");
// const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.get("/posts", [verify_access_token], feedController.getPosts);
router.post(
  "/post",
  [
    body("title", "Please enter a valid title").trim().isLength({ min: 5 }),
    body("content", "Please enter a valid content").trim().isLength({ min: 5 }),
  ],
  [verify_access_token],
  feedController.createPost
);

router.get("/post/:postId", [verify_access_token], feedController.getPost);

router.put(
  "/post/:postId",
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  [verify_access_token],
  feedController.updatePost
);

router.delete(
  "/post/:postId",
  [verify_access_token],
  feedController.deletePost
);

module.exports = router;
