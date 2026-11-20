const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

/** Formata um valor inteiro em reais: 20000 → "R$ 20.000". */
export function formatCurrency(valueInReais: number): string {
  return brlFormatter.format(Math.round(valueInReais));
}

const compactNumberFormatter = new Intl.NumberFormat('pt-BR');

/** Número sem símbolo de moeda, para as células: 1500 → "1.500". */
export function formatCellNumber(value: number): string {
  return compactNumberFormatter.format(value);
}
