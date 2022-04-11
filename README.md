# `emeris-extension`

Browser extension to hold keys and sign transactions for Emeris as well as other platforms.

## Installation

1. `git clone https://github.com/EmerisHQ/emeris-extension.git`
2. `cd emeris-extension`
3. `rm -rf demeris`
4. `git clone https://github.com/EmerisHQ/demeris.git`
5. `cd demeris`
6. `git checkout <demeris commit hash that you you see in the demeris folder here: https://github.com/EmerisHQ/emeris-extension >`
7. `cd ../`
8. `yarn install`
9. `yarn run build`
10. Go to `chrome://extensions` and ensure you are in Developer mode
11. Drag the `dist` folder into this screen to install the Emeris Extension

Unfortunately right now there is no hot-reloading. After every change, the extension will have to build again. The best you can do is to run

`yarn run build --watch`

## Usage

```
const emerisExtension = require('emeris-extension');

// TODO: DEMONSTRATE API
```

## Test current state

Currently the extension is not integrated into Emeris. To test the API you can go to any website and run in the console:
Replace the signing address with one you have in the extension.

```
window.emeris.enable()
window.emeris.signTransaction({
    chainId: 'cosmos-hub',
    signingAddress: 'cosmos1n97vrj8t342jk5hn9ng0dyz352x94dt98x48ux',
    messages: [
        {
            type: 'transfer',
            data: {
                amount: { denom: 'uatom', amount: 1 },
                chain_name: 'cosmos-hub',
                to_address: 'cosmos1n97vrj8t342jk5hn9ng0dyz352x94dt98x48ux',
                from_address: 'cosmos1n97vrj8t342jk5hn9ng0dyz352x94dt98x48ux'
            }
        },
    ],
    fee: {
        gas: "200000",
        amount: [{
amount: 1,
        denom: 'uatom'}]
    }
    }).then(console.log)
```

Also available:

```
window.emeris.signAndBroadcastTransaction
```

Fees are currently ignored.

Other message formats can be found here: https://github.com/EmerisHQ/emeris-libraries/blob/develop/packages/types/src/EmerisTransactions.ts
