package com.veterinaria.veterinaria.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class HistoriaClinicaRequest {
    
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
    
    // IDs para las relaciones
    private Long mascotaId;
    private String veterinarioDocumento;
    private Long citaId;
    
    // Constructores
    public HistoriaClinicaRequest() {}
    
    // Getters y Setters
    public LocalDateTime getFechaConsulta() {
        return fechaConsulta;
    }
    
    public void setFechaConsulta(LocalDateTime fechaConsulta) {
        this.fechaConsulta = fechaConsulta;
    }
    
    public String getMotivoConsulta() {
        return motivoConsulta;
    }
    
    public void setMotivoConsulta(String motivoConsulta) {
        this.motivoConsulta = motivoConsulta;
    }
    
    public String getSintomas() {
        return sintomas;
    }
    
    public void setSintomas(String sintomas) {
        this.sintomas = sintomas;
    }
    
    public String getDiagnostico() {
        return diagnostico;
    }
    
    public void setDiagnostico(String diagnostico) {
        this.diagnostico = diagnostico;
    }
    
    public String getTratamiento() {
        return tratamiento;
    }
    
    public void setTratamiento(String tratamiento) {
        this.tratamiento = tratamiento;
    }
    
    public String getMedicamentos() {
        return medicamentos;
    }
    
    public void setMedicamentos(String medicamentos) {
        this.medicamentos = medicamentos;
    }
    
    public BigDecimal getPeso() {
        return peso;
    }
    
    public void setPeso(BigDecimal peso) {
        this.peso = peso;
    }
    
    public BigDecimal getTemperatura() {
        return temperatura;
    }
    
    public void setTemperatura(BigDecimal temperatura) {
        this.temperatura = temperatura;
    }
    
    public Integer getFrecuenciaCardiaca() {
        return frecuenciaCardiaca;
    }
    
    public void setFrecuenciaCardiaca(Integer frecuenciaCardiaca) {
        this.frecuenciaCardiaca = frecuenciaCardiaca;
    }
    
    public Integer getFrecuenciaRespiratoria() {
        return frecuenciaRespiratoria;
    }
    
    public void setFrecuenciaRespiratoria(Integer frecuenciaRespiratoria) {
        this.frecuenciaRespiratoria = frecuenciaRespiratoria;
    }
    
    public String getObservaciones() {
        return observaciones;
    }
    
    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }
    
    public String getRecomendaciones() {
        return recomendaciones;
    }
    
    public void setRecomendaciones(String recomendaciones) {
        this.recomendaciones = recomendaciones;
    }
    
    public Long getMascotaId() {
        return mascotaId;
    }
    
    public void setMascotaId(Long mascotaId) {
        this.mascotaId = mascotaId;
    }
    
    public String getVeterinarioDocumento() {
        return veterinarioDocumento;
    }
    
    public void setVeterinarioDocumento(String veterinarioDocumento) {
        this.veterinarioDocumento = veterinarioDocumento;
    }
    
    public Long getCitaId() {
        return citaId;
    }
    
    public void setCitaId(Long citaId) {
        this.citaId = citaId;
    }
}
