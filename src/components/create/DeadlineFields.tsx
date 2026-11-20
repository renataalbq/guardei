import { addDays, firstDayOfYear, lastDayOfYear, yearOf } from '../../domain/calendarDate';
import type { CalendarDate } from '../../domain/types';
import { ChoiceChip } from '../ui/ChoiceChip';
import { FormField, textInputClassName } from '../ui/FormField';

const YEARS_OFFERED_AHEAD = 4;

interface DeadlineFieldsProps {
  today: CalendarDate;
  startDate: CalendarDate;
  endDate: CalendarDate | undefined;
  onStartDateChange: (date: CalendarDate) => void;
  onEndDateChange: (date: CalendarDate | undefined) => void;
}

export function DeadlineFields({ today, startDate, endDate, onStartDateChange, onEndDateChange }: DeadlineFieldsProps) {
  const nextNewYear = firstDayOfYear(yearOf(today) + 1);
  const firstYearOffered = yearOf(startDate || today);
  const yearsOffered = Array.from({ length: YEARS_OFFERED_AHEAD }, (_, index) => firstYearOffered + index);
  const minimumEndDate = startDate ? addDays(startDate, 1) : undefined;

  return (
    <>
      <FormField label="Quando começa?" htmlFor="start-date">
        <div className="flex flex-wrap gap-2">
          <ChoiceChip selected={startDate === today} onSelect={() => onStartDateChange(today)}>
            Hoje
          </ChoiceChip>
          <ChoiceChip selected={startDate === nextNewYear} onSelect={() => onStartDateChange(nextNewYear)}>
            1º de janeiro de {yearOf(nextNewYear)}
          </ChoiceChip>
        </div>
        <input
          id="start-date"
          type="date"
          value={startDate}
          onChange={(event) => onStartDateChange(event.target.value)}
          className={textInputClassName}
        />
      </FormField>

      <FormField label="Até quando? (opcional)" htmlFor="end-date" hint="Com prazo, o app calcula quanto guardar por dia.">
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          <ChoiceChip selected={endDate === undefined} onSelect={() => onEndDateChange(undefined)}>
            Sem prazo
          </ChoiceChip>
          {yearsOffered.map((year) => (
            <ChoiceChip key={year} selected={endDate === lastDayOfYear(year)} onSelect={() => onEndDateChange(lastDayOfYear(year))}>
              Até dez/{year}
            </ChoiceChip>
          ))}
        </div>
        <input
          id="end-date"
          type="date"
          value={endDate ?? ''}
          min={minimumEndDate}
          onChange={(event) => onEndDateChange(event.target.value || undefined)}
          className={textInputClassName}
        />
      </FormField>
    </>
  );
}
