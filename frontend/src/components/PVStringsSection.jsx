import React from 'react';
import { Info } from 'lucide-react';

const PVStringsSection = ({ pvStrings = [], totalPower = 0 }) => {
  if (!pvStrings || pvStrings.length === 0) {
    return (
      <div className="card">
        <h2 className="text-xl font-bold text-white mb-4">Strings PV Individuais</h2>
        <p className="text-slate-400 text-center py-4">Dados das strings não disponíveis</p>
      </div>
    );
  }

  // Calcular eficiência relativa de cada string
  const maxPower = Math.max(...pvStrings.map(s => s.power || 0));

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-white">Strings PV Individuais</h2>

          {/* Tooltip com explicação sobre Strings PV */}
          <div className="group relative">
            <Info size={16} className="text-slate-400 cursor-help" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-80 bg-slate-800 border border-slate-700 rounded-xl p-4 shadow-2xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <h4 className="font-semibold text-solar-400 mb-2">O que são Strings PV?</h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                <strong>Strings</strong> são grupos de painéis solares conectados em série.
                Cada string é uma fileira independente onde a <strong>tensão se soma</strong>
                (ex: 10 painéis de 40V = 400V) enquanto a <strong>corrente permanece igual</strong>.
              </p>
              <p className="text-sm text-slate-300 leading-relaxed mt-2">
                O monitoramento individual permite detectar problemas como sombra em
                uma fileira específica, painel com defeito ou desbalanceamento entre strings.
              </p>
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
            </div>
          </div>
        </div>
        <span className="text-sm text-slate-400">{pvStrings.length} strings detectadas</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pvStrings.map((string) => {
          const efficiency = maxPower > 0 ? ((string.power || 0) / maxPower) * 100 : 0;
          const statusColor = efficiency > 80 ? 'bg-emerald-500' : efficiency > 50 ? 'bg-yellow-500' : 'bg-red-500';

          return (
            <div key={string.string_id} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:bg-slate-800 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${statusColor}`}></div>
                  <span className="font-semibold text-white">String {string.string_id}</span>
                </div>
                <span className="text-lg font-bold text-solar-400">
                  {(string.power || 0).toFixed(0)}W
                </span>
              </div>

              {/* Barra de eficiência */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Eficiência</span>
                  <span>{efficiency.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div
                    className={`${statusColor} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${efficiency}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-900/50 rounded-lg p-2">
                  <span className="text-slate-400 block text-xs">Tensão</span>
                  <span className="font-medium text-white">{(string.voltage || 0).toFixed(1)}V</span>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-2">
                  <span className="text-slate-400 block text-xs">Corrente</span>
                  <span className="font-medium text-white">{(string.current || 0).toFixed(1)}A</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Resumo */}
      {pvStrings.length > 1 && (
        <div className="mt-4 pt-4 border-t border-slate-700/50">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-300">Potência Total Strings:</span>
            <span className="font-bold text-solar-400">
              {pvStrings.reduce((sum, s) => sum + (s.power || 0), 0).toFixed(0)}W
            </span>
          </div>
          {totalPower > 0 && (
            <div className="flex justify-between items-center text-sm mt-2">
              <span className="text-slate-300">Eficiência do Sistema:</span>
              <span className="font-bold text-solar-400">
                {((pvStrings.reduce((sum, s) => sum + (s.power || 0), 0) / totalPower) * 100).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PVStringsSection;
