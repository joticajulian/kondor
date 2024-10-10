export const testRequests = [
  {
    id: "270815b4-8c3e-4b53-b9ac-82ba3854c206",
    command: "signer:signTransaction",
    args: {
      signerAddress: "17Gp6JfuPjFMAzdNMGNbyFDCYS6zN428aW",
      transaction: {
        operations: [
          {
            call_contract: {
              args: "ChkARM5N2YfZUX1Go4HMs9lxNxlKNTc0Tu7LEhkARM5N2YfZUX1Go4HMs9lxNxlKNTc0Tu7LGAo=",
              contract_id: "19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ",
              entry_point: 670398154,
            },
          },
          {
            call_contract: {
              args: "ChkARM5N2YfZUX1Go4HMs9lxNxlKNTc0Tu7LEhkARM5N2YfZUX1Go4HMs9lxNxlKNTc0Tu7LGAo=",
              contract_id: "19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ",
              entry_point: 6703981540,
            },
          },
          {
            upload_contract: {
              contract_id: "19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ",
              bytecode:
                "TG9yZW0gaXBzdW0gZG9sb3Igc2l0IGFtZXQgY29uc2VjdGV0dXIgYWRpcGlzaWNpbmcgZWxpdC4gTWF4aW1lIG1vbGxpdGlhLAptb2xlc3RpYWUgcXVhcyB2ZWwgc2ludCBjb21tb2RpIHJlcHVkaWFuZGFlIGNvbnNlcXV1bnR1ciB2b2x1cHRhdHVtIGxhYm9ydW0KbnVtcXVhbSBibGFuZGl0aWlzIGhhcnVtIHF1aXNxdWFtIGVpdXMgc2VkIG9kaXQgZnVnaWF0IGl1c3RvIGZ1Z2EgcHJhZXNlbnRpdW0Kb3B0aW8sIGVhcXVlIHJlcnVtISBQcm92aWRlbnQgc2ltaWxpcXVlIGFjY3VzYW50aXVtIG5lbW8gYXV0ZW0uIFZlcml0YXRpcwpvYmNhZWNhdGkgdGVuZXR1ciBpdXJlIGVpdXMgZWFydW0gdXQgbW9sZXN0aWFzIGFyY2hpdGVjdG8gdm9sdXB0YXRlIGFsaXF1YW0KbmloaWwsIGV2ZW5pZXQgYWxpcXVpZCBjdWxwYSBvZmZpY2lhIGF1dCEgSW1wZWRpdCBzaXQgc3VudCBxdWFlcmF0LCBvZGl0LAp0ZW5ldHVyIGVycm9yLCBoYXJ1bSBuZXNjaXVudCBpcHN1bSBkZWJpdGlzIHF1YXMgYWxpcXVpZC4gUmVwcmVoZW5kZXJpdCwKcXVpYS4gUXVvIG5lcXVlIGVycm9yIHJlcHVkaWFuZGFlIGZ1Z2E_IElwc2EgbGF1ZGFudGl1bSBtb2xlc3RpYXMgZW9zIApzYXBpZW50ZSBvZmZpY2lpcyBtb2RpIGF0IHN1bnQgZXhjZXB0dXJpIGV4cGVkaXRhIHNpbnQ_IFNlZCBxdWlidXNkYW0KcmVjdXNhbmRhZSBhbGlhcyBlcnJvciBoYXJ1bSBtYXhpbWUgYWRpcGlzY2kgYW1ldCBsYWJvcnVtLiBQZXJzcGljaWF0",
              abi: "{}",
              authorizes_call_contract: true,
              authorizes_transaction_application: true,
              authorizes_upload_contract: false,
            },
          },
        ],
        header: {
          // chain_id: "EiBncD4pKRIQWco_WRqo5Q-xnXR7JuO3PtZv983mKdKHSQ==",
          chain_id: "EiBZK_GGVP0H_fXVAM3j6EAuz3-B-l3ejxRSewi7qIBfSA==",
          rc_limit: "0",
          nonce: "KAE=",
          operation_merkle_root:
            "EiBCeHF0tLBk6Dq0yIrlZ2Z9CzO4tv5FsYv868D6fjHeAg==",
          payer: "17Gp6JfuPjFMAzdNMGNbyFDCYS6zN428aW",
        },
        signatures: [
          "IEUp4G5lT_6kuCvCKEvq20ZvBZoiJd-U3vs4MdZ8u7XgKDm4X7gmyUugp8ggt0lX1hjvA3KJYVRfV63FWnko35A=",
        ],
        id: "0x1220d66c608bf375cdd310f021fc61d2c084f7bcc52734a688dfd302dce2daa6c2e3",
      },
      abis: {
        "19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ": {
          methods: {
            name: {
              argument: "koinos.contracts.token.name_arguments",
              return: "koinos.contracts.token.name_result",
              "entry-point": "0x82a3537f",
              description: "Returns the token name",
              "read-only": true,
              entry_point: 2191741823,
            },
            symbol: {
              argument: "koinos.contracts.token.symbol_arguments",
              return: "koinos.contracts.token.symbol_result",
              "entry-point": "0xb76a7ca1",
              description: "Returns the token symbol",
              "read-only": true,
              entry_point: 3077209249,
            },
            decimals: {
              argument: "koinos.contracts.token.decimals_arguments",
              return: "koinos.contracts.token.decimals_result",
              "entry-point": "0xee80fd2f",
              description: "Returns the token decimal precision",
              "read-only": true,
              entry_point: 4001430831,
            },
            total_supply: {
              argument: "koinos.contracts.token.total_supply_arguments",
              return: "koinos.contracts.token.total_supply_result",
              "entry-point": "0xb0da3934",
              description: "Returns the token total supply",
              "read-only": true,
              entry_point: 2967091508,
            },
            balance_of: {
              argument: "koinos.contracts.token.balance_of_arguments",
              return: "koinos.contracts.token.balance_of_result",
              "entry-point": "0x5c721497",
              description: "Checks the balance at an address",
              "read-only": true,
              entry_point: 1550980247,
            },
            transfer: {
              argument: "koinos.contracts.token.transfer_arguments",
              return: "koinos.contracts.token.transfer_result",
              "entry-point": "0x27f576ca",
              description: "Transfers the token",
              "read-only": false,
              entry_point: 670398154,
              format: {
                value: {
                  type: "number",
                  decimals: 8,
                  symbol: "KOIN",
                },
              },
            },
            mint: {
              argument: "koinos.contracts.token.mint_arguments",
              return: "koinos.contracts.token.mint_result",
              "entry-point": "0xdc6f17bb",
              description: "Mints the token",
              "read-only": false,
              entry_point: 3698268091,
            },
            burn: {
              argument: "koinos.contracts.token.burn_arguments",
              return: "koinos.contracts.token.burn_result",
              "entry-point": "0x859facc5",
              description: "Burns the token",
              "read-only": false,
              entry_point: 2241834181,
            },
          },
          events: {
            "koinos.contracts.token.transfer_event": {
              argument: "koinos.contracts.token.transfer_event",
              format: {
                value: {
                  type: "number",
                  decimals: 8,
                  symbol: "KOIN",
                },
              },
            },
          },
          koilib_types: {
            nested: {
              koinos: {
                nested: {
                  contracts: {
                    nested: {
                      token: {
                        nested: {
                          name_arguments: {
                            fields: {},
                          },
                          name_result: {
                            fields: {
                              value: {
                                type: "string",
                                id: 1,
                              },
                            },
                          },
                          symbol_arguments: {
                            fields: {},
                          },
                          symbol_result: {
                            fields: {
                              value: {
                                type: "string",
                                id: 1,
                              },
                            },
                          },
                          decimals_arguments: {
                            fields: {},
                          },
                          decimals_result: {
                            fields: {
                              value: {
                                type: "uint32",
                                id: 1,
                              },
                            },
                          },
                          total_supply_arguments: {
                            fields: {},
                          },
                          total_supply_result: {
                            fields: {
                              value: {
                                type: "uint64",
                                id: 1,
                                options: {
                                  jstype: "JS_STRING",
                                },
                              },
                            },
                          },
                          balance_of_arguments: {
                            fields: {
                              owner: {
                                type: "bytes",
                                id: 1,
                                options: {
                                  "(koinos.btype)": "ADDRESS",
                                },
                              },
                            },
                          },
                          balance_of_result: {
                            fields: {
                              value: {
                                type: "uint64",
                                id: 1,
                                options: {
                                  jstype: "JS_STRING",
                                },
                              },
                            },
                          },
                          transfer_arguments: {
                            fields: {
                              from: {
                                type: "bytes",
                                id: 1,
                                options: {
                                  "(koinos.btype)": "ADDRESS",
                                },
                              },
                              to: {
                                type: "bytes",
                                id: 2,
                                options: {
                                  "(koinos.btype)": "ADDRESS",
                                },
                              },
                              value: {
                                type: "uint64",
                                id: 3,
                                options: {
                                  jstype: "JS_STRING",
                                },
                              },
                            },
                          },
                          transfer_result: {
                            fields: {},
                          },
                          mint_arguments: {
                            fields: {
                              to: {
                                type: "bytes",
                                id: 1,
                                options: {
                                  "(koinos.btype)": "ADDRESS",
                                },
                              },
                              value: {
                                type: "uint64",
                                id: 2,
                                options: {
                                  jstype: "JS_STRING",
                                },
                              },
                            },
                          },
                          mint_result: {
                            fields: {},
                          },
                          burn_arguments: {
                            fields: {
                              from: {
                                type: "bytes",
                                id: 1,
                                options: {
                                  "(koinos.btype)": "ADDRESS",
                                },
                              },
                              value: {
                                type: "uint64",
                                id: 2,
                                options: {
                                  jstype: "JS_STRING",
                                },
                              },
                            },
                          },
                          burn_result: {
                            fields: {},
                          },
                          balance_object: {
                            fields: {
                              value: {
                                type: "uint64",
                                id: 1,
                                options: {
                                  jstype: "JS_STRING",
                                },
                              },
                            },
                          },
                          mana_balance_object: {
                            fields: {
                              balance: {
                                type: "uint64",
                                id: 1,
                                options: {
                                  jstype: "JS_STRING",
                                },
                              },
                              mana: {
                                type: "uint64",
                                id: 2,
                                options: {
                                  jstype: "JS_STRING",
                                },
                              },
                              last_mana_update: {
                                type: "uint64",
                                id: 3,
                                options: {
                                  jstype: "JS_STRING",
                                },
                              },
                            },
                          },
                          burn_event: {
                            fields: {
                              from: {
                                type: "bytes",
                                id: 1,
                                options: {
                                  "(koinos.btype)": "ADDRESS",
                                },
                              },
                              value: {
                                type: "uint64",
                                id: 2,
                                options: {
                                  jstype: "JS_STRING",
                                },
                              },
                            },
                          },
                          mint_event: {
                            fields: {
                              to: {
                                type: "bytes",
                                id: 1,
                                options: {
                                  "(koinos.btype)": "ADDRESS",
                                },
                              },
                              value: {
                                type: "uint64",
                                id: 2,
                                options: {
                                  jstype: "JS_STRING",
                                },
                              },
                            },
                          },
                          transfer_event: {
                            fields: {
                              from: {
                                type: "bytes",
                                id: 1,
                                options: {
                                  "(koinos.btype)": "ADDRESS",
                                },
                              },
                              to: {
                                type: "bytes",
                                id: 2,
                                options: {
                                  "(koinos.btype)": "ADDRESS",
                                },
                              },
                              value: {
                                type: "uint64",
                                id: 3,
                                options: {
                                  jstype: "JS_STRING",
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    sender: {
      id: "eghigpjkddlhegjaibgjlnfnkgdnmnlh",
      url: "https://koinosblocks.com/address/19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ",
      origin: "https://koinosblocks.com",
      frameId: 0,
      documentId: "F6D0BCBD9A19559A679F6714294A63A2",
      documentLifecycle: "active",
      tab: {
        active: true,
        audible: false,
        autoDiscardable: true,
        discarded: false,
        groupId: -1,
        height: 577,
        highlighted: true,
        id: 2018223012,
        incognito: false,
        index: 14,
        mutedInfo: {
          muted: false,
        },
        openerTabId: 2018223007,
        pinned: false,
        selected: true,
        status: "complete",
        title: "Koinosblocks.com - address details",
        url: "https://koinosblocks.com/address/19JntSm8pSNETT9aHTwAUHC5RMoaSmgZPJ",
        width: 1280,
        windowId: 2018222470,
      },
    },
  },
];

export const testReceipt = {
  id: "0x12205ae488d12db4175e1d3edc84ca52478b7546a2703428ba225972842638163adf",
  payer: "1KyZyhNwiDo6a93f3FvK8pxspKdgEtQDwa",
  max_payer_rc: "390300000000",
  rc_limit: "1000000000",
  rc_used: "229949398",
  network_bandwidth_used: "434",
  compute_bandwidth_used: "6299104",
  events: [
    {
      sequence: 2,
      source: "15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL",
      name: "koinos.contracts.token.transfer_event",
      data: "ChkAeagoO27eQJ2FBfvlnEOj3nFBBfTG-vj5EhkAkT5Qt9wWIlD7xatk_xlemqCkfX1Cio-jGLWCgwI=",
      impacted: [
        "1EEydZQc3hLhC45GZx524kjDAJXgvZRrAN",
        "1C6GCyapZA8RyYGLj4kjMQXKkuXf9TDLBA",
      ],
    },
    {
      sequence: 3,
      source: "1LntV8aVpngLCYLTZuHuuevvUZcBhVPegf",
      name: "token.transfer_event",
      data: "ChkAkT5Qt9wWIlD7xatk_xlemqCkfX1Cio-jEhkAhA3mGhNlMaVyZjiRdumx4O_zWa4syt7dGIKeDQ==",
      impacted: [
        "1D3Er2ifm8P5324QApb46orJPAWGSSfCkt",
        "1EEydZQc3hLhC45GZx524kjDAJXgvZRrAN",
      ],
    },
    {
      sequence: 4,
      source: "1EEydZQc3hLhC45GZx524kjDAJXgvZRrAN",
      name: "core.sync_event",
      data: "CMiZ86ryFBDjj6D-iAE=",
      impacted: ["1EEydZQc3hLhC45GZx524kjDAJXgvZRrAN"],
    },
    {
      sequence: 5,
      source: "1EEydZQc3hLhC45GZx524kjDAJXgvZRrAN",
      name: "core.swap_event",
      data: "ChkAhA3mGhNlMaVyZjiRdumx4O_zWa4syt7dEhkASNDWYZdHeig_Rn8I4UqOfj5cUzyaJtMCGLWCgwIwgp4N",
      impacted: ["1D3Er2ifm8P5324QApb46orJPAWGSSfCkt"],
    },
    {
      sequence: 6,
      source: "14MjxccMUZrtBPXnNkuAC5MLtPev2Zsk3N",
      name: "token.transfer",
      data: "ChkAhA3mGhNlMaVyZjiRdumx4O_zWa4syt7dEhkA3P3hhaVTjHw0O2XG1P8b5Rzd3asAjWb7GL3FJw==",
      impacted: [
        "1M9VoAHN3MdvwHnUotgk8GBVjCnXYepWbk",
        "1D3Er2ifm8P5324QApb46orJPAWGSSfCkt",
      ],
    },
    {
      sequence: 7,
      source: "1D3Er2ifm8P5324QApb46orJPAWGSSfCkt",
      name: "core.sync_event",
      data: "CKbr6NQBEJWalP0E",
      impacted: ["1D3Er2ifm8P5324QApb46orJPAWGSSfCkt"],
    },
    {
      sequence: 8,
      source: "1D3Er2ifm8P5324QApb46orJPAWGSSfCkt",
      name: "core.swap_event",
      data: "ChkA3P3hhaVTjHw0O2XG1P8b5Rzd3asAjWb7EhkASNDWYZdHeig_Rn8I4UqOfj5cUzyaJtMCGIKeDTC9xSc=",
      impacted: ["1M9VoAHN3MdvwHnUotgk8GBVjCnXYepWbk"],
    },
    {
      sequence: 9,
      source: "15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL",
      name: "koinos.contracts.token.transfer_event",
      data: "ChkA3P3hhaVTjHw0O2XG1P8b5Rzd3asAjWb7EhkAeagoO27eQJ2FBfvlnEOj3nFBBfTG-vj5GMmSgwI=",
      impacted: [
        "1C6GCyapZA8RyYGLj4kjMQXKkuXf9TDLBA",
        "1M9VoAHN3MdvwHnUotgk8GBVjCnXYepWbk",
      ],
    },
    {
      sequence: 10,
      source: "1M9VoAHN3MdvwHnUotgk8GBVjCnXYepWbk",
      name: "core.sync_event",
      data: "CJCzjYyovAQQkpaDlI5X",
      impacted: ["1M9VoAHN3MdvwHnUotgk8GBVjCnXYepWbk"],
    },
    {
      sequence: 11,
      source: "1M9VoAHN3MdvwHnUotgk8GBVjCnXYepWbk",
      name: "core.swap_event",
      data: "ChkAeagoO27eQJ2FBfvlnEOj3nFBBfTG-vj5EhkASNDWYZdHeig_Rn8I4UqOfj5cUzyaJtMCIL3FJyjJkoMC",
      impacted: ["1C6GCyapZA8RyYGLj4kjMQXKkuXf9TDLBA"],
    },
  ],
  state_delta_entries: [
    {
      object_space: {
        system: true,
      },
      key: "EiDIiXqmJH5E-r9zJwsyZAAqmy-mZUrXRH47P4AmqzkbTA==",
      value:
        "CiISIGt9mfgrLem-foalTdPJhs6O0BfLOeT8NZKIdrKy_BJ-EpMBCiISIADkNV3oqzZuKwUj8f_6cE9pDPRg3X8ls4FTbkFDKZykEK6wpwkYxtT2lqUyIiISIKUfmPztdx-tI-FMCCZW7g_qBPeEpReyWUq79r7tFjO6KiISIIj69VeNWn4bOEaaRfQRtlWO4Xx-SamIgeGf2202BoU8MhkA7-Mh3yERswBXFp2UPvegxIiGAauR1O_zGrIDCiISIFrkiNEttBdeHT7chMpSR4t1RqJwNCi6IllyhCY4FjrfEooBCiISIFkr8YZU_Qf99dUAzePoQC7Pf4H6Xd6PFFJ7CLuogF9IEICU69wDGgQovPQBIiISIGOesdX_Tjn9XBswGwWY7FE0wQR5OYWcfiP53AsgNocMKhkA0CUWEj3HvqGFaF-17ku9Do18WgdqRMy1MhkAeagoO27eQJ2FBfvlnEOj3nFBBfTG-vj5GrsBErgBChkASNDWYZdHeig_Rn8I4UqOfj5cUzyaJtMCEIbK1tkIGpQBChkAeagoO27eQJ2FBfvlnEOj3nFBBfTG-vj5EhkAeagoO27eQJ2FBfvlnEOj3nFBBfTG-vj5GLWCgwIgr4-DAioEa29pbioiMUxudFY4YVZwbmdMQ1lMVFp1SHV1ZXZ2VVpjQmhWUGVnZioiMTRNanhjY01VWnJ0QlBYbk5rdUFDNU1MdFBldjJac2szTioEa29pbiJBH_qPdD2dfT0QgwkkVMed1xrC_N3nLY27l7J4fIwNRy0LHRjD66AVi5_t0ZmPm6yPVm5a3tRQQ6gzjaX5RLSSx9siugEKUQIc5oNd5CEDEVaaZQlOeS_CnGO8g7yUq-yjxYfEYmjegRnnw_f9za_gO_ENtRcEOMkvRFDsgqd-ETAyWRoutry0Ttv4FvgPHC5AOBzK7aTzSBIiEiAAFtJGNwfI83iPRi001lQXLkNppLRZMsBub1JttDmwqRpBH_UHvSkcKoUhNcqBf8n5m9McXu4eJH6Tfcd3xO9NgUwmY-zjHPte6lt3HaIiTwdG507J_gCGNLPQqohEPA0vkpU=",
    },
    {
      object_space: {
        system: true,
        id: 4,
      },
      key: "AHmoKDtu3kCdhQX75ZxDo95xQQX0xvr4-Q==",
      value: "KLz0AQ==",
    },
    {
      object_space: {
        system: true,
        zone: "AC4z_RqpB7IkzpzmyUIokB0oOgLalW2nkQ==",
      },
      value: "CPCwyKP4lO4I",
    },
    {
      object_space: {
        system: true,
        zone: "AGm4cZ-LWSrhw-uN7S3U23xvkVwMymnlcg==",
      },
      value: "CM_9peGzsdYD",
    },
    {
      object_space: {
        zone: "ACTUjoz6V9FI2hfLZuu1_v7j-_ADkDJIxQ==",
        id: 1,
      },
      key: "AIQN5hoTZTGlcmY4kXbpseDv81muLMre3Q==",
      value: "CJWalP0E",
    },
    {
      object_space: {
        zone: "ACTUjoz6V9FI2hfLZuu1_v7j-_ADkDJIxQ==",
        id: 1,
      },
      key: "ANz94YWlU4x8NDtlxtT_G-Uc3d2rAI1m-w==",
      value: "CJKWg5SOVw==",
    },
    {
      object_space: {
        zone: "AIQN5hoTZTGlcmY4kXbpseDv81muLMre3Q==",
        id: 4,
      },
      value:
        "CAESGQBI0NZhl0d6KD9GfwjhSo5-PlxTPJom0wIaGxoZANkYFfAgHDhCIqYd40AizI-O1zfv8LOVYCIbGhkAJNSOjPpX0UjaF8tm67X-_uP78AOQMkjFKhI1OTU0NTM1MTA2MDcxMDMxNDQwpuvo1AE4lZqU_QRAxtT2lqUy",
    },
    {
      object_space: {
        zone: "AJE-ULfcFiJQ-8WrZP8ZXpqgpH19QoqPow==",
        id: 4,
      },
      value:
        "CAESGQBI0NZhl0d6KD9GfwjhSo5-PlxTPJom0wIaCAgBEgRrb2luIhsaGQDZGBXwIBw4QiKmHeNAIsyPjtc37_CzlWAqFzI2Mzk2OTgzMDA3OTgzMjUzMzM1MjE1MMiZ86ryFDjjj6D-iAFAxtT2lqUy",
    },
    {
      object_space: {
        zone: "ANkYFfAgHDhCIqYd40AizI-O1zfv8LOVYA==",
        id: 1,
      },
      key: "AIQN5hoTZTGlcmY4kXbpseDv81muLMre3Q==",
      value: "CKbr6NQB",
    },
    {
      object_space: {
        zone: "ANkYFfAgHDhCIqYd40AizI-O1zfv8LOVYA==",
        id: 1,
      },
      key: "AJE-ULfcFiJQ-8WrZP8ZXpqgpH19QoqPow==",
      value: "COOPoP6IAQ==",
    },
    {
      object_space: {
        zone: "ANz94YWlU4x8NDtlxtT_G-Uc3d2rAI1m-w==",
        id: 4,
      },
      value:
        "CAESGQBI0NZhl0d6KD9GfwjhSo5-PlxTPJom0wIaCAgBEgRrb2luIhsaGQAk1I6M-lfRSNoXy2brtf7-4_vwA5AySMUqGjU4ODU0NTM3ODczNTYzNTc3NDA1NjMwMjg1MJCzjYyovAQ4kpaDlI5XQMbU9palMg==",
    },
    {
      object_space: {
        system: true,
        zone: "AC2JYMoRjQmqoqHV0ltl0iBF94hV5E3QsQ==",
        id: 1,
      },
      value:
        "CiISIPs53apga2DQiqt4nszk2SUED01KvjHurhGIW78yTGD3EhAAAAAAAAAAAAXXNKM-IN8tGMbU9palMg==",
    },
    {
      object_space: {
        system: true,
        zone: "AC4z_RqpB7IkzpzmyUIokB0oOgLalW2nkQ==",
        id: 1,
      },
      key: "AHmoKDtu3kCdhQX75ZxDo95xQQX0xvr4-Q==",
      value: "CKv-pPyEBBCr_qT8hAQYxtT2lqUy",
    },
    {
      object_space: {
        system: true,
        zone: "AC4z_RqpB7IkzpzmyUIokB0oOgLalW2nkQ==",
        id: 1,
      },
      key: "AJE-ULfcFiJQ-8WrZP8ZXpqgpH19QoqPow==",
      value: "CMiZ86ryFBDImfOq8hQYxtT2lqUy",
    },
    {
      object_space: {
        system: true,
        zone: "AC4z_RqpB7IkzpzmyUIokB0oOgLalW2nkQ==",
        id: 1,
      },
      key: "ANAlFhI9x76hhWhfte5LvQ6NfFoHakTMtQ==",
      value: "CIC-xf2tCxCqvvKPrQsYxtT2lqUy",
    },
    {
      object_space: {
        system: true,
        zone: "AC4z_RqpB7IkzpzmyUIokB0oOgLalW2nkQ==",
        id: 1,
      },
      key: "ANz94YWlU4x8NDtlxtT_G-Uc3d2rAI1m-w==",
      value: "CJCzjYyovAQQkLONjKi8BBjG1PaWpTI=",
    },
    {
      object_space: {
        system: true,
        zone: "AC4z_RqpB7IkzpzmyUIokB0oOgLalW2nkQ==",
        id: 1,
      },
      key: "AO_jId8hEbMAVxadlD73oMSIhgGrkdTv8w==",
      value: "CMaltu7CWxDVlOTP9kUYxtT2lqUy",
    },
    {
      object_space: {
        system: true,
        zone: "AGm4cZ-LWSrhw-uN7S3U23xvkVwMymnlcg==",
        id: 1,
      },
      key: "AO_jId8hEbMAVxadlD73oMSIhgGrkdTv8w==",
      value: "COzS0dn5-SgSDQiY5qYJEOzS0dn5-Sg=",
    },
  ],
};
