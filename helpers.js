// =========================
// HELPERS STATE
// =========================

let currentHelperAccount = null;
let currentHelperType = null;

// =========================
// OPEN HELPER MODAL
// =========================

function configureHelper(accountId, type) {

    currentHelperAccount = accountId;
    currentHelperType = type;

    const titles = {
        alchemist: "⚗️ Alquimista",
        digger:    "⛏️ Picador"
    };

    document.getElementById("helperModalTitle").textContent =
        titles[type] || "Ayudante";

    // Mostrar nivel solo para alquimista
    const levelRow =
        document.getElementById("helperLevelRow");

    levelRow.style.display =
        type === "alchemist" ? "flex" : "none";

    const account =
        accounts.find(acc => acc.id === accountId);

    const helper = account.helpers[type];

    // Pre-llenar nivel si es alquimista
    if (type === "alchemist") {
        document.getElementById("helperLevel").value =
            helper.level || 1;
    }

    // Pre-llenar cooldown si está activo
    const remaining = helper.availableAt - Date.now();

    document.getElementById("helperCooldownHours").value =
        remaining > 0 ? Math.floor(remaining / 3600000) : "";

    document.getElementById("helperCooldownMinutes").value =
        remaining > 0
            ? Math.floor((remaining % 3600000) / 60000)
            : "";

    document
        .getElementById("helperModal")
        .classList.remove("hidden");
}

// =========================
// CLOSE MODAL
// =========================

document
    .getElementById("closeHelperBtn")
    .addEventListener("click", () => {
        document
            .getElementById("helperModal")
            .classList.add("hidden");
    });

// =========================
// SAVE HELPER (configurar cooldown manual)
// =========================

document
    .getElementById("saveHelperBtn")
    .addEventListener("click", () => {

        const account =
            accounts.find(
                acc => acc.id === currentHelperAccount
            );

        const hours =
            parseInt(
                document.getElementById("helperCooldownHours").value
            ) || 0;

        const minutes =
            parseInt(
                document.getElementById("helperCooldownMinutes").value
            ) || 0;

        const totalMs =
            (hours * 60 * 60 * 1000) +
            (minutes * 60 * 1000);

        account.helpers[currentHelperType].availableAt =
            Date.now() + totalMs;

        account.helpers[currentHelperType].active =
            totalMs > 0;

        if (currentHelperType === "alchemist") {
            account.helpers.alchemist.level =
                parseInt(
                    document.getElementById("helperLevel").value
                ) || 1;
        }

        saveAccounts();
        renderAccounts();

        document
            .getElementById("helperModal")
            .classList.add("hidden");
    });

// =========================
// ACTIVATE HELPER (botón activar con delay 3s)
// =========================

function activateHelper(accountId, type, cooldownMs) {

    const btn =
        document.getElementById(
            `activate-${type}-${accountId}`
        );

    if (btn) {
        btn.disabled = true;
        btn.textContent = "3...";

        let count = 2;

        const countdown = setInterval(() => {

            if (count > 0) {
                btn.textContent = `${count}...`;
                count--;
            } else {
                clearInterval(countdown);

                const account =
                    accounts.find(acc => acc.id === accountId);

                account.helpers[type].availableAt =
                    Date.now() + cooldownMs;

                account.helpers[type].active = true;

                saveAccounts();
                renderAccounts();
            }
        }, 1000);
    }
}

// =========================
// CLEAR HELPER
// =========================

function clearHelper(accountId, type) {

    const account =
        accounts.find(acc => acc.id === accountId);

    account.helpers[type].availableAt = Date.now();
    account.helpers[type].active = false;

    saveAccounts();
    renderAccounts();
}

// =========================
// RENDER ALCHEMIST
// =========================

function renderAlchemist(account) {

    const helper = account.helpers.alchemist;
    const remaining = helper.availableAt - Date.now();
    const isAvailable = remaining <= 0;
    const isActive = helper.active && !isAvailable;

    let statusText = "⚡ Disponible";
    let statusColor = "#4ade80";

    if (isActive) {
        statusText = "💤 " + formatTime(remaining);
        statusColor = "#f5c842";
    }

    // Cooldown por defecto: 24h (puede variar con nivel)
    const cooldownMs = 24 * 60 * 60 * 1000;

    return `
        <div class="mini-special-card ${isAvailable && helper.active ? 'helper-ready' : ''}">

            <div class="mini-special-icon">⚗️</div>

            <div class="mini-special-title">Alquimista</div>

            <div class="mini-special-level">
                Nivel ${helper.level || 1}
            </div>

            <div
                class="mini-special-status"
                id="helper-timer-alchemist-${account.id}"
                style="color: ${statusColor}"
            >
                ${statusText}
            </div>

            <div class="mini-special-buttons">

                <button
                    class="activate-btn ${isActive ? 'activate-btn-disabled' : ''}"
                    id="activate-alchemist-${account.id}"
                    onclick="activateHelper(${account.id}, 'alchemist', ${cooldownMs})"
                    ${isActive ? 'disabled' : ''}
                >
                    ${isActive ? 'Activa' : 'Activar'}
                </button>

                <button
                    class="start-btn"
                    onclick="configureHelper(${account.id}, 'alchemist')"
                >
                    Configurar
                </button>

                <button
                    class="clear-btn"
                    onclick="clearHelper(${account.id}, 'alchemist')"
                >
                    Limpiar
                </button>

            </div>

        </div>
    `;
}

// =========================
// RENDER DIGGER
// =========================

function renderDigger(account) {

    const helper = account.helpers.digger;
    const remaining = helper.availableAt - Date.now();
    const isAvailable = remaining <= 0;
    const isActive = helper.active && !isAvailable;

    let statusText = "⚡ Disponible";
    let statusColor = "#4ade80";

    if (isActive) {
        statusText = "💤 " + formatTime(remaining);
        statusColor = "#f5c842";
    }

    const cooldownMs = 24 * 60 * 60 * 1000;

    return `
        <div class="mini-special-card ${isAvailable && helper.active ? 'helper-ready' : ''}">

            <div class="mini-special-icon">⛏️</div>

            <div class="mini-special-title">Picador</div>

            <div class="mini-special-status"
                id="helper-timer-digger-${account.id}"
                style="color: ${statusColor}"
            >
                ${statusText}
            </div>

            <div class="mini-special-buttons">

                <button
                    class="activate-btn ${isActive ? 'activate-btn-disabled' : ''}"
                    id="activate-digger-${account.id}"
                    onclick="activateHelper(${account.id}, 'digger', ${cooldownMs})"
                    ${isActive ? 'disabled' : ''}
                >
                    ${isActive ? 'Activa' : 'Activar'}
                </button>

                <button
                    class="start-btn"
                    onclick="configureHelper(${account.id}, 'digger')"
                >
                    Configurar
                </button>

                <button
                    class="clear-btn"
                    onclick="clearHelper(${account.id}, 'digger')"
                >
                    Limpiar
                </button>

            </div>

        </div>
    `;
}

// =========================
// UPDATE HELPER TIMERS
// =========================

function updateHelperTimers() {

    accounts.forEach(account => {

        ["alchemist", "digger"].forEach(type => {

            const helper = account.helpers[type];

            const el = document.getElementById(
                `helper-timer-${type}-${account.id}`
            );

            const card = el ? el.closest(".mini-special-card") : null;

            if (!el) return;

            const remaining = helper.availableAt - Date.now();

            if (helper.active && remaining > 0) {

                el.textContent = "💤 " + formatTime(remaining);
                el.style.color = "#f5c842";

                if (card) card.classList.remove("helper-ready");

            } else if (helper.active) {

                el.textContent = "⚡ Disponible";
                el.style.color = "#4ade80";

                if (card) card.classList.add("helper-ready");

                // Re-habilitar botón activar
                const btn = document.getElementById(
                    `activate-${type}-${account.id}`
                );
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = "Activar";
                    btn.classList.remove("activate-btn-disabled");
                }
            }
        });
    });
}