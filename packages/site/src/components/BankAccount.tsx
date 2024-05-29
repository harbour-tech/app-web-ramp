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
  error?: boolean | string;
  withCopyToClipboard?: boolean;
}

export const BankAccount: FunctionComponent<BankAccountProps> = ({
  account,
  onChange,
  error,
  withCopyToClipboard,
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

  const commonProps = {
    error,
    withCopyToClipboard,
  };

  if (account.case == 'iban') {
    return (
      <Iban iban={account.value} onChange={onIbanChange} {...commonProps} />
    );
  }
  if (account.case == 'scan') {
    return (
      <Scan scan={account.value} onChange={onScanChange} {...commonProps} />
    );
  }
  return null;
};

interface IbanProps {
  iban: IbanCoordinates;
  onChange?: (iban: IbanCoordinates) => void;
  error?: boolean | string;
  withCopyToClipboard?: boolean;
}

const Iban: FunctionComponent<IbanProps> = ({
  iban,
  onChange,
  error,
  withCopyToClipboard,
}) => {
  const onIbanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(
        new IbanCoordinates({
          iban: e.target.value,
        }),
      );
    }
  };

  const fullError =
    typeof error === 'string' ? error : error ? 'Invalid IBAN' : '';

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
          error={fullError}
          withCopyToClipboard={!!withCopyToClipboard}
        />
      </div>
    </div>
  );
};

interface ScanProps {
  scan: ScanCoordinates;
  onChange?: (scan: ScanCoordinates) => void;
  error?: boolean | string;
  withCopyToClipboard?: boolean;
}

const Scan: FunctionComponent<ScanProps> = ({
  scan,
  onChange,
  error,
  withCopyToClipboard,
}) => {
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

  const fullError =
    typeof error === 'string' ? error : error ? 'Invalid Bank Number' : '';

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
          error={fullError}
          withCopyToClipboard={!!withCopyToClipboard}
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
            withCopyToClipboard={!!withCopyToClipboard}
          />
        </div>
      </div>
    </div>
  );
};
