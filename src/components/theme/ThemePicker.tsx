import { THEMES } from '../../domain/themes';
import type { ThemeId } from '../../domain/types';
import { Icon } from '../ui/Icon';

const PREVIEW_VALUES = [1, 2, 3, 4, 5, 6];
const PREVIEW_SAVED = new Set([2, 4]);

/** Miniatura do tema: usa as próprias variáveis do tema (data-theme no elemento). */
function ThemePreview({ themeId }: { themeId: ThemeId }) {
  return (
    <div data-theme={themeId} className="overflow-hidden rounded-2xl bg-paper ring-1 ring-border" aria-hidden="true">
      <div className="hero-gradient h-6" />
      <div className="grid grid-cols-3 gap-px bg-paper-line">
        {PREVIEW_VALUES.map((value) => (
          <div
            key={value}
            className={`relative flex aspect-square items-center justify-center ${PREVIEW_SAVED.has(value) ? 'cell-paper-saved' : 'cell-paper'}`}
          >
            <span
              className={`font-hand text-lg leading-none font-bold ${PREVIEW_SAVED.has(value) ? 'text-muted/60' : 'text-[var(--cell-number)]'}`}
            >
              {value}
            </span>
            {PREVIEW_SAVED.has(value) && (
              <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full overflow-visible">
                <path
                  d="M12 56 Q 50 44 88 50"
                  fill="none"
                  stroke="var(--marker)"
                  strokeLinecap="round"
                  style={{ strokeWidth: 'calc(9px * var(--marker-scale))', opacity: 'var(--marker-opacity)', filter: 'var(--marker-glow)' }}
                />
              </svg>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface ThemePickerProps {
  value: ThemeId;
  onChange: (theme: ThemeId) => void;
}

export function ThemePicker({ value, onChange }: ThemePickerProps) {
  return (
    <div role="radiogroup" aria-label="Tema" className="grid grid-cols-3 gap-3">
      {THEMES.map((theme) => {
        const selected = theme.id === value;
        return (
          <button
            key={theme.id}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`${theme.name}: ${theme.description}`}
            onClick={() => onChange(theme.id)}
            className={`relative flex flex-col gap-2 rounded-3xl p-1.5 text-left transition-all active:scale-[0.97] ${
              selected ? 'ring-[3px] ring-ink' : 'ring-1 ring-transparent'
            }`}
          >
            <ThemePreview themeId={theme.id} />
            <span className="px-1 pb-1 text-center text-sm font-bold">{theme.name}</span>
            {selected && (
              <span className="absolute top-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-sm text-on-ink">
                <Icon name="check" />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
