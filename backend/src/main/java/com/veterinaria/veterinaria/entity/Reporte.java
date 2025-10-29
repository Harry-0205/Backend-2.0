package com.veterinaria.veterinaria.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "reportes")
public class Reporte {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String titulo;
    
    @Column(columnDefinition = "TEXT")
    private String descripcion;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoReporte tipo;
    
    @Column(name = "fecha_inicio")
    private LocalDate fechaInicio;
    
    @Column(name = "fecha_fin")
    private LocalDate fechaFin;
    
    @Column(name = "contenido_json", columnDefinition = "TEXT")
    private String contenido;
    
    @Column(name = "fecha_generacion", nullable = false)
    private LocalDateTime fechaGeneracion = LocalDateTime.now();
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "generado_por", nullable = false)
    private Usuario generadoPor;
    
    // Enum para tipos de reporte
    public enum TipoReporte {
        CITAS_DIARIAS,
        CITAS_MENSUALES,
        MASCOTAS_REGISTRADAS,
        HISTORIAS_CLINICAS,
        USUARIOS_ACTIVOS,
        INGRESOS,
        ESTADISTICAS_GENERALES
    }
    
    // Constructores
    public Reporte() {}
    
    public Reporte(String titulo, TipoReporte tipo, Usuario generadoPor) {
        this.titulo = titulo;
        this.tipo = tipo;
        this.generadoPor = generadoPor;
    }
    
    // Getters y Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getTitulo() {
        return titulo;
    }
    
    public void setTitulo(String titulo) {
        this.titulo = titulo;
    }
    
    public String getDescripcion() {
        return descripcion;
    }
    
    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }
    
    public TipoReporte getTipo() {
        return tipo;
    }
    
    public void setTipo(TipoReporte tipo) {
        this.tipo = tipo;
    }
    
    public LocalDate getFechaInicio() {
        return fechaInicio;
    }
    
    public void setFechaInicio(LocalDate fechaInicio) {
        this.fechaInicio = fechaInicio;
    }
    
    public LocalDate getFechaFin() {
        return fechaFin;
    }
    
    public void setFechaFin(LocalDate fechaFin) {
        this.fechaFin = fechaFin;
    }
    
    public String getContenido() {
        return contenido;
    }
    
    public void setContenido(String contenido) {
        this.contenido = contenido;
    }
    
    public LocalDateTime getFechaGeneracion() {
        return fechaGeneracion;
    }
    
    public void setFechaGeneracion(LocalDateTime fechaGeneracion) {
        this.fechaGeneracion = fechaGeneracion;
    }
    
    public Usuario getGeneradoPor() {
        return generadoPor;
    }
    
    public void setGeneradoPor(Usuario generadoPor) {
        this.generadoPor = generadoPor;
    }
}