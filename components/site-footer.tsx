export default function SiteFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-8 bg-black border-t border-[#1a5c1a]/20">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="text-center md:text-left mb-4 md:mb-0">
          <p className="text-[#b49b57] font-serif text-xl">The Gaskin Masters Pool</p>
          <p className="text-white/60 text-sm mt-1 italic">A tradition unlike any other</p>
        </div>
        <div className="text-white/60 text-sm">
          Contact: <a href="mailto:henry@gaskin.pro" className="text-[#b49b57] hover:underline">henry@gaskin.pro</a>
        </div>
      </div>
    </footer>
  );
} 