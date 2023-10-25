# Changelog

All notable changes to this project will be documented in this file. 🤘

## [v0.8.3](https://github.com/joticajulian/kondor/releases/tag/v0.8.3) (2023-10-26)

### 🐛 Bug Fixes

- Fix bug trap when checking nicknames

## [v0.8.2](https://github.com/joticajulian/kondor/releases/tag/v0.8.2) (2023-10-22)

### 🚀 Features

- Support Nicknames in mainnet and harbinger

## [v0.8.1](https://github.com/joticajulian/kondor/releases/tag/v0.8.1) (2023-08-06)

### 🚀 Features

- Free mana option in the built-in transfer function and in the popup to sign transactions
- Remember last account selected to load it next time kondor opens

### 🐛 Bug Fixes

- The button to transfer is not disabled anymore

## [v0.8.0](https://github.com/joticajulian/kondor/releases/tag/v0.8.0) (2023-07-17)

### 🚀 Features

- KAP integration
- CSS improvements
- Links to block explorers, MEXC exchange, KAP profile and Kollection
- Send tokens in a dedicated page
- Improvements in seed confirmation: remove selected words
- Update chain id and contracts of new harbinger

## [v0.7.4](https://github.com/joticajulian/kondor/releases/tag/v0.7.1) (2023-05-11)

### 🐛 Bug Fixes

- 10 MANA limit in transfers
- wait 60 seconds for a transaction to be mined

## [v0.7.3](https://github.com/joticajulian/kondor/releases/tag/v0.7.3) (2023-05-08)

### 🐛 Bug Fixes

- Fix bug in transfers by upgrading to koilib v5.5.6

## [v0.7.2](https://github.com/joticajulian/kondor/releases/tag/v0.7.2) (2023-04-19)

### 🚀 Features

- Message in the popup to sign to warn the user to interact with trusted contracts

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
