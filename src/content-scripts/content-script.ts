/* eslint-disable max-lines-per-function */
async function setup() {
  const browser = (await import('webextension-polyfill')).default;

  function injectScript(file: string) {
    const container = document.head || document.documentElement;
    const scriptElement = document.createElement('script');

    scriptElement.src = file;
    scriptElement.type = 'module';
    container.insertBefore(scriptElement, container.children[0]);
    console.log('Emeris Extension loaded');
  }
  const injected = browser.runtime.getURL('/inject-emeris.js');
  injectScript(injected);

  const sendMessage = async (msg: unknown) => {
    return await browser.runtime.sendMessage(msg);
  };

  const validateMsg = (data) => {
    return true || data;
  };

  window.addEventListener('message', async (event: MessageEvent) => {
    // We only accept messages from ourselves

    if (event.source !== window) {
      return;
    }
    // We only  deal with messages to the extension
    if (event.data.type !== 'toEmerisExtension') {
      return;
    }
    // Do some basic validation
    if (!validateMsg(event.data.data)) {
      return;
    }
    event.data.data.origin = event.origin;
    try {
      const response = await sendMessage(event.data.data);
      window.postMessage({ type: 'fromEmerisExtension', data: response }, event.origin);
    } catch (err) {
      window.postMessage(
        {
          type: 'fromEmerisExtension',
          data: {
            id: event.data.data.id,
            err,
          },
        },
        event.origin,
      );
    }
  });

  // handle inbound messages from the background without an output request
  browser.runtime.onMessage.addListener((message) => {
    if (message.type === 'lastAccountUpdated') {
      window.dispatchEvent(new Event('emeris_account_changed'));
    }
    // relay to current tab that extension popup was closed
    if (message.type === 'fromEmerisExtension' && message.action === 'onPopupClosed') {
      window.postMessage({
        type: 'fromEmerisExtension',
        action: 'onPopupClosed',
      });
    }
  });
}
setup();
