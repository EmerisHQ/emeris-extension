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
    path: '/password-create',
    name: 'Choose Password',
    component: PasswordCreate,
  },
  {
    path: '/accountAddAdditional',
    name: 'Account Add Additional',
    component: AccountAddAdditional,
  },
  /** Account Creation flows */
  {
    path: '/welcome/create',
    alias: ['/accounts/create', '/settings/create', '/ledger/connect/create'],
    name: 'Create Wallet',
    component: AccountCreate,
  },
  {
    path: '/welcome/create/backup',
    alias: ['/accounts/create/backup', '/settings/create/backup'],
    name: 'Create Wallet Backup',
    component: AccountBackup,
  },

  {
    path: '/welcome/create/backup/password',
    alias: ['/accounts/create/backup/password', '/settings/create/backup/password'],
    name: 'Create Wallet Password',
    component: MnemonicShowPassword,
  },
  {
    path: '/welcome/create/backup/password/show',
    alias: ['/accounts/create/backup/password/show', '/settings/create/backup/password/show'],
    name: 'Create Wallet Show Phrase',
    component: MnemonicShow,
  },
  {
    path: '/welcome/create/backup/password/show/confirm',
    alias: ['/accounts/create/backup/password/show/confirm', '/settings/create/backup/password/show/confirm'],
    name: 'Create Wallet Recovery Confirm',
    component: MnemonicConfirm,
  },
  /** Account Import flows */
  {
    path: '/welcome/account-import-info',
    alias: ['/accounts/account-import-info', '/settings/account-import-info'],
    name: 'Account Import Info',
    component: AccountImportInfo,
  },
  {
    path: '/welcome/account-import-info/account-import',
    alias: ['/accounts/account-import-info/account-import', '/settings/account-import-info/account-import'],
    name: 'Account Import',
    component: AccountImport,
  },
  {
    path: '/ledger/account-import-HD-path',
    alias: [
      '/welcome/account-import-info/account-import/account-import-HD-path',
      '/accounts/account-import-info/account-import/account-import-HD-path',
      '/settings/account-import-info/account-import/account-import-HD-path',
    ],
    name: 'HD Path',
    component: HdPath,
  },
  {
    path: '/welcome/account-import-info/account-import/create',
    alias: [
      '/accounts/account-import-info/account-import/create',
      '/settings/account-import-info/account-import/create',
    ],
    name: 'Create Wallet from Imported',
    component: AccountCreate,
  },
  {
    path: '/create-resume',
    name: 'Account Creation Resume',
    component: AccountCreationResume,
  },
  /** Extension reset flow */
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
  /** Backup (generic) flows */
  {
    path: '/portfolio/backup',
    alias: ['/account/backup'],
    name: 'Account Backup',
    component: AccountBackup,
  },
  {
    path: '/portfolio/backup/password',
    alias: ['/account/backup/password'],
    name: 'Recovery Phrase Password',
    component: MnemonicShowPassword,
  },
  {
    path: '/portfolio/backup/password/show',
    alias: ['/account/backup/password/show'],
    name: 'Recovery Phrase',
    component: MnemonicShow,
  },
  {
    path: '/portfolio/backup/password/show/confirm',
    alias: ['/account/backup/password/show/confirm'],
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
  /** Ledger flows */
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
  /** Accounts flows */
  {
    path: '/accounts',
    name: 'Accounts',
    component: Accounts,
  },
  /** Accounts -- Account settings flows */
  {
    path: '/accounts/account-settings/:index',
    name: 'Account Settings',
    component: AccountSettings,
  },
  /** --- Init Remove flows */
  {
    path: '/accounts/account-settings/:index/account-remove',
    name: 'Account Remove',
    component: AccountRemove,
  },
  {
    path: '/accounts/account-settings/:index/backup',
    alias: ['/accounts/account-settings/:index/account-remove/backup'],
    name: 'Account Settings Backup',
    component: AccountBackup,
  },
  {
    path: '/accounts/account-settings/:index/backup/password',
    alias: ['/accounts/account-settings/:index/account-remove/backup/password'],
    name: 'Account Settings Password',
    component: MnemonicShowPassword,
  },
  {
    path: '/accounts/account-settings/:index/backup/password/show',
    alias: ['/accounts/account-settings/:index/account-remove/backup/password/show'],
    name: 'Account Settings Show Phrase',
    component: MnemonicShow,
  },
  {
    path: '/accounts/account-settings/:index/backup/password/show/confirm',
    alias: ['/accounts/account-settings/:index/account-remove/backup/password/show/confirm'],
    name: 'Account Settings Recovery Confirm',
    component: MnemonicConfirm,
  },
  /** --- Init Update flow */
  {
    path: '/accounts/account-settings/:index/account-rename',
    name: 'Account Rename',
    component: AccountRename,
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
  /** Receive flows */
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
