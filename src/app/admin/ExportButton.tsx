"use client";

import { Download } from "lucide-react";
import * as XLSX from "xlsx";

type Application = {
  full_name?: string;
  student_id?: string;
  guardian_name?: string;
  guardian_email?: string;
  personal_email?: string;
  email?: string;
  phone?: string;
  contact_number?: string;
  guardian_phone?: string;
  guardian_whatsapp?: string;
  campus?: string;
  year?: string | number;
  class_name?: string;
  roles?: string[];
  resources?: string[];
  other_resources?: string;
  experience?: string;
  created_at?: string;
};

type ExportButtonProps = {
  applications: Application[];
};

export function ExportButton({ applications }: ExportButtonProps) {
  function exportApplications() {
    const rows = applications.map((application) => ({
      "Full Name": application.full_name ?? "",
      "Admission No": application.student_id ?? "",
      "Year": application.year ?? "",
      "Class": application.class_name ?? "",
      "Campus": application.campus ?? "",
      "Roles": application.roles?.join(", ") ?? "",
      "School Email": application.email ?? "",
      "Personal Email": application.personal_email ?? "",
      "Phone": application.phone ?? "",
      "WhatsApp": application.contact_number ?? "",
      "Parent Name": application.guardian_name ?? "",
      "Parent Email": application.guardian_email ?? "",
      "Parent Phone": application.guardian_phone ?? "",
      "Parent WhatsApp": application.guardian_whatsapp ?? "",
      "Resources": application.resources?.join(", ") ?? "",
      "Other Resources": application.other_resources ?? "",
      "Experience": application.experience ?? "",
      "Submitted": application.created_at
        ? new Date(application.created_at).toLocaleString("en-GB", {
            timeZone: "Europe/Moscow",
          })
        : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");
    XLSX.writeFile(workbook, `applications-${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  return (
    <button
      type="button"
      onClick={exportApplications}
      disabled={applications.length === 0}
      className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
    >
      <Download className="size-4" aria-hidden="true" />
      Export XLSX
    </button>
  );
}