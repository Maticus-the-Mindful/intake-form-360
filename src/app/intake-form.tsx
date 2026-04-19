"use client";

import { useEffect, useState } from "react";

const SERVICE_OPTIONS = [
  "Website design or redesign",
  "Custom software or web app",
  "AI tools or chatbot",
  "Automation systems (workflows, integrations)",
  "Not sure yet, want to talk it through",
] as const;

const BUDGET_OPTIONS = [
  "Under $5K",
  "$5K to $15K",
  "$15K to $35K",
  "$35K to $75K",
  "$75K+",
  "Open, depends on scope",
] as const;

const TIMELINE_OPTIONS = [
  "ASAP (within 30 days)",
  "1 to 3 months",
  "3 to 6 months",
  "Exploring, no firm date",
] as const;

type FormState = {
  name: string;
  email: string;
  phone: string;
  company: string;
  services: string[];
  budget: string;
  timeline: string;
  notes: string;
};

const INITIAL_STATE: FormState = {
  name: "",
  email: "",
  phone: "",
  company: "",
  services: [],
  budget: "",
  timeline: "",
  notes: "",
};

type Status = "idle" | "submitting" | "success" | "error";

export function IntakeForm() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (status === "success") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [status]);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleService(value: string) {
    setForm((prev) => ({
      ...prev,
      services: prev.services.includes(value)
        ? prev.services.filter((s) => s !== value)
        : [...prev.services, value],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (form.services.length === 0) {
      setErrorMsg("Please select at least one service.");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { success: boolean; error?: string };
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Submission failed.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center dark:border-emerald-900/60 dark:bg-emerald-950/40">
        <h2 className="mb-3 text-2xl font-semibold text-emerald-900 dark:text-emerald-100">
          Thanks for reaching out.
        </h2>
        <p className="text-emerald-800 dark:text-emerald-200">
          I&apos;ll review your info and get back to you within 48 hours. If you need me
          sooner, text or call{" "}
          <a
            href="tel:+12108010102"
            className="font-semibold underline underline-offset-2"
          >
            210-801-0102
          </a>
          .
        </p>
        <p className="mt-4 text-sm text-emerald-700 dark:text-emerald-300">
          Maticus Cortez, Maticus Media 360
        </p>
      </div>
    );
  }

  const disabled = status === "submitting";

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      <Field label="Name" htmlFor="name" required>
        <input
          id="name"
          type="text"
          required
          autoComplete="name"
          autoCapitalize="words"
          enterKeyHint="next"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          disabled={disabled}
          className={inputClass}
        />
      </Field>

      <Field label="Best email to reach you" htmlFor="email" required>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="next"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          disabled={disabled}
          className={inputClass}
        />
      </Field>

      <Field label="Phone" htmlFor="phone" hint="Optional, if you prefer a quick call">
        <input
          id="phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          enterKeyHint="next"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          disabled={disabled}
          className={inputClass}
        />
      </Field>

      <Field label="Company or project name" htmlFor="company" hint="Optional">
        <input
          id="company"
          type="text"
          autoComplete="organization"
          autoCapitalize="words"
          enterKeyHint="next"
          value={form.company}
          onChange={(e) => update("company", e.target.value)}
          disabled={disabled}
          className={inputClass}
        />
      </Field>

      <fieldset className="space-y-3" disabled={disabled}>
        <legend className="mb-2 block text-sm font-medium text-zinc-900 dark:text-zinc-100">
          What are you looking to build? <span className="text-rose-500">*</span>
        </legend>
        <div className="grid gap-2">
          {SERVICE_OPTIONS.map((opt) => {
            const checked = form.services.includes(opt);
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
                  onChange={() => toggleService(opt)}
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

      <RadioGroup
        legend="Budget range for this project"
        name="budget"
        options={BUDGET_OPTIONS}
        value={form.budget}
        onChange={(v) => update("budget", v)}
        disabled={disabled}
        required
      />

      <RadioGroup
        legend="Ideal timeline"
        name="timeline"
        options={TIMELINE_OPTIONS}
        value={form.timeline}
        onChange={(v) => update("timeline", v)}
        disabled={disabled}
        required
      />

      <Field
        label="Anything you want me to know before we connect?"
        htmlFor="notes"
        hint="Optional"
      >
        <textarea
          id="notes"
          rows={4}
          autoCapitalize="sentences"
          enterKeyHint="send"
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          disabled={disabled}
          className={`${inputClass} resize-y`}
        />
      </Field>

      {errorMsg && (
        <p
          role="alert"
          className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200"
        >
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={disabled}
        className="w-full rounded-lg bg-zinc-900 px-6 py-4 text-base font-semibold text-white shadow-sm transition active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:focus-visible:outline-white"
      >
        {status === "submitting" ? "Sending…" : "Send it over"}
      </button>
    </form>
  );
}

const inputClass =
  "block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-3 text-base text-zinc-900 shadow-sm transition placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:focus:border-white dark:focus:ring-white/20";

function Field({
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
  children: React.ReactNode;
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

function RadioGroup({
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
