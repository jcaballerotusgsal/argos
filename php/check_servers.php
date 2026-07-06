<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function respond(array $data, int $httpCode = 200): void
{
    http_response_code($httpCode);
    echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

function nowIso8601(): string
{
    return date('c');
}

function isValidHost($host): bool
{
    if (!is_string($host) || trim($host) === '') {
        return false;
    }

    $host = trim($host);

    if (filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4 | FILTER_FLAG_IPV6)) {
        return true;
    }

    if (strlen($host) > 253) {
        return false;
    }

    return (bool) preg_match('/^(?=.{1,253}$)(?!-)(?:[a-zA-Z0-9-]{1,63}\.)*[a-zA-Z0-9-]{1,63}$/', $host);
}

function isValidPort($port): bool
{
    $validated = filter_var($port, FILTER_VALIDATE_INT);
    return $validated !== false && $validated >= 1 && $validated <= 65535;
}

function validateServerDefinition($server): array
{
    $errors = [];

    if (!is_array($server)) {
        return [
            'valid' => false,
            'errors' => ['Cada elemento de servers debe ser un objeto JSON válido.'],
        ];
    }

    if (!array_key_exists('name', $server) || !is_string($server['name']) || trim($server['name']) === '') {
        $errors[] = 'El campo "name" es obligatorio y debe ser un string no vacío.';
    }

    if (!array_key_exists('host', $server) || !isValidHost($server['host'])) {
        $errors[] = 'El campo "host" es obligatorio y debe ser una IP o hostname válido.';
    }

    if (!array_key_exists('ports', $server)) {
        $errors[] = 'El campo "ports" es obligatorio.';
    } elseif (!is_array($server['ports']) || count($server['ports']) === 0) {
        $errors[] = 'El campo "ports" debe ser un array con al menos un puerto.';
    } else {
        foreach ($server['ports'] as $index => $port) {
            if (!isValidPort($port)) {
                $errors[] = 'El puerto en la posición ' . $index . ' debe ser un entero entre 1 y 65535.';
            }
        }
    }

    return [
        'valid' => count($errors) === 0,
        'errors' => $errors,
    ];
}

function buildInvalidResult($server, string $error): array
{
    return [
        'name' => is_array($server) && isset($server['name']) ? (string) $server['name'] : null,
        'host' => is_array($server) && isset($server['host']) ? (string) $server['host'] : null,
        'port' => null,
        'status' => 'invalid',
        'latency_ms' => null,
        'error' => $error,
    ];
}

function checkTcpConnectivity(string $name, string $host, int $port, float $timeout): array
{
    $errno = 0;
    $errstr = '';

    $start = microtime(true);
    $fp = @fsockopen($host, $port, $errno, $errstr, $timeout);
    $end = microtime(true);

    $latencyMs = round(($end - $start) * 1000, 2);

    if (is_resource($fp)) {
        fclose($fp);

        return [
            'name' => $name,
            'host' => $host,
            'port' => $port,
            'status' => 'up',
            'latency_ms' => $latencyMs,
            'error' => null,
        ];
    }

    $errorMessage = trim($errstr) !== ''
        ? sprintf('No se pudo conectar a %s:%d (%s, código %d).', $host, $port, $errstr, $errno)
        : sprintf('No se pudo conectar a %s:%d.', $host, $port);

    return [
        'name' => $name,
        'host' => $host,
        'port' => $port,
        'status' => 'down',
        'latency_ms' => $latencyMs,
        'error' => $errorMessage,
    ];
}

$rawInput = file_get_contents('php://input');

if ($rawInput === false) {
    respond([
        'ok' => false,
        'timestamp' => nowIso8601(),
        'results' => [],
        'error' => 'No se pudo leer el cuerpo de la petición.',
    ], 400);
}

if (trim($rawInput) === '') {
    respond([
        'ok' => false,
        'timestamp' => nowIso8601(),
        'results' => [],
        'error' => 'El cuerpo de la petición está vacío. Debe enviarse un JSON válido.',
    ], 400);
}

$data = json_decode($rawInput, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    respond([
        'ok' => false,
        'timestamp' => nowIso8601(),
        'results' => [],
        'error' => 'JSON inválido: ' . json_last_error_msg(),
    ], 400);
}

if (!is_array($data)) {
    respond([
        'ok' => false,
        'timestamp' => nowIso8601(),
        'results' => [],
        'error' => 'El JSON debe representar un objeto.',
    ], 400);
}

$timeout = 3.0;
if (array_key_exists('timeout', $data)) {
    if (!is_numeric($data['timeout']) || (float) $data['timeout'] <= 0) {
        respond([
            'ok' => false,
            'timestamp' => nowIso8601(),
            'results' => [],
            'error' => 'El campo "timeout" debe ser numérico y mayor que 0.',
        ], 400);
    }
    $timeout = (float) $data['timeout'];
}

if (!array_key_exists('servers', $data)) {
    respond([
        'ok' => false,
        'timestamp' => nowIso8601(),
        'results' => [],
        'error' => 'Falta el campo obligatorio "servers".',
    ], 400);
}

if (!is_array($data['servers'])) {
    respond([
        'ok' => false,
        'timestamp' => nowIso8601(),
        'results' => [],
        'error' => 'El campo "servers" debe ser un array.',
    ], 400);
}

$results = [];

foreach ($data['servers'] as $server) {
    $validation = validateServerDefinition($server);

    if (!$validation['valid']) {
        $results[] = buildInvalidResult($server, implode(' ', $validation['errors']));
        continue;
    }

    $name = trim((string) $server['name']);
    $host = trim((string) $server['host']);

    foreach ($server['ports'] as $port) {
        $results[] = checkTcpConnectivity($name, $host, (int) $port, $timeout);
    }
}

respond([
    'ok' => true,
    'timestamp' => nowIso8601(),
    'results' => $results,
]);