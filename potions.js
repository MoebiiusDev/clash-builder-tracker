// =========================
// POTIONS STATE
// =========================

let currentPotionAccount = null;
let currentPotionType = null;

// Reducción por poción según tipo
const POTION_REDUCTION = {
    builder:  9  * 60 * 60 * 1000,   // 9h por builder activo
    research: 23 * 60 * 60 * 1000,   // 23h por poción
    pet:      23 * 60 * 60 * 1000    // 23h por poción
};

// =========================
// OPEN POTION MODAL
// =========================

function openPotionModal(accountId, type) {

    currentPotionAccount = accountId;
    currentPotionType = type;

    const titles = {
        builder:  "⚗️ Poción de Constructor",
        research: "🔬 Poción de Investigación",
        pet:      "🐾 Poción de Mascotas"
    };

    const descriptions = {
        builder:  "Reduce <strong>9 horas</strong> por cada constructor activo<br>(incluyendo duende si está trabajando)",
        research: "Reduce <strong>23 horas</strong> de investigación activa<br>(incluyendo duende de laboratorio)",
        pet:      "Reduce <strong>23 horas</strong> de la mejora de mascota activa"
    };

    document.getElementById("potionModalTitle").textContent =
        titles[type];

    document.getElementById("potionModalDesc").innerHTML =
        descriptions[type];

    document.getElementById("potionCount").value = 1;

    // Mostrar preview de reducción
    updatePotionPreview(accountId, type, 1);

    document
        .getElementById("potionModal")
        .classList.remove("hidden");
}

// =========================
// CLOSE MODAL
// =========================

document
    .getElementById("closePotionBtn")
    .addEventListener("click", () => {
        document
            .getElementById("potionModal")
            .classList.add("hidden");
    });

// =========================
// PREVIEW EN TIEMPO REAL
// =========================

document
    .getElementById("potionCount")
    .addEventListener("input", () => {

        const count =
            parseInt(document.getElementById("potionCount").value) || 1;

        updatePotionPreview(
            currentPotionAccount,
            currentPotionType,
            count
        );
    });

function updatePotionPreview(accountId, type, count) {

    const account = accounts.find(acc => acc.id === accountId);
    const preview = document.getElementById("potionPreview");

    if (!account || !preview) return;

    const reduction = calculateReduction(account, type, count);

    if (reduction === 0) {
        preview.textContent = "No hay tareas activas para reducir.";
        preview.style.color = "#666";
        return;
    }

    const totalMs = reduction;
    const hours   = Math.floor(totalMs / 3600000);
    const minutes = Math.floor((totalMs % 3600000) / 60000);

    preview.innerHTML =
        `Reducción total: <strong style="color:#78ffa9">${hours}h ${minutes}m</strong>`;
    preview.style.color = "#aaa";
}

function calculateReduction(account, type, count) {

    const now = Date.now();
    let totalReduction = 0;

    if (type === "builder") {

        // Contar builders activos (incluyendo duende)
        const activeBuilders = account.builders.filter(
            b => b.finishTime && b.finishTime > now
        ).length;

        const goblinActive =
            account.goblinBuilder.finishTime &&
            account.goblinBuilder.finishTime > now;

        const totalActive = activeBuilders + (goblinActive ? 1 : 0);

        totalReduction =
            POTION_REDUCTION.builder * totalActive * count;

    } else if (type === "research") {

        const mainActive =
            account.laboratory.research.finishTime &&
            account.laboratory.research.finishTime > now;

        const goblinActive =
            account.goblinLab.finishTime &&
            account.goblinLab.finishTime > now;

        const targets = (mainActive ? 1 : 0) + (goblinActive ? 1 : 0);

        totalReduction = POTION_REDUCTION.research * targets * count;

    } else if (type === "pet") {

        const petActive =
            account.pets.finishTime &&
            account.pets.finishTime > now;

        if (petActive) {
            totalReduction = POTION_REDUCTION.pet * count;
        }
    }

    return totalReduction;
}

// =========================
// APPLY POTION
// =========================

document
    .getElementById("applyPotionBtn")
    .addEventListener("click", () => {

        const account =
            accounts.find(acc => acc.id === currentPotionAccount);

        const count =
            Math.max(
                1,
                parseInt(document.getElementById("potionCount").value) || 1
            );

        const now = Date.now();

        if (currentPotionType === "builder") {

            const reductionPerBuilder =
                POTION_REDUCTION.builder * count;

            // Aplicar a cada builder activo
            account.builders.forEach(builder => {
                if (builder.finishTime && builder.finishTime > now) {
                    builder.finishTime = Math.max(
                        now,
                        builder.finishTime - reductionPerBuilder
                    );
                }
            });

            // Aplicar al duende constructor si está activo
            if (
                account.goblinBuilder.finishTime &&
                account.goblinBuilder.finishTime > now
            ) {
                account.goblinBuilder.finishTime = Math.max(
                    now,
                    account.goblinBuilder.finishTime - reductionPerBuilder
                );
            }

        } else if (currentPotionType === "research") {

            const reductionPerLab =
                POTION_REDUCTION.research * count;

            // Lab principal
            if (
                account.laboratory.research.finishTime &&
                account.laboratory.research.finishTime > now
            ) {
                account.laboratory.research.finishTime = Math.max(
                    now,
                    account.laboratory.research.finishTime - reductionPerLab
                );
            }

            // Duende de laboratorio
            if (
                account.goblinLab.finishTime &&
                account.goblinLab.finishTime > now
            ) {
                account.goblinLab.finishTime = Math.max(
                    now,
                    account.goblinLab.finishTime - reductionPerLab
                );
            }

        } else if (currentPotionType === "pet") {

            const reduction = POTION_REDUCTION.pet * count;

            if (
                account.pets.finishTime &&
                account.pets.finishTime > now
            ) {
                account.pets.finishTime = Math.max(
                    now,
                    account.pets.finishTime - reduction
                );
            }
        }

        saveAccounts();
        renderAccounts();

        document
            .getElementById("potionModal")
            .classList.add("hidden");
    });