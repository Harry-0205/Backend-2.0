package com.veterinaria.veterinaria.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "mascotas")
public class Mascota {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Column(nullable = false)
    private String nombre;
    
    @Column(nullable = false)
    private String especie;
    
    @Column
    private String raza;
    
    @Column
    private String sexo;
    
    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;
    
    @Column(columnDefinition = "DECIMAL(5,2)")
    private BigDecimal peso;
    
    @Column(columnDefinition = "TEXT")
    private String color;
    
    @Column(columnDefinition = "TEXT")
    private String observaciones;
    
    @Column(name = "fecha_registro", nullable = false)
    private LocalDateTime fechaRegistro = LocalDateTime.now();
    
    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT true")
    private Boolean activo = true;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "propietario_documento", nullable = false)
    @JsonIgnoreProperties({"mascotas", "citasComoCliente", "citasComoVeterinario", "password", "hibernateLazyInitializer", "handler"})
    private Usuario propietario;
    
    @OneToMany(mappedBy = "mascota", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("mascota")
    private Set<Cita> citas = new HashSet<>();
    
    @OneToMany(mappedBy = "mascota", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("mascota")
    private Set<HistoriaClinica> historiasClinicas = new HashSet<>();
    
    // Constructores
    public Mascota() {}
    
    public Mascota(String nombre, String especie, Usuario propietario) {
        this.nombre = nombre;
        this.especie = especie;
        this.propietario = propietario;
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
    
    public String getEspecie() {
        return especie;
    }
    
    public void setEspecie(String especie) {
        this.especie = especie;
    }
    
    public String getRaza() {
        return raza;
    }
    
    public void setRaza(String raza) {
        this.raza = raza;
    }
    
    public String getSexo() {
        return sexo;
    }
    
    public void setSexo(String sexo) {
        this.sexo = sexo;
    }
    
    public LocalDate getFechaNacimiento() {
        return fechaNacimiento;
    }
    
    public void setFechaNacimiento(LocalDate fechaNacimiento) {
        this.fechaNacimiento = fechaNacimiento;
    }
    
    public BigDecimal getPeso() {
        return peso;
    }
    
    public void setPeso(BigDecimal peso) {
        this.peso = peso;
    }
    
    public String getColor() {
        return color;
    }
    
    public void setColor(String color) {
        this.color = color;
    }
    
    public String getObservaciones() {
        return observaciones;
    }
    
    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
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
    
    public Usuario getPropietario() {
        return propietario;
    }
    
    public void setPropietario(Usuario propietario) {
        this.propietario = propietario;
    }
    
    public Set<Cita> getCitas() {
        return citas;
    }
    
    public void setCitas(Set<Cita> citas) {
        this.citas = citas;
    }
    
    public Set<HistoriaClinica> getHistoriasClinicas() {
        return historiasClinicas;
    }
    
    public void setHistoriasClinicas(Set<HistoriaClinica> historiasClinicas) {
        this.historiasClinicas = historiasClinicas;
    }
}