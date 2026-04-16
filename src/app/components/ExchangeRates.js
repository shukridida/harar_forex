"use client";

import { useEffect, useState } from "react";

export default function ExchangeRates() {
  const defaultRates = [
  { currency: "US DOLLAR", buy: 128.50, sell: 130.00 },
    { currency: "EURO", buy: 148.00, sell: 130.00},
    { currency: "CANADIAN $", buy: 91.00, sell: 96.00 },
    { currency: "STERLING POUND", buy: 170.00, sell: 175.00},
    { currency: "DIRHAM", buy: 32.00, sell: 37.00 },
    { currency: "AUSTRALIAN $", buy: 85.00, sell: 90.00 },
    { currency: "UGANDA SH", buy: 19.00, sell: 25.00 },
    { currency: "TANZANIA SH", buy: 4.00, sell: 6.00},
    { currency: "SWISS FRANCS", buy: 163.00, sell: 168.00 },
    { currency: "S.A RAND", buy: 5.00, sell: 10.00 },
    { currency: "S.ARABIAN RIYAL", buy: 31.50, sell:35.50},
    { currency: "INDIAN RUPEE", buy: 1.00, sell: 2.50 },
    { currency: "CHINESE YUAN", buy: 16.00, sell: 18.00},
    { currency: "QATAR RIYAL", buy: 32.50, sell: 37.50 }, 
  ];

  const [rates, setRates] = useState(defaultRates);
  const [date, setDate] = useState("");

  useEffect(() => {
    const loadRates = () => {
      const savedRates = localStorage.getItem("rates");

      if (savedRates) {
        setRates(JSON.parse(savedRates));
      }
    };

    loadRates();

    // listen for admin updates
    window.addEventListener("storage", loadRates);

    return () => {
      window.removeEventListener("storage", loadRates);
    };
  }, []);

  // 📅 Set today's date
  useEffect(() => {
    const today = new Date();
    const formatted = today.toLocaleDateString("en-GB");
    setDate(formatted);
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