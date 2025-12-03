package com.veterinaria.veterinaria.dto;

import com.veterinaria.veterinaria.entity.HistoriaClinica;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class HistoriaClinicaResponse {
    private Long id;
    private LocalDateTime fechaConsulta;
    private String motivoConsulta;
    private String sintomas;
    private String diagnostico;
    private String tratamiento;
    private String medicamentos;
    private BigDecimal peso;
    private BigDecimal temperatura;
    private Integer frecuenciaCardiaca;
    private Integer frecuenciaRespiratoria;
    private String observaciones;
    private String recomendaciones;
    private LocalDateTime fechaCreacion;
    private Boolean activo;
    
    // Información básica de la mascota (sin datos sensibles)
    private MascotaBasicInfo mascota;
    
    // Información básica del veterinario (sin datos sensibles)
    private VeterinarioBasicInfo veterinario;
    
    // Información básica de la cita (opcional)
    private CitaBasicInfo cita;
    
    // Constructor
    public HistoriaClinicaResponse(HistoriaClinica historia) {
        try {
            this.id = historia.getId();
            this.fechaConsulta = historia.getFechaConsulta();
            this.motivoConsulta = historia.getMotivoConsulta();
            this.sintomas = historia.getSintomas();
            this.diagnostico = historia.getDiagnostico();
            this.tratamiento = historia.getTratamiento();
            this.medicamentos = historia.getMedicamentos();
            this.peso = historia.getPeso();
            this.temperatura = historia.getTemperatura();
            this.frecuenciaCardiaca = historia.getFrecuenciaCardiaca();
            this.frecuenciaRespiratoria = historia.getFrecuenciaRespiratoria();
            this.observaciones = historia.getObservaciones();
            this.recomendaciones = historia.getRecomendaciones();
            this.fechaCreacion = historia.getFechaCreacion();
            this.activo = historia.getActivo();
            
            // Solo información básica de la mascota
            try {
                if (historia.getMascota() != null) {
                    String propietarioNombre = null;
                    try {
                        if (historia.getMascota().getPropietario() != null) {
                            propietarioNombre = historia.getMascota().getPropietario().getNombres() + " " + 
                                historia.getMascota().getPropietario().getApellidos();
                        }
                    } catch (Exception e) {
                        System.err.println("⚠️ Error obteniendo propietario de mascota: " + e.getMessage());
                    }
                    
                    this.mascota = new MascotaBasicInfo(
                        historia.getMascota().getId(),
                        historia.getMascota().getNombre(),
                        historia.getMascota().getEspecie(),
                        historia.getMascota().getRaza(),
                        propietarioNombre
                    );
                }
            } catch (Exception e) {
                System.err.println("⚠️ Error cargando mascota de historia " + historia.getId() + ": " + e.getMessage());
            }
            
            // Solo información básica del veterinario
            try {
                if (historia.getVeterinario() != null) {
                    this.veterinario = new VeterinarioBasicInfo(
                        historia.getVeterinario().getDocumento(),
                        historia.getVeterinario().getNombres(),
                        historia.getVeterinario().getApellidos()
                    );
                }
            } catch (Exception e) {
                System.err.println("⚠️ Error cargando veterinario de historia " + historia.getId() + ": " + e.getMessage());
            }
            
            // Solo información básica de la cita
            try {
                if (historia.getCita() != null) {
                    this.cita = new CitaBasicInfo(
                        historia.getCita().getId(),
                        historia.getCita().getFechaHora(),
                        historia.getCita().getEstado().toString()
                    );
                }
            } catch (Exception e) {
                System.err.println("⚠️ Error cargando cita de historia " + historia.getId() + ": " + e.getMessage());
            }
        } catch (Exception e) {
            System.err.println("❌ ERROR CRÍTICO en HistoriaClinicaResponse para historia " + 
                (historia != null ? historia.getId() : "null") + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    // Getters
    public Long getId() { return id; }
    public LocalDateTime getFechaConsulta() { return fechaConsulta; }
    public String getMotivoConsulta() { return motivoConsulta; }
    public String getSintomas() { return sintomas; }
    public String getDiagnostico() { return diagnostico; }
    public String getTratamiento() { return tratamiento; }
    public String getMedicamentos() { return medicamentos; }
    public BigDecimal getPeso() { return peso; }
    public BigDecimal getTemperatura() { return temperatura; }
    public Integer getFrecuenciaCardiaca() { return frecuenciaCardiaca; }
    public Integer getFrecuenciaRespiratoria() { return frecuenciaRespiratoria; }
    public String getObservaciones() { return observaciones; }
    public String getRecomendaciones() { return recomendaciones; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public Boolean getActivo() { return activo; }
    public MascotaBasicInfo getMascota() { return mascota; }
    public VeterinarioBasicInfo getVeterinario() { return veterinario; }
    public CitaBasicInfo getCita() { return cita; }
    
    // Clases internas para información básica
    public static class MascotaBasicInfo {
        private Long id;
        private String nombre;
        private String especie;
        private String raza;
        private String propietario;
        
        public MascotaBasicInfo(Long id, String nombre, String especie, String raza, String propietario) {
            this.id = id;
            this.nombre = nombre;
            this.especie = especie;
            this.raza = raza;
            this.propietario = propietario;
        }
        
        // Getters
        public Long getId() { return id; }
        public String getNombre() { return nombre; }
        public String getEspecie() { return especie; }
        public String getRaza() { return raza; }
        public String getPropietario() { return propietario; }
    }
    
    public static class VeterinarioBasicInfo {
        private String documento;
        private String nombres;
        private String apellidos;
        
        public VeterinarioBasicInfo(String documento, String nombres, String apellidos) {
            this.documento = documento;
            this.nombres = nombres;
            this.apellidos = apellidos;
        }
        
        // Getters
        public String getDocumento() { return documento; }
        public String getNombres() { return nombres; }
        public String getApellidos() { return apellidos; }
    }
    
    public static class CitaBasicInfo {
        private Long id;
        private LocalDateTime fecha;
        private String estado;
        
        public CitaBasicInfo(Long id, LocalDateTime fecha, String estado) {
            this.id = id;
            this.fecha = fecha;
            this.estado = estado;
        }
        
        // Getters
        public Long getId() { return id; }
        public LocalDateTime getFecha() { return fecha; }
        public String getEstado() { return estado; }
    }
}