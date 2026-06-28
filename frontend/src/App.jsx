import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts'
import {
  Sun, Zap, Activity, Thermometer, TrendingUp, AlertCircle,
  Wifi, WifiOff, Clock, Battery, Home, Power, RefreshCw,
  Settings, Menu, ChevronDown, ChevronUp, Gauge
} from 'lucide-react'

// Importar novos componentes
import PVStringsSection from './components/PVStringsSection'
import ElectricalDetails from './components/ElectricalDetails'
import CyberpunkCityBackground from './components/CyberpunkCityBackground'

// Hook personalizado para WebSocket
function useWebSocket(url) {
  const [data, setData] = useState(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const ws = new WebSocket(url)

    ws.onopen = () => {
      setConnected(true)
      setError(null)
      console.log('WebSocket conectado')
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data)
        if (msg.type === 'data_update') {
          setData(msg.data)
        }
      } catch (e) {
        console.error('Erro ao parse mensagem:', e)
      }
    }

    ws.onerror = (err) => {
      setError(err)
      setConnected(false)
    }

    ws.onclose = () => {
      setConnected(false)
    }

    // Heartbeat
    const interval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ action: 'ping' }))
      }
    }, 30000)

    return () => {
      clearInterval(interval)
      ws.close()
    }
  }, [url])

  return { data, connected, error }
}

// Hook para buscar estatísticas de energia
function useEnergyStats(period = 'day') {
  const [stats, setStats] = useState({
    current: 0,
    previous: 0,
    change_percent: 0,
    peak_day: null
  })
  const [loading, setLoading] = useState(false)

  const fetchStats = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/stats/energy?period=${period}`)
      const result = await response.json()
      if (!result.error) {
        setStats(result)
      }
    } catch (e) {
      console.error('Erro ao buscar estatísticas:', e)
    }
    setLoading(false)
  }, [period])

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 300000) // Atualiza a cada 5 minutos
    return () => clearInterval(interval)
  }, [fetchStats])

  return { stats, loading, refresh: fetchStats }
}

// Hook para buscar histórico
function useHistory(minutes = 60) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/history?minutes=${minutes}`)
      const result = await response.json()
      if (result.data) {
        setHistory(result.data)
      }
    } catch (e) {
      console.error('Erro ao buscar histórico:', e)
    }
    setLoading(false)
  }, [minutes])

  useEffect(() => {
    fetchHistory()
    const interval = setInterval(fetchHistory, 60000)
    return () => clearInterval(interval)
  }, [fetchHistory])

  return { history, loading, refresh: fetchHistory }
}

// Hook para dados de economia
function useEconomy() {
  const [economy, setEconomy] = useState({
    tarifa_atual: 0.77,
    bandeira: 'verde',
    daily: { energy_kwh: 0, value_brl: 0 },
    monthly: { energy_kwh: 0, value_brl: 0 },
    yearly: { energy_kwh: 0, value_brl: 0 },
    total: { energy_kwh: 0, value_brl: 0 },
    payback: { percent: 0, years: 0, remaining_brl: 0 },
    projection_25y: 0
  })
  const [loading, setLoading] = useState(false)

  const fetchEconomy = async () => {
    try {
      const response = await fetch('/api/economy')
      const data = await response.json()
      if (!data.error) {
        setEconomy(data)
      }
    } catch (error) {
      console.error('Erro ao buscar economia:', error)
    }
  }

  useEffect(() => {
    fetchEconomy()
    const interval = setInterval(fetchEconomy, 60000) // Atualiza a cada minuto
    return () => clearInterval(interval)
  }, [])

  return { economy, loading, refresh: fetchEconomy }
}

// Componente de Card de Economia
function EconomyCard({ title, value, subtitle, icon: Icon, color, delay = 0 }) {
  const colorClasses = {
    money: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
    savings: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
    payback: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
    projection: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
    default: 'from-slate-700/50 to-slate-800/50 border-slate-600/30'
  }

  const iconColors = {
    money: 'text-emerald-400',
    savings: 'text-yellow-400',
    payback: 'text-blue-400',
    projection: 'text-purple-400',
    default: 'text-slate-400'
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  return (
    <div
      className={`card bg-gradient-to-br ${colorClasses[color] || colorClasses.default} animate-fade-in-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="stat-label mb-1 text-slate-400">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="stat-value text-white">{formatCurrency(value)}</span>
          </div>
          {subtitle && (
            <div className="mt-2 text-sm text-slate-500">
              {subtitle}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-slate-800/50 ${iconColors[color] || iconColors.default}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  )
}

// Componente de Seção de Economia
function EconomySection() {
  const { economy, refresh } = useEconomy()

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <TrendingUp className="text-emerald-400" size={20} />
          <h2 className="text-lg font-semibold text-white">Economia Gerada</h2>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span>Tarifa: R$ {economy.tarifa_atual.toFixed(2)}/kWh</span>
          <span className="px-2 py-1 rounded bg-slate-800/50 border border-slate-700/50 capitalize">
            Bandeira {economy.bandeira.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <EconomyCard
          title="Economia Hoje"
          value={economy.daily.value_brl}
          subtitle={`${economy.daily.energy_kwh.toFixed(1)} kWh gerados`}
          icon={Zap}
          color="money"
          delay={0}
        />
        <EconomyCard
          title="Economia Mensal"
          value={economy.monthly.value_brl}
          subtitle={`${economy.monthly.energy_kwh.toFixed(1)} kWh gerados`}
          icon={TrendingUp}
          color="savings"
          delay={100}
        />
        <EconomyCard
          title="Economia Total"
          value={economy.total.value_brl}
          subtitle={`${economy.total.energy_kwh.toFixed(1)} kWh acumulados`}
          icon={Battery}
          color="payback"
          delay={200}
        />
        <EconomyCard
          title="Projeção 25 Anos"
          value={economy.projection_25y}
          subtitle={`Payback: ${economy.payback.percent}% (${economy.payback.years} anos restantes)`}
          icon={Gauge}
          color="projection"
          delay={300}
        />
      </div>

      {/* Barra de progresso do payback */}
      <div className="card bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-400">Progresso do Payback</span>
          <span className="text-sm font-medium text-emerald-400">{economy.payback.percent.toFixed(1)}%</span>
        </div>
        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000"
            style={{ width: `${Math.min(economy.payback.percent, 100)}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-slate-500">
          {economy.payback.remaining_brl > 0 ? (
            <span>Faltam {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(economy.payback.remaining_brl)} para o payback completo</span>
          ) : (
            <span className="text-emerald-400">🎉 Payback atingido! Seu sistema já se pagou.</span>
          )}
        </div>
      </div>
    </div>
  )
}

// Componente Card de Estatística
function StatCard({ title, value, unit, icon: Icon, color, trend, trendValue, delay = 0 }) {
  const colorClasses = {
    solar: 'from-solar-500/20 to-solar-600/10 border-solar-500/30',
    grid: 'from-grid-500/20 to-grid-600/10 border-grid-500/30',
    power: 'from-violet-500/20 to-violet-600/10 border-violet-500/30',
    temp: 'from-orange-500/20 to-orange-600/10 border-orange-500/30',
    battery: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30',
    default: 'from-slate-700/50 to-slate-800/50 border-slate-600/30'
  }

  const iconColors = {
    solar: 'text-solar-400',
    grid: 'text-grid-400',
    power: 'text-violet-400',
    temp: 'text-orange-400',
    battery: 'text-emerald-400',
    default: 'text-slate-400'
  }

  return (
    <div
      className={`card bg-gradient-to-br ${colorClasses[color] || colorClasses.default} animate-fade-in-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="stat-label mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="stat-value text-white">{value}</span>
            <span className="text-slate-400 text-sm">{unit}</span>
          </div>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend === 'up' ? <TrendingUp size={14} /> : <TrendingUp size={14} className="rotate-180" />}
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-slate-800/50 ${iconColors[color] || iconColors.default}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  )
}

// Componente de Card de Estatísticas de Energia
function EnergyStatsCard({ period, label, stats, delay = 0 }) {
  const { current, previous, change_percent, peak_day } = stats

  const getTrendIcon = () => {
    if (change_percent > 0) return '↑'
    if (change_percent < 0) return '↓'
    return '→'
  }

  const getTrendColor = () => {
    if (change_percent > 0) return 'text-emerald-400'
    if (change_percent < 0) return 'text-red-400'
    return 'text-slate-400'
  }

  const formatPeriodLabel = () => {
    const labels = {
      day: 'Hoje',
      week: 'Esta Semana',
      month: 'Este Mês',
      year: 'Este Ano'
    }
    return labels[period] || label
  }

  return (
    <div
      className="card bg-gradient-to-br from-slate-700/50 to-slate-800/50 border-slate-600/30 animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="stat-label mb-1 text-slate-400">{formatPeriodLabel()}</p>
          <div className="flex items-baseline gap-2">
            <span className="stat-value text-white">{current.toFixed(1)}</span>
            <span className="text-slate-400 text-sm">kWh</span>
          </div>

          {/* Comparação com período anterior */}
          <div className={`flex items-center gap-1 mt-2 text-sm ${getTrendColor()}`}>
            <span className="font-medium">{getTrendIcon()} {Math.abs(change_percent).toFixed(1)}%</span>
            <span className="text-slate-500 text-xs ml-1">vs anterior</span>
          </div>

          {/* Valor anterior */}
          <div className="mt-1 text-xs text-slate-500">
            Anterior: {previous.toFixed(1)} kWh
          </div>

          {/* Dia de pico */}
          {peak_day && peak_day.energy > 0 && (
            <div className="mt-2 pt-2 border-t border-slate-700/50">
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <span className="text-yellow-400">★</span>
                <span>Pico: {peak_day.energy.toFixed(1)} kWh</span>
              </div>
              <div className="text-xs text-slate-600">
                {new Date(peak_day.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
              </div>
            </div>
          )}
        </div>

        <div className="p-3 rounded-xl bg-slate-800/50 text-emerald-400">
          <Battery size={24} />
        </div>
      </div>
    </div>
  )
}

// Componente de Gráfico de Potência em Tempo Real
function PowerChart({ data, history }) {
  const chartData = useMemo(() => {
    if (!history.length) return []
    return history.map((item, index) => ({
      time: new Date(item.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      pv: item.pv?.total_power || 0,
      output: Math.abs(item.power?.output || 0),
      index
    })).slice(-30) // Últimos 30 pontos
  }, [history])

  return (
    <div className="card-highlight lg:col-span-2">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Activity className="text-solar-400" size={24} />
          <h3 className="text-lg font-semibold text-white">Potência em Tempo Real</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-solar-500" />
            <span className="text-sm text-slate-400">PV</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-violet-500" />
            <span className="text-sm text-slate-400">Saída</span>
          </div>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#facc15" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorOutput" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="time" stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} />
            <YAxis stroke="#64748b" tick={{ fill: '#64748b', fontSize: 12 }} unit=" W" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                border: '1px solid rgba(71, 85, 105, 0.5)',
                borderRadius: '12px',
                padding: '12px'
              }}
            />
            <Area
              type="monotone"
              dataKey="pv"
              stroke="#facc15"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPv)"
            />
            <Area
              type="monotone"
              dataKey="output"
              stroke="#8b5cf6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorOutput)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// Componente de Tooltip para Modo de Operação
function WorkModeTooltip({ workMode }) {
  // Descrições detalhadas dos modos de operação (baseado nos manuais oficiais da Goodwe)
  // Fontes: GW_SDT-G3_User-Manual, GW_EH_User_Manual, GW_XS_User_Manual
  const modeDescriptions = {
    'Espera': {
      title: 'Modo Espera (Waiting)',
      description: 'Estado inicial após o inversor ser energizado. Aguarda condições adequadas (tensão dos painéis, condições da rede) para iniciar. Quando as condições são atendidas, entra no modo de auto-verificação. Se detectar falha, entra em modo de falha.',
      color: 'text-yellow-400'
    },
    'Normal': {
      title: 'Modo Normal (On-Grid)',
      description: 'Operação padrão conectada à rede. O inversor converte energia DC dos painéis em AC e injeta na rede elétrica com eficiência máxima via MPPT (140V-1000V). Se detectar falha, entra em modo de falha.',
      color: 'text-emerald-400'
    },
    'Falha': {
      title: 'Modo Falha (Fault)',
      description: 'Estado de proteção ativado quando o inversor detecta anomalias: tensão/frequência da rede fora do padrão, falta de isolamento, superaquecimento, falha de hardware, etc. Após limpar a falha, retorna ao modo Espera.',
      color: 'text-red-400'
    },
    'Desligado': {
      title: 'Modo Desligado (Off)',
      description: 'O inversor está desligado manualmente via app SolarGo ou por comando externo. Não está gerando energia. Pode ser religado remotamente ou manualmente.',
      color: 'text-slate-400'
    },
    'Verificação': {
      title: 'Modo Verificação (Self-Check)',
      description: 'Executa diagnósticos e inicialização antes de iniciar a operação. Verifica tensão, frequência, hardware interno e condições de segurança. Se aprovado, entra no modo Normal. Se falhar, entra em modo de Falha.',
      color: 'text-blue-400'
    },
    'Atualizando': {
      title: 'Modo Atualizando (Upgrade)',
      description: 'O inversor está recebendo atualização de firmware via app SolarGo. NÃO interrompa o processo (pode danificar o equipamento). Ao completar, retorna ao modo Espera antes de reiniciar.',
      color: 'text-purple-400'
    },
    'EPS': {
      title: 'Modo EPS - Emergency Power Supply',
      description: 'Modo off-grid/emergência ativado quando há queda de energia da rede. O inversor alimenta cargas críticas de backup independentemente (requer bateria e configuração EPS ativada). Retorna ao modo Normal quando a rede volta.',
      color: 'text-orange-400'
    },
    'DRM': {
      title: 'Modo DRM - Demand Response Mode',
      description: 'Resposta à Demanda da rede elétrica (uso principal em Austrália/Nova Zelândia). O inversor ajusta a potência conforme sinais recebidos via porta DRED: DRM0 (desligar), DRM5 (sem exportação), DRM6 (limite 50%), DRM7 (limite 75%), DRM8 (normal).',
      color: 'text-cyan-400'
    },
    'Auto-Teste': {
      title: 'Modo Auto-Teste (Self-Test)',
      description: 'O inversor executa testes automáticos de rotina para verificar o funcionamento correto de todos os componentes internos e sistemas de proteção. Pode ser iniciado manualmente ou automaticamente.',
      color: 'text-indigo-400'
    }
  }

  // Normalizar o nome do modo (traduções fallback caso venha do backend em inglês)
  const normalizeMode = (mode) => {
    const translations = {
      'Wait Mode': 'Espera',
      'Wait': 'Espera',
      'Waiting': 'Espera',
      'Standby': 'Espera',
      'Stand by': 'Espera',
      'On-grid': 'Normal',
      'On Grid': 'Normal',
      'Normal': 'Normal',
      'Fault': 'Falha',
      'Off': 'Desligado',
      'Off-grid': 'EPS',
      'Off Grid': 'EPS',
      'Check': 'Verificação',
      'Check Mode': 'Verificação',
      'Self-Check': 'Verificação',
      'Self Check': 'Verificação',
      'Updating': 'Atualizando',
      'Update': 'Atualizando',
      'Upgrade': 'Atualizando',
      'EPS': 'EPS',
      'DRM': 'DRM',
      'Self-Test': 'Auto-Teste',
      'Self Test': 'Auto-Teste'
    }
    return translations[mode] || mode
  }

  const normalizedMode = normalizeMode(workMode)
  const modeInfo = modeDescriptions[normalizedMode] || {
    title: workMode,
    description: 'Modo de operação não reconhecido. Consulte o manual do inversor para mais informações.',
    color: 'text-slate-400'
  }

  return (
    <div className="group relative"
    >
      <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 cursor-help">
        <div className="flex items-center gap-3">
          <Activity className="text-slate-400" size={20} />
          <span className="text-slate-300">Modo de Operação</span>
          <span className="text-slate-500 text-xs" title="Passe o mouse para ver detalhes">ⓘ</span>
        </div>

        <span className={`text-sm font-medium ${modeInfo.color}`}>
          {workMode}
        </span>
      </div>

      {/* Tooltip CSS puro - aparece no hover */}
      <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-2xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <div className="flex items-start gap-3">
          <Activity className={`${modeInfo.color} flex-shrink-0 mt-0.5`} size={18} />
          <div>
            <h4 className={`font-semibold mb-1 ${modeInfo.color}`}>{modeInfo.title}</h4>
            <p className="text-sm text-slate-300 leading-relaxed">{modeInfo.description}</p>
          </div>
        </div>

        {/* Seta do tooltip */}
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-l border-t border-slate-700 rotate-45"></div>
      </div>
    </div>
  )
}

// Componente de Informações do Sistema
function SystemInfo({ data }) {
  const workMode = data?.status?.work_mode || 'Desconhecido'
  const errorCode = data?.status?.error_code || 0
  const isOnline = data?.connected
  const timestamp = data?.timestamp ? new Date(data.timestamp).toLocaleString('pt-BR') : '-'

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="text-slate-400" size={24} />
        <h3 className="text-lg font-semibold text-white">Informações do Sistema</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50">
          <div className="flex items-center gap-3">
            {isOnline ? (
              <Wifi className="text-emerald-400" size={20} />
            ) : (
              <WifiOff className="text-red-400" size={20} />
            )}
            <span className="text-slate-300">Status da Conexão</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`status-dot ${isOnline ? 'status-dot-online' : 'status-dot-offline'}`} />
            <span className={`text-sm font-medium ${isOnline ? 'text-emerald-400' : 'text-red-400'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        <WorkModeTooltip workMode={workMode} />

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50">
          <div className="flex items-center gap-3">
            <AlertCircle className={`${errorCode === 0 ? 'text-emerald-400' : 'text-red-400'}`} size={20} />
            <span className="text-slate-300">Código de Erro</span>
          </div>
          <span className={`text-sm font-medium ${errorCode === 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {errorCode === 0 ? 'Sem erros' : errorCode}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50">
          <div className="flex items-center gap-3">
            <Clock className="text-slate-400" size={20} />
            <span className="text-slate-300">Última Atualização</span>
          </div>
          <span className="text-sm text-slate-400">
            {timestamp}
          </span>
        </div>
      </div>
    </div>
  )
}

// Componente de Temperaturas
function TemperaturePanel({ data }) {
  const inverterTemp = data?.temperature?.inverter || 0
  const heatsinkTemp = data?.temperature?.heatsink || 0

  const getTempColor = (temp) => {
    if (temp < 40) return 'text-emerald-400'
    if (temp < 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getTempBg = (temp) => {
    if (temp < 40) return 'from-emerald-500/20 to-emerald-600/10'
    if (temp < 60) return 'from-yellow-500/20 to-yellow-600/10'
    return 'from-red-500/20 to-red-600/10'
  }

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-6">
        <Thermometer className="text-orange-400" size={24} />
        <h3 className="text-lg font-semibold text-white">Temperaturas</h3>
      </div>

      <div className="space-y-4">
        <div className={`p-4 rounded-xl bg-gradient-to-br ${getTempBg(inverterTemp)} border border-slate-700/50`}>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Inversor</span>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${getTempColor(inverterTemp)}`}>
                {inverterTemp.toFixed(1)}°C
              </span>
            </div>
          </div>
          <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                inverterTemp < 40 ? 'bg-emerald-500' : inverterTemp < 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min((inverterTemp / 80) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className={`p-4 rounded-xl bg-gradient-to-br ${getTempBg(heatsinkTemp)} border border-slate-700/50`}>
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Dissipador</span>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${getTempColor(heatsinkTemp)}`}>
                {heatsinkTemp.toFixed(1)}°C
              </span>
            </div>
          </div>
          <div className="mt-3 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                heatsinkTemp < 40 ? 'bg-emerald-500' : heatsinkTemp < 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min((heatsinkTemp / 80) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Componente de Horas de Operação
function OperationHoursPanel({ diagnostics = {} }) {
  const operationHours = diagnostics?.operation_hours || 0

  const formatHours = (hours) => {
    const days = Math.floor(hours / 24)
    const remainingHours = Math.floor(hours % 24)
    if (days > 0) {
      return `${days}d ${remainingHours}h`
    }
    return `${remainingHours}h`
  }

  const expectedLifespan = 25 * 365 * 24
  const lifespanPercentage = Math.min((operationHours / expectedLifespan) * 100, 100)

  return (
    <div className="card">
      <div className="flex items-center gap-3 mb-4">
        <Clock className="text-blue-400" size={24} />
        <h3 className="text-lg font-semibold text-white">Horas de Operação</h3>
      </div>

      <div className="text-3xl font-bold text-white mb-2">
        {operationHours.toLocaleString()}
        <span className="text-sm font-normal text-slate-400 ml-1">h</span>
      </div>

      <div className="text-sm text-slate-400 mb-3">
        ≈ {formatHours(operationHours)}
      </div>

      <div>
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Vida Útil Estimada</span>
          <span>{lifespanPercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${lifespanPercentage}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-1">Baseado em expectativa de 25 anos</p>
      </div>
    </div>
  )
}

// Componente de Seção de Estatísticas de Energia
function EnergyStatsSection() {
  const dayStats = useEnergyStats('day')
  const weekStats = useEnergyStats('week')
  const monthStats = useEnergyStats('month')
  const yearStats = useEnergyStats('year')

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <Battery className="text-emerald-400" size={20} />
        <h2 className="text-lg font-semibold text-white">Geração de Energia Acumulada</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <EnergyStatsCard period="day" stats={dayStats.stats} delay={0} />
        <EnergyStatsCard period="week" stats={weekStats.stats} delay={100} />
        <EnergyStatsCard period="month" stats={monthStats.stats} delay={200} />
        <EnergyStatsCard period="year" stats={yearStats.stats} delay={300} />
      </div>
    </div>
  )
}

// Componente Principal
function App() {
  // WebSocket URL dinâmico baseado no host atual
  const wsUrl = `ws://${window.location.host}/ws`
  const { data: wsData, connected: wsConnected } = useWebSocket(wsUrl)
  const { history, refresh } = useHistory(60)
  const [showSettings, setShowSettings] = useState(false)

  // Dados atuais (prioriza WebSocket)
  const currentData = wsData || {}

  return (
    <div className="min-h-screen relative">
      {/* Fundo Cyberpunk Animado */}
      <CyberpunkCityBackground currentData={currentData} />

      {/* Overlay escuro para garantir legibilidade do conteúdo - ajustável */}
      <div className="fixed inset-0 bg-slate-950/40 z-10 pointer-events-none" />

      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-solar-500 to-solar-600 flex items-center justify-center shadow-lg shadow-solar-500/20">
                <Sun className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">InversoDash</h1>
                <p className="text-xs text-slate-400">Monitoramento Solar</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50">
                <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-sm text-slate-300">
                  {wsConnected ? 'Conectado' : 'Desconectado'}
                </span>
              </div>

              <button
                onClick={refresh}
                className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors border border-slate-700/50"
              >
                <RefreshCw size={20} className="text-slate-400" />
              </button>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-colors border border-slate-700/50"
              >
                <Menu size={20} className="text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Stats Grid - Dados em Tempo Real */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Potência PV"
            value={currentData?.pv?.total_power || 0}
            unit="W"
            icon={Sun}
            color="solar"
            delay={0}
          />
          <StatCard
            title="Tensão Rede"
            value={currentData?.grid?.voltage?.toFixed(1) || 0}
            unit="V"
            icon={Zap}
            color="grid"
            delay={100}
          />
          <StatCard
            title="Potência Saída"
            value={Math.abs(currentData?.power?.output || 0)}
            unit="W"
            icon={Power}
            color="power"
            delay={200}
          />
          <StatCard
            title="Energia Hoje"
            value={currentData?.energy?.daily?.toFixed(1) || 0}
            unit="kWh"
            icon={Battery}
            color="battery"
            delay={300}
          />
        </div>

        {/* Energy Stats Cards - Geração Acumulada */}
        <EnergyStatsSection />

        {/* Economy Stats Section - Economia em Reais */}
        <EconomySection />

        {/* Dados Elétricos Detalhados */}
        <div className="mb-8">
          <ElectricalDetails grid={currentData?.grid} power={currentData?.power} />
        </div>

        {/* Strings PV Individuais */}
        <div className="mb-8">
          <PVStringsSection
            pvStrings={currentData?.pv_strings}
            totalPower={currentData?.pv?.total_power}
          />
        </div>

        {/* Gráfico de Potência */}
        <div className="mb-8">
          <PowerChart data={currentData} history={history} />
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <SystemInfo data={currentData} />
          <TemperaturePanel data={currentData} />
          <OperationHoursPanel diagnostics={currentData?.diagnostics} />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 mt-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              InversoDash © {new Date().getFullYear()} - Dashboard Solar Goodwe
            </p>
            <p className="text-sm text-slate-500">
              Dados atualizados a cada 30s
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
