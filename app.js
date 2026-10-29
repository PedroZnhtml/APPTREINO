/**
 * IronPulse - Core Application Engine
 * Autenticação Multi-usuário, Tabela TACO, Treinos/Dieta Zerados e Comparador
 */

(function () {
  'use strict';

  function getTodayKey() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // Obter usuário logado atual
  function getCurrentUser() {
    return window.IronAuth.getCurrentUser();
  }

  function saveCurrentUser() {
    const user = getCurrentUser();
    if (user) {
      window.IronAuth.saveCurrentUser(user);
    }
  }

  // Helper defensivo para atualizar texto sem risco de TypeError se o elemento não existir
  function setText(idOrEl, text) {
    const el = typeof idOrEl === 'string' ? document.getElementById(idOrEl) : idOrEl;
    if (el) el.textContent = text != null ? String(text) : '';
  }

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

  // ==================== CONTROLE DE SESSÃO & AUTH GATE ====================
  function checkAuth() {
    const user = getCurrentUser();
    const authView = document.getElementById('auth-view');
    const mainAppView = document.getElementById('main-app-view');

    updateCloudStatusUI();

    if (!user) {
      authView.style.display = 'flex';
      mainAppView.style.display = 'none';
      renderSavedAccountsList();
    } else {
      authView.style.display = 'none';
      mainAppView.style.display = 'block';
      renderAll();
    }
  }

  function renderSavedAccountsList() {
    const container = document.getElementById('saved-accounts-list');
    const section = document.getElementById('saved-accounts-section');
    const accounts = window.IronAuth.getExistingAccountsList();

    if (accounts.length === 0) {
      section.style.display = 'none';
      return;
    }

    section.style.display = 'block';
    container.innerHTML = '';

    accounts.forEach(acc => {
      const chip = document.createElement('div');
      chip.className = 'saved-account-chip';
      chip.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <div class="user-avatar-badge" style="width: 32px; height: 32px; font-size: 0.85rem;">
            ${(acc.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <strong style="font-size: 0.9rem;">${escapeHtml(acc.name)}</strong>
            <span style="display: block; font-size: 0.72rem; color: var(--text-muted);">${escapeHtml(acc.email)}</span>
          </div>
        </div>
        <span class="tag tag-accent" style="font-size: 0.65rem;">Selecionar</span>
      `;

      chip.onclick = () => {
        document.getElementById('login-email').value = acc.email;
        document.getElementById('login-password').focus();
        showToast(`Conta "${acc.name}" selecionada! Digite sua senha.`, 'success');
      };

      container.appendChild(chip);
    });
  }

  // Modal Customizado de Confirmação (Substitui confirm do navegador sem mensagens como "github.io diz")
  function showConfirmModal({ title = 'Você deseja sair?', message = 'Seus dados permanecem seguros na nuvem.', okText = 'Sim, Sair', okClass = 'btn-danger', icon = null } = {}) {
    return new Promise((resolve) => {
      const modal = document.getElementById('modal-confirm-action');
      const titleEl = document.getElementById('confirm-modal-title');
      const msgEl = document.getElementById('confirm-modal-message');
      const iconEl = document.getElementById('confirm-modal-icon');
      const okBtn = document.getElementById('btn-confirm-ok');
      const cancelBtn = document.getElementById('btn-confirm-cancel');

      if (titleEl) setText(titleEl, title);
      if (msgEl) setText(msgEl, message);
      if (iconEl) {
        if (icon) {
          iconEl.innerHTML = icon;
        } else {
          iconEl.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
        }
      }
      if (okBtn) {
        setText(okBtn, okText);
        okBtn.className = `btn ${okClass}`;
      }

      const cleanup = () => {
        if (modal) modal.classList.remove('open');
        if (okBtn) okBtn.onclick = null;
        if (cancelBtn) cancelBtn.onclick = null;
      };

      if (okBtn) {
        okBtn.onclick = () => {
          cleanup();
          resolve(true);
        };
      }

      if (cancelBtn) {
        cancelBtn.onclick = () => {
          cleanup();
          resolve(false);
        };
      }

      if (modal) modal.classList.add('open');
    });
  }

  function initAuthEvents() {
    // Alternar abas de Login e Cadastro
    const btnLogin = document.getElementById('tab-btn-login');
    const btnReg = document.getElementById('tab-btn-register');
    const formLogin = document.getElementById('form-auth-login');
    const formReg = document.getElementById('form-auth-register');

    btnLogin.onclick = () => {
      btnLogin.classList.add('active');
      btnReg.classList.remove('active');
      formLogin.classList.add('active');
      formReg.classList.remove('active');
    };

    btnReg.onclick = () => {
      btnReg.classList.add('active');
      btnLogin.classList.remove('active');
      formReg.classList.add('active');
      formLogin.classList.remove('active');
    };

    // Submissão Login
    formLogin.onsubmit = async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const pass = document.getElementById('login-password').value;

      try {
        await window.IronAuth.login(email, pass);
        formLogin.reset();
        showToast('Login realizado com sucesso! Bem-vindo(a). ⚡', 'success');
        checkAuth();
      } catch (err) {
        showToast(err.message, 'error');
      }
    };

    // Submissão Registro
    formReg.onsubmit = async (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value;
      const email = document.getElementById('reg-email').value;
      const pass = document.getElementById('reg-password').value;
      const weight = parseFloat(document.getElementById('reg-weight').value) || 70;
      const height = parseInt(document.getElementById('reg-height').value, 10) || 175;
      const goal = document.getElementById('reg-goal').value;

      try {
        await window.IronAuth.register(name, email, pass, weight, height, goal);
        formReg.reset();
        showToast('Conta criada com sucesso! Treinos e dieta zerados para você começar.', 'success');
        checkAuth();
      } catch (err) {
        showToast(err.message, 'error');
      }
    };

    // Logout Customizado (Sem pop-up do navegador)
    const btnHeaderLogout = document.getElementById('btn-header-logout');
    if (btnHeaderLogout) {
      btnHeaderLogout.onclick = async () => {
        const ok = await showConfirmModal({
          title: 'Você deseja sair?',
          message: 'Seus dados permanecem seguros e sincronizados em tempo real.',
          okText: 'Sim, Sair',
          icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>'
        });
        if (ok) {
          window.IronAuth.logout();
          checkAuth();
          showToast('Você saiu da conta.', 'success');
        }
      };
    }

    const btnAccountLogout = document.getElementById('btn-account-logout');
    if (btnAccountLogout) {
      btnAccountLogout.onclick = async () => {
        const ok = await showConfirmModal({
          title: 'Trocar de Usuário?',
          message: 'Deseja sair desta conta para entrar com outro perfil?',
          okText: 'Sair e Trocar',
          icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'
        });
        if (ok) {
          window.IronAuth.logout();
          checkAuth();
          showToast('Você saiu da conta.', 'success');
        }
      };
    }
  }

  // ==================== CONFIGURAÇÃO DO BANCO EM NUVEM ====================
  function updateCloudStatusUI() {
    const isConn = window.CloudDB && window.CloudDB.isConnected();
    const dot = document.getElementById('auth-cloud-status-dot');
    const title = document.getElementById('auth-cloud-status-title');
    const sub = document.getElementById('auth-cloud-status-sub');
    const tag = document.getElementById('auth-cloud-tag');
    const headerCloudBtn = document.getElementById('btn-header-cloud');

    if (dot && title && sub && tag) {
      if (isConn) {
        dot.style.background = 'var(--accent)';
        dot.style.boxShadow = '0 0 8px var(--accent)';
        setText(title, 'Banco de Dados Conectado');
        setText(sub, 'Sincronizado entre navegadores e celular');
        setText(tag, 'Conectado');
        tag.className = 'tag tag-accent';
      } else {
        dot.style.background = '#888';
        dot.style.boxShadow = 'none';
        setText(title, 'Banco de Dados (Multi-aparelho)');
        setText(sub, 'Toque aqui para conectar e sincronizar');
        setText(tag, 'Configurar');
        tag.className = 'tag tag-outline';
      }
    }

    if (headerCloudBtn) {
      headerCloudBtn.title = isConn ? 'Banco Conectado' : 'Configurar Banco';
      headerCloudBtn.style.opacity = isConn ? '1' : '0.6';
    }
  }

  function initCloudDbEvents() {
    updateCloudStatusUI();

    const openBtns = [
      document.getElementById('btn-auth-open-cloud-modal'),
      document.getElementById('btn-header-cloud'),
      document.getElementById('btn-open-cloud-settings')
    ];

    const modal = document.getElementById('modal-cloud-config');
    const urlInput = document.getElementById('input-cloud-url');
    const form = document.getElementById('form-cloud-config');
    const btnTest = document.getElementById('btn-test-cloud-connection');
    const statusBox = document.getElementById('cloud-test-status');

    openBtns.forEach(btn => {
      if (!btn) return;
      btn.onclick = () => {
        if (urlInput) {
          if (window.CloudDB && window.CloudDB.config && window.CloudDB.config.url) {
            urlInput.value = window.CloudDB.config.url;
          } else if (window.IRONPULSE_CLOUD_URL) {
            urlInput.value = window.IRONPULSE_CLOUD_URL;
          }
        }
        if (statusBox) statusBox.style.display = 'none';
        if (modal) modal.classList.add('open');
      };
    });

    if (btnTest) {
      btnTest.onclick = async () => {
        const url = urlInput ? urlInput.value.trim() : '';
        if (!url) {
          showToast('Informe a URL do Firebase Realtime Database.', 'error');
          return;
        }
        if (statusBox) {
          statusBox.style.display = 'block';
          statusBox.innerHTML = '<span style="color: var(--accent-light);">Testando conexão com o banco...</span>';
        }
        try {
          const res = await window.CloudDB.testConnection(url);
          if (statusBox) statusBox.innerHTML = `<span style="color: var(--accent); font-weight: 700;">${res.message}</span>`;
          showToast('Conexão testada com sucesso!', 'success');
        } catch (err) {
          if (statusBox) statusBox.innerHTML = `<span style="color: var(--danger); font-weight: 700;">${err.message}</span>`;
          showToast(err.message, 'error');
        }
      };
    }

    if (form) {
      form.onsubmit = async (e) => {
        e.preventDefault();
        const url = urlInput ? urlInput.value.trim() : '';
        if (!url) {
          showToast('Informe uma URL válida.', 'error');
          return;
        }

        try {
          window.CloudDB.saveConfig({ type: 'firebase', url: url, apiKey: '' });
          updateCloudStatusUI();

          const currentUser = getCurrentUser();
          if (currentUser) {
            await window.CloudDB.saveUser(currentUser);
          }

          if (modal) modal.classList.remove('open');
          showToast('Banco de dados salvo e conectado com sucesso!', 'success');
        } catch (err) {
          showToast('Erro ao salvar conexão: ' + err.message, 'error');
        }
      };
    }
  }

  // ==================== WAKE LOCK & CRONÔMETRO ====================
  let wakeLock = null;
  let sessionTimer = null;
  let sessionSeconds = 0;
  let isSessionRunning = false;

  async function activateWakeLock() {
    const pill = document.getElementById('wakelock-pill');
    if (!pill) return;
    if ('wakeLock' in navigator) {
      try {
        wakeLock = await navigator.wakeLock.request('screen');
        pill.classList.add('active');
        setText(pill.querySelector('.wakelock-text'), 'Tela Ligada');
        wakeLock.addEventListener('release', () => {
          pill.classList.remove('active');
          setText(pill.querySelector('.wakelock-text'), 'Tela Normal');
        });
      } catch (err) {
        setText(pill.querySelector('.wakelock-text'), 'Sem suporte');
      }
    }
  }

  function deactivateWakeLock() {
    if (wakeLock) {
      wakeLock.release().catch(() => {});
      wakeLock = null;
    }
    const pill = document.getElementById('wakelock-pill');
    if (pill) {
      pill.classList.remove('active');
      setText(pill.querySelector('.wakelock-text'), 'Tela Normal');
    }
  }

  function toggleSession() {
    const user = getCurrentUser();
    if (!user || !user.routines || user.routines.length === 0) {
      showToast('Crie uma ficha de treino primeiro antes de iniciar o treino.', 'error');
      return;
    }

    const btn = document.getElementById('btn-start-session');

    if (!isSessionRunning) {
      isSessionRunning = true;
      setText('session-icon', '⏹');
      setText('session-text', 'Finalizar');
      if (btn) btn.style.backgroundColor = 'var(--danger)';
      activateWakeLock();

      sessionTimer = setInterval(() => {
        sessionSeconds++;
        const m = String(Math.floor(sessionSeconds / 60)).padStart(2, '0');
        const s = String(sessionSeconds % 60).padStart(2, '0');
        setText('session-stopwatch', `${m}:${s}`);
      }, 1000);

      showToast('Sessão iniciada! Tela mantida acesa.', 'success');
    } else {
      isSessionRunning = false;
      setText('session-icon', '▶');
      setText('session-text', 'Iniciar Treino');
      if (btn) btn.style.backgroundColor = 'var(--accent)';
      clearInterval(sessionTimer);
      deactivateWakeLock();

      const today = getTodayKey();
      if (!user.workoutLogs) user.workoutLogs = {};
      user.workoutLogs[today] = true;

      const activeRoutine = user.routines.find(r => r.id === user.activeRoutineId);
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

      saveCurrentUser();
      renderAll();
      showToast(`Treino concluído! Duração: ${Math.floor(sessionSeconds / 60)} min.`, 'success');

      sessionSeconds = 0;
      setText('session-stopwatch', '00:00');
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

    function update() {
      const m = Math.floor(restSecondsLeft / 60);
      const s = restSecondsLeft % 60;
      setText('rest-timer-text', `${m > 0 ? `${m}m ` : ''}${s}s`);
      if (restSecondsLeft <= 0) {
        clearInterval(restTimer);
        restTimer = null;
        setText('rest-timer-text', 'Descanso Finalizado');
        playAlertBeep();
        showToast('Hora da próxima série! Prepare-se.', 'success');
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
    setText('rest-timer-text', 'Parado');
  }

  // ==================== NAVEGAÇÃO ====================
  function initNav() {
    document.querySelectorAll('.bottom-bar .bar-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        switchTab(targetTab);
      });
    });

    const btnManageWorkouts = document.getElementById('btn-home-manage-workouts');
    if (btnManageWorkouts) btnManageWorkouts.onclick = () => switchTab('tab-workouts');

    const btnGoDiet = document.getElementById('btn-home-go-diet');
    if (btnGoDiet) btnGoDiet.onclick = () => switchTab('tab-diet');

    // Sub-abas Progresso
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

  function renderHeader() {
    const user = getCurrentUser();
    if (!user) return;

    const initials = (user.name || 'U').charAt(0).toUpperCase();
    setText('header-avatar-circle', initials);
    setText('header-profile-name', user.name || 'Atleta');
    setText('header-profile-goal', user.goal || 'Hipertrofia');
    setText('header-user-email', user.email || '');

    const syncDot = document.getElementById('header-sync-dot');
    const isCloud = window.CloudDB && window.CloudDB.isConnected();
    if (syncDot) {
      syncDot.style.background = isCloud ? 'var(--accent)' : 'var(--cyan)';
      syncDot.style.boxShadow = isCloud ? '0 0 8px var(--accent)' : 'none';
    }
    setText('header-sync-text', isCloud ? 'Firebase Conectado' : 'Local');

    const minWater = Math.round((Number(user.weight) || 70) * 35);
    setText('water-display', user.water || 0);
    setText('water-calc-desc', `Mínimo recomendado: 35ml × ${user.weight || 70}kg = ${minWater}ml`);
    setText('water-current-total', user.water || 0);
    setText('water-target-total', minWater);

    const pct = minWater > 0 ? Math.min(100, Math.round(((user.water || 0) / minWater) * 100)) : 0;
    const waterFill = document.getElementById('water-progress-fill');
    if (waterFill) waterFill.style.width = `${pct}%`;

    setText('water-percent-badge', `${pct}%`);
    setText('home-water-ratio', `${pct}%`);
  }

  // 1. Início
  function renderHomeTab() {
    renderHeader();
    const user = getCurrentUser();
    if (!user) return;

    setText('home-goal-badge', user.goal || 'Hipertrofia');

    const btnHomeAddRoutine = document.getElementById('btn-home-add-routine');
    if (btnHomeAddRoutine) {
      btnHomeAddRoutine.onclick = () => {
        switchTab('tab-workouts');
        openNewRoutineModal();
      };
    }

    const homeWorkoutBox = document.getElementById('home-workout-box');

    // Se treinos estão zerados
    if (!user.routines || user.routines.length === 0) {
      homeWorkoutBox.innerHTML = `
        <div class="empty-state-luxury">
          <div class="empty-state-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 5v14M18 5v14M3 8v8M21 8v8M6 12h12"/></svg>
          </div>
          <h4>Nenhum treino criado</h4>
          <p>Monte suas divisões de treino personalizadas (Treino A, B, C...).</p>
          <button class="btn btn-primary btn-sm" id="btn-home-create-workout">+ Adicionar Treino Agora</button>
        </div>
      `;
      document.getElementById('btn-home-create-workout').onclick = () => {
        switchTab('tab-workouts');
        openNewRoutineModal();
      };
    } else {
      const routine = user.routines.find(r => r.id === user.activeRoutineId) || user.routines[0];
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
    }

    // Próxima Refeição
    const mealBox = document.getElementById('home-meal-box');

    // Se dieta está zerada
    if (!user.meals || user.meals.length === 0) {
      mealBox.innerHTML = `
        <div class="empty-state-luxury">
          <div class="empty-state-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8zM6 1v3M10 1v3M14 1v3"/></svg>
          </div>
          <h4>Nenhuma refeição cadastrada</h4>
          <p>Adicione refeições e use a tabela de alimentos para calcular seus macros.</p>
          <button class="btn btn-primary btn-sm" id="btn-home-create-meal">+ Cadastrar Refeição</button>
        </div>
      `;
      document.getElementById('btn-home-create-meal').onclick = () => {
        switchTab('tab-diet');
        openAddMealModal();
      };
    } else {
      const nextMeal = user.meals.find(m => !m.done) || user.meals[0];
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
          <span><strong>${totals.kcal}</strong> kcal</span>
          <span style="color: var(--macro-p);"><strong>${totals.protein}g</strong> P</span>
          <span style="color: var(--macro-c);"><strong>${totals.carbs}g</strong> C</span>
          <span style="color: var(--macro-f);"><strong>${totals.fat}g</strong> G</span>
        </div>
      `;

      document.getElementById('btn-check-home-meal').onclick = () => {
        nextMeal.done = !nextMeal.done;
        saveCurrentUser();
        renderAll();
      };
    }

    // Calorias de Hoje
    let eatenKcal = 0;
    if (user.meals) {
      user.meals.forEach(m => {
        if (m.done) {
          const t = getMealTotals(m);
          eatenKcal += t.kcal;
        }
      });
    }

    setText('home-kcal-val', eatenKcal);
    setText('home-target-kcal-val', user.targetKcal || 2400);

    renderWeekStrip();
  }

  function renderWeekStrip() {
    const container = document.getElementById('home-week-strip');
    if (!container) return;
    container.innerHTML = '';
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    let workoutsCount = 0;
    const user = getCurrentUser();

    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const k = d.toISOString().split('T')[0];
      const isToday = i === 0;
      const done = Boolean(user.workoutLogs && user.workoutLogs[k]);
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
    setText('home-week-workouts-count', `${workoutsCount}/7`);
  }

  // 2. Treinos (ZERADOS POR PADRÃO)
  function renderWorkoutsTab() {
    const user = getCurrentUser();
    if (!user) return;

    const bar = document.getElementById('workout-tabs-bar');
    bar.innerHTML = '';

    const headerCard = document.getElementById('workout-header-card');
    const bottomActions = document.getElementById('workout-bottom-actions');
    const stack = document.getElementById('exercises-stack');
    const countLabel = document.getElementById('workouts-count-label');
    const sessionHud = document.getElementById('session-hud');
    const restTimerBar = document.getElementById('rest-timer-bar');
    const btnAddExTop = document.getElementById('btn-add-exercise-top');
    const btnAddRoutineTop = document.getElementById('btn-add-routine-top');
    const navBar = document.querySelector('.workouts-nav-bar');

    // Se ZERADO: Exibe apenas 1 opção clara de criação no centro
    if (!user.routines || user.routines.length === 0) {
      setText('workouts-count-label', 'Nenhuma ficha criada ainda');
      if (btnAddRoutineTop) btnAddRoutineTop.style.display = 'none';
      if (navBar) navBar.style.display = 'none';
      if (sessionHud) sessionHud.style.display = 'none';
      if (restTimerBar) restTimerBar.style.display = 'none';
      if (headerCard) headerCard.style.display = 'none';
      if (bottomActions) bottomActions.style.display = 'none';
      bar.innerHTML = '';

      if (stack) {
        stack.innerHTML = `
          <div class="empty-state-luxury" style="margin-top: 14px; padding: 32px 20px;">
            <h4 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 6px;">Nenhum Treino Cadastrado</h4>
            <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.5; margin-bottom: 20px;">
              Monte suas divisões de treino (Treino A, B, C...) e adicione seus exercícios com cargas e séries personalizadas.
            </p>
            <button class="btn btn-primary btn-block btn-lg" id="btn-create-first-routine">
              + Criar Ficha de Treino
            </button>
          </div>
        `;
        const btnCreateFirst = document.getElementById('btn-create-first-routine');
        if (btnCreateFirst) btnCreateFirst.onclick = openNewRoutineModal;
      }
      return;
    }

    // Se tem fichas
    if (btnAddRoutineTop) btnAddRoutineTop.style.display = 'inline-flex';
    if (navBar) navBar.style.display = 'block';
    setText('workouts-count-label', `${user.routines.length} ${user.routines.length === 1 ? 'ficha cadastrada' : 'fichas cadastradas'}`);
    if (sessionHud) sessionHud.style.display = 'flex';
    if (restTimerBar) restTimerBar.style.display = 'flex';
    if (headerCard) headerCard.style.display = 'flex';
    if (bottomActions) bottomActions.style.display = 'block';

    if (btnAddExTop) {
      btnAddExTop.onclick = () => {
        const btnCat = document.getElementById('btn-open-catalog');
        if (btnCat) btnCat.click();
      };
    }

    let activeRoutine = user.routines.find(r => r.id === user.activeRoutineId);
    if (!activeRoutine && user.routines.length > 0) {
      activeRoutine = user.routines[0];
      user.activeRoutineId = activeRoutine.id;
    }

    user.routines.forEach(r => {
      const pill = document.createElement('button');
      pill.className = `routine-tab-pill ${r.id === user.activeRoutineId ? 'active' : ''}`;
      pill.textContent = r.name;
      pill.onclick = () => {
        user.activeRoutineId = r.id;
        saveCurrentUser();
        renderWorkoutsTab();
        renderHomeTab();
      };
      bar.appendChild(pill);
    });

    if (!activeRoutine) return;

    setText('active-routine-name', activeRoutine.name);
    setText('active-routine-focus', activeRoutine.focus);

    const btnEditR = document.getElementById('btn-edit-routine');
    if (btnEditR) btnEditR.onclick = () => openEditRoutineModal(activeRoutine);
    const btnDelR = document.getElementById('btn-delete-routine');
    if (btnDelR) btnDelR.onclick = () => confirmDeleteRoutine(activeRoutine);

    stack.innerHTML = '';

    if (!activeRoutine.exercises || activeRoutine.exercises.length === 0) {
      stack.innerHTML = `
        <div class="empty-state-luxury" style="padding: 24px 16px;">
          <p class="text-muted mb-2">Esta ficha não tem exercícios cadastrados ainda.</p>
          <button class="btn btn-primary btn-sm" id="btn-empty-add-ex">+ Adicionar Primeiro Exercício</button>
        </div>
      `;
      document.getElementById('btn-empty-add-ex').onclick = () => {
        document.getElementById('btn-open-catalog').click();
      };
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
            <button class="btn-tool btn-history-ex" title="Ver evolução">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            </button>
            <button class="btn-tool btn-edit-notes" title="Editar anotações">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="btn-tool text-danger btn-del-ex" title="Excluir exercício">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
        ${ex.notes ? `<div class="exercise-notes-text"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-1px; margin-right:4px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>${escapeHtml(ex.notes)}</div>` : ''}

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
          saveCurrentUser();
        };

        repsInput.onchange = () => {
          set.reps = parseInt(repsInput.value, 10) || 0;
          saveCurrentUser();
        };

        checkBtn.onclick = () => {
          set.completed = !set.completed;
          set.weight = parseFloat(weightInput.value) || set.weight || 0;
          set.reps = parseInt(repsInput.value, 10) || set.reps || 0;
          saveCurrentUser();
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
        saveCurrentUser();
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
    saveCurrentUser();
    renderWorkoutsTab();
  }

  async function confirmDeleteExercise(routine, ex) {
    const ok = await showConfirmModal({
      title: 'Remover Exercício?',
      message: `Deseja remover "${ex.name}" da ficha "${routine.name}"?`,
      okText: 'Remover',
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>'
    });
    if (!ok) return;
    routine.exercises = routine.exercises.filter(item => item.id !== ex.id);
    saveCurrentUser();
    renderWorkoutsTab();
    renderHomeTab();
    showToast('Exercício removido.', 'success');
  }

  // 3. Dieta (ZERADA POR PADRÃO)
  function renderDietTab() {
    renderHeader();
    const user = getCurrentUser();
    if (!user) return;

    let sumKcal = 0, sumP = 0, sumC = 0, sumF = 0;
    if (user.meals) {
      user.meals.forEach(m => {
        if (m.done) {
          const t = getMealTotals(m);
          sumKcal += t.kcal;
          sumP += t.protein;
          sumC += t.carbs;
          sumF += t.fat;
        }
      });
    }

    const targetKcal = user.targetKcal || 2400;
    const targetP = user.targetProtein || 160;
    const targetC = user.targetCarbs || 260;
    const targetF = user.targetFat || 65;

    setText('diet-consumed-kcal', sumKcal);
    setText('diet-goal-kcal', targetKcal);
    setText('diet-remaining-kcal', Math.max(0, targetKcal - sumKcal));
    const kFill = document.getElementById('diet-kcal-progress');
    if (kFill) kFill.style.width = `${Math.min(100, Math.round((sumKcal / targetKcal) * 100))}%`;

    setText('diet-consumed-p', Math.round(sumP));
    setText('diet-goal-p', targetP);
    const pFill = document.getElementById('diet-p-progress');
    if (pFill) pFill.style.width = `${Math.min(100, Math.round((sumP / targetP) * 100))}%`;

    setText('diet-consumed-c', Math.round(sumC));
    setText('diet-goal-c', targetC);
    const cFill = document.getElementById('diet-c-progress');
    if (cFill) cFill.style.width = `${Math.min(100, Math.round((sumC / targetC) * 100))}%`;

    setText('diet-consumed-f', Math.round(sumF));
    setText('diet-goal-f', targetF);
    const fFill = document.getElementById('diet-f-progress');
    if (fFill) fFill.style.width = `${Math.min(100, Math.round((sumF / targetF) * 100))}%`;

    const stack = document.getElementById('meals-stack');
    stack.innerHTML = '';

    // Se ZERADA
    if (!user.meals || user.meals.length === 0) {
      stack.innerHTML = `
        <div class="empty-state-luxury" style="padding: 32px 20px;">
          <h4 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 6px;">Sua Dieta Está Zerada</h4>
          <p style="color: var(--text-muted); font-size: 0.9rem; line-height: 1.5; margin-bottom: 20px;">
            Cadastre suas refeições diárias e adicione alimentos com cálculo automático de gramas e macros.
          </p>
          <button class="btn btn-primary btn-block btn-lg" id="btn-create-first-meal">
            + Cadastrar Primeira Refeição
          </button>
        </div>
      `;
      document.getElementById('btn-create-first-meal').onclick = openAddMealModal;
      return;
    }

    const sortedMeals = [...user.meals].sort((a, b) => (a.time || '').localeCompare(b.time || ''));

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
        itemsHtml = '<p class="text-xs text-muted" style="padding: 4px 0;">Nenhum alimento adicionado. Use o botão abaixo.</p>';
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
          + Adicionar Alimento
        </button>

        <div class="meal-macros-chips">
          <span><strong>${totals.kcal}</strong> kcal</span>
          <span style="color: var(--macro-p);"><strong>${totals.protein}g</strong> P</span>
          <span style="color: var(--macro-c);"><strong>${totals.carbs}g</strong> C</span>
          <span style="color: var(--macro-f);"><strong>${totals.fat}g</strong> G</span>
        </div>

        <div style="display: flex; justify-content: flex-end; gap: 6px; margin-top: 10px; border-top: 1px solid var(--border-subtle); padding-top: 8px;">
          <button class="btn-tool btn-edit-meal" title="Editar Nome/Horário">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-tool text-danger btn-del-meal" title="Excluir Refeição">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      `;

      card.querySelector('.btn-check-set').onclick = () => {
        meal.done = !meal.done;
        saveCurrentUser();
        renderDietTab();
        renderHomeTab();
      };

      card.querySelectorAll('.btn-del-food-item').forEach(delBtn => {
        delBtn.onclick = () => {
          const idx = parseInt(delBtn.getAttribute('data-item-idx'), 10);
          meal.items.splice(idx, 1);
          saveCurrentUser();
          renderDietTab();
          renderHomeTab();
        };
      });

      card.querySelector('.btn-add-food-to-meal').onclick = () => {
        openTacoPickerForMeal(meal);
      };

      card.querySelector('.btn-edit-meal').onclick = () => openEditMealModal(meal);
      card.querySelector('.btn-del-meal').onclick = () => confirmDeleteMeal(meal);

      stack.appendChild(card);
    });
  }

  // ==================== TABELA TACO (PICKER & CÁLCULO) ====================
  let currentTargetMeal = null;
  let currentSelectedTacoFood = null;

  function initTacoPicker() {
    const searchInput = document.getElementById('taco-search-input');
    const gramInput = document.getElementById('taco-grams-input');

    searchInput.addEventListener('input', () => filterTacoList());
    gramInput.addEventListener('input', () => calculateLiveTacoMacros());

    document.getElementById('btn-confirm-add-taco').onclick = () => {
      if (!currentSelectedTacoFood) {
        showToast('Selecione um alimento da lista primeiro.', 'error');
        return;
      }

      const user = getCurrentUser();
      let targetMeal = currentTargetMeal;

      if (!targetMeal) {
        if (user && user.meals && user.meals.length > 0) {
          const selId = document.getElementById('taco-select-meal').value;
          targetMeal = user.meals.find(m => m.id === selId) || user.meals[0];
        } else {
          document.getElementById('modal-taco-picker').classList.remove('open');
          openAddMealModal();
          showToast('Cadastre sua primeira refeição para adicionar alimentos!', 'info');
          return;
        }
      }

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

      if (!targetMeal.items) targetMeal.items = [];
      targetMeal.items.push(newItem);

      saveCurrentUser();
      document.getElementById('modal-taco-picker').classList.remove('open');
      renderDietTab();
      renderHomeTab();
      showToast(`${grams}g de ${newItem.name} adicionados à "${targetMeal.name}".`, 'success');
    };
  }

  function openTacoPickerForMeal(meal) {
    currentTargetMeal = meal;
    currentSelectedTacoFood = null;
    document.getElementById('taco-calc-box').style.display = 'none';
    document.getElementById('taco-search-input').value = '';

    const selectGroup = document.getElementById('taco-meal-picker-select-group');
    const selectEl = document.getElementById('taco-select-meal');
    const confirmBtn = document.getElementById('btn-confirm-add-taco');
    const user = getCurrentUser();

    if (meal) {
      if (selectGroup) selectGroup.style.display = 'none';
      if (confirmBtn) confirmBtn.textContent = `+ Adicionar à ${meal.name}`;
    } else {
      if (user && user.meals && user.meals.length > 0) {
        if (selectEl) {
          selectEl.innerHTML = '';
          user.meals.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.id;
            opt.textContent = `${m.name} (${m.time})`;
            selectEl.appendChild(opt);
          });
        }
        if (selectGroup) selectGroup.style.display = 'block';
        if (confirmBtn) confirmBtn.textContent = '+ Adicionar à Refeição Selecionada';
      } else {
        if (selectGroup) selectGroup.style.display = 'none';
        if (confirmBtn) confirmBtn.textContent = '+ Criar Refeição com este Alimento';
      }
    }

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
      container.innerHTML = '<p class="text-muted text-center" style="padding: 16px;">Nenhum alimento encontrado na tabela de alimentos.</p>';
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

      itemRow.onclick = () => selectTacoFood(food);
      container.appendChild(itemRow);
    });
  }

  function selectTacoFood(food) {
    currentSelectedTacoFood = food;
    setText('taco-calc-food-name', food.name);
    setText('taco-calc-category', food.category);
    const calcBox = document.getElementById('taco-calc-box');
    if (calcBox) calcBox.style.display = 'block';
    calculateLiveTacoMacros();
  }

  function calculateLiveTacoMacros() {
    if (!currentSelectedTacoFood) return;
    const gramsInput = document.getElementById('taco-grams-input');
    const grams = parseFloat(gramsInput ? gramsInput.value : 0) || 0;
    const factor = grams / 100;

    const kcal = Math.round(currentSelectedTacoFood.kcal * factor);
    const p = Math.round((currentSelectedTacoFood.protein * factor) * 10) / 10;
    const c = Math.round((currentSelectedTacoFood.carbs * factor) * 10) / 10;
    const f = Math.round((currentSelectedTacoFood.fat * factor) * 10) / 10;

    setText('taco-res-kcal', `${kcal} kcal`);
    setText('taco-res-p', `${p}g`);
    setText('taco-res-c', `${c}g`);
    setText('taco-res-f', `${f}g`);
  }

  // ==================== GALERIA DE FOTOS & COMPARADOR ====================
  let selectedPhotosToCompare = [];

  async function renderPhotosGallery() {
    const user = getCurrentUser();
    if (!user) return;

    const grid = document.getElementById('photos-grid');
    if (!grid) return;
    grid.innerHTML = '<p class="text-muted text-center" style="grid-column: 1/-1;">Carregando fotos...</p>';

    try {
      const photos = await window.IronDB.getPhotosByProfile(user.id);
      setText('photos-count-badge', `${photos.length} fotos`);
      grid.innerHTML = '';

      if (photos.length === 0) {
        grid.innerHTML = `
          <div class="empty-state-luxury" style="grid-column: 1/-1;">
            <div class="empty-state-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </div>
            <h4>Nenhuma foto registrada</h4>
            <p>Tire fotos de frente, lado ou costas para ver sua evolução corporal ao longo dos meses.</p>
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
            <button class="btn-del-photo" title="Excluir foto">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        `;

        card.querySelector('.btn-compare-select').onclick = () => togglePhotoComparison(photo);

        card.querySelector('.btn-del-photo').onclick = async () => {
          const ok = await showConfirmModal({
            title: 'Excluir Foto?',
            message: 'Esta foto de evolução será apagada permanentemente.',
            okText: 'Excluir Foto',
            icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>'
          });
          if (ok) {
            await window.IronDB.deletePhoto(photo.id);
            selectedPhotosToCompare = selectedPhotosToCompare.filter(p => p.id !== photo.id);
            renderPhotosGallery();
            showToast('Foto excluída.', 'success');
          }
        };

        grid.appendChild(card);
      });
    } catch (e) {
      console.error(e);
      grid.innerHTML = '<p class="text-danger text-center" style="grid-column: 1/-1;">Erro ao carregar fotos.</p>';
    }
  }

  function togglePhotoComparison(photo) {
    const idx = selectedPhotosToCompare.findIndex(p => p.id === photo.id);
    if (idx >= 0) {
      selectedPhotosToCompare.splice(idx, 1);
    } else {
      if (selectedPhotosToCompare.length >= 2) {
        selectedPhotosToCompare.shift();
      }
      selectedPhotosToCompare.push(photo);
    }

    updateComparatorCard();
    renderPhotosGallery();
  }

  function updateComparatorCard() {
    const card = document.getElementById('comparator-card');
    if (selectedPhotosToCompare.length === 2) {
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

  const btnCloseComparator = document.getElementById('btn-close-comparator');
  if (btnCloseComparator) {
    btnCloseComparator.onclick = () => {
      selectedPhotosToCompare = [];
      updateComparatorCard();
      renderPhotosGallery();
    };
  }

  // Upload e Compressão de Foto (Câmera ou Galeria)
  let tempCompressedDataUrl = null;

  async function handlePhotoSelected(file) {
    if (!file) return;
    try {
      showToast('Otimizando foto...', 'info');
      tempCompressedDataUrl = await window.IronDB.compressImage(file, 1000, 0.82);

      const user = getCurrentUser();
      document.getElementById('preview-photo-img').src = tempCompressedDataUrl;
      document.getElementById('input-photo-date').value = getTodayKey();
      document.getElementById('input-photo-weight').value = (user && user.weight) || '';

      document.getElementById('modal-save-photo').classList.add('open');
    } catch (err) {
      console.error(err);
      showToast('Erro ao processar imagem!', 'error');
    }
  }

  const inputCam = document.getElementById('input-camera-photo');
  if (inputCam) {
    inputCam.addEventListener('change', (e) => {
      handlePhotoSelected(e.target.files[0]);
      e.target.value = '';
    });
  }

  const inputGal = document.getElementById('input-gallery-photo');
  if (inputGal) {
    inputGal.addEventListener('change', (e) => {
      handlePhotoSelected(e.target.files[0]);
      e.target.value = '';
    });
  }

  document.getElementById('form-save-photo').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!tempCompressedDataUrl) return;

    const user = getCurrentUser();
    const date = document.getElementById('input-photo-date').value;
    const weight = parseFloat(document.getElementById('input-photo-weight').value) || null;
    const pose = document.getElementById('select-photo-pose').value;

    const photoObj = {
      id: 'photo-' + Date.now(),
      profileId: user.id,
      date: date,
      weight: weight,
      pose: pose,
      dataUrl: tempCompressedDataUrl
    };

    await window.IronDB.savePhoto(photoObj);
    document.getElementById('modal-save-photo').classList.remove('open');
    renderPhotosGallery();
    showToast('Foto registrada com sucesso!', 'success');
  });

  // ==================== ÁGUA RÁPIDA ====================
  function initWater() {
    document.querySelectorAll('.btn-water-add').forEach(btn => {
      btn.onclick = () => {
        const amt = parseInt(btn.getAttribute('data-add'), 10);
        addWater(amt);
      };
    });

    document.getElementById('btn-quick-water').onclick = () => addWater(250);

    document.getElementById('btn-reset-water').onclick = async () => {
      const ok = await showConfirmModal({
        title: 'Zerar Contador de Água?',
        message: 'Deseja reiniciar a contagem de água consumida hoje?',
        okText: 'Zerar Água',
        icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>'
      });
      if (ok) {
        const u = getCurrentUser();
        u.water = 0;
        saveCurrentUser();
        renderHeader();
        showToast('Água zerada.', 'success');
      }
    };
  }

  function addWater(amt) {
    const user = getCurrentUser();
    if (!user) return;
    user.water = (user.water || 0) + amt;
    saveCurrentUser();
    renderHeader();
    showToast(`+${amt}ml de água registrados! Total: ${user.water}ml`, 'success');
  }

  // ==================== PERFIL DO ATLETA (MODAL) ====================
  function openAthleteProfileModal() {
    const user = getCurrentUser();
    if (!user) return;

    const initials = (user.name || 'U').charAt(0).toUpperCase();
    const avatarBig = document.getElementById('profile-big-avatar');
    if (avatarBig) avatarBig.textContent = initials;

    const dispName = document.getElementById('profile-display-name');
    if (dispName) dispName.textContent = user.name || 'Atleta';

    const dispEmail = document.getElementById('profile-display-email');
    if (dispEmail) dispEmail.textContent = user.email || '';

    const dispGoal = document.getElementById('profile-display-goal');
    if (dispGoal) dispGoal.textContent = user.goal || 'Hipertrofia';

    const inpName = document.getElementById('input-profile-name');
    if (inpName) inpName.value = user.name || '';

    const inpWeight = document.getElementById('input-profile-weight');
    if (inpWeight) inpWeight.value = user.weight || '';

    const inpHeight = document.getElementById('input-profile-height');
    if (inpHeight) inpHeight.value = user.height || '';

    const inpGoal = document.getElementById('input-profile-goal');
    if (inpGoal) inpGoal.value = user.goal || 'Hipertrofia';

    const inpKcal = document.getElementById('input-profile-kcal');
    if (inpKcal) inpKcal.value = user.targetKcal || 2400;

    const inpP = document.getElementById('input-profile-p');
    if (inpP) inpP.value = user.targetProtein || 160;

    const inpC = document.getElementById('input-profile-c');
    if (inpC) inpC.value = user.targetCarbs || 260;

    const inpF = document.getElementById('input-profile-f');
    if (inpF) inpF.value = user.targetFat || 65;

    document.getElementById('modal-profile').classList.add('open');
  }

  function initProfileEvents() {
    const btnUser = document.getElementById('btn-header-user');
    if (btnUser) {
      btnUser.onclick = openAthleteProfileModal;
    }

    const btnRecalc = document.getElementById('btn-recalc-profile-macros');
    if (btnRecalc) {
      btnRecalc.onclick = () => {
        const w = parseFloat(document.getElementById('input-profile-weight').value) || 70;
        const p = Math.round(w * 2.0);
        const f = Math.round(w * 0.8);
        const c = Math.round(w * 3.5);
        const kcal = Math.round((p * 4) + (c * 4) + (f * 9));

        document.getElementById('input-profile-p').value = p;
        document.getElementById('input-profile-f').value = f;
        document.getElementById('input-profile-c').value = c;
        document.getElementById('input-profile-kcal').value = kcal;
        showToast('Metas recalculadas pelo peso.', 'info');
      };
    }

    const formProfile = document.getElementById('form-athlete-profile');
    if (formProfile) {
      formProfile.onsubmit = (e) => {
        e.preventDefault();
        const user = getCurrentUser();
        if (!user) return;

        user.name = document.getElementById('input-profile-name').value.trim() || user.name;
        user.weight = parseFloat(document.getElementById('input-profile-weight').value) || user.weight;
        user.height = parseInt(document.getElementById('input-profile-height').value, 10) || user.height;
        user.goal = document.getElementById('input-profile-goal').value;
        user.targetKcal = parseInt(document.getElementById('input-profile-kcal').value, 10) || user.targetKcal;
        user.targetProtein = parseInt(document.getElementById('input-profile-p').value, 10) || user.targetProtein;
        user.targetCarbs = parseInt(document.getElementById('input-profile-c').value, 10) || user.targetCarbs;
        user.targetFat = parseInt(document.getElementById('input-profile-f').value, 10) || user.targetFat;

        saveCurrentUser();
        document.getElementById('modal-profile').classList.remove('open');
        renderAll();
        showToast('Perfil atualizado com sucesso!', 'success');
      };
    }

    const btnProfileLogout = document.getElementById('btn-profile-logout');
    if (btnProfileLogout) {
      btnProfileLogout.onclick = async () => {
        const ok = await showConfirmModal({
          title: 'Você deseja sair?',
          message: 'Seus dados permanecem seguros na nuvem.',
          okText: 'Sim, Sair',
          icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>'
        });
        if (ok) {
          document.getElementById('modal-profile').classList.remove('open');
          window.IronAuth.logout();
          checkAuth();
          showToast('Você saiu da conta.', 'success');
        }
      };
    }
  }

  // ==================== EVOLUÇÃO DE CARGAS ====================
  function renderProgressTab() {
    const user = getCurrentUser();
    if (!user) return;

    const select = document.getElementById('select-chart-ex');
    if (!select) return;
    select.innerHTML = '';

    const allExercises = [];
    if (user.routines) {
      user.routines.forEach(r => {
        if (r.exercises) r.exercises.forEach(ex => allExercises.push(ex));
      });
    }

    if (allExercises.length === 0) {
      select.innerHTML = '<option value="">Nenhum exercício nas suas fichas</option>';
      const chartContainer = document.getElementById('progress-chart-container');
      if (chartContainer) {
        chartContainer.innerHTML = '<p class="text-muted text-sm text-center" style="padding: 20px 0;">Adicione exercícios nas suas fichas para ver o gráfico de evolução.</p>';
      }
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
            <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.0" />
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
            <text x="${p.x}" y="${p.y - 8}" font-size="10" font-weight="700" fill="#3b82f6" text-anchor="middle">${p.weight}kg</text>
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
          <h4 style="font-size:0.95rem; font-weight:800;">${escapeHtml(ex.name)}</h4>
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
    const user = getCurrentUser();
    if (!user) return;
    const routine = user.routines.find(r => r.id === user.activeRoutineId);
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

    saveCurrentUser();
    renderWorkoutsTab();
    renderHomeTab();
    showToast(`"${name}" adicionado à ficha.`, 'success');
  }

  // Modais de Fichas
  function openNewRoutineModal() {
    switchTab('tab-workouts');
    setText('modal-routine-title', 'Montar Ficha de Treino');
    const inpId = document.getElementById('input-routine-id');
    if (inpId) inpId.value = '';
    const inpName = document.getElementById('input-routine-name');
    if (inpName) inpName.value = '';
    const inpFocus = document.getElementById('input-routine-focus');
    if (inpFocus) inpFocus.value = '';
    const modalR = document.getElementById('modal-routine');
    if (modalR) modalR.classList.add('open');
  }

  function openEditRoutineModal(routine) {
    setText('modal-routine-title', 'Editar Ficha');
    const inpId = document.getElementById('input-routine-id');
    if (inpId) inpId.value = routine.id;
    const inpName = document.getElementById('input-routine-name');
    if (inpName) inpName.value = routine.name;
    const inpFocus = document.getElementById('input-routine-focus');
    if (inpFocus) inpFocus.value = routine.focus;
    const modalR = document.getElementById('modal-routine');
    if (modalR) modalR.classList.add('open');
  }

  document.getElementById('form-routine').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    const id = document.getElementById('input-routine-id').value;
    const name = document.getElementById('input-routine-name').value.trim();
    const focus = document.getElementById('input-routine-focus').value.trim();

    let isNew = false;
    if (id) {
      const routine = user.routines.find(r => r.id === id);
      if (routine) {
        routine.name = name;
        routine.focus = focus;
        showToast('Ficha atualizada com sucesso!', 'success');
      }
    } else {
      isNew = true;
      const newR = { id: 'routine-' + Date.now(), name, focus, exercises: [] };
      if (!user.routines) user.routines = [];
      user.routines.push(newR);
      user.activeRoutineId = newR.id;
      showToast(`Ficha "${name}" criada com sucesso.`, 'success');
    }

    saveCurrentUser();
    document.getElementById('modal-routine').classList.remove('open');
    renderWorkoutsTab();
    renderHomeTab();

    if (isNew) {
      setTimeout(() => {
        document.getElementById('btn-open-catalog').click();
      }, 300);
    }
  });

  async function confirmDeleteRoutine(routine) {
    const user = getCurrentUser();
    const ok = await showConfirmModal({
      title: 'Excluir Ficha?',
      message: `Deseja excluir a ficha "${routine.name}" e todos os seus exercícios?`,
      okText: 'Excluir Ficha',
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>'
    });
    if (!ok) return;
    user.routines = user.routines.filter(r => r.id !== routine.id);
    user.activeRoutineId = user.routines.length > 0 ? user.routines[0].id : null;
    saveCurrentUser();
    renderWorkoutsTab();
    renderHomeTab();
    showToast('Ficha excluída.', 'info');
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
    saveCurrentUser();
    document.getElementById('modal-edit-ex').classList.remove('open');
    renderWorkoutsTab();
    showToast('Exercício salvo!', 'success');
  });

  function openHistoryModal(ex) {
    setText('history-modal-title', ex.name);
    setText('history-modal-sub', `Músculo: ${ex.muscle || 'Geral'}`);
    const chartEl = document.getElementById('history-modal-chart');
    if (chartEl) renderInteractiveSVGChart(chartEl, ex);

    const table = document.getElementById('history-table-records');
    if (table) {
      table.innerHTML = '';
      const sorted = [...(ex.history || [])].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

      if (sorted.length === 0) {
        table.innerHTML = '<p class="text-muted text-sm text-center">Nenhuma carga registrada ainda.</p>';
      } else {
        sorted.forEach(rec => {
          const row = document.createElement('div');
          row.className = 'history-item-row';
          row.innerHTML = `<span>${rec.date}</span><strong style="color:var(--accent);">${rec.weight} kg</strong>`;
          table.appendChild(row);
        });
      }
    }

    const modalHist = document.getElementById('modal-history');
    if (modalHist) modalHist.classList.add('open');
  }

  // Modais de Refeição
  function openAddMealModal() {
    setText('modal-meal-title', 'Nova Refeição');
    const inpId = document.getElementById('input-meal-id');
    if (inpId) inpId.value = '';
    const formMeal = document.getElementById('form-meal');
    if (formMeal) formMeal.reset();
    const modalMeal = document.getElementById('modal-meal');
    if (modalMeal) modalMeal.classList.add('open');
  }

  function openEditMealModal(meal) {
    setText('modal-meal-title', 'Editar Refeição');
    const inpId = document.getElementById('input-meal-id');
    if (inpId) inpId.value = meal.id;
    const inpName = document.getElementById('input-meal-name');
    if (inpName) inpName.value = meal.name;
    const inpTime = document.getElementById('input-meal-time');
    if (inpTime) inpTime.value = meal.time;
    const modalMeal = document.getElementById('modal-meal');
    if (modalMeal) modalMeal.classList.add('open');
  }

  document.getElementById('form-meal').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = getCurrentUser();
    const id = document.getElementById('input-meal-id').value;
    const name = document.getElementById('input-meal-name').value.trim();
    const time = document.getElementById('input-meal-time').value;

    let newMealRef = null;

    if (id) {
      const meal = user.meals.find(m => m.id === id);
      if (meal) {
        meal.name = name;
        meal.time = time;
        showToast('Refeição salva!', 'success');
      }
    } else {
      if (!user.meals) user.meals = [];
      newMealRef = {
        id: 'meal-' + Date.now(),
        name,
        time,
        done: false,
        items: []
      };
      user.meals.push(newMealRef);
      showToast(`Refeição "${name}" criada com sucesso.`, 'success');
    }

    saveCurrentUser();
    document.getElementById('modal-meal').classList.remove('open');
    renderDietTab();
    renderHomeTab();

    if (newMealRef) {
      setTimeout(() => {
        openTacoPickerForMeal(newMealRef);
      }, 300);
    }
  });

  async function confirmDeleteMeal(meal) {
    const user = getCurrentUser();
    const ok = await showConfirmModal({
      title: 'Excluir Refeição?',
      message: `Deseja remover "${meal.name}" da sua dieta?`,
      okText: 'Excluir',
      icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>'
    });
    if (!ok) return;
    user.meals = user.meals.filter(m => m.id !== meal.id);
    saveCurrentUser();
    renderDietTab();
    renderHomeTab();
    showToast('Refeição removida.', 'info');
  }

  // Backup Export & Import
  const btnExportBackup = document.getElementById('btn-export-backup');
  if (btnExportBackup) {
    btnExportBackup.onclick = () => {
      const user = getCurrentUser();
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(user, null, 2));
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = `ironpulse_${user.name.toLowerCase()}_backup_${getTodayKey()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast('Backup exportado com sucesso.', 'success');
    };
  }

  const backupInput = document.getElementById('input-backup-file');
  if (backupInput) {
    backupInput.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          if (parsed && (parsed.routines || parsed.email)) {
            const user = getCurrentUser();
            Object.assign(user, parsed);
            saveCurrentUser();
            renderAll();
            showToast('Backup restaurado com sucesso!', 'success');
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
  }

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
    t.innerHTML = `<span>${type === 'success' ? '✓' : '•'}</span><span>${escapeHtml(msg)}</span>`;
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

  // ==================== CONTROLE DE TEMA CLARO / ESCURO ====================
  const THEME_KEY = 'ironpulse_theme_pref';

  function initTheme() {
    const saved = localStorage.getItem(THEME_KEY) || 'dark';
    applyTheme(saved);

    const btn = document.getElementById('btn-toggle-theme');
    if (btn) {
      btn.onclick = () => {
        const isLight = document.body.classList.contains('theme-light');
        applyTheme(isLight ? 'dark' : 'light');
      };
    }
  }

  function applyTheme(theme) {
    const icon = document.getElementById('theme-toggle-icon');
    if (theme === 'light') {
      document.body.classList.add('theme-light');
      if (icon) {
        icon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
      }
      localStorage.setItem(THEME_KEY, 'light');
    } else {
      document.body.classList.remove('theme-light');
      if (icon) {
        icon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
      }
      localStorage.setItem(THEME_KEY, 'dark');
    }
  }

  function init() {
    initTheme();
    initProfileEvents();
    initCloudDbEvents();
    initAuthEvents();
    initNav();
    initCatalog();
    initTacoPicker();
    initWater();

    const btnAddRoutineTop = document.getElementById('btn-add-routine-top');
    if (btnAddRoutineTop) {
      btnAddRoutineTop.onclick = openNewRoutineModal;
    }

    document.querySelectorAll('.preset-chip').forEach(chip => {
      chip.onclick = () => {
        const name = chip.getAttribute('data-name');
        const focus = chip.getAttribute('data-focus');
        if (name) document.getElementById('input-routine-name').value = name;
        if (focus) document.getElementById('input-routine-focus').value = focus;
      };
    });

    // Modelos Rápidos de Refeição
    document.querySelectorAll('.preset-chip-meal').forEach(chip => {
      chip.onclick = () => {
        const name = chip.getAttribute('data-name');
        const time = chip.getAttribute('data-time');
        if (name) document.getElementById('input-meal-name').value = name;
        if (time) document.getElementById('input-meal-time').value = time;
      };
    });

    const btnOpenTacoCatalog = document.getElementById('btn-open-taco-catalog');
    if (btnOpenTacoCatalog) {
      btnOpenTacoCatalog.onclick = () => openTacoPickerForMeal(null);
    }

    const btnStartSession = document.getElementById('btn-start-session');
    if (btnStartSession) btnStartSession.onclick = toggleSession;

    const btnAddMeal = document.getElementById('btn-add-meal');
    if (btnAddMeal) btnAddMeal.onclick = openAddMealModal;

    document.querySelectorAll('.chip-timer[data-sec]').forEach(chip => {
      chip.onclick = () => startRestTimer(parseInt(chip.getAttribute('data-sec'), 10));
    });

    const btnStopRest = document.getElementById('btn-stop-rest');
    if (btnStopRest) btnStopRest.onclick = stopRestTimer;

    // Sincronização automática quando a rede voltar
    window.addEventListener('online', () => {
      showToast('Rede restabelecida! Sincronizando com a nuvem...', 'success');
      const user = getCurrentUser();
      if (user && window.CloudDB && window.CloudDB.isConnected()) {
        window.CloudDB.saveUser(user);
      }
    });

    // Checa autenticação inicial
    checkAuth();

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
