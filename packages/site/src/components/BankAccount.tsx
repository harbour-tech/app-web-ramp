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
  error?: boolean;
}

export const BankAccount: FunctionComponent<BankAccountProps> = ({
  account,
  onChange,
  error,
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
        <Iban error={error} iban={account.value} onChange={onIbanChange} />
      )}
      {account.case == 'scan' && (
        <Scan error={error} scan={account.value} onChange={onScanChange} />
      )}
    </>
  );
};

interface IbanProps {
  iban: IbanCoordinates;
  onChange?: (iban: IbanCoordinates) => void;
  error?: boolean;
}

const Iban: FunctionComponent<IbanProps> = ({ iban, onChange, error }) => {
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
    <div className="flex flex-col w-full items-start">
      <Label htmlFor="iban">IBAN</Label>
      <div className="flex w-full items-center gap-4">
        <Input
          type="text"
          id="iban"
          placeholder="IBAN"
          readOnly={!onChange}
          value={iban.iban}
          onChange={onIbanChange}
          error={error ? 'Invalid IBAN' : ''}
        />
      </div>
    </div>
  );
};

interface ScanProps {
  scan: ScanCoordinates;
  onChange?: (scan: ScanCoordinates) => void;
  error?: boolean;
}

const Scan: FunctionComponent<ScanProps> = ({ scan, onChange, error }) => {
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
    <div className="flex gap-4">
      <div className="w-3/5 items-center">
        <Label htmlFor="sortCode">Sort Code</Label>
        <Input
          type="text"
          id="sortCode"
          placeholder="000000"
          maxLength={6}
          pattern="\d+"
          readOnly={!onChange}
          value={scan.sortCode}
          onChange={onSortCodeChange}
          error={error ? 'Invalid Bank Number' : ''}
        />
      </div>
      <div className="w-full items-center">
        <Label htmlFor="accountNumber">Account Number</Label>
        <div className="flex items-center gap-4">
          <Input
            type="text"
            id="accountNumber"
            placeholder="123456789"
            maxLength={30}
            pattern="\d+"
            readOnly={!onChange}
            value={scan.accountNumber}
            onChange={onAccountNumberChange}
            error={error ? 'Invalid Bank Number' : ''}
          />
        </div>
      </div>
    </div>
  );
};
