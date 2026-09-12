import { supabase } from "@/lib/supabase";

export default async function AdminPage() {
  const { data, error } = await supabase
    .from("applications")
    .select("*");

  if (error) {
    return (
      <div>
        <h1>Error</h1>
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="mb-6 text-3xl font-bold">
        Applications
      </h1>

      {data?.map((app) => (
        <div
          key={app.id}
          className="mb-4 rounded-lg border p-4"
        >
          <h2>{app.full_name}</h2>

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
    </div>
  );
}