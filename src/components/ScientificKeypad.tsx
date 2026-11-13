import { Delete } from 'lucide-react';

interface ScientificKeypadProps {
  onInput: (token: string) => void;
  onClear: () => void;
  onBackspace: () => void;
  onEvaluate: () => void;
}

export function ScientificKeypad({
  onInput,
  onClear,
  onBackspace,
  onEvaluate,
}: ScientificKeypadProps) {
  const keyClass =
    'min-h-[44px] sm:min-h-[46px] rounded-[13px] flex items-center justify-center font-semibold text-[15px] sm:text-[16px] select-none cursor-pointer focus-visible:outline-2 focus-visible:outline-[#fff2a6]';

  return (
    <div className="bronze-keypad-tray rounded-[22px] p-3 sm:p-3.5">
      <div className="grid grid-cols-4 gap-2">
        {/* Row 1 */}
        <button type="button" onClick={onClear} className={`${keyClass} btn-gold-key font-bold`}>
          C
        </button>
        <button
          type="button"
          onClick={onBackspace}
          className={`${keyClass} btn-gold-key`}
          aria-label="Backspace"
        >
          <Delete className="w-5 h-5 stroke-[2.2]" />
        </button>
        <button type="button" onClick={() => onInput('!')} className={`${keyClass} btn-gold-key`}>
          x!
        </button>
        <button
          type="button"
          onClick={() => onInput('÷')}
          className={`${keyClass} btn-obsidian-key text-[19px]`}
        >
          ÷
        </button>

        {/* Row 2 */}
        <button type="button" onClick={() => onInput('(')} className={`${keyClass} btn-gold-key`}>
          (
        </button>
        <button type="button" onClick={() => onInput(')')} className={`${keyClass} btn-gold-key`}>
          )
        </button>
        <button type="button" onClick={() => onInput('²')} className={`${keyClass} btn-gold-key`}>
          x²
        </button>
        <button
          type="button"
          onClick={() => onInput('×')}
          className={`${keyClass} btn-obsidian-key text-[19px]`}
        >
          ×
        </button>

        {/* Row 3 */}
        <button type="button" onClick={() => onInput('sin(')} className={`${keyClass} btn-gold-key`}>
          sin
        </button>
        <button type="button" onClick={() => onInput('cos(')} className={`${keyClass} btn-gold-key`}>
          cos
        </button>
        <button type="button" onClick={() => onInput('tan(')} className={`${keyClass} btn-gold-key`}>
          tan
        </button>
        <button
          type="button"
          onClick={() => onInput('-')}
          className={`${keyClass} btn-obsidian-key text-[20px]`}
        >
          -
        </button>

        {/* Row 4 */}
        <button type="button" onClick={() => onInput('log(')} className={`${keyClass} btn-gold-key`}>
          log
        </button>
        <button type="button" onClick={() => onInput('ln(')} className={`${keyClass} btn-gold-key`}>
          ln
        </button>
        <button type="button" onClick={() => onInput('^')} className={`${keyClass} btn-gold-key`}>
          x^y
        </button>
        <button
          type="button"
          onClick={() => onInput('+')}
          className={`${keyClass} btn-obsidian-key text-[19px]`}
        >
          +
        </button>

        {/* Row 5 */}
        <button type="button" onClick={() => onInput('√(')} className={`${keyClass} btn-gold-key`}>
          √
        </button>
        <button type="button" onClick={() => onInput('.')} className={`${keyClass} btn-gold-key text-[19px]`}>
          .
        </button>
        <button type="button" onClick={() => onInput('π')} className={`${keyClass} btn-gold-key`}>
          π
        </button>
        <button type="button" onClick={() => onInput('e')} className={`${keyClass} btn-gold-key`}>
          e
        </button>

        {/* Row 6 */}
        <button type="button" onClick={() => onInput('7')} className={`${keyClass} btn-gold-key`}>
          7
        </button>
        <button type="button" onClick={() => onInput('8')} className={`${keyClass} btn-gold-key`}>
          8
        </button>
        <button type="button" onClick={() => onInput('9')} className={`${keyClass} btn-gold-key`}>
          9
        </button>
        <button type="button" onClick={() => onInput('%')} className={`${keyClass} btn-gold-key`}>
          %
        </button>

        {/* Row 7 */}
        <button type="button" onClick={() => onInput('4')} className={`${keyClass} btn-gold-key`}>
          4
        </button>
        <button type="button" onClick={() => onInput('5')} className={`${keyClass} btn-gold-key`}>
          5
        </button>
        <button type="button" onClick={() => onInput('6')} className={`${keyClass} btn-gold-key`}>
          6
        </button>
        <button type="button" onClick={() => onInput('0')} className={`${keyClass} btn-gold-key`}>
          0
        </button>

        {/* Row 8 */}
        <button type="button" onClick={() => onInput('1')} className={`${keyClass} btn-gold-key`}>
          1
        </button>
        <button type="button" onClick={() => onInput('2')} className={`${keyClass} btn-gold-key`}>
          2
        </button>
        <button type="button" onClick={() => onInput('3')} className={`${keyClass} btn-gold-key`}>
          3
        </button>
        <button
          type="button"
          onClick={onEvaluate}
          className={`${keyClass} btn-obsidian-key text-[20px] font-bold`}
          aria-label="Equals"
        >
          =
        </button>
      </div>
    </div>
  );
}
