import React, { FunctionComponent, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  IbanCoordinates,
  ScanCoordinates,
} from '@/harbour/gen/ramp/v1/public_pb';
import { BankAccount as Account } from '@/types/bankAccount';
import { PencilIcon, SaveIcon } from 'lucide-react';

export interface BankAccountProps {
  account: Account;
  onChange?: (account: Account) => void;
  error: boolean;
}

export const BankAccountWithIcon: FunctionComponent<BankAccountProps> = ({
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
  const [editable, setEditable] = React.useState(false);
  const [ibanValue, setIbanValue] = React.useState(iban.iban);
  const inputRef = useRef<HTMLInputElement>(null);

  const saveChanges = () => {
    setEditable(false);
    if (onChange) {
      onChange(
        new IbanCoordinates({
          iban: ibanValue,
        }),
      );
    }
  };

  return (
    <div className="flex flex-col w-full items-start">
      <Label htmlFor="iban">IBAN</Label>
      <div className="flex w-full items-center gap-4">
        <Input
          ref={inputRef}
          type="text"
          id="iban"
          placeholder="IBAN"
          error={error ? 'Invalid IBAN' : null}
          readOnly={!editable}
          value={ibanValue}
          onChange={(e) => setIbanValue(e.target.value)}
          className={!editable ? 'text-gray-200' : ''}
        />
        {editable ? (
          <SaveIcon
            onClick={saveChanges}
            className="stroke-green cursor-pointer"
          />
        ) : (
          <PencilIcon
            className="stroke-gray-50 cursor-pointer"
            onClick={() => {
              setEditable(true);
              inputRef.current?.focus();
              inputRef.current?.select();
            }}
          />
        )}
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
  const [editable, setEditable] = React.useState(false);
  const [scanValue, setScanValue] = React.useState({
    sortCode: scan.sortCode,
    accountNumber: scan.accountNumber,
  });

  const onSortCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScanValue({
      accountNumber: scanValue.accountNumber,
      sortCode: e.target.value,
    });
  };
  const onAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setScanValue({
      accountNumber: e.target.value,
      sortCode: scanValue.sortCode,
    });
  };

  const saveChanges = () => {
    setEditable(false);
    if (onChange) {
      onChange(new ScanCoordinates(scanValue));
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
          readOnly={!editable}
          value={scanValue.sortCode}
          onChange={onSortCodeChange}
          error={error ? 'Invalid Bank Number' : null}
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
            readOnly={!editable}
            value={scanValue.accountNumber}
            onChange={onAccountNumberChange}
            error={error ? 'Invalid Bank Number' : null}
          />
          {editable ? (
            <SaveIcon
              onClick={saveChanges}
              className="stroke-green cursor-pointer"
            />
          ) : (
            <PencilIcon
              className="stroke-gray-50 cursor-pointer"
              onClick={() => setEditable(true)}
            />
          )}
        </div>
      </div>
    </div>
  );
};
