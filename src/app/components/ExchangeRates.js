"use client";

import { useCallback, useEffect, useState } from "react";

export default function ExchangeRates() {
  const [rates, setRates] = useState([]);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/rates", { cache: "no-store" });
      if (!response.ok) throw new Error("Rate request failed");
      const data = await response.json();
      if (!Array.isArray(data.rates) || !data.updatedAt) throw new Error("Invalid rate response");
      setRates(data.rates);
      setUpdatedAt(data.updatedAt);
      setError(false);
    } catch {
      setRates([]);
      setUpdatedAt(null);
      setError(true);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const initialRefresh = window.setTimeout(refresh, 0);
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, 60000);
    const onVisible = () => { if (document.visibilityState === "visible") refresh(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(initialRefresh);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  const date = updatedAt ? new Date(updatedAt).toLocaleDateString("en-GB") : "";
  return (
    <div className="max-w-6xl mx-auto bg-white text-black p-6 rounded-2xl shadow-xl mt-10 overflow-x-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Forex Exchange Rates</h2>
      {loading ? <p className="text-center" role="status">Loading current rates…</p> : error ? <p className="text-center" role="alert">Rates are temporarily unavailable. Please try again shortly.</p> : rates.length === 0 ? <p className="text-center" role="alert">Rates have not been published yet.</p> : <>
        <table className="w-full border-collapse"><thead><tr className="bg-gray-300 text-center"><th className="p-3">Date</th><th className="p-3">Currency</th><th className="p-3">Buy</th><th className="p-3">Sell</th></tr></thead>
          <tbody>{rates.map((rate) => <tr key={rate.currency} className="text-center border-b"><td className="p-3">{date}</td><td className="p-3 font-semibold">{rate.currency}</td><td className="p-3 text-green-600 font-semibold">{rate.buy}</td><td className="p-3 text-red-600 font-semibold">{rate.sell}</td></tr>)}</tbody>
        </table>
      </>}
    </div>
  );
}
