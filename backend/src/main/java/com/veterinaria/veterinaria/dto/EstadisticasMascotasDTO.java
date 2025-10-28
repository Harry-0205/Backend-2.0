package com.veterinaria.veterinaria.dto;

import java.util.HashMap;
import java.util.Map;

public class EstadisticasMascotasDTO {
    private Long totalMascotas;
    private Map<String, Long> totalPorEspecie;
    private Map<String, Long> totalPorSexo;
    private Double promedioEdad;
    private Double promedioPeso;

    public EstadisticasMascotasDTO() {
        this.totalPorEspecie = new HashMap<>();
        this.totalPorSexo = new HashMap<>();
    }

    public EstadisticasMascotasDTO(Long totalMascotas) {
        this.totalMascotas = totalMascotas;
        this.totalPorEspecie = new HashMap<>();
        this.totalPorSexo = new HashMap<>();
    }

    // Getters y Setters
    public Long getTotalMascotas() {
        return totalMascotas;
    }

    public void setTotalMascotas(Long totalMascotas) {
        this.totalMascotas = totalMascotas;
    }

    public Map<String, Long> getTotalPorEspecie() {
        return totalPorEspecie;
    }

    public void setTotalPorEspecie(Map<String, Long> totalPorEspecie) {
        this.totalPorEspecie = totalPorEspecie;
    }

    public Map<String, Long> getTotalPorSexo() {
        return totalPorSexo;
    }

    public void setTotalPorSexo(Map<String, Long> totalPorSexo) {
        this.totalPorSexo = totalPorSexo;
    }

    public Double getPromedioEdad() {
        return promedioEdad;
    }

    public void setPromedioEdad(Double promedioEdad) {
        this.promedioEdad = promedioEdad;
    }

    public Double getPromedioPeso() {
        return promedioPeso;
    }

    public void setPromedioPeso(Double promedioPeso) {
        this.promedioPeso = promedioPeso;
    }
}
