import { BankAccount } from '@harbour/client';
import { GetAccountInfoResponse_Account } from '@harbour/client/src/schema/gen/ramp/v1/public_pb';

export const getRampBankAccount = (
  account: GetAccountInfoResponse_Account,
): BankAccount => {
  if (account.offrampBankAccount) {
    switch (account.offrampBankAccount.case) {
      case 'offrampIban':
        return {
          case: 'iban',
          value: account.offrampBankAccount.value,
        };
      case 'offrampScan':
        return {
          case: 'scan',
          value: account.offrampBankAccount.value,
        };
    }
  }

  if (account.onrampBankAccount) {
    switch (account.onrampBankAccount.case) {
      case 'onrampIban':
        return {
          case: 'iban',
          value: account.onrampBankAccount.value,
        };
      case 'onrampScan':
        return {
          case: 'scan',
          value: account.onrampBankAccount.value,
        };
      default:
        throw new Error('onramp bank account must always be set!');
    }
  }

  throw new Error('either offramp or onramp bank account must always be set!');
};
