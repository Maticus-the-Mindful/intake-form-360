"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CheckboxGroup,
  Field,
  RadioGroup,
  inputClass,
} from "./form-primitives";
import { DynamicDyk, StaticDyk } from "./wizard-dyk";

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
  businessDescription: string;
  services: string[];
  budget: string;
  timeline: string;
  notes: string;
};

const INITIAL_STATE: FormState = {
  name: "",
  email: "",
  phone: "",
  businessDescription: "",
  services: [],
  budget: "",
  timeline: "",
  notes: "",
};

const FALLBACK_FACT =
  "Small-business operators spend a median 40% of their week on tasks that could be templated, automated, or handled by software. The highest-leverage wins usually aren't glamorous — they're the five-minute thing you do fifteen times a day.";

const STATIC_DYK = {
  headline: "You can hand your team a full workday back — every week.",
  body:
    "Teams that automate just their top three manual workflows typically reclaim 6–8 hours per employee per week. That's one full workday, every week, returned to the humans.",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type TextFieldKey = Exclude<keyof FormState, "services">;

type TextStep = {
  id: string;
  kind: "input" | "textarea";
  field: TextFieldKey;
  label: string;
  hint?: string;
  required?: boolean;
  inputType?: "text" | "email" | "tel";
  inputMode?: "text" | "email" | "tel" | "numeric";
  autoComplete?: string;
  autoCapitalize?: "none" | "sentences" | "words";
  placeholder?: string;
  maxLength?: number;
  rows?: number;
  skippable?: boolean;
  isFinal?: boolean;
  validate?: (v: string) => string | null;
};

type CheckboxStep = {
  id: string;
  kind: "checkbox";
  field: "services";
  legend: string;
  options: readonly string[];
  required?: boolean;
};

type RadioStep = {
  id: string;
  kind: "radio";
  field: "budget" | "timeline";
  legend: string;
  options: readonly string[];
  required?: boolean;
};

type DykStep = { id: string; kind: "dyk-static" | "dyk-dynamic" };

type Step = TextStep | CheckboxStep | RadioStep | DykStep;

const STEPS: Step[] = [
  {
    id: "name",
    kind: "input",
    field: "name",
    label: "What should I call you?",
    required: true,
    inputType: "text",
    autoComplete: "name",
    autoCapitalize: "words",
    placeholder: "First and last",
    validate: (v) => (v.trim().length < 1 ? "Your name, please." : null),
  },
  {
    id: "email",
    kind: "input",
    field: "email",
    label: "Best email to reach you?",
    required: true,
    inputType: "email",
    inputMode: "email",
    autoComplete: "email",
    autoCapitalize: "none",
    placeholder: "you@company.com",
    validate: (v) =>
      EMAIL_RE.test(v.trim()) ? null : "That email doesn't look right.",
  },
  {
    id: "phone",
    kind: "input",
    field: "phone",
    label: "Phone number?",
    hint: "Optional — skip if you'd rather email.",
    inputType: "tel",
    inputMode: "tel",
    autoComplete: "tel",
    placeholder: "(210) 555-0101",
    skippable: true,
  },
  {
    id: "business-description",
    kind: "textarea",
    field: "businessDescription",
    label: "In a sentence, what does your business do?",
    hint: "So the next bit can be tailored to your world.",
    required: true,
    autoCapitalize: "sentences",
    placeholder: "e.g., mobile dog grooming for seniors in Austin",
    maxLength: 240,
    rows: 3,
    validate: (v) => {
      const t = v.trim();
      if (t.length < 3) return "A few words, at least.";
      if (t.length > 240) return "Keep it under 240 characters.";
      return null;
    },
  },
  {
    id: "services",
    kind: "checkbox",
    field: "services",
    legend: "What are you looking to build?",
    options: SERVICE_OPTIONS,
    required: true,
  },
  { id: "dyk-dynamic", kind: "dyk-dynamic" },
  {
    id: "budget",
    kind: "radio",
    field: "budget",
    legend: "Budget range for this project",
    options: BUDGET_OPTIONS,
    required: true,
  },
  { id: "dyk-static", kind: "dyk-static" },
  {
    id: "timeline",
    kind: "radio",
    field: "timeline",
    legend: "Ideal timeline",
    options: TIMELINE_OPTIONS,
    required: true,
  },
  {
    id: "notes",
    kind: "textarea",
    field: "notes",
    label: "Anything else I should know before we connect?",
    hint: "Optional — context, links, whatever helps.",
    autoCapitalize: "sentences",
    rows: 4,
    isFinal: true,
  },
];

const INPUT_STEPS_TOTAL = STEPS.filter(
  (s) => s.kind !== "dyk-static" && s.kind !== "dyk-dynamic",
).length;

function countInputStepsThrough(index: number): number {
  let count = 0;
  for (let i = 0; i <= index && i < STEPS.length; i++) {
    const k = STEPS[i].kind;
    if (k !== "dyk-static" && k !== "dyk-dynamic") count++;
  }
  return count;
}

function isStepSatisfied(step: Step, form: FormState): boolean {
  switch (step.kind) {
    case "input":
    case "textarea": {
      const raw = (form[step.field] as string) ?? "";
      if (!raw.trim()) return step.skippable === true || step.required !== true;
      return step.validate ? step.validate(raw) === null : true;
    }
    case "checkbox":
      return !step.required || form.services.length > 0;
    case "radio":
      return !step.required || Boolean(form[step.field]);
    case "dyk-static":
    case "dyk-dynamic":
      return true;
  }
}

// Walk forward from step 0; stop at the first step whose prerequisites aren't
// met. Guards against sessionStorage landing a visitor past a step they
// haven't actually completed (stale state from a prior session, cleared
// fields, etc.) — which otherwise shows a mismatched "Step N of 8" label.
function resolveRestoredStep(targetIndex: number, form: FormState): number {
  const clamped = Math.max(
    0,
    Math.min(Math.floor(targetIndex), STEPS.length - 1),
  );
  for (let i = 0; i < clamped; i++) {
    if (!isStepSatisfied(STEPS[i], form)) return i;
  }
  return clamped;
}

type DynamicFactState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; fact: string }
  | { status: "failed" };

type WizardStatus = "idle" | "submitting" | "success" | "error";

const WIZARD_KEY = "intake360:wizard:v1";
const DYK_CACHE_KEY = "intake360:dyk:v1";

type Persisted = { form: FormState; currentStep: number };

function loadPersisted(): Partial<Persisted> & { cachedFact?: string } {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(WIZARD_KEY);
    const parsed = (raw ? JSON.parse(raw) : {}) as Partial<Persisted>;
    const cachedFact =
      window.sessionStorage.getItem(DYK_CACHE_KEY) || undefined;
    return { ...parsed, cachedFact };
  } catch {
    return {};
  }
}

const wizardStyles = `
.wizard-step {
  animation: wizard-step-in 240ms cubic-bezier(0.22, 0.61, 0.36, 1) both;
}
.wizard-step[data-direction="back"] {
  animation-name: wizard-step-in-back;
}
@keyframes wizard-step-in {
  0%   { opacity: 0; transform: translateX(12px); }
  100% { opacity: 1; transform: translateX(0); }
}
@keyframes wizard-step-in-back {
  0%   { opacity: 0; transform: translateX(-12px); }
  100% { opacity: 1; transform: translateX(0); }
}
.wizard-progress-track {
  position: relative;
  background: linear-gradient(90deg, rgba(1, 126, 126, 0.08), rgba(252, 186, 88, 0.08), rgba(1, 126, 126, 0.08));
}
.wizard-progress-fill {
  position: relative;
  transition: width 420ms cubic-bezier(0.22, 0.61, 0.36, 1);
  background: linear-gradient(
    90deg,
    rgba(1, 126, 126, 0.9) 0%,
    rgba(94, 192, 176, 1) 22%,
    rgba(252, 186, 88, 1) 45%,
    rgba(255, 224, 168, 1) 55%,
    rgba(252, 186, 88, 1) 70%,
    rgba(94, 192, 176, 1) 88%,
    rgba(1, 126, 126, 0.9) 100%
  );
  background-size: 220% 100%;
  animation: wizard-progress-flow 4.5s linear infinite;
  box-shadow:
    0 0 10px rgba(252, 186, 88, 0.45),
    0 0 2px rgba(252, 186, 88, 0.55),
    inset 0 0 0 0.5px rgba(255, 255, 255, 0.25);
}
.wizard-progress-fill::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.45) 50%,
    transparent 100%
  );
  background-size: 35% 100%;
  background-repeat: no-repeat;
  animation: wizard-progress-sheen 2.8s ease-in-out infinite;
  pointer-events: none;
  mix-blend-mode: overlay;
}
@keyframes wizard-progress-flow {
  0%   { background-position: 220% 50%; }
  100% { background-position: 0% 50%; }
}
@keyframes wizard-progress-sheen {
  0%   { background-position: -40% 0; }
  60%  { background-position: 140% 0; }
  100% { background-position: 140% 0; }
}
@media (prefers-reduced-motion: reduce) {
  .wizard-step {
    animation: wizard-step-fade 120ms ease-out both;
  }
  @keyframes wizard-step-fade {
    0%   { opacity: 0; }
    100% { opacity: 1; }
  }
  .wizard-progress-fill { transition: none; animation: none; background-position: 50% 50%; }
  .wizard-progress-fill::after { animation: none; opacity: 0; }
}
`;

export function IntakeWizard() {
  const [form, setForm] = useState<FormState>(INITIAL_STATE);
  const [currentStep, setCurrentStep] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [status, setStatus] = useState<WizardStatus>("idle");
  const [dynamicFact, setDynamicFact] = useState<DynamicFactState>({
    status: "idle",
  });
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [hydrated, setHydrated] = useState(false);

  const radioAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepContainerRef = useRef<HTMLDivElement | null>(null);
  const didMountRef = useRef(false);
  const submittedDescriptionRef = useRef<string>("");

  useEffect(() => {
    // Restore wizard state from sessionStorage on mount. setState in effect is
    // the right pattern here because sessionStorage isn't available on the
    // server, so we can't lazy-init useState from it without a hydration
    // mismatch.
    /* eslint-disable react-hooks/set-state-in-effect */
    const persisted = loadPersisted();
    const mergedForm: FormState = persisted.form
      ? { ...INITIAL_STATE, ...persisted.form }
      : INITIAL_STATE;
    if (persisted.form) setForm(mergedForm);
    const restoredStep =
      typeof persisted.currentStep === "number"
        ? resolveRestoredStep(persisted.currentStep, mergedForm)
        : 0;
    if (restoredStep > 0) setCurrentStep(restoredStep);
    if (persisted.cachedFact) {
      setDynamicFact({ status: "ready", fact: persisted.cachedFact });
    }
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */

    if (typeof window !== "undefined") {
      window.history.replaceState({ wizardStep: restoredStep }, "");
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.sessionStorage.setItem(
        WIZARD_KEY,
        JSON.stringify({ form, currentStep }),
      );
    } catch {
      // storage disabled, silently ignore
    }
  }, [form, currentStep, hydrated]);

  useEffect(() => {
    const onPopState = (e: PopStateEvent) => {
      const step = e.state?.wizardStep;
      if (typeof step === "number" && step >= 0 && step < STEPS.length) {
        setDirection("back");
        setCurrentStep(step);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    const container = stepContainerRef.current;
    if (!container) return;
    const focusable = container.querySelector<HTMLElement>(
      'input:not([type="radio"]):not([type="checkbox"]), textarea, [data-autofocus]',
    );
    focusable?.focus({ preventScroll: false });
  }, [currentStep]);

  const step = STEPS[currentStep];

  useEffect(() => {
    if (step.kind !== "dyk-dynamic") return;
    if (dynamicFact.status !== "loading") return;
    const timer = setTimeout(() => {
      setDynamicFact((s) => (s.status === "loading" ? { status: "failed" } : s));
    }, 1500);
    return () => clearTimeout(timer);
  }, [step.kind, dynamicFact.status]);

  useEffect(() => {
    return () => {
      if (radioAdvanceTimer.current) clearTimeout(radioAdvanceTimer.current);
    };
  }, []);

  const update = useCallback(
    <K extends keyof FormState>(key: K, value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const toggleService = useCallback((value: string) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.includes(value)
        ? prev.services.filter((s) => s !== value)
        : [...prev.services, value],
    }));
  }, []);

  const kickOffDynamicFact = useCallback((description: string) => {
    const trimmed = description.trim();
    if (!trimmed) return;
    if (trimmed === submittedDescriptionRef.current && dynamicFact.status === "ready") {
      return;
    }
    submittedDescriptionRef.current = trimmed;
    setDynamicFact({ status: "loading" });
    try {
      window.sessionStorage.removeItem(DYK_CACHE_KEY);
    } catch {}

    (async () => {
      try {
        const res = await fetch("/api/did-you-know", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ businessDescription: trimmed }),
        });
        const data = (await res.json()) as
          | { success: true; fact: string }
          | { success: false; error?: string };
        if (data.success && data.fact) {
          setDynamicFact({ status: "ready", fact: data.fact });
          try {
            window.sessionStorage.setItem(DYK_CACHE_KEY, data.fact);
          } catch {}
        } else {
          setDynamicFact({ status: "failed" });
        }
      } catch {
        setDynamicFact({ status: "failed" });
      }
    })();
  }, [dynamicFact.status]);

  const goTo = useCallback((nextIndex: number, dir: "forward" | "back") => {
    if (nextIndex < 0 || nextIndex >= STEPS.length) return;
    setDirection(dir);
    setCurrentStep(nextIndex);
    if (dir === "forward") {
      window.history.pushState({ wizardStep: nextIndex }, "");
    }
  }, []);

  const submitForm = useCallback(async () => {
    setErrorMsg("");
    setStatus("submitting");
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { success: boolean; error?: string };
      if (!res.ok || !data.success) {
        throw new Error(
          data.error || "Something went wrong. Please try again.",
        );
      }
      setStatus("success");
      try {
        window.sessionStorage.removeItem(WIZARD_KEY);
        window.sessionStorage.removeItem(DYK_CACHE_KEY);
      } catch {}
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Submission failed.");
    }
  }, [form]);

  const advance = useCallback(() => {
    setErrorMsg("");
    if (radioAdvanceTimer.current) {
      clearTimeout(radioAdvanceTimer.current);
      radioAdvanceTimer.current = null;
    }

    const current = STEPS[currentStep];

    if (current.kind === "input" || current.kind === "textarea") {
      const raw = form[current.field] as string;
      if (!raw.trim()) {
        if (current.skippable) {
          if (current.isFinal) return submitForm();
          return goTo(currentStep + 1, "forward");
        }
        if (current.required) {
          setErrorMsg(
            current.validate ? current.validate(raw) || "This is required." : "This is required.",
          );
          return;
        }
      } else if (current.validate) {
        const err = current.validate(raw);
        if (err) {
          setErrorMsg(err);
          return;
        }
      }

      if (current.id === "business-description") {
        kickOffDynamicFact(raw);
      }
    }

    if (current.kind === "checkbox") {
      if (current.required && form.services.length === 0) {
        setErrorMsg("Pick at least one.");
        return;
      }
    }

    if (current.kind === "radio") {
      const v = form[current.field];
      if (current.required && !v) {
        setErrorMsg("Pick one to continue.");
        return;
      }
    }

    const isFinal =
      (current.kind === "input" || current.kind === "textarea") && current.isFinal;
    if (isFinal) {
      submitForm();
      return;
    }

    goTo(currentStep + 1, "forward");
  }, [currentStep, form, goTo, kickOffDynamicFact, submitForm]);

  const goBack = useCallback(() => {
    if (currentStep === 0) return;
    setErrorMsg("");
    if (radioAdvanceTimer.current) {
      clearTimeout(radioAdvanceTimer.current);
      radioAdvanceTimer.current = null;
    }
    window.history.back();
  }, [currentStep]);

  const handleRadioChange = useCallback(
    (field: "budget" | "timeline", value: string) => {
      update(field, value);
      if (radioAdvanceTimer.current) clearTimeout(radioAdvanceTimer.current);
      radioAdvanceTimer.current = setTimeout(() => {
        radioAdvanceTimer.current = null;
        setErrorMsg("");
        const next = currentStep + 1;
        if (next < STEPS.length) {
          setDirection("forward");
          setCurrentStep(next);
          window.history.pushState({ wizardStep: next }, "");
        }
      }, 250);
    },
    [currentStep, update],
  );

  if (status === "success") {
    return <SuccessPanel />;
  }

  const stepKind = step.kind;
  const isDyk = stepKind === "dyk-static" || stepKind === "dyk-dynamic";
  const inputStepNumber = countInputStepsThrough(currentStep);
  const progressPct = isDyk
    ? Math.min(100, Math.round(((inputStepNumber) / INPUT_STEPS_TOTAL) * 100))
    : Math.round(((inputStepNumber - 1) / Math.max(1, INPUT_STEPS_TOTAL - 1)) * 100);
  const remainingPct = Math.max(0, Math.min(100, 100 - progressPct));

  const submitting = status === "submitting";

  return (
    <div className="relative">
      <style href="intake-wizard" precedence="high">
        {wizardStyles}
      </style>

      <div className="mb-6 sm:mb-8">
        <div className="mb-2 flex items-center gap-3">
          <button
            type="button"
            onClick={goBack}
            disabled={currentStep === 0 || submitting}
            aria-label="Go back one step"
            className="-ml-2 flex h-11 min-w-11 items-center gap-1 rounded-md px-2 text-sm text-zinc-500 transition hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:pointer-events-none disabled:opacity-0 dark:text-zinc-400 dark:hover:text-white"
          >
            <span aria-hidden>←</span>
            <span>Back</span>
          </button>
          <p
            className="ml-auto font-mono text-[12px] font-semibold uppercase tracking-[0.18em] text-zinc-700 dark:text-zinc-200 sm:text-[13px]"
            aria-hidden={isDyk ? "true" : undefined}
          >
            {isDyk ? (
              "A quick note"
            ) : (
              <>
                Step{" "}
                <span className="text-amber-600 dark:text-amber-300">
                  {inputStepNumber}
                </span>{" "}
                of {INPUT_STEPS_TOTAL}
              </>
            )}
          </p>
        </div>
        <div
          className="wizard-progress-track flex h-[5px] w-full justify-end overflow-hidden rounded-full bg-zinc-200/70 dark:bg-zinc-800/80"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={INPUT_STEPS_TOTAL}
          aria-valuenow={inputStepNumber}
          aria-label={
            isDyk
              ? "A quick note — intake progress"
              : `Step ${inputStepNumber} of ${INPUT_STEPS_TOTAL}`
          }
        >
          <div
            className="wizard-progress-fill h-full"
            style={{ width: `${remainingPct}%` }}
          />
        </div>
      </div>

      <div
        ref={stepContainerRef}
        key={step.id}
        className="wizard-step"
        data-direction={direction}
      >
        <StepBody
          step={step}
          form={form}
          errorMsg={errorMsg}
          submitting={submitting}
          onUpdate={update}
          onToggleService={toggleService}
          onRadioChange={handleRadioChange}
          onAdvance={advance}
          onBack={goBack}
          canBack={currentStep > 0}
          dynamicFact={dynamicFact}
        />
      </div>
    </div>
  );
}

type StepBodyProps = {
  step: Step;
  form: FormState;
  errorMsg: string;
  submitting: boolean;
  onUpdate: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  onToggleService: (v: string) => void;
  onRadioChange: (field: "budget" | "timeline", v: string) => void;
  onAdvance: () => void;
  onBack: () => void;
  canBack: boolean;
  dynamicFact: DynamicFactState;
};

function StepBody(props: StepBodyProps) {
  const { step } = props;
  switch (step.kind) {
    case "input":
      return <InputStepView {...props} step={step} />;
    case "textarea":
      return <TextareaStepView {...props} step={step} />;
    case "checkbox":
      return <CheckboxStepView {...props} step={step} />;
    case "radio":
      return <RadioStepView {...props} step={step} />;
    case "dyk-static":
      return (
        <StaticDyk
          headline={STATIC_DYK.headline}
          body={STATIC_DYK.body}
          onContinue={props.onAdvance}
          onBack={props.onBack}
          canBack={props.canBack}
        />
      );
    case "dyk-dynamic": {
      const s = props.dynamicFact;
      const viewState =
        s.status === "ready"
          ? { status: "ready" as const, fact: s.fact }
          : s.status === "failed"
            ? { status: "failed" as const, fallback: FALLBACK_FACT }
            : { status: "loading" as const };
      return (
        <DynamicDyk
          state={viewState}
          onContinue={props.onAdvance}
          onBack={props.onBack}
          canBack={props.canBack}
        />
      );
    }
  }
}

function ContinueButton({
  label,
  onClick,
  submitting,
  disabled,
}: {
  label: string;
  onClick: () => void;
  submitting?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || submitting}
      className="min-h-12 w-full rounded-lg bg-zinc-900 px-6 py-4 text-base font-semibold text-white shadow-sm transition active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:focus-visible:outline-white"
    >
      {submitting ? "Sending…" : label}
    </button>
  );
}

function InlineError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200"
    >
      {message}
    </p>
  );
}

function InputStepView({
  step,
  form,
  errorMsg,
  submitting,
  onUpdate,
  onAdvance,
}: StepBodyProps & { step: TextStep }) {
  const value = (form[step.field] as string) ?? "";
  const enterHint = step.isFinal ? "send" : "next";

  return (
    <div className="space-y-6">
      <Field
        label={step.label}
        htmlFor={step.id}
        required={step.required}
        hint={step.hint}
      >
        <input
          id={step.id}
          type={step.inputType ?? "text"}
          inputMode={step.inputMode}
          autoComplete={step.autoComplete}
          autoCapitalize={step.autoCapitalize}
          autoCorrect={step.inputType === "email" ? "off" : undefined}
          spellCheck={step.inputType === "email" ? false : undefined}
          enterKeyHint={enterHint}
          placeholder={step.placeholder}
          value={value}
          maxLength={step.maxLength}
          onChange={(e) => onUpdate(step.field, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdvance();
            }
          }}
          disabled={submitting}
          className={`${inputClass} scroll-mb-[120px]`}
        />
      </Field>
      <InlineError message={errorMsg} />
      <div className="flex flex-col gap-3">
        <ContinueButton
          label={step.isFinal ? "Send it over" : "Continue"}
          onClick={onAdvance}
          submitting={submitting}
        />
        {step.skippable && !value.trim() && (
          <button
            type="button"
            onClick={onAdvance}
            className="min-h-11 w-full rounded-lg px-4 py-2 text-sm text-zinc-500 transition hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            Skip this one
          </button>
        )}
      </div>
    </div>
  );
}

function TextareaStepView({
  step,
  form,
  errorMsg,
  submitting,
  onUpdate,
  onAdvance,
}: StepBodyProps & { step: TextStep }) {
  const value = (form[step.field] as string) ?? "";
  const charsLeft = step.maxLength ? step.maxLength - value.length : null;
  const enterHint = step.isFinal ? "send" : "next";

  return (
    <div className="space-y-6">
      <Field
        label={step.label}
        htmlFor={step.id}
        required={step.required}
        hint={step.hint}
      >
        <textarea
          id={step.id}
          rows={step.rows ?? 3}
          autoCapitalize={step.autoCapitalize}
          enterKeyHint={enterHint}
          placeholder={step.placeholder}
          value={value}
          maxLength={step.maxLength}
          onChange={(e) => onUpdate(step.field, e.target.value)}
          disabled={submitting}
          className={`${inputClass} resize-y scroll-mb-[120px]`}
        />
        {charsLeft !== null && (
          <p className="mt-2 text-right font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
            {charsLeft} left
          </p>
        )}
      </Field>
      <InlineError message={errorMsg} />
      <ContinueButton
        label={step.isFinal ? "Send it over" : "Continue"}
        onClick={onAdvance}
        submitting={submitting}
      />
    </div>
  );
}

function CheckboxStepView({
  step,
  form,
  errorMsg,
  submitting,
  onToggleService,
  onAdvance,
}: StepBodyProps & { step: CheckboxStep }) {
  return (
    <div className="space-y-6">
      <CheckboxGroup
        legend={step.legend}
        options={step.options}
        values={form.services}
        onToggle={onToggleService}
        disabled={submitting}
        required={step.required}
      />
      <InlineError message={errorMsg} />
      <ContinueButton label="Continue" onClick={onAdvance} submitting={submitting} />
    </div>
  );
}

function RadioStepView({
  step,
  form,
  errorMsg,
  submitting,
  onRadioChange,
  onAdvance,
}: StepBodyProps & { step: RadioStep }) {
  return (
    <div className="space-y-6">
      <RadioGroup
        legend={step.legend}
        name={step.field}
        options={step.options}
        value={form[step.field]}
        onChange={(v) => onRadioChange(step.field, v)}
        disabled={submitting}
        required={step.required}
      />
      <InlineError message={errorMsg} />
      <ContinueButton label="Continue" onClick={onAdvance} submitting={submitting} />
    </div>
  );
}

function SuccessPanel() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center dark:border-emerald-900/60 dark:bg-emerald-950/40">
      <h2 className="mb-3 text-2xl font-semibold text-emerald-900 dark:text-emerald-100">
        Thanks for reaching out.
      </h2>
      <p className="text-emerald-800 dark:text-emerald-200">
        I&apos;ll review your info and get back to you within 48 hours. If you need
        me sooner, text or call{" "}
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
