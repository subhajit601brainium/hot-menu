var config = {
    port: 3480,
    serverhost: 'http://localhost',
    restaurantSearchDistance: 10000,
    environment: 'development', //development,staging,live
    secretKey: 'hyrgqwjdfbw4534efqrwer2q38945765',
    adminUrl: 'http://localhost:4200/#/',
    loginOtp: '000000',
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
    },
    emailTemplete: {
        logoUrl: "https://logo.com/",
        appUrl: "https://app.com/",
        helpUrl: "https://help.com/",
        facebookUrl: "https://facebook.com/",
        twitterUrl: "https://twitter.com/Cargorsbv",
        instagramUrl: "https://instagram.com/",
        snapchatUrl: "https://snapchat.com/",
        linkedinUrl: "https://www.linkedin.com/company/Cargors",
        youtubeUrl: "https://www.youtube.com/channel/UC5UdfPRBUmOyrdiw9afne_w",
        loginUrl: "https://login.com/",
        androidUrl: "https://android.com/",
        iosUrl: "https://ios.com/",
    }
}

module.exports = config;