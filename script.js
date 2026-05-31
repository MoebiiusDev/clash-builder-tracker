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

    // BUILDERS
    if (!account.builders) {
        account.builders = [];
    }

    // CONSTRUCTOR APRENDIZ
    if (!account.apprentice) {

        account.apprentice = {

            level: 1,

            assignedBuilder: null,

            availableAt: Date.now(),

            enabled: false
        };
    }

    // LABORATORIO

    if (!account.laboratory) {

        account.laboratory = {

            research: {

                name: "",

                finishTime: null
            },

            assistant: {

                level: 1,

                availableAt: Date.now(),

                enabled: false
            }
        };
    }

    // FIX CUENTAS ANTIGUAS

    if (!account.laboratory.research) {

        account.laboratory.research = {

            name: "",

            finishTime: null
        };
    }

    if (!account.laboratory.assistant) {

        account.laboratory.assistant = {

            level: 1,

            availableAt: Date.now(),

            enabled: false
        };
    }

    // ASISTENTE LAB
    if (!account.labAssistant) {

        account.labAssistant = {

            level: 1,

            availableAt: Date.now(),

            enabled: false
        };
    }

    // MASCOTAS
    if (!account.pets) {

        account.pets = {

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
        document.getElementById("playerName")
            .value
            .trim();

    const builderCount =
        parseInt(
            document.getElementById("builderCount").value
        );

    if (!playerName) return;

    const account = {

        id: Date.now(),

        name: playerName,

        // =========================
        // BUILDERS
        // =========================

        builders: [],

        apprentice: {

            level: 1,

            assignedBuilder: null,

            availableAt: Date.now(),

            enabled: false
        },

        // =========================
        // LABORATORIO
        // =========================

        laboratory: {

            research: {

                name: "",

                finishTime: null
            },

            assistant: {

                level: 1,

                availableAt: Date.now(),

                enabled: false
            }
        },

        // =========================
        // MASCOTAS
        // =========================

        pets: {

            name: "",

            finishTime: null
        }
    };

    for (let i = 0; i < builderCount; i++) {

        account.builders.push({

            building: "",

            finishTime: null
        });
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

    localStorage.setItem(
        "clashAccounts",
        JSON.stringify(accounts)
    );
}

// =========================
// DELETE ACCOUNT
// =========================

function deleteAccount(accountId) {

    accounts =
        accounts.filter(
            acc => acc.id !== accountId
        );

    saveAccounts();
    renderAccounts();
}

// =========================
// FORMAT TIME
// =========================

function formatTime(ms) {

    const totalSeconds =
        Math.floor(ms / 1000);

    const days =
        Math.floor(totalSeconds / 86400);

    const hours =
        Math.floor(
            (totalSeconds % 86400) / 3600
        );

    const minutes =
        Math.floor(
            (totalSeconds % 3600) / 60
        );

    const seconds =
        totalSeconds % 60;

    return `
        ${days}d
        ${hours}h
        ${minutes}m
        ${seconds}s
    `;
}

// =========================
// RENDER
// =========================

function renderAccounts() {

    accountsContainer.innerHTML = "";

    accounts.forEach(account => {

        const card =
            document.createElement("div");

        card.className = "account-card";

        card.innerHTML = `

        <div class="account-header">

    <div class="account-name">

        👑 ${account.name}

    </div>

    <button
        class="delete-account-btn"
        onclick="deleteAccount(${account.id})"
    >
        Eliminar Cuenta
    </button>

</div>

<div class="account-layout">

    <div class="account-main">

        <div class="section-title">
            🔨 Constructores
        </div>

        ${renderBuilders(account)}

        <div class="section-title lb">
            🧪 Investigación
        </div>

        <div class="laboratory-grid">

            ${renderLaboratory(account)}

        </div>

        <div class="section-title lb">
            🐾 Mascotas
        </div>

        <div class="pets-grid">

            ${renderPets(account)}

        </div>

    </div>

    <div class="assistants-panel">

        <div class="assistants-title">

            Ayudantes

        </div>

        ${renderApprentice(account)}

        ${renderLabAssistant(account)}

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
}

setInterval(updateAllTimers, 1000);

renderAccounts();