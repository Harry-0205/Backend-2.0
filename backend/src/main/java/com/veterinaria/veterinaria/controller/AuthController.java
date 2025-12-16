package com.veterinaria.veterinaria.controller;

import com.veterinaria.veterinaria.dto.JwtResponse;
import com.veterinaria.veterinaria.dto.LoginRequest;
import com.veterinaria.veterinaria.dto.SignupRequest;
import com.veterinaria.veterinaria.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    AuthService authService;
    
    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            JwtResponse jwtResponse = authService.authenticateUser(loginRequest);
            return ResponseEntity.ok(jwtResponse);
        } catch (org.springframework.security.authentication.DisabledException ex) {
            // Propagar la excepción para que sea manejada por GlobalExceptionHandler
            throw ex;
        } catch (Exception ex) {
            // Propagar otras excepciones
            throw ex;
        }
    }
    
    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        return authService.registerUser(signUpRequest);
    }
}