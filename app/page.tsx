import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050505] text-white font-mono flex flex-col items-center justify-center p-4 selection:bg-white/20">
      <div className="fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Personality Profiler Card */}
        <Link href="/personality-profiler" className="group relative block h-64 border border-white/20 hover:border-white transition-colors bg-black">
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-8 h-full flex flex-col justify-between">
            <div>
              <span className="text-xs text-gray-500 tracking-widest uppercase">Module 01</span>
              <h2 className="text-2xl font-light mt-2 tracking-tight group-hover:translate-x-2 transition-transform">PERSONALITY PROFILER</h2>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
              Construct deep psychological profiles using Jungian cognitive dynamics, narrative identity, and axiological value systems.
            </p>
          </div>
        </Link>

        {/* Talk Card */}
        <Link href="/talk" className="group relative block h-64 border border-white/20 hover:border-white transition-colors bg-black">
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="p-8 h-full flex flex-col justify-between">
            <div>
              <span className="text-xs text-gray-500 tracking-widest uppercase">Module 02</span>
              <h2 className="text-2xl font-light mt-2 tracking-tight group-hover:translate-x-2 transition-transform">TALK</h2>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed max-w-xs">
              Interact with constructed personas. Simulate conversations based on generated cognitive and narrative architectures.
            </p>
          </div>
        </Link>
      </div>

      <footer className="fixed bottom-8 text-[10px] text-gray-600 tracking-[0.2em]">
        ANAMNESIS // SYSTEM READY
      </footer>
    </main>
  );
}
