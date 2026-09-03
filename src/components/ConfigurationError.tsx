export default function ConfigurationError() {
  return (
    <main className="min-h-screen bg-[#0a0a0c] text-white flex items-center justify-center p-6">
      <section className="w-full max-w-lg rounded-2xl border border-amber-400/30 bg-zinc-900 p-8 shadow-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Configuration required</p>
        <h1 className="mt-3 text-2xl font-bold">Golden Minds Africa is not configured</h1>
        <p className="mt-4 text-sm leading-6 text-zinc-300">
          This deployment is missing its Supabase environment variables, so the application has not connected to any data service.
        </p>
        <div className="mt-6 rounded-lg bg-black/30 p-4 font-mono text-xs text-amber-100">
          VITE_SUPABASE_URL<br />
          VITE_SUPABASE_ANON_KEY
        </div>
        <p className="mt-5 text-sm text-zinc-400">
          Add both variables in your hosting provider, redeploy, and then reload this page. Do not put service-role or AI provider secrets in browser variables.
        </p>
      </section>
    </main>
  );
}
