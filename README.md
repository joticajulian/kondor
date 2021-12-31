# Kondor - Koinos Wallet in your browser

Kondor is a browser extension to manage a wallet for Koinos Blockchain (testnet). It based on [koilib](https://github.com/joticajulian/koilib) library. It is currently in beta and includes bugs.

## Info for users

You can install it as an extension for Chrome. Follow this link:
https://chrome.google.com/webstore/detail/kondor/ghipkefkpgkladckmlmdnadmcchefhjl

## Developers

The wallet has been created using Vue Framework. It can be tested in 2 ways:

1. As a single-page application in a web page (recommended). As it is developed in Vue you can take advantage of the hot reloads for fast iteration. With this option the local storage is not tested, and instead of that it is bypassed by data written in memory.
2. As browser extension. This option doesn't have the hot reloads offered by Vue but you can test it as extension with all features.

### Run as Single-Page Application

When testing in localhost we need a proxy server to avoid the issues with cors. Start the server that adds the corresponding headers:

```
node ./server.js
```

The server will start in http://localhost:8081

Open the `.env` file and set `VUE_APP_ENV=test`. This variable will skip the access to the local storage in the extension and instead of that will save this data in memory.

Start the application:

```
yarn serve
```

or

```
npm run serve
```

The application will be available in http://localhost:8080

### Run as browser extension

Open the `.env` file and set `VUE_APP_ENV=extension` to enable the access to the local storage for extensions. Build the application

```
yarn build
```

or

```
npm run build
```

The compiled application will be located in the folder `dist`. Open chrome and go to `chrome://extensions/`. Make sure the `developer mode` is enabled. Click on `Load unpacked` and select the folder `dist` with the application. The extension should be ready to be tested.

#### NOTE

The Koinos Blockchain is currenlty available only as a test network and is prone to bugs and crashes, tKOIN has absolutely no value. To learn more about Koinos visit their website at [koinos.io](https://koinos.io)
