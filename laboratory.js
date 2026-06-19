// =========================
// LABORATORY STATE
// =========================

let currentLaboratoryAccount = null;
let currentLaboratoryTarget = "main"; // "main" o "goblin"

// =========================
// OPEN LAB MENU
// =========================

function openLaboratoryMenu(accountId) {

    currentLaboratoryAccount = accountId;
    currentLaboratoryTarget = "main";

    document
        .getElementById("laboratoryModal")
        .classList.remove("hidden");
}

// =========================
// OPEN ASSISTANT MENU
// =========================

function configureLabAssistant(accountId) {

    currentLaboratoryAccount = accountId;

    document
        .getElementById("labAssistantModal")
        .classList.remove("hidden");
}

// =========================
// CLOSE MODALS
// =========================

const closeLaboratoryBtn =
    document.getElementById(
        "closeLaboratoryBtn"
    );

if (closeLaboratoryBtn) {

    closeLaboratoryBtn.addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "laboratoryModal"
                )
                .classList.add("hidden");
        }
    );
}

const closeLabAssistantBtn =
    document.getElementById(
        "closeLabAssistantBtn"
    );

if (closeLabAssistantBtn) {

    closeLabAssistantBtn.addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "labAssistantModal"
                )
                .classList.add("hidden");
        }
    );
}

// =========================
// SAVE RESEARCH
// =========================

const saveLaboratoryBtn =
    document.getElementById(
        "saveLaboratoryBtn"
    );

if (saveLaboratoryBtn) {

    saveLaboratoryBtn.addEventListener(
        "click",
        () => {

            const account =
                accounts.find(
                    acc =>
                        acc.id === currentLaboratoryAccount
                );

            const name =
                document.getElementById(
                    "laboratoryName"
                ).value;

            const days =
                parseInt(
                    document.getElementById(
                        "laboratoryDays"
                    ).value
                ) || 0;

            const hours =
                parseInt(
                    document.getElementById(
                        "laboratoryHours"
                    ).value
                ) || 0;

            const minutes =
                parseInt(
                    document.getElementById(
                        "laboratoryMinutes"
                    ).value
                ) || 0;

            const totalMs =
                (days * 24 * 60 * 60 * 1000) +
                (hours * 60 * 60 * 1000) +
                (minutes * 60 * 1000);

            if (currentLaboratoryTarget === "goblin") {

                account.goblinLab = {
                    name,
                    finishTime: Date.now() + totalMs
                };

            } else {

                account.laboratory.research = {
                    name,
                    finishTime: Date.now() + totalMs
                };
            }

            saveAccounts();
            renderAccounts();

            document
                .getElementById(
                    "laboratoryModal"
                )
                .classList.add("hidden");
        }
    );
}

// =========================
// SAVE LAB ASSISTANT
// =========================

const saveLabAssistantBtn =
    document.getElementById(
        "saveLabAssistantBtn"
    );

if (saveLabAssistantBtn) {

    saveLabAssistantBtn.addEventListener(
        "click",
        () => {

            const account =
                accounts.find(
                    acc =>
                        acc.id === currentLaboratoryAccount
                );

            const level =
                parseInt(
                    document.getElementById(
                        "labAssistantLevel"
                    ).value
                );

            const keepWorking =
                document.getElementById(
                    "labAssistantKeepWorking"
                ).checked;

            const firstDone =
                document.getElementById(
                    "labAssistantFirstDone"
                ).checked;

            const now = Date.now();

            // availableAt SIEMPRE deriva del cooldown global guardado.
            // Si el cooldown global ya paso, el asistente queda disponible ya.
            const availableAt =
                account.sharedHelperCooldown > now
                    ? account.sharedHelperCooldown
                    : now;

            account.laboratory.assistant = {

                level,

                sleepUntil: 0,

                availableAt,

                enabled: true,

                keepWorking,

                firstDone
            };

            saveAccounts();
            renderAccounts();

            document
                .getElementById(
                    "labAssistantModal"
                )
                .classList.add("hidden");
        }
    );
}

// =========================
// RENDER LAB
// =========================

function renderLaboratory(account) {

    const research =
        account.laboratory.research;

    const assistant =
        account.laboratory.assistant;

    const assistantAssigned =
        assistant &&
        assistant.enabled;

    let status = "Libre";
    let timerClass = "compact-timer timer-free";

    if (research.finishTime) {

        const remaining =
            research.finishTime - Date.now();

        if (remaining > 0) {
            status = formatTime(remaining);
            timerClass = remaining < 3600000
                ? "compact-timer timer-warning"
                : "compact-timer";
        } else {
            status = "Finalizado";
            timerClass = "compact-timer timer-finished";
        }
    }

    return `

        <div class="compact-row has-laboratory ${assistantAssigned ? 'has-assistant' : ''}">

            <div class="compact-info">

                <div class="compact-title">
                    Investigación
                </div>

                <div class="compact-name">
                    ${research.name || "Sin investigacion"}
                </div>

                <div
                    class="${timerClass}"
                    id="lab-timer-${account.id}"
                >
                    ${status}
                </div>

                ${
                    assistantAssigned
                    ? `<div class="assistant-badge">Asistente</div>`
                    : `<div></div>`
                }

            </div>

            <div class="compact-actions">

                <button
                    class="start-btn"
                    onclick="openLaboratoryMenu(${account.id})"
                >
                    Configurar
                </button>

                <button
                    class="clear-btn"
                    onclick="clearLaboratory(${account.id})"
                >
                    Limpiar
                </button>

            </div>

        </div>

    `;
}

// =========================
// RENDER ASSISTANT
// =========================

function renderLabAssistant(account) {

    const assistant = account.laboratory.assistant;
    const now = Date.now();

    let assistantStatus = "Disponible";
    let statusColor = "#4ade80";

    if (assistant.availableAt > now) {
        assistantStatus = formatTime(assistant.availableAt - now);
        statusColor = "#78ffa9";
    }

    return `

        <div class="mini-special-card">

            <div class="mini-special-icon">
                <img class="icon-asistente" src="img/asistente-lab.png" alt="">
            </div>

            <div class="mini-special-title">
                Asistente Laboratorio
            </div>

            <div class="mini-special-level">
                Nivel ${assistant.level}
            </div>

            <div
                class="mini-special-status"
                id="assistant-timer-${account.id}"
                style="color: ${statusColor}"
            >
                ${assistantStatus}
            </div>

            <div class="mini-special-buttons">

                <button
                    class="start-btn"
                    onclick="configureLabAssistant(${account.id})"
                >
                    Configurar
                </button>

                <button
                    class="clear-btn"
                    onclick="clearLabAssistant(${account.id})"
                >
                    Limpiar
                </button>

            </div>

        </div>
    `;
}

// =========================
// CLEAR LAB
// =========================

function clearLaboratory(accountId) {

    const account =
        accounts.find(
            acc => acc.id === accountId
        );

    account.laboratory.research = {

        name: "",

        finishTime: null
    };

    saveAccounts();
    renderAccounts();
}

// =========================
// CLEAR LAB ASSISTANT
// =========================

function clearLabAssistant(accountId) {

    const account =
        accounts.find(
            acc => acc.id === accountId
        );

    account.laboratory.assistant = {

        level: 1,

        availableAt: Date.now(),

        enabled: false
    };

    saveAccounts();

    renderAccounts();
}

// =========================
// UPDATE LAB TIMERS
// =========================

function updateLaboratoryTimers() {

    accounts.forEach(account => {

        const research =
            account.laboratory.research;

        const assistant =
            account.laboratory.assistant;

        const timer =
            document.getElementById(
                `lab-timer-${account.id}`
            );

        const assistantTimer =
            document.getElementById(
                `assistant-timer-${account.id}`
            );

        // LAB TIMER
        if (timer && research.finishTime) {

            const remaining =
                research.finishTime - Date.now();

            if (remaining > 0) {
                timer.textContent = formatTime(remaining);
                timer.className = remaining < 3600000
                    ? "compact-timer timer-warning"
                    : "compact-timer";
            } else {
                timer.textContent = "Finalizado";
                timer.className = "compact-timer timer-finished";
            }
        }

        // ASSISTANT TIMER
        const now = Date.now();

        if (assistantTimer) {

            if (assistant.availableAt > now) {
                assistantTimer.textContent = formatTime(assistant.availableAt - now);
                assistantTimer.style.color = "#78ffa9";
            } else {
                assistantTimer.textContent = "Disponible";
                assistantTimer.style.color = "#4ade80";
            }
        }

        // ASSISTANT LOGIC
        if (assistant.enabled && assistant.availableAt <= now) {

            const researchActive =
                research.finishTime &&
                research.finishTime > now;

            if (researchActive) {

                const reductionMs =
                    assistant.level * 60 * 60 * 1000;

                research.finishTime -= reductionMs;

                // SOLO usar sharedHelperCooldown existente si es futuro.
                // Nunca recalcular desde now + 23h aquí para no romper el timer guardado.
                const existingCooldown = account.sharedHelperCooldown;
                const newCooldown = existingCooldown > now
                    ? existingCooldown
                    : now + (23 * 60 * 60 * 1000);

                // Solo actualizar sharedHelperCooldown si no había uno activo
                if (existingCooldown <= now) {
                    account.sharedHelperCooldown = newCooldown;
                }

                assistant.availableAt = account.sharedHelperCooldown;
                assistant.firstDone = true;

                if (!assistant.keepWorking) {
                    assistant.enabled = false;
                }

                saveAccounts();

            } else if (assistant.keepWorking) {

                assistant.enabled = false;
                assistant.keepWorking = false;
                saveAccounts();
            }
        }
    });
}

// =========================
// GOBLIN LAB
// =========================

function openGoblinLabMenu(accountId) {

    currentLaboratoryAccount = accountId;
    currentLaboratoryTarget = "goblin";

    const account = accounts.find(acc => acc.id === accountId);
    const gl = account.goblinLab;

    document.getElementById("laboratoryName").value = gl.name || "";
    document.getElementById("laboratoryDays").value = "";
    document.getElementById("laboratoryHours").value = "";
    document.getElementById("laboratoryMinutes").value = "";

    document
        .getElementById("laboratoryModal")
        .classList.remove("hidden");
}

function renderGoblinLab(account) {

    const gl = account.goblinLab;

    let status = "Libre";
    let timerClass = "compact-timer timer-free";

    if (gl.finishTime) {

        const remaining = gl.finishTime - Date.now();

        if (remaining > 0) {
            status = formatTime(remaining);
            timerClass = remaining < 3600000
                ? "compact-timer timer-warning"
                : "compact-timer";
        } else {
            status = "Finalizado";
            timerClass = "compact-timer timer-finished";
        }
    }

    const assistantAssigned =
        account.laboratory.assistant &&
        account.laboratory.assistant.enabled &&
        account.laboratory.assistant.assignedTarget === "goblin";

    return `
        <div class="compact-row goblin-row ${assistantAssigned ? 'has-assistant' : ''}">

            <div class="compact-info">

                <div class="compact-title">
                    <img class="goblin-swindler" src="img/duende_estafador.png" alt="Estafador"> Duende
                </div>

                <div class="compact-name"
                    id="status-goblin-lab-${account.id}"
                >
                    ${gl.name || "Sin investigacion"}
                </div>

                <div
                    class="${timerClass}"
                    id="timer-goblin-lab-${account.id}"
                >
                    ${status}
                </div>

                <div></div>

            </div>

            <div class="compact-actions">

                <button
                    class="start-btn"
                    onclick="openGoblinLabMenu(${account.id})"
                >
                    Configurar
                </button>

                <button
                    class="clear-btn"
                    onclick="clearGoblinLab(${account.id})"
                >
                    Limpiar
                </button>

            </div>

        </div>
    `;
}

function clearGoblinLab(accountId) {

    const account =
        accounts.find(acc => acc.id === accountId);

    account.goblinLab = {
        name: "",
        finishTime: null
    };

    saveAccounts();
    renderAccounts();
}

function updateGoblinLabTimers() {

    accounts.forEach(account => {

        const gl = account.goblinLab;

        const timerEl = document.getElementById(
            `timer-goblin-lab-${account.id}`
        );

        if (!timerEl) return;

        if (!gl.finishTime) {
            timerEl.textContent = "Libre";
            timerEl.className = "compact-timer timer-free";
            return;
        }

        const remaining = gl.finishTime - Date.now();

        if (remaining > 0) {
            timerEl.textContent = formatTime(remaining);
            timerEl.className = remaining < 3600000
                ? "compact-timer timer-warning"
                : "compact-timer";
        } else {
            timerEl.textContent = "Finalizado";
            timerEl.className = "compact-timer timer-finished";
        }
    });
}