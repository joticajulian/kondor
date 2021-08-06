const abiCallContractOperation = {
  name: "koinos::protocol::call_contract_operation",
  type: [
    {
      name: "contract_id",
      type: "fixedblob",
      size: 20,
    },
    {
      name: "entry_point",
      type: "uint32",
    },
    {
      name: "args",
      type: "variableblob",
    },
    {
      name: "extensions",
      type: "unused_extension",
    },
  ],
};

const abiActiveData = {
  name: "opaque_active_data",
  type: "opaque",
  subAbi: {
    name: "active_data",
    type: [
      {
        name: "resource_limit",
        type: "uint128",
      },
      {
        name: "nonce",
        type: "uint64",
      },
      {
        name: "operations",
        type: "vector",
        subAbi: {
          name: "operation",
          type: "variant",
          variants: [
            { type: "not implemented" /* reserved operation */ },
            { type: "not implemented" /* nop operation */ },
            { type: "not implemented" /* upload contract operation */ },
            abiCallContractOperation,
            { type: "not implemented" /* set system call operation*/ },
          ],
        },
      },
    ],
  },
};

const paramsKoinContract = {
  id: "Mkw96mR+Hh71IWwJoT/2lJXBDl5Q=",
  entries: {
    name: {
      id: 0x76ea4297,
    },
    symbol: {
      id: 0x7e794b24,
    },
    decimals: {
      id: 0x59dc15ce,
    },
    total_supply: {
      id: 0xcf2e8212,
    },
    balance_of: {
      id: 0x15619248,
      args: { type: "string" },
    },
    transfer: {
      id: 0x62efa292,
      args: {
        type: [
          {
            name: "from",
            type: "string",
          },
          {
            name: "to",
            type: "string",
          },
          {
            name: "value",
            type: "uint64",
          },
        ],
      },
    },
    mint: {
      id: 0xc2f82bdc,
      args: [
        {
          name: "to",
          type: "string",
        },
        {
          name: "value",
          type: "uint64",
        },
      ],
    },
  },
};
