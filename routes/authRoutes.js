const express = require('express');
const router = express.Router();
const authContorller = require("../controllers/authControllers");
// const { route } = require('./root');

router.route('/register').post(authContorller.register);
router.route("/login").post(authContorller.login);
router.route("/refresh").get(authContorller.refresh);
router.route("/logout").post(authContorller.logout);

module.exports = router;