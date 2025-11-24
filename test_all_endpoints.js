/**
 * Script de prueba completo para verificar todos los endpoints principales
 * Este script verifica usuarios, veterinarias, mascotas y citas
 */

const axios = require('axios');

const API_URL = 'http://localhost:8080/api';

// Colores para la consola
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function autenticar() {
    const credenciales = [
        { username: 'admin', password: 'admin123' },
        { username: 'admin', password: 'Admin123' },
        { username: 'recepcionista', password: 'recepcionista123' }
    ];

    for (const cred of credenciales) {
        try {
            const loginResponse = await axios.post(`${API_URL}/auth/login`, cred);
            
            if (loginResponse.data && loginResponse.data.token) {
                return {
                    token: loginResponse.data.token,
                    user: loginResponse.data
                };
            }
        } catch (error) {
            // Continuar con siguiente credencial
        }
    }
    
    return null;
}

async function testEndpoint(nombre, endpoint, token) {
    try {
        const response = await axios.get(`${API_URL}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        let data = response.data;
        let count = 0;
        let tieneApiResponse = false;

        // Verificar estructura de ApiResponse
        if (data.success !== undefined && data.data !== undefined) {
            tieneApiResponse = true;
            count = Array.isArray(data.data) ? data.data.length : 0;
        } else if (Array.isArray(data)) {
            count = data.length;
        }

        log(`  ✅ ${nombre}: ${count} registros (${tieneApiResponse ? 'ApiResponse' : 'Array directo'})`, 'green');
        return { success: true, count, tieneApiResponse };
    } catch (error) {
        if (error.response) {
            log(`  ❌ ${nombre}: Error ${error.response.status} - ${error.response.statusText}`, 'red');
        } else {
            log(`  ❌ ${nombre}: ${error.message}`, 'red');
        }
        return { success: false, error: error.message };
    }
}

async function testAllEndpoints() {
    log('\n========================================', 'cyan');
    log('   TEST COMPLETO DE ENDPOINTS', 'cyan');
    log('========================================\n', 'cyan');

    // 1. Autenticación
    log('1️⃣  Autenticando...', 'blue');
    const auth = await autenticar();
    
    if (!auth) {
        log('\n❌ No se pudo autenticar. Verifica las credenciales.', 'red');
        return;
    }

    log(`   ✅ Autenticado como: ${auth.user.username}`, 'green');
    log(`   Roles: ${auth.user.roles ? auth.user.roles.join(', ') : 'N/A'}\n`, 'green');

    // 2. Probar endpoints
    log('2️⃣  Probando endpoints principales...', 'blue');
    
    const endpoints = [
        { nombre: 'Usuarios', path: '/usuarios' },
        { nombre: 'Veterinarias', path: '/veterinarias' },
        { nombre: 'Mascotas', path: '/mascotas' },
        { nombre: 'Citas', path: '/citas' }
    ];

    const resultados = {};
    
    for (const endpoint of endpoints) {
        const resultado = await testEndpoint(endpoint.nombre, endpoint.path, auth.token);
        resultados[endpoint.nombre] = resultado;
    }

    // 3. Resumen
    log('\n3️⃣  Resumen de resultados:', 'blue');
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    
    let todosExitosos = true;
    let totalRegistros = 0;
    
    for (const [nombre, resultado] of Object.entries(resultados)) {
        if (resultado.success) {
            log(`  ✓ ${nombre.padEnd(15)} ${String(resultado.count).padStart(4)} registros   [${resultado.tieneApiResponse ? 'ApiResponse' : 'Array'}]`, 'green');
            totalRegistros += resultado.count;
        } else {
            log(`  ✗ ${nombre.padEnd(15)} ERROR`, 'red');
            todosExitosos = false;
        }
    }
    
    log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
    
    if (todosExitosos) {
        log(`\n✅ TODOS LOS ENDPOINTS FUNCIONAN CORRECTAMENTE`, 'green');
        log(`   Total de registros en la base de datos: ${totalRegistros}`, 'green');
    } else {
        log(`\n⚠️  ALGUNOS ENDPOINTS TIENEN PROBLEMAS`, 'yellow');
    }

    // 4. Verificar inconsistencias
    log('\n4️⃣  Verificando consistencia de respuestas...', 'blue');
    
    const conApiResponse = Object.entries(resultados)
        .filter(([_, r]) => r.success && r.tieneApiResponse)
        .map(([n, _]) => n);
    
    const sinApiResponse = Object.entries(resultados)
        .filter(([_, r]) => r.success && !r.tieneApiResponse)
        .map(([n, _]) => n);
    
    if (conApiResponse.length > 0 && sinApiResponse.length > 0) {
        log('  ⚠️  INCONSISTENCIA DETECTADA:', 'yellow');
        log(`     Con ApiResponse: ${conApiResponse.join(', ')}`, 'yellow');
        log(`     Sin ApiResponse: ${sinApiResponse.join(', ')}`, 'yellow');
        log('     Recomendación: Estandarizar todas las respuestas con ApiResponse', 'yellow');
    } else if (conApiResponse.length > 0) {
        log('  ✅ Todas las respuestas usan ApiResponse', 'green');
    } else if (sinApiResponse.length > 0) {
        log('  ✅ Todas las respuestas usan arrays directos', 'green');
    }

    log('\n========================================\n', 'cyan');
}

// Ejecutar el test
testAllEndpoints();
