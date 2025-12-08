const config    = require('config');
const dbConfig  = config.get('database');
const mysql = require('mysql2');
const express = require('express');
const createError = require('http-errors')
const hasRole = require('../../lib/sequelize-authorization/lib/hasRole');
const rateLimiter = require("@openstad-headless/lib/rateLimiter");

const getDbPassword = async () => {
	switch(process.env.DB_AUTH_METHOD) {
		case 'azure-auth-token':
			const { getAzureAuthToken } = require('../../../src/util/azure')
			return await getAzureAuthToken()
		default:
			return process.env.DB_PASSWORD
	}
}

console.log('===== DB CONFIG DEBUG =====');
console.log('DB config present:', !!dbConfig);
console.log('DB config keys (excluding password):', dbConfig ? Object.keys(dbConfig).filter(k => k !== 'password') : 'missing');
console.log('DB host:', dbConfig?.host);
console.log('DB user:', dbConfig?.user);
console.log('DB database:', dbConfig?.database);

try {
    const passwordPromise = getDbPassword();
    if (passwordPromise && typeof passwordPromise.then === 'function') {
        passwordPromise
            .then(pw => {
                const dbPasswordSnippet = dbConfig?.password?.slice(0, 2) || 'N/A';
                const pwSnippet = pw?.slice(0, 2) || 'N/A';
                console.log('dbConfig.password first 2 chars:', dbPasswordSnippet);
                console.log('getDbPassword() first 2 chars:', pwSnippet);
                console.log('Passwords match (first 2 chars):', dbPasswordSnippet === pwSnippet);
            })
            .catch(err => {
                console.error('getDbPassword() rejected:', err);
            });
    } else {
        console.log('getDbPassword() did not return a promise as expected');
    }
} catch (err) {
    console.error('Error calling getDbPassword():', err);
}
console.log('===== END DB CONFIG DEBUG =====');

const pool = mysql.createPool({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

let router = express.Router({mergeParams: true});

// for all get requests
router
    .all('*', function(req, res, next) {

        return next();

    })

router.route('/total')

    // count votes
    // -----------
    .get( rateLimiter(), function(req, res, next) {

        let isViewable = req.project && req.project.config && req.project.config.votes && req.project.config.votes.isViewable;
        isViewable = isViewable || hasRole( req.user, 'editor')
        if (!isViewable) return next(createError(401, 'Je kunt deze stats niet bekijken'));

        let query = "SELECT count(votes.id) AS counted FROM votes LEFT JOIN resources ON votes.resourceId = resources.id WHERE votes.deletedAt IS NULL AND  (votes.checked IS NULL OR votes.checked = 1) AND resources.deletedAt IS NULL AND resources.projectId=?";
        let bindvars = [req.params.projectId]

        if (req.query.opinion) {
            query += " AND votes.opinion=?"
            bindvars.push(req.query.opinion);
        }

        pool
            .promise()
            .query(query, bindvars)
            .then( ([rows,fields]) => {
                console.log(rows);
                let counted = rows && rows[0] && rows[0].counted || -1;
                res.json({count: counted})
            })
            .catch(err => {
                next(err);
            })

    })


router.route('/no-of-users')

    // count unique users who voted
    // -----------
    .get( rateLimiter(), function(req, res, next) {

        let query = "SELECT count(DISTINCT votes.userId) AS counted FROM votes LEFT JOIN resources ON votes.resourceId = resources.id WHERE resources.projectId=? AND votes.deletedAt IS NULL AND (votes.checked IS NULL OR votes.checked = 1) AND resources.deletedAt IS NULL";
        let bindvars = [req.params.projectId]

        pool
            .promise()
            .query(query, bindvars)
            .then( ([rows,fields]) => {
                console.log(rows);
                let counted = rows && rows[0] && rows[0].counted || 0;
                res.json({count: counted})
            })
            .catch(err => {
                console.error(err.stack || err);
                console.error('Error message:', err.message);
                console.error('Error code:', err.code);
                next(err);
            })

    })

module.exports = router;
