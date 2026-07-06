(function () {

    let respuesta = [];

    const elements = {
        generatedAt: document.getElementById("generatedAt"),
        overallStatus: document.getElementById("overallStatus"),
        summaryGrid: document.getElementById("summaryGrid"),
        servicesTableBody: document.getElementById("servicesTableBody"),
        proceduresGrid: document.getElementById("proceduresGrid")
    };

    const statusMap = {
        up: { label: "OK", className: "status-ok" },
        down: { label: "Critical", className: "status-critical" },
        unknown: { label: "Unknown", className: "status-unknown" }
    };

    let data = buildMonitorData();

    render();

    window.addEventListener("monitor:data-loaded", function () {
        data = buildMonitorData();
        render();

        setInterval(function () {
            data = buildMonitorData();
            render();
            console.log("Datos actualizados");
        }, 60000);
    });

    if (window.monitorDataPromise && typeof window.monitorDataPromise.then === "function") {
        window.monitorDataPromise.then(function () {
            data = buildMonitorData();
            render();
        });
    }

    function render() {
        applyDensity();
        renderHeader();
        renderSummary();
        renderServices();
        renderProcedures();
    }

    function buildMonitorData() {
        const fallbackData = window.mockMonitorData || { generatedAt: new Date().toISOString(), services: [], procedures: [] };
        const serviceCollection = getCollection(window.servidoresData, ["services", "servidores", "data", "items"], fallbackData.services);
        const procedureCollection = getCollection(window.indicadoresData, ["procedures", "jobs", "data", "items"], fallbackData.procedures);

        return {
            generatedAt: getFirstValue([
                window.indicadoresData && window.indicadoresData.generatedAt,
                window.servidoresData && window.servidoresData.generatedAt,
                window.indicadoresHistData && window.indicadoresHistData.generatedAt,
                fallbackData.generatedAt
            ], new Date().toISOString()),
            services: serviceCollection.map(normalizeService),
            procedures: procedureCollection.map(normalizeProcedure)
        };
    }

    function getCollection(payload, keys, fallback) {
        if (Array.isArray(payload)) {
            return payload;
        }

        if (payload && typeof payload === "object") {
            for (var i = 0; i < keys.length; i += 1) {
                if (Array.isArray(payload[keys[i]])) {
                    return payload[keys[i]];
                }
            }

            if (Array.isArray(payload.data)) {
                return payload.data;
            }

            if (Array.isArray(payload.items)) {
                return payload.items;
            }
        }

        return Array.isArray(fallback) ? fallback : [];
    }

    function normalizeService(item, index) {
        const explicitStatus = getFirstValue([item.status, item.state, item.estado, item.health], null);
        const hasStatusValue = explicitStatus !== null && explicitStatus !== undefined && explicitStatus !== "";
        const ports = Array.isArray(item.ports) ? item.ports : (item.port ? [item.port] : []);
        const portValue = ports.length > 0 ? ports[0] : getFirstValue([item.port, item.puerto, item.serverPort, item.servicePort], "");

        return {
            name: getFirstValue([item.name, item.service, item.serverName, item.host, item.title], "Servicio " + (index + 1)),
            ip: getFirstValue([item.ip, item.host, item.address, item.serverIp], "--"),
            port: portValue,
            status: hasStatusValue ? normalizeStatus(explicitStatus) : (item.isActive === false ? "critical" : "ok"),
            responseMs: normalizeNumber(getFirstValue([item.responseMs, item.responseTime, item.latency, item.timeMs, item.response_ms], null)),
            checkedAt: getFirstValue([item.checkedAt, item.lastChecked, item.updatedAt, item.timestamp, item.lastSeen], new Date().toISOString())
        };
    }

    function normalizeProcedure(item, index) {
        return {
            name: getFirstValue([item.name, item.procedure, item.jobName, item.title], "Procedure " + (index + 1)),
            status: normalizeStatus(item.status || item.state || item.estado || item.health),
            lastRun: getFirstValue([item.lastRun, item.lastExecuted, item.lastExecution, item.updatedAt, item.timestamp], new Date().toISOString()),
            duration: getFirstValue([item.duration, item.elapsed, item.time, item.executionTime], ""),
            recordsExpected: normalizeNumber(getFirstValue([item.recordsExpected, item.expectedRecords, item.expected, item.records_expected], 0)),
            recordsReturned: normalizeNumber(getFirstValue([item.recordsReturned, item.returnedRecords, item.actual, item.records_returned], 0))
        };
    }

    function normalizeStatus(value) {
        const normalized = String(value || "").toLowerCase().trim();

        if (["ok", "up", "online", "active", "running", "healthy", "success", "operativo", "activo"].indexOf(normalized) !== -1) {
            return "ok";
        }

        if (["warning", "warn", "degraded", "slow", "partial", "alert", "advertencia", "aviso"].indexOf(normalized) !== -1) {
            return "warning";
        }

        if (["critical", "down", "offline", "error", "fail", "failed", "inactive", "critico", "crítico", "caido"].indexOf(normalized) !== -1) {
            return "critical";
        }

        return "unknown";
    }

    function getFirstValue(values, fallback) {
        for (var i = 0; i < values.length; i += 1) {
            if (values[i] !== undefined && values[i] !== null && values[i] !== "") {
                return values[i];
            }
        }

        return fallback;
    }

    function normalizeNumber(value) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    function applyDensity() {
        const servicesShell = elements.servicesTableBody.closest(".services-shell");
        const serviceCount = data.services.length;
        const procedureCount = data.procedures.length;
        const procedureRows = Math.max(2, Math.ceil(procedureCount / 2));

        if (servicesShell) {
            servicesShell.dataset.density = getDensityLevel(serviceCount, 5, 8, 10);
        }

        elements.proceduresGrid.dataset.density = getDensityLevel(procedureCount, 4, 6, 8);
        elements.proceduresGrid.style.gridTemplateRows = "repeat(" + procedureRows + ", minmax(0, 1fr))";
    }

    function renderHeader() {
        elements.generatedAt.textContent = formatDateTime(data.generatedAt);
        elements.overallStatus.textContent = getOverallStatusText();
        elements.overallStatus.className = getOverallStatusClassName();
    }

    async function renderSummary() {

        if (!window.servidoresData) {
            console.warn("window.servidoresData aún no está disponible.");
            return;
        }

        let listaServidores = [];
        if (Array.isArray(window.servidoresData)) {
            listaServidores = window.servidoresData;
        } else if (window.servidoresData.data && Array.isArray(window.servidoresData.data)) {
            listaServidores = window.servidoresData.data;
        }

        // console.log('Lista de servidores para resumen:', listaServidores);
        // console.log('Lista de servidores respuesta:', respuesta);

        const serviceList = respuesta || [];
        const procedureList = data.procedures || [];
        const totalServices = serviceList.length;
        const activeServices = serviceList.filter(function (item) {
            return item.status === "up";
        }).length;
        const servicesDown = serviceList.filter(function (item) {
            return item.status === "down";
        }).length;
        const proceduresOk = procedureList.filter(function (item) {
            return item.status === "ok";
        }).length;
        const countOk = procedureList.filter(function (item) {
            return item.recordsExpected === item.recordsReturned;
        }).length;

        const cards = [
            {
                label: "Servicios activos",
                value: activeServices + "/" + totalServices,
                note: servicesDown + " criticos",
                tone: servicesDown > 0 ? "warning" : "ok"
            },
            {
                label: "Procedures correctas",
                value: proceduresOk + "/" + procedureList.length,
                note: "Ultima ejecucion",
                tone: proceduresOk === procedureList.length ? "ok" : "warning"
            },
            {
                label: "Conteo validado",
                value: countOk + "/" + procedureList.length,
                note: "Esperado vs devuelto",
                tone: countOk === procedureList.length ? "ok" : "warning"
            }
        ];

        elements.summaryGrid.innerHTML = cards
            .map(function (card) {
                return (
                    '<article class="summary-card tone-' + card.tone + '">' +
                    '<span class="summary-label">' + card.label + "</span>" +
                    '<strong class="summary-value">' + card.value + "</strong>" +
                    '<span class="summary-note">' + card.note + "</span>" +
                    "</article>"
                );
            })
            .join("");
    }

    async function renderServices() {

        try {
            if (!window.servidoresData) {
                console.warn("window.servidoresData aún no está disponible.");
                return;
            }

            // 1. Extraemos el array nativo de servidores (sin importar cómo venga envuelto)
            let listaServidores = [];
            if (Array.isArray(window.servidoresData)) {
                listaServidores = window.servidoresData;
            } else if (window.servidoresData.data && Array.isArray(window.servidoresData.data)) {
                listaServidores = window.servidoresData.data;
            }

            if (listaServidores.length === 0) {
                console.warn("No se encontraron servidores válidos para enviar.");
                return;
            }

            // 2. Construimos el OBJETO que exige tu PHP con la propiedad "servers"
            const payload = {
                timeout: 3.0, // Puedes ajustar el timeout si quieres
                servers: listaServidores
            };

            // 3. Enviamos la estructura correcta
            const response2 = await fetch('/php/check_servers.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload) 
            });

            if (!response2.ok) {
                throw new Error('Error en el endpoint PHP');
            }

            const data = await response2.json();

            respuesta.length = 0;
            
            // Tu PHP responde un objeto con { ok: true, results: [...] }, así que esto funcionará nativamente:
            if (data && data.results) {
                respuesta.push(...data.results);
            }

        } catch (err) {
            console.error("Error detectado:", err);
        }

        // console.log('Respuesta final exitosa:', respuesta);

        const ordenStatus = {
            down: 0,
            up: 1
        };

        respuesta.sort((a, b) => {
            const statusA = String(a.status || "").toLowerCase();
            const statusB = String(b.status || "").toLowerCase();

            return (ordenStatus[statusA] ?? 99) - (ordenStatus[statusB] ?? 99);
        });


        elements.servicesTableBody.innerHTML = respuesta.map(function (service) {
                return (
                    "<tr>" +
                    "<td><strong>" + service.name + "</strong></td>" +
                    "<td>" + service.host + "</td>" +
                    "<td>" + service.port + "</td>" +
                    "<td>" + renderStatusPill(service.status) + "</td>" +
                    "<td>" + formatResponse(service.latency_ms) + "</td>" +
                    "</tr>"
                );
            })
            .join("");
            
            renderSummary();
    }

    function renderProcedures() {
        elements.proceduresGrid.innerHTML = data.procedures
            .map(function (procedureItem) {
                const countMatches = procedureItem.recordsExpected === procedureItem.recordsReturned;
                const countTone = countMatches ? "ok" : procedureItem.recordsReturned === 0 ? "critical" : "warning";
                const countLabel = countMatches ? "Conteo correcto" : "Conteo fuera de rango";

                return (
                    '<article class="procedure-card">' +
                    '<div class="procedure-topline">' +
                    "<h3>" + procedureItem.name + "</h3>" +
                    renderStatusPill(procedureItem.status) +
                    "</div>" +
                    '<div class="procedure-meta">' +
                    "<span>Ultima ejecucion: " + formatDateTime(procedureItem.lastRun) + "</span>" +
                    "<span>Duracion: " + procedureItem.duration + "</span>" +
                    "</div>" +
                    '<div class="procedure-inline">' +
                    '<div class="inline-block">' +
                    '<span class="check-label">Ejecucion</span>' +
                    renderStatusPill(procedureItem.status) +
                    "</div>" +
                    '<div class="inline-block">' +
                    '<span class="check-label">Conteo</span>' +
                    '<span class="status-pill status-' + countTone + '">' + countLabel + "</span>" +
                    "</div>" +
                    "</div>" +
                    '<div class="procedure-volume">' +
                    '<span class="volume-label">Esperado</span>' +
                    '<strong>' + formatNumber(procedureItem.recordsExpected) + "</strong>" +
                    '<span class="volume-separator">/</span>' +
                    '<span class="volume-label">Devuelto</span>' +
                    '<strong class="volume-returned tone-' + countTone + '">' + formatNumber(procedureItem.recordsReturned) + "</strong>" +
                    '<span class="volume-caption">' + countLabel + "</span>" +
                    "</div>" +
                    "</article>"
                );
            })
            .join("");
    }

    function getOverallStatusText() {
        if (hasStatus("critical")) {
            return "Incidencia critica";
        }

        if (hasStatus("warning")) {
            return "Supervision con avisos";
        }

        return "Operacion estable";
    }

    function getOverallStatusClassName() {
        if (hasStatus("critical")) {
            return "meta-value status-critical-text";
        }

        if (hasStatus("warning")) {
            return "meta-value status-warning-text";
        }

        return "meta-value status-ok-text";
    }

    function hasStatus(status) {
        return data.services.some(function (item) {
            return item.status === status;
        }) || data.procedures.some(function (item) {
            return item.status === status;
        });
    }

    function renderStatusPill(status) {
        const statusInfo = statusMap[status] || statusMap.unknown;
        return '<span class="status-pill ' + statusInfo.className + '">' + statusInfo.label + "</span>";
    }

    function formatDateTime(value) {
        return new Intl.DateTimeFormat("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit"
        }).format(new Date(value));
    }

    function formatTime(value) {
        return new Intl.DateTimeFormat("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        }).format(new Date(value));
    }

    function formatResponse(value) {
        if (value === null || value === undefined || Number.isNaN(value)) {
            return "Sin respuesta";
        }

        return value + " ms";
    }

    function formatNumber(value) {
        return new Intl.NumberFormat("es-ES").format(value);
    }

    function getDensityLevel(count, denseFrom, ultraFrom, maxFrom) {
        if (typeof maxFrom === "number" && count >= maxFrom) {
            return "max";
        }

        if (count >= ultraFrom) {
            return "ultra";
        }

        if (count >= denseFrom) {
            return "dense";
        }

        return "normal";
    }
})();
