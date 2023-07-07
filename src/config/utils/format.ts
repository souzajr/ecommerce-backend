export const convertMoney = (value: number): string => {
  const fixedValue = value / 100;

  return fixedValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
};

export const formatDate = (date: string, removeTime?: boolean): string =>
  new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    ...(!removeTime && { timeStyle: 'short' }),
  }).format(new Date(date));

export const formatInitialAndFinalDate = (
  initialDate: string,
  finalDate: string
): { formatedInitialDate: Date; formatedFinalDate: Date } => {
  const formatedInitialDate = new Date(initialDate);
  const formatedFinalDate = new Date(
    new Date(new Date(finalDate).setUTCHours(23, 59, 59, 999)).toISOString()
  );

  return {
    formatedInitialDate,
    formatedFinalDate,
  };
};

export const convertStringDateToTimeStamp = (date?: string): Number => {
  const convertDate = date ? new Date(date) : new Date();

  const getDate = convertDate.setUTCHours(0, 0, 0, 0);

  return getDate;
};
