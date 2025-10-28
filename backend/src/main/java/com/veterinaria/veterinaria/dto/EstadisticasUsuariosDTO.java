package com.veterinaria.veterinaria.dto;

import java.util.HashMap;
import java.util.Map;

public class EstadisticasUsuariosDTO {
    private Long totalUsuarios;
    private Long totalActivos;
    private Long totalInactivos;
    private Map<String, Long> totalPorRol;

    public EstadisticasUsuariosDTO() {
        this.totalPorRol = new HashMap<>();
    }

    public EstadisticasUsuariosDTO(Long totalUsuarios, Long totalActivos, Long totalInactivos) {
        this.totalUsuarios = totalUsuarios;
        this.totalActivos = totalActivos;
        this.totalInactivos = totalInactivos;
        this.totalPorRol = new HashMap<>();
    }

    // Getters y Setters
    public Long getTotalUsuarios() {
        return totalUsuarios;
    }

    public void setTotalUsuarios(Long totalUsuarios) {
        this.totalUsuarios = totalUsuarios;
    }

    public Long getTotalActivos() {
        return totalActivos;
    }

    public void setTotalActivos(Long totalActivos) {
        this.totalActivos = totalActivos;
    }

    public Long getTotalInactivos() {
        return totalInactivos;
    }

    public void setTotalInactivos(Long totalInactivos) {
        this.totalInactivos = totalInactivos;
    }

    public Map<String, Long> getTotalPorRol() {
        return totalPorRol;
    }

    public void setTotalPorRol(Map<String, Long> totalPorRol) {
        this.totalPorRol = totalPorRol;
    }
}
