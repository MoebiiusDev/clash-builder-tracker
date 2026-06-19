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

    // TIMER UNIFICADO DE AYUDANTES — preservar si ya existe y es futuro
    if (!account.sharedHelperCooldown || account.sharedHelperCooldown <= Date.now()) {
        if (!account.sharedHelperCooldown) {
            account.sharedHelperCooldown = Date.now();
        }
        // Si ya existe pero es pasado, lo dejamos como está (no resetear a Date.now())
    }

    // RE-SINCRONIZACION AL CARGAR: si un ayudante esta activo (enabled/active)
    // y su availableAt no coincide con el cooldown global guardado, se corrige.
    // Esto evita que al recargar la pagina el contador "salte" de vuelta a 24h.
    const globalCooldown = account.sharedHelperCooldown;

    if (account.apprentice && account.apprentice.enabled) {
        account.apprentice.availableAt = globalCooldown;
    }

    if (account.laboratory && account.laboratory.assistant && account.laboratory.assistant.enabled) {
        account.laboratory.assistant.availableAt = globalCooldown;
    }

    if (account.helpers) {
        if (account.helpers.alchemist && account.helpers.alchemist.active) {
            account.helpers.alchemist.availableAt = globalCooldown;
        }
        if (account.helpers.digger && account.helpers.digger.active) {
            account.helpers.digger.availableAt = globalCooldown;
        }
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

    if (account.collapsed === undefined) {
        account.collapsed = false;
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
        collapsed: false,

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

// =========================
// TOGGLE VISTA RESUMIDA
// =========================

function toggleCollapse(accountId) {

    const account =
        accounts.find(acc => acc.id === accountId);

    account.collapsed = !account.collapsed;

    saveAccounts();
    renderAccounts();
}

// =========================
// VISTA RESUMIDA — helper de fila
// =========================

function getTimerSnapshot(finishTime) {

    if (!finishTime) {
        return { text: "Libre", className: "summary-time timer-free" };
    }

    const remaining = finishTime - Date.now();

    if (remaining > 0) {
        const className = remaining < 3600000
            ? "summary-time timer-warning"
            : "summary-time";
        return { text: formatTime(remaining), className };
    }

    return { text: "Finalizado", className: "summary-time timer-finished" };
}

function renderSummaryRow(label, finishTime, assignedClass, idSuffix, accountId) {

    const snap = getTimerSnapshot(finishTime);

    return `
        <div class="summary-row ${assignedClass || ""}">
            <span class="summary-label">${label}</span>
            <span
                class="${snap.className}"
                id="summary-${idSuffix}-${accountId}"
            >
                ${snap.text}
            </span>
        </div>
    `;
}

function renderAccountSummary(account) {

    let builderRows = "";

    account.builders.forEach((builder, index) => {
        const apprenticeAssigned =
            account.apprentice &&
            account.apprentice.enabled &&
            account.apprentice.assignedBuilder === index;

        builderRows += renderSummaryRow(
            builder.building || `Constructor ${index + 1}`,
            builder.finishTime,
            apprenticeAssigned ? "summary-row-apprentice" : null,
            `builder-${index}`,
            account.id
        );
    });

    const goblinApprentice =
        account.apprentice &&
        account.apprentice.enabled &&
        account.apprentice.assignedBuilder === "goblin";

    builderRows += renderSummaryRow(
        account.goblinBuilder.building || "Duende constructor",
        account.goblinBuilder.finishTime,
        goblinApprentice ? "summary-row-apprentice" : null,
        "goblin-builder",
        account.id
    );

    const labAssistantActive =
        account.laboratory.assistant &&
        account.laboratory.assistant.enabled;

    let labRows = renderSummaryRow(
        account.laboratory.research.name || "Laboratorio",
        account.laboratory.research.finishTime,
        labAssistantActive ? "summary-row-assistant" : null,
        "lab",
        account.id
    );

    labRows += renderSummaryRow(
        account.goblinLab.name || "Duende laboratorio",
        account.goblinLab.finishTime,
        null,
        "goblin-lab",
        account.id
    );

    const petsRows = renderSummaryRow(
        account.pets.name || "Mascota",
        account.pets.finishTime,
        null,
        "pets",
        account.id
    );

    return `
        <div class="summary-column">

            <div class="summary-section-title">Constructores</div>
            <div class="summary-section">${builderRows}</div>

            <div class="summary-section-title">Laboratorio</div>
            <div class="summary-section">${labRows}</div>

            <div class="summary-section-title">Mascotas</div>
            <div class="summary-section">${petsRows}</div>

        </div>
    `;
}

function updateSummaryTimers() {

    accounts.forEach(account => {

        if (!account.collapsed) return;

        const items = [
            ...account.builders.map((b, i) => [`builder-${i}`, b.finishTime]),
            ["goblin-builder", account.goblinBuilder.finishTime],
            ["lab", account.laboratory.research.finishTime],
            ["goblin-lab", account.goblinLab.finishTime],
            ["pets", account.pets.finishTime]
        ];

        items.forEach(([suffix, finishTime]) => {

            const el = document.getElementById(
                `summary-${suffix}-${account.id}`
            );

            if (!el) return;

            const snap = getTimerSnapshot(finishTime);

            el.textContent = snap.text;
            el.className = snap.className;
        });
    });
}

// =========================
// RENDER
// =========================

function renderAccounts() {

    accountsContainer.innerHTML = "";

    const collapsedRow = document.createElement("div");
    collapsedRow.className = "collapsed-row";

    let hasCollapsed = false;

    accounts.forEach(account => {

        const card = document.createElement("div");
        card.className = "account-card" + (account.collapsed ? " account-collapsed" : "");

        const toggleLabel = account.collapsed ? "Expandir" : "Resumir";

        const body = account.collapsed

            ? renderAccountSummary(account)

            : `
            <div class="account-layout">

                <div class="account-main">

                    <div class="section-title-row">
                        <div class="section-title">Constructores</div>
                        <button
                            class="potion-btn"
                            onclick="openPotionModal(${account.id}, 'builder')"
                            title="Usar Pocion de Constructor"
                        >Pocion</button>
                    </div>
                    ${renderBuilders(account)}

                    <div class="section-title-row lb">
                        <div class="section-title">Laboratorio</div>
                        <button
                            class="potion-btn"
                            onclick="openPotionModal(${account.id}, 'research')"
                            title="Usar Pocion de Investigacion"
                        >Pocion</button>
                    </div>
                    <div class="laboratory-grid">
                        ${renderLaboratory(account)}
                        ${renderGoblinLab(account)}
                    </div>

                    <div class="section-title-row lb">
                        <div class="section-title">Caseta de Animales</div>
                        <button
                            class="potion-btn"
                            onclick="openPotionModal(${account.id}, 'pet')"
                            title="Usar Pocion de Mascotas"
                        >Pocion</button>
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

        const headerActions = account.collapsed
            ? `
                <button
                    class="collapse-account-btn"
                    onclick="toggleCollapse(${account.id})"
                >
                    ${toggleLabel}
                </button>
            `
            : `
                <button
                    class="collapse-account-btn"
                    onclick="toggleCollapse(${account.id})"
                >
                    ${toggleLabel}
                </button>
                <button
                    class="cleanup-account-btn"
                    onclick="clearAllAccount(${account.id})"
                >
                    Limpiar Todo
                </button>
                <button
                    class="delete-account-btn"
                    onclick="deleteAccount(${account.id})"
                >
                    Eliminar Cuenta
                </button>
            `;

        card.innerHTML = `

            <div class="account-header">
                <div class="account-name">${account.name}</div>
                <div style="display:flex; gap:8px; align-items:center;">
                    ${headerActions}
                </div>
            </div>

            ${body}
        `;

        if (account.collapsed) {
            collapsedRow.appendChild(card);
            hasCollapsed = true;
        } else {
            accountsContainer.appendChild(card);
        }
    });

    if (hasCollapsed) {
        accountsContainer.appendChild(collapsedRow);
    }
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
    updateSummaryTimers();
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

    const color = isActive ? "#78ffa9" : "#4ade80";

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
            el.style.color = "#78ffa9";
        } else {
            el.textContent = "⚡ Todos disponibles";
            el.style.color = "#4ade80";
        }
    });
}