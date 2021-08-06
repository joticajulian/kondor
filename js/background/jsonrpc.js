async function jsonrpc(method, params) {
  return fetch("http://45.56.104.152:8080", {
    method: "POST",
    body: JSON.stringify({
      id: Math.round(Math.random() * 1000),
      jsonrpc: "2.0",
      method,
      params,
    }),
  });
}
