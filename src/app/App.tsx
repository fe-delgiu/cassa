import { useState } from 'react';
import confetti from 'canvas-confetti';

type Currency = {
  value: number;
  label: string;
  type: 'coin' | 'note';
  color?: string;
};

const currencies: Currency[] = [
  { value: 0.05, label: '5c', type: 'coin', color: '#CD7F32' },
  { value: 0.10, label: '10c', type: 'coin', color: '#FFD700' },
  { value: 0.20, label: '20c', type: 'coin', color: '#FFD700' },
  { value: 0.50, label: '50c', type: 'coin', color: '#FFD700' },
  { value: 1, label: '€1', type: 'coin', color: '#C0C0C0' },
  { value: 2, label: '€2', type: 'coin', color: '#C0C0C0' },
  { value: 5, label: '€5', type: 'note', color: '#8B8680' },
  { value: 10, label: '€10', type: 'note', color: '#DC143C' },
  { value: 20, label: '€20', type: 'note', color: '#4169E1' },
  { value: 50, label: '€50', type: 'note', color: '#FF8C00' },
];

function Coin({ currency, size }: { currency: Currency; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      <defs>
        <radialGradient id={`grad-${currency.label}`}>
          <stop offset="0%" stopColor={currency.color} stopOpacity="1" />
          <stop offset="100%" stopColor={currency.color} stopOpacity="0.7" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill={`url(#grad-${currency.label})`} stroke="#333" strokeWidth="2" />
      <circle cx="50" cy="50" r="42" fill="none" stroke="#555" strokeWidth="1" strokeDasharray="4 2" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <circle
          key={i}
          cx={50 + 30 * Math.cos((angle * Math.PI) / 180)}
          cy={50 + 30 * Math.sin((angle * Math.PI) / 180)}
          r="2"
          fill="#FFD700"
          opacity="0.6"
        />
      ))}
      <text
        x="50"
        y="58"
        textAnchor="middle"
        fill="#333"
        fontSize="24"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        {currency.label}
      </text>
    </svg>
  );
}

function Note({ currency, width, height }: { currency: Currency; width: number; height: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 140 70">
      <defs>
        <linearGradient id={`note-grad-${currency.label}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={currency.color} stopOpacity="0.9" />
          <stop offset="50%" stopColor={currency.color} stopOpacity="1" />
          <stop offset="100%" stopColor={currency.color} stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="136" height="66" rx="6" fill={`url(#note-grad-${currency.label})`} stroke="#333" strokeWidth="3" />
      <rect x="8" y="8" width="124" height="54" rx="4" fill="none" stroke="#fff" strokeWidth="2" strokeOpacity="0.5" />
      <circle cx="30" cy="35" r="12" fill="#fff" opacity="0.2" />
      <circle cx="110" cy="35" r="12" fill="#fff" opacity="0.2" />
      <text
        x="70"
        y="45"
        textAnchor="middle"
        fill="#fff"
        fontSize="28"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        {currency.label}
      </text>
    </svg>
  );
}

function calculateOptimalChange(amount: number): { value: number; count: number }[] {
  const result: { value: number; count: number }[] = [];
  let remaining = Math.round(amount * 100);

  const denominations = [5000, 2000, 1000, 500, 200, 100, 50, 20, 10, 5];

  for (const denom of denominations) {
    if (remaining >= denom) {
      const count = Math.floor(remaining / denom);
      result.push({ value: denom / 100, count });
      remaining -= count * denom;
    }
  }

  return result;
}

export default function App() {
  const [totalAmount, setTotalAmount] = useState<string>('12.50');
  const [receivedAmount, setReceivedAmount] = useState<string>('20.00');
  const [selectedCurrency, setSelectedCurrency] = useState<{ value: number; count: number }[]>([]);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const changeNeeded = parseFloat(receivedAmount || '0') - parseFloat(totalAmount || '0');
  const selectedTotal = selectedCurrency.reduce((sum, item) => sum + item.value * item.count, 0);

  const addCurrency = (value: number) => {
    const existing = selectedCurrency.find(item => item.value === value);
    if (existing) {
      setSelectedCurrency(
        selectedCurrency.map(item =>
          item.value === value ? { ...item, count: item.count + 1 } : item
        )
      );
    } else {
      setSelectedCurrency([...selectedCurrency, { value, count: 1 }]);
    }
    setResult(null);
  };

  const removeCurrency = (value: number) => {
    const existing = selectedCurrency.find(item => item.value === value);
    if (existing && existing.count > 1) {
      setSelectedCurrency(
        selectedCurrency.map(item =>
          item.value === value ? { ...item, count: item.count - 1 } : item
        )
      );
    } else {
      setSelectedCurrency(selectedCurrency.filter(item => item.value !== value));
    }
    setResult(null);
  };

  const generateNewChallenge = () => {
    const rawTotal = (Math.random() * 40 + 5);
    // Genera un totale casuale tra 5 e 45 euro
    const newTotal = (Math.round(rawTotal * 20) / 20).toFixed(2); // arrotonda a 0.05
    

    // Genera un denaro ricevuto che sia maggiore del totale
    const totalNum = parseFloat(newTotal);
    const possibleAmounts = [5, 10, 20, 50, 100];
    const minAmount = Math.ceil(totalNum / 5) * 5; // Arrotonda al multiplo di 5 superiore
    const validAmounts = possibleAmounts.filter(amt => amt > totalNum);
    const received = validAmounts.length > 0
      ? validAmounts[Math.floor(Math.random() * validAmounts.length)]
      : minAmount;

    setTotalAmount(newTotal);
    setReceivedAmount(received.toFixed(2));
    setSelectedCurrency([]);
    setResult(null);
  };

  const verifyAnswer = () => {
    const isCorrect = Math.abs(selectedTotal - changeNeeded) < 0.01;
    setResult(isCorrect ? 'correct' : 'incorrect');

    if (isCorrect) {
      setShowConfetti(true);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => setShowConfetti(false), 3000);

      // Genera una nuova sfida dopo 3 secondi
      setTimeout(() => {
        generateNewChallenge();
      }, 3000);
    } else {
      // Anche se sbagliato, genera una nuova sfida dopo 4 secondi
      setTimeout(() => {
        generateNewChallenge();
      }, 4000);
    }
  };

  const resetGame = () => {
    setSelectedCurrency([]);
    setResult(null);
    setShowConfetti(false);
  };

  const optimalChange = calculateOptimalChange(changeNeeded);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#32CD32] p-2 sm:p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-center text-white mb-2 sm:mb-4 md:mb-8 font-[Bowlby_One_SC]" style={{ fontSize: 'clamp(1.5rem, 5vw, 3rem)', fontWeight: 'bold', textShadow: '2px 2px 0 rgba(0,0,0,0.2)' }}>
          🏪 CASSA 🏪
        </h1>

        <div className="bg-gradient-to-br from-[#8B4513] to-[#A0522D] p-2 sm:p-4 md:p-8 rounded-xl sm:rounded-2xl md:rounded-3xl shadow-2xl mb-2 sm:mb-4 md:mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4 md:gap-6 mb-2 sm:mb-4 md:mb-6">
            <div className="bg-white/90 p-2 sm:p-4 md:p-6 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg bg-[#ffb4b4e6]">
              <label className="block mb-1 sm:mb-2 text-center text-xs sm:text-sm md:text-base font-[Bowlby_One_SC]" style={{ color: '#DC143C', fontWeight: 'bold' }}>💰 Totale da Pagare</label>
              <input
                type="number"
                step="0.01"
                value={totalAmount}
                onChange={(e) => {
                  setTotalAmount(e.target.value);
                  resetGame();
                }}
                className="w-full p-1 sm:p-2 md:p-3 text-center  rounded-lg sm:rounded-xl bg-[#f4f3ed]"
                style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)', fontWeight: 'bold' }}
              />
            </div>

            <div className="bg-white/90 p-2 sm:p-4 md:p-6 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg bg-[#a2ffa2e6]">
              <label className="block mb-1 sm:mb-2 text-center text-xs sm:text-sm md:text-base font-[Bowlby_One_SC]" style={{ color: '#228B22', fontWeight: 'bold' }}>💵 Denaro Ricevuto</label>
              <input
                type="number"
                step="0.01"
                value={receivedAmount}
                onChange={(e) => {
                  setReceivedAmount(e.target.value);
                  resetGame();
                }}
                className="w-full p-1 sm:p-2 md:p-3 text-center rounded-lg sm:rounded-xl bg-[#F0FFF0]"
                style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)', fontWeight: 'bold' }}
              />
            </div>

            <div className="bg-white/90 p-2 sm:p-4 md:p-6 rounded-lg sm:rounded-xl md:rounded-2xl shadow-lg bg-[#fffed8e6]">
              <label className="block mb-1 sm:mb-2 text-center text-xs sm:text-sm md:text-base font-[Bowlby_One_SC]" style={{ color: '#FF4500', fontWeight: 'bold' }}>🎯 Resto da Dare</label>
              <div className="w-full p-1 sm:p-2 md:p-3 text-center rounded-lg sm:rounded-xl bg-[#FFF8DC]" style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)', fontWeight: 'bold' }}>
                {result !== null ? (
                  <>€{changeNeeded > 0 ? changeNeeded.toFixed(2) : '0.00'}</>
                ) : (
                  <span className="text-gray-400 font-[Bowlby_One_SC]">???</span>
                )}
              </div>
            </div>
          </div>

          {changeNeeded > 0 && (
            <>
              <div className="bg-white/90 p-2 sm:p-4 md:p-6 rounded-lg sm:rounded-xl md:rounded-2xl  mb-2 sm:mb-4 md:mb-6 bg-[#ffffffe6]">
                <h2 className="text-center mb-2 sm:mb-3 md:mb-4 text-sm sm:text-base md:text-lg font-[Bowlby_One_SC]" style={{ color: '#8B4513', fontWeight: 'bold' }}>Seleziona Monete e Banconote</h2>

                <div className="mb-2 sm:mb-4 md:mb-6">
                  <h3 className="mb-1 sm:mb-2 md:mb-3 text-xs sm:text-sm md:text-base font-[Bowlby_One_SC]" style={{ color: '#CD7F32', fontWeight: 'bold' }}>💰 Monete</h3>
                  <div className="flex flex-wrap gap-1 sm:gap-2 md:gap-4 justify-center">
                    {currencies.filter(c => c.type === 'coin').map((currency) => {
                      const size = currency.value < 0.10 ? 35 : currency.value < 1 ? 40 : 45;
                      return (
                        <button
                          key={currency.label}
                          onClick={() => addCurrency(currency.value)}
                          className="transition-transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-[#FFD700] rounded-full"
                          style={{ filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))' }}
                        >
                          <Coin currency={currency} size={size} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="mb-1 sm:mb-2 md:mb-3 text-xs sm:text-sm md:text-base font-[Bowlby_One_SC]" style={{ color: '#DC143C', fontWeight: 'bold' }}>💶 Banconote</h3>
                  <div className="flex flex-wrap gap-1 sm:gap-2 md:gap-4 justify-center">
                    {currencies.filter(c => c.type === 'note').map((currency) => {
                      const width = 60 + currency.value * 1.5;
                      return (
                        <button
                          key={currency.label}
                          onClick={() => addCurrency(currency.value)}
                          className="transition-transform hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 sm:focus:ring-4 focus:ring-[#FFD700] rounded-lg"
                          style={{ filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.3))' }}
                        >
                          <Note currency={currency} width={width} height={35} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-white/90 p-2 sm:p-4 md:p-6 rounded-lg sm:rounded-xl md:rounded-2xl  mb-2 sm:mb-4 md:mb-6 min-h-[60px] sm:min-h-[80px] md:min-h-[100px]">
                <div className="flex items-center justify-between mb-2 sm:mb-3 gap-2">
                  <h3 className="text-xs sm:text-sm md:text-base font-[Bowlby_One_SC]" style={{ color: '#4169E1', fontWeight: 'bold' }}>
                    Hai Selezionato: €{selectedTotal.toFixed(2)}
                  </h3>
                  {selectedCurrency.length > 0 && (
                    <button
                      onClick={resetGame}
                      className="px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 bg-[#DC143C] text-white rounded-lg border-2 border-[#8B0000] hover:bg-[#B22222] active:translate-y-1 text-xs sm:text-sm md:text-base"
                      style={{ fontWeight: 'bold' }}
                    >
                      🗑️ Svuota
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 sm:gap-2">
                  {selectedCurrency.map((item) => {
                    const currency = currencies.find(c => c.value === item.value);
                    if (!currency) return null;
                    return (
                      <button
                        key={currency.label}
                        onClick={() => removeCurrency(item.value)}
                        className="flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 bg-white border-2 sm:border-3 border-[#FFD700] rounded-full hover:bg-red-50 active:scale-95 text-xs sm:text-sm md:text-base"
                        style={{ fontWeight: 'bold' }}
                      >
                        <span>{currency.label}</span>
                        <span className="text-gray-600">× {item.count}</span>
                        <span className="text-red-500">✕</span>
                      </button>
                    );
                  })}
                  {selectedCurrency.length === 0 && (
                    <p className="text-gray-500 italic text-xs sm:text-sm font-[Bowlby_One_SC]">Clicca su monete e banconote per aggiungerle...</p>
                  )}
                </div>
              </div>

              <button
                onClick={verifyAnswer}
                disabled={selectedCurrency.length === 0}
                className="w-full py-3 sm:py-4 md:py-6 bg-gradient-to-r from-[#32CD32] to-[#228B22] text-white rounded-lg sm:rounded-xl md:rounded-2xl  hover:from-[#3CB371] hover:to-[#2E8B57] active:translate-y-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg font-[Bowlby_One_SC]"
                style={{ fontSize: 'clamp(1.2rem, 4vw, 1.8rem)', fontWeight: 'bold', textShadow: '2px 2px 0 rgba(0,0,0,0.3)' }}
              > VERIFICA RESTO</button>

              {result === 'correct' && (
                <div className="mt-2 sm:mt-4 md:mt-6 p-3 sm:p-5 md:p-8 bg-gradient-to-r from-[#32CD32] to-[#00FF00] text-white rounded-lg sm:rounded-xl md:rounded-2xl border-2 sm:border-3 md:border-4 border-[#228B22] text-center animate-pulse">
                  <div style={{ fontSize: 'clamp(2rem, 6vw, 3rem)' }}>🎉</div>
                  <p style={{ fontSize: 'clamp(1.2rem, 4vw, 2rem)', fontWeight: 'bold', textShadow: '2px 2px 0 rgba(0,0,0,0.2)' }}>
                    PERFETTO! Resto Corretto! 🎊
                  </p>
                </div>
              )}

              {result === 'incorrect' && (
                <div className="mt-2 sm:mt-4 md:mt-6 p-3 sm:p-5 md:p-8 bg-gradient-to-r from-[#DC143C] to-[#FF6347] text-white rounded-lg sm:rounded-xl md:rounded-2xl border-2 sm:border-3 md:border-4 border-[#8B0000]">
                  <div className="text-center mb-2 sm:mb-3 md:mb-4">
                    <div style={{ fontSize: 'clamp(2rem, 6vw, 3rem)' }}>😔</div>
                    <p style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)', fontWeight: 'bold', textShadow: '2px 2px 0 rgba(0,0,0,0.2)' }}>
                      Non è corretto! Riprova!
                    </p>
                  </div>
                  <div className="bg-white/20 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl">
                    <p style={{ fontWeight: 'bold' }} className="mb-1 sm:mb-2 text-xs sm:text-sm md:text-base">💡 Suggerimento - Combinazione Ottimale:</p>
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {optimalChange.map((item, index) => {
                        const currency = currencies.find(c => c.value === item.value);
                        return (
                          <span
                            key={index}
                            className="px-2 py-1 sm:px-3 bg-white/90 text-[#8B4513] rounded-full border-2 border-[#FFD700] text-xs sm:text-sm md:text-base"
                            style={{ fontWeight: 'bold' }}
                          >
                            {currency?.label} × {item.count}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {changeNeeded <= 0 && (
            <div className="p-3 sm:p-5 md:p-8 bg-yellow-100 rounded-lg sm:rounded-xl md:rounded-2xl border-2 sm:border-3 md:border-4 border-yellow-400 text-center">
              <p style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)', fontWeight: 'bold', color: '#8B4513' }}>
                ⚠️ Inserisci importi validi con resto da dare!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}