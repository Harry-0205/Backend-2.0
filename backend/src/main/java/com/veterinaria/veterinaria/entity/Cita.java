package com.veterinaria.veterinaria.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "citas")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Cita {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora;
    
    @Column(columnDefinition = "TEXT")
    private String motivo;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoCita estado = EstadoCita.PROGRAMADA;
    
    @Column(columnDefinition = "TEXT")
    private String observaciones;
    
    @Column(name = "fecha_creacion", nullable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_documento", nullable = false)
    @JsonIgnoreProperties({"mascotas", "citasComoCliente", "citasComoVeterinario", "password"})
    private Usuario cliente;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mascota_id", nullable = false)
    @JsonIgnoreProperties({"citas", "historiasClinicas", "propietario"})
    private Mascota mascota;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "veterinario_documento")
    @JsonIgnoreProperties({"mascotas", "citasComoCliente", "citasComoVeterinario", "password"})
    private Usuario veterinario;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "veterinaria_id")
    @JsonIgnoreProperties("citas")
    private Veterinaria veterinaria;
    
    @OneToOne(mappedBy = "cita", cascade = CascadeType.ALL)
    @JsonIgnoreProperties("cita")
    private HistoriaClinica historiaClinica;
    
    // Enum para estados de cita
    public enum EstadoCita {
        PROGRAMADA, CONFIRMADA, EN_CURSO, COMPLETADA, CANCELADA, NO_ASISTIO
    }
    
    // Constructores
    public Cita() {}
    
    public Cita(LocalDateTime fechaHora, String motivo, Usuario cliente, Mascota mascota) {
        this.fechaHora = fechaHora;
        this.motivo = motivo;
        this.cliente = cliente;
        this.mascota = mascota;
    }
    
    // Getters y Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public LocalDateTime getFechaHora() {
        return fechaHora;
    }
    
    public void setFechaHora(LocalDateTime fechaHora) {
        this.fechaHora = fechaHora;
    }
    
    public String getMotivo() {
        return motivo;
    }
    
    public void setMotivo(String motivo) {
        this.motivo = motivo;
    }
    
    public EstadoCita getEstado() {
        return estado;
    }
    
    public void setEstado(EstadoCita estado) {
        this.estado = estado;
    }
    
    public String getObservaciones() {
        return observaciones;
    }
    
    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }
    
    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }
    
    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }
    
    public Usuario getCliente() {
        return cliente;
    }
    
    public void setCliente(Usuario cliente) {
        this.cliente = cliente;
    }
    
    public Mascota getMascota() {
        return mascota;
    }
    
    public void setMascota(Mascota mascota) {
        this.mascota = mascota;
    }
    
    public Usuario getVeterinario() {
        return veterinario;
    }
    
    public void setVeterinario(Usuario veterinario) {
        this.veterinario = veterinario;
    }
    
    public Veterinaria getVeterinaria() {
        return veterinaria;
    }
    
    public void setVeterinaria(Veterinaria veterinaria) {
        this.veterinaria = veterinaria;
    }
    
    public HistoriaClinica getHistoriaClinica() {
        return historiaClinica;
    }
    
    public void setHistoriaClinica(HistoriaClinica historiaClinica) {
        this.historiaClinica = historiaClinica;
    }
}