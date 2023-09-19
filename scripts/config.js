// herbruikbare waarden
let BASE_PORT = parseInt(process.env.BASE_PORT) || 31400;

let BASIC_AUTH_USER = process.env.BASIC_AUTH_USER || 'openstad';
let BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD || 'openstad';

let COOKIE_SECURE_OFF = process.env.FORCE_HTTP ? 'yes' : '';

let API_DOMAIN = process.env.API_DOMAIN || 'api.' + process.env.BASE_DOMAIN;
let API_URL = process.env.API_URL || 'http://' + API_DOMAIN;
let API_PORT = process.env.API_PORT || BASE_PORT + 10;
let API_FIXED_AUTH_KEY = process.env.API_FIXED_AUTH_KEY || process.env.AUTH_LOGIN_CODE || generateRandomToken({ length: 2048 });

let AUTH_DOMAIN = process.env.AUTH_DOMAIN || 'auth.' + process.env.BASE_DOMAIN;
let AUTH_URL = process.env.AUTH_URL || 'http://' + AUTH_DOMAIN;
let AUTH_PORT = process.env.AUTH_PORT || BASE_PORT + 30;
let AUTH_JWT_SECRET = generateRandomToken({ length: 64 });
let AUTH_FIRST_CLIENT_ID = process.env.AUTH_FIRST_CLIENT_ID || 'default-client';
let AUTH_FIRST_CLIENT_SECRET = process.env.AUTH_FIRST_CLIENT_SECRET || generateRandomToken({ length: 64 });
let AUTH_ADMIN_CLIENT_ID = process.env.AUTH_ADMIN_CLIENT_ID || 'admin-client';
let AUTH_ADMIN_CLIENT_SECRET = process.env.AUTH_ADMIN_CLIENT_SECRET || generateRandomToken({ length: 64 });

let IMAGE_DOMAIN = process.env.IMAGE_DOMAIN || 'image.' + process.env.BASE_DOMAIN;
let IMAGE_APP_URL = process.env.IMAGE_APP_URL || 'http://' + IMAGE_DOMAIN;
let IMAGE_PORT_API = process.env.IMAGE_PORT_API || BASE_PORT + 50;
let IMAGE_PORT_IMAGE_SERVER = process.env.IMAGE_PORT_IMAGE_SERVER || IMAGE_PORT_API + 1;
let IMAGE_CLIENT_TOKEN = process.env.IMAGE_CLIENT_TOKEN || generateRandomToken({ length: 255 });

// api server
process.env.API_URL = API_URL;
process.env.API_DOMAIN = API_DOMAIN;
process.env.API_PORT = API_PORT;

process.env.API_DB_HOST = process.env.API_DB_HOST || process.env.DB_HOST;
process.env.API_DB_USERNAME = process.env.API_DB_USERNAME || process.env.DB_USERNAME;
process.env.API_DB_PASSWORD = process.env.API_DB_PASSWORD || process.env.DB_PASSWORD;
process.env.API_DB_NAME = process.env.API_DB_NAME || ( process.env.DB_BASE_NAME ? process.env.DB_BASE_NAME + '-api' :  'api' );
process.env.API_DB_DIALECT = process.env.API_DB_DIALECT || process.env.DB_DIALECT || 'mariadb';

process.env.API_FROM_EMAIL_ADDRESS = process.env.API_FROM_EMAIL_ADDRESS || process.env.FROM_EMAIL_ADDRESS;
process.env.API_SMTP_PORT = process.env.API_SMTP_PORT || process.env.SMTP_PORT;
process.env.API_SMTP_HOST = process.env.API_SMTP_HOST || process.env.SMTP_HOST;
process.env.API_SMTP_USERNAME = process.env.API_SMTP_USERNAME || process.env.SMTP_USERNAME;
process.env.API_SMTP_PASSWORD = process.env.API_SMTP_PASSWORD || process.env.SMTP_PASSWORD;

process.env.API_COOKIE_SECRET = process.env.API_COOKIE_SECRET || generateRandomToken({ length: 32 });
process.env.API_COOKIE_ONLY_SECURE = process.env.API_COOKIE_ONLY_SECURE || process.env.API_COOKIE_ONLY_SECURE != 'false' ? true : false;
process.env.API_JWT_SECRET = process.env.API_JWT_SECRET || generateRandomToken({ length: 64 });

// API_AUTH_URL: process.env.API_AUTH_URL || AUTH_URL,
// API_AUTH_JWT_SECRET: process.env.API_AUTH_JWT_SECRET || AUTH_JWT_SECRET,
// API_AUTH_DEFAULT_CLIENT_ID: process.env.API_AUTH_DEFAULT_CLIENT_ID || AUTH_FIRST_CLIENT_ID,
// API_AUTH_CLIENT_PASSWORD: process.env.API_AUTH_CLIENT_PASSWORD || AUTH_FIRST_CLIENT_SECRET,

process.env.API_FIXED_AUTH_KEY = API_FIXED_AUTH_KEY;

// auth server
process.env.AUTH_APP_URL = process.env.AUTH_APP_URL || AUTH_URL;
process.env.AUTH_PORT = AUTH_PORT;
process.env.AUTH_DOMAIN = AUTH_DOMAIN;

process.env.AUTH_DB_HOST = process.env.AUTH_DB_HOST || process.env.DB_HOST;
process.env.AUTH_DB_USERNAME = process.env.AUTH_DB_USERNAME || process.env.DB_USERNAME;
process.env.AUTH_DB_PASSWORD = process.env.AUTH_DB_PASSWORD || process.env.DB_PASSWORD;
process.env.AUTH_DB_NAME = process.env.AUTH_DB_NAME || ( process.env.DB_BASE_NAME ? process.env.DB_BASE_NAME + '-auth-server' :  'auth-server' );

// TODO: moet weg
process.env.AUTH_MONGO_HOST = process.env.AUTH_MONGO_HOST || process.env.MONGO_HOST || 'localhost';
process.env.AUTH_MONGO_PORT = process.env.AUTH_MONGO_PORT || process.env.MONGO_PORT || 27017;
process.env.AUTH_MONGO_USER = process.env.AUTH_MONGO_USER || process.env.MONGO_USER || '';
process.env.AUTH_MONGO_PASSWORD = process.env.AUTH_MONGO_PASSWORD || process.env.MONGO_PASSWORD || '';

process.env.AUTH_MAIL_SERVER_URL = process.env.AUTH_MAIL_SERVER_URL || process.env.SMTP_HOST;
process.env.AUTH_MAIL_SERVER_PORT = process.env.AUTH_MAIL_SERVER_PORT || process.env.SMTP_PORT;
process.env.AUTH_MAIL_SERVER_SECURE = true;
process.env.AUTH_MAIL_SERVER_PASSWORD = process.env.AUTH_MAIL_SERVER_PASSWORD || process.env.SMTP_PASSWORD;
process.env.AUTH_MAIL_SERVER_USER_NAME = process.env.AUTH_MAIL_SERVER_USER_NAME || process.env.SMTP_USERNAME;
process.env.AUTH_FROM_NAME = process.env.AUTH_FROM_NAME || '';
process.env.AUTH_FROM_EMAIL = process.env.AUTH_FROM_EMAIL || process.env.FROM_EMAIL_ADDRESS;
process.env.AUTH_EMAIL_ASSETS_URL = process.env.AUTH_APP_URL || AUTH_URL;

process.env.AUTH_SESSION_SECRET = process.env.AUTH_SESSION_SECRET || generateRandomToken({ length: 32 });
// TODO: dev vs prod
process.env.AUTH_COOKIE_SECURE_OFF = typeof process.env.AUTH_COOKIE_SECURE_OFF != 'undefined' ? process.env.AUTH_COOKIE_SECURE_OFF : 'yes', // TODO: COOKIE_SECURE_OFF;

// KPN_CLIENT_ID=
// KPN_CLIENT_SECRET=

// image server
process.env.IMAGE_DOMAIN = IMAGE_DOMAIN;
process.env.IMAGE_APP_URL = IMAGE_APP_URL;
process.env.IMAGE_PORT_API = IMAGE_PORT_API;
process.env.IMAGE_PORT_IMAGE_SERVER = IMAGE_PORT_IMAGE_SERVER;

process.env.IMAGE_DB_HOST = process.env.IMAGE_DB_HOST || process.env.DB_HOST;
process.env.IMAGE_DB_USERNAME = process.env.IMAGE_DB_USERNAME || process.env.DB_USERNAME;
process.env.IMAGE_DB_PASSWORD = process.env.IMAGE_DB_PASSWORD || process.env.DB_PASSWORD;
process.env.IMAGE_DB_NAME = process.env.IMAGE_DB_NAME || ( process.env.DB_BASE_NAME ? process.env.DB_BASE_NAME + '-image-server' :  'image-server' );

process.env.IMAGE_IMAGES_DIR = process.env.IMAGE_IMAGES_DIR || '';
process.env.IMAGE_THROTTLE = process.env.IMAGE_THROTTLE || true;
process.env.IMAGE_THROTTLE_CC_PROCESSORS = process.env.IMAGE_THROTTLE_CC_PROCESSORS || 4;
process.env.IMAGE_THROTTLE_CC_PREFETCHER = process.env.IMAGE_THROTTLE_CC_PREFETCHER || 20;
process.env.IMAGE_THROTTLE_CC_REQUESTS = process.env.IMAGE_THROTTLE_CC_REQUESTS || 100;

// IMAGE_CLIENT_NAME: process.env.IMAGE_CLIENT_NAME || 'default-client',
// IMAGE_CLIENT_TOKEN: IMAGE_CLIENT_TOKEN,
// IMAGE_CLIENT_DISPLAY_NAME: process.env.IMAGE_CLIENT_DISPLAY_NAME || 'Default image server client',

function generateRandomToken(params) {

  var token = '';

  params.chars = params.chars || 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  params.length = params.length || 25;

  for (let i = 0; i < params.length; i++) {
    const rnd = Math.floor(params.chars.length * Math.random());
    const chr = params.chars.substring(rnd, rnd + 1);
    token = token + chr;
  }

  return token;

}
