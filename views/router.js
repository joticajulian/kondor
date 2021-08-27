
// element divs
const home = document.getElementById("home")
const unlock = document.getElementById("unlock")
const importWallet = document.getElementById("import-wallet")
const dashboard = document.getElementById("dashboard")

// buttons
const routeUnlock = document.getElementById("route-unlock")
const routeImport = document.getElementById("route-import")
const routePkey = document.getElementById("route-pkey")
const routebackUnlock = document.getElementById("routeback-unlock")
const routebackImport = document.getElementById("routeback-import")


routeUnlock.onclick = () => {
  console.log(home)
  if (home.style.display !== "none") {
    home.style.display = "none"
    unlock.style.display = "block"
  } else {
    home.style.display = "block"
  }
}
routeImport.onclick = () => {
  if (unlock.style.display !== "none") {
    unlock.style.display = "none"
    importWallet.style.display = "block"
  } else {
    unlock.style.display = "block"
  }
}
routePkey.onclick = () => {
  if (importWallet.style.display !== "none") {
    importWallet.style.display = "none"
    dashboard.style.display = "block"
    loadViewAccount(inputPrivateKey.value)
  } else {
    unlock.style.display = "block"
  }
}
routebackUnlock.onclick = () => {
  if (importWallet.style.display !== "none") {
    importWallet.style.display = "none"
    unlock.style.display = "block"
    loadViewAccount(inputPrivateKey.value)
  } else {
    unlock.style.display = "block"
  }
}
routebackImport.onclick = () => {
  if (dashboard.style.display !== "none") {
    dashboard.style.display = "none"
    importWallet.style.display = "block"
    loadViewAccount(inputPrivateKey.value)
  } else {
    importWallet.style.display = "block"
  }
}