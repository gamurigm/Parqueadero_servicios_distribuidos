const API_BASE = 'http://localhost:8000';
const API_LOGIN = `${API_BASE}/usuarios/auth/login`;
const API_ESPACIOS = `${API_BASE}/zonas/api/v1/espacios/`;
const SSE_URL = `${API_BASE}/tickets/sse/espacios`;

let authToken = localStorage.getItem('dashboard_token') || null;
let currentUser = JSON.parse(localStorage.getItem('dashboard_user') || 'null');

// --- DOM ---
const loginPanel = document.getElementById('loginPanel');
const dashboardPanel = document.getElementById('dashboardPanel');
const loginForm = document.getElementById('loginForm');
const loginUser = document.getElementById('loginUser');
const loginPass = document.getElementById('loginPass');
const loginError = document.getElementById('loginError');
const loginBtn = document.getElementById('loginBtn');
const userLabel = document.getElementById('userLabel');
const logoutBtn = document.getElementById('logoutBtn');
const container = document.getElementById('espaciosContainer');
const totalSpan = document.getElementById('totalEspacios');
const lastUpdateSpan = document.getElementById('lastUpdate');
const indicator = document.getElementById('indicator');
const statusText = document.getElementById('statusText');

const authHeaders = () => {
    const h = { 'Content-Type': 'application/json' };
    if (authToken) h['Authorization'] = `Bearer ${authToken}`;
    return h;
};

const showDashboard = () => {
    loginPanel.classList.add('hidden');
    dashboardPanel.classList.remove('hidden');
    userLabel.textContent = currentUser?.username || '';
};

const showLogin = () => {
    dashboardPanel.classList.add('hidden');
    loginPanel.classList.remove('hidden');
};

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.classList.add('hidden');
    loginBtn.disabled = true;
    loginBtn.textContent = 'Entrando...';

    try {
        const res = await fetch(API_LOGIN, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: loginUser.value.trim(),
                password: loginPass.value,
            }),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || `HTTP ${res.status}`);
        }

        const data = await res.json();
        authToken = data.access_token;
        currentUser = data.user;
        localStorage.setItem('dashboard_token', authToken);
        localStorage.setItem('dashboard_user', JSON.stringify(currentUser));
        showDashboard();
        await iniciarDashboard();
    } catch (err) {
        loginError.textContent = err.message;
        loginError.classList.remove('hidden');
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Entrar';
    }
});

logoutBtn.addEventListener('click', () => {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('dashboard_token');
    localStorage.removeItem('dashboard_user');
    showLogin();
});

const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleString('es-ES', { hour12: false });
};

const setConnectionStatus = (connected) => {
    if (connected) {
        indicator.className = 'w-3 h-3 bg-green-500 rounded-full inline-block';
        statusText.textContent = 'Conectado';
    } else {
        indicator.className = 'w-3 h-3 bg-red-500 rounded-full inline-block';
        statusText.textContent = 'Desconectado';
    }
};

const fetchEspacios = async () => {
    try {
        const response = await fetch(API_ESPACIOS, { headers: authHeaders() });
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error('Error al obtener espacios:', error);
        return null;
    }
};

const renderizarEspacios = (espacios) => {
    if (!espacios || espacios.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12 text-gray-500">
                <p class="text-xl">No hay espacios disponibles</p>
            </div>
        `;
        totalSpan.textContent = '0 espacios';
        return;
    }

    const html = espacios.map((esp) => {
        const estadoClass = `bg-${esp.estado.toLowerCase()}`;
        return `
            <div class="espacio-card ${estadoClass} rounded-lg shadow p-4 flex flex-col">
                <div class="font-bold text-lg text-gray-800">${esp.codigo || 'Sin codigo'}</div>
                <div class="text-sm text-gray-600">Zona: ${esp.nombreZona || 'N/A'}</div>
                <div class="text-sm text-gray-600">Tipo: ${esp.tipo || esp.tipoEspacio || 'N/A'}</div>
                <div class="mt-2 flex items-center justify-between">
                    <span class="px-2 py-1 text-xs font-semibold rounded-full 
                        ${esp.estado === 'DISPONIBLE' ? 'bg-green-200 text-green-800' :
                          esp.estado === 'OCUPADO' ? 'bg-red-200 text-red-800' :
                          'bg-yellow-200 text-yellow-800'}">
                        ${esp.estado}
                    </span>
                    <span class="text-xs text-gray-400">ID: ${esp.id.slice(0,8)}</span>
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
    totalSpan.textContent = `${espacios.length} espacios`;
    lastUpdateSpan.textContent = formatDate(new Date());
};

const cargarEspacios = async () => {
    const data = await fetchEspacios();
    if (data) {
        renderizarEspacios(data);
        setConnectionStatus(true);
    } else {
        setConnectionStatus(false);
    }
};

let eventSourceInstance = null;

const conectarSSE = () => {
    if (eventSourceInstance) {
        eventSourceInstance.close();
    }

    eventSourceInstance = new EventSource(SSE_URL);

    eventSourceInstance.onopen = () => {
        console.log('SSE: conexion establecida');
        setConnectionStatus(true);
    };

    eventSourceInstance.onmessage = (event) => {
        try {
            const payload = JSON.parse(event.data);
            console.log('SSE recibido:', payload);
            cargarEspacios();
        } catch (e) {
            console.error('Error al parsear evento SSE:', e);
        }
    };

    eventSourceInstance.onerror = (error) => {
        console.error('SSE error:', error);
        setConnectionStatus(false);
        eventSourceInstance.close();
        setTimeout(conectarSSE, 5000);
    };

    return eventSourceInstance;
};

const iniciarDashboard = async () => {
    await cargarEspacios();
    conectarSSE();
    setInterval(cargarEspacios, 30000);
};

// --- Init ---
(async () => {
    if (authToken && currentUser) {
        showDashboard();
        await iniciarDashboard();
    } else {
        showLogin();
    }
})();
