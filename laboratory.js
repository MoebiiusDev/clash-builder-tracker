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

            const sleeping =
                document.getElementById(
                    "labAssistantSleeping"
                ).checked;

            const hours =
                parseInt(
                    document.getElementById(
                        "labAssistantCooldownHours"
                    ).value
                ) || 0;

            const minutes =
                parseInt(
                    document.getElementById(
                        "labAssistantCooldownMinutes"
                    ).value
                ) || 0;

            const keepWorking =
                document.getElementById(
                    "labAssistantKeepWorking"
                ).checked;

            // sleepUntil: espera antes de trabajar
            let sleepUntil = Date.now();

            if (sleeping) {
                sleepUntil =
                    Date.now() +
                    (
                        (hours * 60 * 60 * 1000) +
                        (minutes * 60 * 1000)
                    );
            }

            account.laboratory.assistant = {

                level,

                sleepUntil,

                // availableAt = cooldown POST-trabajo, empieza en 0
                availableAt: Date.now(),

                enabled: true,

                keepWorking
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

    if (research.finishTime) {

        const remaining =
            research.finishTime - Date.now();

        if (remaining > 0) {

            status =
                formatTime(remaining);

        } else {

            status = "Finalizado";
        }
    }

    return `

        <div class="compact-row ${assistantAssigned ? 'has-assistant' : ''}">

            <div class="compact-info">

                <div class="compact-title">
                    Laboratorio
                </div>

                <div class="compact-name">
                    ${research.name || "Sin investigación"}
                </div>

                <div
                    class="compact-timer"
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

    let assistantStatus = "⚡ Disponible";

    if (assistant.sleepUntil && assistant.sleepUntil > now) {

        assistantStatus =
            "😴 " + formatTime(assistant.sleepUntil - now);

    } else if (assistant.availableAt > now) {

        assistantStatus =
            "💤 " + formatTime(assistant.availableAt - now);
    }

    return `

        <div class="mini-special-card">

            <div class="mini-special-icon">
                🧪
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

        // =========================
        // LAB TIMER
        // =========================

        if (
            timer &&
            research.finishTime
        ) {

            const remaining =
                research.finishTime - Date.now();

            if (remaining > 0) {

                timer.textContent =
                    formatTime(remaining);

            } else {

                timer.textContent =
                    "Finalizado";
            }
        }

        // =========================
        // ASSISTANT TIMER
        // =========================

        const now = Date.now();

        if (assistantTimer) {

            if (assistant.sleepUntil && assistant.sleepUntil > now) {

                assistantTimer.textContent =
                    "😴 " + formatTime(assistant.sleepUntil - now);

            } else if (assistant.availableAt > now) {

                assistantTimer.textContent =
                    "💤 " + formatTime(assistant.availableAt - now);

            } else {

                assistantTimer.textContent = "⚡ Disponible";
            }
        }

        // =========================
        // ASSISTANT LOGIC
        // =========================

        if (
            assistant.enabled &&
            (!assistant.sleepUntil || assistant.sleepUntil <= now) &&
            assistant.availableAt <= now
        ) {
            const researchActive =
                research.finishTime &&
                research.finishTime > now;

            if (researchActive) {

                const reductionMs =
                    assistant.level * 60 * 60 * 1000;

                research.finishTime -= reductionMs;

                // Cooldown post-trabajo sincronizado
                const newCooldown = now + (23 * 60 * 60 * 1000);

                account.sharedHelperCooldown = newCooldown;
                assistant.availableAt = newCooldown;
                assistant.sleepUntil = 0;

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
// GOBLIN LAB — abre modal estándar de laboratorio
// =========================

function openGoblinLabMenu(accountId) {

    currentLaboratoryAccount = accountId;
    currentLaboratoryTarget = "goblin"; // clave especial

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

// =========================
// RENDER GOBLIN LAB (fila verde en investigación)
// =========================

function renderGoblinLab(account) {

    const gl = account.goblinLab;

    let status = "Libre";

    if (gl.finishTime) {

        const remaining = gl.finishTime - Date.now();

        if (remaining > 0) {
            status = formatTime(remaining);
        } else {
            status = "Finalizado";
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

                <div class="compact-name builder-free"
                    id="status-goblin-lab-${account.id}"
                >
                    ${gl.name || "Sin investigación"}
                </div>

                <div
                    class="compact-timer"
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

// =========================
// CLEAR GOBLIN LAB
// =========================

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

// =========================
// UPDATE GOBLIN LAB TIMER
// =========================

function updateGoblinLabTimers() {

    accounts.forEach(account => {

        const gl = account.goblinLab;

        const timerEl = document.getElementById(
            `timer-goblin-lab-${account.id}`
        );

        if (!timerEl) return;

        if (!gl.finishTime) {
            timerEl.textContent = "Libre";
            return;
        }

        const remaining = gl.finishTime - Date.now();

        if (remaining > 0) {
            timerEl.textContent = formatTime(remaining);
        } else {
            timerEl.textContent = "Finalizado";
        }
    });
}