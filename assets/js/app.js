(function () {
    const data = window.mockMonitorData;

    if (!data) {
        return;
    }

    const elements = {
        generatedAt: document.getElementById("generatedAt"),
        overallStatus: document.getElementById("overallStatus"),
        summaryGrid: document.getElementById("summaryGrid"),
        servicesTableBody: document.getElementById("servicesTableBody"),
        proceduresGrid: document.getElementById("proceduresGrid")
    };

    const statusMap = {
        ok: { label: "OK", className: "status-ok" },
        warning: { label: "Warning", className: "status-warning" },
        critical: { label: "Critical", className: "status-critical" },
        unknown: { label: "Unknown", className: "status-unknown" }
    };

    render();

    function render() {
        applyDensity();
        renderHeader();
        renderSummary();
        renderServices();
        renderProcedures();
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

    function renderSummary() {
        const totalServices = data.services.length;
        const activeServices = data.services.filter(function (item) {
            return item.status === "ok";
        }).length;
        const warningServices = data.services.filter(function (item) {
            return item.status === "warning";
        }).length;
        const servicesDown = data.services.filter(function (item) {
            return item.status === "critical";
        }).length;
        const proceduresOk = data.procedures.filter(function (item) {
            return item.status === "ok";
        }).length;
        const countOk = data.procedures.filter(function (item) {
            return item.recordsExpected === item.recordsReturned;
        }).length;

        const cards = [
            {
                label: "Servicios activos",
                value: activeServices + "/" + totalServices,
                note: servicesDown + " criticos / " + warningServices + " warning",
                tone: servicesDown > 0 ? "critical" : "ok"
            },
            {
                label: "Procedures correctas",
                value: proceduresOk + "/" + data.procedures.length,
                note: "Ultima ejecucion",
                tone: proceduresOk === data.procedures.length ? "ok" : "warning"
            },
            {
                label: "Conteo validado",
                value: countOk + "/" + data.procedures.length,
                note: "Esperado vs devuelto",
                tone: countOk === data.procedures.length ? "ok" : "warning"
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

    function renderServices() {
        elements.servicesTableBody.innerHTML = data.services
            .map(function (service) {
                return (
                    "<tr>" +
                    "<td><strong>" + service.name + "</strong></td>" +
                    "<td>" + service.ip + "</td>" +
                    "<td>" + service.port + "</td>" +
                    "<td>" + renderStatusPill(service.status) + "</td>" +
                    "<td>" + formatResponse(service.responseMs) + "</td>" +
                    "<td>" + formatTime(service.checkedAt) + "</td>" +
                    "</tr>"
                );
            })
            .join("");
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
        if (value === null || value === undefined) {
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
