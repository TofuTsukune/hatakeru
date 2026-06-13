import type { ReactNode } from 'react';

interface Props {
  label: string;
  children: ReactNode;
  required?: boolean;
}

export function FormField({ label, children, required }: Props) {
  return (
    <div className="mb-3">
      <label className="block text-xs text-[#a0aec0] mb-1">
        {label}
        {required && <span className="text-[#fc8181] ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}

export const inputCls =
  'w-full bg-[#0f3460] border border-[#2d3748] rounded-lg px-3 py-2 text-sm text-[#e2e8f0] focus:outline-none focus:border-[#63b3ed]';

export const selectCls = inputCls;
