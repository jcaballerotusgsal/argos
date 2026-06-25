window.mockMonitorData = {
    generatedAt: "2026-06-16T14:35:00",
    services: [
        {
            name: "API Clientes",
            ip: "10.20.1.12",
            port: 443,
            status: "ok",
            responseMs: 24,
            checkedAt: "2026-06-16T14:34:31"
        },
        {
            name: "API Pedidos",
            ip: "10.20.1.18",
            port: 443,
            status: "ok",
            responseMs: 31,
            checkedAt: "2026-06-16T14:34:28"
        },
        {
            name: "SQL Principal",
            ip: "10.20.2.10",
            port: 1433,
            status: "warning",
            responseMs: 94,
            checkedAt: "2026-06-16T14:34:20"
        },
        {
            name: "Worker Integracion",
            ip: "10.20.3.07",
            port: 8080,
            status: "critical",
            responseMs: null,
            checkedAt: "2026-06-16T14:33:55"
        },
        {
            name: "Portal Interno",
            ip: "10.20.1.30",
            port: 443,
            status: "ok",
            responseMs: 27,
            checkedAt: "2026-06-16T14:34:26"
        },
        {
            name: "SMTP Reportes",
            ip: "10.20.4.15",
            port: 25,
            status: "ok",
            responseMs: 41,
            checkedAt: "2026-06-16T14:34:12"
        },
        {
            name: "Redis Cache",
            ip: "10.20.2.22",
            port: 6379,
            status: "ok",
            responseMs: 12,
            checkedAt: "2026-06-16T14:34:24"
        },
        {
            name: "FTP Proveedor",
            ip: "10.20.5.40",
            port: 21,
            status: "warning",
            responseMs: 108,
            checkedAt: "2026-06-16T14:34:03"
        },
        {
            name: "BI Reportes",
            ip: "10.20.6.11",
            port: 8443,
            status: "ok",
            responseMs: 36,
            checkedAt: "2026-06-16T14:34:18"
        },
        {
            name: "SFTP Integracion",
            ip: "10.20.5.18",
            port: 22,
            status: "ok",
            responseMs: 29,
            checkedAt: "2026-06-16T14:34:09"
        }
    ],
    procedures: [
        {
            name: "sp_cierre_facturacion",
            status: "ok",
            lastRun: "2026-06-16T14:30:00",
            duration: "02m 14s",
            recordsExpected: 1250,
            recordsReturned: 1250
        },
        {
            name: "job_sync_clientes",
            status: "warning",
            lastRun: "2026-06-16T14:20:00",
            duration: "04m 52s",
            recordsExpected: 850,
            recordsReturned: 842
        },
        {
            name: "sp_refresh_stock",
            status: "critical",
            lastRun: "2026-06-16T14:15:00",
            duration: "07m 06s",
            recordsExpected: 5200,
            recordsReturned: 0
        },
        {
            name: "job_alertas_diarias",
            status: "ok",
            lastRun: "2026-06-16T14:00:00",
            duration: "01m 09s",
            recordsExpected: 64,
            recordsReturned: 64
        }
    ]
};
