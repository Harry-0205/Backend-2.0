package com.veterinaria.veterinaria.dto;

public class DashboardStatsResponse {
    private long totalUsuarios;
    private long usuariosActivos;
    private long totalMascotas;
    private long mascotasActivas;
    private long totalCitas;
    private long citasHoy;
    private long citasPendientes;
    private long citasConfirmadas;
    private long totalVeterinarias;
    private long veterinariasActivas;
    
    // Constructores
    public DashboardStatsResponse() {}
    
    public DashboardStatsResponse(long totalUsuarios, long usuariosActivos, long totalMascotas, 
                                 long mascotasActivas, long totalCitas, long citasHoy, 
                                 long citasPendientes, long citasConfirmadas, 
                                 long totalVeterinarias, long veterinariasActivas) {
        this.totalUsuarios = totalUsuarios;
        this.usuariosActivos = usuariosActivos;
        this.totalMascotas = totalMascotas;
        this.mascotasActivas = mascotasActivas;
        this.totalCitas = totalCitas;
        this.citasHoy = citasHoy;
        this.citasPendientes = citasPendientes;
        this.citasConfirmadas = citasConfirmadas;
        this.totalVeterinarias = totalVeterinarias;
        this.veterinariasActivas = veterinariasActivas;
    }
    
    // Getters y Setters
    public long getTotalUsuarios() {
        return totalUsuarios;
    }
    
    public void setTotalUsuarios(long totalUsuarios) {
        this.totalUsuarios = totalUsuarios;
    }
    
    public long getUsuariosActivos() {
        return usuariosActivos;
    }
    
    public void setUsuariosActivos(long usuariosActivos) {
        this.usuariosActivos = usuariosActivos;
    }
    
    public long getTotalMascotas() {
        return totalMascotas;
    }
    
    public void setTotalMascotas(long totalMascotas) {
        this.totalMascotas = totalMascotas;
    }
    
    public long getMascotasActivas() {
        return mascotasActivas;
    }
    
    public void setMascotasActivas(long mascotasActivas) {
        this.mascotasActivas = mascotasActivas;
    }
    
    public long getTotalCitas() {
        return totalCitas;
    }
    
    public void setTotalCitas(long totalCitas) {
        this.totalCitas = totalCitas;
    }
    
    public long getCitasHoy() {
        return citasHoy;
    }
    
    public void setCitasHoy(long citasHoy) {
        this.citasHoy = citasHoy;
    }
    
    public long getCitasPendientes() {
        return citasPendientes;
    }
    
    public void setCitasPendientes(long citasPendientes) {
        this.citasPendientes = citasPendientes;
    }
    
    public long getCitasConfirmadas() {
        return citasConfirmadas;
    }
    
    public void setCitasConfirmadas(long citasConfirmadas) {
        this.citasConfirmadas = citasConfirmadas;
    }
    
    public long getTotalVeterinarias() {
        return totalVeterinarias;
    }
    
    public void setTotalVeterinarias(long totalVeterinarias) {
        this.totalVeterinarias = totalVeterinarias;
    }
    
    public long getVeterinariasActivas() {
        return veterinariasActivas;
    }
    
    public void setVeterinariasActivas(long veterinariasActivas) {
        this.veterinariasActivas = veterinariasActivas;
    }
}