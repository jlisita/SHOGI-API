/**
 * @swagger
 * components:
 *   schemas:
 *     Shogi:
 *       type: object
 *       required:
 *         - pseudo
 *         - password
 *       properties:
 *         id:
 *           type: integer
 *           description: The id of the user, auto-generated
 *         pseudo:
 *           type: string
 *           description: The pseudo of the user
 *         email:
 *           type: string
 *           description: The e-mail of the user
 *         password:
 *           type: string
 *           description: The password of the user
 *         country:
 *           type: string
 *           description: The country of the user
 *         biography:
 *           type: text
 *           description: The biography of the user
 *         ratio:
 *           type: float
 *           description: The gamer rate of the user
 *         avatar: 
 *           type: string
 *           description: The avatar of the user
 *         createdAt:
 *           type: string
 *           format: date
 *           description: The date the user was added, auto-generated
 *         updatedAt:
 *           type: string
 *           format: date
 *           description: The date the user was updated, auto-generated
 *       example:
 *         id: 4
 *         pseudo: Juju
 *         email: jlisita@hotmail.fr
 *         password: efjzb565VHG
 *         country: France
 *         biography: je suis dev web
 *         ratio: 12,7
 *         avatar: ehfzfhefzf
 *         createdAt: 2020-03-10T04:05:06.157Z
 *         updatedAt: 2020-03-10T04:05:06.157Z
 */

const express = require('express')
const { findAllUsers, findUserByPk, createUser, updateUser, deleteUser, updateProfile, deleteProfile } = require('../controllers/userController')
const { login, logout } = require('../controllers/authController')
const { protect, restrictTo } = require('../middlewares/auth')
const router = express.Router()

router
    .route('/')
    /**
    * @openapi
    * /api/users:
    *   get:
    *     summary: Get all users
    *     tags: [Users]
    *     responses:
    *       200:
    *         description: The list of users.
    *         content:
    *           application/json:
    *             schema:
    *               $ref: '#/components/schemas/User'
    *       500:
    *         description: Some server error 
    */
    .get(protect, findAllUsers)

    router
    .route('/signup')
    /**
    * @openapi
    * /api/users/signup:
    *   post:
    *     summary: Create a new user
    *     tags: [Users]
    *     requestBody:
    *       required: true
    *       content:
    *         application/json:
    *           schema:
    *             $ref: '#/components/schemas/User'
    *     responses:
    *       200:
    *         description: The created user.
    *         content:
    *           application/json:
    *             schema:
    *               $ref: '#/components/schemas/User'
    *       500:
    *         description: Some server error 
    */
    .post(createUser)

router
    .route('/profile/')
    /**
    * @openapi
    * /api/users/:
    *   put:
    *    summary: The user can update his profile, by the id given in a jsonwebtoken
    *    tags: [Users]
    *    requestBody:
    *      required: true
    *      content:
    *        application/json:
    *          schema:
    *            $ref: '#/components/schemas/user'
    *    responses:
    *      200:
    *        description: The user was updated
    *        content:
    *          application/json:
    *            schema:
    *              $ref: '#/components/schemas/User'
    *      404:
    *        description: The user was not found
    *      500:
    *        description: Some error happened
    */
    .put(protect, updateProfile)
    /**
    * @openapi
    * /api/users/:
    *   delete:
    *    summary: The user can delete his profile, by the id given in a jsonwebtoken
    *    tags: [Users]
    *    requestBody:
    *      required: true
    *      content:
    *        application/json:
    *          schema:
    *            $ref: '#/components/schemas/user'
    *    responses:
    *      200:
    *        description: The user was deleted
    *        content:
    *          application/json:
    *            schema:
    *              $ref: '#/components/schemas/User'
    *      404:
    *        description: The user was not found
    *      500:
    *        description: Some error happened
    */
    .delete(protect, deleteProfile)

router
    .route('/:id')
    /**
    * @openapi
    * /api/users/{id}:
    *   get:
    *     summary: Get the user by id
    *     tags: [Users]
    *     parameters:
    *       - in: path
    *         name: id
    *         schema:
    *           type: string
    *         required: true
    *         description: The user id
    *     responses:
    *       200:
    *         description: The user response by id
    *         contents:
    *           application/json:
    *             schema:
    *               $ref: '#/components/schemas/User'
    *       404:
    *         description: The user was not found
    */
    .get(protect, findUserByPk)
    /**
    * @openapi
    * /api/users/{id}:
    *   put:
    *     summary: Update the user by id, restricted to admin
    *     tags: [Users]
    *     parameters:
    *       - in: path
    *         name: id
    *         schema:
    *           type: string
    *         required: true
    *         description: The user id
    *     responses:
    *       200:
    *         description: User updated
    *         contents:
    *           application/json:
    *             schema:
    *               $ref: '#/components/schemas/User'
    *       404:
    *         description: The user was not found
    */
    .put(protect, restrictTo('admin'), updateUser)
    /**
    * @openapi
    * /api/users/{id}:
    *   delete:
    *     summary: Delete the user by id, restricted to admin
    *     tags: [Users]
    *     parameters:
    *       - in: path
    *         name: id
    *         schema:
    *           type: string
    *         required: true
    *         description: The user id
    *     responses:
    *       200:
    *         description: User deleted
    *         contents:
    *           application/json:
    *             schema:
    *               $ref: '#/components/schemas/User'
    *       404:
    *         description: The user was not found
    */
    .delete(protect, restrictTo('superadmin'), deleteUser)

    router
    .route('/login')
    /**
    * @openapi
    * /api/users/login:
    *   post:
    *     summary: Login as user
    *     tags: [Users]
    *     requestBody:
    *       required: true
    *       content:
    *         application/json:
    *           schema:
    *             $ref: '#/components/schemas/User'
    *     responses:
    *       200:
    *         description: Login successful.
    *         content:
    *           application/json:
    *             schema:
    *               $ref: '#/components/schemas/User'
    *       400:
    *         description: Invalid credentials.
    *         content:
    *           application/json:
    *             schema:
    *               $ref: '#/components/schemas/User'
    *       500:
    *         description: Some server error 
    */
    .post(login)

router
    .route('/logout')
    /**
    * @openapi
    * /api/users/logout:
    *   post:
    *     summary: Logout
    *     tags: [Users]
    *     requestBody:
    *       required: true
    *       content:
    *         application/json:
    *           schema:
    *             $ref: '#/components/schemas/User'
    *     responses:
    *       200:
    *         description: Logout successful.
    *         content:
    *           application/json:
    *             schema:
    *               $ref: '#/components/schemas/User'
    */
    .post(logout)

module.exports = router