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

        // const sleeping =
        //     document.getElementById(
        //         "apprenticeSleeping"
        //     ).checked;

        // const hours =
        //     parseInt(
        //         document.getElementById(
        //             "apprenticeCooldownHours"
        //         ).value
        //     ) || 0;

        // const minutes =
        //     parseInt(
        //         document.getElementById(
        //             "apprenticeCooldownMinutes"
        //         ).value
        //     ) || 0;

        const keepWorking =
            document.getElementById(
                "apprenticeKeepWorking"
            ).checked;

        const firstDone =
            document.getElementById(
                "apprenticeFirstDone"
            ).checked;

        const now = Date.now();

        // Si ya hizo la primera reducción → espera el timer global
        // Si NO la hizo → reducir al instante, luego entrar al timer global
        let availableAt = now; // listo para trabajar ya

        if (firstDone) {
            // Ya trabajó: esperar el timer global
            availableAt = account.sharedHelperCooldown > now
                ? account.sharedHelperCooldown
                : now;
        }

        account.apprentice = {

            level,

            assignedBuilder:
                assignedBuilder === ""
                    ? null
                    : parseInt(assignedBuilder),

            sleepUntil: 0,

            availableAt,

            enabled: true,

            keepWorking,

            firstDone
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

    const now = Date.now();

    // Construir slots unificados: builders normales + duende
    const slots = account.builders.map((builder, index) => ({
        type: "builder",
        index,
        building: builder.building,
        finishTime: builder.finishTime
    }));

    if (account.builders.length >= 5) {
        slots.push({
            type: "goblin",
            index: "goblin",
            building: account.goblinBuilder.building,
            finishTime: account.goblinBuilder.finishTime
        });
    }

    // Orden: Finalizado → En progreso (menor tiempo primero) → Libre
    const getPriority = (slot) => {
        if (!slot.finishTime) return 3;
        return (slot.finishTime - now) <= 0 ? 0 : 1;
    };

    slots.sort((a, b) => {
        const pa = getPriority(a);
        const pb = getPriority(b);
        if (pa !== pb) return pa - pb;
        if (pa === 1) return (a.finishTime - now) - (b.finishTime - now);
        return 0;
    });

    let html = `<div class="compact-section">`;

    slots.forEach(slot => {

        let timerClass = "compact-timer timer-free";
        let timeText = "Libre";

        if (slot.finishTime) {
            const remaining = slot.finishTime - now;
            if (remaining > 0) {
                timeText = formatTime(remaining);
                timerClass = remaining < 3600000
                    ? "compact-timer timer-warning"
                    : "compact-timer";
            } else {
                timerClass = "compact-timer timer-finished";
                timeText = "Finalizado";
            }
        }

        const isGoblin = slot.type === "goblin";

        const apprenticeAssigned =
            account.apprentice &&
            account.apprentice.assignedBuilder === slot.index;

        const rowClass = [
            "compact-row",
            isGoblin ? "goblin-row mar" : "",
            apprenticeAssigned ? "has-apprentice" : ""
        ].filter(Boolean).join(" ");

        const titleContent = isGoblin
            ? `<img class="goblin-swindler" src="img/duende_estafador.png" alt="Estafador"> Duende`
            : `${slot.index + 1}`;

        const configOnclick = isGoblin
            ? `openGoblinBuilderMenu(${account.id})`
            : `openBuilderMenu(${account.id}, ${slot.index})`;

        const clearOnclick = isGoblin
            ? `clearGoblinBuilder(${account.id})`
            : `clearBuilder(${account.id}, ${slot.index})`;

        html += `
            <div class="${rowClass}">

                <div class="compact-info">

                    <div class="compact-title">
                        ${titleContent}
                    </div>

                    <div
                        class="compact-name"
                        id="status-${account.id}-${slot.index}"
                    >
                        ${slot.building || "Sin construccion"}
                    </div>

                    <div
                        class="${timerClass}"
                        id="timer-${account.id}-${slot.index}"
                    >
                        ${timeText}
                    </div>

                    ${apprenticeAssigned
                        ? `<div class="apprentice-badge">Aprendiz</div>`
                        : `<div></div>`
                    }

                </div>

                <div class="compact-actions">

                    <button
                        class="start-btn"
                        onclick="${configOnclick}"
                    >
                        Configurar
                    </button>

                    <button
                        class="clear-btn"
                        onclick="${clearOnclick}"
                    >
                        Limpiar
                    </button>

                </div>

            </div>
        `;
    });

    // Boton para añadir constructor (solo si tiene menos de 5 builders normales)
    if (account.builders.length < 5) {
        html += `
            <button
                class="add-builder-btn"
                onclick="addBuilder(${account.id})"
            >
                + Añadir Constructor
            </button>
        `;
    }

    html += `</div>`;

    return html;
}

// =========================
// RENDER APPRENTICE
// =========================

function renderApprentice(account) {

    const apprentice = account.apprentice;
    const now = Date.now();

    let apprenticeStatus = "Disponible";
    let apprenticeColor = "#4ade80";

    if (apprentice.availableAt > now) {
        apprenticeStatus =
            formatTime(apprentice.availableAt - now);
        apprenticeColor = "#f5c842";
    }

    return `

        <div class="mini-special-card">

            <div class="mini-special-icon">
                <img class="icon-asistente" src="img/constructor-aprendiz.png" alt="">
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
                style="color: ${apprenticeColor}"
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

            if (!timerElement) return;

            if (!builder.finishTime) {
                timerElement.textContent = "Libre";
                timerElement.className = "compact-timer timer-free";
                return;
            }

            const remaining =
                builder.finishTime - Date.now();

            if (remaining > 0) {
                timerElement.textContent = formatTime(remaining);
                timerElement.className = remaining < 3600000
                    ? "compact-timer timer-warning"
                    : "compact-timer";
            } else {
                timerElement.textContent = "Finalizado";
                timerElement.className = "compact-timer timer-finished";
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

            if (apprentice.availableAt > now) {
                apprenticeTimerElement.textContent =
                    formatTime(apprentice.availableAt - now);
                apprenticeTimerElement.style.color = "#f5c842";
            } else {
                apprenticeTimerElement.textContent = "Disponible";
                apprenticeTimerElement.style.color = "#4ade80";
            }
        }

        // =========================
        // APPRENTICE LOGIC
        // =========================

        if (
            apprentice.enabled &&
            apprentice.assignedBuilder !== null &&
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

                const newCooldown = account.sharedHelperCooldown > now
                    ? account.sharedHelperCooldown
                    : now + (23 * 60 * 60 * 1000);

                account.sharedHelperCooldown = newCooldown;
                apprentice.availableAt = newCooldown;
                apprentice.firstDone = true;

                if (!apprentice.keepWorking) {
                    apprentice.enabled = false;
                }

                saveAccounts();

            } else if (apprentice.keepWorking) {

                apprentice.enabled = false;
                apprentice.keepWorking = false;
                saveAccounts();
            }
        }
    });
}
// =========================
// ADD BUILDER
// =========================

function addBuilder(accountId) {

    const account =
        accounts.find(acc => acc.id === accountId);

    if (account.builders.length < 5) {
        account.builders.push({ building: "", finishTime: null });
        saveAccounts();
        renderAccounts();
    }
}

// =========================
// CLEAR ALL (reset timers only, keep profile)
// =========================

function clearAllAccount(accountId) {

    const account =
        accounts.find(acc => acc.id === accountId);

    account.builders = account.builders.map(() => ({
        building: "",
        finishTime: null
    }));

    account.goblinBuilder = { building: "", finishTime: null };
    account.goblinLab = { name: "", finishTime: null };

    account.laboratory.research = { name: "", finishTime: null };

    account.pets = { name: "", finishTime: null };

    account.apprentice = {
        level: account.apprentice.level,
        assignedBuilder: null,
        availableAt: Date.now(),
        enabled: false,
        keepWorking: false,
        sleepUntil: 0
    };

    account.laboratory.assistant = {
        level: account.laboratory.assistant.level,
        availableAt: Date.now(),
        enabled: false,
        keepWorking: false,
        sleepUntil: 0
    };

    account.helpers.alchemist.availableAt = Date.now();
    account.helpers.alchemist.active = false;
    account.helpers.digger.availableAt = Date.now();
    account.helpers.digger.active = false;

    account.sharedHelperCooldown = Date.now();

    saveAccounts();
    renderAccounts();
}

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
    // Integrado dentro de renderBuilders (ordenado por tiempo)
    return "";
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