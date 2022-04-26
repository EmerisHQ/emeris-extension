class BrowserManager {
  private static _instance: BrowserManager = new BrowserManager();

  private _browser = undefined;

  constructor() {
    if (BrowserManager._instance) {
      throw new Error('Error: Instantiation failed: Use BrowserManager.getInstance() instead of new.');
    }
    BrowserManager._instance = this;
  }

  public static getInstance(): BrowserManager {
    return BrowserManager._instance;
  }

  public setBrowser(value: any): void {
    this._browser = value;
  }

  public getBrowser(): any {
    return this._browser;
  }
}
export default BrowserManager;
