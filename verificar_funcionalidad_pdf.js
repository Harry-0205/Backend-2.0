// 🧪 Script de Verificación - Descarga PDF Historia Clínica
// Ejecutar en la consola del navegador (F12) después de iniciar sesión

console.log('🧪 INICIANDO VERIFICACIÓN DE DESCARGA PDF HISTORIA CLÍNICA');
console.log('='.repeat(60));

// Función para probar la descarga de PDF
async function verificarDescargaPDF() {
    try {
        console.log('📋 Verificando funcionalidad de descarga PDF...');
        
        // 1. Verificar autenticación
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('❌ No hay token de autenticación');
            return false;
        }
        
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        console.log('👤 Usuario actual:', user.username, '- Roles:', user.roles);
        
        // 2. Verificar que es cliente
        const isCliente = user.roles && user.roles.includes('ROLE_CLIENTE');
        if (!isCliente) {
            console.log('ℹ️  Usuario no es cliente, verificando acceso general...');
        }
        
        // 3. Obtener mascotas del usuario
        console.log('🐕 Obteniendo mascotas del usuario...');
        const mascotasResponse = await fetch('/api/mascotas/propietario/' + user.documento, {
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            }
        });
        
        if (!mascotasResponse.ok) {
            console.error('❌ Error al obtener mascotas:', mascotasResponse.status);
            return false;
        }
        
        const mascotas = await mascotasResponse.json();
        console.log('✅ Mascotas encontradas:', mascotas.length);
        
        if (mascotas.length === 0) {
            console.log('ℹ️  No hay mascotas para probar la descarga');
            return true;
        }
        
        // 4. Probar descarga PDF con la primera mascota
        const mascota = mascotas[0];
        console.log('📄 Probando descarga PDF para mascota:', mascota.nombre, '(ID:', mascota.id + ')');
        
        const pdfResponse = await fetch(`/api/pdf/historia-clinica/${mascota.id}`, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        
        console.log('📊 Respuesta del servidor:', pdfResponse.status, pdfResponse.statusText);
        
        if (!pdfResponse.ok) {
            if (pdfResponse.status === 403) {
                console.error('❌ Error 403: Sin permisos para esta mascota');
            } else if (pdfResponse.status === 401) {
                console.error('❌ Error 401: Token no válido o expirado');
            } else {
                console.error('❌ Error del servidor:', pdfResponse.status);
            }
            return false;
        }
        
        // 5. Verificar que es un PDF válido
        const contentType = pdfResponse.headers.get('content-type');
        console.log('📋 Tipo de contenido:', contentType);
        
        if (!contentType || !contentType.includes('application/pdf')) {
            console.error('❌ Respuesta no es un PDF válido');
            return false;
        }
        
        // 6. Obtener el blob y verificar tamaño
        const pdfBlob = await pdfResponse.blob();
        console.log('📊 Tamaño del PDF:', (pdfBlob.size / 1024).toFixed(2), 'KB');
        
        if (pdfBlob.size < 100) {
            console.error('❌ PDF muy pequeño, posible error');
            return false;
        }
        
        // 7. Simular descarga (opcional)
        const confirmarDescarga = confirm('¿Deseas descargar el PDF de prueba?');
        if (confirmarDescarga) {
            const url = window.URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `PRUEBA_historia_clinica_${mascota.nombre}_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            console.log('💾 PDF descargado exitosamente');
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Error durante la verificación:', error);
        return false;
    }
}

// Función para verificar endpoints disponibles
async function verificarEndpoints() {
    console.log('\n🔍 VERIFICANDO ENDPOINTS DISPONIBLES');
    console.log('-'.repeat(40));
    
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const endpoints = [
        { url: '/api/mascotas', desc: 'Mascotas generales' },
        { url: `/api/mascotas/propietario/${user.documento}`, desc: 'Mascotas del cliente' },
        { url: '/api/historias-clinicas', desc: 'Historias clínicas generales' },
        { url: '/api/pdf/historia-clinica/1', desc: 'Descarga PDF (test ID 1)' }
    ];
    
    for (const endpoint of endpoints) {
        try {
            const response = await fetch(endpoint.url, {
                method: 'HEAD', // Solo verificar headers
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            
            const status = response.ok ? '✅' : '❌';
            console.log(`${status} ${endpoint.desc}: ${response.status}`);
        } catch (error) {
            console.log(`❌ ${endpoint.desc}: Error de conexión`);
        }
    }
}

// Función principal
async function ejecutarVerificacionCompleta() {
    console.log('🚀 Iniciando verificación completa...\n');
    
    // Verificar endpoints
    await verificarEndpoints();
    
    console.log('\n📋 VERIFICACIÓN DE DESCARGA PDF');
    console.log('-'.repeat(40));
    
    // Verificar descarga PDF
    const resultado = await verificarDescargaPDF();
    
    console.log('\n📊 RESUMEN FINAL');
    console.log('='.repeat(30));
    if (resultado) {
        console.log('✅ Verificación EXITOSA - Funcionalidad PDF operativa');
        console.log('🎉 Puedes usar los botones de PDF en la interfaz');
    } else {
        console.log('❌ Verificación FALLIDA - Revisar configuración');
        console.log('🔧 Contactar administrador del sistema');
    }
    
    console.log('\n📖 Para usar la funcionalidad:');
    console.log('1. Ve a "Mis Mascotas" y busca el botón azul de PDF 📄');
    console.log('2. O ve a "Historias Clínicas" y busca el botón verde de PDF 📄');
    console.log('3. Haz clic para descargar automáticamente');
}

// Ejecutar verificación
ejecutarVerificacionCompleta();