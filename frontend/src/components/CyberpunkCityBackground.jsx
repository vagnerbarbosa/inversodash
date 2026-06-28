import { useEffect, useRef } from 'react';

/**
 * Componente de fundo Cyberpunk com cidade animada e ciclo dia/noite
 * Sincronizado com o horário real e dados do inversor
 */
const CyberpunkCityBackground = ({ currentData = {} }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;

    // Configurar tamanho do canvas
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    resize();
    window.addEventListener('resize', resize);

    // Configurações da cidade
    const buildings = generateBuildings(width);

    // Loop de animação
    const animate = () => {
      const now = new Date();
      const hours = now.getHours() + now.getMinutes() / 60;

      // Calcular ciclo dia/noite (0-24h)
      const timeOfDay = hours;

      // Limpar canvas
      ctx.clearRect(0, 0, width, height);

      // Desenhar céu
      drawSky(ctx, width, height, timeOfDay);

      // Desenhar sol/lua
      drawCelestialBodies(ctx, width, height, timeOfDay);

      // Desenhar cidade
      drawCity(ctx, width, height, buildings, timeOfDay);

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Gerar prédios aleatórios
  function generateBuildings(width) {
    const buildings = [];
    let x = 0;

    while (x < width) {
      const buildingWidth = 40 + Math.random() * 80;
      const buildingHeight = 100 + Math.random() * 300;
      const numWindows = Math.floor(Math.random() * 20) + 5;

      buildings.push({
        x,
        width: buildingWidth,
        height: buildingHeight,
        windows: generateWindows(buildingWidth, buildingHeight, numWindows),
        color: `hsl(${220 + Math.random() * 40}, 30%, ${10 + Math.random() * 15}%)`,
        neonColor: `hsl(${180 + Math.random() * 60}, 100%, 60%)`
      });

      x += buildingWidth + Math.random() * 10;
    }

    return buildings;
  }

  // Gerar janelas para um prédio
  function generateWindows(width, height, count) {
    const windows = [];
    const cols = Math.floor(width / 15);
    const rows = Math.floor(height / 25);

    for (let i = 0; i < count; i++) {
      windows.push({
        col: Math.floor(Math.random() * cols),
        row: Math.floor(Math.random() * rows),
        lit: Math.random() > 0.3,
        color: Math.random() > 0.7 ? '#00ffff' : '#ff00ff' // Ciano ou magenta
      });
    }

    return windows;
  }

  // Desenhar céu com gradiente baseado na hora
  function drawSky(ctx, width, height, timeOfDay) {
    let gradient;

    // Madrugada (0-5h)
    if (timeOfDay >= 0 && timeOfDay < 5) {
      gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#0a0a1a'); // Escuro profundo
      gradient.addColorStop(1, '#1a1a3e');
    }
    // Amanhecer (5-7h)
    else if (timeOfDay >= 5 && timeOfDay < 7) {
      const progress = (timeOfDay - 5) / 2;
      gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, interpolateColor('#0a0a1a', '#4a3b6b', progress));
      gradient.addColorStop(0.5, interpolateColor('#1a1a3e', '#ff6b6b', progress * 0.5));
      gradient.addColorStop(1, interpolateColor('#2a2a4e', '#ffd93d', progress));
    }
    // Dia (7-17h)
    else if (timeOfDay >= 7 && timeOfDay < 17) {
      gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#1e3c72'); // Azul dia
      gradient.addColorStop(0.5, '#2a5298');
      gradient.addColorStop(1, '#87ceeb'); // Azul claro
    }
    // Entardecer (17-19h)
    else if (timeOfDay >= 17 && timeOfDay < 19) {
      const progress = (timeOfDay - 17) / 2;
      gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, interpolateColor('#1e3c72', '#2d1b4e', progress));
      gradient.addColorStop(0.5, interpolateColor('#2a5298', '#ff6b6b', progress * 0.8));
      gradient.addColorStop(1, interpolateColor('#87ceeb', '#ffd93d', progress));
    }
    // Noite (19-24h)
    else {
      gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#0f0c29'); // Roxo escuro
      gradient.addColorStop(0.5, '#302b63');
      gradient.addColorStop(1, '#24243e');
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Adicionar estrelas durante a noite
    if (timeOfDay >= 19 || timeOfDay < 5) {
      drawStars(ctx, width, height, timeOfDay);
    }
  }

  // Desenhar estrelas
  function drawStars(ctx, width, height, timeOfDay) {
    ctx.save();
    ctx.fillStyle = '#ffffff';

    // Estrelas fixas (geradas deterministicamente)
    for (let i = 0; i < 100; i++) {
      const x = (i * 137.5) % width;
      const y = (i * 89.7) % (height * 0.6);
      const size = (i % 3) + 1;
      const opacity = 0.3 + (i % 7) / 10;

      ctx.globalAlpha = opacity;
      ctx.beginPath();
      ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // Desenhar sol e lua
  function drawCelestialBodies(ctx, width, height, timeOfDay) {
    const centerX = width / 2;
    const centerY = height;
    const radius = Math.min(width, height) * 0.4;

    // Sol (6h às 18h)
    if (timeOfDay >= 5 && timeOfDay <= 19) {
      const sunProgress = (timeOfDay - 5) / 14; // 0 a 1
      const angle = Math.PI + sunProgress * Math.PI; // π a 2π

      const sunX = centerX + Math.cos(angle) * radius;
      const sunY = centerY + Math.sin(angle) * radius * 0.8;

      // Brilho do sol
      const sunGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 60);
      sunGradient.addColorStop(0, '#ffff00');
      sunGradient.addColorStop(0.3, '#ffdd00');
      sunGradient.addColorStop(0.6, '#ff8800');
      sunGradient.addColorStop(1, 'transparent');

      ctx.fillStyle = sunGradient;
      ctx.beginPath();
      ctx.arc(sunX, sunY, 60, 0, Math.PI * 2);
      ctx.fill();

      // Sol principal
      ctx.fillStyle = '#ffff00';
      ctx.beginPath();
      ctx.arc(sunX, sunY, 20, 0, Math.PI * 2);
      ctx.fill();
    }

    // Lua (18h às 6h)
    if (timeOfDay >= 18 || timeOfDay <= 6) {
      let moonProgress;
      if (timeOfDay >= 18) {
        moonProgress = (timeOfDay - 18) / 12;
      } else {
        moonProgress = (timeOfDay + 6) / 12;
      }

      const angle = Math.PI + moonProgress * Math.PI;
      const moonX = centerX + Math.cos(angle) * radius;
      const moonY = centerY + Math.sin(angle) * radius * 0.8;

      // Brilho da lua
      const moonGradient = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 40);
      moonGradient.addColorStop(0, '#ffffff');
      moonGradient.addColorStop(0.3, '#dddddd');
      moonGradient.addColorStop(0.6, '#888888');
      moonGradient.addColorStop(1, 'transparent');

      ctx.fillStyle = moonGradient;
      ctx.beginPath();
      ctx.arc(moonX, moonY, 40, 0, Math.PI * 2);
      ctx.fill();

      // Lua principal
      ctx.fillStyle = '#f0f0f0';
      ctx.beginPath();
      ctx.arc(moonX, moonY, 15, 0, Math.PI * 2);
      ctx.fill();

      // Crateras
      ctx.fillStyle = '#d0d0d0';
      ctx.beginPath();
      ctx.arc(moonX - 5, moonY - 3, 4, 0, Math.PI * 2);
      ctx.arc(moonX + 6, moonY + 2, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Desenhar cidade
  function drawCity(ctx, width, height, buildings, timeOfDay) {
    const isNight = timeOfDay >= 19 || timeOfDay < 6;
    const groundY = height;

    // Ordenar prédios por altura (desenhar de trás para frente)
    const sortedBuildings = [...buildings].sort((a, b) => b.height - a.height);

    sortedBuildings.forEach((building, index) => {
      const x = building.x;
      const buildingHeight = building.height;
      const y = groundY - buildingHeight;

      // Silhueta do prédio
      ctx.fillStyle = building.color;
      ctx.fillRect(x, y, building.width, buildingHeight);

      // Topo do prédio (antena ou estrutura)
      ctx.fillStyle = building.color;
      ctx.fillRect(x + building.width * 0.4, y - 10, building.width * 0.2, 10);

      // Neon no topo (só à noite)
      if (isNight) {
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = building.neonColor;
        ctx.fillStyle = building.neonColor;
        ctx.fillRect(x + building.width * 0.4, y - 5, building.width * 0.2, 3);
        ctx.restore();
      }

      // Janelas
      building.windows.forEach(window => {
        const wx = x + 5 + window.col * 12;
        const wy = y + 20 + window.row * 20;

        if (isNight && window.lit) {
          // Janela acesa à noite
          ctx.save();
          ctx.shadowBlur = 5;
          ctx.shadowColor = window.color;
          ctx.fillStyle = window.color;
          ctx.fillRect(wx, wy, 6, 10);
          ctx.restore();
        } else if (!isNight) {
          // Janela refletindo luz do dia
          ctx.fillStyle = 'rgba(135, 206, 235, 0.3)';
          ctx.fillRect(wx, wy, 6, 10);
        }
      });

      // Antenas piscando
      if (isNight && index % 3 === 0) {
        const blink = Math.sin(Date.now() / 500) > 0;
        if (blink) {
          ctx.fillStyle = '#ff0000';
          ctx.beginPath();
          ctx.arc(x + building.width * 0.5, y - 15, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });

    // Linha do horizonte (brilho neon na noite)
    if (isNight) {
      const horizonGradient = ctx.createLinearGradient(0, height - 2, width, height - 2);
      horizonGradient.addColorStop(0, 'transparent');
      horizonGradient.addColorStop(0.5, '#00ffff');
      horizonGradient.addColorStop(1, 'transparent');

      ctx.fillStyle = horizonGradient;
      ctx.fillRect(0, height - 2, width, 2);
    }
  }

  // Interpolar entre duas cores
  function interpolateColor(color1, color2, factor) {
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);

    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);

    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none'
      }}
    />
  );
};

export default CyberpunkCityBackground;