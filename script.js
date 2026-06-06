const accountsContainer =
    document.getElementById("accountsContainer");

const createAccountBtn =
    document.getElementById("createAccountBtn");

let accounts =
    JSON.parse(
        localStorage.getItem("clashAccounts")
    ) || [];

// =========================
// MIGRACIÓN DATOS
// =========================

accounts.forEach(account => {

    if (!account.builders) account.builders = [];

    if (!account.apprentice) {
        account.apprentice = {
            level: 1, assignedBuilder: null,
            availableAt: Date.now(), enabled: false
        };
    }

    if (!account.laboratory) {
        account.laboratory = {
            research: { name: "", finishTime: null },
            assistant: { level: 1, availableAt: Date.now(), enabled: false }
        };
    }

    if (!account.laboratory.research) {
        account.laboratory.research = { name: "", finishTime: null };
    }

    if (!account.laboratory.assistant) {
        account.laboratory.assistant = {
            level: 1, availableAt: Date.now(), enabled: false
        };
    }

    if (!account.pets) {
        account.pets = { name: "", finishTime: null };
    }

    // NUEVOS AYUDANTES
    if (!account.helpers) {
        account.helpers = {
            alchemist: { level: 1, availableAt: Date.now(), active: false },
            digger:    { availableAt: Date.now(), active: false }
        };
    }

    if (!account.helpers.alchemist) {
        account.helpers.alchemist = {
            level: 1, availableAt: Date.now(), active: false
        };
    }

    if (!account.helpers.digger) {
        account.helpers.digger = {
            availableAt: Date.now(), active: false
        };
    }

    // TIMER UNIFICADO DE AYUDANTES
    if (!account.sharedHelperCooldown) {
        account.sharedHelperCooldown = Date.now();
    }

    // keepWorking y sleepUntil en aprendiz y asistente lab
    if (account.apprentice.keepWorking === undefined) {
        account.apprentice.keepWorking = false;
    }
    if (account.apprentice.sleepUntil === undefined) {
        account.apprentice.sleepUntil = 0;
    }
    if (account.laboratory.assistant.keepWorking === undefined) {
        account.laboratory.assistant.keepWorking = false;
    }
    if (account.laboratory.assistant.sleepUntil === undefined) {
        account.laboratory.assistant.sleepUntil = 0;
    }

    // DUENDES — estructura simple igual que builder/lab
    if (!account.goblinBuilder) {
        account.goblinBuilder = {
            building: "",
            finishTime: null
        };
    }

    if (!account.goblinLab) {
        account.goblinLab = {
            name: "",
            finishTime: null
        };
    }
});

saveAccounts();

// =========================
// CREAR CUENTA
// =========================

createAccountBtn.addEventListener("click", () => {

    const playerName =
        document.getElementById("playerName").value.trim();

    const builderCount =
        parseInt(document.getElementById("builderCount").value);

    if (!playerName) return;

    const account = {

        id: Date.now(),
        name: playerName,

        builders: [],

        apprentice: {
            level: 1, assignedBuilder: null,
            availableAt: Date.now(), enabled: false,
            keepWorking: false
        },

        laboratory: {
            research: { name: "", finishTime: null },
            assistant: { level: 1, availableAt: Date.now(), enabled: false, keepWorking: false }
        },

        pets: { name: "", finishTime: null },

        helpers: {
            alchemist: { level: 1, availableAt: Date.now(), active: false },
            digger:    { availableAt: Date.now(), active: false }
        },

        sharedHelperCooldown: Date.now(),

        goblinBuilder: {
            building: "",
            finishTime: null
        },

        goblinLab: {
            name: "",
            finishTime: null
        }
    };

    for (let i = 0; i < builderCount; i++) {
        account.builders.push({ building: "", finishTime: null });
    }

    accounts.push(account);
    saveAccounts();
    renderAccounts();

    document.getElementById("playerName").value = "";
});

// =========================
// SAVE
// =========================

function saveAccounts() {
    localStorage.setItem("clashAccounts", JSON.stringify(accounts));
}

// =========================
// DELETE ACCOUNT
// =========================

function deleteAccount(accountId) {
    accounts = accounts.filter(acc => acc.id !== accountId);
    saveAccounts();
    renderAccounts();
}

// =========================
// FORMAT TIME
// =========================

function formatTime(ms) {

    const totalSeconds = Math.floor(ms / 1000);
    const days    = Math.floor(totalSeconds / 86400);
    const hours   = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}

// =========================
// RENDER
// =========================

function renderAccounts() {

    accountsContainer.innerHTML = "";

    accounts.forEach(account => {

        const card = document.createElement("div");
        card.className = "account-card";

        card.innerHTML = `

            <div class="account-header">
                <div class="account-name">👑 ${account.name}</div>
                <button
                    class="delete-account-btn"
                    onclick="deleteAccount(${account.id})"
                >
                    Eliminar Cuenta
                </button>
            </div>

            <div class="account-layout">

                <div class="account-main">

                    <div class="section-title-row">
                        <div class="section-title">🔨 Constructores</div>
                        <button
                            class="potion-btn"
                            onclick="openPotionModal(${account.id}, 'builder')"
                            title="Usar Poción de Constructor"
                        >⚗️ Poción</button>
                    </div>
                    ${renderBuilders(account)}

                    <div class="section-title-row lb">
                        <div class="section-title">🧪 Investigación</div>
                        <button
                            class="potion-btn"
                            onclick="openPotionModal(${account.id}, 'research')"
                            title="Usar Poción de Investigación"
                        >🔬 Poción</button>
                    </div>
                    <div class="laboratory-grid">
                        ${renderLaboratory(account)}
                        ${renderGoblinLab(account)}
                    </div>

                    <div class="section-title-row lb">
                        <div class="section-title">🐾 Mascotas</div>
                        <button
                            class="potion-btn"
                            onclick="openPotionModal(${account.id}, 'pet')"
                            title="Usar Poción de Mascotas"
                        >🧪 Poción</button>
                    </div>
                    <div class="pets-grid">
                        ${renderPets(account)}
                    </div>

                </div>

                <div class="assistants-panel">

                    <div class="assistants-title">Ayudantes</div>

                    ${renderSharedTimer(account)}

                    <div class="assistants-grid">

                        ${renderApprentice(account)}
                        ${renderLabAssistant(account)}

                        <div class="assistants-divider"></div>

                        ${renderAlchemist(account)}
                        ${renderDigger(account)}

                    </div>

                </div>

            </div>
        `;

        accountsContainer.appendChild(card);
    });
}

// =========================
// UPDATE LOOP
// =========================

function updateAllTimers() {
    updateBuilderTimers();
    updateLaboratoryTimers();
    updatePetsTimers();
    updateHelperTimers();
    updateGoblinBuilderTimers();
    updateGoblinLabTimers();
    updateSharedTimerDisplay();
}

setInterval(updateAllTimers, 1000);

renderAccounts();
// =========================
// SHARED TIMER RENDER
// =========================

function renderSharedTimer(account) {

    const now = Date.now();
    const remaining = account.sharedHelperCooldown - now;
    const isActive = remaining > 0;

    const timeText = isActive
        ? formatTime(remaining)
        : "⚡ Todos disponibles";

    const color = isActive ? "#f5c842" : "#4ade80";

    return `
        <div class="shared-timer-bar">

            <div class="shared-timer-label">
                ⏱ Sincronización
            </div>

            <div
                class="shared-timer-value"
                id="shared-timer-${account.id}"
                style="color: ${color}"
            >
                ${timeText}
            </div>

            <button
                class="shared-timer-btn"
                onclick="openSyncModal(${account.id})"
            >
                Ajustar
            </button>

        </div>
    `;
}

// =========================
// OPEN SYNC MODAL
// =========================

let currentSyncAccount = null;

function openSyncModal(accountId) {

    currentSyncAccount = accountId;

    const account = accounts.find(acc => acc.id === accountId);
    const remaining = account.sharedHelperCooldown - Date.now();

    document.getElementById("syncHours").value =
        remaining > 0 ? Math.floor(remaining / 3600000) : "";

    document.getElementById("syncMinutes").value =
        remaining > 0
            ? Math.floor((remaining % 3600000) / 60000)
            : "";

    document
        .getElementById("syncModal")
        .classList.remove("hidden");
}

document
    .getElementById("closeSyncBtn")
    .addEventListener("click", () => {
        document
            .getElementById("syncModal")
            .classList.add("hidden");
    });

document
    .getElementById("saveSyncBtn")
    .addEventListener("click", () => {

        const account =
            accounts.find(acc => acc.id === currentSyncAccount);

        const hours =
            parseInt(document.getElementById("syncHours").value) || 0;

        const minutes =
            parseInt(document.getElementById("syncMinutes").value) || 0;

        const totalMs =
            (hours * 60 * 60 * 1000) +
            (minutes * 60 * 1000);

        const newCooldown = Date.now() + totalMs;

        // Actualizar el timer global
        account.sharedHelperCooldown = newCooldown;

        // Sincronizar TODOS los ayudantes con este nuevo tiempo
        account.helpers.alchemist.availableAt = newCooldown;
        account.helpers.digger.availableAt = newCooldown;

        if (account.apprentice.enabled) {
            account.apprentice.availableAt = newCooldown;
        }

        if (account.laboratory.assistant.enabled) {
            account.laboratory.assistant.availableAt = newCooldown;
        }

        saveAccounts();
        renderAccounts();

        document
            .getElementById("syncModal")
            .classList.add("hidden");
    });

// =========================
// UPDATE SHARED TIMER DISPLAY
// =========================

function updateSharedTimerDisplay() {

    accounts.forEach(account => {

        const el = document.getElementById(
            `shared-timer-${account.id}`
        );

        if (!el) return;

        const remaining = account.sharedHelperCooldown - Date.now();

        if (remaining > 0) {
            el.textContent = formatTime(remaining);
            el.style.color = "#f5c842";
        } else {
            el.textContent = "⚡ Todos disponibles";
            el.style.color = "#4ade80";
        }
    });
}