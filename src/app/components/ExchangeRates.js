"use client";

import { useEffect, useState } from "react";

export default function ExchangeRates() {
  const defaultRates = [
    { currency: "US DOLLAR", buy: 128.5, sell: 130.0 },
    { currency: "EURO", buy: 148.0, sell: 150.0 },
    { currency: "CANADIAN $", buy: 91.0, sell: 96.0 },
    { currency: "STERLING POUND", buy: 170.0, sell: 175.0 },
    { currency: "DIRHAM", buy: 32.0, sell: 37.0 },
    { currency: "AUSTRALIAN $", buy: 85.0, sell: 90.0 },
    { currency: "UGANDA SH", buy: 19.0, sell: 25.0 },
    { currency: "TANZANIA SH", buy: 4.0, sell: 6.0 },
    { currency: "SWISS FRANCS", buy: 163.0, sell: 168.0 },
    { currency: "S.A RAND", buy: 5.0, sell: 10.0 },
    { currency: "S.ARABIAN RIYAL", buy: 31.5, sell: 35.5 },
    { currency: "INDIAN RUPEE", buy: 1.0, sell: 2.5 },
    { currency: "CHINESE YUAN", buy: 16.0, sell: 18.0 },
    { currency: "QATAR RIYAL", buy: 32.5, sell: 37.5 },
  ];

  const [rates, setRates] = useState(defaultRates);
  const [date, setDate] = useState("");

  // ✅ LOAD RATES (WORKS EVERY TIME)
  const loadRates = () => {
    const saved = localStorage.getItem("rates");
    if (saved) {
      setRates(JSON.parse(saved));
    }
  };

  useEffect(() => {
    loadRates();

    // 🔥 FIX: poll every 1 second (reliable for same tab)
    const interval = setInterval(() => {
      loadRates();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 📅 DATE
  useEffect(() => {
    const today = new Date();
    setDate(today.toLocaleDateString("en-GB"));
  }, []);

  return (
    <div className="max-w-6xl mx-auto bg-white text-black p-6 rounded-2xl shadow-xl mt-10 overflow-x-auto">

      <h2 className="text-2xl font-bold mb-4 text-center">
        Forex Exchange Rates
      </h2>

      <table className="w-full border-collapse">

        <thead>
          <tr className="bg-gray-300 text-center">
            <th className="p-3">Date</th>
            <th className="p-3">Currency</th>
            <th className="p-3">Buy</th>
            <th className="p-3">Sell</th>
          </tr>
        </thead>

        <tbody>
          {rates.map((rate, index) => (
            <tr key={index} className="text-center border-b">

              <td className="p-3">{date}</td>
              <td className="p-3 font-semibold">{rate.currency}</td>

              <td className="p-3 text-green-600 font-semibold">
                {rate.buy}
              </td>

              <td className="p-3 text-red-600 font-semibold">
                {rate.sell}
              </td>

            </tr>
          ))}
        </tbody>

      </table>
    </div>
  );
}