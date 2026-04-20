function actualizarTextoRefresh() {
    const el = document.getElementById('refresh-data');
    if (!el) return;

    const ahora = new Date();

    const dia = String(ahora.getDate()).padStart(2, '0');
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const anio = ahora.getFullYear();

    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    const segundos = String(ahora.getSeconds()).padStart(2, '0');

    el.textContent = `Refresh Data: ${dia}-${mes}-${anio} ${horas}:${minutos}:${segundos}`;
}

async function refrescarDashboard() {
    try {
        // 1. Refrescar bloque de servidores/webs
        if (typeof cargarServidores === 'function') {
            await cargarServidores();
        }

        // 2. Refrescar bloque de indicadores
        if (typeof cargarIndicadores === 'function') {
            await cargarIndicadores();
        }

        // 3. Actualizar fecha/hora de último refresco
        actualizarTextoRefresh();

    } catch (error) {
        console.error('Error refrescando dashboard:', error);
    }
}