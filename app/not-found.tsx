import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
      <h2 className="text-2xl font-black mb-2">Página não encontrada</h2>
      <p className="text-sm text-zinc-400 mb-6">A página solicitada não existe ou foi movida.</p>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition-colors"
      >
        Voltar para a Oficina
      </Link>
    </div>
  );
}
