import { useEffect } from 'react';
import { Award } from 'lucide-react';

interface AboutPanelProps {
  onDisplaySync: (expression: string, result: string) => void;
}

export function AboutPanel({ onDisplaySync }: AboutPanelProps) {
  useEffect(() => {
    onDisplaySync('Developed by', 'J L Martin');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bronze-keypad-tray rounded-[22px] p-4 space-y-3.5">
      <div className="border-b lux-border-subtle pb-2 flex items-center justify-between">
        <span className="text-[14px] font-semibold lux-text-bright">
          About Us
        </span>
        <span className="text-[11px] font-mono lux-text-muted">Lux Calc</span>
      </div>

      <div className="obsidian-display-screen rounded-[16px] p-5 border lux-border-subtle text-center space-y-3">
        <div className="w-12 h-12 rounded-[14px] btn-gold-key mx-auto flex items-center justify-center">
          <Award className="w-6 h-6" />
        </div>

        <div>
          <h3
            className="text-[22px] font-bold gold-text-foil"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Lux Calc
          </h3>
          <p className="text-[13px] lux-text-soft mt-1.5 leading-relaxed">
            This application has been developed by{' '}
            <span className="font-bold lux-text-bright">J L Martin</span>.
          </p>
        </div>

        <p className="text-[12px] lux-text-muted leading-relaxed pt-2 border-t lux-border-subtle">
          Crafted with precious-metal precision for everyday arithmetic,
          scientific computation, live currency &amp; unit conversion, personal
          finance, wealth planning, and date &amp; time calculations.
        </p>
      </div>
    </div>
  );
}
