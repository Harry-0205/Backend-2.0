package com.veterinaria.veterinaria.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordHashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        // Generar hashes para las contraseñas
        String[] passwords = {"123456", "admin123", "dr123", "rec123", "cli123"};
        
        System.out.println("=== Hashes BCrypt generados ===");
        for (String password : passwords) {
            String hash = encoder.encode(password);
            System.out.println("Contraseña: " + password);
            System.out.println("Hash BCrypt: " + hash);
            System.out.println("Verificación: " + encoder.matches(password, hash));
            System.out.println("---");
        }
        
        // Verificar el hash actual que podríamos tener en la base de datos
        String plainPassword = "123456";
        String existingHash = "$2a$10$0123456789abcdefghijklmnopqrstuvwxyz"; // Ejemplo
        
        System.out.println("\n=== Verificación con contraseña 123456 ===");
        System.out.println("Contraseña plana: " + plainPassword);
        System.out.println("¿Coincide con hash ejemplo?: " + encoder.matches(plainPassword, existingHash));
    }
}