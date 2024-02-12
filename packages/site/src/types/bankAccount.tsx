import {
  IbanCoordinates,
  ScanCoordinates,
} from '@/harbour/gen/ramp/v1/public_pb';

export type BankAccount =
  | {
      value: ScanCoordinates;
      case: 'scan';
    }
  | {
      value: IbanCoordinates;
      case: 'iban';
    };

export default BankAccount;
