const SUPABASE_URL = 'https://wvqamltlzuscntvnqamc.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2cWFtbHRsenVzY250dm5xYW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MzY0MjUsImV4cCI6MjA5MDQxMjQyNX0.JOt9xNzoW19292gi8O07fQqqhOGnyKHiHQNF7k4LsSs';

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

let editandoId = null;

window.onload = () => {
    cargarEstudiantes();
};

async function cargarEstudiantes() {
    document.getElementById('busqueda').value = '';
    const { data, error } = await db
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error:', error);
        return;
    }
    mostrarEstudiantes(data);
}

function mostrarEstudiantes(estudiantes) {
    const tbody = document.getElementById('tablaEstudiantes');
    const contador = document.getElementById('contador');
    contador.textContent = `${estudiantes.length} estudiante(s)`;

    if (estudiantes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4 text-muted">
                    No hay estudiantes registrados
                </td>
            </tr>`;
        return;
    }

    tbody.innerHTML = estudiantes.map((est, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${est.nombre}</td>
            <td><span class="badge bg-secondary">${est.matricula}</span></td>
            <td>${est.carrera}</td>
            <td>
                <span class="badge ${est.indice_academico >= 3.0 ? 'bg-success' : est.indice_academico >= 2.0 ? 'bg-warning text-dark' : 'bg-danger'}">
                    ${est.indice_academico}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-warning me-1" onclick="editarEstudiante(${est.id}, '${est.nombre}', '${est.matricula}', '${est.carrera}', ${est.indice_academico})">
                     Editar
                </button>
                <button class="btn btn-sm btn-danger" onclick="eliminarEstudiante(${est.id})">
                     Eliminar
                </button>
            </td>
        </tr>
    `).join('');
}

async function guardarEstudiante() {
    const nombre = document.getElementById('nombre').value.trim();
    const matricula = document.getElementById('matricula').value.trim();
    const carrera = document.getElementById('carrera').value.trim();
    const indice_academico = parseFloat(document.getElementById('indice_academico').value);

    if (!nombre) {
        alert('El nombre del estudiante es obligatorio');
        return;
    }
    if (!matricula) {
        alert('La matrícula es obligatoria');
        return;
    }
    if (!carrera) {
        alert('La carrera es obligatoria');
        return;
    }
    if (isNaN(indice_academico)) {
        alert('El índice académico es obligatorio');
        return;
    }
    if (indice_academico < 0 || indice_academico > 4) {
        alert('El índice académico debe estar entre 0.00 y 4.00');
        return;
    }

    if (editandoId) {
        // ACTUALIZAR
        const { error } = await db
            .from('students')
            .update({ nombre, matricula, carrera, indice_academico })
            .eq('id', editandoId);

        if (error) { alert('Error al actualizar'); return; }
        alert('Estudiante actualizado correctamente');
        cancelarEdicion();
    } else {
        
        const { error } = await db
            .from('students')
            .insert([{ nombre, matricula, carrera, indice_academico }]);

        if (error) { alert('Error al guardar'); return; }
        alert('Estudiante guardado correctamente');
    }

    limpiarFormulario();
    cargarEstudiantes();
}

// ACTUALIZAR - Cargar datos en formulario para editar
function editarEstudiante(id, nombre, matricula, carrera, indice_academico) {
    editandoId = id;
    document.getElementById('nombre').value = nombre;
    document.getElementById('matricula').value = matricula;
    document.getElementById('carrera').value = carrera;
    document.getElementById('indice_academico').value = indice_academico;
    document.getElementById('btnGuardar').textContent = 'Actualizar Estudiante';
    document.getElementById('btnCancelar').classList.remove('d-none');
    window.scrollTo(0, 0);
}

function cancelarEdicion() {
    editandoId = null;
    limpiarFormulario();
    document.getElementById('btnGuardar').textContent = 'Guardar Estudiante';
    document.getElementById('btnCancelar').classList.add('d-none');
}

async function eliminarEstudiante(id) {
    if (!confirm('¿Estás seguro que deseas eliminar este estudiante?')) return;

    const { error } = await db
        .from('students')
        .delete()
        .eq('id', id);

    if (error) { alert('Error al eliminar'); return; }
    alert('Estudiante eliminado correctamente');
    cargarEstudiantes();
}

async function buscarEstudiante() {
    const texto = document.getElementById('busqueda').value.trim();

    if (texto === '') {
        cargarEstudiantes();
        return;
    }

    const { data, error } = await db
        .from('students')
        .select('*')
        .or(`nombre.ilike.%${texto}%,matricula.ilike.%${texto}%`);

    if (error) { console.error('Error:', error); return; }
    mostrarEstudiantes(data);
}

function limpiarFormulario() {
    document.getElementById('nombre').value = '';
    document.getElementById('matricula').value = '';
    document.getElementById('carrera').value = '';
    document.getElementById('indice_academico').value = '';
}