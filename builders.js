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

        account.builders[currentBuilderIndex] = {

            building,

            finishTime: Date.now() + totalMs
        };

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

        let availableAt = Date.now();

        if (sleeping) {

            availableAt =
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

            availableAt,

            enabled: true
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

    let html = "";

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

        html += `
            <div class="builder-card">

                <h3>Builder ${index + 1}</h3>

                <div
                    class="builder-status ${statusClass}"
                    id="status-${account.id}-${index}"
                >
                    ${builder.building || "Sin construcción"}
                </div>

                <div
                    class="builder-time"
                    id="timer-${account.id}-${index}"
                >
                    ${timeText}
                </div>

                <div class="card-buttons">

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

    return html;
}

// =========================
// RENDER APPRENTICE
// =========================

function renderApprentice(account) {

    const apprentice = account.apprentice;

    let apprenticeStatus = "⚡ Disponible";

    if (apprentice.availableAt > Date.now()) {

        apprenticeStatus =
            "💤 " +
            formatTime(
                apprentice.availableAt - Date.now()
            );
    }

    return `
        <div class="builder-card apprentice-card">

            <h3>Constructor Aprendiz</h3>

            <div class="builder-status">
                Nivel ${apprentice.level}
            </div>

            <div
    class="builder-time"
    id="apprentice-timer-${account.id}"
>
    ${apprenticeStatus}
</div>

            <div class="builder-status">

                ${apprentice.assignedBuilder !== null

            ? `Asignado a Builder ${apprentice.assignedBuilder + 1
            }`

            : "Sin asignar"
        }

            </div>


            <div class="card-buttons">

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

        const apprenticeTimerElement =
            document.getElementById(
                `apprentice-timer-${account.id}`
            );

        if (apprenticeTimerElement) {

            if (apprentice.availableAt > Date.now()) {

                apprenticeTimerElement.textContent =
                    "💤 " +
                    formatTime(
                        apprentice.availableAt - Date.now()
                    );

            } else {

                apprenticeTimerElement.textContent =
                    "⚡ Disponible";
            }
        }

        // =========================
        // APPRENTICE LOGIC
        // =========================

        if (
            apprentice.enabled &&
            apprentice.assignedBuilder !== null &&
            apprentice.availableAt <= Date.now()
        ) {

            const builder =
                account.builders[
                apprentice.assignedBuilder
                ];

            if (
                builder &&
                builder.finishTime &&
                builder.finishTime > Date.now()
            ) {

                const reductionMs =
                    apprentice.level *
                    60 *
                    60 *
                    1000;

                builder.finishTime -= reductionMs;

                apprentice.availableAt =
                    Date.now() +
                    (
                        23 *
                        60 *
                        60 *
                        1000
                    );

                apprentice.enabled = false;

                saveAccounts();
            }
        }
    });
}