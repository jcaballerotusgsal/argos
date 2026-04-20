const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());

const dbConfig = {
    user: 'sa',
    password: 'AtlasSBI2020',
    server: 'ATLAS',
    database: 'TUSGSAL_ARGOS',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

app.get('/api/indicadores', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);

        const actualesResult = await pool.request().query(`
            SELECT *
            FROM dbo.vw_PanelIndicadores
            WHERE VisibleEnPanel = 1
            ORDER BY OrdenPanel
        `);

        const historicoResult = await pool.request().query(`
            SELECT
                h.IdIndicador,
                h.FechaPeriodo,
                h.ValorActual,
                h.CargaActual,
                h.ValorBase,
                h.PorcentajeCumplimiento,
                h.EstadoColor,
                h.EstadoTexto
            FROM dbo.IndicadoresHistorico h
            WHERE h.FechaPeriodo >= DATEADD(DAY, -15, GETDATE())
            ORDER BY h.IdIndicador, h.FechaPeriodo ASC
        `);

        const actuales = actualesResult.recordset;
        const historico = historicoResult.recordset;

        const historicoAgrupado = {};

        historico.forEach(row => {
            if (!historicoAgrupado[row.IdIndicador]) {
                historicoAgrupado[row.IdIndicador] = [];
            }

            historicoAgrupado[row.IdIndicador].push({
                fecha: row.FechaPeriodo,
                valorActual: Number(row.ValorActual) || 0,
                cargaActual: Number(row.CargaActual) || 0,
                valorBase: Number(row.ValorBase) || 0,
                porcentajeCumplimiento: Number(row.PorcentajeCumplimiento) || 0,
                estadoColor: row.EstadoColor || null,
                estadoTexto: row.EstadoTexto || null
            });
        });

        const data = actuales.map(ind => ({
            ...ind,
            Historico: historicoAgrupado[ind.IdIndicador] || []
        }));

        res.json({
            ok: true,
            data
        });

    } catch (error) {
        console.error('Error SQL:', error);
        res.status(500).json({
            ok: false,
            error: error.message
        });
    }
});

app.get('/api/indicadores_hist', async (req, res) => {
    try {
        const pool = await sql.connect(dbConfig);

        const result = await pool.request().query(`
            SELECT *
            FROM dbo.IndicadoresHistorico
            WHERE FechaPeriodo >= DATEADD(DAY, -32, GETDATE())
            ORDER BY IdIndicador, FechaHoraCalculo ASC
        `);

        res.json({
            ok: true,
            data: result.recordset
        });
    } catch (error) {
        console.error('Error SQL:', error);
        res.status(500).json({
            ok: false,
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Backend Node iniciado en http://localhost:${PORT}`);
});