let respuesta = [];

async function renderResults() {

    await fetch('./../servers.json')
    .then(r => {
        if (!r.ok) throw new Error('No se pudo cargar servers.json');
        return r.json();
    })
    .then(payload => {
        return fetch('./../php/check_servers.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
        });
    })
    .then(r => {
        if (!r.ok) throw new Error('Error en el endpoint PHP');
        return r.json();
    })
    .then(data => {
        // console.log('Respuesta completa:', data);
        // console.table(data.results);
        respuesta.length = 0;
        respuesta.push(...data.results);
    })
    .catch(err => {
        console.error(err);
    });

    await printResults();
}

async function printResults() {

    let html = `
        <div class="indicador list">
            <h4>Estado IP's/Webs</h4>
            <p>Estado webs y IP's del grupo</p>
            <div class="listado">
                <ul class="server-list">
    `;

    const grouped = {};

    respuesta.forEach(server => {
        const baseKey = `${server.name}__${server.host}`;

        if (!grouped[baseKey]) {
            grouped[baseKey] = {
                name: server.name,
                host: server.host,
                upPorts: [],
                downPorts: [],
                invalidPorts: [],
                upLatencies: []
            };
        }

        if (server.status === 'up') {
            grouped[baseKey].upPorts.push(server.port);
            if (server.latency_ms !== null && server.latency_ms !== undefined) {
                grouped[baseKey].upLatencies.push(server.latency_ms);
            }
        } else if (server.status === 'down') {
            grouped[baseKey].downPorts.push(server.port);
        } else if (server.status === 'invalid') {
            grouped[baseKey].invalidPorts.push(server.port);
        }
    });

    let htmlDown = '';
    let htmlUp = '';

    Object.values(grouped).forEach(server => {
        const uniqueUpPorts = [...new Set(server.upPorts)].sort((a, b) => a - b);
        const uniqueDownPorts = [...new Set(server.downPorts)].sort((a, b) => a - b);
        const uniqueInvalidPorts = [...new Set(server.invalidPorts)].sort((a, b) => a - b);

        let avgLatency = null;
        if (server.upLatencies.length > 0) {
            const total = server.upLatencies.reduce((sum, value) => sum + value, 0);
            avgLatency = (total / server.upLatencies.length).toFixed(2);
        }

        if (uniqueDownPorts.length > 0) {
            htmlDown += `
                <li>
                    
                    <div class="main">
                        <div class="semaforo down"></div>
                        ${server.name} - ${server.host} (${uniqueDownPorts.join(', ')})
                    </div>
                    
                </li>
            `;
        }

        if (uniqueInvalidPorts.length > 0) {
            htmlDown += `
                <li>
                    <div class="main">
                        <div class="semaforo invalid"></div>
                        ${server.name} - ${server.host} (${uniqueInvalidPorts.join(', ')})
                    </div>
                </li>
            `;
        }

        if (uniqueUpPorts.length > 0) {
            htmlUp += `
                <li>

                    <div class="main">
                        <div class="semaforo up"></div>
                        ${server.name} - ${server.host} (${uniqueUpPorts.join(', ')})
                    </div>
                    
                    <span>${avgLatency !== null ? avgLatency + ' ms' : ''}</span>
                </li>
            `;
        }
    });

    html += htmlDown;
    html += htmlUp;

    html += `
                </ul>
            </div>
        </div>
    `;

    document.querySelector('#display-webs').innerHTML = html;
}  