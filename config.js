var config = {
    port: 3480,
    serverhost: 'http://localhost',
    restaurantSearchDistance: 10000,
    environment: 'development', //development,staging,live
    secretKey: 'hyrgqwjdfbw4534efqrwer2q38945765',
    adminUrl: 'http://localhost:4200/#/',
    production: {
        username: 'brain1uMMong0User',
        password: 'PL5qnU9nuvX0pBa',
        host: '68.183.173.21',
        port: '27017',
        dbName: 'HotMenu',
        authDb: 'admin'
    },
    emailConfig: {
        MAIL_USERNAME: "liveapp.brainium@gmail.com",
        MAIL_PASS: "YW5kcm9pZDIwMTY"
    }
}

module.exports = config;