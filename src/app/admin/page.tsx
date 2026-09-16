"use client";

function getRoleColor(role: string) {
  const VISUAL_ROLES = [
    "Photographer",
    "Videographer",
    "Video Editor",
    "Photo Editor",
    "2D Animator",
    "3D Animator",
  ];

  const AUDIO_ROLES = [
    "Audio Mixer",
    "Sound Engineer",
    "Music Producer",
  ];

  const SPEAKING_ROLES = [
    "Script Writer",
    "Commentator",
    "Comperer",
    "Announcer",
  ];

  if (VISUAL_ROLES.includes(role)) {
    return "text-white";
  }

  if (AUDIO_ROLES.includes(role)) {
    return "text-cyan-300";
  }

  if (SPEAKING_ROLES.includes(role)) {
    return "text-pink-300";
  }

  return "text-gray-300";
}


import { type ReactNode, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PrintButton } from "./PrintButton";
import { ExportButton } from "./ExportButton";

function FilterGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm font-semibold">{label}:</span>
      {children}
    </div>
  );
}

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`rounded-xl border px-3 py-2 text-sm transition-all duration-200 hover:-translate-y-0.5 ${
        active
          ? "border-cyan-400 bg-cyan-400/30 text-white shadow-lg"
          : "border-white/30 bg-white/10 hover:border-cyan-400"
      }`}
    >
      {children}
    </button>
  );
}

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<any>(null);

  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);

  

const VISUAL_ROLES = [
  "Photographer",
  "Videographer",
  "Video Editor",
  "Photo Editor",
  "2D Animator",
  "3D Animator",
];

const AUDIO_ROLES = [
  "Audio Mixer",
  "Sound Engineer",
  "Music Producer",
];

const SPEAKING_ROLES = [
  "Script Writer",
  "Commentator",
  "Comperer",
  "Announcer",
];

const TEAM_OPTIONS = [
  { value: "visual", label: "Visual Team", roles: VISUAL_ROLES },
  { value: "audio", label: "Audio Team", roles: AUDIO_ROLES },
  { value: "speaking", label: "Speaking Team", roles: SPEAKING_ROLES },
];

const ROLE_OPTIONS = [
  ...VISUAL_ROLES,
  ...AUDIO_ROLES,
  ...SPEAKING_ROLES,
];

function toggleSelection(
  selected: string[],
  value: string,
  setSelected: (values: string[]) => void
) {
  setSelected(
    selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value]
  );
}

const filteredData = data.filter((app) => {
  if (selectedYears.length > 0 && !selectedYears.includes(String(app.year))) {
    return false;
  }

  if (
    selectedRoles.length > 0 &&
    !selectedRoles.some((selectedRole) => app.roles?.includes(selectedRole))
  ) {
    return false;
  }

  return (
    selectedTeams.length === 0 ||
    selectedTeams.some((selectedTeam) => {
      const team = TEAM_OPTIONS.find((option) => option.value === selectedTeam);
      return team?.roles.some((teamRole) => app.roles?.includes(teamRole));
    })
  );
});

  const modeClasses =
  role === "admin"
    ? {
        header:
          "bg-yellow-300/20 border border-yellow-400 backdrop-blur-xl",
        card:
          "bg-amber-300/20 border-yellow-300 backdrop-blur-xl",
      }
    : {
        header:
          "bg-teal-300/20 border border-teal-400 backdrop-blur-xl",
        card:
          "bg-cyan-300/20 border-teal-300 backdrop-blur-xl",
      };

  useEffect(() => {
    const savedRole = localStorage.getItem("role");

    if (savedRole) {
      setRole(savedRole);
      setAuthorized(true);
      
    } else {
      window.location.href = "/admin-login";
    }
  }, []);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .order("created_at", { ascending: false });

      setData(data ?? []);
      setError(error);
    }

    if (authorized) {
      load();
    }
  }, [authorized]);

  if (!authorized) {
    return null;
  }

  if (error) {
    return (
      <div>
        <h1>Error</h1>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div className="admin-print-page p-8">
      <div
  className={`mb-6 flex items-center justify-between gap-4 rounded-xl p-4 ${modeClasses.header}`}
>
        <div>
  <h1 className="text-3xl font-bold">
    Applications ({data.length})
  </h1>

  <p className="text-sm opacity-80">
    {role === "admin"
      ? "Admin Mode"
      : "Review Mode"}
  </p>
</div>

        {role === "admin" && (
          <div className="flex flex-wrap gap-2">
            <ExportButton applications={filteredData} />
            <PrintButton />
          </div>
        )}
      </div>

      <div className="mb-4 space-y-3">
        <FilterGroup label="Years">
          {Array.from({ length: 7 }, (_, index) => String(index + 7)).map((year) => (
            <FilterButton
              key={year}
              active={selectedYears.includes(year)}
              onClick={() => toggleSelection(selectedYears, year, setSelectedYears)}
            >
              Year {year}
            </FilterButton>
          ))}
        </FilterGroup>

        <FilterGroup label="Teams">
          {TEAM_OPTIONS.map((team) => (
            <FilterButton
              key={team.value}
              active={selectedTeams.includes(team.value)}
              onClick={() => toggleSelection(selectedTeams, team.value, setSelectedTeams)}
            >
              {team.label}
            </FilterButton>
          ))}
        </FilterGroup>

        <FilterGroup label="Roles">
          {ROLE_OPTIONS.map((roleOption) => (
            <FilterButton
              key={roleOption}
              active={selectedRoles.includes(roleOption)}
              onClick={() => toggleSelection(selectedRoles, roleOption, setSelectedRoles)}
            >
              {roleOption}
            </FilterButton>
          ))}
        </FilterGroup>
      </div>

      {filteredData.map((app) => (
        <div
  key={app.id}
  className={`mb-4 rounded-xl border p-4 ${modeClasses.card}`}
>
          {/* Everyone sees */}
          <h2 className="font-bold">{app.full_name}</h2>

          <p>
            Year {app.year} {app.class_name}
          </p>

          <p>Campus: {app.campus}</p>

          <div className="flex flex-wrap gap-3">
  {app.roles?.map((roleName: string) => (
    <span
      key={roleName}
      className={`font-semibold ${getRoleColor(roleName)}`}
    >
      {roleName}
    </span>
  ))}
</div>

          {/* Admin-only details */}
          {role === "admin" && (
            <>
              <hr className="my-3" />

              <p>Admission No: {app.student_id}</p>

              <p>School Email: {app.email}</p>

              <p>Personal Email: {app.personal_email}</p>

              <p>Parent Email: {app.guardian_email}</p>

              <p>Phone: {app.phone}</p>

              <p>WhatsApp: {app.contact_number}</p>

              <p>Parent Phone: {app.guardian_phone}</p>

              <p>
                Parent WhatsApp: {app.guardian_whatsapp}
              </p>

              <p>
                Resources: {app.resources?.join(", ")}
              </p>

              <p>{app.experience}</p>

              <p>
  Submitted:{" "}
  {new Date(app.created_at).toLocaleString(
    "en-GB",
    {
      timeZone: "Europe/Moscow",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  )}
</p>
            </>
          )}
        </div>
      ))}

      <style>{`
        @media print {
          .admin-print-page,
          .admin-print-page * {
            color: #000 !important;
          }

          .admin-print-page button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}