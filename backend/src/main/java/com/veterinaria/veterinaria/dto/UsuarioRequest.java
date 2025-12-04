package com.veterinaria.veterinaria.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;

public class UsuarioRequest {
    private String documento;
    private String username;
    private String nombres;
    private String apellidos;
    private String email;
    private String telefono;
    private String direccion;
    private String tipoDocumento;
    private LocalDate fechaNacimiento;
    private Boolean activo;
    
    // Soporta tanto IDs numéricos como nombres de roles
    @JsonProperty("roles")
    private Object rolesRaw; // Puede ser List<Integer> o List<String>
    
    private String password;
    private Long veterinariaId; // ID de la veterinaria para veterinarios
    
    // Constructor vacío
    public UsuarioRequest() {}
    
    // Getters y Setters
    public String getDocumento() { return documento; }
    public void setDocumento(String documento) { this.documento = documento; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getNombres() { return nombres; }
    public void setNombres(String nombres) { this.nombres = nombres; }
    
    public String getApellidos() { return apellidos; }
    public void setApellidos(String apellidos) { this.apellidos = apellidos; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    
    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
    
    public String getTipoDocumento() { return tipoDocumento; }
    public void setTipoDocumento(String tipoDocumento) { this.tipoDocumento = tipoDocumento; }
    
    public LocalDate getFechaNacimiento() { return fechaNacimiento; }
    public void setFechaNacimiento(LocalDate fechaNacimiento) { this.fechaNacimiento = fechaNacimiento; }
    
    public Boolean getActivo() { return activo; }
    public void setActivo(Boolean activo) { this.activo = activo; }
    
    // Método para obtener roles como lista de strings (nombres o IDs convertidos)
    public List<String> getRoles() {
        if (rolesRaw == null) return null;
        
        if (rolesRaw instanceof List) {
            List<?> list = (List<?>) rolesRaw;
            if (list.isEmpty()) return null;
            
            // Convertir todos los elementos a String
            return list.stream()
                .map(item -> {
                    if (item instanceof Number) {
                        // Si es un número, convertirlo a String (será procesado como ID)
                        return item.toString();
                    } else if (item instanceof String) {
                        return (String) item;
                    }
                    return null;
                })
                .filter(item -> item != null)
                .collect(java.util.stream.Collectors.toList());
        }
        
        return null;
    }
    
    public void setRoles(Object roles) { 
        this.rolesRaw = roles; 
    }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public Long getVeterinariaId() { return veterinariaId; }
    public void setVeterinariaId(Long veterinariaId) { this.veterinariaId = veterinariaId; }
}