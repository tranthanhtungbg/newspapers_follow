'use client';

import { useRef, useState } from 'react';
import { useUiStore, FONT_SIZE_CLASS, FONT_FAMILY_CLASS, LINE_HEIGHT_CLASS, READING_WIDTH_CLASS } from '@/stores/ui.store';
import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import { useClickOutside } from '@/hooks/useClickOutside';
import type { FontSize, FontFamily, LineHeight, ReadingWidth } from '@/stores/ui.store';

// ─── Icons ────────────────────────────────────────────────────────

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const ResetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

// ─── Sub-components ───────────────────────────────────────────────

interface OptionGroupProps<T extends string> {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}

function OptionGroup<T extends string>({ label, value, options, onChange }: OptionGroupProps<T>) {
  return (
    <div className="mb-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            aria-pressed={value === opt.value}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-150
              ${
                value === opt.value
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500'
              }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────

export function AppearanceSettings() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const {
    fontSize, setFontSize,
    fontFamily, setFontFamily,
    lineHeight, setLineHeight,
    readingWidth, setReadingWidth,
    resetAppearance,
  } = useUiStore();

  useClickOutside(panelRef, () => setOpen(false));

  return (
    <div className="relative" ref={panelRef}>
      {/* Trigger button */}
      <button
        id="appearance-settings-btn"
        aria-label="Open appearance settings"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
                    border transition-all duration-200 active:scale-95
                    ${
                      open
                        ? 'bg-blue-50 dark:bg-blue-950 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
      >
        <SettingsIcon />
        <span className="hidden sm:inline">Appearance</span>
      </button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Appearance settings panel"
          className="absolute right-0 top-full mt-2 z-50 w-72
                     bg-white dark:bg-gray-900 rounded-2xl shadow-2xl
                     border border-gray-100 dark:border-gray-800
                     p-5 animate-in slide-in-from-top-2 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Appearance</h3>
            <button
              onClick={resetAppearance}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <ResetIcon />
              Reset
            </button>
          </div>

          {/* Theme */}
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
              Theme
            </p>
            <ThemeSwitcher variant="segmented" className="w-full justify-between" />
          </div>

          <div className="border-t border-gray-100 dark:border-gray-800 my-4" />

          {/* Font Family */}
          <OptionGroup<FontFamily>
            label="Font Family"
            value={fontFamily}
            onChange={setFontFamily}
            options={[
              { value: 'sans', label: 'Sans-serif' },
              { value: 'serif', label: 'Serif' },
              { value: 'mono', label: 'Mono' },
            ]}
          />

          {/* Font Size */}
          <OptionGroup<FontSize>
            label="Text Size"
            value={fontSize}
            onChange={setFontSize}
            options={[
              { value: 'sm', label: 'S' },
              { value: 'base', label: 'M' },
              { value: 'lg', label: 'L' },
              { value: 'xl', label: 'XL' },
              { value: '2xl', label: 'XXL' },
            ]}
          />

          {/* Line Height */}
          <OptionGroup<LineHeight>
            label="Line Spacing"
            value={lineHeight}
            onChange={setLineHeight}
            options={[
              { value: 'snug', label: 'Compact' },
              { value: 'normal', label: 'Normal' },
              { value: 'relaxed', label: 'Relaxed' },
              { value: 'loose', label: 'Loose' },
            ]}
          />

          {/* Reading Width */}
          <OptionGroup<ReadingWidth>
            label="Reading Width"
            value={readingWidth}
            onChange={setReadingWidth}
            options={[
              { value: 'narrow', label: 'Narrow' },
              { value: 'normal', label: 'Normal' },
              { value: 'wide', label: 'Wide' },
            ]}
          />

          {/* Live Preview */}
          <div className="mt-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-400 mb-1">Preview</p>
            <p
              className={`text-gray-700 dark:text-gray-300 transition-all duration-200
                ${FONT_SIZE_CLASS[fontSize]}
                ${FONT_FAMILY_CLASS[fontFamily]}
                ${LINE_HEIGHT_CLASS[lineHeight]}`}
            >
              The quick brown fox jumps over the lazy dog.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
