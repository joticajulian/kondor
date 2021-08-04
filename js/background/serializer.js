const Type = {
  uint32: "uint32",
  uint64: "uint64",
  variableBlob: "variableblob",
  accountType: "account_type",
};

function serialize(data, abi) {
  const vb = new VariableBlob();
  if (typeof abi === "object") {
    Object.keys(abi).forEach((key) => {
      const { buffer } = serialize(data[key], abi[key]);
      vb.write(buffer);
    });
    vb.resetCursor();
    return vb;
  }

  switch (abi) {
    case Type.variableBlob:
      vb.serializeBuffer(data);
      break;
    case Type.accountType:
      vb.serializeString(data);
      break;
    case Type.uint32:
      vb.serializeUint32(data);
      break;
    case Type.uint64:
      vb.serializeUint64(data);
      break;
    default: {
      throw new Error(`Unknown type ${abi}`);
    }
  }
  return vb;
}

function deserialize(vb, abi) {
  let data;
  if (typeof abi === "object") {
    data = {};
    Object.keys(abi).forEach((key) => {
      data[key] = deserialize(vb, abi[key]);
    });
    return data;
  }

  switch (abi) {
    case Type.variableBlob:
      return multibase64(vb.deserializeBuffer());
    case Type.accountType:
      return vb.deserializeString();
    case Type.uint32:
      return vb.deserializeUint32();
    case Type.uint64:
      return vb.deserializeUint64();
    default:
      throw new Error(`Unknown type ${abi}`);
  }
}
