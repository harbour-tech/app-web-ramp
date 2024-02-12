import React, { FunctionComponent } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  IbanCoordinates,
  ScanCoordinates,
} from '@/harbour/gen/ramp/v1/public_pb';
import { BankAccount as Account } from '@/types/bankAccount';

export interface BankAccountProps {
  account: Account;
  onChange?: (account: Account) => void;
}

export const BankAccount: FunctionComponent<BankAccountProps> = ({
  account,
  onChange,
}) => {
  const onIbanChange = (iban: IbanCoordinates) => {
    if (!onChange) {
      return;
    }

    onChange({
      case: 'iban',
      value: iban,
    });
  };
  const onScanChange = (scan: ScanCoordinates) => {
    if (!onChange) {
      return;
    }
    onChange({
      case: 'scan',
      value: scan,
    });
  };

  return (
    <>
      {account.case == 'iban' && (
        <Iban iban={account.value} onChange={onIbanChange} />
      )}
      {account.case == 'scan' && (
        <Scan scan={account.value} onChange={onScanChange} />
      )}
    </>
  );
};

interface IbanProps {
  iban: IbanCoordinates;
  onChange?: (iban: IbanCoordinates) => void;
}

const Iban: FunctionComponent<IbanProps> = ({ iban, onChange }) => {
  const onIbanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(
        new IbanCoordinates({
          iban: e.target.value,
        }),
      );
    }
  };

  return (
    <div className="w-full max-w-sm items-center">
      <Label htmlFor="iban">IBAN</Label>
      <Input
        type="text"
        id="iban"
        placeholder="IBAN"
        readOnly={!onChange}
        value={iban.iban}
        onChange={onIbanChange}
      />
    </div>
  );
};

interface ScanProps {
  scan: ScanCoordinates;
  onChange?: (scan: ScanCoordinates) => void;
}

const Scan: FunctionComponent<ScanProps> = ({ scan, onChange }) => {
  const onSortCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(
        new ScanCoordinates({
          accountNumber: scan.accountNumber,
          sortCode: e.target.value,
        }),
      );
    }
  };
  const onAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(
        new ScanCoordinates({
          accountNumber: e.target.value,
          sortCode: scan.sortCode,
        }),
      );
    }
  };

  return (
    <>
      <div className="w-full max-w-sm items-center">
        <Label htmlFor="sortCode">Sort Code</Label>
        <Input
          type="text"
          id="sortCode"
          placeholder="Sort Code"
          readOnly={!onChange}
          value={scan.sortCode}
          onChange={onSortCodeChange}
        />
      </div>
      <div className="w-full max-w-sm items-center">
        <Label htmlFor="accountNumber">Account Number</Label>
        <Input
          type="text"
          id="accountNumber"
          placeholder="Account Number"
          readOnly={!onChange}
          value={scan.accountNumber}
          onChange={onAccountNumberChange}
        />
      </div>
    </>
  );
};
