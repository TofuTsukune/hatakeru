import type { ReactNode } from 'react';

interface Props {
  label: string;
  children: ReactNode;
  required?: boolean;
}

export function FormField({ label, children, required }: Props) {
  return (
    <div className="mb-3">
      <label className="block text-xs mb-1.5 font-medium" style={{ color: 'var(--c-muted)' }}>
        {label}
        {required && <span className="ml-1" style={{ color: 'var(--c-danger)' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

export const inputCls = [
  'w-full rounded-md px-3 py-2 text-sm outline-none transition-colors',
  'placeholder:text-[var(--c-faint)]',
].join(' ');

export const inputStyle = {
  background: 'var(--c-hover)',
  border: '1px solid var(--c-border)',
  color: 'var(--c-text)',
  fontFamily: 'inherit',
};

export const selectCls = inputCls;
export const selectStyle = { ...inputStyle, cursor: 'pointer' };
