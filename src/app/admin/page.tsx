"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";
import { PrintButton } from "./PrintButton";

export default function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (localStorage.getItem("admin") === "true") {
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
      <div className="mb-6 flex items-center justify-between gap-4">
        <PrintButton />
      </div>

      <h1 className="text-3xl font-bold">
  Applications ({data?.length})
</h1>

      {data?.map((app) => (
        <div
          key={app.id}
          className="mb-4 rounded-lg border p-4"
        >
          <h2 className="font-bold">{app.full_name}</h2>

          <p>Admission No: {app.student_id}</p>

          <p>School Email: {app.email}</p>

          <p>Personal Email: {app.personal_email}</p>

          <p>Parent Email: {app.guardian_email}</p>

          <p>Phone: {app.phone}</p>

          <p>WhatsApp: {app.contact_number}</p>

          <p>Parent Phone: {app.guardian_phone}</p>

          <p>Parent WhatsApp: {app.guardian_whatsapp}</p>

          <p>
            Year {app.year} {app.class_name}
          </p>

          <p>
            Roles: {app.roles?.join(", ")}
          </p>

          <p>
            Resources: {app.resources?.join(", ")}
          </p>

          <p>{app.experience}</p>
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