package com.veterinaria.veterinaria.dto;

import java.util.HashMap;
import java.util.Map;

public class EstadisticasCitasDTO {
    private Long totalCitas;
    private Map<String, Long> totalPorEstado;
    private Long citasHoy;
    private Long citasSemana;
    private Long citasMes;

    public EstadisticasCitasDTO() {
        this.totalPorEstado = new HashMap<>();
    }

    public EstadisticasCitasDTO(Long totalCitas) {
        this.totalCitas = totalCitas;
        this.totalPorEstado = new HashMap<>();
    }

    // Getters y Setters
    public Long getTotalCitas() {
        return totalCitas;
    }

    public void setTotalCitas(Long totalCitas) {
        this.totalCitas = totalCitas;
    }

    public Map<String, Long> getTotalPorEstado() {
        return totalPorEstado;
    }

    public void setTotalPorEstado(Map<String, Long> totalPorEstado) {
        this.totalPorEstado = totalPorEstado;
    }

    public Long getCitasHoy() {
        return citasHoy;
    }

    public void setCitasHoy(Long citasHoy) {
        this.citasHoy = citasHoy;
    }

    public Long getCitasSemana() {
        return citasSemana;
    }

    public void setCitasSemana(Long citasSemana) {
        this.citasSemana = citasSemana;
    }

    public Long getCitasMes() {
        return citasMes;
    }

    public void setCitasMes(Long citasMes) {
        this.citasMes = citasMes;
    }
}
