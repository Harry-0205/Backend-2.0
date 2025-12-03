package com.veterinaria.veterinaria.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "usuarios")
public class Usuario {
    
    @Id
    @Column(name = "documento", length = 20, nullable = false)
    private String documento;
    
    @NotBlank
    @Column(nullable = false, unique = true)
    private String username;
    
    @NotBlank
    @Column(nullable = false)
    @JsonIgnore
    private String password;
    
    @NotBlank
    @Column(nullable = false)
    private String nombres;
    
    @NotBlank
    @Column(nullable = false)
    private String apellidos;
    
    @Email
    @Column(nullable = false, unique = true)
    private String email;
    
    @Column(length = 20)
    private String telefono;
    
    @Column(columnDefinition = "TEXT")
    private String direccion;
    
    @Column(name = "tipo_documento", length = 10, nullable = false)
    private String tipoDocumento = "CC";
    
    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;
    
    @Column(name = "fecha_registro", nullable = false)
    private LocalDateTime fechaRegistro = LocalDateTime.now();
    
    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT true")
    private Boolean activo = true;
    
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "usuarios_roles",
        joinColumns = @JoinColumn(name = "usuario_documento"),
        inverseJoinColumns = @JoinColumn(name = "rol_id")
    )
    @JsonIgnoreProperties("usuarios")
    private Set<Rol> roles = new HashSet<>();
    
    @OneToMany(mappedBy = "propietario", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("propietario")
    private Set<Mascota> mascotas = new HashSet<>();
    
    @OneToMany(mappedBy = "cliente", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("cliente")
    private Set<Cita> citasComoCliente = new HashSet<>();
    
    @OneToMany(mappedBy = "veterinario", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnoreProperties("veterinario")
    private Set<Cita> citasComoVeterinario = new HashSet<>();
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "veterinaria_id")
    @JsonIgnoreProperties({"citas", "veterinarios"})
    private Veterinaria veterinaria;
    
    // Constructores
    public Usuario() {}
    
    public Usuario(String username, String password, String nombres, String apellidos, String email) {
        this.username = username;
        this.password = password;
        this.nombres = nombres;
        this.apellidos = apellidos;
        this.email = email;
    }
    
    // Getters y Setters
    public String getDocumento() {
        return documento;
    }
    
    public void setDocumento(String documento) {
        this.documento = documento;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public String getNombres() {
        return nombres;
    }
    
    public void setNombres(String nombres) {
        this.nombres = nombres;
    }
    
    public String getApellidos() {
        return apellidos;
    }
    
    public void setApellidos(String apellidos) {
        this.apellidos = apellidos;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getTelefono() {
        return telefono;
    }
    
    public void setTelefono(String telefono) {
        this.telefono = telefono;
    }
    
    public String getDireccion() {
        return direccion;
    }
    
    public void setDireccion(String direccion) {
        this.direccion = direccion;
    }
    
    public String getTipoDocumento() {
        return tipoDocumento;
    }
    
    public void setTipoDocumento(String tipoDocumento) {
        this.tipoDocumento = tipoDocumento;
    }
    
    public LocalDate getFechaNacimiento() {
        return fechaNacimiento;
    }
    
    public void setFechaNacimiento(LocalDate fechaNacimiento) {
        this.fechaNacimiento = fechaNacimiento;
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
    
    public Set<Rol> getRoles() {
        return roles;
    }
    
    public void setRoles(Set<Rol> roles) {
        this.roles = roles;
    }
    
    public Set<Mascota> getMascotas() {
        return mascotas;
    }
    
    public void setMascotas(Set<Mascota> mascotas) {
        this.mascotas = mascotas;
    }
    
    public Set<Cita> getCitasComoCliente() {
        return citasComoCliente;
    }
    
    public void setCitasComoCliente(Set<Cita> citasComoCliente) {
        this.citasComoCliente = citasComoCliente;
    }
    
    public Set<Cita> getCitasComoVeterinario() {
        return citasComoVeterinario;
    }
    
    public void setCitasComoVeterinario(Set<Cita> citasComoVeterinario) {
        this.citasComoVeterinario = citasComoVeterinario;
    }
    
    public Veterinaria getVeterinaria() {
        return veterinaria;
    }
    
    public void setVeterinaria(Veterinaria veterinaria) {
        this.veterinaria = veterinaria;
    }
    
    // Método helper para obtener nombre completo
    public String getNombreCompleto() {
        return nombres + " " + apellidos;
    }
}