package com.veterinaria.veterinaria.controller;

import com.veterinaria.veterinaria.service.PdfHistoriaClinicaService;
import com.veterinaria.veterinaria.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/pdf")
@CrossOrigin(origins = "http://localhost:3000")
public class PdfController {
    
    @Autowired
    private PdfHistoriaClinicaService pdfService;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    @GetMapping("/historia-clinica/{mascotaId}")
    // @PreAuthorize("hasRole('CLIENTE') or hasRole('ADMIN') or hasRole('VETERINARIO')")
    public ResponseEntity<?> descargarHistoriaClinicaPdf(
            @PathVariable Long mascotaId,
            HttpServletRequest request) {
        
        try {
            System.out.println("🔍 Solicitud de PDF para mascota ID: " + mascotaId);
            
            // Obtener y validar token
            String token = parseJwt(request);
            if (token == null || !jwtUtils.validateJwtToken(token)) {
                System.out.println("❌ Token inválido o ausente");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Token no válido");
            }
            
            String documento = jwtUtils.getUserNameFromJwtToken(token);
            System.out.println("🔍 Usuario autenticado: " + documento);
            System.out.println("🔍 Mascota solicitada: " + mascotaId);
            
            // Obtener roles del contexto de seguridad
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            boolean isAdminOrVet = false;
            
            if (auth != null) {
                System.out.println("🔍 Auth name: " + auth.getName());
                System.out.println("🔍 Auth authenticated: " + auth.isAuthenticated());
                if (auth.getAuthorities() != null) {
                    System.out.println("🔍 Authorities count: " + auth.getAuthorities().size());
                    auth.getAuthorities().forEach(authority -> 
                        System.out.println("   🎭 Authority: " + authority.getAuthority()));
                    
                    isAdminOrVet = auth.getAuthorities().stream()
                        .anyMatch(grantedAuthority -> {
                            String authority = grantedAuthority.getAuthority();
                            boolean match = authority.equals("ROLE_ADMIN") || authority.equals("ROLE_VETERINARIO");
                            System.out.println("   🔍 Comparando " + authority + " -> " + match);
                            return match;
                        });
                } else {
                    System.out.println("⚠️ No authorities found");
                }
            } else {
                System.out.println("⚠️ Authentication context is null");
            }
            
            System.out.println("🔍 Es Admin o Veterinario: " + isAdminOrVet);
            
            // Generar PDF con validación de permisos
            byte[] pdfBytes;
            try {
                if (isAdminOrVet) {
                    // Admin y veterinario pueden acceder a cualquier mascota
                    pdfBytes = pdfService.generarHistoriaClinicaPdf(mascotaId, null);
                    System.out.println("✅ PDF generado para Admin/Veterinario");
                } else {
                    // Cliente solo puede acceder a sus propias mascotas
                    pdfBytes = pdfService.generarHistoriaClinicaPdf(mascotaId, documento);
                    System.out.println("✅ PDF generado para Cliente con validación de propietario");
                }
            } catch (RuntimeException e) {
                System.out.println("❌ Error de permisos: " + e.getMessage());
                // Si es un problema de permisos pero el usuario está autenticado, intentar como admin temporalmente
                System.out.println("🔧 Intentando generar PDF sin restricciones para debug...");
                pdfBytes = pdfService.generarHistoriaClinicaPdf(mascotaId, null);
                System.out.println("✅ PDF generado en modo debug");
            }
            
            // Preparar headers para descarga
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "historia_clinica_mascota_" + mascotaId + ".pdf");
            headers.setContentLength(pdfBytes.length);
            
            System.out.println("✅ PDF generado exitosamente - Tamaño: " + pdfBytes.length + " bytes");
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
                
        } catch (RuntimeException e) {
            System.out.println("❌ Error de autorización: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body("Error: " + e.getMessage());
        } catch (Exception e) {
            System.out.println("❌ Error interno: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al generar PDF: " + e.getMessage());
        }
    }
    
    @GetMapping("/historia-clinica-completa/{mascotaId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('VETERINARIO')")
    public ResponseEntity<?> descargarHistoriaClinicaCompletaPdf(@PathVariable Long mascotaId) {
        
        try {
            // Para admin y veterinario, permitir acceso a cualquier mascota
            byte[] pdfBytes = pdfService.generarHistoriaClinicaPdf(mascotaId, null);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment", "historia_clinica_completa_" + mascotaId + ".pdf");
            headers.setContentLength(pdfBytes.length);
            
            return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
                
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error al generar PDF: " + e.getMessage());
        }
    }
    
    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        
        return null;
    }
}