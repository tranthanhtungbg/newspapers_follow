'use client';

import { ThemeSwitcher } from '@/components/ui/ThemeSwitcher';
import { useUiStore } from '@/stores/ui.store';
import type { FontSize, FontFamily, LineHeight, ReadingWidth } from '@/stores/ui.store';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
      {children}
    </h2>
  );
}

function OptionGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; description?: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="mb-6">
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            aria-pressed={value === opt.value}
            title={opt.description}
            className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
              value === opt.value
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-blue-400'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const {
    fontSize, setFontSize,
    fontFamily, setFontFamily,
    lineHeight, setLineHeight,
    readingWidth, setReadingWidth,
    resetAppearance,
  } = useUiStore();

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Customize your reading experience.
        </p>
      </div>

      {/* Appearance section */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 mb-6">
        <SectionTitle>Appearance</SectionTitle>

        {/* Theme */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Theme</p>
          <ThemeSwitcher variant="segmented" />
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 my-6" />

        <OptionGroup<FontFamily>
          label="Font Family"
          value={fontFamily}
          onChange={setFontFamily}
          options={[
            { value: 'sans', label: 'Sans-serif', description: 'Clean and modern' },
            { value: 'serif', label: 'Serif', description: 'Classic reading font (Lora)' },
            { value: 'mono', label: 'Monospace', description: 'Code-style font' },
          ]}
        />

        <OptionGroup<FontSize>
          label="Text Size"
          value={fontSize}
          onChange={setFontSize}
          options={[
            { value: 'sm', label: 'Small' },
            { value: 'base', label: 'Normal' },
            { value: 'lg', label: 'Large' },
            { value: 'xl', label: 'X-Large' },
            { value: '2xl', label: 'XX-Large' },
          ]}
        />

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

        {/* Live preview */}
        <div className="mt-2 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-400 mb-2">Reading preview</p>
          <p className={`text-gray-700 dark:text-gray-300
            text-${fontSize} font-${fontFamily} leading-${lineHeight} transition-all duration-300`}>
            The quick brown fox jumps over the lazy dog. Language learning becomes natural when
            you read content you actually enjoy.
          </p>
        </div>

        <button
          onClick={resetAppearance}
          className="mt-4 text-sm text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
        >
          Reset to defaults
        </button>
      </div>
    </div>
  );
}
