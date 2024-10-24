const TOKEN_LIST_URL = "https://raw.githubusercontent.com/koindx/token-list/refs/heads/main/src/tokens/mainnet.json";
const PRICE_API_BASE_URL = "https://koinoscollective.org/api/koindx/pair";
const CHAINGE_USDT_ADDRESS = "14MjxccMUZrtBPXnNkuAC5MLtPev2Zsk3N";
const KOIN_ADDRESS = "koin";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
    const tokens = await fetchTokenList();
    result.tokenCount = tokens.length;

    const koinUsdtPrice = await fetchPrice(KOIN_ADDRESS, CHAINGE_USDT_ADDRESS);
    if (koinUsdtPrice === null) {
      throw new Error("Failed to fetch KOIN/USDT price");
    }
    result.koinUsdtPrice = koinUsdtPrice;

    for (const token of tokens) {
      if (token && token.address) {
        try {
          let priceInUsdt;
          if (token.address === KOIN_ADDRESS) {
            priceInUsdt = koinUsdtPrice;
          } else {
            const priceInKoin = await fetchPrice(token.address, KOIN_ADDRESS);
            priceInUsdt = priceInKoin !== null ? priceInKoin * koinUsdtPrice : null;
          }
          result.tokens.push({
            name: token.name,
            symbol: token.symbol,
            price: priceInUsdt !== null ? priceInUsdt : "N/A",
          });
        } catch (error) {
          result.errors.push(`Error processing ${token.symbol}: ${error.message}`);
        }
        await delay(100); // Add a delay of 1 second between API calls
      }
    }
  } catch (error) {
    result.errors.push(`Main error: ${error.message}`);
  }

  return result;
}

