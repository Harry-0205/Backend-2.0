package com.veterinaria.veterinaria.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.veterinaria.veterinaria.dto.ApiResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class AuthEntryPointJwt implements AuthenticationEntryPoint {
    
    private static final Logger logger = LoggerFactory.getLogger(AuthEntryPointJwt.class);
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {
        
        // Obtener el error específico del JWT si existe
        String jwtError = (String) request.getAttribute("jwtError");
        
        String errorMessage;
        String errorDetail;
        
        if (jwtError != null) {
            errorMessage = "Error de autenticación";
            errorDetail = jwtError;
            logger.error("JWT Error: {}", jwtError);
        } else if (authException.getMessage().contains("Full authentication is required")) {
            errorMessage = "Autenticación requerida";
            errorDetail = "No se proporcionó un token de autenticación. Por favor, inicie sesión e incluya el token en el header Authorization.";
            logger.error("Authentication required: No token provided");
        } else if (authException.getMessage().contains("Bad credentials")) {
            errorMessage = "Credenciales inválidas";
            errorDetail = "Usuario o contraseña incorrectos.";
            logger.error("Bad credentials: {}", authException.getMessage());
        } else {
            errorMessage = "Error de autenticación";
            errorDetail = authException.getMessage();
            logger.error("Unauthorized error: {}", authException.getMessage());
        }
        
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setCharacterEncoding("UTF-8");
        
        ApiResponse<Object> apiResponse = ApiResponse.error(errorMessage, errorDetail);
        
        response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
    }
}