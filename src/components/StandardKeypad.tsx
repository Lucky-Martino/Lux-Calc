import { Delete } from 'lucide-react';

interface StandardKeypadProps {
  onInput: (token: string) => void;
  onClear: () => void;
  onBackspace: () => void;
  onEvaluate: () => void;
}

export function StandardKeypad({
  onInput,
  onClear,
  onBackspace,
  onEvaluate,
}: StandardKeypadProps) {
  const keyClass =
    'min-h-[54px] sm:min-h-[58px] rounded-[16px] flex items-center justify-center font-semibold text-[21px] select-none cursor-pointer focus-visible:outline-2 focus-visible:outline-[#fff2a6]';

  return (
    <div className="bronze-keypad-tray rounded-[22px] p-3.5 sm:p-4">
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
        {/* Row 1 */}
        <button
          type="button"
          onClick={onClear}
          className={`${keyClass} btn-gold-key font-bold`}
          aria-label="Clear"
        >
          C
        </button>
        <button
          type="button"
          onClick={onBackspace}
          className={`${keyClass} btn-gold-key`}
          aria-label="Backspace"
        >
          <Delete className="w-6 h-6 stroke-[2.2]" />
        </button>
        <button
          type="button"
          onClick={() => onInput('%')}
          className={`${keyClass} btn-gold-key`}
          aria-label="Percent"
        >
          %
        </button>
        <button
          type="button"
          onClick={() => onInput('÷')}
          className={`${keyClass} btn-obsidian-key text-[24px]`}
          aria-label="Divide"
        >
          ÷
        </button>

        {/* Row 2 */}
        <button
          type="button"
          onClick={() => onInput('7')}
          className={`${keyClass} btn-gold-key`}
        >
          7
        </button>
        <button
          type="button"
          onClick={() => onInput('8')}
          className={`${keyClass} btn-gold-key`}
        >
          8
        </button>
        <button
          type="button"
          onClick={() => onInput('9')}
          className={`${keyClass} btn-gold-key`}
        >
          9
        </button>
        <button
          type="button"
          onClick={() => onInput('×')}
          className={`${keyClass} btn-obsidian-key text-[23px]`}
          aria-label="Multiply"
        >
          ×
        </button>

        {/* Row 3 */}
        <button
          type="button"
          onClick={() => onInput('4')}
          className={`${keyClass} btn-gold-key`}
        >
          4
        </button>
        <button
          type="button"
          onClick={() => onInput('5')}
          className={`${keyClass} btn-gold-key`}
        >
          5
        </button>
        <button
          type="button"
          onClick={() => onInput('6')}
          className={`${keyClass} btn-gold-key`}
        >
          6
        </button>
        <button
          type="button"
          onClick={() => onInput('-')}
          className={`${keyClass} btn-obsidian-key text-[25px]`}
          aria-label="Subtract"
        >
          -
        </button>

        {/* Row 4 */}
        <button
          type="button"
          onClick={() => onInput('1')}
          className={`${keyClass} btn-gold-key`}
        >
          1
        </button>
        <button
          type="button"
          onClick={() => onInput('2')}
          className={`${keyClass} btn-gold-key`}
        >
          2
        </button>
        <button
          type="button"
          onClick={() => onInput('3')}
          className={`${keyClass} btn-gold-key`}
        >
          3
        </button>
        <button
          type="button"
          onClick={() => onInput('+')}
          className={`${keyClass} btn-obsidian-key text-[24px]`}
          aria-label="Add"
        >
          +
        </button>

        {/* Row 5 — matches screenshot layout: 0, ., = */}
        <button
          type="button"
          onClick={() => onInput('0')}
          className={`${keyClass} btn-gold-key`}
        >
          0
        </button>
        <button
          type="button"
          onClick={() => onInput('.')}
          className={`${keyClass} btn-gold-key text-[24px]`}
          aria-label="Decimal point"
        >
          .
        </button>
        <button
          type="button"
          onClick={onEvaluate}
          className={`${keyClass} btn-obsidian-key text-[25px] font-bold`}
          aria-label="Equals"
        >
          =
        </button>
        <button
          type="button"
          onClick={() => onInput('00')}
          className={`${keyClass} btn-gold-key text-[17px]`}
          aria-label="Double zero"
        >
          00
        </button>
      </div>
    </div>
  );
}
