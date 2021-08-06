class Multihash {
  constructor(buffer, id = 0x12) {
    this.id = id;
    this.digest = buffer;
  }
  toString() {
    const vb = new VariableBlob();
    vb.serializeVarint(this.id);
    vb.serializeBuffer(this.digest);
    return `z${bs58.encode(vb.buffer)}`;
  }
}
