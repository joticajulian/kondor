var s = document.createElement("script");
s.src = chrome.runtime.getURL("js/injected.js");
(document.head || document.documentElement).appendChild(s);

document.addEventListener("ev", function (request) {
  console.log("listener....");
  console.log(request);

  chrome.runtime.sendMessage({ greeting: "hello" }, function (response) {
    console.log("response runtime");
    console.log(response);
  });
});

s.onload = function () {
  var url = chrome.runtime.getURL("html/popup.html");

  var evt = document.createEvent("CustomEvent");
  evt.initCustomEvent("yourCustomEvent", true, true, url);
  document.dispatchEvent(evt);
};

console.log("content is working")

  let salt;
  let iv;

  function getKeyMaterial(password) {
    let enc = new TextEncoder();
    return window.crypto.subtle.importKey(
      "raw", 
      enc.encode(password), 
      {name: "PBKDF2"}, 
      false, 
      ["deriveBits", "deriveKey"]
    );
  }

  function getKey(keyMaterial, salt) {
    return window.crypto.subtle.deriveKey(
      {
        "name": "PBKDF2",
        salt: salt, 
        "iterations": 100000,
        "hash": "SHA-256"
      },
      keyMaterial,
      { "name": "AES-GCM", "length": 256},
      true,
      [ "encrypt", "decrypt" ]
    );
  }

  async function encrypt(message, password) {
    let keyMaterial = await getKeyMaterial(password);
    salt = window.crypto.getRandomValues(new Uint8Array(16));
    let key = await getKey(keyMaterial, salt);
    iv = window.crypto.getRandomValues(new Uint8Array(12));
    let encoded = new TextEncoder().encode(message);

    return await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      key,
      encoded
    );
  }

  async function decrypt(encrypted, password) {
    let keyMaterial = await getKeyMaterial(password);
    let key = await getKey(keyMaterial, salt);

    try {
      let decrypted = await window.crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: iv
        },
        key,
        encrypted
      );

      let dec = new TextDecoder();
      return dec.decode(decrypted);
    } catch (e) {
      throw e
    }
  }

  (async () => {
    password = "aaa";
    console.log("encrypting...")
    const encc = await encrypt("jilsme", password);
    console.log(encc)
    console.log("decrypting...")
    const resp = await decrypt(encc, password);
    console.log(resp)
    console.log("end enc")
  })()
