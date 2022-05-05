# `emeris-extension`

Browser extension to hold keys and sign transactions for Emeris as well as other platforms.

## Installation

1. `git clone https://github.com/EmerisHQ/emeris-extension.git`
2. `cd emeris-extension`
3. `git submodule init`
4. `git submodule update`
5. Or run `git clone https://github.com/EmerisHQ/demeris.git` if you have permission issues after running command number 4
6. `yarn`
7. `yarn dev`
8. Go to `chrome://extensions` and ensure you are in Developer mode
9. Drag the `dist` folder into this screen to install the Emeris Extension

## Most efficient way of doing development

Unfortunately right now there is no hot-reloading. After every change, the extension will have to build again.
The best you can do is to run `yarn dev:watch`.
When you make a change, the extension will rebuild. Wait for that to be done and open the extension again.

(dev:watch includes two scripts that run independent to boost build time. The first builds the views the second the node based scripts)

## Usage

```
const emerisExtension = require('emeris-extension');

// TODO: DEMONSTRATE API
```

## Dev browser mode

To check the extension as a website (instead of a pop up) and be able to use DevTools, paste the following URL:

```
// EXTENSION_ID being something like cklkpejioojjeiigffappdlcmnonmjek
chrome-extension://<EXTENSION_ID>/popup.html/?browser=true
```

> To find the `EXTENSION_ID` of your instance, go to chrome://extensions/ and copy the ID of emeris-extension.

## Test current state

Currently the extension is not integrated into Emeris. To test the API you can go to any website and run in the console:

> Replace the signing address with one you have in the extension.

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

`EXTENSION_ID=cklkpejioojjeiigffappdlcmnonmjek PWDEBUG=1 npx playwright test -g "Create Account"`

For automatic tests:

> If you want to automatically create your tests with `codegen`, you can do it using a different technique as the [Codegen with custom setup](https://playwright.dev/docs/cli#codegen-with-custom-set) guide describes.

- Add `await page.pause();` in any of the tests.
- Run the test command above.
- When the test is paused, you can start a new recording session by clicking the recording button.
- When the new Chrome tab is open, copy the extension link: chrome-extension://cklkpejioojjeiigffappdlcmnonmjek/popup.html?browser=true, and start your tests!

More info about the extension at [Emeris Chrome Extension](https://www.notion.so/allinbits/Emeris-Chrome-Extension-3ad6786c10a64decb033e6df9a99113f) in Notion.
