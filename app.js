/**
 * IronPulse - Construtor & Rastreador de Treinos e Dieta
 * Estilo Hevy / Strong • Otimizado para Criação Livre pelo Usuário
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'ironpulse_app_state_v2';

  // Obter chave da data de hoje (YYYY-MM-DD)
  function getTodayKey() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // ==================== BIBLIOTECA COMPLETA DE EXERCÍCIOS ====================
  const EXERCISE_CATALOG = [
    // Peito
    { name: 'Supino Reto com Barra', muscle: 'Peito' },
    { name: 'Supino Inclinado com Halteres', muscle: 'Peito' },
    { name: 'Supino Inclinado com Barra', muscle: 'Peito' },
    { name: 'Supino Reto com Halteres', muscle: 'Peito' },
    { name: 'Supino Declinado', muscle: 'Peito' },
    { name: 'Crucifixo Reto com Halteres', muscle: 'Peito' },
    { name: 'Crucifixo Inclinado com Halteres', muscle: 'Peito' },
    { name: 'Crossover na Polia Média', muscle: 'Peito' },
    { name: 'Crossover na Polia Alta', muscle: 'Peito' },
    { name: 'Crossover na Polia Baixa', muscle: 'Peito' },
    { name: 'Voador / Peck Deck', muscle: 'Peito' },
    { name: 'Paralelas (Foco Peitoral)', muscle: 'Peito' },
    { name: 'Flexão de Braço', muscle: 'Peito' },

    // Costas
    { name: 'Puxada Alta Frontal', muscle: 'Costas' },
    { name: 'Puxada com Triângulo', muscle: 'Costas' },
    { name: 'Remada Curvada com Barra', muscle: 'Costas' },
    { name: 'Remada Curvada com Halteres', muscle: 'Costas' },
    { name: 'Remada Baixa no Triângulo', muscle: 'Costas' },
    { name: 'Remada Cavalinho (Barra T)', muscle: 'Costas' },
    { name: 'Remada Articulada Unilateral', muscle: 'Costas' },
    { name: 'Pull-Down na Polia com Corda', muscle: 'Costas' },
    { name: 'Barra Fixa (Pronada ou Supinada)', muscle: 'Costas' },
    { name: 'Levantamento Terra', muscle: 'Costas' },

    // Pernas (Quadríceps, Posterior, Glúteo, Panturrilha)
    { name: 'Agachamento Livre com Barra', muscle: 'Pernas' },
    { name: 'Leg Press 45°', muscle: 'Pernas' },
    { name: 'Cadeira Extensora', muscle: 'Pernas' },
    { name: 'Agachamento Hack', muscle: 'Pernas' },
    { name: 'Agachamento Búlgaro', muscle: 'Pernas' },
    { name: 'Passada / Avanço com Halteres', muscle: 'Pernas' },
    { name: 'Mesa Flexora', muscle: 'Pernas' },
    { name: 'Cadeira Flexora', muscle: 'Pernas' },
    { name: 'Stiff com Halteres', muscle: 'Pernas' },
    { name: 'Stiff com Barra', muscle: 'Pernas' },
    { name: 'Elevação Pélvica com Barra', muscle: 'Pernas' },
    { name: 'Cadeira Abdutora', muscle: 'Pernas' },
    { name: 'Cadeira Adutora', muscle: 'Pernas' },
    { name: 'Panturrilha em Pé na Máquina', muscle: 'Pernas' },
    { name: 'Panturrilha no Leg Press', muscle: 'Pernas' },
    { name: 'Panturrilha Sentado (Gêmeos)', muscle: 'Pernas' },

    // Ombros
    { name: 'Desenvolvimento com Halteres', muscle: 'Ombros' },
    { name: 'Desenvolvimento Militar com Barra', muscle: 'Ombros' },
    { name: 'Desenvolvimento na Máquina', muscle: 'Ombros' },
    { name: 'Elevação Lateral com Halteres', muscle: 'Ombros' },
    { name: 'Elevação Lateral na Polia', muscle: 'Ombros' },
    { name: 'Elevação Frontal', muscle: 'Ombros' },
    { name: 'Crucifixo Inverso com Halteres', muscle: 'Ombros' },
    { name: 'Crucifixo Inverso no Peck Deck', muscle: 'Ombros' },
    { name: 'Face Pull na Polia', muscle: 'Ombros' },
    { name: 'Encolhimento com Halteres (Trapézio)', muscle: 'Ombros' },

    // Bíceps
    { name: 'Rosca Direta com Barra W', muscle: 'Bíceps' },
    { name: 'Rosca Direta com Barra Reta', muscle: 'Bíceps' },
    { name: 'Rosca Alternada com Halteres', muscle: 'Bíceps' },
    { name: 'Rosca Martelo com Halteres', muscle: 'Bíceps' },
    { name: 'Rosca Scott com Barra W', muscle: 'Bíceps' },
    { name: 'Rosca no Banco Inclinado', muscle: 'Bíceps' },
    { name: 'Rosca Concentrada', muscle: 'Bíceps' },
    { name: 'Rosca na Polia Baixa', muscle: 'Bíceps' },

    // Tríceps
    { name: 'Tríceps Corda na Polia', muscle: 'Tríceps' },
    { name: 'Tríceps Barra Reta na Polia', muscle: 'Tríceps' },
    { name: 'Tríceps Testa com Barra W', muscle: 'Tríceps' },
    { name: 'Tríceps Francês com Halter', muscle: 'Tríceps' },
    { name: 'Mergulho em Paralelas', muscle: 'Tríceps' },
    { name: 'Tríceps Coice na Polia ou Halter', muscle: 'Tríceps' },
    { name: 'Supino Fechado com Barra', muscle: 'Tríceps' },

    // Abdômen
    { name: 'Abdominal Supra na Polia (Crunch)', muscle: 'Abdômen' },
    { name: 'Elevação de Pernas na Barra Fixa', muscle: 'Abdômen' },
    { name: 'Abdominal Infra no Banco ou Chão', muscle: 'Abdômen' },
    { name: 'Prancha Isométrica', muscle: 'Abdômen' },
    { name: 'Abdominal na Roda (Ab Wheel)', muscle: 'Abdômen' }
  ];

  // ==================== DADOS BASE INICIAIS ====================
  const DEFAULT_DATA = {
    profile: {
      goal: 'Hipertrofia',
      targetKcal: 2400,
      targetProtein: 160,
      targetCarbs: 260,
      targetFat: 65,
      water: 0
    },
    activeRoutineId: 'routine-1',
    routines: [
      {
        id: 'routine-1',
        name: 'Treino A • Push',
        focus: 'Peito, Ombros e Tríceps',
        exercises: [
          {
            id: 'ex-1',
            name: 'Supino Reto com Barra',
            muscle: 'Peito',
            notes: 'Pausa de 1s embaixo, escápulas aduzidas',
            sets: [
              { weight: 60, reps: 10, completed: false, prev: '55kg × 10' },
              { weight: 70, reps: 8, completed: false, prev: '65kg × 8' },
              { weight: 70, reps: 8, completed: false, prev: '70kg × 7' }
            ],
            history: [
              { date: '2026-10-05', weight: 60 },
              { date: '2026-10-15', weight: 65 },
              { date: '2026-10-26', weight: 70 }
            ]
          },
          {
            id: 'ex-2',
            name: 'Supino Inclinado com Halteres',
            muscle: 'Peito',
            notes: 'Banco a 30 graus, amplitude máxima',
            sets: [
              { weight: 24, reps: 12, completed: false, prev: '22kg × 12' },
              { weight: 26, reps: 10, completed: false, prev: '24kg × 10' },
              { weight: 26, reps: 10, completed: false, prev: '26kg × 9' }
            ],
            history: [
              { date: '2026-10-05', weight: 22 },
              { date: '2026-10-15', weight: 24 },
              { date: '2026-10-26', weight: 26 }
            ]
          },
          {
            id: 'ex-3',
            name: 'Desenvolvimento com Halteres',
            muscle: 'Ombros',
            notes: 'Sem bater os halteres no topo',
            sets: [
              { weight: 20, reps: 10, completed: false, prev: '18kg × 10' },
              { weight: 22, reps: 8, completed: false, prev: '20kg × 8' }
            ],
            history: [
              { date: '2026-10-10', weight: 18 },
              { date: '2026-10-26', weight: 22 }
            ]
          },
          {
            id: 'ex-4',
            name: 'Tríceps Corda na Polia',
            muscle: 'Tríceps',
            notes: 'Abra a corda e segure a contração',
            sets: [
              { weight: 22.5, reps: 12, completed: false, prev: '20kg × 12' },
              { weight: 25, reps: 10, completed: false, prev: '22.5kg × 10' }
            ],
            history: [
              { date: '2026-10-10', weight: 20 },
              { date: '2026-10-26', weight: 25 }
            ]
          }
        ]
      },
      {
        id: 'routine-2',
        name: 'Treino B • Pull',
        focus: 'Costas e Bíceps',
        exercises: [
          {
            id: 'ex-5',
            name: 'Puxada Alta Frontal',
            muscle: 'Costas',
            notes: 'Puxada controlada até a altura do queixo',
            sets: [
              { weight: 55, reps: 12, completed: false, prev: '50kg × 12' },
              { weight: 60, reps: 10, completed: false, prev: '55kg × 10' },
              { weight: 65, reps: 8, completed: false, prev: '60kg × 8' }
            ],
            history: [
              { date: '2026-10-08', weight: 55 },
              { date: '2026-10-20', weight: 60 },
              { date: '2026-10-27', weight: 65 }
            ]
          },
          {
            id: 'ex-6',
            name: 'Remada Curvada com Barra',
            muscle: 'Costas',
            notes: 'Tronco firme e escápulas travadas',
            sets: [
              { weight: 60, reps: 10, completed: false, prev: '55kg × 10' },
              { weight: 65, reps: 8, completed: false, prev: '60kg × 8' }
            ],
            history: [
              { date: '2026-10-08', weight: 55 },
              { date: '2026-10-27', weight: 65 }
            ]
          },
          {
            id: 'ex-7',
            name: 'Rosca Direta com Barra W',
            muscle: 'Bíceps',
            notes: 'Sem balançar o corpo',
            sets: [
              { weight: 24, reps: 10, completed: false, prev: '22kg × 10' },
              { weight: 26, reps: 10, completed: false, prev: '24kg × 10' }
            ],
            history: [
              { date: '2026-10-12', weight: 22 },
              { date: '2026-10-27', weight: 26 }
            ]
          }
        ]
      },
      {
        id: 'routine-3',
        name: 'Treino C • Legs',
        focus: 'Pernas Completas',
        exercises: [
          {
            id: 'ex-8',
            name: 'Agachamento Livre com Barra',
            muscle: 'Pernas',
            notes: 'Desça até quebrar os 90°',
            sets: [
              { weight: 70, reps: 10, completed: false, prev: '60kg × 10' },
              { weight: 80, reps: 8, completed: false, prev: '75kg × 8' },
              { weight: 85, reps: 6, completed: false, prev: '80kg × 8' }
            ],
            history: [
              { date: '2026-10-05', weight: 65 },
              { date: '2026-10-15', weight: 75 },
              { date: '2026-10-25', weight: 85 }
            ]
          },
          {
            id: 'ex-9',
            name: 'Leg Press 45°',
            muscle: 'Pernas',
            notes: 'Não estenda o joelho por completo',
            sets: [
              { weight: 180, reps: 12, completed: false, prev: '160kg × 12' },
              { weight: 200, reps: 10, completed: false, prev: '180kg × 10' }
            ],
            history: [
              { date: '2026-10-15', weight: 180 },
              { date: '2026-10-25', weight: 200 }
            ]
          }
        ]
      }
    ],
    meals: [
      {
        id: 'm-1',
        name: 'Café da Manhã',
        time: '07:30',
        foods: '3 ovos mexidos, 2 fatias pão integral, 1 banana com aveia e café preto',
        kcal: 480,
        protein: 30,
        carbs: 55,
        fat: 15,
        done: false
      },
      {
        id: 'm-2',
        name: 'Almoço',
        time: '12:30',
        foods: '180g filé de frango, 200g arroz, 100g feijão e salada com azeite',
        kcal: 690,
        protein: 48,
        carbs: 75,
        fat: 18,
        done: false
      },
      {
        id: 'm-3',
        name: 'Lanche da Tarde',
        time: '16:30',
        foods: 'Whey Protein (30g), 40g aveia, 1 maçã e 20g pasta de amendoim',
        kcal: 420,
        protein: 32,
        carbs: 48,
        fat: 10,
        done: false
      },
      {
        id: 'm-4',
        name: 'Jantar',
        time: '20:00',
        foods: '160g patinho moído, 220g batata assada e legumes',
        kcal: 620,
        protein: 42,
        carbs: 65,
        fat: 16,
        done: false
      },
      {
        id: 'm-5',
        name: 'Ceia',
        time: '22:30',
        foods: 'Iogurte natural desnatado com 15g castanhas',
        kcal: 190,
        protein: 18,
        carbs: 10,
        fat: 7,
        done: false
      }
    ],
    workoutLogs: {}
  };

  // Gerenciador de Estado
  class Store {
    constructor() {
      this.state = this.load();
    }

    load() {
      try {
        const item = localStorage.getItem(STORAGE_KEY);
        if (item) {
          const parsed = JSON.parse(item);
          return Object.assign({}, DEFAULT_DATA, parsed);
        }
      } catch (e) {
        console.error('Erro ao ler estado do localStorage:', e);
      }
      return JSON.parse(JSON.stringify(DEFAULT_DATA));
    }

    save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {
        console.error('Erro ao salvar no localStorage:', e);
        showToast('Erro ao salvar no dispositivo', 'error');
      }
    }

    clearToBlank() {
      this.state = {
        profile: {
          goal: 'Hipertrofia',
          targetKcal: 2400,
          targetProtein: 160,
          targetCarbs: 260,
          targetFat: 65,
          water: 0
        },
        activeRoutineId: 'routine-custom-1',
        routines: [
          {
            id: 'routine-custom-1',
            name: 'Meu Treino A',
            focus: 'Personalizado',
            exercises: []
          }
        ],
        meals: [],
        workoutLogs: {}
      };
      this.save();
    }
  }

  const store = new Store();

  // ==================== WAKE LOCK & CRONÔMETRO ====================
  let wakeLock = null;
  let sessionTimer = null;
  let sessionSeconds = 0;
  let isSessionRunning = false;

  async function activateWakeLock() {
    const pill = document.getElementById('wakelock-pill');
    if ('wakeLock' in navigator) {
      try {
        wakeLock = await navigator.wakeLock.request('screen');
        pill.classList.add('active');
        pill.querySelector('.wakelock-text').textContent = 'Tela Ligada';
        wakeLock.addEventListener('release', () => {
          pill.classList.remove('active');
          pill.querySelector('.wakelock-text').textContent = 'Tela Normal';
        });
      } catch (err) {
        pill.classList.remove('active');
        pill.querySelector('.wakelock-text').textContent = 'Sem suporte';
      }
    }
  }

  function deactivateWakeLock() {
    if (wakeLock) {
      wakeLock.release().catch(() => {});
      wakeLock = null;
    }
    const pill = document.getElementById('wakelock-pill');
    pill.classList.remove('active');
    pill.querySelector('.wakelock-text').textContent = 'Tela Normal';
  }

  document.addEventListener('visibilitychange', async () => {
    if (wakeLock !== null && document.visibilityState === 'visible' && isSessionRunning) {
      await activateWakeLock();
    }
  });

  function toggleSession() {
    const btn = document.getElementById('btn-start-session');
    const icon = document.getElementById('session-icon');
    const text = document.getElementById('session-text');

    if (!isSessionRunning) {
      isSessionRunning = true;
      icon.textContent = '⏹';
      text.textContent = 'Finalizar';
      btn.style.backgroundColor = 'var(--danger)';
      activateWakeLock();

      sessionTimer = setInterval(() => {
        sessionSeconds++;
        const m = String(Math.floor(sessionSeconds / 60)).padStart(2, '0');
        const s = String(sessionSeconds % 60).padStart(2, '0');
        document.getElementById('session-stopwatch').textContent = `${m}:${s}`;
      }, 1000);

      showToast('Sessão iniciada! Tela do celular mantida acesa. 💪', 'success');
    } else {
      isSessionRunning = false;
      icon.textContent = '▶';
      text.textContent = 'Iniciar Treino';
      btn.style.backgroundColor = 'var(--accent)';
      clearInterval(sessionTimer);
      deactivateWakeLock();

      // Gravar registro do dia
      const today = getTodayKey();
      store.state.workoutLogs[today] = true;

      // Gravar histórico de cargas de todos os exercícios que tiveram séries concluídas
      const activeRoutine = store.state.routines.find(r => r.id === store.state.activeRoutineId);
      if (activeRoutine) {
        activeRoutine.exercises.forEach(ex => {
          const completedSets = ex.sets.filter(s => s.completed);
          if (completedSets.length > 0) {
            const maxW = Math.max(...completedSets.map(s => Number(s.weight) || 0));
            if (maxW > 0) {
              if (!ex.history) ex.history = [];
              ex.history.push({ date: today, weight: maxW });
            }
          }
        });
      }

      store.save();
      renderAll();
      showToast(`Treino concluído! Duração: ${Math.floor(sessionSeconds / 60)} min. Parabéns! 🔥`, 'success');

      sessionSeconds = 0;
      document.getElementById('session-stopwatch').textContent = '00:00';
    }
  }

  // Descanso Rápido entre Séries
  let restTimer = null;
  let restSecondsLeft = 0;

  function playAlertBeep() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.35);
    } catch (e) {}

    if ('vibrate' in navigator) {
      try { navigator.vibrate([150, 70, 150]); } catch (e) {}
    }
  }

  function startRestTimer(secs) {
    if (restTimer) clearInterval(restTimer);
    restSecondsLeft = secs;
    const display = document.getElementById('rest-timer-text');

    function update() {
      const m = Math.floor(restSecondsLeft / 60);
      const s = restSecondsLeft % 60;
      display.textContent = `${m > 0 ? `${m}m ` : ''}${s}s`;
      if (restSecondsLeft <= 0) {
        clearInterval(restTimer);
        restTimer = null;
        display.textContent = 'Pronto! 🔔';
        playAlertBeep();
        showToast('Hora da próxima série! Bora! 💪', 'success');
      } else {
        restSecondsLeft--;
      }
    }

    update();
    restTimer = setInterval(update, 1000);
  }

  function stopRestTimer() {
    if (restTimer) {
      clearInterval(restTimer);
      restTimer = null;
    }
    document.getElementById('rest-timer-text').textContent = 'Parado';
  }

  // ==================== NAVEGAÇÃO DE ABAS ====================
  function initNav() {
    document.querySelectorAll('.bottom-bar .bar-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        switchTab(targetTab);
      });
    });

    document.getElementById('btn-home-manage-workouts').onclick = () => switchTab('tab-workouts');
    document.getElementById('btn-home-go-diet').onclick = () => switchTab('tab-diet');
  }

  function switchTab(tabId) {
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.bottom-bar .bar-item').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-tab') === tabId);
    });

    const active = document.getElementById(tabId);
    if (active) {
      active.classList.add('active');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (tabId === 'tab-progress') {
      renderProgressTab();
    }
  }

  // ==================== ABA 1: INÍCIO ====================
  function renderHomeTab() {
    const today = new Date();
    document.getElementById('header-date-text').textContent = today.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' });
    document.getElementById('home-goal-badge').textContent = store.state.profile.goal;
    document.getElementById('water-display').textContent = store.state.profile.water || 0;

    // Treino Ativo Card
    const routine = store.state.routines.find(r => r.id === store.state.activeRoutineId) || store.state.routines[0];
    const homeWorkoutBox = document.getElementById('home-workout-box');

    if (routine) {
      let totalSets = 0;
      let completedSets = 0;

      routine.exercises.forEach(ex => {
        totalSets += ex.sets.length;
        completedSets += ex.sets.filter(s => s.completed).length;
      });

      const pct = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

      homeWorkoutBox.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
          <div>
            <span class="tag tag-accent">${escapeHtml(routine.name)}</span>
            <h4 style="font-size: 1.15rem; font-weight: 800; margin-top: 4px;">${escapeHtml(routine.focus)}</h4>
          </div>
          <span class="tag">${routine.exercises.length} exercícios</span>
        </div>
        <div class="progress-track" style="margin: 10px 0 6px 0;">
          <div class="progress-fill fill-kcal" style="width: ${pct}%"></div>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span class="text-sm text-muted">${completedSets} de ${totalSets} séries concluídas (${pct}%)</span>
          <button class="btn btn-primary btn-sm" id="btn-home-start-now">Abrir Ficha</button>
        </div>
      `;

      document.getElementById('btn-home-start-now').onclick = () => switchTab('tab-workouts');
    } else {
      homeWorkoutBox.innerHTML = `
        <p class="text-muted text-sm">Você ainda não tem uma ficha criada.</p>
        <button class="btn btn-primary btn-sm mt-2" onclick="switchTab('tab-workouts')">Criar Meu Treino</button>
      `;
    }

    // Próxima Refeição
    const nextMeal = store.state.meals.find(m => !m.done) || store.state.meals[0];
    const mealBox = document.getElementById('home-meal-box');

    if (nextMeal) {
      mealBox.innerHTML = `
        <div class="meal-row-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="meal-badge-time">${escapeHtml(nextMeal.time)}</span>
            <h4 style="font-size: 1rem; font-weight: 800;">${escapeHtml(nextMeal.name)}</h4>
          </div>
          <button class="btn-check-set ${nextMeal.done ? 'checked' : ''}" id="btn-check-home-meal" title="Marcar refeição feita">✓</button>
        </div>
        <div class="meal-foods-box">${escapeHtml(nextMeal.foods)}</div>
        <div class="meal-macros-chips">
          <span>🔥 <strong>${nextMeal.kcal}</strong> kcal</span>
          <span style="color: var(--macro-p);">🥩 <strong>${nextMeal.protein}</strong>g P</span>
          <span style="color: var(--macro-c);">🍚 <strong>${nextMeal.carbs}</strong>g C</span>
          <span style="color: var(--macro-f);">🥑 <strong>${nextMeal.fat}</strong>g G</span>
        </div>
      `;

      document.getElementById('btn-check-home-meal').onclick = () => {
        nextMeal.done = !nextMeal.done;
        store.save();
        renderAll();
      };
    } else {
      mealBox.innerHTML = '<p class="text-muted text-sm">Nenhuma refeição cadastrada na sua dieta.</p>';
    }

    // Totais de Kcal
    let eatenKcal = 0;
    store.state.meals.forEach(m => {
      if (m.done) eatenKcal += Number(m.kcal) || 0;
    });

    document.getElementById('home-kcal-val').textContent = eatenKcal;
    document.getElementById('home-target-kcal-val').textContent = store.state.profile.targetKcal || 2400;

    // Resumo de 7 Dias
    renderWeekStrip();
  }

  function renderWeekStrip() {
    const container = document.getElementById('home-week-strip');
    container.innerHTML = '';
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    let workoutsCount = 0;

    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const k = d.toISOString().split('T')[0];
      const isToday = i === 0;
      const done = Boolean(store.state.workoutLogs[k]);
      if (done) workoutsCount++;

      const col = document.createElement('div');
      col.className = 'strip-col';
      col.innerHTML = `
        <span class="text-xs text-muted">${dayNames[d.getDay()]}</span>
        <div class="strip-bubble ${done ? 'done' : ''} ${isToday ? 'today' : ''}">
          ${done ? '✓' : (isToday ? '•' : '')}
        </div>
      `;
      container.appendChild(col);
    }

    document.getElementById('home-week-workouts-count').textContent = `${workoutsCount}/7`;
  }

  // ==================== ABA 2: CONSTRUTOR DE TREINOS ====================
  function renderWorkoutsTab() {
    const bar = document.getElementById('workout-tabs-bar');
    bar.innerHTML = '';

    const routines = store.state.routines;
    let activeRoutine = routines.find(r => r.id === store.state.activeRoutineId);
    if (!activeRoutine && routines.length > 0) {
      activeRoutine = routines[0];
      store.state.activeRoutineId = activeRoutine.id;
    }

    // Pílulas das Fichas
    routines.forEach(r => {
      const pill = document.createElement('button');
      pill.className = `routine-tab-pill ${r.id === store.state.activeRoutineId ? 'active' : ''}`;
      pill.textContent = r.name;
      pill.onclick = () => {
        store.state.activeRoutineId = r.id;
        store.save();
        renderWorkoutsTab();
        renderHomeTab();
      };
      bar.appendChild(pill);
    });

    // Botão Criar Nova Ficha
    const addPill = document.createElement('button');
    addPill.className = 'routine-tab-pill btn-add-routine';
    addPill.innerHTML = '+ Criar Ficha';
    addPill.onclick = openNewRoutineModal;
    bar.appendChild(addPill);

    if (!activeRoutine) return;

    // Header da Ficha
    document.getElementById('active-routine-name').textContent = activeRoutine.name;
    document.getElementById('active-routine-focus').textContent = activeRoutine.focus;

    document.getElementById('btn-edit-routine').onclick = () => openEditRoutineModal(activeRoutine);
    document.getElementById('btn-delete-routine').onclick = () => confirmDeleteRoutine(activeRoutine);

    // Pilha de Exercícios com Séries
    const stack = document.getElementById('exercises-stack');
    stack.innerHTML = '';

    const emptyHint = document.getElementById('empty-routine-hint');
    if (activeRoutine.exercises.length === 0) {
      emptyHint.style.display = 'block';
      return;
    } else {
      emptyHint.style.display = 'none';
    }

    activeRoutine.exercises.forEach((ex, exIndex) => {
      const card = document.createElement('div');
      card.className = 'exercise-block';

      // Header do Exercício com Ferramentas de Reordenação
      let toolsHtml = `
        <button class="btn-tool btn-move-up" title="Mover para cima" ${exIndex === 0 ? 'disabled style="opacity:0.3"' : ''}>▲</button>
        <button class="btn-tool btn-move-down" title="Mover para baixo" ${exIndex === activeRoutine.exercises.length - 1 ? 'disabled style="opacity:0.3"' : ''}>▼</button>
        <button class="btn-tool btn-history-ex" title="Ver evolução">📈</button>
        <button class="btn-tool btn-edit-notes" title="Editar anotações">✏️</button>
        <button class="btn-tool text-danger btn-del-ex" title="Excluir exercício">🗑️</button>
      `;

      card.innerHTML = `
        <div class="exercise-block-header">
          <div class="exercise-heading-left">
            <span class="tag tag-muscle">${escapeHtml(ex.muscle || 'Geral')}</span>
            <h3 class="exercise-block-title">${escapeHtml(ex.name)}</h3>
          </div>
          <div class="exercise-tools">
            ${toolsHtml}
          </div>
        </div>
        ${ex.notes ? `<div class="exercise-notes-text">💡 ${escapeHtml(ex.notes)}</div>` : ''}

        <div class="sets-table-wrap">
          <div class="sets-table-header">
            <span>SÉRIE</span>
            <span>ANTERIOR</span>
            <span>KG</span>
            <span>REPS</span>
            <span>FEITO</span>
          </div>
          <div class="sets-body" id="sets-body-${ex.id}"></div>
        </div>

        <button class="btn-add-set" id="btn-add-set-${ex.id}">+ Adicionar Série</button>
      `;

      // Renderizar Linhas de Séries
      const setsBody = card.querySelector(`#sets-body-${ex.id}`);
      ex.sets.forEach((set, sIdx) => {
        const row = document.createElement('div');
        row.className = `set-row ${set.completed ? 'completed' : ''}`;

        row.innerHTML = `
          <div class="set-badge">${sIdx + 1}</div>
          <div class="set-prev">${set.prev || '--'}</div>
          <div>
            <input type="number" inputmode="decimal" step="0.5" class="input-set input-weight" value="${set.weight || ''}" placeholder="kg">
          </div>
          <div>
            <input type="number" inputmode="numeric" class="input-set input-reps" value="${set.reps || ''}" placeholder="reps">
          </div>
          <div>
            <button class="btn-check-set ${set.completed ? 'checked' : ''}" title="Concluir série">✓</button>
          </div>
        `;

        // Inputs automáticos salvam ao digitar
        const weightInput = row.querySelector('.input-weight');
        const repsInput = row.querySelector('.input-reps');
        const checkBtn = row.querySelector('.btn-check-set');

        weightInput.onchange = () => {
          set.weight = parseFloat(weightInput.value) || 0;
          store.save();
        };

        repsInput.onchange = () => {
          set.reps = parseInt(repsInput.value, 10) || 0;
          store.save();
        };

        checkBtn.onclick = () => {
          set.completed = !set.completed;
          set.weight = parseFloat(weightInput.value) || set.weight || 0;
          set.reps = parseInt(repsInput.value, 10) || set.reps || 0;
          store.save();
          renderWorkoutsTab();
          renderHomeTab();

          // Se acabou de marcar feito, inicia descanso automaticamente
          if (set.completed && !restTimer) {
            startRestTimer(60);
          }
        };

        setsBody.appendChild(row);
      });

      // Eventos das Ferramentas
      card.querySelector('.btn-move-up').onclick = () => moveExercise(activeRoutine, exIndex, -1);
      card.querySelector('.btn-move-down').onclick = () => moveExercise(activeRoutine, exIndex, 1);
      card.querySelector('.btn-history-ex').onclick = () => openHistoryModal(ex);
      card.querySelector('.btn-edit-notes').onclick = () => openEditExNotes(ex);
      card.querySelector('.btn-del-ex').onclick = () => confirmDeleteExercise(activeRoutine, ex);

      // Botão + Adicionar Série
      card.querySelector(`#btn-add-set-${ex.id}`).onclick = () => {
        const lastSet = ex.sets[ex.sets.length - 1];
        const newSet = {
          weight: lastSet ? lastSet.weight : 20,
          reps: lastSet ? lastSet.reps : 10,
          completed: false,
          prev: lastSet ? `${lastSet.weight}kg × ${lastSet.reps}` : '--'
        };
        ex.sets.push(newSet);
        store.save();
        renderWorkoutsTab();
        renderHomeTab();
      };

      stack.appendChild(card);
    });
  }

  // Reordenar Exercícios
  function moveExercise(routine, index, direction) {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= routine.exercises.length) return;
    const temp = routine.exercises[index];
    routine.exercises[index] = routine.exercises[targetIdx];
    routine.exercises[targetIdx] = temp;
    store.save();
    renderWorkoutsTab();
  }

  function confirmDeleteExercise(routine, ex) {
    if (confirm(`Remover "${ex.name}" da ficha?`)) {
      routine.exercises = routine.exercises.filter(item => item.id !== ex.id);
      store.save();
      renderWorkoutsTab();
      renderHomeTab();
      showToast('Exercício removido.', 'success');
    }
  }

  // ==================== CATÁLOGO DE EXERCÍCIOS ====================
  let selectedFilterMuscle = 'all';

  function initCatalog() {
    document.querySelectorAll('.catalog-filters .filter-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.catalog-filters .filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        selectedFilterMuscle = chip.getAttribute('data-muscle');
        filterCatalog();
      });
    });

    const searchInput = document.getElementById('catalog-search-input');
    searchInput.addEventListener('input', () => {
      filterCatalog();
    });

    document.getElementById('btn-open-catalog').onclick = () => {
      searchInput.value = '';
      selectedFilterMuscle = 'all';
      document.querySelectorAll('.catalog-filters .filter-chip').forEach((c, i) => c.classList.toggle('active', i === 0));
      filterCatalog();
      document.getElementById('modal-catalog').classList.add('open');
    };

    document.getElementById('btn-create-custom-ex').onclick = () => {
      const customName = searchInput.value.trim();
      if (customName) {
        addExerciseToActiveRoutine(customName, 'Personalizado');
        document.getElementById('modal-catalog').classList.remove('open');
      }
    };
  }

  function filterCatalog() {
    const searchVal = document.getElementById('catalog-search-input').value.trim().toLowerCase();
    const list = document.getElementById('catalog-list');
    list.innerHTML = '';

    const customPrompt = document.getElementById('custom-ex-prompt');

    const filtered = EXERCISE_CATALOG.filter(ex => {
      const matchesMuscle = selectedFilterMuscle === 'all' || ex.muscle === selectedFilterMuscle;
      const matchesQuery = !searchVal || ex.name.toLowerCase().includes(searchVal);
      return matchesMuscle && matchesQuery;
    });

    if (searchVal && !filtered.some(e => e.name.toLowerCase() === searchVal)) {
      customPrompt.style.display = 'flex';
    } else {
      customPrompt.style.display = 'none';
    }

    if (filtered.length === 0 && !searchVal) {
      list.innerHTML = '<p class="text-muted text-center" style="padding: 20px;">Nenhum exercício encontrado nesta categoria.</p>';
      return;
    }

    filtered.forEach(ex => {
      const item = document.createElement('div');
      item.className = 'catalog-item';
      item.innerHTML = `
        <div class="catalog-item-info">
          <h4>${escapeHtml(ex.name)}</h4>
          <span class="tag tag-muscle">${escapeHtml(ex.muscle)}</span>
        </div>
        <button class="btn btn-sm btn-primary">+ Adicionar</button>
      `;

      item.onclick = () => {
        addExerciseToActiveRoutine(ex.name, ex.muscle);
        document.getElementById('modal-catalog').classList.remove('open');
      };

      list.appendChild(item);
    });
  }

  function addExerciseToActiveRoutine(name, muscle) {
    const routine = store.state.routines.find(r => r.id === store.state.activeRoutineId);
    if (!routine) return;

    const newEx = {
      id: 'ex-' + Date.now(),
      name: name,
      muscle: muscle,
      notes: '',
      sets: [
        { weight: 20, reps: 10, completed: false, prev: '--' },
        { weight: 20, reps: 10, completed: false, prev: '--' },
        { weight: 20, reps: 10, completed: false, prev: '--' }
      ],
      history: [{ date: getTodayKey(), weight: 20 }]
    };

    routine.exercises.push(newEx);
    store.save();
    renderWorkoutsTab();
    renderHomeTab();
    showToast(`"${name}" adicionado à sua ficha! 💪`, 'success');
  }

  // ==================== MODAL DE FICHA (CRIAR / EDITAR) ====================
  function openNewRoutineModal() {
    document.getElementById('modal-routine-title').textContent = 'Montar Nova Ficha';
    document.getElementById('input-routine-id').value = '';
    document.getElementById('input-routine-name').value = '';
    document.getElementById('input-routine-focus').value = '';
    document.getElementById('modal-routine').classList.add('open');
  }

  function openEditRoutineModal(routine) {
    document.getElementById('modal-routine-title').textContent = 'Editar Ficha';
    document.getElementById('input-routine-id').value = routine.id;
    document.getElementById('input-routine-name').value = routine.name;
    document.getElementById('input-routine-focus').value = routine.focus;
    document.getElementById('modal-routine').classList.add('open');
  }

  document.getElementById('form-routine').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('input-routine-id').value;
    const name = document.getElementById('input-routine-name').value.trim();
    const focus = document.getElementById('input-routine-focus').value.trim();

    if (id) {
      const routine = store.state.routines.find(r => r.id === id);
      if (routine) {
        routine.name = name;
        routine.focus = focus;
        showToast('Ficha atualizada!', 'success');
      }
    } else {
      const newR = {
        id: 'routine-' + Date.now(),
        name,
        focus,
        exercises: []
      };
      store.state.routines.push(newR);
      store.state.activeRoutineId = newR.id;
      showToast('Nova ficha criada! Agora adicione seus exercícios. 🏋️', 'success');
    }

    store.save();
    document.getElementById('modal-routine').classList.remove('open');
    renderWorkoutsTab();
    renderHomeTab();
  });

  function confirmDeleteRoutine(routine) {
    if (store.state.routines.length <= 1) {
      showToast('Você precisa manter pelo menos 1 ficha criada.', 'error');
      return;
    }
    if (confirm(`Deseja excluir a ficha "${routine.name}"?`)) {
      store.state.routines = store.state.routines.filter(r => r.id !== routine.id);
      store.state.activeRoutineId = store.state.routines[0].id;
      store.save();
      renderWorkoutsTab();
      renderHomeTab();
      showToast('Ficha excluída.', 'success');
    }
  }

  // ==================== EDITAR NOTAS DO EXERCÍCIO ====================
  let currentEditingEx = null;
  function openEditExNotes(ex) {
    currentEditingEx = ex;
    document.getElementById('input-edit-ex-id').value = ex.id;
    document.getElementById('input-edit-ex-name').value = ex.name;
    document.getElementById('input-edit-ex-notes').value = ex.notes || '';
    document.getElementById('modal-edit-ex').classList.add('open');
  }

  document.getElementById('form-edit-ex').addEventListener('submit', (e) => {
    e.preventDefault();
    if (!currentEditingEx) return;
    currentEditingEx.name = document.getElementById('input-edit-ex-name').value.trim();
    currentEditingEx.notes = document.getElementById('input-edit-ex-notes').value.trim();
    store.save();
    document.getElementById('modal-edit-ex').classList.remove('open');
    renderWorkoutsTab();
    showToast('Configurações salvas!', 'success');
  });

  // ==================== MODAL DE HISTÓRICO & GRÁFICO ====================
  function openHistoryModal(ex) {
    document.getElementById('history-modal-title').textContent = ex.name;
    document.getElementById('history-modal-sub').textContent = `Músculo: ${ex.muscle || 'Geral'}`;

    const chartBox = document.getElementById('history-modal-chart');
    renderInteractiveSVGChart(chartBox, ex);

    const table = document.getElementById('history-table-records');
    table.innerHTML = '';

    const history = ex.history || [];
    const sorted = [...history].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    if (sorted.length === 0) {
      table.innerHTML = '<p class="text-muted text-sm text-center">Nenhuma carga registrada ainda.</p>';
    } else {
      sorted.forEach(rec => {
        const row = document.createElement('div');
        row.className = 'history-item-row';
        row.innerHTML = `
          <span>📅 ${rec.date}</span>
          <strong style="color: var(--accent);">${rec.weight} kg</strong>
        `;
        table.appendChild(row);
      });
    }

    document.getElementById('modal-history').classList.add('open');
  }

  // ==================== ABA 3: DIETA ====================
  function renderDietTab() {
    let sumKcal = 0, sumP = 0, sumC = 0, sumF = 0;
    store.state.meals.forEach(m => {
      if (m.done) {
        sumKcal += Number(m.kcal) || 0;
        sumP += Number(m.protein) || 0;
        sumC += Number(m.carbs) || 0;
        sumF += Number(m.fat) || 0;
      }
    });

    const targetKcal = store.state.profile.targetKcal || 2400;
    const targetP = store.state.profile.targetProtein || 160;
    const targetC = store.state.profile.targetCarbs || 260;
    const targetF = store.state.profile.targetFat || 65;

    document.getElementById('diet-consumed-kcal').textContent = sumKcal;
    document.getElementById('diet-goal-kcal').textContent = targetKcal;
    document.getElementById('diet-remaining-kcal').textContent = Math.max(0, targetKcal - sumKcal);
    document.getElementById('diet-kcal-progress').style.width = `${Math.min(100, Math.round((sumKcal / targetKcal) * 100))}%`;

    document.getElementById('diet-consumed-p').textContent = sumP;
    document.getElementById('diet-goal-p').textContent = targetP;
    document.getElementById('diet-p-progress').style.width = `${Math.min(100, Math.round((sumP / targetP) * 100))}%`;

    document.getElementById('diet-consumed-c').textContent = sumC;
    document.getElementById('diet-goal-c').textContent = targetC;
    document.getElementById('diet-c-progress').style.width = `${Math.min(100, Math.round((sumC / targetC) * 100))}%`;

    document.getElementById('diet-consumed-f').textContent = sumF;
    document.getElementById('diet-goal-f').textContent = targetF;
    document.getElementById('diet-f-progress').style.width = `${Math.min(100, Math.round((sumF / targetF) * 100))}%`;

    // Renderizar Refeições
    const stack = document.getElementById('meals-stack');
    stack.innerHTML = '';

    if (store.state.meals.length === 0) {
      stack.innerHTML = `
        <div class="card text-center" style="padding: 30px;">
          <p class="text-muted mb-3">Nenhuma refeição cadastrada na sua dieta.</p>
          <button class="btn btn-primary btn-sm" id="btn-empty-meal">+ Criar Primeira Refeição</button>
        </div>
      `;
      document.getElementById('btn-empty-meal').onclick = openAddMealModal;
      return;
    }

    const sortedMeals = [...store.state.meals].sort((a, b) => (a.time || '').localeCompare(b.time || ''));

    sortedMeals.forEach(meal => {
      const card = document.createElement('div');
      card.className = `meal-item-card ${meal.done ? 'done' : ''}`;

      card.innerHTML = `
        <div class="meal-row-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="meal-badge-time">${escapeHtml(meal.time)}</span>
            <h4 style="font-size: 1.05rem; font-weight: 800;">${escapeHtml(meal.name)}</h4>
          </div>
          <button class="btn-check-set ${meal.done ? 'checked' : ''}" title="Marcar refeição concluída">✓</button>
        </div>
        <div class="meal-foods-box">${escapeHtml(meal.foods)}</div>
        <div class="meal-macros-chips">
          <span>🔥 <strong>${meal.kcal}</strong> kcal</span>
          <span style="color: var(--macro-p);">🥩 <strong>${meal.protein}</strong>g P</span>
          <span style="color: var(--macro-c);">🍚 <strong>${meal.carbs}</strong>g C</span>
          <span style="color: var(--macro-f);">🥑 <strong>${meal.fat}</strong>g G</span>
        </div>
        <div style="display: flex; justify-content: flex-end; gap: 6px; margin-top: 10px; border-top: 1px solid var(--border); padding-top: 8px;">
          <button class="btn-tool btn-edit-meal" title="Editar">✏️</button>
          <button class="btn-tool text-danger btn-del-meal" title="Excluir">🗑️</button>
        </div>
      `;

      card.querySelector('.btn-check-set').onclick = () => {
        meal.done = !meal.done;
        store.save();
        renderDietTab();
        renderHomeTab();
      };

      card.querySelector('.btn-edit-meal').onclick = () => openEditMealModal(meal);
      card.querySelector('.btn-del-meal').onclick = () => confirmDeleteMeal(meal);

      stack.appendChild(card);
    });
  }

  function openAddMealModal() {
    document.getElementById('modal-meal-title').textContent = 'Nova Refeição';
    document.getElementById('input-meal-id').value = '';
    document.getElementById('form-meal').reset();
    document.getElementById('modal-meal').classList.add('open');
  }

  function openEditMealModal(meal) {
    document.getElementById('modal-meal-title').textContent = 'Editar Refeição';
    document.getElementById('input-meal-id').value = meal.id;
    document.getElementById('input-meal-name').value = meal.name;
    document.getElementById('input-meal-time').value = meal.time;
    document.getElementById('input-meal-foods').value = meal.foods;
    document.getElementById('input-meal-kcal').value = meal.kcal;
    document.getElementById('input-meal-p').value = meal.protein;
    document.getElementById('input-meal-c').value = meal.carbs;
    document.getElementById('input-meal-f').value = meal.fat;
    document.getElementById('modal-meal').classList.add('open');
  }

  document.getElementById('form-meal').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('input-meal-id').value;
    const name = document.getElementById('input-meal-name').value.trim();
    const time = document.getElementById('input-meal-time').value;
    const foods = document.getElementById('input-meal-foods').value.trim();
    const kcal = parseInt(document.getElementById('input-meal-kcal').value, 10);
    const protein = parseInt(document.getElementById('input-meal-p').value, 10);
    const carbs = parseInt(document.getElementById('input-meal-c').value, 10);
    const fat = parseInt(document.getElementById('input-meal-f').value, 10);

    if (id) {
      const meal = store.state.meals.find(m => m.id === id);
      if (meal) {
        meal.name = name;
        meal.time = time;
        meal.foods = foods;
        meal.kcal = kcal;
        meal.protein = protein;
        meal.carbs = carbs;
        meal.fat = fat;
        showToast('Refeição salva!', 'success');
      }
    } else {
      store.state.meals.push({
        id: 'meal-' + Date.now(),
        name,
        time,
        foods,
        kcal,
        protein,
        carbs,
        fat,
        done: false
      });
      showToast('Refeição cadastrada!', 'success');
    }

    store.save();
    document.getElementById('modal-meal').classList.remove('open');
    renderDietTab();
    renderHomeTab();
  });

  function confirmDeleteMeal(meal) {
    if (confirm(`Excluir a refeição "${meal.name}"?`)) {
      store.state.meals = store.state.meals.filter(m => m.id !== meal.id);
      store.save();
      renderDietTab();
      renderHomeTab();
      showToast('Refeição removida.', 'success');
    }
  }

  // ==================== ABA 4: PROGRESSO & CONFIGURAÇÕES ====================
  function renderProgressTab() {
    document.getElementById('input-goal-title').value = store.state.profile.goal || 'Hipertrofia';
    document.getElementById('input-goal-kcal').value = store.state.profile.targetKcal || 2400;
    document.getElementById('input-goal-p').value = store.state.profile.targetProtein || 160;
    document.getElementById('input-goal-c').value = store.state.profile.targetCarbs || 260;
    document.getElementById('input-goal-f').value = store.state.profile.targetFat || 65;

    // Preencher select de exercícios
    const select = document.getElementById('select-chart-ex');
    select.innerHTML = '';

    const allExercises = [];
    store.state.routines.forEach(r => {
      r.exercises.forEach(ex => allExercises.push(ex));
    });

    if (allExercises.length === 0) {
      select.innerHTML = '<option value="">Nenhum exercício nas suas fichas</option>';
      document.getElementById('progress-chart-container').innerHTML = '<p class="text-muted text-sm">Adicione exercícios nas suas fichas para ver o gráfico.</p>';
      return;
    }

    allExercises.forEach(ex => {
      const opt = document.createElement('option');
      opt.value = ex.id;
      opt.textContent = `${ex.name} (${ex.muscle || 'Geral'})`;
      select.appendChild(opt);
    });

    select.onchange = () => {
      const chosen = allExercises.find(e => e.id === select.value);
      if (chosen) renderInteractiveSVGChart(document.getElementById('progress-chart-container'), chosen);
    };

    renderInteractiveSVGChart(document.getElementById('progress-chart-container'), allExercises[0]);
  }

  // Formulário de Metas
  document.getElementById('form-user-goals').addEventListener('submit', (e) => {
    e.preventDefault();
    store.state.profile.goal = document.getElementById('input-goal-title').value;
    store.state.profile.targetKcal = parseInt(document.getElementById('input-goal-kcal').value, 10);
    store.state.profile.targetProtein = parseInt(document.getElementById('input-goal-p').value, 10);
    store.state.profile.targetCarbs = parseInt(document.getElementById('input-goal-c').value, 10);
    store.state.profile.targetFat = parseInt(document.getElementById('input-goal-f').value, 10);
    store.save();
    renderHomeTab();
    renderDietTab();
    showToast('Metas diárias salvas com sucesso! 🎯', 'success');
  });

  // Gráfico SVG Responsivo e Interativo
  function renderInteractiveSVGChart(container, ex) {
    if (!container || !ex) return;

    let history = ex.history && ex.history.length > 0
      ? [...ex.history].sort((a, b) => (a.date || '').localeCompare(b.date || ''))
      : [];

    if (history.length === 0) {
      const firstSetWeight = ex.sets && ex.sets.length > 0 ? ex.sets[0].weight : 20;
      history = [{ date: 'Hoje', weight: firstSetWeight || 20 }];
    }

    const latest = history[history.length - 1];
    const badge = document.getElementById('chart-max-weight');
    if (badge) badge.textContent = `${latest.weight} kg`;

    const width = 360;
    const height = 180;
    const pad = { top: 20, right: 25, bottom: 35, left: 35 };

    const weights = history.map(h => Number(h.weight) || 0);
    let min = Math.min(...weights);
    let max = Math.max(...weights);

    if (min === max) {
      min = Math.max(0, min - 10);
      max = max + 10;
    } else {
      const diff = max - min;
      min = Math.max(0, Math.floor(min - diff * 0.15));
      max = Math.ceil(max + diff * 0.15);
    }

    const cW = width - pad.left - pad.right;
    const cH = height - pad.top - pad.bottom;

    const points = history.map((h, i) => {
      const x = history.length > 1
        ? pad.left + (i / (history.length - 1)) * cW
        : pad.left + cW / 2;
      const y = pad.top + cH - ((h.weight - min) / (max - min)) * cH;
      return { x, y, weight: h.weight, date: h.date };
    });

    let pathD = `M ${points[0].x} ${points[0].y}`;
    points.slice(1).forEach(p => { pathD += ` L ${p.x} ${p.y}`; });
    const areaD = `${pathD} L ${points[points.length - 1].x} ${pad.top + cH} L ${points[0].x} ${pad.top + cH} Z`;

    const svg = `
      <svg class="chart-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="pulseGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#00e676" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#00e676" stop-opacity="0.0" />
          </linearGradient>
        </defs>

        <line x1="${pad.left}" y1="${pad.top}" x2="${width - pad.right}" y2="${pad.top}" class="chart-grid" />
        <line x1="${pad.left}" y1="${pad.top + cH / 2}" x2="${width - pad.right}" y2="${pad.top + cH / 2}" class="chart-grid" />
        <line x1="${pad.left}" y1="${pad.top + cH}" x2="${width - pad.right}" y2="${pad.top + cH}" class="chart-grid" />

        <text x="${pad.left - 6}" y="${pad.top + 4}" class="chart-text" text-anchor="end">${max}</text>
        <text x="${pad.left - 6}" y="${pad.top + cH / 2 + 4}" class="chart-text" text-anchor="end">${Math.round((max + min) / 2)}</text>
        <text x="${pad.left - 6}" y="${pad.top + cH + 4}" class="chart-text" text-anchor="end">${min}</text>

        <path d="${areaD}" class="chart-area" />
        <path d="${pathD}" class="chart-line" />

        ${points.map(p => `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="5" class="chart-dot" />
            <text x="${p.x}" y="${p.y - 8}" font-size="10" font-weight="700" fill="#00e676" text-anchor="middle">${p.weight}kg</text>
            <text x="${p.x}" y="${height - 8}" class="chart-text" text-anchor="middle">${formatDateBadge(p.date)}</text>
          </g>
        `).join('')}
      </svg>
    `;

    container.innerHTML = svg;
  }

  function formatDateBadge(d) {
    if (!d || d === 'Hoje') return 'Hoje';
    const parts = d.split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}` : d;
  }

  // ==================== BACKUP & RESTAURAÇÃO ====================
  document.getElementById('btn-export-backup').onclick = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(store.state, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `ironpulse_backup_${getTodayKey()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    showToast('Backup exportado com sucesso! 📥', 'success');
  };

  document.getElementById('input-backup-file').onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed && parsed.routines) {
          store.state = parsed;
          store.save();
          renderAll();
          showToast('Backup restaurado! Suas fichas foram carregadas. 🎉', 'success');
        } else {
          showToast('Arquivo de backup inválido.', 'error');
        }
      } catch (err) {
        showToast('Erro ao ler arquivo JSON.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Limpar Tudo e Montar do Zero
  document.getElementById('btn-clear-all-data').onclick = () => {
    if (confirm('Tem certeza de que deseja apagar tudo e montar seus treinos do zero?')) {
      store.clearToBlank();
      renderAll();
      showToast('Fichas limpas! Agora monte seu treino do seu jeito. 🚀', 'success');
    }
  };

  // Água rápida
  document.getElementById('btn-quick-water').onclick = () => {
    store.state.profile.water = (store.state.profile.water || 0) + 250;
    store.save();
    document.getElementById('water-display').textContent = store.state.profile.water;
    showToast(`+250ml registrados! Total: ${store.state.profile.water}ml 💧`, 'success');
  };

  // Fechamento de Modais
  document.querySelectorAll('[data-dismiss]').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-dismiss');
      const modal = document.getElementById(id);
      if (modal) modal.classList.remove('open');
    };
  });

  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.onclick = (e) => {
      if (e.target === modal) modal.classList.remove('open');
    };
  });

  // Toasts
  function showToast(msg, type = 'success') {
    const hub = document.getElementById('toast-hub');
    const t = document.createElement('div');
    t.className = `toast-msg ${type}`;
    t.innerHTML = `<span>${type === 'success' ? '⚡' : '⚠️'}</span><span>${escapeHtml(msg)}</span>`;
    hub.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translateY(10px)';
      t.style.transition = 'all 0.25s ease';
      setTimeout(() => t.remove(), 250);
    }, 3000);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function renderAll() {
    renderHomeTab();
    renderWorkoutsTab();
    renderDietTab();
  }

  // Inicialização
  function init() {
    initNav();
    initCatalog();

    document.getElementById('btn-start-session').onclick = toggleSession;
    document.getElementById('btn-add-meal').onclick = openAddMealModal;

    document.querySelectorAll('.chip-timer[data-sec]').forEach(chip => {
      chip.onclick = () => startRestTimer(parseInt(chip.getAttribute('data-sec'), 10));
    });
    document.getElementById('btn-stop-rest').onclick = stopRestTimer;

    renderAll();

    // Service Worker PWA
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
      });
    }
  }

  document.addEventListener('DOMContentLoaded', init);

})();
