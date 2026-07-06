async function cargarDatos() {
    const baseUrls = [
        "http://localhost:3020",
        "http://127.0.0.1:3020"
    ];

    async function fetchJson(path) {
        let lastError = null;

        for (var i = 0; i < baseUrls.length; i += 1) {
            try {
                const response = await fetch(baseUrls[i] + path);

                if (!response.ok) {
                    throw new Error("HTTP " + response.status);
                }

                return await response.json();
            } catch (error) {
                lastError = error;
            }
        }

        throw lastError || new Error("No se pudieron cargar los datos de la API");
    }

    try {
        window.indicadoresData = await fetchJson("/api/indicadores");
    } catch (error) {
        console.warn("No se pudieron cargar indicadores:", error);
        window.indicadoresData = window.mockMonitorData || {};
    }

    try {
        window.indicadoresHistData = await fetchJson("/api/indicadores_hist");
    } catch (error) {
        console.warn("No se pudieron cargar indicadores historicos:", error);
        window.indicadoresHistData = window.mockMonitorData || {};
    }

    try {
        const res = await fetchJson("/api/servidores");
        window.servidoresData = res.data || [];
        // console.log("Datos de servidores cargados:", window.servidoresData);
    } catch (error) {
        console.warn("No se pudieron cargar servidores:", error);
        window.servidoresData = window.mockMonitorData || {};
    }

    window.dispatchEvent(new CustomEvent("monitor:data-loaded"));
    return {
        indicadoresData: window.indicadoresData,
        indicadoresHistData: window.indicadoresHistData,
        servidoresData: window.servidoresData
    };
}

window.monitorDataPromise = cargarDatos();
window.setInterval(function () {
    window.monitorDataPromise = cargarDatos();
}, 30000);