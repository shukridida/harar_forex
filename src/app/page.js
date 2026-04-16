import Link from "next/link";
import ExchangeRates from "./components/ExchangeRates";

export default function Home() {
  return (
    <main
      className="relative min-h-screen text-white bg-cover bg-center"
      style={{ backgroundImage: "url('/brand-logo.jpg')" }}
    >

      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* CONTENT */}
      <div className="relative z-10">

        {/* NAVBAR */}
        <nav className="flex justify-between items-center px-8 py-5">

          {/* LOGO */}
          <img
            src="/logo.jpg"
            alt="logo"
            style={{ width: "80px", height: "80px", objectFit: "contain" }}
          />

         <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
  <h1 className="text-2xl font-bold text-white">
    HARAR <span className="text-[#166534]">BUREAU</span>
  </h1>
</div>

          <div className="space-x-6 hidden md:flex">
            <Link href="/">Home</Link>
            <Link href="/about">About</Link>
            <Link href="/rates">Rates</Link>
            <Link href="/contact">Contact</Link>
          </div>

        </nav>

        {/* HERO */}
        <section className="text-center py-24 px-6">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Fast & Trusted Forex Exchange
          </h2>

          <p className="max-w-2xl mx-auto text-white/90 mb-8">
            Harar Forex is your trusted partner for currency exchange and money transfers.
          </p>

          <Link href="/rates">
            <button className="bg-[#166534] px-6 py-3 rounded-lg font-semibold hover:opacity-90">
              View Rates
            </button>
          </Link>
        </section>

        {/* RATES */}
        <section className="px-6 pb-20">
          <ExchangeRates />
        </section>

      </div>
    </main>
  );
}