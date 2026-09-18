"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEADLINE = new Date(
  "2026-09-19T12:59:59"
);

const campusOptions = {
  Midmac: ["A", "B", "C", "D"],
  Thumama: ["E", "F", "G", "H"],
} as const;

const roleCategories = {
  Visual: [
    "Photographer",
    "Videographer",
    "Video Editor",
    "Photo Editor",
    "2D Animator",
    "3D Animator",
  ],
  Audio: ["Audio Mixer", "Sound Engineer", "Music Producer"],
  Compering: ["Script Writer", "Commentator", "Comperer", "Announcer"],
};

const resourceOptions = {
  Visual: [
    "Camera",
    "DSLR",
    "Mirrorless Camera",
    "Tripod",
    "Drone",
    "Drawing Tablet",
  ],
  Audio: [
    "Microphone",
    "Audio Interface",
    "Audio Mixer",
    "Studio Monitors",
    "DJ Deck",
    "FL Studio",
    "Ableton Live",
  ],
  Compering: [
    "Public Speaking Experience",
    "Wireless Microphone",
    "Script Writing Experience",
  ],
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^\+\d{7,15}$/;
const studentIdPattern = /^\d{4}$/;

type CountryOption = {
  code: string;
  name: string;
};

type PhoneFieldKey =
  | "phone"
  | "contact_number"
  | "parent_phone_number"
  | "parent_whatsapp_number";

const phoneFieldKeys: PhoneFieldKey[] = [
  "phone",
  "contact_number",
  "parent_phone_number",
  "parent_whatsapp_number",
];

const fallbackCountryOptions: CountryOption[] = [
  { code: "+974", name: "Qatar" },
  { code: "+971", name: "United Arab Emirates" },
  { code: "+966", name: "Saudi Arabia" },
  { code: "+91", name: "India" },
  { code: "+44", name: "United Kingdom" },
  { code: "+1", name: "United States" },
];

export default function MultiStepForm() {
  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touchedPhoneFields, setTouchedPhoneFields] = useState<
    Partial<Record<PhoneFieldKey, boolean>>
  >({});
  const [countryOptions, setCountryOptions] = useState<CountryOption[]>(
    fallbackCountryOptions
  );
  const [countryCode, setCountryCode] = useState("+974");

  const [formData, setFormData] = useState({
    full_name: "",
    student_id: "",
    guardian_name: "",
    guardian_email: "",
    personal_email: "",
    email: "",
    phone: "+974",
    contact_number: "+974",
    parent_phone_number: "+974",
    parent_whatsapp_number: "+974",
    campus: "",
    year: "",
    class_name: "",
    roles: [] as string[],
    resources: [] as string[],
    other_resources: "",
    experience: "",
  });

  const maxSteps = 4;
  const progress = (step / maxSteps) * 100;

  useEffect(() => {
    const loadCountryOptions = async () => {
      try {
        const response = await fetch(
          "https://countriesnow.space/api/v0.1/countries/codes"
        );

        if (!response.ok) throw new Error("Unable to load country codes.");

        const result = (await response.json()) as {
          data?: Array<{ name?: string; dial_code?: string }>;
        };
        const options = (result.data ?? [])
          .flatMap((country) =>
            country.name && country.dial_code
              ? [{ code: country.dial_code.replace(/\s/g, ""), name: country.name }]
              : []
          )
          .sort((first, second) => first.name.localeCompare(second.name));

        if (options.length > 0) setCountryOptions(options);
      } catch {
        setCountryOptions(fallbackCountryOptions);
      }
    };

    void loadCountryOptions();
  }, []);

  const showError = (message: string) => {
    setErrorMessage(message);
    window.setTimeout(() => setErrorMessage(""), 5000);
  };

  const toggleRole = (role: string) => {
    setFormData((current) => ({
      ...current,
      roles: current.roles.includes(role)
        ? current.roles.filter((item) => item !== role)
        : [...current.roles, role],
    }));
  };

  const toggleResource = (resource: string) => {
    setFormData((current) => ({
      ...current,
      resources: current.resources.includes(resource)
        ? current.resources.filter((item) => item !== resource)
        : [...current.resources, resource],
    }));
  };

  const validateStep = (stepToValidate: number) => {
    if (stepToValidate === 1) {
      const isComplete =
        !! formData.full_name.trim() &&
        !! formData.student_id.trim() &&
        !! formData.guardian_name.trim() &&
        !! formData.personal_email.trim() &&
        !! formData.phone.trim() &&
        !! formData.contact_number.trim() &&
        !! formData.parent_phone_number.trim() &&
        !! formData.parent_whatsapp_number.trim();

      if (!isComplete) {
        showError("Please fill in all required personal information fields.");
        return false;
      }

      if (!studentIdPattern.test(formData.student_id.trim())) {
        showError("Student admission number must be exactly 4 digits.");
        return false;
      }

      const hasValidEmails =
        emailPattern.test(formData.personal_email.trim()) &&
        emailPattern.test(formData.email.trim()) &&
        (!formData.guardian_email.trim() || emailPattern.test(formData.guardian_email.trim()));
      const hasValidPhones = [
        formData.phone,
        formData.contact_number,
        formData.parent_phone_number,
        formData.parent_whatsapp_number,
      ].every((value) => phonePattern.test(value));

      if (!hasValidEmails) {
        showError("Please enter valid email addresses.");
        return false;
      }

      if (!hasValidPhones) {
        showError("Please enter valid phone numbers.");
        return false;
      }
    }

    if (stepToValidate === 2 && (!formData.year || !formData.campus || !formData.class_name)) {
      showError("Please select your year, campus, and class before continuing.");
      return false;
    }

    if (stepToValidate === 3 && formData.roles.length === 0) {
      showError("Please select at least one desired role before continuing.");
      return false;
    }

    setErrorMessage("");
    return true;
  };

  const validateForm = () =>
    [1, 2, 3].every((stepToValidate) => validateStep(stepToValidate));

  const inputClass =
    "h-12 w-full rounded-2xl border border-white/10 bg-slate-950/30 px-4 text-sm text-white placeholder:text-slate-400 shadow-inner shadow-slate-950/30 transition-all duration-200 focus-visible:border-violet-400/80 focus-visible:ring-4 focus-visible:ring-violet-500/15";

  const chipClass =
    "rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition-all duration-200 hover:border-violet-400/60 hover:bg-violet-500/10";

  const selectedChipClass =
    "rounded-full border border-violet-400/70 bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-950/40";

  const getEmailError = (value: string, optional = false) =>
    value.trim() && (!optional || value.trim()) && !emailPattern.test(value.trim())
      ? "Please enter a valid email address."
      : "";

  const getPhoneError = (value: string, touched = false) =>
    touched && value && !phonePattern.test(value)
      ? "Use + followed by 7 to 15 digits."
      : "";

  const getWordCount = (text: string) =>
    text.trim() ? text.trim().split(/\s+/).length : 0;

  const limitWords = (text: string, limit: number) =>
    (() => {
      const wordPattern = /\S+/g;
      let match: RegExpExecArray | null;
      let wordCount = 0;
      let endIndex = text.length;

      while ((match = wordPattern.exec(text)) !== null) {
        wordCount += 1;
        if (wordCount === limit) endIndex = match.index + match[0].length;
        if (wordCount > limit) return text.slice(0, endIndex);
      }

      return text;
    })();

  const updateCountryCode = (nextCountryCode: string) => {
    setCountryCode(nextCountryCode);
    setFormData((current) => ({
      ...current,
      ...Object.fromEntries(
        phoneFieldKeys.map((key) => [
          key,
          `${nextCountryCode}${current[key].replace(/^\+\d+/, "")}`,
        ])
      ) as Pick<typeof current, PhoneFieldKey>,
    }));
  };

  const renderPhoneField = (
    label: string,
    valueKey: PhoneFieldKey,
  ) => {
    const value = formData[valueKey];
    const localNumber = value.startsWith(countryCode)
      ? value.slice(countryCode.length)
      : value.replace(/^\+\d+/, "");
    const phoneError = getPhoneError(value, touchedPhoneFields[valueKey]);
    const inputId = `${valueKey}-input`;

    return (
      <div className="space-y-2">
        <Label
          htmlFor={inputId}
          className="text-sm font-medium text-slate-200"
          onClick={() =>
            setTouchedPhoneFields((current) => ({
              ...current,
              [valueKey]: true,
            }))
          }
        >
          {label}
        </Label>
        <div className="flex h-12 overflow-hidden rounded-2xl border border-white/10 bg-slate-950/30 shadow-inner shadow-slate-950/30 transition-all focus-within:border-violet-400/80 focus-within:ring-4 focus-within:ring-violet-500/15">
            <select
              aria-label={`${label} country code`}
              className="h-full w-24 shrink-0 border-r border-white/10 bg-slate-950/50 px-2 text-xs text-white outline-none [&>option]:bg-slate-900"
              value={countryCode}
              onChange={(event) => updateCountryCode(event.target.value)}
            >
              {countryOptions.map((option) => (
                <option key={`${option.name}-${option.code}`} value={option.code}>
                  {option.name} ({option.code})
                </option>
              ))}
            </select>
            <Input
              id={inputId}
              className="h-full min-w-0 flex-1 rounded-none border-0 bg-transparent px-3 text-sm text-white placeholder:text-slate-400 outline-none focus-visible:border-0 focus-visible:ring-0"
              value={localNumber}
              placeholder="501234567"
              inputMode="tel"
              aria-invalid={!!phoneError}
              onFocus={() =>
                setTouchedPhoneFields((current) => ({
                  ...current,
                  [valueKey]: true,
                }))
              }
              onKeyDown={(event) => {
                if (event.key.length === 1 && !/\d/.test(event.key)) {
                  event.preventDefault();
                }
              }}
              onChange={(event) => {
                const digits = event.target.value.replace(/\D/g, "");
                setFormData((current) => ({
                  ...current,
                  [valueKey]: `${countryCode}${digits}`,
                }));
              }}
            />
          </div>
        {phoneError && <p className="text-xs text-rose-300">{phoneError}</p>}
      </div>
    );
  };

  if (submitted) {
    return (
      <Card className="glass-panel w-full max-w-xl rounded-[28px] border border-white/15 bg-white/[0.06] text-white shadow-[0_25px_80px_rgba(10,14,24,0.7)] backdrop-blur-2xl">
        <CardContent className="space-y-5 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-2xl shadow-lg shadow-emerald-500/20">
            ✅
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-emerald-300">
            Application Submitted Successfully
          </h1>
          <p className="text-base text-slate-300">
            Thank you for your interest in joining the Media Team.
          </p>
          <p className="text-sm text-slate-400">
            Your application has been received and will be reviewed by the committee. Shortlisted applicants will be contacted through their school email or WhatsApp number.
          </p>
        </CardContent>
      </Card>
    );
  }

  const submitApplication = async () => {
  if (!validateForm()) return;

  try {
    setIsSubmitting(true);

    const { error } = await supabase
      .from("applications")
      .insert([
        {
          full_name: formData.full_name,
          student_id: formData.student_id,
          guardian_name: formData.guardian_name,
          guardian_email: formData.guardian_email,
          personal_email: formData.personal_email,

          email: formData.email,
          phone: formData.phone,
          contact_number: formData.contact_number,
          guardian_phone: formData.parent_phone_number,
          guardian_whatsapp: formData.parent_whatsapp_number,
          campus: formData.campus,
          year: formData.year,
          class_name: formData.class_name,

          roles: formData.roles,

          resources: formData.resources,
          other_resources: formData.other_resources,

          experience: formData.experience,
        },
      ]);

    if (error) {
      console.error(error);

      setErrorMessage(
        "Something went wrong while submitting your application."
      );

      setTimeout(() => {
        setErrorMessage("");
      }, 5000);

      return;
    }

    setSubmitted(true);
  } catch (err) {
    console.error(err);

    setErrorMessage(
      "Unable to submit your application."
    );

    setTimeout(() => {
      setErrorMessage("");
    }, 5000);
  } finally {
    setIsSubmitting(false);
  }
};

if (new Date() > DEADLINE) {
  return (
    <Card className="glass-panel w-full max-w-xl rounded-[28px] border border-white/15 bg-white/[0.06] text-white shadow-xl backdrop-blur-2xl">
      <CardContent className="p-8 text-center">
        <h1 className="text-3xl font-bold">
          Applications Closed
        </h1>

        <p>
          Applications for the Media Team are now closed.
        </p>
      </CardContent>
    </Card>
  );
}

  return (
    <Card className="glossy-shell relative w-full max-w-2xl overflow-hidden rounded-[30px] border border-white/15 bg-white/[0.06] p-1 text-white shadow-[0_30px_90px_rgba(12,18,32,0.82)] backdrop-blur-2xl">
      <CardContent className="relative z-10 space-y-6 rounded-[28px] bg-slate-950/25 p-4 backdrop-blur-xl sm:p-8">
        <div className="space-y-4 rounded-[26px] border border-white/10 bg-slate-900/20 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/15 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.32),_rgba(255,255,255,0.06)_40%,_rgba(129,140,248,0.24)_100%)] shadow-[0_10px_30px_rgba(99,102,241,0.35)]">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-950/60 text-[11px] font-bold tracking-[0.18em] text-white/90">
                MT
              </div>
            </div>

            <div>
              <p className="text-[10px] font-medium tracking-[0.24em] text-slate-300 uppercase">
                Media team
              </p>
              <h1 className="text-lg font-semibold tracking-tight text-white">
                Application Form
              </h1>
            </div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-slate-950/20 p-3">
            <div className="mb-2 flex items-center justify-between text-[10px] font-medium tracking-[0.22em] text-slate-300 uppercase">
              <span>Step {step} of {maxSteps}</span>
              <span>{Math.round(progress)}%</span>
            </div>

            <Progress value={progress} className="h-2 rounded-full bg-white/5" />
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {errorMessage}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight text-white">
                Personal Information
              </h2>
              <p className="text-sm text-slate-400">
                Tell us a little about yourself.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-200">Full Name</Label>
                <Input
                  className={inputClass}
                  value={formData.full_name}
                  placeholder="Ex: Kagamine Len"
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-200">
                  Student Admission Number
                </Label>
                <Input
                  className={inputClass}
                  value={formData.student_id}
                  placeholder="e.g. 3939"
                  inputMode="numeric"
                  maxLength={4}
                  aria-invalid={
                    !!formData.student_id && !studentIdPattern.test(formData.student_id)
                  }
                  onChange={(e) => {
                    const studentId = e.target.value.replace(/\D/g, "").slice(0, 4);
                    const generatedSchoolEmail = formData.student_id
                      ? `${formData.student_id}@sslsd.education`
                      : "";

                    setFormData({
                      ...formData,
                      student_id: studentId,
                      email:
                        !formData.email || formData.email === generatedSchoolEmail
                          ? studentId
                            ? `${studentId}@sslsd.education`
                            : ""
                          : formData.email,
                    });
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-200">Parent / Guardian Email (Optional)</Label>
                <Input
                  type="email"
                  className={inputClass}
                  value={formData.guardian_email}
                  placeholder="ex: kristophe@gmail.com"
                  aria-invalid={!!getEmailError(formData.guardian_email, true)}
                  onChange={(e) =>
                    setFormData({ ...formData, guardian_email: e.target.value })
                  }
                />
                {getEmailError(formData.guardian_email, true) && (
                  <p className="text-xs text-rose-300">{getEmailError(formData.guardian_email, true)}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-200">
                  Parent / Guardian Name
                </Label>
                <Input
                  className={inputClass}
                  value={formData.guardian_name}
                  placeholder="ex: Lao Khoa"
                  onChange={(e) =>
                    setFormData({ ...formData, guardian_name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-200">Personal Email (Required)</Label>
                <Input
                  type="email"
                  className={inputClass}
                  value={formData.personal_email}
                  placeholder="ex: kristophe@gmail.com"
                  aria-invalid={!!getEmailError(formData.personal_email)}
                  onChange={(e) =>
                    setFormData({ ...formData, personal_email: e.target.value })
                  }
                />
                {getEmailError(formData.personal_email) && (
                  <p className="text-xs text-rose-300">{getEmailError(formData.personal_email)}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-200">School Email (Required)</Label>
                <Input
                  type="email"
                  className={inputClass}
                  value={formData.email}
                  placeholder="e.g. 4949@sslsd.education"
                  aria-invalid={!!getEmailError(formData.email)}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                {getEmailError(formData.email) && (
                  <p className="text-xs text-rose-300">{getEmailError(formData.email)}</p>
                )}
              </div>

              {renderPhoneField("Phone Number", "phone")}
              {renderPhoneField("WhatsApp Number", "contact_number")}

              {renderPhoneField("Parent Phone Number", "parent_phone_number")}
              {renderPhoneField(
                "Parent WhatsApp Number",
                "parent_whatsapp_number"
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight text-white">
                Academic Information
              </h2>
              <p className="text-sm text-slate-400">
                What&apos;s your Campus, along with your Year and Class.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-200">Year</Label>
              <Select
                value={formData.year}
                onValueChange={(value) => setFormData({ ...formData, year: value })}
              >
                <SelectTrigger className="h-12 w-full rounded-2xl border border-white/10 bg-slate-950/30 text-sm text-white shadow-inner shadow-slate-950/30 data-[placeholder]:text-slate-400">
                  <SelectValue placeholder="Select your year" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border border-white/10 bg-slate-900 text-white">
                  {Array.from({ length: 7 }, (_, i) => i + 7).map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      Year {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-200">Campus</Label>
              <div className="flex flex-wrap gap-3">
                {Object.keys(campusOptions).map((campus) => (
                  <Button
                    key={campus}
                    type="button"
                    variant={formData.campus === campus ? "default" : "outline"}
                    className={
                      formData.campus === campus
                        ? selectedChipClass
                        : `${chipClass} min-w-[120px]`
                    }
                    onClick={() =>
                      setFormData({ ...formData, campus, class_name: "" })
                    }
                  >
                    {campus}
                  </Button>
                ))}
              </div>
            </div>

            {formData.campus && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-200">Class</Label>
                <div className="flex flex-wrap gap-3">
                  {campusOptions[formData.campus as keyof typeof campusOptions].map(
                    (className) => (
                      <Button
                        key={className}
                        type="button"
                        variant={
                          formData.class_name === className ? "default" : "outline"
                        }
                        className={
                          formData.class_name === className
                            ? selectedChipClass
                            : `${chipClass} min-w-[64px]`
                        }
                        onClick={() => setFormData({ ...formData, class_name: className })}
                      >
                        {className}
                      </Button>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-7">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight text-white">
                Desired Roles
              </h2>
              <p className="text-sm text-slate-400">
                Select as many roles as you&apos;d like. At least one role is required.
              </p>
            </div>

            {Object.entries(roleCategories).map(([category, roles]) => (
              <div key={category} className="space-y-3">
                <h3 className="text-base font-semibold text-slate-200">{category}</h3>
                <div className="flex flex-wrap gap-2.5">
                  {roles.map((role) => (
                    <Button
                      key={role}
                      type="button"
                      variant={formData.roles.includes(role) ? "default" : "outline"}
                      className={
                        formData.roles.includes(role)
                          ? selectedChipClass
                          : chipClass
                      }
                      onClick={() => toggleRole(role)}
                    >
                      {role}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight text-white">
                Experience & Resources
              </h2>
              <p className="text-sm text-slate-400">
                This section is completely optional.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-slate-200">Previous Experience</Label>
              <textarea
                className="min-h-[120px] w-full rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm text-white placeholder:text-slate-400 shadow-inner shadow-slate-950/30 outline-none transition-all duration-200 focus:border-violet-400/80 focus:ring-4 focus:ring-violet-500/15"
                placeholder="Tell us about any photography, videography, audio production, editing, public speaking or related experience."
                value={formData.experience}
                onChange={(e) => setFormData({
                  ...formData,
                  experience: limitWords(e.target.value, 500),
                })}
              />
              <p className="text-right text-xs text-slate-400">
                {getWordCount(formData.experience)} / 500 words
              </p>
            </div>

            {Object.entries(resourceOptions).map(([category, resources]) => (
              <div key={category} className="space-y-3">
                <h3 className="text-base font-semibold text-slate-200">{category}</h3>
                <div className="flex flex-wrap gap-2.5">
                  {resources.map((resource) => (
                    <Button
                      key={resource}
                      type="button"
                      variant={
                        formData.resources.includes(resource) ? "default" : "outline"
                      }
                      className={
                        formData.resources.includes(resource)
                          ? selectedChipClass
                          : chipClass
                      }
                      onClick={() => toggleResource(resource)}
                    >
                      {resource}
                    </Button>
                  ))}
                </div>
              </div>
            ))}

            <div className="space-y-3 rounded-2xl border border-white/8 bg-slate-950/20 p-4">
              <Button
                type="button"
                variant={
                  formData.resources.includes("Other Equipment") ? "default" : "outline"
                }
                className={
                  formData.resources.includes("Other Equipment")
                    ? selectedChipClass
                    : chipClass
                }
                onClick={() => toggleResource("Other Equipment")}
              >
                Other Equipment
              </Button>

              {formData.resources.includes("Other Equipment") && (
                <Input
                  className={inputClass}
                  placeholder="Describe any additional equipment or resources..."
                  value={formData.other_resources}
                  onChange={(e) =>
                    setFormData({ ...formData, other_resources: e.target.value })
                  }
                />
              )}
            </div>
          </div>
        )}

        <div className="flex flex-col-reverse items-stretch justify-between gap-3 pt-2 sm:flex-row sm:items-center">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="min-h-11 w-full min-w-[110px] cursor-pointer rounded-full border-white/10 bg-white/5 px-5 text-slate-200 hover:bg-white/10 sm:w-auto"
            >
              ← Back
            </Button>
          )}

          {step < maxSteps ? (
            <Button
              onClick={() => {
                if (validateStep(step)) setStep(step + 1);
              }}
              className="min-h-11 w-auto min-w-[110px] cursor-pointer self-end rounded-full border border-violet-400/60 bg-gradient-to-r from-violet-500 to-indigo-500 px-5 text-white shadow-lg shadow-violet-950/40 hover:brightness-110 sm:ml-auto"
            >
              Next →
            </Button>
          ) : (
            <Button
              disabled={isSubmitting}
              onClick={submitApplication}
              className="min-h-11 w-full cursor-pointer rounded-full border border-emerald-300/40 bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 text-white shadow-lg shadow-emerald-950/40 hover:brightness-110 disabled:cursor-not-allowed sm:w-auto"
            >
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          )}
        </div>
      </CardContent>

      <style jsx>{`
        .glossy-shell {
          isolation: isolate;
        }

        :global(button) {
          cursor: pointer;
          touch-action: manipulation;
        }

        .glossy-shell :global(input:hover),
        .glossy-shell :global(textarea:hover),
        .glossy-shell :global([role="combobox"]:hover) {
          border-color: rgba(167, 139, 250, 0.55);
          background-color: rgba(15, 23, 42, 0.5);
        }

      `}</style>
    </Card>
  );
}
