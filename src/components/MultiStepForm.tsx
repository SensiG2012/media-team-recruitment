"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

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
  "2026-09-17T23:59:59"
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

export default function MultiStepForm() {
  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    student_id: "",
    guardian_name: "",
    guardian_email: "",
    email: "",
    phone: "",
    contact_number: "",
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

  const validateForm = () => {
    if (
      !formData.full_name ||
      !formData.student_id ||
      !formData.guardian_name ||
      !formData.guardian_email ||
      !formData.email ||
      !formData.phone ||
      !formData.contact_number ||
      !formData.year ||
      !formData.campus ||
      !formData.class_name ||
      formData.roles.length === 0
    ) {
      setErrorMessage("Please fill in all required fields before submitting.");
      window.setTimeout(() => setErrorMessage(""), 5000);
      return false;
    }

    return true;
  };

  const inputClass =
    "h-12 w-full rounded-2xl border border-white/10 bg-slate-950/30 px-4 text-sm text-white placeholder:text-slate-400 shadow-inner shadow-slate-950/30 transition-all duration-200 focus-visible:border-violet-400/80 focus-visible:ring-4 focus-visible:ring-violet-500/15";

  const chipClass =
    "rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-100 transition-all duration-200 hover:border-violet-400/60 hover:bg-violet-500/10";

  const selectedChipClass =
    "rounded-full border border-violet-400/70 bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-950/40";

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

          email: formData.email,
          phone: formData.phone,
          contact_number: formData.contact_number,

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
      <div className="glossy-orb glossy-orb-one" />
      <div className="glossy-orb glossy-orb-two" />
      <div className="glossy-sheen" />

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
          <div className="step-panel space-y-5">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight text-white">
                Personal Information
              </h2>
              <p className="text-sm text-slate-400">
                Tell us a little about yourself.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
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

              <div className="space-y-2 sm:col-span-2">
                <Label className="text-sm font-medium text-slate-200">
                  Student Admission Number
                </Label>
                <Input
                  className={inputClass}
                  value={formData.student_id}
                  placeholder="e.g. 3939"
                  onChange={(e) =>
                    setFormData({ ...formData, student_id: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
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
                <Label className="text-sm font-medium text-slate-200">Personal Email</Label>
                <Input
                  type="email"
                  className={inputClass}
                  value={formData.guardian_email}
                  placeholder="ex: kristophe@gmail.com"
                  onChange={(e) =>
                    setFormData({ ...formData, guardian_email: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-200">School Email</Label>
                <Input
                  type="email"
                  className={inputClass}
                  value={formData.email}
                  placeholder="ex: 4949@sslsd.education"
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-200">Phone Number</Label>
                <Input
                  className={inputClass}
                  value={formData.phone}
                  placeholder="+971 5xx xxx xxx"
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-200">WhatsApp Number</Label>
                <Input
                  className={inputClass}
                  value={formData.contact_number}
                  placeholder="+971 5xx xxx xxx"
                  onChange={(e) =>
                    setFormData({ ...formData, contact_number: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-panel space-y-6">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight text-white">
                Academic Information
              </h2>
              <p className="text-sm text-slate-400">
                What's your Campus, along with your Year and Class.
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
          <div className="step-panel space-y-7">
            <div className="space-y-2">
              <h2 className="text-3xl font-semibold tracking-tight text-white">
                Desired Roles
              </h2>
              <p className="text-sm text-slate-400">
                Select as many roles as you'd like. At least one role is required.
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
          <div className="step-panel space-y-6">
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
                onChange={(e) =>
                  setFormData({ ...formData, experience: e.target.value })
                }
              />
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
          <Button
            variant="outline"
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
            className="min-h-11 w-full min-w-[110px] cursor-pointer rounded-full border-white/10 bg-white/5 px-5 text-slate-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
          >
            ← Back
          </Button>

          {step < maxSteps ? (
            <Button
              onClick={() => setStep(step + 1)}
              className="min-h-11 w-full min-w-[110px] cursor-pointer rounded-full border border-violet-400/60 bg-gradient-to-r from-violet-500 to-indigo-500 px-5 text-white shadow-lg shadow-violet-950/40 hover:brightness-110 sm:w-auto"
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

        .glossy-orb {
          position: absolute;
          z-index: 0;
          width: 190px;
          height: 190px;
          border-radius: 9999px;
          filter: blur(48px);
          opacity: 0.35;
          pointer-events: none;
          animation: float 7s ease-in-out infinite;
        }

        .glossy-orb-one {
          top: -85px;
          right: -45px;
          background: #8b5cf6;
        }

        .glossy-orb-two {
          bottom: -95px;
          left: -55px;
          background: #2563eb;
          animation-delay: -3s;
        }

        .glossy-sheen {
          position: absolute;
          z-index: 1;
          inset: -100%;
          pointer-events: none;
          background: linear-gradient(
            115deg,
            transparent 35%,
            rgba(255, 255, 255, 0.14) 48%,
            transparent 60%
          );
          transform: translateX(-45%) rotate(8deg);
          animation: sheen 8s ease-in-out infinite;
        }

        :global(button) {
          cursor: pointer;
          touch-action: manipulation;
          transition:
            transform 180ms ease,
            box-shadow 180ms ease,
            filter 180ms ease;
        }

        :global(button:hover:not(:disabled)) {
          transform: translateY(-2px) scale(1.02);
          filter: brightness(1.12);
          box-shadow: 0 8px 24px rgba(99, 102, 241, 0.3);
        }

        :global(button:active:not(:disabled)) {
          transform: translateY(0) scale(0.98);
        }

        .glossy-shell :global(input:hover),
        .glossy-shell :global(textarea:hover),
        .glossy-shell :global([role="combobox"]:hover) {
          border-color: rgba(167, 139, 250, 0.55);
          background-color: rgba(15, 23, 42, 0.5);
        }

        .step-panel {
          animation: panel-in 350ms ease-out both;
        }

        @keyframes panel-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes sheen {
          0%,
          35% {
            transform: translateX(-45%) rotate(8deg);
          }

          65%,
          100% {
            transform: translateX(45%) rotate(8deg);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }

          50% {
            transform: translate(20px, -15px) scale(1.1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .glossy-orb,
          .glossy-sheen,
          .step-panel {
            animation: none;
          }

          :global(button) {
            transition: none;
          }
        }
      `}</style>
    </Card>
  );
}
