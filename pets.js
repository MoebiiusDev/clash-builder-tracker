// =========================
// PET STATE
// =========================

let currentPetsAccount = null;

// =========================
// OPEN PET MENU
// =========================

function openPetsMenu(accountId) {

    currentPetsAccount = accountId;

    document
        .getElementById("petsModal")
        .classList.remove("hidden");
}

// =========================
// CLOSE MODAL
// =========================

const closePetsBtn =
    document.getElementById(
        "closePetsBtn"
    );

if (closePetsBtn) {

    closePetsBtn.addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "petsModal"
                )
                .classList.add("hidden");
        }
    );
}

// =========================
// SAVE PET
// =========================

const savePetsBtn =
    document.getElementById(
        "savePetsBtn"
    );

if (savePetsBtn) {

    savePetsBtn.addEventListener(
        "click",
        () => {

            const account =
                accounts.find(
                    acc => acc.id === currentPetsAccount
                );

            const name =
                document.getElementById(
                    "petsName"
                ).value;

            const days =
                parseInt(
                    document.getElementById(
                        "petsDays"
                    ).value
                ) || 0;

            const hours =
                parseInt(
                    document.getElementById(
                        "petsHours"
                    ).value
                ) || 0;

            const minutes =
                parseInt(
                    document.getElementById(
                        "petsMinutes"
                    ).value
                ) || 0;

            const totalMs =
                (days * 24 * 60 * 60 * 1000) +
                (hours * 60 * 60 * 1000) +
                (minutes * 60 * 1000);

            account.pets = {

                name,

                finishTime:
                    Date.now() + totalMs
            };

            saveAccounts();

            renderAccounts();

            document
                .getElementById(
                    "petsModal"
                )
                .classList.add("hidden");
        }
    );
}

// =========================
// RENDER PETS
// =========================

function renderPets(account) {

    const pets =
        account.pets || {

            name: "",

            finishTime: null
        };

    let status = "Libre";

    if (pets.finishTime) {

        const remaining =
            pets.finishTime - Date.now();

        if (remaining > 0) {

            status =
                formatTime(remaining);

        } else {

            status = "Finalizado";
        }
    }

    return `

        <div class="compact-row has-pets">

            <div class="compact-info">

                <div class="compact-title">
                    Mascota
                </div>

                <div class="compact-name">
                    ${pets.name || "Sin mejora"}
                </div>

                <div
                    class="compact-timer"
                    id="pets-timer-${account.id}"
                >
                    ${status}
                </div>

                <div></div>

            </div>

            <div class="compact-actions">

                <button
                    class="start-btn"
                    onclick="openPetsMenu(${account.id})"
                >
                    Configurar
                </button>

                <button
                    class="clear-btn"
                    onclick="clearPets(${account.id})"
                >
                    Limpiar
                </button>

            </div>

        </div>

    `;
}

// =========================
// CLEAR
// =========================

function clearPets(accountId) {

    const account =
        accounts.find(
            acc => acc.id === accountId
        );

    account.pets = {

        name: "",

        finishTime: null
    };

    saveAccounts();

    renderAccounts();
}

// =========================
// UPDATE PET TIMERS
// =========================

function updatePetsTimers() {

    accounts.forEach(account => {

        const pets =
            account.pets;

        const timer =
            document.getElementById(
                `pets-timer-${account.id}`
            );

        if (
            timer &&
            pets.finishTime
        ) {

            const remaining =
                pets.finishTime - Date.now();

            if (remaining > 0) {

                timer.textContent =
                    formatTime(remaining);

            } else {

                timer.textContent =
                    "Finalizado";
            }
        }
    });
}