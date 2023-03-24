var express = require('express');
var router = express.Router();
const Joi = require('joi');
const Role = require('../helpers/role');
const validateRequest = require('../middleware/validate-request');
const accountService = require('../services/account.service');
const authorize = require('../middleware/authorize');

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Kullanıcı bilgilerini getir
 *     description: Kullanıcının benzersiz kimliği kullanılarak bilgilerini getirir
 *     parameters:
 *       - name: id
 *         description: Kullanıcının benzersiz kimliği
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       '200':
 *         description: Başarılı yanıt
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             email:
 *               type: string
 */
router.post('/register',registerSchema,register);
/**
 * @swagger
 * /login:
 *   post:
 *     summary: Kullanıcı bilgilerini getir
 *     description: Kullanıcının benzersiz kimliği kullanılarak bilgilerini getirir
 *     parameters:
 *       - name: id
 *         description: Kullanıcının benzersiz kimliği
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       '200':
 *         description: Başarılı yanıt
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             email:
 *               type: string
 */
router.post('/login',loginSchema,login);

/**
 * @swagger
 * /revoke-token:
 *   post:
 *     summary: Kullanıcı bilgilerini getir
 *     description: Kullanıcının benzersiz kimliği kullanılarak bilgilerini getirir
 *     parameters:
 *       - name: id
 *         description: Kullanıcının benzersiz kimliği
 *         in: path
 *         required: true
 *         type: string
 *     responses:
 *       '200':
 *         description: Başarılı yanıt
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             email:
 *               type: string
 */
router.post('/revoke-token', authorize(), revokeTokenSchema, revokeToken);


module.exports = router;

function registerSchema(req, res, next) {
    const schema = Joi.object({
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().required(),
        password: Joi.string().min(6).required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
        acceptTerms: Joi.boolean().valid(true).required()
    });
    validateRequest(req, next, schema);
}

function register(req, res, next) {
    console.log(req.body);
    accountService.register(req.body, req.get('origin'))
        .then((result) => { res.json(result) })
        .catch(next);
}

function loginSchema(req, res, next) {
    const schema = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function login(req, res, next) {
    const { email, password } = req.body;
    const ipAddress = req.ip;
    accountService.login({ email, password, ipAddress })
        // .then(({ refreshToken, isVerified,...account}) => {
        .then(({ isVerified, credentials,success }) => {
            console.log('success',success);
            if (isVerified == true) {
                setTokenCookie(res, credentials.refreshToken);
                res.json({ isVerified, credentials,success });
            } else {
                res.json({ isVerified, credentials,success });
            }

        })
        .catch(next);
}

function verifySchema(req, res, next) {
    const schema = Joi.object({
        token: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function verify(req, res, next) {
    accountService.verifyAccount(req.body)
        .then(() => res.json({ message: 'Verification successful, you can now login' }))
        .catch(next);
}

function revokeTokenSchema(req, res, next) {
    const schema = Joi.object({
        token: Joi.string().empty('')
    });
    validateRequest(req, next, schema);
}

function revokeToken(req, res, next) {
    // accept token from request body or cookie
    const token = req.body.token || req.cookies.refreshToken;
    const ipAddress = req.ip;

    if (!token) return res.status(400).json({ message: 'Token is required' });

    // users can revoke their own tokens and admins can revoke any tokens
    if (!req.user.ownsToken(token) && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    accountService.revokeToken({ token, ipAddress })
        .then(() => res.json({ message: 'Token revoked' }))
        .catch(next);
}

function refreshToken(req, res, next) {
    const token = req.cookies.refreshToken;
    const ipAddress = req.ip;
    accountService.refreshToken({ token, ipAddress })
        .then(({ refreshToken, ...account }) => {
            setTokenCookie(res, refreshToken);
            res.json(account);
        })
        .catch(next);
}

function setTokenCookie(res, token) {
    // create cookie with refresh token that expires in 7 days
    const cookieOptions = {
        httpOnly: true,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };
    res.cookie('refreshToken', token, cookieOptions);
}