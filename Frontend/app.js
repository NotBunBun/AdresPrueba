const API_URL = "http://localhost:3000";

const addBtn = document.getElementById("add-btn");
const formModal = document.getElementById("form-modal");
const closeModalBtn = document.getElementById("close-modal");
const modalTitle = document.getElementById("modal-title");
const form = document.getElementById("acquisition-form");
const acquisitionIdField = document.getElementById("acquisition-id");
const budgetField = document.getElementById("budget");
const unitField = document.getElementById("unit");
const typeField = document.getElementById("type");
const quantityField = document.getElementById("quantity");
const unitValueField = document.getElementById("unitValue");
const totalValueField = document.getElementById("totalValue");
const acquisitionDateField = document.getElementById("acquisitionDate");
const providerField = document.getElementById("provider");
const documentationField = document.getElementById("documentation");
const cancelBtn = document.getElementById("cancel-btn");
const tableBody = document.getElementById("acquisitions-table");
const filterText = document.getElementById("filter-text");
const filterBtn = document.getElementById("filter-btn");
const themeToggleBtn = document.getElementById("theme-toggle");

themeToggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
});

window.addEventListener("DOMContentLoaded", () => {
  loadAcquisitions();
});

addBtn.addEventListener("click", () => {
  openModal("Nueva Adquisición");
});

cancelBtn.addEventListener("click", closeModal);
document.getElementById("close-modal").addEventListener("click", closeModal);

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    budget: budgetField.value,
    unit: unitField.value,
    type: typeField.value,
    quantity: parseInt(quantityField.value),
    unitValue: parseFloat(unitValueField.value),
    totalValue: parseFloat(totalValueField.value),
    acquisitionDate: acquisitionDateField.value,
    provider: providerField.value,
    documentation: documentationField.value,
  };

  const id = acquisitionIdField.value;

  if (id) {
    await fetch(`${API_URL}/adquisiciones/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } else {
    await fetch(`${API_URL}/adquisiciones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  }

  form.reset();
  acquisitionIdField.value = "";
  closeModal();
  loadAcquisitions();
});

filterBtn.addEventListener("click", () => {
  const text = filterText.value.trim().toLowerCase();
  loadAcquisitions(text);
});

/* ----------------------------
   Funciones Auxiliares
-----------------------------*/

async function loadAcquisitions(filter = "") {
  const res = await fetch(`${API_URL}/adquisiciones`);
  const acquisitions = await res.json();

  const filtered = acquisitions.filter((a) => {
    const fullText = (a.provider + a.unit + a.type).toLowerCase();
    return fullText.includes(filter);
  });

  renderTable(filtered);
}

function renderTable(acquisitions) {
  tableBody.innerHTML = "";
  acquisitions.forEach((acq) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${acq.id}</td>
      <td>${acq.budget}</td>
      <td>${acq.unit}</td>
      <td>${acq.type}</td>
      <td>${acq.quantity}</td>
      <td>${acq.unitValue}</td>
      <td>${acq.totalValue}</td>
      <td>${acq.acquisitionDate}</td>
      <td>${acq.provider}</td>
      <td>${acq.documentation}</td>
      <td>${acq.active ? "Activo" : "Desactivado"}</td>
      <td>
        <button class="edit-btn" data-id="${acq.id}">Editar</button>
        <button class="deactivate-btn" data-id="${acq.id}">Desactivar</button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  document.querySelectorAll(".edit-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.getAttribute("data-id");
      const acq = await getAcquisitionById(id);
      fillForm(acq);
      openModal("Editar Adquisición");
    });
  });

  document.querySelectorAll(".deactivate-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.getAttribute("data-id");
      await deactivateAcquisition(id);
      loadAcquisitions();
    });
  });
}

async function getAcquisitionById(id) {
  const res = await fetch(`${API_URL}/adquisiciones/${id}`);
  return await res.json();
}

async function deactivateAcquisition(id) {
  await fetch(`${API_URL}/adquisiciones/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ active: false }),
  });
}

function fillForm(acq) {
  acquisitionIdField.value = acq.id;
  budgetField.value = acq.budget;
  unitField.value = acq.unit;
  typeField.value = acq.type;
  quantityField.value = acq.quantity;
  unitValueField.value = acq.unitValue;
  totalValueField.value = acq.totalValue;
  acquisitionDateField.value = acq.acquisitionDate;
  providerField.value = acq.provider;
  documentationField.value = acq.documentation;
}

function openModal(titleText) {
  modalTitle.textContent = titleText;
  formModal.style.display = "block";
}

function closeModal() {
  formModal.style.display = "none";
  form.reset();
  acquisitionIdField.value = "";
}
