# Guia de maquetacion para una aplicacion de monitoreo de servidores

## 1. Objetivo del primer paso

Antes de desarrollar la logica real de monitoreo, conviene definir **como se va a ver la aplicacion**, que informacion sera prioritaria y que acciones debe poder tomar el usuario.

En esta primera fase, el objetivo no es conectar servidores reales, sino construir una **maqueta funcional** que permita validar:

- la estructura general de la pantalla
- la jerarquia de la informacion
- el diseno de indicadores y alertas
- la navegacion entre resumen general y detalle
- el comportamiento visual de estados normales, advertencias y fallos

## 2. Que deberia monitorear la aplicacion

Tu sistema puede organizarse en tres bloques principales:

### A. Infraestructura

Monitoreo de cada servidor:

- estado general
- disponibilidad
- CPU
- memoria RAM
- disco
- red / latencia
- ultimo chequeo

### B. Servicios o procesos del servidor

Monitoreo de componentes que deben estar corriendo correctamente:

- servicios del sistema
- procesos internos
- APIs
- tareas programadas
- colas o workers

### C. Procedures o ejecuciones programadas

Aqui entran jobs, procedures de base de datos o procesos batch:

- ultima ejecucion
- estado de la ultima ejecucion
- duracion
- frecuencia esperada
- numero de errores
- tiempo sin ejecutarse
- reintentos

## 3. Estructura recomendada de la aplicacion

Para que la interfaz sea clara, lo mejor es separarla en vistas.

### Vista 1. Dashboard general

Debe responder rapido a esta pregunta:

**"Que tan sano esta todo el sistema ahora mismo?"**

Elementos recomendados:

- tarjetas KPI con resumen global
- lista de alertas activas
- tabla de servidores
- tabla de procedures criticos
- grafico de tendencia de incidentes o disponibilidad

### Vista 2. Detalle por servidor

Debe responder:

**"Que esta pasando en este servidor en concreto?"**

Elementos recomendados:

- estado general del servidor
- metricas en tiempo real
- historial reciente
- servicios asociados
- procedures que dependen de ese servidor
- log de eventos o incidencias

### Vista 3. Detalle de procedures / jobs

Debe responder:

**"Se estan ejecutando los procesos en tiempo y forma?"**

Elementos recomendados:

- nombre del procedure
- periodicidad esperada
- ultima ejecucion
- tiempo medio de ejecucion
- ultimos resultados
- errores recientes
- dependencia con servidor, base de datos o servicio

### Vista 4. Alertas e historial

Debe concentrar:

- alertas abiertas
- alertas resueltas
- severidad
- fecha de deteccion
- fecha de resolucion
- responsable

## 4. Indicadores clave que deberias mostrar

Los indicadores tienen que ser pocos, claros y visuales. No conviene saturar el dashboard.

### Indicadores globales

- servidores operativos
- servidores con advertencia
- servidores caidos
- procedures ejecutadas correctamente hoy
- procedures con error hoy
- alertas activas
- tiempo medio de respuesta

### Indicadores por servidor

- CPU en porcentaje
- RAM en porcentaje
- uso de disco
- latencia
- uptime
- ultimo heartbeat

### Indicadores por procedure

- estado: ok / warning / failed / pending
- ultima ejecucion
- duracion
- diferencia frente al tiempo esperado
- cantidad de fallos consecutivos
- proxima ejecucion estimada

## 5. Reglas visuales para los estados

El sistema debe usar estados consistentes en toda la aplicacion.

### Estados sugeridos

- `OK`: todo funciona dentro del rango esperado
- `Warning`: hay degradacion o riesgo
- `Critical`: fallo real o incumplimiento
- `Unknown`: sin datos o chequeo pendiente

### Colores sugeridos

- `OK`: verde profundo
- `Warning`: ambar / naranja
- `Critical`: rojo
- `Unknown`: gris azulado

No dependas solo del color. Cada estado debe incluir:

- texto
- icono
- contraste claro

## 6. Estructura visual recomendada del dashboard

Una distribucion efectiva para la pantalla principal puede ser esta:

```text
+--------------------------------------------------------------+
| Header: titulo, fecha de ultima actualizacion, filtros       |
+--------------------------------------------------------------+
| KPI 1 | KPI 2 | KPI 3 | KPI 4 | KPI 5 | KPI 6                |
+--------------------------------------------------------------+
| Estado de servidores                | Alertas activas         |
| tabla o grid con estado             | lista priorizada        |
+--------------------------------------------------------------+
| Tendencia de salud / incidentes     | Procedures criticas     |
| grafico de linea o barras           | tabla resumida          |
+--------------------------------------------------------------+
```

## 7. Componentes de interfaz recomendados

### A. Header superior

Debe incluir:

- nombre del sistema
- entorno seleccionado
- fecha y hora de ultima actualizacion
- filtros por servidor, entorno, estado y periodo

### B. Tarjetas KPI

Cada tarjeta debe tener:

- titulo corto
- valor principal grande
- variacion respecto al periodo anterior
- icono o mini indicador

Ejemplos:

- `Servidores activos: 12/14`
- `Procedures fallidas: 3`
- `Alertas criticas: 2`

### C. Tabla de servidores

Columnas recomendadas:

- nombre
- entorno
- estado
- CPU
- RAM
- disco
- uptime
- ultimo chequeo

### D. Tabla de procedures

Columnas recomendadas:

- nombre
- servidor
- frecuencia
- ultima ejecucion
- duracion
- estado
- error / mensaje

### E. Panel de alertas

Cada alerta debe mostrar:

- severidad
- componente afectado
- descripcion corta
- hora de deteccion
- si esta abierta o resuelta

## 8. Como maquetarlo primero sin backend

La mejor forma de avanzar rapido es hacer una maqueta con datos simulados.

### Paso 1. Crear un layout base en `index.html`

Separa la pagina en:

- `header`
- `main`
- `section` para KPIs
- `section` para servidores
- `section` para procedures
- `aside` o bloque para alertas

### Paso 2. Crear datos mock

Usa un archivo JSON o un arreglo en JavaScript con informacion ficticia como:

- servidores
- estados
- uso de recursos
- procedures
- alertas

Esto te permite probar el diseno sin depender todavia de APIs reales.

### Paso 3. Definir sistema visual

Antes de maquetar mucho, define:

- paleta de colores
- tipografias
- espaciado
- radios de borde
- sombras
- estilos de tablas
- estilos de badges de estado

### Paso 4. Hacer responsive desde el inicio

En escritorio:

- grid de KPIs de 4 a 6 columnas
- dos columnas para contenido principal

En movil:

- KPIs apiladas
- tablas con scroll horizontal
- alertas y bloques en una sola columna

## 9. Propuesta de estructura tecnica simple

Si quieres empezar sencillo, puedes trabajar con esta organizacion:

```text
/index.html
/assets/css/styles.css
/assets/js/app.js
/assets/data/mock-data.js
/docs/guia-maquetacion-monitor-servidores.md
```

## 10. Ejemplo de secciones HTML

Este es un esquema util para la primera maqueta:

```html
<body>
  <header class="topbar">
    <div class="brand">Argos Monitor</div>
    <div class="filters">Filtros y ultima actualizacion</div>
  </header>

  <main class="dashboard">
    <section class="kpi-grid">
      <article class="kpi-card"></article>
      <article class="kpi-card"></article>
      <article class="kpi-card"></article>
      <article class="kpi-card"></article>
    </section>

    <section class="dashboard-main">
      <section class="servers-panel"></section>
      <aside class="alerts-panel"></aside>
    </section>

    <section class="procedures-panel"></section>
  </main>
</body>
```

## 11. Recomendaciones de diseno

- Usa una interfaz sobria y tecnica, no una apariencia generica de panel administrativo.
- Prioriza la legibilidad sobre la decoracion.
- Deja que el estado critico destaque de inmediato.
- Muestra primero el resumen y luego el detalle.
- Usa tarjetas compactas para KPIs y tablas claras para operacion.
- Evita llenar la vista inicial con demasiados graficos.

## 12. Roadmap recomendado

### Fase 1. Maqueta visual

- layout general
- tarjetas KPI
- tablas base
- badges de estado
- panel de alertas

### Fase 2. Datos simulados

- JSON mock de servidores
- JSON mock de procedures
- filtros basicos
- cambio visual de estados

### Fase 3. Interaccion

- busqueda
- filtros por estado
- detalle por servidor
- detalle por procedure

### Fase 4. Integracion real

- conexion a API o scripts de monitoreo
- refresco automatico
- historico real
- autenticacion

## 13. Que deberias validar antes de programar mas

Antes de pasar a backend o integraciones reales, valida estas preguntas:

- que necesita ver el operador apenas entra
- que elementos requieren alerta inmediata
- que procesos son realmente criticos
- cada cuanto deben refrescarse los datos
- que diferencia habra entre warning y critical
- quien actuara sobre las alertas

## 14. Siguiente paso practico

El siguiente paso natural es convertir esta guia en una **primera pantalla HTML/CSS** con datos de ejemplo, para validar:

- distribucion
- estilo visual
- indicadores
- tablas
- alertas

Cuando esa maqueta este clara, ya tiene sentido conectar datos reales.
