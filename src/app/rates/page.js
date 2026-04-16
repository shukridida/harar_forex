import ExchangeRates from "../components/ExchangeRates";

export default function Rates() {
  return (
    <main className="min-h-screen bg-[#14B8A6] text-white p-6">

      <h1 className="text-3xl font-bold text-[#166534] mb-6">
        Live Exchange Rates
      </h1>

      {/* THIS is where your rates go */}
      <div className="bg-white/10 p-6 rounded-lg shadow-md">
        <ExchangeRates />
      </div>

    </main>
  );
}