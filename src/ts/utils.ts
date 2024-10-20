import {
  Contract,
  Provider,
  Transaction,
  TransactionHeaderJson,
  TransactionReceipt,
  utils,
} from "koilib";

interface AvailableManaResponse {
  current: number;
  reserved: number;
  balance: number;
  availableBalance: number;
  transferDetected: boolean;
  recommendedManaOffset: number;
}

export function toUint8Array(hexString: string): Uint8Array {
  return new Uint8Array(
    hexString
      .match(/[\dA-F]{2}/gi)! // separate into pairs
      .map((s) => parseInt(s, 16)) // convert to integers
  );
}

export function toHexString(buffer: Uint8Array): string {
  return Array.from(buffer)
    .map((n) => `0${Number(n).toString(16)}`.slice(-2))
    .join("");
}

export function deltaTimeToString(milliseconds: number): string {
  if (Number.isNaN(milliseconds)) return "(error)";

  var seconds = Math.floor(milliseconds / 1000);

  var interval = seconds / 86400;
  if (interval > 2) return Math.floor(interval) + " days";

  interval = seconds / 3600;
  if (interval > 2) return Math.floor(interval) + " hours";

  interval = seconds / 60;
  if (interval > 2) return Math.floor(interval) + " minutes";

  interval = Math.floor(seconds);
  return interval + " seconds";
}

export function formatTime(
  rcLimit: number,
  availableMana: {
    current: number;
    reserved: number;
    balance: number;
    availableBalance: number;
  }
): string {
  const FIVE_DAYS = 432e6; // 5 * 24 * 60 * 60 * 1000
  const THREE_MINUTES = 180_000;
  const { current, reserved, balance, availableBalance } = availableMana;
  if (availableBalance < rcLimit) return "no balance";

  let deltaTime = ((rcLimit - current) * FIVE_DAYS) / balance;
  if (reserved > 0 && deltaTime < THREE_MINUTES) {
    deltaTime = THREE_MINUTES;
    if (rcLimit < balance - reserved) {
      const deltaTime2 = ((rcLimit - current + reserved) * FIVE_DAYS) / balance;
      if (deltaTime2 < deltaTime) deltaTime = deltaTime2;
    }
  }
  return deltaTimeToString(deltaTime);
}

export async function getReservedAccountRc(
  account: string,
  provider: Provider
): Promise<number> {
  let reserved = 0;
  try {
    const res = await provider.call<{ rc: string }>(
      "mempool.get_reserved_account_rc",
      { account }
    );
    if (res && res.rc) reserved = Number(res.rc);
  } catch {
    // empty
  }
  return reserved;
}

export async function getAvailableManaFreeManaSharer(opts: {
  freeManaSharer: Contract;
  provider: Provider;
}) {
  const { freeManaSharer, provider } = opts;
  const { result } = await freeManaSharer.functions.get_status();
  return result
    ? {
        current: Number(result.available_mana || 0),
        reserved: await getReservedAccountRc(freeManaSharer.getId(), provider),
        balance: Number(result.koin_balance || 0),
        availableBalance: Number(result.available_balance || 0),
        recommendedManaOffset: Number(result.recommended_mana_offset || 0),
        transferDetected: false,
      }
    : {
        current: 0,
        reserved: 0,
        balance: 0,
        availableBalance: 0,
        recommendedManaOffset: 0,
        transferDetected: false,
      };
}

export async function getAvailableMana(
  account: string,
  opts: {
    receipt?: TransactionReceipt;
    provider: Provider;
    koinContract: Contract;
  }
) {
  const { receipt, provider, koinContract } = opts;
  // current mana
  let current = Number(await provider.getAccountRc(account));

  // mana reserved in the mempool (pending state)
  const reserved = await getReservedAccountRc(account, provider);

  // koin balance (mana recharged at 100%)
  const { result } = await koinContract.functions.balanceOf({
    owner: account,
  });
  let balance = result && result.value ? Number(result.value) : 0;

  // check koin transfers in receipt, and deduct that value
  let transferDetected = false;
  if (receipt && receipt.events) {
    await Promise.all(
      receipt.events.map(async (event) => {
        if (
          event.source !== koinContract.getId() ||
          !event.name.includes("transfer_event")
        )
          return;
        if (!event.impacted || event.impacted[1] !== account) return;
        const decoded = await koinContract.decodeEvent(event);
        if (
          decoded.args.from !== account ||
          decoded.args.from === decoded.args.to
        )
          return;
        // the account will do a koin transfer, then reduce
        // the balance and current mana
        const amount = Number(decoded.args.value);
        current -= amount;
        balance -= amount;
        transferDetected = true;
      })
    );
  }
  const availableBalance = balance;

  return {
    current,
    reserved,
    balance,
    availableBalance,
    transferDetected,
    recommendedManaOffset: 0,
  };
}

export async function estimateAndAdjustMana(args: {
  payer: string;
  payee: string;
  transaction: Transaction;
  provider: Provider;
  koinContract: Contract;
  freeManaSharer: Contract;
}): Promise<{
  receipt: TransactionReceipt;
  header: TransactionHeaderJson;
  id: string;
}> {
  const {
    transaction,
    payee: initialPayee,
    payer: initialPayer,
    provider,
    koinContract,
    freeManaSharer,
  } = args;
  let receipt: TransactionReceipt;
  if (!transaction.transaction.header)
    throw new Error("transaction header not defined");
  const header = JSON.parse(
    JSON.stringify(transaction.transaction.header)
  ) as TransactionHeaderJson;
  console.log("mana estimation initialized");

  try {
    receipt = await transaction.send({ broadcast: false });
    if (!receipt) throw new Error("no receipt received from the rpc node");
    if (receipt.rpc_error) {
      console.log(receipt.rpc_error);
      throw new Error(
        [
          "timeout from the rpc. Not possible to estimate the consumption of mana.",
          "Probably because the transaction has many computations.",
          "As an alternative you can try to submit the transaction without",
          "checking events.",
        ].join(" ")
      );
    }
  } catch (error) {
    let errorJson;
    try {
      errorJson = JSON.parse((error as Error).message);
    } catch {
      throw error;
    }
    if (!errorJson.error) throw error;
    if (errorJson.error.includes("compute bandwidth limit exceeded")) {
      console.log(error);
      throw new Error("Too many computations inside the transaction");
    }
    if (errorJson.error.includes("network bandwidth limit exceeded")) {
      console.log(error);
      throw new Error("The transaction is too large");
    }
    if (errorJson.error.includes("disk storage limit exceeded")) {
      console.log(error);
      throw new Error("Too many read/writes in the storage");
    }
    console.log(error);
    throw new Error(errorJson.error);
  }
  console.log(`rc_used: ${receipt.rc_used}`);

  let rcLimit = Math.floor(1.1 * Number(receipt.rc_used));
  console.log(`adding 10% extra: rc_limit = ${rcLimit}`);

  let availableMana1: AvailableManaResponse;
  if (initialPayer === freeManaSharer.getId()) {
    console.log("the payer is already the free mana sharer");
    availableMana1 = await getAvailableManaFreeManaSharer({
      freeManaSharer,
      provider,
    });
    rcLimit += availableMana1.recommendedManaOffset;
    console.log(
      `adding recommended offset for free mana sharer. rc_limit = ${rcLimit}`
    );
  } else {
    availableMana1 = await getAvailableMana(initialPayer, {
      provider,
      koinContract,
      receipt,
    });
    console.log(`available mana for payer ${initialPayer}:`);
    console.log(availableMana1);
  }

  if (availableMana1.current - availableMana1.reserved < rcLimit) {
    if (initialPayer === freeManaSharer.getId()) {
      throw new Error(
        [
          `Free mana service is congested. Try again in ${formatTime(
            rcLimit,
            availableMana1
          )}`,
        ].join(" ")
      );
    }
    console.log(
      `payer ${initialPayer} does not have enough mana. Checking the free mana sharer`
    );

    // check if the free mana sharer can pay the transaction
    const availableManaFreeManaSharer = await getAvailableManaFreeManaSharer({
      freeManaSharer,
      provider,
    });
    console.log("available mana for free mana sharer");
    console.log(availableManaFreeManaSharer);

    const rcLimitFreeMana =
      rcLimit + availableManaFreeManaSharer.recommendedManaOffset;
    if (
      availableManaFreeManaSharer.current -
        availableManaFreeManaSharer.reserved <
      rcLimitFreeMana
    ) {
      const timeFreeMana = formatTime(
        rcLimitFreeMana,
        availableManaFreeManaSharer
      );
      const messageFreeMana =
        timeFreeMana === "no balance"
          ? "The free mana service is unavailable due to lack of funds."
          : `Or try again in ${timeFreeMana} to see if the free mana service is available.`;
      if (availableMana1.balance < rcLimit) {
        throw new Error(
          [
            `you ${
              availableMana1.transferDetected ? "must keep" : "need"
            } at least ${utils.formatUnits(rcLimit, 8)} KOIN in your balance.`,
            messageFreeMana,
          ].join(" ")
        );
      }

      throw new Error(
        [
          `you need at least ${utils.formatUnits(
            rcLimit,
            8
          )} liquid KOIN in your balance.`,
          `Wait ${formatTime(
            rcLimit,
            availableMana1
          )} until it recharges and try again.`,
          messageFreeMana,
        ].join(" ")
      );
    }
    header.payee = initialPayee || initialPayer;
    header.payer = freeManaSharer.getId();
    rcLimit = rcLimitFreeMana;
  } else {
    header.payee = initialPayee;
    header.payer = initialPayer;
  }
  header.rc_limit = rcLimit;
  const id = Transaction.computeTransactionId(header);
  return { receipt, header, id };
}
