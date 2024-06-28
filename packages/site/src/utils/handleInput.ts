import { Dispatch, SetStateAction } from 'react';

type HandleInput = (
  value: string,
  setAmountInput: Dispatch<SetStateAction<string>>,
) => void;

export const handleInput: HandleInput = (value, setAmountInput) => {
  // Determine the decimal separator for the current locale
  const decimalSeparator = (1.1).toLocaleString().substring(1, 2);

  // Replace the non-local decimal separator with the local one
  value = value.replace(decimalSeparator === '.' ? ',' : '.', decimalSeparator);

  // Limit the number of decimal places to two
  let result = value.replace(
    new RegExp(`(\\${decimalSeparator}\\d{2})\\d+`),
    '$1',
  );

  // Check if the result ends with a dot
  if (result.endsWith('.')) {
    const dotIndex = result.indexOf('.');
    // Remove the dot if it is not the last character
    if (dotIndex !== result.length - 1) {
      result = result.substring(0, result.length - 1);
    }
  }

  // Replace two or more leading zeros with a single zero
  result = result.replace(/^00+/, '0');

  // Check if the result starts with a zero and is an integer
  if (result.length > 1 && result.startsWith('0') && result.match(/^[0-9]*$/)) {
    // Remove one leading zero (e.g., change "0123" to "123")
    result = result.replace(/^0/, '');
  }

  // Remove all non-numeric characters except for the dot
  result = result.replace(/[^\d.]/g, '');

  // Set the processed result as the input value
  setAmountInput(result);
};
