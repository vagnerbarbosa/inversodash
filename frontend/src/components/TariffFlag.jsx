import { Flag } from 'lucide-react';

/**
 * Componente de Bandeira Tarifária Animada
 * Mostra o tipo de bandeira com animação correspondente ao custo
 */
const TariffFlag = ({ bandeira }) => {
  const normalizedFlag = bandeira?.toLowerCase().replace('_', ' ') || 'verde';

  const flagConfig = {
    'verde': {
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/20',
      border: 'border-emerald-500/40',
      shadow: 'shadow-emerald-500/30',
      gradient: 'from-emerald-500 to-emerald-400',
      label: 'Bandeira Verde',
      description: 'Tarifa normal - Condições favoráveis',
      pulseSpeed: 'animate-pulse-slow',
      intensity: 'opacity-60'
    },
    'amarela': {
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/20',
      border: 'border-yellow-500/40',
      shadow: 'shadow-yellow-500/30',
      gradient: 'from-yellow-500 to-amber-400',
      label: 'Bandeira Amarela',
      description: 'Tarifa intermediária - Condições menos favoráveis',
      pulseSpeed: 'animate-pulse',
      intensity: 'opacity-80'
    },
    'vermelha 1': {
      color: 'text-red-400',
      bg: 'bg-red-500/20',
      border: 'border-red-500/40',
      shadow: 'shadow-red-500/30',
      gradient: 'from-red-600 to-red-400',
      label: 'Bandeira Vermelha 1',
      description: 'Tarifa mais cara - Condições desfavoráveis',
      pulseSpeed: 'animate-pulse-fast',
      intensity: 'opacity-100'
    },
    'vermelha 2': {
      color: 'text-red-500',
      bg: 'bg-red-600/30',
      border: 'border-red-500/50',
      shadow: 'shadow-red-500/50',
      gradient: 'from-red-700 to-red-500',
      label: 'Bandeira Vermelha 2',
      description: 'Tarifa mais cara - Condições críticas',
      pulseSpeed: 'animate-pulse-fast',
      intensity: 'opacity-100'
    }
  };

  const config = flagConfig[normalizedFlag] || flagConfig['verde'];

  return (
    <div className="group relative">
      {/* Container principal com animação */}
      <div
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg
          ${config.bg} ${config.border}
          border backdrop-blur-sm
          transition-all duration-300
          hover:scale-105 hover:${config.shadow}
          cursor-help
        `}
      >
        {/* Ícone da bandeira com animação */}
        <div className={`
          relative
          ${config.pulseSpeed}
        `}>
          <Flag
            size={16}
            className={`${config.color} fill-current ${config.intensity}`}
          />

          {/* Glow effect atrás da bandeira */}
          <div
            className={`
              absolute inset-0
              bg-gradient-to-r ${config.gradient}
              rounded-full blur-md
              ${config.pulseSpeed}
              -z-10
            `}
          />
        </div>

        {/* Texto da bandeira */}
        <span className={`text-sm font-medium ${config.color} capitalize whitespace-nowrap`}>
          {config.label}
        </span>

        {/* Indicador de status (bolinha pulsante) */}
        <div className={`
          w-1.5 h-1.5 rounded-full
          bg-gradient-to-r ${config.gradient}
          ${config.pulseSpeed}
          shadow-[0_0_8px_rgba(255,255,255,0.5)]
        `} />
      </div>

      {/* Tooltip ao passar o mouse */}
      <div className="
        absolute right-0 top-full mt-2 w-72
        bg-slate-900/95 border border-slate-700
        rounded-xl p-4 shadow-2xl
        opacity-0 invisible group-hover:opacity-100 group-hover:visible
        transition-all duration-200 z-50
      ">
        <div className="flex items-start gap-3">
          {/* Ícone grande no tooltip */}
          <div className={`
            p-2 rounded-lg ${config.bg}
            ${config.pulseSpeed}
          `}>
            <Flag size={24} className={`${config.color} fill-current`} />
          </div>

          <div className="flex-1">
            <h4 className={`font-semibold mb-1 ${config.color}`}>
              {config.label}
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {config.description}
            </p>

            {/* Informações adicionais */}
            <div className="mt-3 pt-3 border-t border-slate-700/50">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Nível de custo:</span>
                <span className={config.color}>
                  {normalizedFlag.includes('vermelha') ? 'Alto 🔴' :
                   normalizedFlag === 'amarela' ? 'Médio 🟡' : 'Normal 🟢'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Seta do tooltip */}
        <div className="
          absolute -top-1.5 right-6
          w-3 h-3
          bg-slate-900 border-l border-t border-slate-700
          rotate-45
        " />
      </div>

      {/* CSS personalizado para animações */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.05); }
        }
        @keyframes pulse-fast {
          0%, 100% { opacity: 1; transform: scale(1); }
          25% { opacity: 0.7; transform: scale(1.1); }
          50% { opacity: 1; transform: scale(1); }
          75% { opacity: 0.8; transform: scale(1.05); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
        .animate-pulse-fast {
          animation: pulse-fast 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default TariffFlag;
