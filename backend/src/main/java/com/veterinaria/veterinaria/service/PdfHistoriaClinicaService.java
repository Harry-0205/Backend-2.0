package com.veterinaria.veterinaria.service;

import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.layout.borders.Border;

import com.itextpdf.kernel.geom.PageSize;

import com.veterinaria.veterinaria.entity.Mascota;
import com.veterinaria.veterinaria.entity.HistoriaClinica;
import com.veterinaria.veterinaria.entity.Cita;
import com.veterinaria.veterinaria.repository.MascotaRepository;
import com.veterinaria.veterinaria.repository.HistoriaClinicaRepository;
import com.veterinaria.veterinaria.repository.CitaRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class PdfHistoriaClinicaService {
    
    @Autowired
    private MascotaRepository mascotaRepository;
    
    @Autowired
    private HistoriaClinicaRepository historiaClinicaRepository;
    
    @Autowired
    private CitaRepository citaRepository;
    
    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private final DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    
    public byte[] generarHistoriaClinicaPdf(Long mascotaId, String propietarioDocumento) throws Exception {
        // Verificar que la mascota existe
        Optional<Mascota> mascotaOpt = mascotaRepository.findById(mascotaId);
        if (!mascotaOpt.isPresent()) {
            throw new RuntimeException("Mascota no encontrada");
        }
        
        Mascota mascota = mascotaOpt.get();
        
        // Si se proporciona documento de propietario, verificar que coincida (para clientes)
        if (propietarioDocumento != null && !mascota.getPropietario().getDocumento().equals(propietarioDocumento)) {
            throw new RuntimeException("No tiene permisos para acceder a esta mascota");
        }
        
        // Obtener historias clínicas y citas
        List<HistoriaClinica> historias = historiaClinicaRepository.findByMascotaIdOrderByFechaConsultaDesc(mascotaId);
        List<Cita> citas = citaRepository.findByMascotaIdOrderByFechaHoraDesc(mascotaId);
        
        // Crear PDF
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc, PageSize.A4);
        
        try {
            // Fuentes
            PdfFont boldFont = PdfFontFactory.createFont("Helvetica-Bold");
            PdfFont normalFont = PdfFontFactory.createFont("Helvetica");
            
            // Título del documento
            Paragraph titulo = new Paragraph("HISTORIA CLÍNICA COMPLETA")
                .setFont(boldFont)
                .setFontSize(20)
                .setTextAlignment(TextAlignment.CENTER)
                .setMarginBottom(20);
            document.add(titulo);
            
            // Información de la mascota
            agregarInformacionMascota(document, mascota, boldFont, normalFont);
            
            // Separador
            document.add(new Paragraph("_".repeat(80)));
            document.add(new Paragraph("\n"));
            
            // Resumen de citas
            agregarResumenCitas(document, citas, boldFont, normalFont);
            
            // Separador  
            document.add(new Paragraph("_".repeat(80)));
            document.add(new Paragraph("\n"));
            
            // Historias clínicas detalladas
            agregarHistoriasClinicas(document, historias, boldFont, normalFont);
            
            // Pie de página
            document.add(new Paragraph("\n"));
            document.add(new Paragraph("_".repeat(80)));
            Paragraph piePagina = new Paragraph("Documento generado el: " + 
                java.time.LocalDateTime.now().format(dateTimeFormatter))
                .setFont(normalFont)
                .setFontSize(8)
                .setTextAlignment(TextAlignment.RIGHT);
            document.add(piePagina);
            
        } finally {
            document.close();
        }
        
        return baos.toByteArray();
    }
    
    private void agregarInformacionMascota(Document document, Mascota mascota, PdfFont boldFont, PdfFont normalFont) {
        Paragraph seccionTitulo = new Paragraph("INFORMACIÓN DE LA MASCOTA")
            .setFont(boldFont)
            .setFontSize(16)
            .setBackgroundColor(ColorConstants.LIGHT_GRAY)
            .setPadding(5);
        document.add(seccionTitulo);
        
        Table table = new Table(UnitValue.createPercentArray(new float[]{30, 70}))
            .setWidth(UnitValue.createPercentValue(100));
        
        agregarFilaTabla(table, "Nombre:", mascota.getNombre(), boldFont, normalFont);
        agregarFilaTabla(table, "Especie:", mascota.getEspecie(), boldFont, normalFont);
        agregarFilaTabla(table, "Raza:", mascota.getRaza() != null ? mascota.getRaza() : "No especificada", boldFont, normalFont);
        agregarFilaTabla(table, "Sexo:", mascota.getSexo() != null ? mascota.getSexo() : "No especificado", boldFont, normalFont);
        
        if (mascota.getFechaNacimiento() != null) {
            agregarFilaTabla(table, "Fecha de Nacimiento:", 
                mascota.getFechaNacimiento().format(dateFormatter), boldFont, normalFont);
        }
        
        if (mascota.getPeso() != null) {
            agregarFilaTabla(table, "Peso Actual:", mascota.getPeso() + " kg", boldFont, normalFont);
        }
        
        agregarFilaTabla(table, "Color:", mascota.getColor() != null ? mascota.getColor() : "No especificado", boldFont, normalFont);
        agregarFilaTabla(table, "Propietario:", mascota.getPropietario().getNombreCompleto(), boldFont, normalFont);
        agregarFilaTabla(table, "Documento Propietario:", mascota.getPropietario().getDocumento(), boldFont, normalFont);
        agregarFilaTabla(table, "Fecha de Registro:", mascota.getFechaRegistro().format(dateFormatter), boldFont, normalFont);
        
        if (mascota.getObservaciones() != null && !mascota.getObservaciones().trim().isEmpty()) {
            agregarFilaTabla(table, "Observaciones:", mascota.getObservaciones(), boldFont, normalFont);
        }
        
        document.add(table);
    }
    
    private void agregarResumenCitas(Document document, List<Cita> citas, PdfFont boldFont, PdfFont normalFont) {
        Paragraph seccionTitulo = new Paragraph("RESUMEN DE CITAS (" + citas.size() + " citas)")
            .setFont(boldFont)
            .setFontSize(16)
            .setBackgroundColor(ColorConstants.LIGHT_GRAY)
            .setPadding(5);
        document.add(seccionTitulo);
        
        if (citas.isEmpty()) {
            document.add(new Paragraph("No hay citas registradas.")
                .setFont(normalFont)
                .setItalic());
            return;
        }
        
        Table citasTable = new Table(UnitValue.createPercentArray(new float[]{25, 25, 50}))
            .setWidth(UnitValue.createPercentValue(100));
        
        // Headers
        citasTable.addCell(new Cell().add(new Paragraph("Fecha").setFont(boldFont)).setBackgroundColor(ColorConstants.GRAY));
        citasTable.addCell(new Cell().add(new Paragraph("Estado").setFont(boldFont)).setBackgroundColor(ColorConstants.GRAY));
        citasTable.addCell(new Cell().add(new Paragraph("Motivo").setFont(boldFont)).setBackgroundColor(ColorConstants.GRAY));
        
        for (Cita cita : citas) {
            citasTable.addCell(new Cell().add(new Paragraph(cita.getFechaHora().format(dateTimeFormatter)).setFont(normalFont)));
            citasTable.addCell(new Cell().add(new Paragraph(cita.getEstado().toString()).setFont(normalFont)));
            citasTable.addCell(new Cell().add(new Paragraph(
                cita.getMotivo() != null ? cita.getMotivo() : "No especificado").setFont(normalFont)));
        }
        
        document.add(citasTable);
    }
    
    private void agregarHistoriasClinicas(Document document, List<HistoriaClinica> historias, PdfFont boldFont, PdfFont normalFont) {
        Paragraph seccionTitulo = new Paragraph("HISTORIAS CLÍNICAS DETALLADAS (" + historias.size() + " consultas)")
            .setFont(boldFont)
            .setFontSize(16)
            .setBackgroundColor(ColorConstants.LIGHT_GRAY)
            .setPadding(5);
        document.add(seccionTitulo);
        
        if (historias.isEmpty()) {
            document.add(new Paragraph("No hay historias clínicas registradas.")
                .setFont(normalFont)
                .setItalic());
            return;
        }
        
        for (int i = 0; i < historias.size(); i++) {
            HistoriaClinica historia = historias.get(i);
            
            // Título de la consulta
            Paragraph consultaTitulo = new Paragraph("CONSULTA #" + (i + 1) + " - " + 
                historia.getFechaConsulta().format(dateTimeFormatter))
                .setFont(boldFont)
                .setFontSize(14)
                .setBackgroundColor(ColorConstants.YELLOW)
                .setPadding(3)
                .setMarginTop(15);
            document.add(consultaTitulo);
            
            // Tabla de información de la consulta
            Table historiaTable = new Table(UnitValue.createPercentArray(new float[]{30, 70}))
                .setWidth(UnitValue.createPercentValue(100))
                .setMarginBottom(10);
            
            if (historia.getMotivoConsulta() != null) {
                agregarFilaTabla(historiaTable, "Motivo de Consulta:", historia.getMotivoConsulta(), boldFont, normalFont);
            }
            
            if (historia.getSintomas() != null) {
                agregarFilaTabla(historiaTable, "Síntomas:", historia.getSintomas(), boldFont, normalFont);
            }
            
            if (historia.getDiagnostico() != null) {
                agregarFilaTabla(historiaTable, "Diagnóstico:", historia.getDiagnostico(), boldFont, normalFont);
            }
            
            if (historia.getTratamiento() != null) {
                agregarFilaTabla(historiaTable, "Tratamiento:", historia.getTratamiento(), boldFont, normalFont);
            }
            
            if (historia.getMedicamentos() != null) {
                agregarFilaTabla(historiaTable, "Medicamentos:", historia.getMedicamentos(), boldFont, normalFont);
            }
            
            // Signos vitales
            StringBuilder signosVitales = new StringBuilder();
            if (historia.getPeso() != null) {
                signosVitales.append("Peso: ").append(historia.getPeso()).append(" kg  ");
            }
            if (historia.getTemperatura() != null) {
                signosVitales.append("Temperatura: ").append(historia.getTemperatura()).append("°C  ");
            }
            if (historia.getFrecuenciaCardiaca() != null) {
                signosVitales.append("FC: ").append(historia.getFrecuenciaCardiaca()).append(" bpm  ");
            }
            if (historia.getFrecuenciaRespiratoria() != null) {
                signosVitales.append("FR: ").append(historia.getFrecuenciaRespiratoria()).append(" rpm");
            }
            
            if (signosVitales.length() > 0) {
                agregarFilaTabla(historiaTable, "Signos Vitales:", signosVitales.toString(), boldFont, normalFont);
            }
            
            if (historia.getObservaciones() != null) {
                agregarFilaTabla(historiaTable, "Observaciones:", historia.getObservaciones(), boldFont, normalFont);
            }
            
            if (historia.getRecomendaciones() != null) {
                agregarFilaTabla(historiaTable, "Recomendaciones:", historia.getRecomendaciones(), boldFont, normalFont);
            }
            
            // Información del veterinario
            if (historia.getVeterinario() != null) {
                agregarFilaTabla(historiaTable, "Veterinario:", historia.getVeterinario().getNombreCompleto(), boldFont, normalFont);
            }
            
            document.add(historiaTable);
        }
    }
    
    private void agregarFilaTabla(Table table, String label, String valor, PdfFont boldFont, PdfFont normalFont) {
        Cell labelCell = new Cell()
            .add(new Paragraph(label).setFont(boldFont))
            .setBorder(Border.NO_BORDER)
            .setPaddingBottom(5);
        
        Cell valorCell = new Cell()
            .add(new Paragraph(valor != null ? valor : "No especificado").setFont(normalFont))
            .setBorder(Border.NO_BORDER)
            .setPaddingBottom(5);
        
        table.addCell(labelCell);
        table.addCell(valorCell);
    }
}