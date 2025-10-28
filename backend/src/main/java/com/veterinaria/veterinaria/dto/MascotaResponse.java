package com.veterinaria.veterinaria.dto;

import com.veterinaria.veterinaria.entity.Mascota;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class MascotaResponse {
    private Long id;
    private String nombre;
    private String especie;
    private String raza;
    private String sexo;
    private LocalDate fechaNacimiento;
    private Double peso;
    private String color;
    private String observaciones;
    private LocalDateTime fechaRegistro;
    private boolean activo;
    
    // Información básica del propietario
    private PropietarioBasicInfo propietario;
    
    // Constructor
    public MascotaResponse(Mascota mascota) {
        this.id = mascota.getId();
        this.nombre = mascota.getNombre();
        this.especie = mascota.getEspecie();
        this.raza = mascota.getRaza();
        this.sexo = mascota.getSexo();
        this.fechaNacimiento = mascota.getFechaNacimiento();
        this.peso = mascota.getPeso();
        this.color = mascota.getColor();
        this.observaciones = mascota.getObservaciones();
        this.fechaRegistro = mascota.getFechaRegistro();
        this.activo = mascota.getActivo() != null ? mascota.getActivo() : false;
        
        // Solo información básica del propietario
        if (mascota.getPropietario() != null) {
            this.propietario = new PropietarioBasicInfo(
                mascota.getPropietario().getDocumento(),
                mascota.getPropietario().getNombres(),
                mascota.getPropietario().getApellidos(),
                mascota.getPropietario().getEmail()
            );
        }
    }
    
    // Getters
    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public String getEspecie() { return especie; }
    public String getRaza() { return raza; }
    public String getSexo() { return sexo; }
    public LocalDate getFechaNacimiento() { return fechaNacimiento; }
    public Double getPeso() { return peso; }
    public String getColor() { return color; }
    public String getObservaciones() { return observaciones; }
    public LocalDateTime getFechaRegistro() { return fechaRegistro; }
    public boolean isActivo() { return activo; }
    public PropietarioBasicInfo getPropietario() { return propietario; }
    
    // Clase interna para información básica del propietario
    public static class PropietarioBasicInfo {
        private String documento;
        private String nombres;
        private String apellidos;
        private String email;
        
        public PropietarioBasicInfo(String documento, String nombres, String apellidos, String email) {
            this.documento = documento;
            this.nombres = nombres;
            this.apellidos = apellidos;
            this.email = email;
        }
        
        // Getters
        public String getDocumento() { return documento; }
        public String getNombres() { return nombres; }
        public String getApellidos() { return apellidos; }
        public String getEmail() { return email; }
    }
}