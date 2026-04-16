import Link from "next/link";
import Image from "next/image";
import ExchangeRates from "./components/ExchangeRates";
export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B1C2D] text-white">
 
      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-8 py-5 bg-black shadow-md">
        <h1 className="text-2xl font-bold text-yellow-400">
         HARAR BUREAU
        </h1>

        <div className="space-x-6 hidden md:flex">
          <Link href="#">Home</Link>
          <Link href="#">Rates</Link>
          <Link href="#">Contact</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="text-center py-24 px-6">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
          Fast & Trusted Forex Exchange <br /> 
          <span className="text-yellow-400">+ Kuwa Pay Transfers</span>
        </h2>

        <p className="text-gray-300 max-w-2xl mx-auto mb-8">
          Harar Forex is your trusted partner for currency exchange and money transfers. We offer competitive rates, fast transactions, and secure services to help you move money worldwide with confidence.
        </p>

        <div className="flex justify-center gap-4">
          <button className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:scale-105 transition">
            View Rates
          </button>

         
        </div>
      </section>
      <section className="px-6 pb-20">
  <ExchangeRates />
</section>

    </main>
  );
}