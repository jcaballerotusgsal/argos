async function cargarIndicadoresEstado() {
    try {
        const response = await fetch('http://192.168.11.220:3020/api/indicadores');
        const result = await response.json();

        const contenedor = document.querySelector("#list-indicadores");

        if (!contenedor) {
            console.error('No existe el contenedor #list-indicadores');
            return;
        }

        if (!result.ok) {
            contenedor.innerHTML = '<p>Error al cargar indicadores</p>';
            console.error(result);
            return;
        }

        let html = `
            <div class="indicador list">
                <h4>Indicador Estado Repostajes</h4>
                <p>Repostajes del día anterior frente a la media diaria de los 365 días anteriores</p>
                <div class="listado">
                    <ul class="indi-estado">
        `;

        for (const [index, ind] of result.data.entries()) {
            const graf = await obtenerGraficoHistoricoPorIndicador(ind.IdIndicador, ind.VerdeDesde, ind.AmarilloDesde, ind.NaranjaDesde, ind.RojoDesde);

            html += `
                <li>
                    <div>
                        <div class="main">
                            <div class="semaforo" style="background-color: ${hexColor(ind.EstadoColor)};"></div>
                            <p>${ind.Nombre}</p>
                        </div>
                        <div class="properties">
                            <p>Ayer: <b>${ind.ValorActual}</b></p>
                            <p>Media diaria: <b>${quitarDecimales(ind.ValorBase)}</b></p>
                        </div>
                        <div>
                            <p>Actualizado: <i>${formatearFecha(ind.FechaHoraCalculo)}</i></p>
                        </div>
                    </div>

                    <div class="graf_lin">
                        <div style="width: 450px; height: 100px;">
                            <canvas id="myChart-${index}"></canvas>
                        </div>
                    </div>

                    <div>
                        ${graf}
                    </div>
                </li>
            `;
        }

        html += `
                    </ul>
                </div>
            </div>
        `;

        contenedor.innerHTML = html;

        result.data.forEach((ind, index) => {
            const ctx = document.getElementById(`myChart-${index}`);
            if (!ctx) return;

            const historico = Array.isArray(ind.Historico) ? ind.Historico : [];

            console.log(`Datos históricos para indicador ${ind.IdIndicador}:`, historico);

            const labels = historico.map(item => formatearFechaCorta(item.fecha));
            const valores = historico.map(item => Number(item.valorActual) || 0);
            const valores1 = historico.map(item => Number(item.cargaActual) || 0);

            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: "Respotajes",
                            data: valores,
                            borderWidth: 2,
                            tension: 0.3,
                            fill: false
                        },
                        {
                            label: "Carga Actual",
                            data: valores1,
                            borderWidth: 2,
                            tension: 0.3,
                            fill: false
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            ticks: {
                                maxRotation: 0,
                                minRotation: 0
                            }
                        },
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        });

    } catch (error) {
        console.error('Error cargando indicadores:', error);

        const contenedor = document.querySelector("#list-indicadores");
        if (contenedor) {
            contenedor.innerHTML += '<p>Error de conexión con el backend de indicadores</p>';
        }
    }
}


async function obtenerGraficoHistoricoPorIndicador(idIndicador, verde, amarillo, naranja, rojo) {
    try {
        const response = await fetch('http://192.168.11.220:3020/api/indicadores_hist');
        const result = await response.json();

        if (!result.ok || !Array.isArray(result.data)) {
            throw new Error("Respuesta inválida del backend");
        }

        // 1. Quitar duplicados por IdIndicador + FechaPeriodo
        const unicosPorDia = Object.values(
            result.data.reduce((acc, item) => {
                const key = `${item.IdIndicador}_${item.FechaPeriodo}`;

                if (!acc[key]) {
                    acc[key] = item;
                } else {
                    const fechaNueva = new Date(item.FechaHoraCalculo);
                    const fechaGuardada = new Date(acc[key].FechaHoraCalculo);

                    if (fechaNueva > fechaGuardada) {
                        acc[key] = item;
                    }
                }

                return acc;
            }, {})
        );

        // 2. Filtrar solo el indicador que te interesa
        const datosIndicador = unicosPorDia.filter(item => Number(item.IdIndicador) === Number(idIndicador));

        // 3. Si no hay datos, devolver algo controlado
        if (!datosIndicador.length) {
            return `
                <div class="indicador hist">
                    <h3>Indicador ${idIndicador}</h3>
                    <p>No hay datos históricos disponibles</p>
                </div>
            `;
        }

        // 4. Resumir colores
        const resumen = datosIndicador.reduce((acc, item) => {
            const color = (item.EstadoColor || "").toLowerCase();

            if (color === "verde") acc.verde++;
            else if (color === "amarillo") acc.amarillo++;
            else if (color === "naranja") acc.naranja++;
            else if (color === "rojo") acc.rojo++;
            else acc.gris++;

            acc.total++;
            return acc;
        }, {
            IdIndicador: idIndicador,
            verde: 0,
            amarillo: 0,
            naranja: 0,
            rojo: 0,
            gris: 0,
            total: 0
        });

        const total = resumen.total || 1;

        const pVerde = (resumen.verde / total) * 100;
        const pAmarillo = (resumen.amarillo / total) * 100;
        const pNaranja = (resumen.naranja / total) * 100;
        const pRojo = (resumen.rojo / total) * 100;
        const pGris = (resumen.gris / total) * 100;

        const corte1 = pVerde;
        const corte2 = corte1 + pAmarillo;
        const corte3 = corte2 + pNaranja;
        const corte4 = corte3 + pRojo;
        const corte5 = corte4 + pGris;

        const gradient = `
            conic-gradient(
                #28a745 0% ${corte1}%,
                #fffb00 ${corte1}% ${corte2}%,
                #ffa600 ${corte2}% ${corte3}%,
                #ff0000 ${corte3}% ${corte4}%,
                #6c757d ${corte4}% ${corte5}%
            )
        `;

        return `
            <div class="hist">
                <div class="divi">
                    <div class="graf">
                        <div class="donut" style="background: ${gradient};">
                            <div></div>
                        </div>
                    </div>
                    <div class="properties">
                        <div><div style="background-color: #28a745;"></div>: <span>100% - ${verde}%</span></div>
                        <div><div style="background-color: #f1c40f;"></div>: <span>${verde}% - ${amarillo}%</span></div>
                        <div><div style="background-color: #e67e22;"></div>: <span>${amarillo}% - ${naranja}%</span></div>
                        <div><div style="background-color: #e74c3c;"></div>: <span>${rojo}%</span></div>
                        <div><div style="background-color: #6c757d;"></div>: <span>Sin datos</span></div>
                        <p>Últimos 31 días</p>
                    </div>
                </div>
            </div>
        `;

    } catch (error) {
        console.error(`Error cargando histórico del indicador ${idIndicador}:`, error);

        return `
            <div class="indicador hist">
                <h3>Indicador ${idIndicador}</h3>
                <p>Error de conexión con el backend de indicadores histórico</p>
            </div>
        `;
    }
}






function hexColor(color) {
    if (!color) return '#bebebe';

    const c = color.toString().trim().toLowerCase();

    if (c === 'verde') return '#2ecc71';
    if (c === 'amarillo') return '#f1c40f';
    if (c === 'naranja') return '#e67e22';
    if (c === 'rojo') return '#e74c3c';

    return '#bebebe';
}

function normalizarColor(color) {
    if (!color) return 'gris';

    const c = color.toString().trim().toLowerCase();

    if (c === 'verde') return 'verde';
    if (c === 'amarillo') return 'amarillo';
    if (c === 'naranja') return 'naranja';
    if (c === 'rojo') return 'rojo';

    return 'gris';
}

function formatearFecha(fecha) {
    if (!fecha) return '-';

    const d = new Date(fecha);
    if (isNaN(d)) return fecha;

    return d.toLocaleString('es-ES');
}

function formatearFechaCorta(fecha) {
    if (!fecha) return '-';

    const d = new Date(fecha);
    if (isNaN(d)) return fecha;

    return d.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit'
    });
}

function quitarDecimales(numero) {
    return Math.trunc(Number(numero) || 0);
}