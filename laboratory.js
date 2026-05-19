// =========================
// LABORATORY STATE
// =========================

let currentLaboratoryAccount = null;

// =========================
// OPEN LAB MENU
// =========================

function openLaboratoryMenu(accountId) {

    currentLaboratoryAccount = accountId;

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

            account.laboratory.research = {

                name,

                finishTime:
                    Date.now() + totalMs
            };

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

            let availableAt = Date.now();

            if (sleeping) {

                availableAt =
                    Date.now() +
                    (
                        (hours * 60 * 60 * 1000) +
                        (minutes * 60 * 1000)
                    );
            }

            account.laboratory.assistant = {

                level,

                availableAt,

                enabled: true
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
        <div class="lab-card">

            <h3>Laboratorio</h3>

            <div class="builder-status">
                ${research.name || "Sin investigación"}
            </div>

            <div
                class="builder-time"
                id="lab-timer-${account.id}"
            >
                ${status}
            </div>

        <div class="card-buttons"> 
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

    const assistant =
        account.laboratory.assistant;

    let status = "⚡ Disponible";

    if (assistant.availableAt > Date.now()) {

        status =
            "💤 " +
            formatTime(
                assistant.availableAt - Date.now()
            );
    }

    return `
        <div class="lab-card assistant-card">

            <h3>Asistente</h3>

            <div class="builder-status">
                Nivel ${assistant.level}
            </div>

            <div
                class="builder-time"
                id="assistant-timer-${account.id}"
            >
                ${status}
            </div>

<div class="card-buttons">

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

        if (assistantTimer) {

            if (
                assistant.availableAt > Date.now()
            ) {

                assistantTimer.textContent =
                    "💤 " +
                    formatTime(
                        assistant.availableAt - Date.now()
                    );

            } else {

                assistantTimer.textContent =
                    "⚡ Disponible";
            }
        }

        // =========================
        // ASSISTANT LOGIC
        // =========================

        if (
            assistant.enabled &&
            assistant.availableAt <= Date.now() &&
            research.finishTime &&
            research.finishTime > Date.now()
        ) {

            const reductionMs =
                assistant.level *
                60 *
                60 *
                1000;

            research.finishTime -= reductionMs;

            assistant.availableAt =
                Date.now() +
                (
                    23 *
                    60 *
                    60 *
                    1000
                );

            assistant.enabled = false;

            saveAccounts();
        }
    });
}