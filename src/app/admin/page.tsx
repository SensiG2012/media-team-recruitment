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


import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PrintButton } from "./PrintButton";
import { ExportButton } from "./ExportButton";

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<any>(null);

  const [selectedTeam, setSelectedTeam] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");

  

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

const filteredData = data.filter((app) => {
  if (selectedYear !== "all" && String(app.year) !== selectedYear) {
    return false;
  }

  if (selectedRole !== "all") {
    return app.roles?.includes(selectedRole);
  }

  if (selectedTeam === "all") {
    return true;
  }

  if (
    selectedTeam === "visual" &&
    app.roles?.some((r: string) =>
      VISUAL_ROLES.includes(r)
    )
  ) {
    return true;
  }

  if (
    selectedTeam === "audio" &&
    app.roles?.some((r: string) =>
      AUDIO_ROLES.includes(r)
    )
  ) {
    return true;
  }

  if (
    selectedTeam === "speaking" &&
    app.roles?.some((r: string) =>
      SPEAKING_ROLES.includes(r)
    )
  ) {
    return true;
  }

  return false;
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

      <div className="mb-4">
  <select
  value={selectedYear}
  onChange={(e) => setSelectedYear(e.target.value)}
  className="mr-2 rounded-xl border px-4 py-2 transition-all duration-200 hover:scale-105 hover:border-cyan-400 hover:shadow-lg"
>
    <option value="all" className="text-black">All Years</option>
    {Array.from({ length: 7 }, (_, index) => index + 7).map((year) => (
      <option key={year} value={String(year)} className="text-black">
        Year {year}
      </option>
    ))}
  </select>

  <select
  value={selectedTeam}
  disabled={selectedRole !== "all"}
  onChange={(e) => setSelectedTeam(e.target.value)}
  className={`
    rounded-xl border px-4 py-2 transition-all duration-200 hover:-translate-y-0.5
hover:shadow-[0_0_20px_rgba(0,255,255,0.2)]
    ${selectedRole !== "all"
      ? "cursor-not-allowed opacity-40 grayscale"
      : "cursor-pointer hover:scale-105 hover:border-cyan-400 hover:shadow-lg"}
  `}
>
    <option value="all" className="text-black">
  All Applicants
</option>

<option value="visual"className="text-black">
  Visual Team
</option>

<option value="audio" className="text-black">
  Audio Team
</option>

<option value="speaking" className="text-black">
  Speaking Team
</option>
  </select>

      <select 
  value={selectedRole}
  disabled={selectedTeam !== "all"}
  onChange={(e) => setSelectedRole(e.target.value)}
  className={`
    rounded-xl border px-4 py-2 transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,105,180,0.25)]
    ${selectedTeam !== "all"
      ? "cursor-not-allowed opacity-40 grayscale"
      : "cursor-pointer hover:scale-105 hover:border-pink-400 hover:shadow-lg"}
  `}
>

  <option value="all" className="text-black">All Roles</option>

  <option value="Photographer" className="text-black">Photographer</option>
  <option value="Videographer" className="text-black">Videographer</option>
  <option value="Video Editor" className="text-black">Video Editor</option>
  <option value="Photo Editor" className="text-black">Photo Editor</option>
  <option value="2D Animator" className="text-black">2D Animator</option>
  <option value="3D Animator" className="text-black">3D Animator</option>

  <option value="Audio Mixer" className="text-black">Audio Mixer</option>
  <option value="Sound Engineer" className="text-black">Sound Engineer</option>
  <option value="Music Producer" className="text-black">Music Producer</option>

  <option value="Script Writer" className="text-black">Script Writer</option>
  <option value="Commentator" className="text-black">Commentator</option>
  <option value="Comperer" className="text-black">Comperer</option>
  <option value="Announcer" className="text-black">Announcer</option>
</select>

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