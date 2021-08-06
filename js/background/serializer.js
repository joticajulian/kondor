function serialize(data, abi) {
  const vb = new VariableBlob();
  // vb.dataBuffer = {};
  // const aux = new VariableBlob();
  if (Array.isArray(abi.type)) {
    vb.data = {};
    abi.type.forEach((key) => {
      const { buffer /*, dataBuffer */ } = serialize(data[key.name], key);
      // vb.dataBuffer[key.name] = dataBuffer;
      vb.write(buffer);
    });
    vb.resetCursor();
    return vb;
  }

  switch (abi.type) {
    case "opaque":
      if (!abi.subAbi)
        throw new Error(`subAbi undefined in ${JSON.stringify(abi)}`);
      const native = serialize(data, abi.subAbi);
      vb.serializeBuffer(native.buffer);
      // vb.dataBuffer.native = native.dataBuffer;
      break;
    case "vector":
      if (!abi.subAbi)
        throw new Error(`subAbi undefined in ${JSON.stringify(abi)}`);
      vb.serializeVarint(data.length);
      // aux.serializeVarint(data.length); vb.dataBuffer.size = aux.buffer.toString();
      // vb.dataBuffer.items = [];
      data.forEach((item) => {
        const itemSerialized = serialize(item, abi.subAbi);
        vb.write(itemSerialized.buffer);
        // vb.dataBuffer.items.push(itemSerialized.dataBuffer);
      });
      break;
    case "variant":
      const variantId = abi.variants.findIndex((v) => v.name === data.type);
      if (variantId < 0) throw new Error(`Variant ${data.type} not found`);
      if (!abi.variants[variantId])
        throw new Error(
          `abi undefined in ${JSON.stringify(abi)} for id ${variantId}`
        );
      vb.serializeVarint(variantId);
      // aux.serializeVarint(variantId); vb.dataBuffer.variantId = aux.buffer.toString();
      const variantSerialized = serialize(data.value, abi.variants[variantId]);
      vb.write(variantSerialized.buffer);
      // vb.dataBuffer.variant = variantSerialized.dataBuffer;
      break;
    case "variableblob":
      vb.serializeBuffer(data);
      // aux.serializeBuffer(data); vb.dataBuffer.variableblob = aux.buffer.toString();
      break;
    case "fixedblob":
      vb.write(data, abi.size);
      // aux.write(data, abi.size); vb.dataBuffer.fixedblob = aux.buffer.toString();
      break;
    case "string":
      vb.serializeString(data);
      // aux.serializeString(data); vb.dataBuffer.string = aux.buffer.toString();
      break;
    case "varint":
      vb.serializeVarint(data);
      // aux.serializeVarint(data); vb.dataBuffer.varint = aux.buffer.toString();
      break;
    case "uint8":
      vb.writeUint8(data);
      // aux.writeUint8(data); vb.dataBuffer.uint8 = aux.buffer.toString();
      break;
    case "uint16":
      vb.writeUint16(data);
      // aux.writeUint16(data); vb.dataBuffer.uint16 = aux.buffer.toString();
      break;
    case "uint32":
      vb.writeUint32(data);
      // aux.writeUint32(data); vb.dataBuffer.uint32 = aux.buffer.toString();
      break;
    case "uint64":
      vb.serializeBigint(data, 64);
      // aux.serializeBigint(data, 64); vb.dataBuffer.uint64 = aux.buffer.toString();
      break;
    case "uint128":
      vb.serializeBigint(data, 128);
      // aux.serializeBigint(data, 128); vb.dataBuffer.uint128 = aux.buffer.toString();
      break;
    case "uint160":
      vb.serializeBigint(data, 160);
      aux.serializeBigint(data, 160);
      vb.dataBuffer.uint160 = aux.buffer.toString();
      break;
    case "uint256":
      vb.serializeBigint(data, 256);
      // aux.serializeBigint(data, 256); vb.dataBuffer.uint256 = aux.buffer.toString();
      break;
    case "int8":
      vb.writeInt8(data);
      // aux.writeInt8(data); vb.dataBuffer.int8 = aux.buffer.toString();
      break;
    case "int16":
      vb.writeInt16(data);
      // aux.writeInt16(data); vb.dataBuffer.int16 = aux.buffer.toString();
      break;
    case "int32":
      vb.writeInt32(data);
      // aux.writeInt32(data); vb.dataBuffer.int32 = aux.buffer.toString();
      break;
    case "int64":
      vb.serializeBigint(data, 64);
      // aux.serializeBigint(data, 64); vb.dataBuffer.int64 = aux.buffer.toString();
      break;
    case "int128":
      vb.serializeBigint(data, 128);
      // aux.serializeBigint(data, 128); vb.dataBuffer.int128 = aux.buffer.toString();
      break;
    case "int160":
      vb.serializeBigint(data, 160);
      // aux.serializeBigint(data, 160); vb.dataBuffer.int160 = aux.buffer.toString();
      break;
    case "int256":
      vb.serializeBigint(data, 256);
      // aux.serializeBigint(data, 256); vb.dataBuffer.int256 = aux.buffer.toString();
      break;
    case "unused_extension":
      break;
    default: {
      throw new Error(`Unknown type ${abi.type}`);
    }
  }
  return vb;
}

function deserialize(vb, abi) {
  let data;
  if (Array.isArray(abi)) {
    data = {};
    abi.forEach((key) => {
      data[key.name] = deserialize(vb, key);
    });
    return data;
  }

  switch (abi.type) {
    case "opaque": {
      const blob = vb.deserializeBuffer();
      return deserialize(blob, abi.subAbi);
    }
    case "vector": {
      const size = vb.deserializeVarint();
      const data = [];
      for (let i = 0; i < size; i += 1) {
        const item = deserialize(vb, abi.subAbi);
        data.push(item);
      }
    }
    case "variant": {
      const variantId = vb.deserializeVarint();
      const abiVariant = abi.variants[variantId];
      const value = deserialize(vb, abiVariant);
      const type = abiVariant.name;
      return { type, value };
    }
    case "variableblob":
      return multibase64(vb.deserializeBuffer());
    case "fixedblob":
      return multibase64(vb.read(abi.size));
    case "string":
      return vb.deserializeString();
    case "varint":
      return vb.deserializeVarint();
    case "uint8":
      return vb.readUint8();
    case "uint16":
      return vb.readUint16();
    case "uint32":
      return vb.readUint32();
    case "uint64":
      return vb.deserializeBigint(64, true);
    case "uint128":
      return vb.deserializeBigint(128, true);
    case "uint160":
      return vb.deserializeBigint(160, true);
    case "uint256":
      return vb.deserializeBigint(256, true);
    case "int8":
      return vb.readInt8();
    case "int16":
      return vb.readInt16();
    case "int32":
      return vb.readInt32();
    case "int64":
      return vb.deserializeBigint(64, false);
    case "int128":
      return vb.deserializeBigint(128, false);
    case "int160":
      return vb.deserializeBigint(160, false);
    case "int256":
      return vb.deserializeBigint(256, false);
    case "unused_extension":
      return {};
    default:
      throw new Error(`Unknown type ${abi.type}`);
  }
}
