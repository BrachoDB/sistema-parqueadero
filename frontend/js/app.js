import { api } from './api.js';
import { validatePlate } from './utils/validatePlate.js';
import { formatDuration } from './utils/durationFormat.js';

// --- Global State ---
let currentUserRole = localStorage.getItem('role');
let currentVehicleTab = 'Sedan';
let currentSpaceFilter = 'all';
let refreshInterval;
let roles = [];
let vehicleTypes = [];

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
    initDashboard();
    loadRolesAndVehicleTypes();
});

function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    const userDisplay = document.getElementById('userNameDisplay');
    if (userDisplay) userDisplay.textContent = localStorage.getItem('username') || 'Usuario';
}

async function loadRolesAndVehicleTypes() {
    try {
        roles = await api.get('/roles');
        vehicleTypes = await api.get('/vehicle-types');

        // Populate role select in user modal
        const roleSelect = document.getElementById('userRole');
        if (roleSelect) {
            roleSelect.innerHTML = roles.map(r => `<option value="${r.id}">${r.nombre}</option>`).join('');
        }

        // Populate vehicle type select in tariff modal
        const vehicleTypeSelect = document.getElementById('tariffVehicleType');
        if (vehicleTypeSelect) {
            vehicleTypeSelect.innerHTML = vehicleTypes.map(vt => `<option value="${vt.id}">${vt.nombre}</option>`).join('');
        }

        // Populate vehicle type filter in reports
        const reportVehicleTypeSelect = document.getElementById('reportVehicleType');
        if (reportVehicleTypeSelect) {
            reportVehicleTypeSelect.innerHTML = '<option value="">Todos</option>' +
                vehicleTypes.map(vt => `<option value="${vt.id}">${vt.nombre}</option>`).join('');
        }
    } catch (error) {
        console.error('Error loading roles and vehicle types:', error);
    }
}

function setupEventListeners() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            window.location.href = 'login.html';
        });
    }

    // Modal Closers
    window.closeModal = (modalId) => {
        document.getElementById(modalId).classList.remove('active');
    };

    // Entry Form
    const entryForm = document.getElementById('entryForm');
    if (entryForm) {
        entryForm.addEventListener('submit', handleEntrySubmit);
    }

    // Exit Confirm
    const confirmExitBtn = document.getElementById('confirmExitBtn');
    if (confirmExitBtn) {
        confirmExitBtn.addEventListener('click', handleExitConfirm);
    }

    // User Form
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', handleUserSubmit);
    }

    // Tariff Form
    const tariffForm = document.getElementById('tariffForm');
    if (tariffForm) {
        tariffForm.addEventListener('submit', handleTariffSubmit);
    }

    // Global Window functions for HTML onclick attributes
    window.switchVehicleTab = (type) => {
        currentVehicleTab = type;
        document.querySelectorAll('#operatorView .tab-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        loadSpaces();
    };

    window.switchAdminTab = (tab) => {
        document.querySelectorAll('#adminView > .tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');

        // Hide all panels
        document.getElementById('dashboardPanel').classList.add('hidden');
        document.getElementById('usersPanel').classList.add('hidden');
        document.getElementById('tariffsPanel').classList.add('hidden');
        document.getElementById('spacesPanel').classList.add('hidden');
        document.getElementById('reportsPanel').classList.add('hidden');

        // Show selected panel
        if (tab === 'dashboard') {
            document.getElementById('dashboardPanel').classList.remove('hidden');
            loadDashboardStats();
        } else if (tab === 'users') {
            document.getElementById('usersPanel').classList.remove('hidden');
            loadUsers();
        } else if (tab === 'tariffs') {
            document.getElementById('tariffsPanel').classList.remove('hidden');
            loadTariffs();
        } else if (tab === 'spaces') {
            document.getElementById('spacesPanel').classList.remove('hidden');
            loadSpacesAdmin();
        } else if (tab === 'reports') {
            document.getElementById('reportsPanel').classList.remove('hidden');
            // Set default dates
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('reportStartDate').value = today;
            document.getElementById('reportEndDate').value = today;
        }
    };

    window.openUserModal = (userId = null) => {
        const modal = document.getElementById('userModal');
        const form = document.getElementById('userForm');
        const title = document.getElementById('userModalTitle');

        form.reset();
        document.getElementById('userId').value = '';

        if (userId) {
            title.textContent = 'Editar Usuario';
            // Load user data
            api.get('/users').then(users => {
                const user = users.find(u => u.id === userId);
                if (user) {
                    document.getElementById('userId').value = user.id;
                    document.getElementById('userUsername').value = user.username;
                    if (document.getElementById('userEmail')) document.getElementById('userEmail').value = user.email || '';
                    document.getElementById('userRole').value = user.rol_id;
                    document.getElementById('userIsActive').checked = user.isActive;
                }
            });
        } else {
            title.textContent = 'Nuevo Usuario';
            document.getElementById('userIsActive').checked = true;
        }

        modal.classList.add('active');
    };

    window.openTariffModal = (tariffId = null) => {
        const modal = document.getElementById('tariffModal');
        const form = document.getElementById('tariffForm');
        const title = document.getElementById('tariffModalTitle');

        form.reset();
        document.getElementById('tariffId').value = '';

        if (tariffId) {
            title.textContent = 'Editar Tarifa';
            // Load tariff data
            api.get('/tariffs').then(tariffs => {
                const tariff = tariffs.find(t => t.id === tariffId);
                if (tariff) {
                    document.getElementById('tariffId').value = tariff.id;
                    document.getElementById('tariffVehicleType').value = tariff.tipo_vehiculo_id;
                    document.getElementById('tariffBillingType').value = tariff.billingType;
                    document.getElementById('tariffCost').value = tariff.cost;
                }
            });
        } else {
            title.textContent = 'Nueva Tarifa';
        }

        modal.classList.add('active');
    };

    window.deleteUser = async (id) => {
        if (confirm('¿Eliminar usuario?')) {
            try {
                await api.delete(`/users/${id}`);
                loadUsers();
                showNotification('Usuario eliminado exitosamente', 'success');
            } catch (error) {
                showNotification(error.message, 'error');
            }
        }
    };

    window.deleteTariff = async (id) => {
        if (confirm('¿Eliminar tarifa?')) {
            try {
                await api.delete(`/tariffs/${id}`);
                loadTariffs();
                showNotification('Tarifa eliminada exitosamente', 'success');
            } catch (error) {
                showNotification(error.message, 'error');
            }
        }
    };

    window.filterSpaces = (type) => {
        currentSpaceFilter = type;
        document.querySelectorAll('#spacesPanel .tabs .tab-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        loadSpacesAdmin();
    };

    window.loadReports = () => {
        loadReportsData();
    };

    window.handlePlateSearch = async () => {
        const input = document.getElementById('searchPlateInput');
        const plate = input.value.trim().toUpperCase();
        if (!plate) return;

        if (!validatePlate(plate)) {
            showNotification('Formato de placa inválido. Use LLL-NNN (Ej: ABC-123)', 'error');
            return;
        }

        try {
            const vehicle = await api.get(`/vehicles/search/${plate}`);
            if (vehicle) {
                // Switch tab to the vehicle's type
                currentVehicleTab = vehicle.VehicleType.nombre;
                document.querySelectorAll('#operatorView .tab-btn').forEach(btn => {
                    if (btn.textContent.includes(currentVehicleTab === 'Sedan' ? 'Autos' :
                        currentVehicleTab === 'Pickup' ? 'Camionetas' : 'Motos')) {
                        btn.click();
                    }
                });

                // Show exit modal automatically
                showExitModal(vehicle);
                input.value = '';
            }
        } catch (error) {
            showNotification('Vehículo no encontrado o no activo', 'error');
        }
    };
}

function showTicketModal(ticket, record) {
    document.getElementById('tickCode').textContent = ticket.code;
    document.getElementById('tickPlate').textContent = record.plate;
    document.getElementById('tickType').textContent = record.VehicleType.nombre;
    document.getElementById('tickEntry').textContent = new Date(record.entrada || record.entryTime).toLocaleString();
    document.getElementById('tickExit').textContent = new Date(record.salida || record.exitTime || new Date()).toLocaleString();
    // DESPUÉS
    document.getElementById('tickDir').textContent = formatDuration(ticket.totalTimeMinutes);

    document.getElementById('tickAmount').textContent = ticket.amount;

    document.getElementById('ticketModal').classList.add('active');
}

function initDashboard() {
    if (currentUserRole === 'ADMIN') {
        document.getElementById('adminView').classList.remove('hidden');
        loadDashboardStats();
        // Auto-refresh dashboard every 30 seconds
        refreshInterval = setInterval(loadDashboardStats, 30000);
    } else {
        document.getElementById('operatorView').classList.remove('hidden');
        loadSpaces();
        // Poll every 10 seconds
        refreshInterval = setInterval(loadSpaces, 10000);
    }
}

// --- OPERATOR LOGIC ---

async function loadSpaces() {
    try {
        const spaces = await api.get('/spaces');
        const filteredSpaces = spaces.filter(s => s.VehicleType.nombre === currentVehicleTab);

        const grid = document.getElementById('parkingGrid');
        grid.innerHTML = '';

        let available = 0;
        let occupied = 0;

        filteredSpaces.forEach(space => {
            const isOccupied = !space.isAvailable;
            if (isOccupied) occupied++; else available++;

            const slot = document.createElement('div');
            slot.className = `parking-slot ${isOccupied ? 'occupied' : ''}`;
            slot.innerHTML = `
                <div class="slot-number">${space.codigo || space.number}</div>
                <div class="plate-info">${space.Records && space.Records.length > 0 ? space.Records[0].plate : 'Disponible'}</div>
            `;

            slot.onclick = () => handleSlotClick(space);
            grid.appendChild(slot);
        });

        document.getElementById('availableCount').textContent = available;
        document.getElementById('occupiedCount').textContent = occupied;

    } catch (error) {
        console.error('Error loading spaces:', error);
    }
}

function handleSlotClick(space) {
    if (!space.isAvailable) {
        // Exit Logic
        const record = space.Records[0]; // Assuming backend returns active record
        showExitModal(record);
    } else {
        // Entry Logic
        showEntryModal(space);
    }
}

// Entry
function showEntryModal(space) {
    document.getElementById('entrySpaceId').value = space.id;
    const vehicleSelect = document.getElementById('entryVehicleType');
    vehicleSelect.innerHTML = `<option value="${space.tipo_vehiculo_id}" selected>${space.VehicleType.nombre}</option>`;

    document.getElementById('entryModal').classList.add('active');
}

async function handleEntrySubmit(e) {
    e.preventDefault();
    const plate = document.getElementById('entryPlate').value.trim().toUpperCase();
    const vehicleTypeId = document.getElementById('entryVehicleType').value;
    const spaceId = document.getElementById('entrySpaceId').value;
    // validacion de formato de placa
    if (!validatePlate(plate)) {
        showNotification('Formato de placa inválido. Use LLL-NNN (Ej: ABC-123)', 'error');
        return;
    }
    try {
        await api.post('/vehicles/entry', { plate, vehicleTypeId, spaceId });
        closeModal('entryModal');
        loadSpaces();
        showNotification('Ingreso registrado exitosamente', 'success');
        document.getElementById('entryForm').reset();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Exit
let currentExitRecord = null;
async function showExitModal(record) {
    currentExitRecord = record;
    try {
        const quote = await api.post('/vehicles/quote-exit', { plate: record.plate });

        document.getElementById('exitPlate').textContent = record.plate;
        // DESPUÉS
         document.getElementById('exitDuration').textContent = formatDuration(quote.durationMinutes);

        document.getElementById('exitAmount').textContent = `$${quote.amount}`;

        document.getElementById('exitModal').classList.add('active');
    } catch (error) {
        showNotification('Error al calcular tarifa: ' + error.message, 'error');
    }
}

async function handleExitConfirm() {
    if (!currentExitRecord) return;
    try {
        const response = await api.post('/vehicles/exit', { plate: currentExitRecord.plate });
        closeModal('exitModal');
        loadSpaces();
        // showNotification(`Salida registrada. Ticket: ${response.ticket.code} - Total: $${response.ticket.amount}`, 'success');
        showTicketModal(response.ticket, response.record);
    } catch (error) {
        showNotification(error.message, 'error');
    }
}


// --- ADMIN LOGIC ---

// Dashboard Stats
async function loadDashboardStats() {
    try {
        const stats = await api.get('/stats/dashboard');

        document.getElementById('statTotalSpaces').textContent = stats.totalSpaces;
        document.getElementById('statAvailableSpaces').textContent = stats.availableSpaces;
        document.getElementById('statOccupiedSpaces').textContent = stats.occupiedSpaces;
        document.getElementById('statActiveVehicles').textContent = stats.activeVehicles;
        document.getElementById('statTodayRevenue').textContent = `$${stats.todayRevenue}`;

        // Recent activity
        const tbody = document.getElementById('recentActivityBody');
        if (stats.recentActivity && stats.recentActivity.length > 0) {
            tbody.innerHTML = stats.recentActivity.map(record => `
                <tr>
                    <td>${record.plate}</td>
                    <td>${record.VehicleType.nombre}</td>
                    <td>${new Date(record.entrada || record.entryTime).toLocaleString()}</td>
                    <td>${record.salida || record.exitTime ? new Date(record.salida || record.exitTime).toLocaleString() : 'Activo'}</td>
                    <td>${record.Ticket ? '$' + record.Ticket.amount : '--'}</td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="5">No hay actividad reciente</td></tr>';
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

// Users Management
async function loadUsers() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '<tr><td colspan="5">Cargando...</td></tr>';
    try {
        const users = await api.get('/users');
        tbody.innerHTML = users.map(u => `
            <tr>
                <td>${u.id}</td>
                <td>${u.username}</td>
                <td><span class="badge">${u.Role.nombre}</span></td>
                <td><span class="badge ${u.isActive ? 'badge-success' : 'badge-danger'}">${u.isActive ? 'Activo' : 'Inactivo'}</span></td>
                <td>
                    <button class="btn btn-sm" onclick="openUserModal(${u.id})">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteUser(${u.id})">Eliminar</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-danger">${error.message}</td></tr>`;
    }
}

async function handleUserSubmit(e) {
    e.preventDefault();

    const userId = document.getElementById('userId').value;
    const username = document.getElementById('userUsername').value;
    const password = document.getElementById('userPassword').value;
    const rol_id = document.getElementById('userRole').value;
    const isActive = document.getElementById('userIsActive').checked;
    const email = document.getElementById('userEmail') ? document.getElementById('userEmail').value : '';

    const userData = { username, rol_id, isActive, email };
    if (password) {
        userData.password = password;
    }

    try {
        if (userId) {
            // Update
            await api.put(`/users/${userId}`, userData);
            showNotification('Usuario actualizado exitosamente', 'success');
        } else {
            // Create
            if (!password) {
                showNotification('La contraseña es requerida para nuevos usuarios', 'error');
                return;
            }
            await api.post('/users', userData);
            showNotification('Usuario creado exitosamente', 'success');
        }
        closeModal('userModal');
        loadUsers();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Tariffs Management
async function loadTariffs() {
    const tbody = document.getElementById('tariffsTableBody');
    tbody.innerHTML = '<tr><td colspan="4">Cargando...</td></tr>';
    try {
        const tariffs = await api.get('/tariffs');
        tbody.innerHTML = tariffs.filter(t => t.isActive).map(t => `
            <tr>
                <td>${t.VehicleType.nombre}</td>
                <td><span class="badge">${t.billingType}</span></td>
                <td>$${t.cost}</td>
                <td>
                    <button class="btn btn-sm" onclick="openTariffModal(${t.id})">Editar</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteTariff(${t.id})">Eliminar</button>
                </td>
            </tr>
        `).join('');
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-danger">${error.message}</td></tr>`;
    }
}

async function handleTariffSubmit(e) {
    e.preventDefault();

    const tariffId = document.getElementById('tariffId').value;
    const vehicleTypeId = document.getElementById('tariffVehicleType').value;
    const billingType = document.getElementById('tariffBillingType').value;
    const cost = document.getElementById('tariffCost').value;

    const tariffData = {
        tipo_vehiculo_id: vehicleTypeId,
        billingType,
        cost: parseFloat(cost),
        startDate: new Date()
    };

    try {
        if (tariffId) {
            // Update
            await api.put(`/tariffs/${tariffId}`, tariffData);
            showNotification('Tarifa actualizada exitosamente', 'success');
        } else {
            // Create
            await api.post('/tariffs', tariffData);
            showNotification('Tarifa creada exitosamente', 'success');
        }
        closeModal('tariffModal');
        loadTariffs();
    } catch (error) {
        showNotification(error.message, 'error');
    }
}

// Spaces Management
async function loadSpacesAdmin() {
    const tbody = document.getElementById('spacesTableBody');
    tbody.innerHTML = '<tr><td colspan="4">Cargando...</td></tr>';
    try {
        const spaces = await api.get('/spaces');
        let filteredSpaces = spaces;

        if (currentSpaceFilter !== 'all') {
            filteredSpaces = spaces.filter(s => s.VehicleType.nombre === currentSpaceFilter);
        }

        tbody.innerHTML = filteredSpaces.map(s => `
            <tr>
                <td>${s.codigo || s.number}</td>
                <td>${s.VehicleType.nombre}</td>
                <td><span class="badge ${s.isAvailable ? 'badge-success' : 'badge-danger'}">${s.isAvailable ? 'Disponible' : 'Ocupado'}</span></td>
                <td>${!s.isAvailable && s.Records && s.Records.length > 0 ? s.Records[0].plate : '--'}</td>
            </tr>
        `).join('');
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-danger">${error.message}</td></tr>`;
    }
}

// Reports
async function loadReportsData() {
    const tbody = document.getElementById('reportsTableBody');
    tbody.innerHTML = '<tr><td colspan="6">Cargando...</td></tr>';

    const startDate = document.getElementById('reportStartDate').value;
    const endDate = document.getElementById('reportEndDate').value;
    const vehicleTypeId = document.getElementById('reportVehicleType').value;

    try {
        let url = `/stats/reports?startDate=${startDate}&endDate=${endDate}`;
        if (vehicleTypeId) {
            url += `&tipo_vehiculo_id=${vehicleTypeId}`;
        }

        const records = await api.get(url);

        if (records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6">No se encontraron registros</td></tr>';
            return;
        }

        tbody.innerHTML = records.map(r => {
            const entryTime = new Date(r.entrada || r.entryTime);
            const exitTime = r.salida || r.exitTime ? new Date(r.salida || r.exitTime) : null;
            const durationMinutes = exitTime ? Math.round((exitTime - entryTime) / 60000) : 0;

            return `
                <tr>
                    <td>${r.plate}</td>
                    <td>${r.VehicleType.nombre}</td>
                    <td>${entryTime.toLocaleString()}</td>
                    <td>${exitTime ? exitTime.toLocaleString() : 'Activo'}</td>
                    <td>${exitTime ? formatDuration(durationMinutes) : '--'}</td>
                    <td>${r.Ticket ? '$' + r.Ticket.amount : '--'}</td>
                </tr>
            `;
        }).join('');
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-danger">${error.message}</td></tr>`;
    }
}

// Utility function for notifications
function showNotification(message, type = 'info') {
    // Simple alert for now, can be enhanced with a toast notification system
    if (type === 'error') {
        alert('❌ ' + message);
    } else if (type === 'success') {
        alert('✅ ' + message);
    } else {
        alert(message);
    }
}


