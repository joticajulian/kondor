# Kondor - Koinos Wallet in your browser

Kondor is a browser extension to manage a wallet for the [Koinos Blockchain](https://koinos.io). It based on the [koilib](https://github.com/joticajulian/koilib) library.

**_Kondor is currently in beta and may include bugs._**

## Info for users

You can install it as an extension for Chrome. Follow this link:
https://chrome.google.com/webstore/detail/kondor/ghipkefkpgkladckmlmdnadmcchefhjl

## Web Developers

In the `3rdpage` folder there is an example page to interact with kondor. It shows 2 main functionalities:

- Get accounts: Request the user address.
- Request signature: Request a signature and send the transaction. The example shows the process to make a transfer.

This html requires 2 scripts:

- `koinos.min.js`: Library provided by koilib.
- `kondorIndex.js`: Library to interact with Kondor.

To install these dependencies run (in future releases we will create a package in npm for kondor):

```
yarn install
yarn build:3rdpage
```

To serve the webpage run:

```
node ./server.js
```

The page will be available in http://localhost:8081/3rdpage.html

## Extension Developers

Kondor wallet has been created using Vue Framework. It can be tested in 2 ways:

1. As a single-page application in a web page. As it is developed in Vue you can take advantage of the hot reloads for fast iteration. With this option the local storage is not tested, and instead of that it is bypassed by data written in memory.
2. As browser extension (recommended). This option doesn't have the hot reloads offered by Vue but you can test it as extension with all features.

Setup the project by installing dependencies:

```
yarn install
```

### Run as Single-Page Application

When testing in localhost we need a proxy server to avoid the issues with cors. Start the server that adds the corresponding headers:

```
node ./server.js
```

The server will start in http://localhost:8081

Open the `.env` file and set `VUE_APP_ENV=test`. This variable will skip the access to the local storage in the extension and instead of that will save this data in memory.

**_Note: When using the test environment, the wallet password is `a`_**

Build typescript files:

```
yarn build:ts
```

Start the application:

```
yarn serve
```

or

```
npm run serve
```

The application will be available in http://localhost:8080

Useful links:

- Popup to sign transactions: http://localhost:8080/popup.html#/sendTransaction

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

## Acknowledgments

Many thanks to the sponsors of this extension: @levineam, @Amikob, @motoeng, @isaacdozier, @imjwalker, and the private sponsors.

If you would like to contribute to the development of this extension consider becoming a sponsor in https://github.com/sponsors/joticajulian.
