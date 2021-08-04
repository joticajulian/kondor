class Contract {
  constructor(c) {
    this.id = c.id;
    this.entries = c.entries;
  }

  encodeOperation(op) {
    if (!this.entries || !this.entries[op.name])
      throw new Error(`Operation ${op.name} unknown`);
    const entry = this.entries[op.name];
    let serializedArgs = undefined;
    if (entry.args) serializedArgs = serialize(op.args, entry.args).toString();
    return {
      contract_id: this.id,
      entry_point: entry.id,
      args: serializedArgs,
    };
  }

  decodeOperation(op) {
    if (op.contract_id !== this.id)
      throw new Error(
        `Invalid contract id. Expected: ${this.id}. Received: ${op.contract_id}`
      );
    for (let opName in this.entries) {
      const entry = this.entries[opName];
      if (op.entry_point === entry.id) {
        const vb = new VariableBlob(op.args);
        return {
          name: opName,
          args: deserialize(vb, entry.args),
        };
      }
    }
    throw new Error(`Unknown entry id ${op.entry_point}`);
  }
}
