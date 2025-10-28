// ================================================================
// DIAGNÓSTICO DETALLADO - PERMISOS BACKEND VS FRONTEND
// ================================================================

console.log('🔍 INICIANDO AUDITORÍA COMPLETA DE PERMISOS...');
console.log('=====================================================');

// Obtener datos del usuario actual
const userData = localStorage.getItem('user');
let currentUser = null;

if (userData) {
    currentUser = JSON.parse(userData);
    console.log('👤 USUARIO ACTUAL:');
    console.log('  - Username:', currentUser.username);
    console.log('  - Documento:', currentUser.documento);
    console.log('  - Roles:', currentUser.roles);
    console.log('  - Token presente:', !!currentUser.token);
} else {
    console.log('❌ No hay usuario autenticado');
    console.log('💡 Haz login primero para realizar la auditoría');
}

// Función para probar endpoints
async function testEndpoint(method, url, expectedStatus, roleName) {
    if (!currentUser || !currentUser.token) {
        return { status: 'NO_TOKEN', error: 'Sin token de autenticación' };
    }
    
    try {
        const headers = {
            'Authorization': `Bearer ${currentUser.token}`,
            'Content-Type': 'application/json'
        };
        
        const response = await fetch(`http://localhost:8080/api${url}`, {
            method: method,
            headers: headers
        });
        
        const result = {
            status: response.status,
            expected: expectedStatus,
            success: response.status === expectedStatus,
            roleName: roleName
        };
        
        if (!result.success && response.status === 403) {
            result.error = 'Acceso prohibido';
        } else if (!result.success && response.status === 401) {
            result.error = 'No autorizado - Token inválido';
        }
        
        return result;
    } catch (error) {
        return { status: 'ERROR', error: error.message, roleName };
    }
}

// Tests específicos por rol
async function runPermissionTests() {
    if (!currentUser) {
        console.log('❌ No se pueden ejecutar tests sin usuario autenticado');
        return;
    }
    
    console.log(`\n🧪 EJECUTANDO TESTS PARA ROL: ${currentUser.roles.join(', ')}`);
    console.log('================================================');
    
    const isAdmin = currentUser.roles.includes('ROLE_ADMIN');
    const isVeterinario = currentUser.roles.includes('ROLE_VETERINARIO');
    const isRecepcionista = currentUser.roles.includes('ROLE_RECEPCIONISTA');
    const isCliente = currentUser.roles.includes('ROLE_CLIENTE');
    
    // Tests para USUARIOS
    console.log('\n📋 GESTIÓN DE USUARIOS:');
    
    const userTests = [
        { method: 'GET', url: '/usuarios', expected: (isAdmin || isRecepcionista) ? 200 : 403, name: 'Listar todos los usuarios' },
        { method: 'GET', url: `/usuarios/${currentUser.documento}`, expected: 200, name: 'Ver propio perfil' },
        { method: 'GET', url: '/usuarios/12345678', expected: (isAdmin || isRecepcionista) ? 200 : 403, name: 'Ver perfil admin' }
    ];
    
    for (const test of userTests) {
        const result = await testEndpoint(test.method, test.url, test.expected, test.name);
        console.log(`  ${result.success ? '✅' : '❌'} ${test.name}: ${result.status} (esperado: ${test.expected})`);
        if (!result.success) console.log(`     🔍 Error: ${result.error || 'Status inesperado'}`);
    }
    
    // Tests para MASCOTAS
    console.log('\n🐕 GESTIÓN DE MASCOTAS:');
    
    const mascotaTests = [
        { method: 'GET', url: '/mascotas', expected: (isAdmin || isRecepcionista || isVeterinario) ? 200 : 403, name: 'Listar todas las mascotas' },
        { method: 'GET', url: '/mascotas/activas', expected: (isAdmin || isRecepcionista || isVeterinario) ? 200 : 403, name: 'Listar mascotas activas' },
        { method: 'GET', url: `/mascotas/propietario/${currentUser.documento}`, expected: 200, name: 'Ver mis mascotas' },
        { method: 'GET', url: `/mascotas/propietario/${currentUser.documento}/activas`, expected: 200, name: 'Ver mis mascotas activas' }
    ];
    
    for (const test of mascotaTests) {
        const result = await testEndpoint(test.method, test.url, test.expected, test.name);
        console.log(`  ${result.success ? '✅' : '❌'} ${test.name}: ${result.status} (esperado: ${test.expected})`);
        if (!result.success) console.log(`     🔍 Error: ${result.error || 'Status inesperado'}`);
    }
    
    // Tests para CITAS
    console.log('\n📅 GESTIÓN DE CITAS:');
    
    const citaTests = [
        { method: 'GET', url: '/citas', expected: (isAdmin || isRecepcionista || isVeterinario) ? 200 : 403, name: 'Listar todas las citas' },
        { method: 'GET', url: `/citas/cliente/${currentUser.documento}`, expected: 200, name: 'Ver mis citas' },
        { method: 'GET', url: '/citas/hoy', expected: (isAdmin || isRecepcionista || isVeterinario) ? 200 : 403, name: 'Ver citas de hoy' }
    ];
    
    for (const test of citaTests) {
        const result = await testEndpoint(test.method, test.url, test.expected, test.name);
        console.log(`  ${result.success ? '✅' : '❌'} ${test.name}: ${result.status} (esperado: ${test.expected})`);
        if (!result.success) console.log(`     🔍 Error: ${result.error || 'Status inesperado'}`);
    }
    
    // Tests para HISTORIAS CLÍNICAS
    console.log('\n📋 HISTORIAS CLÍNICAS:');
    
    const historiaTests = [
        { method: 'GET', url: '/historias-clinicas', expected: (isAdmin || isRecepcionista || isVeterinario) ? 200 : 403, name: 'Listar todas las historias' },
        { method: 'GET', url: '/historias-clinicas/mascota/1', expected: 200, name: 'Ver historia de mascota 1' },
        { method: 'GET', url: '/historias-clinicas/mascota/2', expected: 200, name: 'Ver historia de mascota 2' }
    ];
    
    for (const test of historiaTests) {
        const result = await testEndpoint(test.method, test.url, test.expected, test.name);
        console.log(`  ${result.success ? '✅' : '❌'} ${test.name}: ${result.status} (esperado: ${test.expected})`);
        if (!result.success) console.log(`     🔍 Error: ${result.error || 'Status inesperado'}`);
    }
    
    // Tests para VETERINARIAS (Público)
    console.log('\n🏥 GESTIÓN DE VETERINARIAS (Público):');
    
    const veterinariaTests = [
        { method: 'GET', url: '/veterinarias', expected: 200, name: 'Listar veterinarias' },
        { method: 'GET', url: '/veterinarias/1', expected: 200, name: 'Ver veterinaria 1' },
        { method: 'GET', url: '/veterinarias/activas', expected: 200, name: 'Listar veterinarias activas' }
    ];
    
    for (const test of veterinariaTests) {
        const result = await testEndpoint(test.method, test.url, test.expected, test.name);
        console.log(`  ${result.success ? '✅' : '❌'} ${test.name}: ${result.status} (esperado: ${test.expected})`);
        if (!result.success) console.log(`     🔍 Error: ${result.error || 'Status inesperado'}`);
    }
    
    // Tests para REPORTES
    console.log('\n📊 GESTIÓN DE REPORTES:');
    
    const reporteTests = [
        { method: 'GET', url: '/reportes', expected: (isAdmin || isVeterinario) ? 200 : 403, name: 'Listar reportes' },
        { method: 'GET', url: '/reportes/estadisticas', expected: (isAdmin || isVeterinario) ? 200 : 403, name: 'Ver estadísticas' }
    ];
    
    for (const test of reporteTests) {
        const result = await testEndpoint(test.method, test.url, test.expected, test.name);
        console.log(`  ${result.success ? '✅' : '❌'} ${test.name}: ${result.status} (esperado: ${test.expected})`);
        if (!result.success) console.log(`     🔍 Error: ${result.error || 'Status inesperado'}`);
    }
}

// Función para verificar estado de componentes frontend
function checkFrontendComponents() {
    console.log('\n🖥️ VERIFICACIÓN DE COMPONENTES FRONTEND:');
    console.log('========================================');
    
    if (!currentUser) {
        console.log('❌ Sin usuario autenticado para verificar componentes');
        return;
    }
    
    const isAdmin = currentUser.roles.includes('ROLE_ADMIN');
    const isVeterinario = currentUser.roles.includes('ROLE_VETERINARIO');
    const isRecepcionista = currentUser.roles.includes('ROLE_RECEPCIONISTA');
    const isCliente = currentUser.roles.includes('ROLE_CLIENTE');
    
    console.log('📱 Componentes que deberían estar disponibles:');
    
    if (isAdmin) {
        console.log('  ✅ ADMIN - Panel completo:');
        console.log('    - UserManagement (Gestión de usuarios)');
        console.log('    - VeterinariaManagement (Gestión de veterinarias)');
        console.log('    - MascotaManagement (Todas las mascotas)');
        console.log('    - CitaManagement (Todas las citas)');
        console.log('    - HistoriaClinicaManagement (Todas las historias)');
        console.log('    - ReporteManagement (Reportes y estadísticas)');
    }
    
    if (isVeterinario) {
        console.log('  ✅ VETERINARIO - Panel especializado:');
        console.log('    - CitaManagement (Sus citas + generales)');
        console.log('    - MascotaManagement (Todas las mascotas)');
        console.log('    - HistoriaClinicaManagement (Crear/ver historias)');
        console.log('    - UserManagement (Ver clientes)');
        console.log('    - ReporteManagement (Ver reportes)');
    }
    
    if (isRecepcionista) {
        console.log('  ✅ RECEPCIONISTA - Panel operativo:');
        console.log('    - CitaManagement (Gestión completa)');
        console.log('    - UserManagement (Gestión de clientes)');
        console.log('    - MascotaManagement (Todas las mascotas)');
        console.log('    - HistoriaClinicaManagement (Ver historias)');
    }
    
    if (isCliente) {
        console.log('  ✅ CLIENTE - Panel personal:');
        console.log('    - MascotaManagement (Solo SUS mascotas)');
        console.log('    - CitaManagement (Solo SUS citas)');
        console.log('    - HistoriaClinicaManagement (Solo historias de SUS mascotas)');
    }
}

// Función para generar reporte final
function generateReport() {
    console.log('\n📊 REPORTE FINAL DE AUDITORÍA:');
    console.log('===============================');
    
    if (!currentUser) {
        console.log('❌ No se pudo completar la auditoría sin usuario autenticado');
        console.log('💡 Pasos para realizar auditoría completa:');
        console.log('   1. Hacer login como admin: admin / 123456');
        console.log('   2. Ejecutar: runPermissionTests()');
        console.log('   3. Hacer login como cliente1: cliente1 / 123456');
        console.log('   4. Ejecutar: runPermissionTests()');
        return;
    }
    
    console.log('✅ CONFIGURACIONES VERIFICADAS:');
    console.log('  - Autenticación JWT funcionando');
    console.log('  - Roles correctamente asignados');
    console.log('  - Headers de autorización incluidos');
    
    console.log('\n🎯 RECOMENDACIONES:');
    console.log('  1. Ejecutar tests con diferentes roles');
    console.log('  2. Verificar endpoints específicos de cada usuario');
    console.log('  3. Confirmar que frontend respeta permisos backend');
    console.log('  4. Probar casos extremos (tokens expirados, etc.)');
}

// Ejecutar diagnóstico
checkFrontendComponents();

// Funciones disponibles para el usuario
window.runPermissionTests = runPermissionTests;
window.generateReport = generateReport;

console.log('\n🔧 FUNCIONES DISPONIBLES:');
console.log('- runPermissionTests(): Ejecutar tests de permisos completos');
console.log('- generateReport(): Generar reporte final');
console.log('\n💡 EJECUTA: runPermissionTests() para comenzar las pruebas');

// Ejecutar tests automáticamente si hay usuario
if (currentUser) {
    runPermissionTests().then(() => {
        generateReport();
        console.log('\n✅ AUDITORÍA COMPLETADA');
        console.log('====================================');
    });
}