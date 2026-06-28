import React from 'react';
import { Zap, Activity, Gauge, Power } from 'lucide-react';

const ElectricalDetails = ({ grid = {}, power = {} }) => {
  const cards = [
    {
      icon: Power,
      label: 'Potência Ativa',
      value: power.active,
      unit: 'W',
      description: 'Potência real consumida/gerada',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10'
    },
    {
      icon: Activity,
      label: 'Potência Reativa',
      value: power.reactive,
      unit: 'VAR',
      description: 'Potência não utilizada (circula na rede)',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10'
    },
    {
      icon: Zap,
      label: 'Potência Aparente',
      value: power.apparent,
      unit: 'VA',
      description: 'Potência total (V × A)',
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10'
    },
    {
      icon: Gauge,
      label: 'Fator de Potência',
      value: grid.power_factor,
      unit: '',
      description: 'Eficiência da energia (0-1)',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      format: (v) => v ? v.toFixed(3) : '-'
    }
  ];

  const getPowerFactorQuality = (pf) => {
    if (!pf) return { label: 'Desconhecido', color: 'text-slate-400' };
    if (pf >= 0.95) return { label: 'Excelente', color: 'text-emerald-400' };
    if (pf >= 0.85) return { label: 'Bom', color: 'text-blue-400' };
    if (pf >= 0.70) return { label: 'Regular', color: 'text-yellow-400' };
    return { label: 'Baixo - Requer Atenção', color: 'text-red-400' };
  };

  const pfQuality = getPowerFactorQuality(grid.power_factor);

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Dados Elétricos Detalhados</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Qualidade FP:</span>
          <span className={`text-sm font-semibold ${pfQuality.color}`}>{pfQuality.label}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const displayValue = card.format
            ? card.format(card.value)
            : card.value !== undefined
              ? `${card.value.toFixed(1)}${card.unit ? ` ${card.unit}` : ''}`
              : '-';

          return (
            <div
              key={card.label}
              className={`${card.bgColor} border border-slate-700/50 rounded-xl p-4 transition-all hover:border-slate-600 group relative`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg bg-slate-900/50 ${card.color}`}>
                  <Icon size={20} />
                </div>
                <span className="text-sm font-medium text-slate-300">{card.label}</span>
              </div>

              <div className="text-2xl font-bold text-white">{displayValue}</div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 border border-slate-700 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                {card.description}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Informações adicionais do grid */}
      {(grid.voltage || grid.current || grid.frequency) && (
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Dados da Rede Elétrica</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            {grid.voltage && (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                <span className="text-xs text-slate-400 block">Tensão</span>
                <span className="text-lg font-bold text-white">{grid.voltage.toFixed(1)}V</span>
              </div>
            )}
            {grid.current && (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                <span className="text-xs text-slate-400 block">Corrente</span>
                <span className="text-lg font-bold text-white">{grid.current.toFixed(1)}A</span>
              </div>
            )}
            {grid.frequency && (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3">
                <span className="text-xs text-slate-400 block">Frequência</span>
                <span className="text-lg font-bold text-white">{grid.frequency.toFixed(2)}Hz</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectricalDetails;