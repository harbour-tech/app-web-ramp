import React, { FunctionComponent, useRef, useEffect } from 'react';
import { Label, Input } from '@harbour/components';
import {
  IbanCoordinates,
  ScanCoordinates,
} from '@harbour/client/src/schema/gen/ramp/v1/public_pb';
import { BankAccount as Account } from '@harbour/client/src/RampClient/types';
import { PencilIcon, SaveIcon, XIcon } from 'lucide-react';

export interface BankAccountProps {
  account: Account;
  onChange?: (account: Account) => void;
  error: boolean | string;
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
  error?: boolean | string;
}

const Iban: FunctionComponent<IbanProps> = ({ iban, onChange, error }) => {
  const [editable, setEditable] = React.useState(false);
  const [ibanValue, setIbanValue] = React.useState(iban.iban);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editable && (error === undefined || error === false)) {
      setEditable(false);
    }
  }, [error]);

  const saveChanges = () => {
    if (onChange) {
      onChange(
        new IbanCoordinates({
          iban: ibanValue,
        }),
      );
    }
  };

  const dropChanges = () => {
    setIbanValue(iban.iban);
    if (onChange) {
      onChange(
        new IbanCoordinates({
          iban: iban.iban,
        }),
      );
    }
    setEditable(false);
  };

  const fullError =
    typeof error === 'string' ? error : error ? 'Invalid IBAN' : null;

  return (
    <div className="flex flex-col w-full items-start h-full">
      <Label htmlFor="iban">IBAN</Label>
      <div className="flex w-full items-center gap-4">
        <Input
          ref={inputRef}
          type="text"
          id="iban"
          placeholder="IBAN"
          error={fullError}
          readOnly={!editable}
          value={ibanValue}
          onChange={(e) => setIbanValue(e.target.value)}
          className={!editable ? 'text-gray-200' : ''}
        />
        <div className="flex gap-2 h-full pt-2">
          {editable ? (
            <>
              <SaveIcon
                onClick={saveChanges}
                className="stroke-green cursor-pointer"
              />
              <XIcon
                onClick={dropChanges}
                className="stroke-red cursor-pointer"
              />
            </>
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
    </div>
  );
};

interface ScanProps {
  scan: ScanCoordinates;
  onChange?: (scan: ScanCoordinates) => void;
  error?: boolean | string;
}

const Scan: FunctionComponent<ScanProps> = ({ scan, onChange, error }) => {
  const [editable, setEditable] = React.useState(false);
  const [scanValue, setScanValue] = React.useState({
    sortCode: scan.sortCode,
    accountNumber: scan.accountNumber,
  });

  useEffect(() => {
    if (editable && (error === undefined || error === false)) {
      setEditable(false);
    }
  }, [error]);

  const onSortCodeChange = (value: string) => {
    setScanValue({
      accountNumber: scanValue.accountNumber,
      sortCode: value,
    });
  };

  const onAccountNumberChange = (value: string) => {
    setScanValue({
      accountNumber: value,
      sortCode: scanValue.sortCode,
    });
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: 'accountNumber' | 'sortCode',
  ) => {
    let newValue = event.target.value;

    newValue = newValue.replace(/[^0-9]/g, '');

    if (type === 'sortCode' && newValue.length > 6) {
      newValue = newValue.substring(0, 6);
    } else if (type === 'accountNumber' && newValue.length > 30) {
      newValue = newValue.substring(0, 30);
    }

    if (type === 'sortCode') {
      onSortCodeChange(newValue);
    } else {
      onAccountNumberChange(newValue);
    }
  };

  const saveChanges = () => {
    if (onChange) {
      onChange(
        new ScanCoordinates({
          accountNumber: scanValue.accountNumber,
          sortCode: scanValue.sortCode,
        }),
      );
    }
  };

  const dropChanges = () => {
    setScanValue({
      accountNumber: scan.accountNumber,
      sortCode: scan.sortCode,
    });
    if (onChange) {
      onChange(
        new ScanCoordinates({
          accountNumber: scan.accountNumber,
          sortCode: scan.sortCode,
        }),
      );
    }
    setEditable(false);
  };

  const errorForAccountNumberCode =
    typeof error === 'string' || error ? ' ' : null;
  const fullError =
    typeof error === 'string'
      ? error
      : error
      ? 'Invalid Sort Code or Account Number'
      : null;

  return (
    <>
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
            onChange={(e) => handleInputChange(e, 'sortCode')}
            error={errorForAccountNumberCode}
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
              onChange={(e) => handleInputChange(e, 'accountNumber')}
              error={errorForAccountNumberCode}
            />
            {editable ? (
              <>
                <SaveIcon
                  onClick={saveChanges}
                  className="stroke-green cursor-pointer"
                />
                <XIcon
                  onClick={dropChanges}
                  className="stroke-red cursor-pointer"
                />
              </>
            ) : (
              <PencilIcon
                className="stroke-gray-50 cursor-pointer"
                onClick={() => {
                  setEditable(true);
                }}
              />
            )}
          </div>
        </div>
      </div>
      {fullError && (
        <p className="text-red text-xs mt-1 flex w-full">{fullError}</p>
      )}
    </>
  );
};
