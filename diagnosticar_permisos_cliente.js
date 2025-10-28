// ================================================================
// DIAGNOSTICO DE PERMISOS PARA CLIENTE - FRONTEND
// ================================================================

console.log('🔍 INICIANDO DIAGNÓSTICO DE PERMISOS PARA CLIENTE...');
console.log('===================================================');

// 1. VERIFICAR ESTADO DE AUTENTICACIÓN
console.log('\n1️⃣ VERIFICANDO ESTADO DE AUTENTICACIÓN:');
const userData = localStorage.getItem('user');
if (userData) {
    try {
        const user = JSON.parse(userData);
        console.log('✅ Usuario encontrado en localStorage:');
        console.log('  - Username:', user.username);
        console.log('  - Documento:', user.documento);
        console.log('  - Email:', user.email);
        console.log('  - Roles:', user.roles);
        console.log('  - Token presente:', !!user.token);
        console.log('  - Token length:', user.token ? user.token.length : 0);
        
        // Verificar si el rol CLIENTE está presente
        const hasClienteRole = user.roles && user.roles.includes('ROLE_CLIENTE');
        console.log('  - ¿Tiene rol CLIENTE?:', hasClienteRole);
        
        if (user.token) {
            // Intentar decodificar el JWT (solo la parte del payload, sin verificar firma)
            try {
                const payload = JSON.parse(atob(user.token.split('.')[1]));
                console.log('  - JWT Payload:');
                console.log('    * Subject (usuario):', payload.sub);
                console.log('    * Issued At:', new Date(payload.iat * 1000));
                console.log('    * Expires At:', new Date(payload.exp * 1000));
                console.log('    * ¿Token expirado?:', Date.now() > payload.exp * 1000);
            } catch (e) {
                console.warn('⚠️ No se pudo decodificar el JWT:', e.message);
            }
        }
    } catch (e) {
        console.error('❌ Error parseando datos de usuario:', e);
    }
} else {
    console.log('❌ No se encontraron datos de usuario en localStorage');
}

// 2. VERIFICAR OTROS DATOS DE SESIÓN
console.log('\n2️⃣ VERIFICANDO OTROS DATOS DE SESIÓN:');
const sessionData = sessionStorage.getItem('user');
const separateToken = localStorage.getItem('token');
console.log('  - sessionStorage user:', !!sessionData);
console.log('  - localStorage token separado:', !!separateToken);

// 3. VERIFICAR COOKIES
console.log('\n3️⃣ VERIFICANDO COOKIES:');
console.log('  - Todas las cookies:', document.cookie || 'Ninguna');

// 4. PROBAR ENDPOINT ESPECÍFICO DEL CLIENTE
console.log('\n4️⃣ PROBANDO ACCESO A ENDPOINTS DE CLIENTE:');

async function testClientEndpoints() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.token) {
        console.log('❌ No hay token para probar endpoints');
        return;
    }
    
    const headers = {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json'
    };
    
    console.log('📡 Headers que se enviarán:');
    console.log('  - Authorization:', `Bearer ${user.token.substring(0, 20)}...`);
    
    // Test 1: Obtener mascotas del cliente
    try {
        console.log('\n🐕 Probando GET /mascotas/propietario/' + user.documento);
        const response1 = await fetch(`http://localhost:8080/api/mascotas/propietario/${user.documento}`, {
            method: 'GET',
            headers: headers
        });
        
        console.log('  - Status:', response1.status);
        console.log('  - Status Text:', response1.statusText);
        
        if (response1.status === 200) {
            const mascotas = await response1.json();
            console.log('  - ✅ Mascotas obtenidas:', mascotas.length);
        } else if (response1.status === 403) {
            console.log('  - ❌ Error 403: Sin permisos para ver sus mascotas');
        } else if (response1.status === 401) {
            console.log('  - ❌ Error 401: Token inválido o expirado');
        }
    } catch (error) {
        console.error('  - ❌ Error en request mascotas:', error.message);
    }
    
    // Test 2: Obtener citas del cliente
    try {
        console.log('\n📅 Probando GET /citas/cliente/' + user.documento);
        const response2 = await fetch(`http://localhost:8080/api/citas/cliente/${user.documento}`, {
            method: 'GET',
            headers: headers
        });
        
        console.log('  - Status:', response2.status);
        console.log('  - Status Text:', response2.statusText);
        
        if (response2.status === 200) {
            const citas = await response2.json();
            console.log('  - ✅ Citas obtenidas:', citas.length);
        } else if (response2.status === 403) {
            console.log('  - ❌ Error 403: Sin permisos para ver sus citas');
        } else if (response2.status === 401) {
            console.log('  - ❌ Error 401: Token inválido o expirado');
        }
    } catch (error) {
        console.error('  - ❌ Error en request citas:', error.message);
    }
    
    // Test 3: Probar endpoint general que debería funcionar
    try {
        console.log('\n📊 Probando GET /usuarios (endpoint general)');
        const response3 = await fetch('http://localhost:8080/api/usuarios', {
            method: 'GET',
            headers: headers
        });
        
        console.log('  - Status:', response3.status);
        console.log('  - Status Text:', response3.statusText);
        
        if (response3.status === 403) {
            console.log('  - ❌ Error 403: Cliente no tiene permisos para ver todos los usuarios (normal)');
        } else if (response3.status === 401) {
            console.log('  - ❌ Error 401: Problema de autenticación');
        } else if (response3.status === 200) {
            console.log('  - ⚠️ El cliente tiene acceso a todos los usuarios (revisar permisos)');
        }
    } catch (error) {
        console.error('  - ❌ Error en request usuarios:', error.message);
    }
}

// Ejecutar tests
testClientEndpoints().then(() => {
    console.log('\n✅ DIAGNÓSTICO COMPLETADO');
    console.log('===================================================');
    console.log('💡 RECOMENDACIONES:');
    console.log('1. Verificar que el token JWT no esté expirado');
    console.log('2. Confirmar que el usuario tiene rol ROLE_CLIENTE');
    console.log('3. Verificar configuración de permisos en backend');
    console.log('4. Limpiar localStorage y volver a hacer login si es necesario');
});

// Función para limpiar sesión si es necesario
window.limpiarSesionCompleta = function() {
    console.log('🧹 Limpiando sesión completa...');
    localStorage.clear();
    sessionStorage.clear();
    
    // Limpiar cookies del dominio
    document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    console.log('✅ Sesión limpiada. Recarga la página para hacer login nuevamente.');
    window.location.reload();
};

console.log('\n🔧 Funciones disponibles:');
console.log('- limpiarSesionCompleta(): Limpia toda la sesión y recarga');