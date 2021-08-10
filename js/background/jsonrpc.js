async function jsonrpc(method, params) {
  const response = await fetch("http://45.56.104.152:8080", {
    method: "POST",
    body: JSON.stringify({
      id: Math.round(Math.random() * 1000),
      jsonrpc: "2.0",
      method,
      params,
    }),
  });
  const json = await response.json();
  if (json.error && json.error.message) throw new Error(json.error.message);
  return json.result;
}
