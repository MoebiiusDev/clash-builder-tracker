let currentAccountId = null;
let currentBuilderIndex = null;
let currentApprenticeAccount = null;

// =========================
// BUILDER MENU
// =========================

function openBuilderMenu(accountId, builderIndex) {

    currentAccountId = accountId;
    currentBuilderIndex = builderIndex;

    document
        .getElementById("builderModal")
        .classList.remove("hidden");
}

// =========================
// APPRENTICE MENU
// =========================

function configureApprentice(accountId) {

    currentApprenticeAccount = accountId;

    const modal =
        document.getElementById("apprenticeModal");

    const builderSelect =
        document.getElementById("apprenticeBuilder");

    builderSelect.innerHTML =
        '<option value="">Sin asignar</option>';

    const account =
        accounts.find(acc => acc.id === accountId);

    account.builders.forEach((builder, index) => {

        builderSelect.innerHTML += `
            <option value="${index}">
                Builder ${index + 1}
            </option>
        `;
    });

    modal.classList.remove("hidden");
}

// =========================
// CLOSE MODALS
// =========================

document
    .getElementById("closeModalBtn")
    .addEventListener("click", () => {

        document
            .getElementById("builderModal")
            .classList.add("hidden");
    });

document
    .getElementById("closeApprenticeBtn")
    .addEventListener("click", () => {

        document
            .getElementById("apprenticeModal")
            .classList.add("hidden");
    });

// =========================
// SAVE BUILDER
// =========================

document
    .getElementById("saveBuilderBtn")
    .addEventListener("click", () => {

        const building =
            document.getElementById("modalBuilding")
                .value;

        const days =
            parseInt(
                document.getElementById("modalDays")
                    .value
            ) || 0;

        const hours =
            parseInt(
                document.getElementById("modalHours")
                    .value
            ) || 0;

        const minutes =
            parseInt(
                document.getElementById("modalMinutes")
                    .value
            ) || 0;

        const totalMs =
            (days * 24 * 60 * 60 * 1000) +
            (hours * 60 * 60 * 1000) +
            (minutes * 60 * 1000);

        const account =
            accounts.find(
                acc => acc.id === currentAccountId
            );

        // Guardar en goblinBuilder si corresponde
        if (currentBuilderIndex === "goblin") {

            account.goblinBuilder = {
                building,
                finishTime: Date.now() + totalMs
            };

        } else {

            account.builders[currentBuilderIndex] = {
                building,
                finishTime: Date.now() + totalMs
            };
        }

        saveAccounts();
        renderAccounts();

        document
            .getElementById("builderModal")
            .classList.add("hidden");
    });

// =========================
// SAVE APPRENTICE
// =========================

document
    .getElementById("saveApprenticeBtn")
    .addEventListener("click", () => {

        const account =
            accounts.find(
                acc => acc.id === currentApprenticeAccount
            );

        const level =
            parseInt(
                document.getElementById(
                    "apprenticeLevel"
                ).value
            );

        const assignedBuilder =
            document.getElementById(
                "apprenticeBuilder"
            ).value;

        const sleeping =
            document.getElementById(
                "apprenticeSleeping"
            ).checked;

        const hours =
            parseInt(
                document.getElementById(
                    "apprenticeCooldownHours"
                ).value
            ) || 0;

        const minutes =
            parseInt(
                document.getElementById(
                    "apprenticeCooldownMinutes"
                ).value
            ) || 0;

        const keepWorking =
            document.getElementById(
                "apprenticeKeepWorking"
            ).checked;

        // sleepUntil: tiempo antes de trabajar (puede ser 0 = trabajar ya)
        let sleepUntil = Date.now();

        if (sleeping) {
            sleepUntil =
                Date.now() +
                (
                    (hours * 60 * 60 * 1000) +
                    (minutes * 60 * 1000)
                );
        }

        account.apprentice = {

            level,

            assignedBuilder:
                assignedBuilder === ""
                    ? null
                    : parseInt(assignedBuilder),

            sleepUntil,

            // availableAt = cooldown POST-trabajo, empieza en 0
            availableAt: Date.now(),

            enabled: true,

            keepWorking
        };

        saveAccounts();
        renderAccounts();

        document
            .getElementById("apprenticeModal")
            .classList.add("hidden");
    });

// =========================
// RENDER BUILDERS
// =========================

function renderBuilders(account) {

    let html = `
        <div class="compact-section">
    `;

    account.builders.forEach((builder, index) => {

        let statusClass = "builder-free";
        let timeText = "Libre";

        if (builder.finishTime) {

            const remaining =
                builder.finishTime - Date.now();

            if (remaining > 0) {

                statusClass = "builder-busy";

                timeText = formatTime(remaining);

            } else {

                statusClass = "builder-finished";

                timeText = "Finalizado";
            }
        }

        const apprenticeAssigned =
            account.apprentice &&
            account.apprentice.assignedBuilder === index;

        html += `

            <div class="compact-row ${apprenticeAssigned ? 'has-apprentice' : ''}">

                <div class="compact-info">

                    <div class="compact-title">
                        🛠️ ${index + 1}
                    </div>

                    <div
                        class="compact-name ${statusClass}"
                        id="status-${account.id}-${index}"
                    >
                        ${builder.building || "Sin construcción"}
                    </div>

                    <div
                        class="compact-timer"
                        id="timer-${account.id}-${index}"
                    >
                        ${timeText}
                    </div>

                    ${
                        apprenticeAssigned
                        ? `<div class="apprentice-badge">Aprendiz</div>`
                        : `<div></div>`
                    }

                    

                </div>

                <div class="compact-actions">

                    <button
                        class="start-btn"
                        onclick="openBuilderMenu(${account.id}, ${index})"
                    >
                        Configurar
                    </button>

                    <button
                        class="clear-btn"
                        onclick="clearBuilder(${account.id}, ${index})"
                    >
                        Limpiar
                    </button>

                </div>

            </div>
        `;
    });

    html += `</div>`;

    return html;
}

// =========================
// RENDER APPRENTICE
// =========================

function renderApprentice(account) {

    const apprentice = account.apprentice;

    let apprenticeStatus = "⚡ Disponible";

    const now = Date.now();

    if (apprentice.sleepUntil && apprentice.sleepUntil > now) {

        // Está durmiendo, aún no ha trabajado
        apprenticeStatus =
            "😴 " + formatTime(apprentice.sleepUntil - now);

    } else if (apprentice.availableAt > now) {

        // Ya trabajó, está en cooldown de 23h
        apprenticeStatus =
            "💤 " + formatTime(apprentice.availableAt - now);
    }

    return `

        <div class="mini-special-card">

            <div class="mini-special-icon">
                👷
            </div>

            <div class="mini-special-title">
                Constructor Aprendiz
            </div>

            <div class="mini-special-level">
                Nivel ${apprentice.level}
            </div>

            <div
                class="mini-special-status"
                id="apprentice-timer-${account.id}"
            >
                ${apprenticeStatus}
            </div>

            <div class="mini-special-buttons">

                <button
                    class="start-btn"
                    onclick="configureApprentice(${account.id})"
                >
                    Configurar
                </button>

                <button
                    class="clear-btn"
                    onclick="clearApprentice(${account.id})"
                >
                    Limpiar
                </button>

            </div>

        </div>
    `;
}

// =========================
// CLEARS
// =========================

function clearBuilder(accountId, builderIndex) {

    const account =
        accounts.find(acc => acc.id === accountId);

    account.builders[builderIndex] = {

        building: "",

        finishTime: null
    };

    saveAccounts();
    renderAccounts();
}

function clearApprentice(accountId) {

    const account =
        accounts.find(acc => acc.id === accountId);

    account.apprentice = {

        level: 1,

        assignedBuilder: null,

        availableAt: Date.now(),

        enabled: false
    };

    saveAccounts();
    renderAccounts();
}

// =========================
// UPDATE TIMERS
// =========================

function updateBuilderTimers() {

    accounts.forEach(account => {

        account.builders.forEach((builder, index) => {

            const timerElement =
                document.getElementById(
                    `timer-${account.id}-${index}`
                );

            const statusElement =
                document.getElementById(
                    `status-${account.id}-${index}`
                );

            if (!timerElement || !statusElement) return;

            if (!builder.finishTime) {

                timerElement.textContent = "Libre";

                return;
            }

            const remaining =
                builder.finishTime - Date.now();

            if (remaining > 0) {

                timerElement.textContent =
                    formatTime(remaining);

                statusElement.className =
                    "builder-status builder-busy";

            } else {

                timerElement.textContent =
                    "Finalizado";

                statusElement.className =
                    "builder-status builder-finished";
            }
        });

        // =========================
        // APPRENTICE TIMER VISUAL
        // =========================

        const apprentice = account.apprentice;
        const now = Date.now();

        const apprenticeTimerElement =
            document.getElementById(
                `apprentice-timer-${account.id}`
            );

        if (apprenticeTimerElement) {

            if (apprentice.sleepUntil && apprentice.sleepUntil > now) {

                apprenticeTimerElement.textContent =
                    "😴 " + formatTime(apprentice.sleepUntil - now);

            } else if (apprentice.availableAt > now) {

                apprenticeTimerElement.textContent =
                    "💤 " + formatTime(apprentice.availableAt - now);

            } else {

                apprenticeTimerElement.textContent = "⚡ Disponible";
            }
        }

        // =========================
        // APPRENTICE LOGIC
        // =========================

        if (
            apprentice.enabled &&
            apprentice.assignedBuilder !== null &&
            // Disparar solo cuando sleepUntil haya pasado Y availableAt haya pasado
            (!apprentice.sleepUntil || apprentice.sleepUntil <= now) &&
            apprentice.availableAt <= now
        ) {

            const builderTarget =
                apprentice.assignedBuilder === "goblin"
                    ? account.goblinBuilder
                    : account.builders[apprentice.assignedBuilder];

            const targetActive =
                builderTarget &&
                builderTarget.finishTime &&
                builderTarget.finishTime > now;

            if (targetActive) {

                const reductionMs =
                    apprentice.level * 60 * 60 * 1000;

                builderTarget.finishTime -= reductionMs;

                // Cooldown post-trabajo: 23h sincronizado
                const newCooldown = now + (23 * 60 * 60 * 1000);

                account.sharedHelperCooldown = newCooldown;
                apprentice.availableAt = newCooldown;
                apprentice.sleepUntil = 0; // ya no duerme

                if (!apprentice.keepWorking) {
                    apprentice.enabled = false;
                }

                saveAccounts();

            } else if (apprentice.keepWorking) {

                // Construcción terminó
                apprentice.enabled = false;
                apprentice.keepWorking = false;
                saveAccounts();
            }
        }
    });
}
// =========================
// GOBLIN BUILDER — abre modal estándar de builder
// =========================

function openGoblinBuilderMenu(accountId) {

    currentAccountId = accountId;
    currentBuilderIndex = "goblin"; // clave especial

    document
        .getElementById("modalBuilding").value = "";
    document.getElementById("modalDays").value = "";
    document.getElementById("modalHours").value = "";
    document.getElementById("modalMinutes").value = "";

    // Pre-llenar si ya tiene tarea
    const account = accounts.find(acc => acc.id === accountId);
    const gb = account.goblinBuilder;

    if (gb.building) {
        document.getElementById("modalBuilding").value = gb.building;
    }

    document
        .getElementById("builderModal")
        .classList.remove("hidden");
}

// =========================
// RENDER GOBLIN BUILDER (fila verde en constructores)
// =========================

function renderGoblinBuilder(account) {

    // Solo mostrar si tiene 5 o 6 builders
    if (account.builders.length < 5) return "";

    const gb = account.goblinBuilder;

    let statusClass = "builder-free";
    let timeText = "Libre";

    if (gb.finishTime) {

        const remaining = gb.finishTime - Date.now();

        if (remaining > 0) {
            statusClass = "builder-busy";
            timeText = formatTime(remaining);
        } else {
            statusClass = "builder-finished";
            timeText = "Finalizado";
        }
    }

    const apprenticeAssigned =
        account.apprentice &&
        account.apprentice.assignedBuilder === "goblin";

    return `
        <div class="compact-row goblin-row mar ${apprenticeAssigned ? 'has-apprentice' : ''}">

            <div class="compact-info">

                <div class="compact-title">
                    <img class="goblin-swindler" src="img/duende_estafador.png" alt="Estafador"> Duende
                </div>

                <div
                    class="compact-name ${statusClass}"
                    id="status-goblin-${account.id}"
                >
                    ${gb.building || "Sin construcción"}
                </div>

                <div
                    class="compact-timer"
                    id="timer-goblin-${account.id}"
                >
                    ${timeText}
                </div>

                ${
                    apprenticeAssigned
                    ? `<div class="apprentice-badge">Aprendiz</div>`
                    : `<div></div>`
                }

            </div>

            <div class="compact-actions">

                <button
                    class="start-btn"
                    onclick="openGoblinBuilderMenu(${account.id})"
                >
                    Configurar
                </button>

                <button
                    class="clear-btn"
                    onclick="clearGoblinBuilder(${account.id})"
                >
                    Limpiar
                </button>

            </div>

        </div>
    `;
}

// =========================
// CLEAR GOBLIN BUILDER
// =========================

function clearGoblinBuilder(accountId) {

    const account =
        accounts.find(acc => acc.id === accountId);

    account.goblinBuilder = {
        building: "",
        finishTime: null
    };

    saveAccounts();
    renderAccounts();
}

// =========================
// UPDATE GOBLIN BUILDER TIMER
// =========================

function updateGoblinBuilderTimers() {

    accounts.forEach(account => {

        const gb = account.goblinBuilder;

        const timerEl = document.getElementById(
            `timer-goblin-${account.id}`
        );
        const statusEl = document.getElementById(
            `status-goblin-${account.id}`
        );

        if (!timerEl) return;

        if (!gb.finishTime) {
            timerEl.textContent = "Libre";
            return;
        }

        const remaining = gb.finishTime - Date.now();

        if (remaining > 0) {
            timerEl.textContent = formatTime(remaining);
            if (statusEl) statusEl.className = "compact-name builder-busy";
        } else {
            timerEl.textContent = "Finalizado";
            if (statusEl) statusEl.className = "compact-name builder-finished";
        }
    });
}