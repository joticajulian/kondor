/* eslint-disable no-undef */
const TOKEN_LIST_URL = "https://raw.githubusercontent.com/koindx/token-list/refs/heads/main/src/tokens/mainnet.json";
const PRICE_API_BASE_URL = "https://koinoscollective.org/api/koindx/pair";
const CHAINGE_USDT_ADDRESS = "14MjxccMUZrtBPXnNkuAC5MLtPev2Zsk3N";
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
    console.error(`Failed to fetch price for ${baseAddress}/${quoteAddress}:`, error);
    throw error;
  }
}

export async function fetchTokenPrices() {
  let result = { tokens: [], errors: [] };

  try {
    // Try to get cached prices first
    const cachedPrices = await getCachedPrices();
    if (cachedPrices) {
      console.log("Returning cached prices");
      return cachedPrices;
    }

    console.log("Fetching fresh prices");
    // Fetch token list and KOIN/USDT price in parallel
    const [tokens, koinUsdtPrice] = await Promise.all([
      fetchTokenList(),
      fetchPrice(KOIN_ADDRESS, CHAINGE_USDT_ADDRESS)
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
            priceInUsdt = priceInKoin !== null ? priceInKoin * koinUsdtPrice : null;
          }
          return {
            name: token.name,
            symbol: token.symbol,
            price: priceInUsdt !== null ? priceInUsdt : "N/A",
          };
        } catch (error) {
          result.errors.push(`Error processing ${token.symbol}: ${error.message}`);
          return null;
        }
      }
      return null;
    });

    // Wait for all price fetches to complete
    const tokenResults = await Promise.all(pricePromises);
    result.tokens = tokenResults.filter(token => token !== null);

    // After successfully fetching new prices, cache them
    if (result.tokens.length > 0) {
      await cacheTokenPrices(result);
    }

  } catch (error) {
    console.error("Error in fetchTokenPrices:", error);
    result.errors.push(`Main error: ${error.message}`);
  }

  console.log("Returning fresh prices:", result);
  return result;
}

async function getCachedPrices() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      console.log("Retrieved from storage:", result);
      const cachedData = result[STORAGE_KEY];
      if (cachedData && Date.now() - cachedData.timestamp < PRICE_EXPIRY_TIME) {
        console.log("Using cached prices:", cachedData.data);
        resolve(cachedData.data);
      } else {
        console.log("No valid cached prices found");
        resolve(null);
      }
    });
  });
}

async function cacheTokenPrices(data) {
  return new Promise((resolve) => {
    const cacheData = {
      timestamp: Date.now(),
      data: data
    };
    chrome.storage.local.set({ [STORAGE_KEY]: cacheData }, () => {
      if (chrome.runtime.lastError) {
        console.error("Error caching prices:", chrome.runtime.lastError);
      } else {
        console.log("Prices cached successfully:", cacheData);
      }
      resolve();
    });
  });
}

const STORAGE_KEY = 'latestTokenPrices';
const PRICE_EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
