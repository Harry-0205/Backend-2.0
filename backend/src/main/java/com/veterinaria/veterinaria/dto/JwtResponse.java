package com.veterinaria.veterinaria.dto;

import java.util.List;

public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private String documento;
    private String username;
    private String email;
    private List<String> roles;
    private String nombres;
    private String apellidos;
    private String telefono;
    private String direccion;
    private VeterinariaInfo veterinaria;
    
    public JwtResponse(String accessToken, String documento, String username, String email, List<String> roles) {
        this.token = accessToken;
        this.documento = documento;
        this.username = username;
        this.email = email;
        this.roles = roles;
    }
    
    // Inner class para información de veterinaria
    public static class VeterinariaInfo {
        private Long id;
        private String nombre;
        private String telefono;
        private String direccion;
        
        public VeterinariaInfo(Long id, String nombre, String telefono, String direccion) {
            this.id = id;
            this.nombre = nombre;
            this.telefono = telefono;
            this.direccion = direccion;
        }
        
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getNombre() { return nombre; }
        public void setNombre(String nombre) { this.nombre = nombre; }
        public String getTelefono() { return telefono; }
        public void setTelefono(String telefono) { this.telefono = telefono; }
        public String getDireccion() { return direccion; }
        public void setDireccion(String direccion) { this.direccion = direccion; }
    }
    
    public String getToken() {
        return token;
    }
    
    public void setToken(String token) {
        this.token = token;
    }
    
    public String getType() {
        return type;
    }
    
    public void setType(String type) {
        this.type = type;
    }
    
    public String getDocumento() {
        return documento;
    }
    
    public void setDocumento(String documento) {
        this.documento = documento;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public List<String> getRoles() {
        return roles;
    }
    
    public void setRoles(List<String> roles) {
        this.roles = roles;
    }
    
    public String getNombres() { 
        return nombres; 
    }
    
    public void setNombres(String nombres) { 
        this.nombres = nombres; 
    }
    
    public String getApellidos() { 
        return apellidos; 
    }
    
    public void setApellidos(String apellidos) { 
        this.apellidos = apellidos; 
    }
    
    public String getTelefono() { 
        return telefono; 
    }
    
    public void setTelefono(String telefono) { 
        this.telefono = telefono; 
    }
    
    public String getDireccion() { 
        return direccion; 
    }
    
    public void setDireccion(String direccion) { 
        this.direccion = direccion; 
    }
    
    public VeterinariaInfo getVeterinaria() { 
        return veterinaria; 
    }
    
    public void setVeterinaria(VeterinariaInfo veterinaria) { 
        this.veterinaria = veterinaria; 
    }
} 
