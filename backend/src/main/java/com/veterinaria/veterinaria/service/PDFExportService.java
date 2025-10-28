package com.veterinaria.veterinaria.service;

import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.veterinaria.veterinaria.dto.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
public class PDFExportService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DeviceRgb HEADER_COLOR = new DeviceRgb(41, 128, 185);
    private static final DeviceRgb ALT_ROW_COLOR = new DeviceRgb(236, 240, 241);

    /**
     * Genera un PDF con el reporte de usuarios
     */
    public byte[] generarReporteUsuariosPDF(List<ReporteUsuarioDTO> usuarios, EstadisticasUsuariosDTO estadisticas) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf, PageSize.A4.rotate());

            // Título
            addTitle(document, "REPORTE DE USUARIOS");
            addSubtitle(document, "Fecha de generación: " + LocalDateTime.now().format(DATETIME_FORMATTER));

            // Estadísticas
            if (estadisticas != null) {
                addStatisticsSection(document, "Resumen Estadístico", new String[][]{
                    {"Total Usuarios", String.valueOf(estadisticas.getTotalUsuarios())},
                    {"Usuarios Activos", String.valueOf(estadisticas.getTotalActivos())},
                    {"Usuarios Inactivos", String.valueOf(estadisticas.getTotalInactivos())}
                });

                // Usuarios por rol
                StringBuilder rolesInfo = new StringBuilder();
                for (Map.Entry<String, Long> entry : estadisticas.getTotalPorRol().entrySet()) {
                    rolesInfo.append(entry.getKey()).append(": ").append(entry.getValue()).append("  ");
                }
                document.add(new Paragraph("Distribución por Rol: " + rolesInfo.toString())
                    .setFontSize(10)
                    .setMarginBottom(15));
            }

            // Tabla de usuarios
            float[] columnWidths = {1, 2, 2, 2, 3, 2, 2, 1, 1, 1, 2};
            Table table = new Table(UnitValue.createPercentArray(columnWidths));
            table.setWidth(UnitValue.createPercentValue(100));

            // Encabezados
            String[] headers = {"Doc", "Usuario", "Nombres", "Apellidos", "Email", "Teléfono", 
                               "Rol", "Estado", "Mascotas", "Citas", "F. Registro"};
            for (String header : headers) {
                table.addHeaderCell(createHeaderCell(header));
            }

            // Datos
            int row = 0;
            for (ReporteUsuarioDTO usuario : usuarios) {
                boolean altRow = row++ % 2 == 1;
                table.addCell(createDataCell(usuario.getDocumento(), altRow));
                table.addCell(createDataCell(usuario.getUsername(), altRow));
                table.addCell(createDataCell(usuario.getNombres(), altRow));
                table.addCell(createDataCell(usuario.getApellidos(), altRow));
                table.addCell(createDataCell(usuario.getEmail(), altRow));
                table.addCell(createDataCell(usuario.getTelefono(), altRow));
                table.addCell(createDataCell(usuario.getRol(), altRow));
                table.addCell(createDataCell(usuario.getActivo() ? "Activo" : "Inactivo", altRow));
                table.addCell(createDataCell(String.valueOf(usuario.getTotalMascotas()), altRow));
                table.addCell(createDataCell(String.valueOf(usuario.getTotalCitas()), altRow));
                table.addCell(createDataCell(
                    usuario.getFechaRegistro() != null ? usuario.getFechaRegistro().format(DATE_FORMATTER) : "", 
                    altRow));
            }

            document.add(table);
            addFooter(document, usuarios.size());

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error al generar PDF de usuarios", e);
        }
    }

    /**
     * Genera un PDF con el reporte de mascotas
     */
    public byte[] generarReporteMascotasPDF(List<ReporteMascotaDTO> mascotas, EstadisticasMascotasDTO estadisticas) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf, PageSize.A4.rotate());

            // Título
            addTitle(document, "REPORTE DE MASCOTAS");
            addSubtitle(document, "Fecha de generación: " + LocalDateTime.now().format(DATETIME_FORMATTER));

            // Estadísticas
            if (estadisticas != null) {
                addStatisticsSection(document, "Resumen Estadístico", new String[][]{
                    {"Total Mascotas", String.valueOf(estadisticas.getTotalMascotas())},
                    {"Promedio Edad", estadisticas.getPromedioEdad() != null 
                        ? String.format("%.1f años", estadisticas.getPromedioEdad()) : "N/A"},
                    {"Promedio Peso", estadisticas.getPromedioPeso() != null 
                        ? String.format("%.1f kg", estadisticas.getPromedioPeso()) : "N/A"}
                });

                // Por especie
                if (estadisticas.getTotalPorEspecie() != null && !estadisticas.getTotalPorEspecie().isEmpty()) {
                    StringBuilder especiesInfo = new StringBuilder();
                    for (Map.Entry<String, Long> entry : estadisticas.getTotalPorEspecie().entrySet()) {
                        especiesInfo.append(entry.getKey()).append(": ").append(entry.getValue()).append("  ");
                    }
                    document.add(new Paragraph("Por Especie: " + especiesInfo.toString())
                        .setFontSize(10)
                        .setMarginBottom(15));
                }
            }

            // Tabla de mascotas
            float[] columnWidths = {1, 2, 2, 2, 1, 1, 1, 3, 1, 1, 2, 2};
            Table table = new Table(UnitValue.createPercentArray(columnWidths));
            table.setWidth(UnitValue.createPercentValue(100));

            // Encabezados
            String[] headers = {"ID", "Nombre", "Especie", "Raza", "Sexo", "Edad", "Peso", 
                               "Propietario", "Citas", "Hist.", "Últ. Cita", "F. Registro"};
            for (String header : headers) {
                table.addHeaderCell(createHeaderCell(header));
            }

            // Datos
            int row = 0;
            for (ReporteMascotaDTO mascota : mascotas) {
                boolean altRow = row++ % 2 == 1;
                table.addCell(createDataCell(String.valueOf(mascota.getId()), altRow));
                table.addCell(createDataCell(mascota.getNombre(), altRow));
                table.addCell(createDataCell(mascota.getEspecie(), altRow));
                table.addCell(createDataCell(mascota.getRaza(), altRow));
                table.addCell(createDataCell(mascota.getSexo(), altRow));
                table.addCell(createDataCell(mascota.getEdad() != null ? mascota.getEdad() + " años" : "", altRow));
                table.addCell(createDataCell(mascota.getPeso() != null ? mascota.getPeso() + " kg" : "", altRow));
                table.addCell(createDataCell(
                    (mascota.getPropietarioNombre() != null ? mascota.getPropietarioNombre() : "") + " " +
                    (mascota.getPropietarioApellido() != null ? mascota.getPropietarioApellido() : ""), 
                    altRow));
                table.addCell(createDataCell(String.valueOf(mascota.getTotalCitas()), altRow));
                table.addCell(createDataCell(String.valueOf(mascota.getTotalHistorias()), altRow));
                table.addCell(createDataCell(
                    mascota.getUltimaCita() != null ? mascota.getUltimaCita().format(DATE_FORMATTER) : "", 
                    altRow));
                table.addCell(createDataCell(
                    mascota.getFechaRegistro() != null ? mascota.getFechaRegistro().format(DATE_FORMATTER) : "", 
                    altRow));
            }

            document.add(table);
            addFooter(document, mascotas.size());

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error al generar PDF de mascotas", e);
        }
    }

    /**
     * Genera un PDF con el reporte de citas
     */
    public byte[] generarReporteCitasPDF(List<ReporteCitaDTO> citas, EstadisticasCitasDTO estadisticas) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document document = new Document(pdf, PageSize.A4.rotate());

            // Título
            addTitle(document, "REPORTE DE CITAS");
            addSubtitle(document, "Fecha de generación: " + LocalDateTime.now().format(DATETIME_FORMATTER));

            // Estadísticas
            if (estadisticas != null) {
                addStatisticsSection(document, "Resumen Estadístico", new String[][]{
                    {"Total Citas", String.valueOf(estadisticas.getTotalCitas())},
                    {"Citas Hoy", String.valueOf(estadisticas.getCitasHoy())},
                    {"Citas Esta Semana", String.valueOf(estadisticas.getCitasSemana())},
                    {"Citas Este Mes", String.valueOf(estadisticas.getCitasMes())}
                });

                // Por estado
                if (estadisticas.getTotalPorEstado() != null && !estadisticas.getTotalPorEstado().isEmpty()) {
                    StringBuilder estadosInfo = new StringBuilder();
                    for (Map.Entry<String, Long> entry : estadisticas.getTotalPorEstado().entrySet()) {
                        estadosInfo.append(entry.getKey()).append(": ").append(entry.getValue()).append("  ");
                    }
                    document.add(new Paragraph("Por Estado: " + estadosInfo.toString())
                        .setFontSize(10)
                        .setMarginBottom(15));
                }
            }

            // Tabla de citas
            float[] columnWidths = {1, 2, 3, 2, 2, 3, 3, 3, 2};
            Table table = new Table(UnitValue.createPercentArray(columnWidths));
            table.setWidth(UnitValue.createPercentValue(100));

            // Encabezados
            String[] headers = {"ID", "Fecha/Hora", "Cliente", "Mascota", "Especie", 
                               "Veterinario", "Veterinaria", "Motivo", "Estado"};
            for (String header : headers) {
                table.addHeaderCell(createHeaderCell(header));
            }

            // Datos
            int row = 0;
            for (ReporteCitaDTO cita : citas) {
                boolean altRow = row++ % 2 == 1;
                table.addCell(createDataCell(String.valueOf(cita.getId()), altRow));
                table.addCell(createDataCell(
                    cita.getFechaHora() != null ? cita.getFechaHora().format(DATETIME_FORMATTER) : "", 
                    altRow));
                table.addCell(createDataCell(cita.getClienteNombre(), altRow));
                table.addCell(createDataCell(cita.getMascotaNombre(), altRow));
                table.addCell(createDataCell(cita.getMascotaEspecie(), altRow));
                table.addCell(createDataCell(cita.getVeterinarioNombre(), altRow));
                table.addCell(createDataCell(cita.getVeterinariaNombre(), altRow));
                table.addCell(createDataCell(cita.getMotivo(), altRow));
                table.addCell(createDataCell(cita.getEstado(), altRow));
            }

            document.add(table);
            addFooter(document, citas.size());

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Error al generar PDF de citas", e);
        }
    }

    // ==================== MÉTODOS AUXILIARES ====================

    private void addTitle(Document document, String title) {
        Paragraph titleParagraph = new Paragraph(title)
            .setFontSize(18)
            .setBold()
            .setTextAlignment(TextAlignment.CENTER)
            .setMarginBottom(10);
        document.add(titleParagraph);
    }

    private void addSubtitle(Document document, String subtitle) {
        Paragraph subtitleParagraph = new Paragraph(subtitle)
            .setFontSize(10)
            .setTextAlignment(TextAlignment.CENTER)
            .setMarginBottom(20);
        document.add(subtitleParagraph);
    }

    private void addStatisticsSection(Document document, String title, String[][] stats) {
        document.add(new Paragraph(title)
            .setFontSize(12)
            .setBold()
            .setMarginBottom(5));

        Table statsTable = new Table(UnitValue.createPercentArray(new float[]{3, 1}));
        statsTable.setWidth(UnitValue.createPercentValue(50));

        for (String[] stat : stats) {
            statsTable.addCell(new Cell()
                .add(new Paragraph(stat[0]).setFontSize(9))
                .setBorder(null)
                .setPadding(2));
            statsTable.addCell(new Cell()
                .add(new Paragraph(stat[1]).setFontSize(9).setBold())
                .setBorder(null)
                .setPadding(2)
                .setTextAlignment(TextAlignment.RIGHT));
        }

        document.add(statsTable);
        document.add(new Paragraph("\n").setMarginBottom(10));
    }

    private Cell createHeaderCell(String text) {
        return new Cell()
            .add(new Paragraph(text).setFontSize(8).setBold())
            .setBackgroundColor(HEADER_COLOR)
            .setFontColor(ColorConstants.WHITE)
            .setTextAlignment(TextAlignment.CENTER)
            .setPadding(5);
    }

    private Cell createDataCell(String text, boolean altRow) {
        Cell cell = new Cell()
            .add(new Paragraph(text != null ? text : "").setFontSize(7))
            .setPadding(3);
        
        if (altRow) {
            cell.setBackgroundColor(ALT_ROW_COLOR);
        }
        
        return cell;
    }

    private void addFooter(Document document, int totalRecords) {
        document.add(new Paragraph("\n"));
        document.add(new Paragraph("Total de registros: " + totalRecords)
            .setFontSize(10)
            .setBold()
            .setTextAlignment(TextAlignment.RIGHT));
        document.add(new Paragraph("Sistema de Gestión Veterinaria - " + 
                LocalDateTime.now().getYear())
            .setFontSize(8)
            .setTextAlignment(TextAlignment.CENTER)
            .setMarginTop(20));
    }
}
