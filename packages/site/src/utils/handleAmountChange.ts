// amountChangeHandler.ts
export const handleAmountChange = (
  event: React.ChangeEvent<HTMLInputElement>,
  setAmount: (amount: string) => void,
) => {
  let value = event.target.value;

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
  if (result.endsWith(decimalSeparator)) {
    const dotIndex = result.indexOf(decimalSeparator);
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

  // Remove all non-numeric characters except for the decimal separator
  result = result.replace(new RegExp(`[^\\d${decimalSeparator}]`, 'g'), '');

  // Don't update the state if the new value contains more than one decimal separator
  if (
    (result.match(new RegExp(`\\${decimalSeparator}`, 'g')) || []).length > 1
  ) {
    return;
  }

  setAmount(result);
};
