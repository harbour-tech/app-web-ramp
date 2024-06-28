import { BankAccount } from '@harbour/client';
import {
  GetAccountInfoResponse_Account,
  IbanCoordinates,
  ScanCoordinates,
} from '@harbour/client/src/schema/gen/ramp/v1/public_pb';

export const getOffRampBankAccount = (
  acc: GetAccountInfoResponse_Account,
): BankAccount => {
  switch (acc.offrampBankAccount?.case) {
    case 'offrampIban':
      return {
        case: 'iban',
        value: acc.offrampBankAccount.value,
      };
    case 'offrampScan':
      return {
        case: 'scan',
        value: acc.offrampBankAccount.value,
      };
    default:
      switch (acc.onrampBankAccount?.case) {
        case 'onrampIban':
          return {
            case: 'iban',
            value: new IbanCoordinates(),
          };
        case 'onrampScan':
          return {
            case: 'scan',
            value: new ScanCoordinates(),
          };
        default:
          throw new Error('onramp bank account must always be set!');
      }
  }
};
