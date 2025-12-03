package com.veterinaria.veterinaria.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "veterinarias")
public class Veterinaria {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Column(nullable = false)
    private String nombre;
    
    @Column(columnDefinition = "TEXT")
    private String direccion;
    
    @Column(length = 20)
    private String telefono;
    
    @Column
    private String email;
    
    @Column(length = 100)
    private String ciudad;
    
    @Column(columnDefinition = "TEXT")
    private String descripcion;
    
    @Column(columnDefinition = "TEXT")
    private String servicios;
    
    @Column(name = "horario_atencion")
    private String horarioAtencion;
    
    @Column(name = "fecha_registro", nullable = false)
    private LocalDateTime fechaRegistro = LocalDateTime.now();
    
    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT true")
    private Boolean activo = true;
    
    @Column(name = "creado_por_documento", length = 20)
    private String creadoPorDocumento;
    
    @OneToMany(mappedBy = "veterinaria", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<Cita> citas = new HashSet<>();
    
    @OneToMany(mappedBy = "veterinaria", fetch = FetchType.LAZY)
    private Set<Usuario> veterinarios = new HashSet<>();
    
    // Constructores
    public Veterinaria() {}
    
    public Veterinaria(String nombre, String direccion, String telefono) {
        this.nombre = nombre;
        this.direccion = direccion;
        this.telefono = telefono;
    }
    
    // Getters y Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getNombre() {
        return nombre;
    }
    
    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
    
    public String getDireccion() {
        return direccion;
    }
    
    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }
    
    public String getTelefono() {
        return telefono;
    }
    
    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getCiudad() {
        return ciudad;
    }
    
    public void setCiudad(String ciudad) {
        this.ciudad = ciudad;
    }
    
    public String getDescripcion() {
        return descripcion;
    }
    
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
    
    public String getServicios() {
        return servicios;
    }
    
    public void setServicios(String servicios) {
        this.servicios = servicios;
    }
    
    public String getHorarioAtencion() {
        return horarioAtencion;
    }
    
    public void setHorarioAtencion(String horarioAtencion) {
        this.horarioAtencion = horarioAtencion;
    }
    
    public LocalDateTime getFechaRegistro() {
        return fechaRegistro;
    }
    
    public void setFechaRegistro(LocalDateTime fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }
    
    public Boolean getActivo() {
        return activo;
    }
    
    public void setActivo(Boolean activo) {
        this.activo = activo;
    }
    
    public String getCreadoPorDocumento() {
        return creadoPorDocumento;
    }
    
    public void setCreadoPorDocumento(String creadoPorDocumento) {
        this.creadoPorDocumento = creadoPorDocumento;
    }
    
    public Set<Cita> getCitas() {
        return citas;
    }
    
    public void setCitas(Set<Cita> citas) {
        this.citas = citas;
    }
    
    public Set<Usuario> getVeterinarios() {
        return veterinarios;
    }
    
    public void setVeterinarios(Set<Usuario> veterinarios) {
        this.veterinarios = veterinarios;
    }
}