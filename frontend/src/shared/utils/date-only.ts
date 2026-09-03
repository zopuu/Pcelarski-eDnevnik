const dateOnlyPattern = /^\d{4}-\d{2}-\d{2}$/;

export function isDateOnly(value: string) {
  if (!dateOnlyPattern.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);

  if (year < 1) {
    return false;
  }

  const date = new Date(0);

  date.setFullYear(year, month - 1, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function parseDateOnly(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(0);

  date.setFullYear(year, month - 1, day);

  return date;
}

export function formatDateOnly(value: Date) {
  const year = String(value.getFullYear()).padStart(4, '0');
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function formatDateOnlyForDisplay(value: string) {
  const [year, month, day] = value.split('-');

  return year && month && day ? `${day}.${month}.${year}.` : 'Izaberite datum';
}
