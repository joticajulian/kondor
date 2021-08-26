
// element divs
const home = document.getElementById("home")
const unlock = document.getElementById("unlock")
const importWallet = document.getElementById("import-wallet")
const dashboard = document.getElementById("dashboard")

// buttons
const routeUnlock = document.getElementById("route-unlock")
const routeImport = document.getElementById("route-import")
const routePkey = document.getElementById("route-pkey")


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
  } else {
    unlock.style.display = "block"
  }
}