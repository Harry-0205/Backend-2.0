/**
 * Script de prueba para verificar el endpoint de usuarios
 * Este script verifica la conectividad y la estructura de respuesta del endpoint /api/usuarios
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

async function testUsuariosEndpoint() {
    log('\n========================================', 'cyan');
    log('   TEST DE ENDPOINT DE USUARIOS', 'cyan');
    log('========================================\n', 'cyan');

    try {
        // Primero necesitamos autenticarnos para obtener un token
        log('1️⃣  Intentando autenticación...', 'blue');
        
        // Intenta con diferentes credenciales de prueba
        const credenciales = [
            { username: 'admin', password: 'admin123' },
            { username: 'admin', password: 'Admin123' },
            { username: 'recepcionista', password: 'recepcionista123' }
        ];

        let token = null;
        let userInfo = null;

        for (const cred of credenciales) {
            try {
                log(`   Probando con usuario: ${cred.username}...`, 'yellow');
                const loginResponse = await axios.post(`${API_URL}/auth/login`, cred);
                
                if (loginResponse.data && loginResponse.data.token) {
                    token = loginResponse.data.token;
                    userInfo = loginResponse.data;
                    log(`   ✅ Autenticación exitosa como ${cred.username}`, 'green');
                    log(`   Rol: ${userInfo.roles ? userInfo.roles.join(', ') : 'N/A'}`, 'green');
                    break;
                }
            } catch (error) {
                log(`   ❌ Fallo con ${cred.username}`, 'red');
            }
        }

        if (!token) {
            log('\n❌ No se pudo autenticar con ninguna credencial.', 'red');
            log('   Asegúrate de que el backend esté corriendo en http://localhost:8080', 'yellow');
            log('   y que exista al menos un usuario admin en la base de datos.', 'yellow');
            return;
        }

        log('\n2️⃣  Consultando endpoint de usuarios...', 'blue');
        
        const response = await axios.get(`${API_URL}/usuarios`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        log('   ✅ Respuesta recibida del servidor', 'green');
        log('\n3️⃣  Analizando estructura de respuesta...', 'blue');
        
        console.log('\n📊 Respuesta completa:');
        console.log(JSON.stringify(response.data, null, 2));

        // Verificar estructura de ApiResponse
        if (response.data.success !== undefined) {
            log('\n   ✅ Estructura ApiResponse detectada', 'green');
            log(`   - success: ${response.data.success}`, 'cyan');
            log(`   - message: ${response.data.message}`, 'cyan');
            
            if (response.data.data) {
                const usuarios = response.data.data;
                log(`   - data: Array con ${usuarios.length} usuarios`, 'cyan');
                
                if (usuarios.length > 0) {
                    log('\n4️⃣  Muestra de primer usuario:', 'blue');
                    const primerUsuario = usuarios[0];
                    console.log(JSON.stringify(primerUsuario, null, 2));
                    
                    log('\n✅ DIAGNÓSTICO EXITOSO', 'green');
                    log('   El endpoint está funcionando correctamente.', 'green');
                    log(`   Total de usuarios: ${usuarios.length}`, 'green');
                } else {
                    log('\n⚠️  WARNING: No hay usuarios en la base de datos', 'yellow');
                    log('   El endpoint funciona pero no retorna datos.', 'yellow');
                }
            } else {
                log('\n❌ ERROR: Campo "data" no encontrado en la respuesta', 'red');
            }
        } else if (Array.isArray(response.data)) {
            log('\n   ⚠️  Respuesta es un array directo (no ApiResponse)', 'yellow');
            log(`   Total de usuarios: ${response.data.length}`, 'yellow');
        } else {
            log('\n   ❌ Estructura de respuesta no reconocida', 'red');
        }

    } catch (error) {
        log('\n❌ ERROR DURANTE LA PRUEBA', 'red');
        
        if (error.response) {
            log(`   Status: ${error.response.status}`, 'red');
            log(`   Status Text: ${error.response.statusText}`, 'red');
            log(`   Mensaje: ${error.response.data?.message || 'N/A'}`, 'red');
            
            if (error.response.status === 403) {
                log('\n   💡 El usuario no tiene permisos para acceder al endpoint', 'yellow');
            } else if (error.response.status === 401) {
                log('\n   💡 Token inválido o expirado', 'yellow');
            }
        } else if (error.request) {
            log('   No se recibió respuesta del servidor', 'red');
            log('   ¿El backend está corriendo en http://localhost:8080?', 'yellow');
        } else {
            log(`   Error: ${error.message}`, 'red');
        }
    }
}

// Ejecutar el test
testUsuariosEndpoint();
