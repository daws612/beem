const express = require('express');
const pool = require('../lib/dbpool');

function createRouter() {
    const router = express.Router();

    router.get('/searchByMccAndMnc', function (req, res, next) {
        try {
            var mcc = req.query.mcc;
            var mnc = req.query.mnc;

            if(!mcc || !mnc){
                res.status(500).json({ error: '', message: 'Please provide both mcc and mnc' });
                return;
            }

            var sql = `SELECT network, country from mobile_network WHERE mcc = ${mcc} and mnc = ${mnc};`;
            searchDetails(sql).then((response) => {
                res.status(200).json(response);
            }).catch((msg) => {
                res.status(500).json({ error: msg, message: msg.message });
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: error, message: error.message });
        };
    });

    router.get('/searchNetworksInCountry', function (req, res, next) {
        try {
            var country = req.query.country;
            var mcc = req.query.mcc;

            if(!mcc && !country){
                res.status(500).json({ error: '', message: 'Please provide either mcc or country name' });
                return;
            }

            var country_query = ` country like '%${country}%' `;
            var sql = `SELECT network from mobile_network where ${mcc ? 'mcc = ' + mcc : ''} ${(mcc && country) ? ' OR ' : ''} ${country ? country_query : ''} order by country;`;
            searchDetails(sql).then((response) => {
                res.status(200).json(response);
            }).catch((msg) => {
                res.status(500).json({ error: msg, message: msg.message });
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: error, message: error.message });
        };
    });

    return router;
}

function searchDetails(sql) {

    return new Promise((resolve, reject) => {

        pool.query(sql, (error, results) => {
            if (error) {
                console.error(error);
                reject(error);
            } else {
                resolve(results);
                console.log(`Received ${results.length} from searchDetails`);
            }
        });
    });
}

module.exports = createRouter;