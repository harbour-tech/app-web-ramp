import { BankAccount } from '@harbour/client';
import { GetAccountInfoResponse_Account } from '@harbour/client/src/schema/gen/ramp/v1/public_pb';

export function getOnRampBankAccount(
  account: GetAccountInfoResponse_Account,
): BankAccount {
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
      throw 'onramp bank account must be set!';
  }
}
