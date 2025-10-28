package com.veterinaria.veterinaria.service;

import com.opencsv.CSVWriter;
import com.veterinaria.veterinaria.dto.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class CSVExportService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    /**
     * Exporta el reporte de usuarios a CSV
     */
    public byte[] exportarUsuariosCSV(List<ReporteUsuarioDTO> usuarios) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             OutputStreamWriter osw = new OutputStreamWriter(baos, StandardCharsets.UTF_8);
             CSVWriter writer = new CSVWriter(osw)) {

            // BOM para UTF-8 (ayuda a Excel a detectar la codificación)
            baos.write(0xEF);
            baos.write(0xBB);
            baos.write(0xBF);

            // Encabezados
            String[] headers = {
                "Documento",
                "Usuario",
                "Nombres",
                "Apellidos",
                "Email",
                "Teléfono",
                "Rol",
                "Estado",
                "Total Mascotas",
                "Total Citas",
                "Fecha Registro"
            };
            writer.writeNext(headers);

            // Datos
            for (ReporteUsuarioDTO usuario : usuarios) {
                String[] data = {
                    usuario.getDocumento(),
                    usuario.getUsername(),
                    usuario.getNombres(),
                    usuario.getApellidos(),
                    usuario.getEmail() != null ? usuario.getEmail() : "",
                    usuario.getTelefono() != null ? usuario.getTelefono() : "",
                    usuario.getRol(),
                    usuario.getActivo() ? "Activo" : "Inactivo",
                    String.valueOf(usuario.getTotalMascotas()),
                    String.valueOf(usuario.getTotalCitas()),
                    usuario.getFechaRegistro() != null 
                        ? usuario.getFechaRegistro().format(DATE_FORMATTER) 
                        : ""
                };
                writer.writeNext(data);
            }

            writer.flush();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error al generar CSV de usuarios", e);
        }
    }

    /**
     * Exporta el reporte de mascotas a CSV
     */
    public byte[] exportarMascotasCSV(List<ReporteMascotaDTO> mascotas) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             OutputStreamWriter osw = new OutputStreamWriter(baos, StandardCharsets.UTF_8);
             CSVWriter writer = new CSVWriter(osw)) {

            // BOM para UTF-8
            baos.write(0xEF);
            baos.write(0xBB);
            baos.write(0xBF);

            // Encabezados
            String[] headers = {
                "ID",
                "Nombre",
                "Especie",
                "Raza",
                "Sexo",
                "Edad (años)",
                "Peso (kg)",
                "Propietario",
                "Total Citas",
                "Total Historias",
                "Última Cita",
                "Fecha Registro"
            };
            writer.writeNext(headers);

            // Datos
            for (ReporteMascotaDTO mascota : mascotas) {
                String[] data = {
                    String.valueOf(mascota.getId()),
                    mascota.getNombre(),
                    mascota.getEspecie(),
                    mascota.getRaza() != null ? mascota.getRaza() : "",
                    mascota.getSexo() != null ? mascota.getSexo() : "",
                    mascota.getEdad() != null ? String.valueOf(mascota.getEdad()) : "",
                    mascota.getPeso() != null ? String.valueOf(mascota.getPeso()) : "",
                    (mascota.getPropietarioNombre() != null ? mascota.getPropietarioNombre() : "") + " " +
                    (mascota.getPropietarioApellido() != null ? mascota.getPropietarioApellido() : ""),
                    String.valueOf(mascota.getTotalCitas()),
                    String.valueOf(mascota.getTotalHistorias()),
                    mascota.getUltimaCita() != null 
                        ? mascota.getUltimaCita().format(DATE_FORMATTER) 
                        : "",
                    mascota.getFechaRegistro() != null 
                        ? mascota.getFechaRegistro().format(DATE_FORMATTER) 
                        : ""
                };
                writer.writeNext(data);
            }

            writer.flush();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error al generar CSV de mascotas", e);
        }
    }

    /**
     * Exporta el reporte de citas a CSV
     */
    public byte[] exportarCitasCSV(List<ReporteCitaDTO> citas) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             OutputStreamWriter osw = new OutputStreamWriter(baos, StandardCharsets.UTF_8);
             CSVWriter writer = new CSVWriter(osw)) {

            // BOM para UTF-8
            baos.write(0xEF);
            baos.write(0xBB);
            baos.write(0xBF);

            // Encabezados
            String[] headers = {
                "ID",
                "Fecha y Hora",
                "Cliente",
                "Mascota",
                "Especie",
                "Veterinario",
                "Veterinaria",
                "Motivo",
                "Estado",
                "Fecha Creación"
            };
            writer.writeNext(headers);

            // Datos
            for (ReporteCitaDTO cita : citas) {
                String[] data = {
                    String.valueOf(cita.getId()),
                    cita.getFechaHora() != null 
                        ? cita.getFechaHora().format(DATETIME_FORMATTER) 
                        : "",
                    cita.getClienteNombre() != null ? cita.getClienteNombre() : "",
                    cita.getMascotaNombre() != null ? cita.getMascotaNombre() : "",
                    cita.getMascotaEspecie() != null ? cita.getMascotaEspecie() : "",
                    cita.getVeterinarioNombre() != null ? cita.getVeterinarioNombre() : "",
                    cita.getVeterinariaNombre() != null ? cita.getVeterinariaNombre() : "",
                    cita.getMotivo() != null ? cita.getMotivo() : "",
                    cita.getEstado() != null ? cita.getEstado() : "",
                    cita.getFechaCreacion() != null 
                        ? cita.getFechaCreacion().format(DATE_FORMATTER) 
                        : ""
                };
                writer.writeNext(data);
            }

            writer.flush();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error al generar CSV de citas", e);
        }
    }
}
