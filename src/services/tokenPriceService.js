/* eslint-disable no-undef */
import store from "../shared/store";
import {
  CHAINGE_USDT_ADDRESS,
  TOKEN_LIST_URL,
  PRICE_API_BASE_URL,
} from "../../lib/storage.js";

const KOIN_ADDRESS = "koin";

async function fetchTokenList() {
  try {
    console.log("Fetching token list...");
    const response = await fetch(TOKEN_LIST_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data && Array.isArray(data.tokens)) {
      return data.tokens;
    } else {
      throw new Error("Unexpected token list format");
    }
  } catch (error) {
    console.error("Failed to fetch token list:", error);
    throw error;
  }
}

async function fetchPrice(baseAddress, quoteAddress) {
  console.log(`Fetching price for ${baseAddress}/${quoteAddress}...`);
  const url = `${PRICE_API_BASE_URL}/${baseAddress}/${quoteAddress}/get_quote/1`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 404) {
        return null; // No trading pair available
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    if (data && data.amount_a && data.amount_b) {
      return parseFloat(data.amount_b) / parseFloat(data.amount_a);
    } else {
      throw new Error("Unexpected price response format");
    }
  } catch (error) {
    console.error(
      `Failed to fetch price for ${baseAddress}/${quoteAddress}:`,
      error
    );
    throw error;
  }
}

const STORAGE_KEY_PREFIX = "latestTokenPrices_";

async function getCachedPrices(accountAddress) {
  return new Promise((resolve) => {
    const storageKey = STORAGE_KEY_PREFIX + accountAddress;
    chrome.storage.local.get([storageKey], (result) => {
      console.log(
        "Retrieved from storage for account:",
        accountAddress,
        result
      );
      const cachedData = result[storageKey];
      if (cachedData && Date.now() - cachedData.timestamp < PRICE_EXPIRY_TIME) {
        console.log(
          "Using cached prices for account:",
          accountAddress,
          cachedData.data
        );
        resolve(cachedData.data);
      } else {
        console.log(
          "No valid cached prices found for account:",
          accountAddress
        );
        resolve(null);
      }
    });
  });
}

async function cacheTokenPrices(data, accountAddress) {
  return new Promise((resolve) => {
    const storageKey = STORAGE_KEY_PREFIX + accountAddress;
    const cacheData = {
      timestamp: Date.now(),
      data: data,
    };
    chrome.storage.local.set({ [storageKey]: cacheData }, () => {
      if (chrome.runtime.lastError) {
        console.error(
          "Error caching prices for account:",
          accountAddress,
          chrome.runtime.lastError
        );
      } else {
        console.log(
          "Prices cached successfully for account:",
          accountAddress,
          cacheData
        );
      }
      resolve();
    });
  });
}

export async function fetchTokenPrices(accountAddress) {
  if (store.state.currentNetwork === 1) {
    return {
      tokens: [],
      errors: ["Price fetching is disabled on testnet"],
      tokenCount: 0,
    };
  }

  let result = { tokens: [], errors: [] };

  try {
    const cachedPrices = await getCachedPrices(accountAddress);
    if (cachedPrices) {
      return cachedPrices;
    }

    console.log("Fetching fresh prices");
    // Fetch token list and KOIN/USDT price in parallel
    const [tokens, koinUsdtPrice] = await Promise.all([
      fetchTokenList(),
      fetchPrice(KOIN_ADDRESS, CHAINGE_USDT_ADDRESS),
    ]);

    if (koinUsdtPrice === null) {
      throw new Error("Failed to fetch KOIN/USDT price");
    }

    result.tokenCount = tokens.length;
    result.koinUsdtPrice = koinUsdtPrice;

    // Fetch prices for all tokens in parallel
    const pricePromises = tokens.map(async (token) => {
      if (token && token.address) {
        try {
          let priceInUsdt;
          if (token.address === KOIN_ADDRESS) {
            priceInUsdt = koinUsdtPrice;
          } else {
            const priceInKoin = await fetchPrice(token.address, KOIN_ADDRESS);
            priceInUsdt =
              priceInKoin !== null ? priceInKoin * koinUsdtPrice : null;
          }
          return {
            name: token.name,
            symbol: token.symbol,
            price: priceInUsdt !== null ? priceInUsdt : "N/A",
          };
        } catch (error) {
          result.errors.push(
            `Error processing ${token.symbol}: ${error.message}`
          );
          return null;
        }
      }
      return null;
    });

    // Wait for all price fetches to complete
    const tokenResults = await Promise.all(pricePromises);
    result.tokens = tokenResults.filter((token) => token !== null);

    // After successfully fetching new prices, cache them
    if (result.tokens.length > 0) {
      await cacheTokenPrices(result, accountAddress);
    }
  } catch (error) {
    console.error("Error in fetchTokenPrices:", error);
    result.errors.push(`Main error: ${error.message}`);
  }

  console.log("Returning fresh prices:", result);
  return result;
}

const PRICE_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
