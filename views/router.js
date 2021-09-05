
// element divs
const home = document.getElementById("home")
const unlockWelcome = document.getElementById("unlock-welcome")
const unlock = document.getElementById("unlock")
const importWallet = document.getElementById("import-wallet")
const dashboard = document.getElementById("dashboard")
const create = document.getElementById("create")
const explainer = document.getElementById("explainer")
const confirm = document.getElementById("confirm")
const confirmed = document.getElementById("confirmed")

// buttons
const routeUnlock = document.getElementById("route-unlock")
const routeUnlock2 = document.getElementById("route-unlock2")
const routeHome = document.getElementById("route-home")
const routeImport = document.getElementById("route-import")
const routePkey = document.getElementById("route-pkey")
const routeCreate = document.getElementById("route-create")
const routeExplainer = document.getElementById("route-explainer")
const routeConfirm = document.getElementById("route-confirm")
const routeConfirmed = document.getElementById("route-confirmed")
const routeDashboard = document.getElementById("route-dashboard")
const buttonTransfer = document.getElementById("transfer");

// back buttons
const routebackUnlock = document.getElementById("routeback-unlock")
const routebackUnlockCreate = document.getElementById("routeback-unlock-create")
const routebackImport = document.getElementById("routeback-import")
const routebackExplainer = document.getElementById("routeback-explainer")

// inputs
const inputPasswordUnlock = document.getElementById("password-unlock");
const inputSetPassword = document.getElementById("set-password");

// page routes
routeUnlock.onclick = () => {
    home.style.display = "none"
    unlockWelcome.style.display = "block"
}
routeUnlock2.onclick = async () => {
    unlock.style.display = "none"
    dashboard.style.display = "block"
    const encrypted = await getAccounts();
    const { privateKey } = await decrypt(encrypted, inputPasswordUnlock.value);
    loadViewAccount(privateKey)
}
routeHome.onclick = () => {
    unlock.style.display = "none"
    home.style.display = "block"
}
routeImport.onclick = () => {
    unlockWelcome.style.display = "none"
    importWallet.style.display = "block"
}
routePkey.onclick = async () => {
    importWallet.style.display = "none"
    dashboard.style.display = "block"
    loadViewAccount(inputPrivateKey.value)
    const enc = await encrypt({ privateKey: inputPrivateKey.value }, inputSetPassword.value);
    await storeAccount(enc);
}
routeCreate.onclick = () => {
    console.log("coming soon")
    // unlockWelcome.style.display = "none"
    // create.style.display = "block"
}
routeExplainer.onclick = () => {
    create.style.display = "none"
    explainer.style.display = "block"
}
routeConfirm.onclick = () => {
    explainer.style.display = "none"
    confirm.style.display = "block"
}
routeConfirmed.onclick = () => {
    confirm.style.display = "none"
    confirmed.style.display = "block"
}
routeDashboard.onclick = () => {
    confirmed.style.display = "none"
    dashboard.style.display = "block"
}
buttonTransfer.onclick = () => {
    sendKoin();
}


// back button routes
routebackUnlock.onclick = () => {
  console.log('unlock')
    importWallet.style.display = "none"
    unlockWelcome.style.display = "block"
    loadViewAccount(inputPrivateKey.value)
}
routebackUnlockCreate.onclick = () => {
  console.log('unlock')
    create.style.display = "none"
    unlockWelcome.style.display = "block"
}
routebackImport.onclick = () => {
  console.log('import')
    dashboard.style.display = "none"
    importWallet.style.display = "block"
    loadViewAccount(inputPrivateKey.value)
}
