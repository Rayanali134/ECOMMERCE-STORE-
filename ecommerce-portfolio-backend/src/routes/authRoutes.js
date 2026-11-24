const express = require("express");

const router = express.Router();

const {
    register,
    login,
    getMe,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
} = require("../controllers/authController");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");


router.post("/register", register);

router.post("/login", login);

router.get(
    "/me",
    protect,
    getMe
);


router.get(
    "/users",
    protect,
    adminOnly,
    getAllUsers
);

router.get(
    "/users/:id",
    protect,
    adminOnly,
    getUserById
);

router.put(
    "/users/:id",
    protect,
    adminOnly,
    updateUser
);

router.delete(
    "/users/:id",
    protect,
    adminOnly,
    deleteUser
);


module.exports = router;