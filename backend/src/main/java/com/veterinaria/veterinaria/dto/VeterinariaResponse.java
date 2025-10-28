package com.veterinaria.veterinaria.dto;

import com.veterinaria.veterinaria.entity.Veterinaria;
import java.time.LocalDateTime;

public class VeterinariaResponse {
    private Long id;
    private String nombre;
    private String direccion;
    private String telefono;
    private String email;
    private String ciudad;
    private String descripcion;
    private String servicios;
    private String horarioAtencion;
    private LocalDateTime fechaRegistro;
    private boolean activo;
    
    // Constructor
    public VeterinariaResponse(Veterinaria veterinaria) {
        this.id = veterinaria.getId();
        this.nombre = veterinaria.getNombre();
        this.direccion = veterinaria.getDireccion();
        this.telefono = veterinaria.getTelefono();
        this.email = veterinaria.getEmail();
        this.ciudad = veterinaria.getCiudad();
        this.descripcion = veterinaria.getDescripcion();
        this.servicios = veterinaria.getServicios();
        this.horarioAtencion = veterinaria.getHorarioAtencion();
        this.fechaRegistro = veterinaria.getFechaRegistro();
        this.activo = veterinaria.getActivo() != null ? veterinaria.getActivo() : false;
    }
    
    // Getters
    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public String getDireccion() { return direccion; }
    public String getTelefono() { return telefono; }
    public String getEmail() { return email; }
    public String getCiudad() { return ciudad; }
    public String getDescripcion() { return descripcion; }
    public String getServicios() { return servicios; }
    public String getHorarioAtencion() { return horarioAtencion; }
    public LocalDateTime getFechaRegistro() { return fechaRegistro; }
    public boolean isActivo() { return activo; }
}