"use client";

import type { ReactNode } from "react";

export const inputClass =
  "block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-3 text-base text-zinc-900 shadow-sm transition placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-white dark:focus:ring-white/20";

export function Field({
  label,
  htmlFor,
  required,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100"
      >
        {label}
        {required && <span className="text-rose-500"> *</span>}
        {hint && (
          <span className="ml-2 font-normal text-zinc-500 dark:text-zinc-400">
            {hint}
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

export function RadioGroup({
  legend,
  name,
  options,
  value,
  onChange,
  disabled,
  required,
}: {
  legend: string;
  name: string;
  options: readonly string[];
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  required?: boolean;
}) {
  return (
    <fieldset className="space-y-3" disabled={disabled}>
      <legend className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {legend}
        {required && <span className="text-rose-500"> *</span>}
      </legend>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((opt) => {
          const checked = value === opt;
          return (
            <label
              key={opt}
              className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border p-3.5 transition active:scale-[0.99] ${
                checked
                  ? "border-zinc-900 bg-zinc-900/5 dark:border-white dark:bg-white/10"
                  : "border-zinc-200 dark:border-zinc-700"
              }`}
            >
              <input
                type="radio"
                name={name}
                required={required}
                checked={checked}
                onChange={() => onChange(opt)}
                className="h-5 w-5 shrink-0 accent-zinc-900 dark:accent-white"
              />
              <span className="text-base text-zinc-900 dark:text-zinc-100">{opt}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function CheckboxGroup({
  legend,
  options,
  values,
  onToggle,
  disabled,
  required,
}: {
  legend: string;
  options: readonly string[];
  values: string[];
  onToggle: (v: string) => void;
  disabled?: boolean;
  required?: boolean;
}) {
  return (
    <fieldset className="space-y-3" disabled={disabled}>
      <legend className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100">
        {legend}
        {required && <span className="text-rose-500"> *</span>}
      </legend>
      <div className="grid gap-2">
        {options.map((opt) => {
          const checked = values.includes(opt);
          return (
            <label
              key={opt}
              className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border p-3.5 transition active:scale-[0.99] ${
                checked
                  ? "border-zinc-900 bg-zinc-900/5 dark:border-white dark:bg-white/10"
                  : "border-zinc-200 dark:border-zinc-700"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(opt)}
                className="h-5 w-5 shrink-0 accent-zinc-900 dark:accent-white"
              />
              <span className="text-base text-zinc-900 dark:text-zinc-100">
                {opt}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
