require('dotenv').config(); // instatiate environment variables

let CONFIG = {} // Make this global to use all over the application

CONFIG.app = process.env.APP || 'development';
CONFIG.port = process.env.PORT || 3000;
CONFIG.appName = process.env.APP_NAME || 'Color_Game';
CONFIG.appImageUrl = process.env.APP_IMAGE_URL || '';
CONFIG.baseUrl = process.env.BASE_URL || 'http://localhost:3000';

CONFIG.dbUri = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/new_color_game';

//** JWT Creds */
CONFIG.jwt = {
    encryption: process.env.JWT_ENCRYPTION || 'godOfWar',
    expiration: process.env.JWT_EXPIRATION || '30d'
};

//* REST API header token auth key */
CONFIG.restHeaderAuthKey = process.env.REST_HEADER_AUTH_KEY || 'Authorization';

//** SMTP Creds */
CONFIG.smtp = {
    host: process.env.SMTP_HOST || '',
    port: process.env.SMTP_PORT || '',
    fromEmail: process.env.SMTP_FROM_EMAIL || '',
    username: process.env.SMTP_USERNAME || '',
    password: process.env.SMTP_PASSWORD || '',
};

//** Salt Round for Encrypt Password */
CONFIG.saltRounds = process.env.BCRYPT_SALT_ROUNDS || 10;

//** API response status */
CONFIG.responseStatus = {
    zero: parseInt(process.env.STATUS_ZERO) || 0,
    one: parseInt(process.env.STATUS_ONE) || 1,
    two: parseInt(process.env.STATUS_TWO) || 2,
}

//* Record list limit */
CONFIG.recordListLimit = process.env.RECORD_LIST_LIMIT || '10';

//* OTP Length */
CONFIG.otpLength = process.env.OTP_LENGTH || '6';

//** AWS S3 Creds */
CONFIG.awsS3 = {
    accessKey: process.env.AWS_ACCESS_KEY || '',
    secretKey: process.env.AWS_SECRET_KEY || '',
    region: process.env.AWS_REGION || '',
    bucket: process.env.AWS_BUCKET || '',
    bucketUrl: process.env.AWS_BUCKET_URL || '',
};

//** Reset password URLs for front end */
CONFIG.resetPasswordUrls = {
    admin: process.env.RP_ADMIN_URL || '',
    customer: process.env.RP_CUSTOMER_URL || '',
    merchant: process.env.RP_MERCHANT_URL || '',
};

//** Front URLs */
CONFIG.frontUrls = {
    customer: process.env.CUSTOMER_URL || '',
    merchant: process.env.MERCHANT_URL || '',
};

//** PayBy Config */
CONFIG.payBy = {
    currency: process.env.PAYBY_CURRENCY || '',
    partnerIdStaging: process.env.PAYBY_PARTNER_ID_STAGING || '',
    partnerIdProduction: process.env.PAYBY_PARTNER_ID_PRODUCTION || '',
    paySceneCode: process.env.PAYBY_PAY_SCENE_CODE || '',
    platformType: process.env.PAYBY_PLATFORM_TYPE || '',
    environment: process.env.PAYBY_ENVIRONMENT || '',
    redirectUrl: process.env.PAYBY_REDIRECT_URL || '',
    apiStagingUrl: process.env.PAYBY_API_STAGING_URL || '',
    apiProductionUrl: process.env.PAYBY_API_PRODUCTION_URL || '',
};
CONFIG.pdfFooter = {
    height: "10mm",
    contents: {
        default: '<div style="width:100%;text-align:center;">Powered by Alsafron System.</div>', // fallback value
    }
};

module.exports = CONFIG;
