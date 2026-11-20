import { SEQUENTIAL_STEPS, type SequentialStep } from '../../domain/types';
import { ChoiceChip } from '../ui/ChoiceChip';

function describeStep(step: SequentialStep): string {
  return `${step}, ${step * 2}, ${step * 3}…`;
}

interface StepPickerProps {
  value: SequentialStep;
  onChange: (step: SequentialStep) => void;
}

export function StepPicker({ value, onChange }: StepPickerProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {SEQUENTIAL_STEPS.map((step) => (
        <ChoiceChip key={step} selected={step === value} onSelect={() => onChange(step)}>
          {describeStep(step)}
        </ChoiceChip>
      ))}
    </div>
  );
}
