function toHexString(buffer) {
  return Array.from(buffer)
    .map((n) => `0${Number(n).toString(16)}`.slice(-2))
    .join("");
}

export async function sendSandbox(command, args, store) {
  if (typeof document === "undefined") {
    throw new Error("Sandbox serializer is unavailable in this context");
  }

  const iframeSandbox = document.getElementById("sandbox");
  if (!iframeSandbox || !iframeSandbox.contentWindow) {
    throw new Error("Sandbox iframe is not available");
  }

  while (!store.state.sandboxLoaded) {
    await new Promise((resolve) => setTimeout(resolve, 20));
  }

  const reqId = window.crypto.randomUUID();
  return new Promise((resolve, reject) => {
    const listener = (event) => {
      if (event.data.command) return;

      const { id, result, error } = event.data;
      if (id !== reqId) return;

      if (error) {
        reject(new Error(error));
      } else {
        resolve(result);
      }
      window.removeEventListener("message", listener);
    };

    window.addEventListener("message", listener);
    iframeSandbox.contentWindow.postMessage(
      {
        id: reqId,
        command,
        args,
      },
      "*"
    );
  });
}

export async function newSandboxSerializer(store, ...constructorArgs) {
  const serId = toHexString(window.crypto.getRandomValues(new Uint8Array(5)));
  await sendSandbox(
    "newSerializer",
    {
      serId,
      serArgs: constructorArgs,
    },
    store
  );

  return {
    serialize: async (...serArgs) =>
      sendSandbox(
        "serialize",
        {
          serId,
          serArgs,
        },
        store
      ),
    deserialize: async (...serArgs) =>
      sendSandbox(
        "deserialize",
        {
          serId,
          serArgs,
        },
        store
      ),
  };
}
