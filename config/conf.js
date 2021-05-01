const crypto = require('crypto').randomBytes(256).toString('hex');

module.exports = {
    secret: 'youshallnotpassthistaskwasassignedtoyoufrodooftheshire',
    port: 9000,
    apiVersion: 'v1'
}