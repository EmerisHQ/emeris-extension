import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';

import Account from '../views/Account.vue';
import AccountBackup from '../views/account-backup/AccountBackup.vue';
import MnemonicConfirm from '../views/account-backup/MnemonicConfirm.vue';
import MnemonicShow from '../views/account-backup/MnemonicShow.vue';
import MnemonicShowPassword from '../views/account-backup/MnemonicShowPassword.vue';
import AccountAddAdditional from '../views/AccountAddAdditional.vue';
import AccountBackedUpForRemove from '../views/AccountBackedUpForRemove.vue';
import AccountCreate from '../views/AccountCreate.vue';
import AccountCreationResume from '../views/AccountCreationResume.vue';
import AccountImport from '../views/AccountImport.vue';
import AccountImportInfo from '../views/AccountImportInfo.vue';
import AccountImportLedger from '../views/AccountImportLedger.vue';
import AccountImportLedgerConnect from '../views/AccountImportLedgerConnect.vue';
import AccountImportReady from '../views/AccountImportReady.vue';
import AccountReady from '../views/AccountReady.vue';
import AccountReadyNoBackup from '../views/AccountReadyNoBackup.vue';
import AccountRemove from '../views/AccountRemove.vue';
import AccountRename from '../views/AccountRename.vue';
import Accounts from '../views/Accounts.vue';
import AccountSettings from '../views/AccountSettings.vue';
import ExtensionReset from '../views/ExtensionReset.vue';
import ExtensionResetConfirm from '../views/ExtensionResetConfirm.vue';
import ExtensionResetConfirmed from '../views/ExtensionResetConfirmed.vue';
import HdPath from '../views/HDPath.vue';
import Home from '../views/Home.vue';
import LedgerError from '../views/LedgerError.vue';
import PasswordCreate from '../views/PasswordCreate.vue';
import Portfolio from '../views/Portfolio.vue';
import ReceiveDenom from '../views/ReceiveDenom.vue';
import ReceiveQR from '../views/ReceiveQR.vue';
import Security from '../views/Security.vue';
import Settings from '../views/Settings.vue';
import SignoutConfirm from '../views/SignoutConfirm.vue';
import SupportWarning from '../views/SupportWarning.vue';
import TransactionReview from '../views/TransactionReview.vue';
import TransactionSigningLedger from '../views/TransactionSigningLedger.vue';
// import Unlock from '../views/Unlock.vue';
import Welcome from '../views/Welcome.vue';
import WelcomeBack from '../views/WelcomeBack.vue';
import Whitelist from '../views/Whitelist.vue';
import WhitelistedPageRemove from '../views/WhitelistedPageRemove.vue';
import WhitelistedPages from '../views/WhitelistedPages.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: Home,
  },
  {
    path: '/portfolio',
    name: 'Portfolio',
    component: Portfolio,
  },
  {
    path: '/create',
    alias: [
      '/welcome/create',
      '/accounts/create',
      '/settings/create',
      '/ledger/connect/create',
      '/welcome/account-import-info/account-import/create',
      '/accounts/account-import-info/account-import/create',
      '/settings/account-import-info/account-import/create',
    ],
    name: 'Create Wallet',
    component: AccountCreate,
  },
  // {
  //   path: '/unlock',
  //   name: 'Unlock Wallet',
  //   component: Unlock,
  // },
  {
    path: '/welcome',
    name: 'Welcome',
    component: Welcome,
  },
  {
    path: '/signIn',
    name: 'Sign In',
    component: WelcomeBack,
  },
  {
    path: '/welcomeBack',
    name: 'Welcome Back',
    component: WelcomeBack,
  },
  {
    path: '/passwordCreate',
    name: 'Choose Password',
    component: PasswordCreate,
  },
  {
    path: '/accountRemove/:index',
    name: 'Account Remove',
    component: AccountRemove,
    props: true,
  },
  {
    path: '/accountRename/:index',
    name: 'Account Rename',
    component: AccountRename,
    props: true,
  },
  {
    path: '/accountAddAdditional',
    name: 'Account Add Additional',
    component: AccountAddAdditional,
  },
  {
    path: '/account-import',
    alias: [
      '/welcome/account-import-info/account-import',
      '/accounts/account-import-info/account-import',
      '/settings/account-import-info/account-import',
    ],
    name: 'Account Import',
    component: AccountImport,
  },
  {
    path: '/account-import-info',
    alias: ['/welcome/account-import-info', '/accounts/account-import-info', '/settings/account-import-info'],
    name: 'Account Import Info',
    component: AccountImportInfo,
  },
  {
    path: '/account-import-HD-path',
    alias: [
      '/welcome/account-import-info/account-import/account-import-HD-path',
      '/accounts/account-import-info/account-import/account-import-HD-path',
      '/settings/account-import-info/account-import/account-import-HD-path',
      '/ledger/account-import-HD-path',
    ],
    name: 'HD Path',
    component: HdPath,
  },
  {
    path: '/accountCreationResume',
    name: 'Account Creation Resume',
    component: AccountCreationResume,
  },
  {
    path: '/extensionReset',
    name: 'Forgot Password',
    component: ExtensionReset,
  },
  {
    path: '/extensionReset/confirm',
    name: 'Extension Reset',
    component: ExtensionResetConfirm,
  },
  {
    path: '/extensionReset/confirmed',
    name: 'Extension Reset Confirmed',
    component: ExtensionResetConfirmed,
  },
  {
    path: '/backup',
    alias: ['/welcome/create/backup', '/accounts/create/backup', '/settings/create/backup', '/portfolio/backup'],
    name: 'Account Backup',
    component: AccountBackup,
  },
  {
    path: '/backup/password',
    name: 'Recovery Phrase Password',
    component: MnemonicShowPassword,
  },
  {
    path: '/backup/show',
    name: 'Recovery Phrase',
    component: MnemonicShow,
  },
  {
    path: '/backup/confirm',
    name: 'Recovery Confirm',
    component: MnemonicConfirm,
  },
  {
    path: '/accountImportReady',
    name: 'Account Import Ready',
    component: AccountImportReady,
  },
  {
    path: '/accountReady',
    name: 'Account Ready',
    component: AccountReady,
  },
  {
    path: '/accountReadyNoBackup',
    name: 'Account Ready No Backup',
    component: AccountReadyNoBackup,
  },
  {
    path: '/accountBackedUpForRemove',
    name: 'Account Backed Up For Remove',
    component: AccountBackedUpForRemove,
  },
  {
    path: '/ledger',
    name: 'Import Ledger',
    component: AccountImportLedger,
  },
  {
    path: '/ledger/connect',
    name: 'Connect Ledger',
    component: AccountImportLedgerConnect,
  },
  {
    path: '/ledger/sign',
    name: 'Transaction Signing Ledger',
    component: TransactionSigningLedger,
  },
  {
    path: '/ledger/error',
    name: 'Ledger error',
    component: LedgerError,
  },
  {
    path: '/account',
    alias: ['/portfolio/account'],
    name: 'Account',
    component: Account,
  },
  {
    path: '/accounts',
    name: 'Accounts',
    component: Accounts,
  },
  {
    path: '/account-settings/:index',
    name: 'Account Settings',
    component: AccountSettings,
  },
  /** Settings flows */
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
  },
  {
    path: '/settings/security',
    name: 'Settings Security',
    component: Security,
  },
  {
    path: '/settings/signout-confirm',
    name: 'Settings Signout Confirm',
    component: SignoutConfirm,
  },
  {
    path: '/settings/whitelisted',
    name: 'Settings Whitelisted Pages',
    component: WhitelistedPages,
  },
  {
    path: '/settings/whitelisted/remove',
    name: 'Settings Whitelisted Page Remove',
    component: WhitelistedPageRemove,
  },
  {
    path: '/settings/support',
    name: 'Settings Support Warning',
    component: SupportWarning,
  },
  {
    path: '/receive',
    name: 'Receive Denom',
    component: ReceiveDenom,
  },
  {
    path: '/receive/:denom',
    name: 'Receive QR',
    component: ReceiveQR,
    props: true,
  },
  {
    path: '/whitelist',
    name: 'Whitelist',
    component: Whitelist,
  },
  {
    path: '/transaction/review',
    name: 'Transaction Review',
    component: TransactionReview,
  },
];

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes,
});

export default router;
