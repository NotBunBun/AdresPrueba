// app.js

const API_URL = `http://localhost:3000/adquisiciones`;

document.addEventListener('DOMContentLoaded', () => {
  // — Tema y persistencia —
  const toggleThemeBtn = document.getElementById('toggleTheme');
  if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-theme');
  toggleThemeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme',
      document.body.classList.contains('dark-theme') ? 'dark' : 'light'
    );
  });

  // — Modal de registro —
  const modal = document.getElementById('acquisitionModal');
  const openBtn = document.getElementById('newAcquisitionBtn');
  const closeElements = document.querySelectorAll('.close, .close-btn');
  openBtn.addEventListener('click', () => modal.classList.add('open'));
  closeElements.forEach(el => el.addEventListener('click', () => {
    modal.classList.remove('open');
    form.reset(); clearErrors(); totalInput.value = '';
  }));

  // — Campos del formulario —
  const form = document.getElementById('acquisitionForm');
  const dateInput = document.getElementById('date');
  const budgetInput = document.getElementById('budget');
  const unitTextInput = document.getElementById('unit');
  const typeInput = document.getElementById('type');
  const qtyInput = document.getElementById('quantity');
  const unitValueInput = document.getElementById('unitValue');
  const totalInput = document.getElementById('totalValue');
  const providerInput = document.getElementById('provider');
  const documentationInput = document.getElementById('documentation');
  const statusSelect = document.getElementById('status');

  // — Cálculo automático de Valor Total —
  function calculateTotal() {
    const q = parseFloat(qtyInput.value),
          u = parseFloat(unitValueInput.value);
    totalInput.value = (!isNaN(q) && !isNaN(u))
      ? (q * u).toFixed(2)
      : '';
  }
  qtyInput.addEventListener('input', calculateTotal);
  unitValueInput.addEventListener('input', calculateTotal);

  // — Manejo de errores —
  function clearErrors() {
    form.querySelectorAll('.error').forEach(el => el.textContent = '');
  }
  function showError(input, msg) {
    input.parentElement.querySelector('.error').textContent = msg;
  }

  // — Envío de formulario —
  form.addEventListener('submit', async e => {
    e.preventDefault();
    clearErrors();

    const inputs = [
      dateInput, budgetInput, unitTextInput, typeInput,
      qtyInput, unitValueInput, providerInput,
      documentationInput, statusSelect
    ];
    let valid = true;
    inputs.forEach(input => {
      if (!input.checkValidity()) {
        valid = false;
        showError(input,
          input.validity.valueMissing
            ? 'Este campo es obligatorio.'
            : 'Formato inválido.'
        );
      }
    });

    calculateTotal();
    if (!valid) return;

    const payload = {
      date:      dateInput.value,
      budget:    Number(budgetInput.value.replace(/\D/g,'')),
      unit:      unitTextInput.value.trim(),
      type:      typeInput.value.trim(),
      quantity:  parseInt(qtyInput.value, 10),
      unitValue: parseFloat(unitValueInput.value),
      totalValue: parseFloat(totalInput.value) || 0,
      provider:  providerInput.value.trim(),
      documentation: documentationInput.value.trim(),
      status:    statusSelect.value
    };

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Error al guardar adquisición');
      await loadAcquisitions();
      modal.classList.remove('open');
    } catch (err) {
      console.error(err);
      alert('No se pudo guardar la adquisición. Revisa la consola.');
    }
  });

  // — Carga y renderizado de la tabla —
  async function loadAcquisitions() {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`Fetch falló: ${res.status}`);
      renderAcquisitions(await res.json());
    } catch (err) {
      console.error('No se pudieron cargar las adquisiciones:', err);
    }
  }

  function renderAcquisitions(list) {
    const tbody = document.getElementById('acquisitionsList');
    tbody.innerHTML = '';
    const fmtCurrency = v => Number(v).toLocaleString('es-CO', {
      style: 'currency', currency: 'COP'
    });
    const fmtDate = d => new Date(d)
      .toLocaleDateString('es-CO', { year:'numeric', month:'2-digit', day:'2-digit' });

    list.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td data-label="ID">${item.id}</td>
        <td data-label="Presupuesto">${fmtCurrency(item.budget)}</td>
        <td data-label="Unidad">${item.unit}</td>
        <td data-label="Tipo">${item.type}</td>
        <td data-label="Cantidad">${item.quantity}</td>
        <td data-label="Valor Unitario">${fmtCurrency(item.unitValue)}</td>
        <td data-label="Valor Total">${fmtCurrency(item.totalValue)}</td>
        <td data-label="Fecha">${fmtDate(item.acquisitionDate)}</td>
        <td data-label="Proveedor">${item.provider}</td>
        <td data-label="Documentación">${item.documentation}</td>
        <td data-label="Estado">${item.status}</td>
        <td data-label="Acciones">
          <button class="btn btn--secondary" onclick="editAcquisition(${item.id})">Editar</button>
          <button class="btn btn--secondary" onclick="deactivateAcquisition(${item.id})">Desactivar</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // — Stubs para acciones futuras —
  window.editAcquisition = id => { /* … */ };
  window.deactivateAcquisition = id => { /* … */ };

  // Arrancamos
  loadAcquisitions();
});
