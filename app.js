/**
 * IronPulse - Treinos, Dieta TACO, Multiperfil & Fotos
 * Alta Performance • IndexedDB + LocalStorage
 */

(function () {
  'use strict';

  const STORAGE_KEY = 'ironpulse_multi_profile_v1';

  function getTodayKey() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // Perfil Padrão Inicial
  function createDefaultProfile(id, name, weight = 75, height = 175, goal = 'Hipertrofia') {
    const minWater = Math.round(weight * 35);
    return {
      id: id,
      name: name,
      weight: weight,
      height: height,
      goal: goal,
      targetKcal: 2400,
      targetProtein: 160,
      targetCarbs: 260,
      targetFat: 65,
      water: 0,
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
              name: 'Desenvolvimento com Halteres',
              muscle: 'Ombros',
              notes: 'Coluna firme, sem bater os halteres',
              sets: [
                { weight: 20, reps: 10, completed: false, prev: '18kg × 10' },
                { weight: 22, reps: 8, completed: false, prev: '20kg × 8' }
              ],
              history: [
                { date: '2026-10-10', weight: 18 },
                { date: '2026-10-26', weight: 22 }
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
              id: 'ex-3',
              name: 'Puxada Alta Frontal',
              muscle: 'Costas',
              notes: 'Foco na contração da dorsal',
              sets: [
                { weight: 55, reps: 12, completed: false, prev: '50kg × 12' },
                { weight: 60, reps: 10, completed: false, prev: '55kg × 10' }
              ],
              history: [
                { date: '2026-10-08', weight: 55 },
                { date: '2026-10-27', weight: 60 }
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
          done: false,
          items: [
            { id: 'item-1', name: 'Ovo de galinha inteiro cozido', grams: 150, kcal: 219, protein: 20.0, carbs: 0.9, fat: 14.3 },
            { id: 'item-2', name: 'Pão de forma integral', grams: 50, kcal: 127, protein: 4.7, carbs: 25.0, fat: 1.9 },
            { id: 'item-3', name: 'Banana Prata', grams: 100, kcal: 98, protein: 1.3, carbs: 26.0, fat: 0.1 }
          ]
        },
        {
          id: 'm-2',
          name: 'Almoço',
          time: '12:30',
          done: false,
          items: [
            { id: 'item-4', name: 'Peito de frango grelhado', grams: 180, kcal: 286, protein: 57.6, carbs: 0.0, fat: 4.5 },
            { id: 'item-5', name: 'Arroz branco cozido', grams: 200, kcal: 256, protein: 5.0, carbs: 56.2, fat: 0.4 },
            { id: 'item-6', name: 'Feijão carioca cozido (50% caldo)', grams: 100, kcal: 76, protein: 4.8, carbs: 13.6, fat: 0.5 },
            { id: 'item-7', name: 'Azeite de oliva extravirgem', grams: 10, kcal: 88, protein: 0.0, carbs: 0.0, fat: 10.0 }
          ]
        }
      ],
      workoutLogs: {}
    };
  }

  // Gerenciador de Perfis
  class MultiProfileStore {
    constructor() {
      this.state = this.load();
    }

    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.profiles && parsed.profiles.length > 0) {
            return parsed;
          }
        }
      } catch (e) {
        console.error('Erro ao ler perfis do localStorage:', e);
      }

      // Estado inicial com Pedro
      const initialProfile = createDefaultProfile('p-1', 'Pedro', 76, 178, 'Hipertrofia');
      return {
        activeProfileId: 'p-1',
        profiles: [initialProfile]
      };
    }

    save() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {
        console.error('Erro ao salvar perfis:', e);
        showToast('Erro ao salvar dados!', 'error');
      }
    }

    getActiveProfile() {
      let p = this.state.profiles.find(item => item.id === this.state.activeProfileId);
      if (!p && this.state.profiles.length > 0) {
        p = this.state.profiles[0];
        this.state.activeProfileId = p.id;
      }
      return p;
    }

    addProfile(name, weight, height, goal) {
      const id = 'p-' + Date.now();
      const newP = createDefaultProfile(id, name, weight, height, goal);
      this.state.profiles.push(newP);
      this.state.activeProfileId = id;
      this.save();
      return newP;
    }

    deleteProfile(id) {
      if (this.state.profiles.length <= 1) {
        showToast('Você deve manter pelo menos um perfil cadastrado.', 'error');
        return false;
      }
      this.state.profiles = this.state.profiles.filter(p => p.id !== id);
      this.state.activeProfileId = this.state.profiles[0].id;
      this.save();
      return true;
    }
  }

  const store = new MultiProfileStore();

  // Helper para somar calorias e macros de uma refeição baseada em seus itens TACO
  function getMealTotals(meal) {
    let kcal = 0, p = 0, c = 0, f = 0;
    if (meal.items && meal.items.length > 0) {
      meal.items.forEach(it => {
        kcal += Number(it.kcal) || 0;
        p += Number(it.protein) || 0;
        c += Number(it.carbs) || 0;
        f += Number(it.fat) || 0;
      });
    }
    return {
      kcal: Math.round(kcal),
      protein: Math.round(p * 10) / 10,
      carbs: Math.round(c * 10) / 10,
      fat: Math.round(f * 10) / 10
    };
  }

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

      showToast('Sessão iniciada! Tela do celular mantida ligada. 💪', 'success');
    } else {
      isSessionRunning = false;
      icon.textContent = '▶';
      text.textContent = 'Iniciar Treino';
      btn.style.backgroundColor = 'var(--accent)';
      clearInterval(sessionTimer);
      deactivateWakeLock();

      const profile = store.getActiveProfile();
      const today = getTodayKey();
      if (!profile.workoutLogs) profile.workoutLogs = {};
      profile.workoutLogs[today] = true;

      const activeRoutine = profile.routines.find(r => r.id === profile.activeRoutineId);
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
      showToast(`Treino concluído! Duração: ${Math.floor(sessionSeconds / 60)} min. 🔥`, 'success');

      sessionSeconds = 0;
      document.getElementById('session-stopwatch').textContent = '00:00';
    }
  }

  // Descanso Rápido
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

  // ==================== NAVEGAÇÃO & SUB-ABAS ====================
  function initNav() {
    document.querySelectorAll('.bottom-bar .bar-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        switchTab(targetTab);
      });
    });

    document.getElementById('btn-home-manage-workouts').onclick = () => switchTab('tab-workouts');
    document.getElementById('btn-home-go-diet').onclick = () => switchTab('tab-diet');

    // Sub-abas de Progresso (Fotos vs Cargas)
    document.querySelectorAll('.sub-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.sub-tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.sub-tab-content').forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        const targetId = btn.getAttribute('data-subtab');
        const activeSub = document.getElementById(targetId);
        if (activeSub) activeSub.classList.add('active');

        if (targetId === 'sub-photos') {
          renderPhotosGallery();
        } else if (targetId === 'sub-charts') {
          renderProgressTab();
        }
      });
    });
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
      const activeSubBtn = document.querySelector('.sub-tab-btn.active');
      if (activeSubBtn && activeSubBtn.getAttribute('data-subtab') === 'sub-photos') {
        renderPhotosGallery();
      } else {
        renderProgressTab();
      }
    }
  }

  // ==================== RENDERIZADORES ====================

  // Header e Água
  function renderHeader() {
    const profile = store.getActiveProfile();
    const initials = (profile.name || 'U').charAt(0).toUpperCase();

    document.getElementById('header-avatar-circle').textContent = initials;
    document.getElementById('header-profile-name').textContent = profile.name;
    document.getElementById('header-profile-goal').textContent = profile.goal;

    const minWater = Math.round((Number(profile.weight) || 70) * 35);
    document.getElementById('water-display').textContent = profile.water || 0;
    document.getElementById('water-min-goal-display').textContent = minWater;
    document.getElementById('water-calc-desc').textContent = `Mínimo recomendado: 35ml × ${profile.weight || 70}kg = ${minWater}ml`;
    document.getElementById('water-current-total').textContent = profile.water || 0;
    document.getElementById('water-target-total').textContent = minWater;

    const pct = minWater > 0 ? Math.min(100, Math.round(((profile.water || 0) / minWater) * 100)) : 0;
    document.getElementById('water-progress-fill').style.width = `${pct}%`;
    document.getElementById('water-percent-badge').textContent = `${pct}%`;
    document.getElementById('home-water-ratio').textContent = `${pct}%`;
  }

  // 1. Início
  function renderHomeTab() {
    renderHeader();
    const profile = store.getActiveProfile();

    document.getElementById('home-goal-badge').textContent = profile.goal;

    const routine = profile.routines.find(r => r.id === profile.activeRoutineId) || profile.routines[0];
    const homeWorkoutBox = document.getElementById('home-workout-box');

    if (routine) {
      let totalSets = 0, completedSets = 0;
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
        <p class="text-muted text-sm">Nenhuma ficha criada para este perfil.</p>
        <button class="btn btn-primary btn-sm mt-2" onclick="switchTab('tab-workouts')">Criar Treino</button>
      `;
    }

    // Próxima Refeição
    const nextMeal = profile.meals.find(m => !m.done) || profile.meals[0];
    const mealBox = document.getElementById('home-meal-box');

    if (nextMeal) {
      const totals = getMealTotals(nextMeal);
      const foodsPreview = nextMeal.items && nextMeal.items.length > 0
        ? nextMeal.items.map(it => `${it.grams}g ${it.name}`).join(', ')
        : 'Sem alimentos adicionados';

      mealBox.innerHTML = `
        <div class="meal-row-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="meal-badge-time">${escapeHtml(nextMeal.time)}</span>
            <h4 style="font-size: 1rem; font-weight: 800;">${escapeHtml(nextMeal.name)}</h4>
          </div>
          <button class="btn-check-set ${nextMeal.done ? 'checked' : ''}" id="btn-check-home-meal">✓</button>
        </div>
        <div class="meal-foods-box">${escapeHtml(foodsPreview)}</div>
        <div class="meal-macros-chips">
          <span>🔥 <strong>${totals.kcal}</strong> kcal</span>
          <span style="color: var(--macro-p);">🥩 <strong>${totals.protein}</strong>g P</span>
          <span style="color: var(--macro-c);">🍚 <strong>${totals.carbs}</strong>g C</span>
          <span style="color: var(--macro-f);">🥑 <strong>${totals.fat}</strong>g G</span>
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

    // Calorias de Hoje
    let eatenKcal = 0;
    profile.meals.forEach(m => {
      if (m.done) {
        const t = getMealTotals(m);
        eatenKcal += t.kcal;
      }
    });

    document.getElementById('home-kcal-val').textContent = eatenKcal;
    document.getElementById('home-target-kcal-val').textContent = profile.targetKcal || 2400;

    renderWeekStrip();
  }

  function renderWeekStrip() {
    const container = document.getElementById('home-week-strip');
    container.innerHTML = '';
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    let workoutsCount = 0;
    const profile = store.getActiveProfile();

    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const k = d.toISOString().split('T')[0];
      const isToday = i === 0;
      const done = Boolean(profile.workoutLogs && profile.workoutLogs[k]);
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

  // 2. Treinos
  function renderWorkoutsTab() {
    const profile = store.getActiveProfile();
    const bar = document.getElementById('workout-tabs-bar');
    bar.innerHTML = '';

    const routines = profile.routines;
    let activeRoutine = routines.find(r => r.id === profile.activeRoutineId);
    if (!activeRoutine && routines.length > 0) {
      activeRoutine = routines[0];
      profile.activeRoutineId = activeRoutine.id;
    }

    routines.forEach(r => {
      const pill = document.createElement('button');
      pill.className = `routine-tab-pill ${r.id === profile.activeRoutineId ? 'active' : ''}`;
      pill.textContent = r.name;
      pill.onclick = () => {
        profile.activeRoutineId = r.id;
        store.save();
        renderWorkoutsTab();
        renderHomeTab();
      };
      bar.appendChild(pill);
    });

    const addPill = document.createElement('button');
    addPill.className = 'routine-tab-pill btn-add-routine';
    addPill.innerHTML = '+ Criar Ficha';
    addPill.onclick = openNewRoutineModal;
    bar.appendChild(addPill);

    if (!activeRoutine) return;

    document.getElementById('active-routine-name').textContent = activeRoutine.name;
    document.getElementById('active-routine-focus').textContent = activeRoutine.focus;

    document.getElementById('btn-edit-routine').onclick = () => openEditRoutineModal(activeRoutine);
    document.getElementById('btn-delete-routine').onclick = () => confirmDeleteRoutine(activeRoutine);

    const stack = document.getElementById('exercises-stack');
    stack.innerHTML = '';

    if (activeRoutine.exercises.length === 0) {
      stack.innerHTML = '<p class="text-muted text-center" style="padding: 24px;">Ficha sem exercícios. Toque em "+ Adicionar Exercício" abaixo.</p>';
      return;
    }

    activeRoutine.exercises.forEach((ex, exIndex) => {
      const card = document.createElement('div');
      card.className = 'exercise-block';

      card.innerHTML = `
        <div class="exercise-block-header">
          <div class="exercise-heading-left">
            <span class="tag tag-muscle">${escapeHtml(ex.muscle || 'Geral')}</span>
            <h3 class="exercise-block-title">${escapeHtml(ex.name)}</h3>
          </div>
          <div class="exercise-tools">
            <button class="btn-tool btn-move-up" title="Mover para cima" ${exIndex === 0 ? 'disabled style="opacity:0.3"' : ''}>▲</button>
            <button class="btn-tool btn-move-down" title="Mover para baixo" ${exIndex === activeRoutine.exercises.length - 1 ? 'disabled style="opacity:0.3"' : ''}>▼</button>
            <button class="btn-tool btn-history-ex" title="Ver evolução">📈</button>
            <button class="btn-tool btn-edit-notes" title="Editar anotações">✏️</button>
            <button class="btn-tool text-danger btn-del-ex" title="Excluir exercício">🗑️</button>
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
            <button class="btn-check-set ${set.completed ? 'checked' : ''}">✓</button>
          </div>
        `;

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

          if (set.completed && !restTimer) {
            startRestTimer(60);
          }
        };

        setsBody.appendChild(row);
      });

      card.querySelector('.btn-move-up').onclick = () => moveExercise(activeRoutine, exIndex, -1);
      card.querySelector('.btn-move-down').onclick = () => moveExercise(activeRoutine, exIndex, 1);
      card.querySelector('.btn-history-ex').onclick = () => openHistoryModal(ex);
      card.querySelector('.btn-edit-notes').onclick = () => openEditExNotes(ex);
      card.querySelector('.btn-del-ex').onclick = () => confirmDeleteExercise(activeRoutine, ex);

      card.querySelector(`#btn-add-set-${ex.id}`).onclick = () => {
        const lastSet = ex.sets[ex.sets.length - 1];
        ex.sets.push({
          weight: lastSet ? lastSet.weight : 20,
          reps: lastSet ? lastSet.reps : 10,
          completed: false,
          prev: lastSet ? `${lastSet.weight}kg × ${lastSet.reps}` : '--'
        });
        store.save();
        renderWorkoutsTab();
        renderHomeTab();
      };

      stack.appendChild(card);
    });
  }

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

  // 3. Dieta com Tabela TACO
  function renderDietTab() {
    renderHeader();
    const profile = store.getActiveProfile();

    let sumKcal = 0, sumP = 0, sumC = 0, sumF = 0;
    profile.meals.forEach(m => {
      if (m.done) {
        const t = getMealTotals(m);
        sumKcal += t.kcal;
        sumP += t.protein;
        sumC += t.carbs;
        sumF += t.fat;
      }
    });

    const targetKcal = profile.targetKcal || 2400;
    const targetP = profile.targetProtein || 160;
    const targetC = profile.targetCarbs || 260;
    const targetF = profile.targetFat || 65;

    document.getElementById('diet-consumed-kcal').textContent = sumKcal;
    document.getElementById('diet-goal-kcal').textContent = targetKcal;
    document.getElementById('diet-remaining-kcal').textContent = Math.max(0, targetKcal - sumKcal);
    document.getElementById('diet-kcal-progress').style.width = `${Math.min(100, Math.round((sumKcal / targetKcal) * 100))}%`;

    document.getElementById('diet-consumed-p').textContent = Math.round(sumP);
    document.getElementById('diet-goal-p').textContent = targetP;
    document.getElementById('diet-p-progress').style.width = `${Math.min(100, Math.round((sumP / targetP) * 100))}%`;

    document.getElementById('diet-consumed-c').textContent = Math.round(sumC);
    document.getElementById('diet-goal-c').textContent = targetC;
    document.getElementById('diet-c-progress').style.width = `${Math.min(100, Math.round((sumC / targetC) * 100))}%`;

    document.getElementById('diet-consumed-f').textContent = Math.round(sumF);
    document.getElementById('diet-goal-f').textContent = targetF;
    document.getElementById('diet-f-progress').style.width = `${Math.min(100, Math.round((sumF / targetF) * 100))}%`;

    const stack = document.getElementById('meals-stack');
    stack.innerHTML = '';

    if (profile.meals.length === 0) {
      stack.innerHTML = `
        <div class="card text-center" style="padding: 30px;">
          <p class="text-muted mb-3">Nenhuma refeição cadastrada neste perfil.</p>
          <button class="btn btn-primary btn-sm" id="btn-empty-meal">+ Criar Primeira Refeição</button>
        </div>
      `;
      document.getElementById('btn-empty-meal').onclick = openAddMealModal;
      return;
    }

    const sortedMeals = [...profile.meals].sort((a, b) => (a.time || '').localeCompare(b.time || ''));

    sortedMeals.forEach(meal => {
      const totals = getMealTotals(meal);
      const card = document.createElement('div');
      card.className = `meal-item-card ${meal.done ? 'done' : ''}`;

      let itemsHtml = '';
      if (meal.items && meal.items.length > 0) {
        meal.items.forEach((item, itemIdx) => {
          itemsHtml += `
            <div class="taco-food-tag">
              <div class="food-tag-left">
                <span class="food-tag-name">${item.grams}g ${escapeHtml(item.name)}</span>
                <span class="food-tag-macros">
                  <strong>${item.kcal}</strong> kcal • <strong>${item.protein}g</strong> P • <strong>${item.carbs}g</strong> C • <strong>${item.fat}g</strong> G
                </span>
              </div>
              <button class="btn-del-food-item" data-item-idx="${itemIdx}" title="Remover alimento">✕</button>
            </div>
          `;
        });
      } else {
        itemsHtml = '<p class="text-xs text-muted" style="padding: 4px 0;">Nenhum alimento cadastrado. Adicione pela tabela TACO abaixo.</p>';
      }

      card.innerHTML = `
        <div class="meal-row-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="meal-badge-time">${escapeHtml(meal.time)}</span>
            <h4 style="font-size: 1.05rem; font-weight: 800;">${escapeHtml(meal.name)}</h4>
          </div>
          <button class="btn-check-set ${meal.done ? 'checked' : ''}" title="Marcar refeição concluída">✓</button>
        </div>

        <div class="meal-taco-items-list">
          ${itemsHtml}
        </div>

        <button class="btn-add-food-to-meal" data-meal-id="${meal.id}">
          + Adicionar Alimento da Tabela TACO
        </button>

        <div class="meal-macros-chips">
          <span>🔥 <strong>${totals.kcal}</strong> kcal</span>
          <span style="color: var(--macro-p);">🥩 <strong>${totals.protein}</strong>g P</span>
          <span style="color: var(--macro-c);">🍚 <strong>${totals.carbs}</strong>g C</span>
          <span style="color: var(--macro-f);">🥑 <strong>${totals.fat}</strong>g G</span>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 6px; margin-top: 10px; border-top: 1px solid var(--border); padding-top: 8px;">
          <button class="btn-tool btn-edit-meal" title="Editar Nome/Horário">✏️</button>
          <button class="btn-tool text-danger btn-del-meal" title="Excluir Refeição">🗑️</button>
        </div>
      `;

      card.querySelector('.btn-check-set').onclick = () => {
        meal.done = !meal.done;
        store.save();
        renderDietTab();
        renderHomeTab();
      };

      // Remover item de alimento da refeição
      card.querySelectorAll('.btn-del-food-item').forEach(delBtn => {
        delBtn.onclick = () => {
          const idx = parseInt(delBtn.getAttribute('data-item-idx'), 10);
          meal.items.splice(idx, 1);
          store.save();
          renderDietTab();
          renderHomeTab();
        };
      });

      // Botão para abrir o seletor da Tabela TACO para esta refeição específica
      card.querySelector('.btn-add-food-to-meal').onclick = () => {
        openTacoPickerForMeal(meal);
      };

      card.querySelector('.btn-edit-meal').onclick = () => openEditMealModal(meal);
      card.querySelector('.btn-del-meal').onclick = () => confirmDeleteMeal(meal);

      stack.appendChild(card);
    });
  }

  // ==================== TABELA TACO: PICKER & CÁLCULO DE GRAMAS ====================
  let currentTargetMeal = null;
  let currentSelectedTacoFood = null;

  function initTacoPicker() {
    const searchInput = document.getElementById('taco-search-input');
    const gramInput = document.getElementById('taco-grams-input');

    searchInput.addEventListener('input', () => {
      filterTacoList();
    });

    gramInput.addEventListener('input', () => {
      calculateLiveTacoMacros();
    });

    document.getElementById('btn-confirm-add-taco').onclick = () => {
      if (!currentTargetMeal || !currentSelectedTacoFood) return;

      const grams = parseFloat(gramInput.value) || 100;
      const factor = grams / 100;

      const newItem = {
        id: 'item-' + Date.now(),
        name: currentSelectedTacoFood.name,
        grams: grams,
        kcal: Math.round(currentSelectedTacoFood.kcal * factor),
        protein: Math.round((currentSelectedTacoFood.protein * factor) * 10) / 10,
        carbs: Math.round((currentSelectedTacoFood.carbs * factor) * 10) / 10,
        fat: Math.round((currentSelectedTacoFood.fat * factor) * 10) / 10
      };

      if (!currentTargetMeal.items) currentTargetMeal.items = [];
      currentTargetMeal.items.push(newItem);

      store.save();
      document.getElementById('modal-taco-picker').classList.remove('open');
      renderDietTab();
      renderHomeTab();
      showToast(`${grams}g de ${newItem.name} adicionados! 🥗`, 'success');
    };
  }

  function openTacoPickerForMeal(meal) {
    currentTargetMeal = meal;
    currentSelectedTacoFood = null;
    document.getElementById('taco-calc-box').style.display = 'none';
    document.getElementById('taco-search-input').value = '';
    filterTacoList();
    document.getElementById('modal-taco-picker').classList.add('open');
  }

  function filterTacoList() {
    const query = document.getElementById('taco-search-input').value.trim().toLowerCase();
    const container = document.getElementById('taco-items-scroll');
    container.innerHTML = '';

    const list = window.TACO_DATABASE || [];
    const filtered = list.filter(item => !query || item.name.toLowerCase().includes(query) || item.category.toLowerCase().includes(query));

    if (filtered.length === 0) {
      container.innerHTML = '<p class="text-muted text-center" style="padding: 16px;">Nenhum alimento encontrado na Tabela TACO.</p>';
      return;
    }

    filtered.forEach(food => {
      const itemRow = document.createElement('div');
      itemRow.className = 'taco-list-item';
      itemRow.innerHTML = `
        <div>
          <strong style="font-size: 0.9rem;">${escapeHtml(food.name)}</strong>
          <div class="taco-item-meta">
            ${food.kcal} kcal • P: ${food.protein}g • C: ${food.carbs}g • G: ${food.fat}g (por 100g)
          </div>
        </div>
        <span class="tag tag-accent">${escapeHtml(food.category)}</span>
      `;

      itemRow.onclick = () => {
        selectTacoFood(food);
      };

      container.appendChild(itemRow);
    });
  }

  function selectTacoFood(food) {
    currentSelectedTacoFood = food;
    document.getElementById('taco-calc-food-name').textContent = food.name;
    document.getElementById('taco-calc-category').textContent = food.category;
    document.getElementById('taco-calc-box').style.display = 'block';
    calculateLiveTacoMacros();
  }

  function calculateLiveTacoMacros() {
    if (!currentSelectedTacoFood) return;
    const grams = parseFloat(document.getElementById('taco-grams-input').value) || 0;
    const factor = grams / 100;

    const kcal = Math.round(currentSelectedTacoFood.kcal * factor);
    const p = Math.round((currentSelectedTacoFood.protein * factor) * 10) / 10;
    const c = Math.round((currentSelectedTacoFood.carbs * factor) * 10) / 10;
    const f = Math.round((currentSelectedTacoFood.fat * factor) * 10) / 10;

    document.getElementById('taco-res-kcal').textContent = `${kcal} kcal`;
    document.getElementById('taco-res-p').textContent = `${p}g`;
    document.getElementById('taco-res-c').textContent = `${c}g`;
    document.getElementById('taco-res-f').textContent = `${f}g`;
  }

  // ==================== GALERIA DE FOTOS & COMPARADOR ====================
  let selectedPhotosToCompare = [];

  async function renderPhotosGallery() {
    const profile = store.getActiveProfile();
    const grid = document.getElementById('photos-grid');
    grid.innerHTML = '<p class="text-muted text-center" style="grid-column: 1/-1;">Carregando fotos...</p>';

    try {
      const photos = await window.IronDB.getPhotosByProfile(profile.id);
      document.getElementById('photos-count-badge').textContent = `${photos.length} fotos`;
      grid.innerHTML = '';

      if (photos.length === 0) {
        grid.innerHTML = `
          <div class="card text-center" style="grid-column: 1/-1; padding: 30px;">
            <p class="text-muted mb-2">Nenhuma foto registrada para este perfil.</p>
            <p class="text-xs text-muted">Tire uma foto hoje para começar seu diário de evolução!</p>
          </div>
        `;
        return;
      }

      photos.forEach(photo => {
        const card = document.createElement('div');
        card.className = 'photo-card';

        const isSelected = selectedPhotosToCompare.some(p => p.id === photo.id);

        card.innerHTML = `
          <div class="photo-thumb-wrap">
            <img src="${photo.dataUrl}" alt="Evolução ${photo.date}" loading="lazy">
            <span class="photo-badge-date">${photo.date}</span>
            ${photo.weight ? `<span class="photo-badge-weight">${photo.weight}kg</span>` : ''}
          </div>
          <div class="photo-card-actions">
            <button class="btn-compare-select" style="${isSelected ? 'background: var(--cyan); color: #000;' : ''}">
              ${isSelected ? '✓ Selecionada' : 'Comparar'}
            </button>
            <button class="btn-del-photo" title="Excluir foto">🗑️</button>
          </div>
        `;

        card.querySelector('.btn-compare-select').onclick = () => {
          togglePhotoComparison(photo);
        };

        card.querySelector('.btn-del-photo').onclick = async () => {
          if (confirm('Deseja excluir esta foto do histórico?')) {
            await window.IronDB.deletePhoto(photo.id);
            selectedPhotosToCompare = selectedPhotosToCompare.filter(p => p.id !== photo.id);
            renderPhotosGallery();
            showToast('Foto excluída.', 'success');
          }
        };

        grid.appendChild(card);
      });
    } catch (e) {
      console.error('Erro ao buscar fotos:', e);
      grid.innerHTML = '<p class="text-danger text-center" style="grid-column: 1/-1;">Erro ao carregar fotos.</p>';
    }
  }

  function togglePhotoComparison(photo) {
    const idx = selectedPhotosToCompare.findIndex(p => p.id === photo.id);
    if (idx >= 0) {
      selectedPhotosToCompare.splice(idx, 1);
    } else {
      if (selectedPhotosToCompare.length >= 2) {
        selectedPhotosToCompare.shift(); // Remove a mais antiga
      }
      selectedPhotosToCompare.push(photo);
    }

    updateComparatorCard();
    renderPhotosGallery();
  }

  function updateComparatorCard() {
    const card = document.getElementById('comparator-card');
    if (selectedPhotosToCompare.length === 2) {
      // Ordena por data (a mais antiga é o "Antes")
      const sorted = [...selectedPhotosToCompare].sort((a, b) => (a.date || '').localeCompare(b.date || ''));
      const before = sorted[0];
      const after = sorted[1];

      document.getElementById('comparator-before-img').src = before.dataUrl;
      document.getElementById('comparator-before-meta').innerHTML = `<strong>${before.date}</strong> • ${before.weight ? `${before.weight}kg` : ''} (${before.pose || 'Frente'})`;

      document.getElementById('comparator-after-img').src = after.dataUrl;
      document.getElementById('comparator-after-meta').innerHTML = `<strong>${after.date}</strong> • ${after.weight ? `${after.weight}kg` : ''} (${after.pose || 'Frente'})`;

      card.style.display = 'block';
      card.scrollIntoView({ behavior: 'smooth' });
    } else {
      card.style.display = 'none';
    }
  }

  document.getElementById('btn-close-comparator').onclick = () => {
    selectedPhotosToCompare = [];
    updateComparatorCard();
    renderPhotosGallery();
  };

  // Upload e Compressão de Foto
  let tempCompressedDataUrl = null;
  document.getElementById('input-camera-photo').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      showToast('Otimizando imagem para alta velocidade...', 'success');
      // Comprime para no máximo 1000px mantendo alta qualidade e peso ultra leve (< 120KB)
      tempCompressedDataUrl = await window.IronDB.compressImage(file, 1000, 0.82);

      const profile = store.getActiveProfile();
      document.getElementById('preview-photo-img').src = tempCompressedDataUrl;
      document.getElementById('input-photo-date').value = getTodayKey();
      document.getElementById('input-photo-weight').value = profile.weight || '';

      document.getElementById('modal-save-photo').classList.add('open');
    } catch (err) {
      console.error(err);
      showToast('Erro ao processar imagem!', 'error');
    }

    e.target.value = '';
  });

  document.getElementById('form-save-photo').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!tempCompressedDataUrl) return;

    const profile = store.getActiveProfile();
    const date = document.getElementById('input-photo-date').value;
    const weight = parseFloat(document.getElementById('input-photo-weight').value) || null;
    const pose = document.getElementById('select-photo-pose').value;

    const photoObj = {
      id: 'photo-' + Date.now(),
      profileId: profile.id,
      date: date,
      weight: weight,
      pose: pose,
      dataUrl: tempCompressedDataUrl
    };

    await window.IronDB.savePhoto(photoObj);
    document.getElementById('modal-save-photo').classList.remove('open');
    renderPhotosGallery();
    showToast('Foto registrada com sucesso na sua evolução! 📸', 'success');
  });

  // ==================== GERENCIADOR DE MULTIPERFIL ====================
  function initProfiles() {
    document.getElementById('btn-open-profile-sheet').onclick = () => {
      renderProfilesModal();
      document.getElementById('modal-profiles').classList.add('open');
    };

    document.getElementById('btn-open-create-profile').onclick = () => {
      document.getElementById('modal-profiles').classList.remove('open');
      document.getElementById('form-create-profile').reset();
      document.getElementById('modal-create-profile').classList.add('open');
    };

    document.getElementById('form-create-profile').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('input-new-profile-name').value.trim();
      const weight = parseFloat(document.getElementById('input-new-profile-weight').value) || 75;
      const height = parseInt(document.getElementById('input-new-profile-height').value, 10) || 175;
      const goal = document.getElementById('input-new-profile-goal').value;

      store.addProfile(name, weight, height, goal);
      document.getElementById('modal-create-profile').classList.remove('open');
      renderAll();
      showToast(`Perfil de "${name}" criado e ativado! 🎉`, 'success');
    });
  }

  function renderProfilesModal() {
    const list = document.getElementById('profiles-list-box');
    list.innerHTML = '';

    store.state.profiles.forEach(p => {
      const isCurrent = p.id === store.state.activeProfileId;
      const item = document.createElement('div');
      item.className = `profile-card-item ${isCurrent ? 'active' : ''}`;

      const minW = Math.round((Number(p.weight) || 70) * 35);
      const initials = (p.name || 'U').charAt(0).toUpperCase();

      item.innerHTML = `
        <div class="profile-item-left">
          <div class="profile-avatar-circle" style="width: 36px; height: 36px; font-size: 0.95rem;">${initials}</div>
          <div class="profile-item-info">
            <h4>${escapeHtml(p.name)} ${isCurrent ? '<span class="tag tag-accent">Ativo</span>' : ''}</h4>
            <span>${p.weight || '--'}kg • ${p.goal} • Mín água: ${minW}ml</span>
          </div>
        </div>
        ${store.state.profiles.length > 1 ? `<button class="btn-del-profile" data-del-id="${p.id}" style="background:none;border:none;color:var(--danger);font-size:1.1rem;cursor:pointer;padding:8px;">🗑️</button>` : ''}
      `;

      item.onclick = (e) => {
        if (e.target.closest('.btn-del-profile')) return;
        store.state.activeProfileId = p.id;
        store.save();
        document.getElementById('modal-profiles').classList.remove('open');
        renderAll();
        showToast(`Perfil alternado para "${p.name}"!`, 'success');
      };

      const delBtn = item.querySelector('.btn-del-profile');
      if (delBtn) {
        delBtn.onclick = (e) => {
          e.stopPropagation();
          if (confirm(`Excluir o perfil de "${p.name}" e todos os seus dados?`)) {
            store.deleteProfile(p.id);
            renderProfilesModal();
            renderAll();
            showToast('Perfil excluído.', 'success');
          }
        };
      }

      list.appendChild(item);
    });
  }

  // ==================== ÁGUA RÁPIDA ====================
  function initWater() {
    document.querySelectorAll('.btn-water-add').forEach(btn => {
      btn.onclick = () => {
        const amt = parseInt(btn.getAttribute('data-add'), 10);
        addWater(amt);
      };
    });

    document.getElementById('btn-quick-water').onclick = () => {
      addWater(250);
    };

    document.getElementById('btn-reset-water').onclick = () => {
      if (confirm('Zerar contador de água de hoje?')) {
        const p = store.getActiveProfile();
        p.water = 0;
        store.save();
        renderHeader();
        showToast('Água zerada.', 'success');
      }
    };
  }

  function addWater(amt) {
    const profile = store.getActiveProfile();
    profile.water = (profile.water || 0) + amt;
    store.save();
    renderHeader();
    showToast(`+${amt}ml de água registrados! Total: ${profile.water}ml 💧`, 'success');
  }

  // ==================== PROGRESSO & METAS ====================
  function renderProgressTab() {
    const profile = store.getActiveProfile();

    document.getElementById('input-profile-weight').value = profile.weight || 75;
    document.getElementById('input-profile-height').value = profile.height || 175;
    document.getElementById('input-goal-title').value = profile.goal || 'Hipertrofia';
    document.getElementById('input-goal-kcal').value = profile.targetKcal || 2400;
    document.getElementById('input-goal-p').value = profile.targetProtein || 160;
    document.getElementById('input-goal-c').value = profile.targetCarbs || 260;
    document.getElementById('input-goal-f').value = profile.targetFat || 65;

    const select = document.getElementById('select-chart-ex');
    select.innerHTML = '';

    const allExercises = [];
    profile.routines.forEach(r => {
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

  document.getElementById('form-user-goals').addEventListener('submit', (e) => {
    e.preventDefault();
    const profile = store.getActiveProfile();
    profile.weight = parseFloat(document.getElementById('input-profile-weight').value) || profile.weight;
    profile.height = parseInt(document.getElementById('input-profile-height').value, 10) || profile.height;
    profile.goal = document.getElementById('input-goal-title').value;
    profile.targetKcal = parseInt(document.getElementById('input-goal-kcal').value, 10);
    profile.targetProtein = parseInt(document.getElementById('input-goal-p').value, 10);
    profile.targetCarbs = parseInt(document.getElementById('input-goal-c').value, 10);
    profile.targetFat = parseInt(document.getElementById('input-goal-f').value, 10);

    store.save();
    renderAll();
    showToast('Metas do perfil salvas com sucesso! 🎯', 'success');
  });

  // Gráfico SVG Responsivo
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

    const width = 360, height = 180, pad = { top: 20, right: 25, bottom: 35, left: 35 };
    const weights = history.map(h => Number(h.weight) || 0);
    let min = Math.min(...weights), max = Math.max(...weights);

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
      const x = history.length > 1 ? pad.left + (i / (history.length - 1)) * cW : pad.left + cW / 2;
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

  // ==================== CATÁLOGO DE EXERCÍCIOS ====================
  const EXERCISE_CATALOG = [
    { name: 'Supino Reto com Barra', muscle: 'Peito' },
    { name: 'Supino Inclinado com Halteres', muscle: 'Peito' },
    { name: 'Supino Inclinado com Barra', muscle: 'Peito' },
    { name: 'Supino Reto com Halteres', muscle: 'Peito' },
    { name: 'Crossover na Polia Média', muscle: 'Peito' },
    { name: 'Voador / Peck Deck', muscle: 'Peito' },
    { name: 'Paralelas (Foco Peitoral)', muscle: 'Peito' },
    { name: 'Flexão de Braço', muscle: 'Peito' },
    { name: 'Puxada Alta Frontal', muscle: 'Costas' },
    { name: 'Remada Curvada com Barra', muscle: 'Costas' },
    { name: 'Remada Baixa no Triângulo', muscle: 'Costas' },
    { name: 'Pull-Down na Polia com Corda', muscle: 'Costas' },
    { name: 'Levantamento Terra', muscle: 'Costas' },
    { name: 'Agachamento Livre com Barra', muscle: 'Pernas' },
    { name: 'Leg Press 45°', muscle: 'Pernas' },
    { name: 'Cadeira Extensora', muscle: 'Pernas' },
    { name: 'Mesa Flexora', muscle: 'Pernas' },
    { name: 'Stiff com Halteres', muscle: 'Pernas' },
    { name: 'Elevação Pélvica com Barra', muscle: 'Pernas' },
    { name: 'Panturrilha em Pé na Máquina', muscle: 'Pernas' },
    { name: 'Desenvolvimento com Halteres', muscle: 'Ombros' },
    { name: 'Elevação Lateral com Halteres', muscle: 'Ombros' },
    { name: 'Crucifixo Inverso com Halteres', muscle: 'Ombros' },
    { name: 'Rosca Direta com Barra W', muscle: 'Bíceps' },
    { name: 'Rosca Martelo com Halteres', muscle: 'Bíceps' },
    { name: 'Tríceps Corda na Polia', muscle: 'Tríceps' },
    { name: 'Tríceps Testa com Barra W', muscle: 'Tríceps' },
    { name: 'Abdominal na Polia / Crunch', muscle: 'Abdômen' },
    { name: 'Prancha Isométrica', muscle: 'Abdômen' }
  ];

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
    searchInput.addEventListener('input', () => filterCatalog());

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
      const matchesM = selectedFilterMuscle === 'all' || ex.muscle === selectedFilterMuscle;
      const matchesQ = !searchVal || ex.name.toLowerCase().includes(searchVal);
      return matchesM && matchesQ;
    });

    if (searchVal && !filtered.some(e => e.name.toLowerCase() === searchVal)) {
      customPrompt.style.display = 'flex';
    } else {
      customPrompt.style.display = 'none';
    }

    filtered.forEach(ex => {
      const item = document.createElement('div');
      item.className = 'catalog-item';
      item.innerHTML = `
        <div>
          <h4 style="font-size:0.95rem; font-weight:700;">${escapeHtml(ex.name)}</h4>
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
    const profile = store.getActiveProfile();
    const routine = profile.routines.find(r => r.id === profile.activeRoutineId);
    if (!routine) return;

    routine.exercises.push({
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
    });

    store.save();
    renderWorkoutsTab();
    renderHomeTab();
    showToast(`"${name}" adicionado à ficha! 💪`, 'success');
  }

  // Modais de Fichas
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
    const profile = store.getActiveProfile();
    const id = document.getElementById('input-routine-id').value;
    const name = document.getElementById('input-routine-name').value.trim();
    const focus = document.getElementById('input-routine-focus').value.trim();

    if (id) {
      const routine = profile.routines.find(r => r.id === id);
      if (routine) {
        routine.name = name;
        routine.focus = focus;
        showToast('Ficha atualizada!', 'success');
      }
    } else {
      const newR = { id: 'routine-' + Date.now(), name, focus, exercises: [] };
      profile.routines.push(newR);
      profile.activeRoutineId = newR.id;
      showToast('Nova ficha criada! 🏋️', 'success');
    }

    store.save();
    document.getElementById('modal-routine').classList.remove('open');
    renderWorkoutsTab();
    renderHomeTab();
  });

  function confirmDeleteRoutine(routine) {
    const profile = store.getActiveProfile();
    if (profile.routines.length <= 1) {
      showToast('Você precisa manter pelo menos 1 ficha criada.', 'error');
      return;
    }
    if (confirm(`Deseja excluir a ficha "${routine.name}"?`)) {
      profile.routines = profile.routines.filter(r => r.id !== routine.id);
      profile.activeRoutineId = profile.routines[0].id;
      store.save();
      renderWorkoutsTab();
      renderHomeTab();
      showToast('Ficha excluída.', 'success');
    }
  }

  // Modais de Exercício
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
    showToast('Exercício salvo!', 'success');
  });

  function openHistoryModal(ex) {
    document.getElementById('history-modal-title').textContent = ex.name;
    document.getElementById('history-modal-sub').textContent = `Músculo: ${ex.muscle || 'Geral'}`;
    renderInteractiveSVGChart(document.getElementById('history-modal-chart'), ex);

    const table = document.getElementById('history-table-records');
    table.innerHTML = '';
    const sorted = [...(ex.history || [])].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

    if (sorted.length === 0) {
      table.innerHTML = '<p class="text-muted text-sm text-center">Nenhuma carga registrada ainda.</p>';
    } else {
      sorted.forEach(rec => {
        const row = document.createElement('div');
        row.className = 'history-item-row';
        row.innerHTML = `<span>📅 ${rec.date}</span><strong style="color:var(--accent);">${rec.weight} kg</strong>`;
        table.appendChild(row);
      });
    }

    document.getElementById('modal-history').classList.add('open');
  }

  // Modais de Refeição
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
    document.getElementById('modal-meal').classList.add('open');
  }

  document.getElementById('form-meal').addEventListener('submit', (e) => {
    e.preventDefault();
    const profile = store.getActiveProfile();
    const id = document.getElementById('input-meal-id').value;
    const name = document.getElementById('input-meal-name').value.trim();
    const time = document.getElementById('input-meal-time').value;

    if (id) {
      const meal = profile.meals.find(m => m.id === id);
      if (meal) {
        meal.name = name;
        meal.time = time;
        showToast('Refeição salva!', 'success');
      }
    } else {
      profile.meals.push({
        id: 'meal-' + Date.now(),
        name,
        time,
        done: false,
        items: []
      });
      showToast('Refeição cadastrada! Agora adicione alimentos da Tabela TACO.', 'success');
    }

    store.save();
    document.getElementById('modal-meal').classList.remove('open');
    renderDietTab();
    renderHomeTab();
  });

  function confirmDeleteMeal(meal) {
    const profile = store.getActiveProfile();
    if (confirm(`Excluir a refeição "${meal.name}"?`)) {
      profile.meals = profile.meals.filter(m => m.id !== meal.id);
      store.save();
      renderDietTab();
      renderHomeTab();
      showToast('Refeição removida.', 'success');
    }
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
    showToast('Backup dos perfis exportado com sucesso! 📥', 'success');
  };

  document.getElementById('input-backup-file').onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed && (parsed.profiles || parsed.routines)) {
          if (parsed.profiles) {
            store.state = parsed;
          } else {
            store.state = {
              activeProfileId: 'p-1',
              profiles: [Object.assign(createDefaultProfile('p-1', 'Principal'), parsed)]
            };
          }
          store.save();
          renderAll();
          showToast('Backup restaurado com sucesso! 🎉', 'success');
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

  document.getElementById('btn-clear-all-data').onclick = () => {
    if (confirm('Tem certeza de que deseja apagar os treinos deste perfil e começar do zero?')) {
      const profile = store.getActiveProfile();
      profile.routines = [{ id: 'routine-new', name: 'Meu Treino A', focus: 'Personalizado', exercises: [] }];
      profile.activeRoutineId = 'routine-new';
      profile.meals = [];
      store.save();
      renderAll();
      showToast('Dados limpos! Monte do seu jeito. 🚀', 'success');
    }
  };

  // Modais Fechar
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
    }, 2800);
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
    renderHeader();
    renderHomeTab();
    renderWorkoutsTab();
    renderDietTab();
  }

  function init() {
    initNav();
    initCatalog();
    initTacoPicker();
    initProfiles();
    initWater();

    document.getElementById('btn-start-session').onclick = toggleSession;
    document.getElementById('btn-add-meal').onclick = openAddMealModal;

    document.querySelectorAll('.chip-timer[data-sec]').forEach(chip => {
      chip.onclick = () => startRestTimer(parseInt(chip.getAttribute('data-sec'), 10));
    });
    document.getElementById('btn-stop-rest').onclick = stopRestTimer;

    renderAll();

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
      });
    }
  }

  document.addEventListener('DOMContentLoaded', init);

})();
