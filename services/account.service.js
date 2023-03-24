
const db = require('../helpers/db');
const Role = require('../helpers/role');
const crypto = require("crypto");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secret = process.env.SECRET;

module.exports = {
    register,
    login,
    verifyAccount,
    revokeToken,
    refreshToken

};

async function login({ email, password, ipAddress }) {
    const account = await db.Account.findOne({ email });

    // if (!account || !account.isVerified || !bcrypt.compareSync(password, account.passwordHash)) {
        if (!account || !bcrypt.compareSync(password, account.passwordHash)) {
        //throw 'email or password is incorrect';
        return {
            success:false
        };
    }

    // if(!account.verified){
    //     return {
    //         success : false,
    //         isVerified:false,
    //         credentials : {
    //             ...basicDetails(account),
    //            jwtToken:null,
    //             refreshToken : null
    //         }
    //     };
    // }

    // authentication successful so generate jwt and refresh tokens
    const jwtToken = generateJwtToken(account);
    const refreshToken = generateRefreshToken(account, ipAddress);

    // save refresh token
    await refreshToken.save();

    // return basic details and tokens
    return {
        isVerified:true,
        success:true,
        credentials:{
            ...basicDetails(account),
            jwtToken,
            refreshToken: refreshToken.token
        } 
    };
}


async function register(params, origin,callback) {
    // validate
    if (await db.Account.findOne({ email: params.email })) {
        // send already registered error in email to prevent account enumeration
       // return await sendAlreadyRegisteredEmail(params.email, origin);
      // callback({success:false,code : 200 });
      return {success:false,code : 200 };
    }

    // create account object
    const account = new db.Account(params);

    // first registered account is an admin
    const isFirstAccount = (await db.Account.countDocuments({})) === 0;
    account.role = isFirstAccount ? Role.Admin : Role.User;
    account.verificationToken = randomTokenString();

    // hash password
    account.passwordHash = hash(params.password);

    // save account
    await account.save();

    // send email
 //   await sendVerificationEmail(account, origin);

    //callback({success:true,code : 100 });
    return {success:true,code : 100 };
}

async function verifyAccount({ token }) {
 const account = await db.Account.findOne({ verificationToken: token });
if (!account) throw 'Verification failed';

    account.verified = Date.now();
    account.verificationToken = undefined;
    await account.save();
}

async function revokeToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);

    // revoke token and save
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    await refreshToken.save();
}

async function refreshToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);
    console.log("refreshToken",refreshToken);
    const { account } = refreshToken;

    // replace old refresh token with a new one and save
    const newRefreshToken = generateRefreshToken(account, ipAddress);
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    refreshToken.replacedByToken = newRefreshToken.token;
    await refreshToken.save();
    await newRefreshToken.save();

    // generate new jwt
    const jwtToken = generateJwtToken(account);

    // return basic details and tokens
    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: newRefreshToken.token
    };
}


function generateJwtToken(account) {
    console.log(account);
    // create a jwt token containing the account id that expires in 15 minutes
    return jwt.sign({ sub: account.id, id: account.id}, secret, { expiresIn: '15m' });
}

function generateRefreshToken(account, ipAddress) {
    // create a refresh token that expires in 7 days
    return new db.RefreshToken({
        account: account.id,
        token: randomTokenString(),
        expires: new Date(Date.now() + 7*24*60*60*1000),
        createdByIp: ipAddress
    });
}



async function getRefreshToken(token) {
    const refreshToken = await db.RefreshToken.findOne({ token }).populate('account');
    console.log(refreshToken);
    if (!refreshToken || !refreshToken.isActive) throw 'Invalid token';
    return refreshToken;
}

function basicDetails(account) {
    const { id, title, firstName, lastName, email, role, created, updated, isVerified } = account;
    return { id, title, firstName, lastName, email, role, created, updated, isVerified };
}
function randomTokenString() {
    return crypto.randomBytes(40).toString('hex');
}
function hash(password) {
    return bcrypt.hashSync(password, 10);
}
