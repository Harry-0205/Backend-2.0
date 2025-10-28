package com.veterinaria.veterinaria.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HealthController {
    
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("timestamp", LocalDateTime.now());
        health.put("service", "Veterinaria API");
        health.put("version", "1.0.0");
        health.put("description", "Sistema de gestión veterinaria con Spring Boot y Java 21");
        
        return ResponseEntity.ok(health);
    }
    
    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> info() {
        Map<String, Object> info = new HashMap<>();
        info.put("app", "Sistema de Gestión Veterinaria");
        info.put("version", "1.0.0");
        info.put("java", System.getProperty("java.version"));
        info.put("spring", "3.4.0");
        info.put("build", LocalDateTime.now());
        
        Map<String, String> contact = new HashMap<>();
        contact.put("name", "Equipo de Desarrollo");
        contact.put("email", "desarrollo@veterinaria.com");
        info.put("contact", contact);
        
        return ResponseEntity.ok(info);
    }
}