<!DOCTYPE html>
<html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <link rel="stylesheet" href="./styles/style.scss">

        <title>Dashboard ARGOS</title>
    </head>
    <body class="">
        <header>
            <div class="title">
                <h1>Dashboard ARGOS</h1>
            </div>
            <div class="refresh-action">
                <p id="refresh-data">Refresh Data:</p>
            </div>
        </header>

        <main class="dashboard">
            <div class="display-list" id="display-list">
                <div class="list-webs" id="display-webs"></div>

                <div class="list-view" id="list-indicadores"></div>

                
            </div>
        </main>

        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script src="./js/check_server.js"></script>
        <script src="./js/indicadores.js"></script>
        <script src="./js/dashboard.js"></script>
    </body>
</html>