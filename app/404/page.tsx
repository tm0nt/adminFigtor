export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center px-4">
      <h1 className="text-[#90f209] text-[200px] font-bold leading-none mb-8">404</h1>

      <p className="text-[#ffffff] text-2xl mb-8">
        Volte para a <span className="font-bold">Home</span> ou <span className="font-bold">Faça Login</span>
      </p>

      <div className="flex gap-4">
        <button className="bg-white text-[#000000] font-semibold px-8 py-3 rounded-lg hover:bg-[#f0f0f0] transition-colors">
          Fazer Login
        </button>
        <button className="bg-[#90f209] text-[#000000] font-semibold px-8 py-3 rounded-lg hover:bg-[#a0ff20] transition-colors">
          Voltar para Home
        </button>
      </div>
    </div>
  )
}
