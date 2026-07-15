const API_ESPACIOS = 'http://localhost:8081/api/v1/espacios/';
const SSE_URL = 'http://localhost:3003/sse/espacios';

const container = document.getElementById('espaciosContainer');
const totalSpan = document.getElementById('totalEspacios');
const lastUpdateSpan = document.getElementById('lastUpdate');
const indicator = document.getElementById('indicator');
const statusText = document.getElementById('statusText');
const emptyState = document.getElementById('emptyState');
const errorState = document.getElementById('errorState');

const formatDate = (date) => new Date(date).toLocaleString('es-EC', { hour12: false });

const setConnectionStatus = (connected) => {
  indicator.className = connected
    ? 'w-3 h-3 bg-green-500 rounded-full inline-block'
    : 'w-3 h-3 bg-gray-400 rounded-full inline-block';
  statusText.textContent = connected ? 'Conectado' : 'Reconectando...';
};

const normalizedStatus = (value) => String(value || 'OTRO').toLowerCase();

const statusClass = (status) => {
  const normalized = normalizedStatus(status);
  if (normalized === 'disponible') return 'bg-disponible';
  if (normalized === 'ocupado') return 'bg-ocupado';
  if (normalized === 'reservado') return 'bg-reservado';
  return 'bg-otro';
};

const statusLabel = (status) => normalizedStatus(status).toUpperCase();

const unwrapEvent = (event) => {
  let data = event?.data ?? event;
  if (typeof data === 'string') {
    try { data = JSON.parse(data); } catch { return null; }
  }
  if (data?.data && typeof data.data === 'object') return data.data;
  return data;
};

const render = (spaces) => {
  const items = Array.isArray(spaces) ? spaces : [];
  totalSpan.textContent = `${items.length} espacio${items.length === 1 ? '' : 's'}`;
  emptyState.classList.toggle('hidden', items.length > 0);
  container.innerHTML = items.map((space) => `
    <article class="espacio-card ${statusClass(space.estado)} rounded-lg p-5 shadow-sm">
      <div class="flex items-start justify-between gap-3">
        <h2 class="text-lg font-bold text-gray-800">${space.codigo ?? space.id ?? 'Sin codigo'}</h2>
        <span class="rounded-full bg-white/70 px-2 py-1 text-xs font-bold text-gray-700">${statusLabel(space.estado)}</span>
      </div>
      <p class="mt-3 text-sm text-gray-700">${space.descripcion ?? 'Sin descripcion'}</p>
      <p class="mt-2 text-xs text-gray-600">Tipo: ${space.tipoEspacio ?? space.tipo ?? 'No especificado'}</p>
    </article>
  `).join('');
  lastUpdateSpan.textContent = formatDate(new Date());
};

const showError = (message) => {
  errorState.textContent = message;
  errorState.classList.remove('hidden');
};

const loadSpaces = async () => {
  try {
    const response = await fetch(API_ESPACIOS);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    render(data.content ?? data);
  } catch (error) {
    showError(`No se pudieron cargar los espacios: ${error.message}`);
  }
};

const connectSse = () => {
  const source = new EventSource(SSE_URL);
  source.onopen = () => setConnectionStatus(true);
  source.onerror = () => {
    setConnectionStatus(false);
    source.close();
    setTimeout(connectSse, 3000);
  };
  source.onmessage = (message) => {
    const space = unwrapEvent(message);
    if (space) loadSpaces();
  };
  [
    'espacio.actualizado',
    'espacio.ocupado',
    'espacio.disponible',
    'espacio.reservado',
    'ticket.emitido',
    'ticket.pagado',
    'ticket.anulado',
  ].forEach((eventType) => {
    source.addEventListener(eventType, () => loadSpaces());
  });
};

loadSpaces();
connectSse();
