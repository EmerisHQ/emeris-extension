# `emeris-extension`

Browser extension to hold keys and sign transactions for Emeris as well as other platforms.

## Installation

1. `git clone https://github.com/EmerisHQ/emeris-extension.git`
2. `cd emeris-extension`
3. `git submodule init`
4. `git submodule update`
5. Or run `git clone https://github.com/EmerisHQ/demeris.git` if you have permission issues after running command number 4
6. `yarn install`
7. `yarn run dev`
8. Go to `chrome://extensions` and ensure you are in Developer mode
9. Drag the `dist` folder into this screen to install the Emeris Extension

## Most efficient way of doing development

Unfortunately right now there is no hot-reloading. After every change, the extension will have to build again.
The best you can do is to run `yarn run dev:watch`.
When you make a change, the extension will rebuild. Wait for that to be done and open the extension again.

(dev:watch includes two scripts that run independent to boost build time. The first builds the views the second the node based scripts)

## Experimental: Debug on Web

Running the chrome extension as a webapp.
This might not be a great idea for specific functionality which for example needs storage, or signing transactions.
However, for doing visual development, this might speed you up quite a bit, because you don't have to wait for the extension to build for 60 seconds.

To run:
Add the following in your `.env.local` file:
Note: [See how to get the keyhash](https://www.notion.so/allinbits/How-do-Key-Hashes-work-284f9b77ef4b4a47992d5aa392e909a6)

```
VITE_EMERIS_MNEMONIC={mnemonic}
VITE_EMERIS_KEYHASH={cosmos keyhash from your account}
VITE_EMERIS_WALLET_PASSWORD=1234
```

Next, run:

```
yarn run dev:web
```

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

## Test E2E

Run:

`EXTENSION_ID=cklkpejioojjeiigffappdlcmnonmjek npx playwright test`

For individual test runs (replace the string with the test name):

`EXTENSION_ID=cklkpejioojjeiigffappdlcmnonmjek npx playwright test -g "Create Account"`
