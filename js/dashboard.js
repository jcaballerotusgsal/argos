// const REFRESH_INTERVAL_MS = 300000; // 300 segundos - 5 mins
const REFRESH_INTERVAL_MS = 30000; // 30 segundos

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
        if (typeof renderResults === 'function') {
            await renderResults();
        }

        if (typeof cargarIndicadoresEstado === 'function') {
            await cargarIndicadoresEstado();
        }
        // if (typeof cargarIndicadoresHistorico === 'function') {
        //     await cargarIndicadoresHistorico();
        // }

        actualizarTextoRefresh();
    } catch (error) {
        console.error('Error refrescando dashboard:', error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await refrescarDashboard();
    setInterval(refrescarDashboard, REFRESH_INTERVAL_MS);
});