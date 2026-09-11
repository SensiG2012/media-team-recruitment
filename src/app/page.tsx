import MultiStepForm from "@/components/MultiStepForm";

export default function Home() {
  return (
    <main className="app-shell flex min-h-screen items-center justify-center px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="bg-orb left-1/2 top-20 h-72 w-72 -translate-x-1/2 bg-violet-500/30" />
        <div className="bg-orb bottom-10 right-12 h-64 w-64 bg-cyan-500/20" />
        <div className="bg-orb left-12 top-1/3 h-52 w-52 bg-fuchsia-500/15" />
      </div>

      <MultiStepForm />
    </main>
  );
}