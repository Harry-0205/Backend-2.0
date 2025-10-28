package com.veterinaria.veterinaria.dto;

import com.veterinaria.veterinaria.entity.Mascota;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;

public class ReporteMascotaDTO {
    private Long id;
    private String nombre;
    private String especie;
    private String raza;
    private String sexo;
    private Integer edad;
    private Double peso;
    private String propietarioDocumento;
    private String propietarioNombre;
    private String propietarioApellido;
    private Long totalCitas;
    private Long totalHistorias;
    private LocalDateTime ultimaCita;
    private LocalDateTime fechaRegistro;

    public ReporteMascotaDTO() {
    }

    public ReporteMascotaDTO(Mascota mascota, Long totalCitas, Long totalHistorias, LocalDateTime ultimaCita) {
        this.id = mascota.getId();
        this.nombre = mascota.getNombre();
        this.especie = mascota.getEspecie();
        this.raza = mascota.getRaza();
        this.sexo = mascota.getSexo();
        this.peso = mascota.getPeso();
        this.fechaRegistro = mascota.getFechaRegistro();
        this.totalCitas = totalCitas != null ? totalCitas : 0L;
        this.totalHistorias = totalHistorias != null ? totalHistorias : 0L;
        this.ultimaCita = ultimaCita;

        // Calcular edad si tiene fecha de nacimiento
        if (mascota.getFechaNacimiento() != null) {
            Period period = Period.between(mascota.getFechaNacimiento(), LocalDate.now());
            this.edad = period.getYears();
        }

        // Datos del propietario
        if (mascota.getPropietario() != null) {
            this.propietarioDocumento = mascota.getPropietario().getDocumento();
            this.propietarioNombre = mascota.getPropietario().getNombres();
            this.propietarioApellido = mascota.getPropietario().getApellidos();
        }
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

    public Integer getEdad() {
        return edad;
    }

    public void setEdad(Integer edad) {
        this.edad = edad;
    }

    public Double getPeso() {
        return peso;
    }

    public void setPeso(Double peso) {
        this.peso = peso;
    }

    public String getPropietarioDocumento() {
        return propietarioDocumento;
    }

    public void setPropietarioDocumento(String propietarioDocumento) {
        this.propietarioDocumento = propietarioDocumento;
    }

    public String getPropietarioNombre() {
        return propietarioNombre;
    }

    public void setPropietarioNombre(String propietarioNombre) {
        this.propietarioNombre = propietarioNombre;
    }

    public String getPropietarioApellido() {
        return propietarioApellido;
    }

    public void setPropietarioApellido(String propietarioApellido) {
        this.propietarioApellido = propietarioApellido;
    }

    public Long getTotalCitas() {
        return totalCitas;
    }

    public void setTotalCitas(Long totalCitas) {
        this.totalCitas = totalCitas;
    }

    public Long getTotalHistorias() {
        return totalHistorias;
    }

    public void setTotalHistorias(Long totalHistorias) {
        this.totalHistorias = totalHistorias;
    }

    public LocalDateTime getUltimaCita() {
        return ultimaCita;
    }

    public void setUltimaCita(LocalDateTime ultimaCita) {
        this.ultimaCita = ultimaCita;
    }

    public LocalDateTime getFechaRegistro() {
        return fechaRegistro;
    }

    public void setFechaRegistro(LocalDateTime fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }
}
