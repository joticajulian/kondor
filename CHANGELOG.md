# Changelog

All notable changes to this project will be documented in this file. 🤘

## [v0.7.1](https://github.com/joticajulian/kondor/releases/tag/v0.7.1) (2023-04-02)

### 🐛 Bug Fixes

- Fix backward compatibility in provider.getHeadInfo provider.getChainId for kondor <= 0.3.4

## [v0.7.0](https://github.com/joticajulian/kondor/releases/tag/v0.7.0) (2023-04-01)

### 🚀 Features

- Better UX in the popup to sign transactions:
  - Decode operations.
  - Messages in red when something is wrong with the decodification.
  - "advanced" button to see/update headers and modify signatures.
  - two steps of submission: Broadcast false to check events and final submission.
  - Decodification of events.
  - Display which addresses from the wallet are affected.
  - Show mana consumption.
  - Improvements in some important ABIs
- Session opened to not have to enter the password again.
- Button to lock and close the session.
- Button to copy wallet address.
- Dropdown to switch between mainnet and testnet.
- Import account with custom private keys.
- Add account in watching mode.
- Popup to sign messages.
- Internal refactor of the storage.
- KOIN balance in USD (using the api form MEXC).

### 🐛 Bug Fixes

- Remaining time to recharge mana fixed.