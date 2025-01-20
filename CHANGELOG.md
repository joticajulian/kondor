# Changelog

All notable changes to this project will be documented in this file. 🤘

## [v1.2.3](https://github.com/joticajulian/kondor/releases/tag/v1.2.3) (2025-01-20)

### 🐛 Bug Fixes

- Fix function to recover addresses when transactions are presigned.

## [v1.2.2](https://github.com/joticajulian/kondor/releases/tag/v1.2.2) (2025-01-15)

### 🚀 Features

- We restored the option to import a token by its address.
- The process to confirm transactions has been improved. Now the loop checks if the transaction was mined instead of searching the transaction in the blocks.

### 🐛 Bug Fixes

- Avoid the computation of mana optimization if the transaction is already signed. For instance, when creating a new pool in KoinDX.

## [v1.2.1](https://github.com/joticajulian/kondor/releases/tag/v1.2.1) (2024-12-22)

### 🐛 Bug Fixes

- Fix issue with tokens with 0 decimals.

## [v1.2.0](https://github.com/joticajulian/kondor/releases/tag/v1.2.0) (2024-10-31)

### 🚀 Features

- Fetch prices for all tokens from KoinDX.

### 🐛 Bug Fixes

- Fix links for NFTs using images hosted in IPFS.
- The popup to select accounts will auto select the first one only if the user has 1 account. Otherwise nothing is selected by default

## [v1.1.0](https://github.com/joticajulian/kondor/releases/tag/v1.1.0) (2024-10-20)

### 🚀 Features

- Option to set allowances in the popup to sign transactions.

### 🐛 Bug Fixes

- Fix for the [bug #843 of koinos chain](https://github.com/koinos/koinos-chain/issues/843): After the estimation of mana it's still necessary to recalculate it. Then this version adds minor increasements of mana (1 mana) in a for loop until the rc limit is ok for the blockchain.
- Fix account history: Previous version was reporting some wrong events.
- Fix get accounts: The option to select multiple accounts is restored back.
- Fix mana optimization taking into account the new event names of Koin Contract.

## [v1.0.0](https://github.com/joticajulian/kondor/releases/tag/v1.0.0) (2024-10-12)

### 🚀 Features

- New improved UI.
- Add tokens by selecting them from a dropdown menu.
- Load NFTs by querying the Kollection's API.
- Load the account history: Recent token transfers.
- Updates in the popup to sign transactions:
  - Load the image of contracts by looking the nickname metadata.
  - Simplification of the information displayed: It contains a summary of operations and events and the user can click on each of them to see the details.
  - When the details of operations/events contains token amounts they are formatted with decimals and symbol.
  - The events are filtered: Only the ones related to user tokens are visible. The rest are collapsed with the possibility to expand all of them.
  - The events are triggered automatically.

## [v0.11.1](https://github.com/joticajulian/kondor/releases/tag/v0.11.1) (2024-07-13)

### 🐛 Bug Fixes

- Fix duplication of mini tokens in the dashboard

## [v0.11.0](https://github.com/joticajulian/kondor/releases/tag/v0.11.0) (2024-06-29)

### 🚀 Features

- Tokens based on nicknames now will have the "no permanent" flag if the token address
  can be changed at any time by the project owner. This is to alert users and prevent
  possible scams. There is also a link to more information.

## [v0.10.1](https://github.com/joticajulian/kondor/releases/tag/v0.10.1) (2024-05-24)

### 🚀 Features

- Support memo in transfers

### 🐛 Bug Fixes

- Disable changes in headers when the transaction comes pre-signed because the signature cannot be reproduced again after a change. At the same time all advanced options will be disabled.

## [v0.10.0](https://github.com/joticajulian/kondor/releases/tag/v0.10.0) (2024-05-17)

### 🚀 Features

- Mana is estimated before broadcasting and adjusted automatically
- It als takes into account the transfers in the events to adjust the mana
- Show Liquid KOIN
- Error messages improved
- The mana orb shows 2 colors: available mana and reserved mana (in mempool)
- Introduction of the new kondor logo
- It uses a new free mana sharer that is funded by the community
- Cache abis and nicknames to improve performance

## [v0.9.1](https://github.com/joticajulian/kondor/releases/tag/v0.9.1) (2023-11-24)

### 🐛 Bug Fixes

- Fix tokens without decimals

## [v0.9.0](https://github.com/joticajulian/kondor/releases/tag/v0.9.0) (2023-11-24)

### 🚀 Features

- Now Kondor supports tokens, they can be added by entering the nickname
- This version allows you to update the name of your accounts

## [v0.8.4](https://github.com/joticajulian/kondor/releases/tag/v0.8.3) (2023-10-30)

### 🐛 Bug Fixes

- Update ABI of Nicknames

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
