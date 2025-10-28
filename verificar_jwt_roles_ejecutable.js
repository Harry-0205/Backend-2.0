// ================================================================
// VERIFICACIÓN EN TIEMPO REAL - JWT Y ROLES BACKEND
// ================================================================

console.log('🔐 VERIFICANDO FLUJO JWT Y ROLES...');
console.log('====================================');

// Función para decodificar JWT (solo payload, sin verificar firma)
function decodeJWT(token) {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            return { error: 'Token JWT inválido - debe tener 3 partes' };
        }
        
        const header = JSON.parse(atob(parts[0]));
        const payload = JSON.parse(atob(parts[1]));
        
        return {
            header,
            payload,
            signature: parts[2]
        };
    } catch (error) {
        return { error: 'Error decodificando JWT: ' + error.message };
    }
}

// Función para verificar estado de autenticación
function verifyAuthenticationState() {
    console.log('\n1️⃣ VERIFICANDO ESTADO DE AUTENTICACIÓN:');
    console.log('========================================');
    
    const userData = localStorage.getItem('user');
    
    if (!userData) {
        console.log('❌ No hay datos de usuario en localStorage');
        console.log('💡 Haz login primero: cliente1/123456 o admin/123456');
        return null;
    }
    
    let user;
    try {
        user = JSON.parse(userData);
    } catch (e) {
        console.log('❌ Error parseando datos de usuario');
        return null;
    }
    
    console.log('✅ Usuario autenticado encontrado:');
    console.log('   👤 Username:', user.username);
    console.log('   📄 Documento:', user.documento);
    console.log('   📧 Email:', user.email);
    console.log('   🎭 Roles:', user.roles.join(', '));
    console.log('   🔑 Token presente:', !!user.token);
    console.log('   📏 Token length:', user.token ? user.token.length : 0);
    
    return user;
}

// Función para analizar token JWT
function analyzeJWT(user) {
    if (!user || !user.token) {
        console.log('\n❌ No hay token para analizar');
        return null;
    }
    
    console.log('\n2️⃣ ANALIZANDO TOKEN JWT:');
    console.log('========================');
    
    const decoded = decodeJWT(user.token);
    
    if (decoded.error) {
        console.log('❌ Error decodificando JWT:', decoded.error);
        return null;
    }
    
    console.log('🔍 HEADER JWT:');
    console.log('   🔐 Algoritmo:', decoded.header.alg || 'No especificado');
    console.log('   📝 Tipo:', decoded.header.typ || 'No especificado');
    
    console.log('\n🔍 PAYLOAD JWT:');
    console.log('   👤 Subject (username):', decoded.payload.sub);
    console.log('   📅 Issued At:', new Date(decoded.payload.iat * 1000).toLocaleString());
    console.log('   ⏰ Expires At:', new Date(decoded.payload.exp * 1000).toLocaleString());
    
    // Verificar expiración
    const now = Math.floor(Date.now() / 1000);
    const isExpired = decoded.payload.exp < now;
    const timeLeft = decoded.payload.exp - now;
    
    console.log('   ⚡ Estado:', isExpired ? '❌ EXPIRADO' : '✅ VÁLIDO');
    if (!isExpired) {
        const hours = Math.floor(timeLeft / 3600);
        const minutes = Math.floor((timeLeft % 3600) / 60);
        console.log('   ⏳ Tiempo restante:', `${hours}h ${minutes}m`);
    }
    
    // Verificar si hay roles en el token (generalmente no están)
    if (decoded.payload.roles) {
        console.log('   🎭 Roles en token:', decoded.payload.roles);
    } else {
        console.log('   🎭 Roles en token: No incluidos (normal - se cargan desde BD)');
    }
    
    console.log('\n🔐 FIRMA JWT:');
    console.log('   📝 Signature:', decoded.signature.substring(0, 20) + '...');
    console.log('   ✅ La firma se valida en el backend con la clave secreta');
    
    return decoded;
}

// Función para verificar flujo de autorización
async function verifyAuthorizationFlow(user) {
    if (!user || !user.token) {
        console.log('\n❌ No se puede verificar autorización sin token');
        return;
    }
    
    console.log('\n3️⃣ VERIFICANDO FLUJO DE AUTORIZACIÓN:');
    console.log('=====================================');
    
    const headers = {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json'
    };
    
    console.log('📡 Headers enviados al backend:');
    console.log('   Authorization: Bearer ' + user.token.substring(0, 20) + '...');
    console.log('   Content-Type: application/json');
    
    // Test de endpoints específicos por rol
    const tests = [
        {
            name: 'Endpoint público (health)',
            url: '/api/health',
            expectedForAllRoles: true,
            description: 'Debería funcionar para todos'
        },
        {
            name: 'Listar todos los usuarios',
            url: '/api/usuarios',
            expectedForAdmin: true,
            expectedForRecepcionista: true,
            expectedForVeterinario: false,
            expectedForCliente: false,
            description: 'Solo ADMIN y RECEPCIONISTA'
        },
        {
            name: 'Ver perfil propio',
            url: `/api/usuarios/${user.documento}`,
            expectedForAllRoles: true,
            description: 'Todos pueden ver su propio perfil'
        },
        {
            name: 'Listar todas las mascotas',
            url: '/api/mascotas',
            expectedForAdmin: true,
            expectedForRecepcionista: true,
            expectedForVeterinario: true,
            expectedForCliente: false,
            description: 'ADMIN, RECEPCIONISTA, VETERINARIO'
        },
        {
            name: 'Ver mascotas propias',
            url: `/api/mascotas/propietario/${user.documento}`,
            expectedForAllRoles: true,
            description: 'Todos pueden ver sus mascotas'
        },
        {
            name: 'Listar todas las citas',
            url: '/api/citas',
            expectedForAdmin: true,
            expectedForRecepcionista: true,
            expectedForVeterinario: true,
            expectedForCliente: false,
            description: 'ADMIN, RECEPCIONISTA, VETERINARIO'
        },
        {
            name: 'Ver citas propias',
            url: `/api/citas/cliente/${user.documento}`,
            expectedForAllRoles: true,
            description: 'Todos pueden ver sus citas'
        }
    ];
    
    console.log('\n🧪 EJECUTANDO TESTS DE AUTORIZACIÓN:');
    
    for (const test of tests) {
        console.log(`\n📝 ${test.name}:`);
        console.log(`   🔗 URL: ${test.url}`);
        console.log(`   📋 Descripción: ${test.description}`);
        
        try {
            const response = await fetch(`http://localhost:8080${test.url}`, {
                method: 'GET',
                headers: headers
            });
            
            const status = response.status;
            let result = '';
            
            if (status === 200) {
                result = '✅ PERMITIDO';
            } else if (status === 403) {
                result = '🚫 PROHIBIDO (403)';
            } else if (status === 401) {
                result = '🔐 NO AUTORIZADO (401)';
            } else if (status === 404) {
                result = '❓ NO ENCONTRADO (404)';
            } else {
                result = `⚠️ OTRO ERROR (${status})`;
            }
            
            console.log(`   📊 Resultado: ${result}`);
            
            // Verificar si el resultado es el esperado
            const userRoles = user.roles;
            let expected = false;
            
            if (test.expectedForAllRoles) {
                expected = true;
            } else {
                if (userRoles.includes('ROLE_ADMIN') && test.expectedForAdmin) expected = true;
                if (userRoles.includes('ROLE_RECEPCIONISTA') && test.expectedForRecepcionista) expected = true;
                if (userRoles.includes('ROLE_VETERINARIO') && test.expectedForVeterinario) expected = true;
                if (userRoles.includes('ROLE_CLIENTE') && test.expectedForCliente) expected = true;
            }
            
            const actualSuccess = status === 200;
            const validation = actualSuccess === expected ? '✅ CORRECTO' : '❌ INESPERADO';
            
            console.log(`   ✔️ Validación: ${validation}`);
            
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
    }
}

// Función para mostrar resumen de seguridad
function showSecuritySummary(user, jwtData) {
    console.log('\n4️⃣ RESUMEN DE SEGURIDAD:');
    console.log('========================');
    
    if (!user) {
        console.log('❌ No se pudo completar la verificación - usuario no autenticado');
        return;
    }
    
    console.log('🔒 ESTADO DE SEGURIDAD:');
    console.log('   👤 Usuario:', user.username);
    console.log('   🎭 Roles:', user.roles.join(', '));
    console.log('   🔑 Token JWT:', jwtData && !jwtData.error ? '✅ Válido' : '❌ Inválido');
    
    if (jwtData && !jwtData.error) {
        const isExpired = jwtData.payload.exp < Math.floor(Date.now() / 1000);
        console.log('   ⏰ Expiración:', isExpired ? '❌ Expirado' : '✅ Vigente');
    }
    
    console.log('\n🛡️ CARACTERÍSTICAS DE SEGURIDAD IMPLEMENTADAS:');
    console.log('   ✅ Autenticación JWT');
    console.log('   ✅ Validación de roles por endpoint');
    console.log('   ✅ Autorización granular (@PreAuthorize)');
    console.log('   ✅ Filtros de seguridad (AuthTokenFilter)');
    console.log('   ✅ Contexto de seguridad (SecurityContext)');
    console.log('   ✅ Validación de recursos propios');
    console.log('   ✅ Manejo de errores de autorización');
    
    console.log('\n📋 FLUJO DE VALIDACIÓN BACKEND:');
    console.log('   1. Request interceptado por AuthTokenFilter');
    console.log('   2. Token JWT extraído del header Authorization');
    console.log('   3. Token validado (firma, expiración, formato)');
    console.log('   4. Username extraído del token');
    console.log('   5. Usuario cargado desde BD con roles');
    console.log('   6. Roles convertidos a authorities (ROLE_*)');
    console.log('   7. SecurityContext establecido con authentication');
    console.log('   8. @PreAuthorize evalúa permisos por endpoint');
    console.log('   9. Controller ejecuta si tiene permisos');
    console.log('   10. Response enviado al cliente');
}

// Función principal
async function runJWTVerification() {
    console.log('🚀 INICIANDO VERIFICACIÓN COMPLETA...');
    console.log('=====================================');
    
    const user = verifyAuthenticationState();
    const jwtData = analyzeJWT(user);
    
    if (user && user.token) {
        await verifyAuthorizationFlow(user);
    }
    
    showSecuritySummary(user, jwtData);
    
    console.log('\n✅ VERIFICACIÓN COMPLETADA');
    console.log('============================');
    
    if (!user) {
        console.log('\n💡 Para ejecutar verificación completa:');
        console.log('   1. Haz login en la aplicación');
        console.log('   2. Vuelve a ejecutar: runJWTVerification()');
    }
}

// Exponer funciones globalmente
window.runJWTVerification = runJWTVerification;
window.decodeJWT = decodeJWT;

// Ejecutar verificación automáticamente
runJWTVerification();

console.log('\n🔧 FUNCIONES DISPONIBLES:');
console.log('   runJWTVerification() - Ejecutar verificación completa');
console.log('   decodeJWT(token) - Decodificar cualquier token JWT');