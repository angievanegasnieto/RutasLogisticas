package rutaslogisticas.Service;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import rutaslogisticas.repository.EventoEntregaRepository;
import rutaslogisticas.repository.PedidoRepository;
import rutaslogisticas.entity.EventoEntrega;
import rutaslogisticas.entity.Pedido;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.CreationHelper;
import org.apache.poi.ss.usermodel.HorizontalAlignment;

@Service
public class ReportesService {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private EventoEntregaRepository eventoEntregaRepository;

    /**
     * 📊 DTO para el reporte
     */
    public static class ReportePedidoDTO {
        public Long pedidoId;
        public String clienteNombre;
        public String direccion;
        public String ciudad;
        public String producto;
        public Integer cantidad;
        public String conductorNombre;
        public LocalDate fechaProgramada;
        public String ventanaHoraria;
        public LocalDateTime fechaInicioRuta;
        public LocalDateTime fechaEntrega;
        public String estadoFinal;
        public Integer numeroReintentos;
        public String notasReprogramacion;
        public String notasFallo;
        
        // Constructor vacío
        public ReportePedidoDTO() {}
    }

    /**
     * 📋 Generar reporte de pedidos entregados
     */
    public List<ReportePedidoDTO> generarReportePedidosEntregados(
            LocalDate fechaInicio, 
            LocalDate fechaFin, 
            Long conductorId) {
        
        // Establecer fechas por defecto si no se proporcionan (rango amplio: 6 meses)
        final LocalDate fechaInicioFinal = (fechaInicio == null) ? LocalDate.now().minusMonths(6) : fechaInicio;
        final LocalDate fechaFinFinal = (fechaFin == null) ? LocalDate.now().plusMonths(6) : fechaFin;

        // Obtener pedidos entregados en el rango de fechas
        List<Pedido> pedidos = pedidoRepository.findAll().stream()
                .filter(p -> p.getEstado() == Pedido.EstadoPedido.ENTREGADO)
                .filter(p -> {
                    LocalDate fechaPedido = p.getFechaProgramada();
                    return !fechaPedido.isBefore(fechaInicioFinal) && !fechaPedido.isAfter(fechaFinFinal);
                })
                .filter(p -> conductorId == null || (p.getConductorId() != null && p.getConductorId().equals(conductorId)))
                .collect(Collectors.toList());

        List<ReportePedidoDTO> reporte = new ArrayList<>();

        for (Pedido pedido : pedidos) {
            ReportePedidoDTO dto = new ReportePedidoDTO();
            
            // Datos básicos del pedido
            dto.pedidoId = pedido.getId();
            dto.clienteNombre = pedido.getCliente() != null ? pedido.getCliente().getNombre() : "N/A";
            dto.direccion = pedido.getDireccion() != null ? pedido.getDireccion().getDireccion() : "N/A";
            dto.ciudad = pedido.getDireccion() != null ? pedido.getDireccion().getCiudad() : "N/A";
            dto.producto = pedido.getProducto() != null ? pedido.getProducto() : "N/A";
            dto.cantidad = pedido.getCantidad();
            dto.conductorNombre = pedido.getConductor() != null ? pedido.getConductor().getNombreCompleto() : "N/A";
            dto.fechaProgramada = pedido.getFechaProgramada();
            dto.ventanaHoraria = pedido.getVentanaInicio() + " - " + pedido.getVentanaFin();
            dto.estadoFinal = pedido.getEstado().toString();

            // Obtener eventos relacionados con este pedido
            List<EventoEntrega> eventos = eventoEntregaRepository.findByPedidoIdOrderByFechaEventoDesc(pedido.getId());
            
            if (!eventos.isEmpty()) {
                // Buscar evento de inicio de ruta
                Optional<EventoEntrega> inicioRuta = eventos.stream()
                        .filter(e -> e.getTipoEvento() == EventoEntrega.TipoEvento.INICIO_RUTA)
                        .findFirst();
                
                if (inicioRuta.isPresent()) {
                    dto.fechaInicioRuta = inicioRuta.get().getFechaEvento();
                }

                // Buscar evento de entrega
                Optional<EventoEntrega> entrega = eventos.stream()
                        .filter(e -> e.getTipoEvento() == EventoEntrega.TipoEvento.ENTREGADO)
                        .findFirst();
                
                if (entrega.isPresent()) {
                    dto.fechaEntrega = entrega.get().getFechaEvento();
                }

                // Contar reintentos (eventos FALLIDO o REINTENTO)
                long reintentos = eventos.stream()
                        .filter(e -> e.getTipoEvento() == EventoEntrega.TipoEvento.FALLIDO 
                                  || e.getTipoEvento() == EventoEntrega.TipoEvento.REINTENTO)
                        .count();
                dto.numeroReintentos = (int) reintentos;

                // Recopilar notas de reprogramación
                String notasReprog = eventos.stream()
                        .filter(e -> e.getNotas() != null && !e.getNotas().isEmpty())
                        .filter(e -> e.getNotas().toLowerCase().contains("reprogramado"))
                        .map(EventoEntrega::getNotas)
                        .collect(Collectors.joining("; "));
                dto.notasReprogramacion = notasReprog.isEmpty() ? null : notasReprog;

                // Recopilar notas de fallos
                String notasFallos = eventos.stream()
                        .filter(e -> e.getTipoEvento() == EventoEntrega.TipoEvento.FALLIDO)
                        .filter(e -> e.getNotas() != null && !e.getNotas().isEmpty())
                        .map(EventoEntrega::getNotas)
                        .collect(Collectors.joining("; "));
                dto.notasFallo = notasFallos.isEmpty() ? null : notasFallos;

                // Obtener conductor del primer evento
                if (eventos.get(0).getConductorId() != null) {
                    dto.conductorNombre = "Conductor ID: " + eventos.get(0).getConductorId();
                }
            }

            reporte.add(dto);
        }

        return reporte;
    }

    /**
     * 📄 Generar archivo CSV
     */
    public byte[] generarReporteCSV(LocalDate fechaInicio, LocalDate fechaFin, Long conductorId) throws Exception {
        List<ReportePedidoDTO> datos = generarReportePedidosEntregados(fechaInicio, fechaFin, conductorId);
        
        StringBuilder csv = new StringBuilder();
        
        // Encabezados
        csv.append("ID Pedido,Cliente,Dirección,Ciudad,Producto,Cantidad,Conductor,Fecha Programada,Ventana Horaria,")
           .append("Fecha Inicio Ruta,Fecha Entrega,Estado,Reintentos,Notas Reprogramación,Notas Fallo\n");
        
        // Datos
        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        
        for (ReportePedidoDTO dto : datos) {
            csv.append(escapeCsv(dto.pedidoId)).append(",")
               .append(escapeCsv(dto.clienteNombre)).append(",")
               .append(escapeCsv(dto.direccion)).append(",")
               .append(escapeCsv(dto.ciudad)).append(",")
               .append(escapeCsv(dto.producto)).append(",")
               .append(escapeCsv(dto.cantidad)).append(",")
               .append(escapeCsv(dto.conductorNombre)).append(",")
               .append(escapeCsv(dto.fechaProgramada != null ? dto.fechaProgramada.format(dateFormatter) : "")).append(",")
               .append(escapeCsv(dto.ventanaHoraria)).append(",")
               .append(escapeCsv(dto.fechaInicioRuta != null ? dto.fechaInicioRuta.format(dateTimeFormatter) : "")).append(",")
               .append(escapeCsv(dto.fechaEntrega != null ? dto.fechaEntrega.format(dateTimeFormatter) : "")).append(",")
               .append(escapeCsv(dto.estadoFinal)).append(",")
               .append(escapeCsv(dto.numeroReintentos)).append(",")
               .append(escapeCsv(dto.notasReprogramacion)).append(",")
               .append(escapeCsv(dto.notasFallo)).append("\n");
        }
        
        return csv.toString().getBytes("UTF-8");
    }

    /**
     * 📊 Generar archivo Excel
     */
    public byte[] generarReporteExcel(LocalDate fechaInicio, LocalDate fechaFin, Long conductorId) throws Exception {
        List<ReportePedidoDTO> datos = generarReportePedidosEntregados(fechaInicio, fechaFin, conductorId);
        
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Pedidos Entregados");
            
            // Estilos
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            
            CellStyle dateStyle = workbook.createCellStyle();
            CreationHelper createHelper = workbook.getCreationHelper();
            dateStyle.setDataFormat(createHelper.createDataFormat().getFormat("dd/MM/yyyy"));
            
            CellStyle dateTimeStyle = workbook.createCellStyle();
            dateTimeStyle.setDataFormat(createHelper.createDataFormat().getFormat("dd/MM/yyyy HH:mm"));
            
            // Encabezados
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                "ID Pedido", "Cliente", "Dirección", "Ciudad", "Producto", "Cantidad", 
                "Conductor", "Fecha Programada", "Ventana Horaria", "Fecha Inicio Ruta",
                "Fecha Entrega", "Estado", "Reintentos", 
                "Notas Reprogramación", "Notas Fallo"
            };
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Datos
            DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
            int rowNum = 1;
            for (ReportePedidoDTO dto : datos) {
                Row row = sheet.createRow(rowNum++);
                
                row.createCell(0).setCellValue(dto.pedidoId != null ? dto.pedidoId : 0);
                row.createCell(1).setCellValue(dto.clienteNombre != null ? dto.clienteNombre : "");
                row.createCell(2).setCellValue(dto.direccion != null ? dto.direccion : "");
                row.createCell(3).setCellValue(dto.ciudad != null ? dto.ciudad : "");
                row.createCell(4).setCellValue(dto.producto != null ? dto.producto : "");
                row.createCell(5).setCellValue(dto.cantidad != null ? dto.cantidad : 0);
                row.createCell(6).setCellValue(dto.conductorNombre != null ? dto.conductorNombre : "");
                row.createCell(7).setCellValue(dto.fechaProgramada != null ? dto.fechaProgramada.toString() : "");
                row.createCell(8).setCellValue(dto.ventanaHoraria != null ? dto.ventanaHoraria : "");
                row.createCell(9).setCellValue(dto.fechaInicioRuta != null ? dto.fechaInicioRuta.format(dateTimeFormatter) : "");
                row.createCell(10).setCellValue(dto.fechaEntrega != null ? dto.fechaEntrega.format(dateTimeFormatter) : "");
                row.createCell(11).setCellValue(dto.estadoFinal != null ? dto.estadoFinal : "");
                row.createCell(12).setCellValue(dto.numeroReintentos != null ? dto.numeroReintentos : 0);
                row.createCell(13).setCellValue(dto.notasReprogramacion != null ? dto.notasReprogramacion : "");
                row.createCell(14).setCellValue(dto.notasFallo != null ? dto.notasFallo : "");
            }
            
            // Ajustar ancho de columnas
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(out);
            return out.toByteArray();
        }
    }

    /**
     * 🛡️ Escapar valores para CSV
     */
    private String escapeCsv(Object value) {
        if (value == null) return "";
        String str = value.toString();
        if (str.contains(",") || str.contains("\"") || str.contains("\n")) {
            return "\"" + str.replace("\"", "\"\"") + "\"";
        }
        return str;
    }

    /**
     * 📊 DTO para el reporte de pedidos
     */
    public static class ReportePedidoGeneralDTO {
        public Long id;
        public String clienteNombre;
        public String direccion;
        public String ciudad;
        public String departamento;
        public String producto;
        public Integer cantidad;
        public Double volumen;
        public Double peso;
        public String estado;
        public LocalDate fechaProgramada;
        public String ventanaInicio;
        public String ventanaFin;
        public String conductorNombre;
        public Long conductorId;
        public LocalDateTime creadoEn;
        
        public ReportePedidoGeneralDTO() {}
    }

    /**
     * 📋 Generar reporte de TODOS los pedidos
     */
    public List<ReportePedidoGeneralDTO> generarReportePedidos(
            LocalDate fechaInicio, 
            LocalDate fechaFin, 
            String estado,
            Long conductorId) {
        
        List<Pedido> pedidos = pedidoRepository.findAll().stream()
                .filter(p -> {
                    LocalDate fechaPedido = p.getFechaProgramada();
                    return !fechaPedido.isBefore(fechaInicio) && !fechaPedido.isAfter(fechaFin);
                })
                .filter(p -> estado == null || estado.isEmpty() || p.getEstado().name().equals(estado))
                .filter(p -> conductorId == null || (p.getConductorId() != null && p.getConductorId().equals(conductorId)))
                .collect(Collectors.toList());

        List<ReportePedidoGeneralDTO> reporte = new ArrayList<>();

        for (Pedido pedido : pedidos) {
            ReportePedidoGeneralDTO dto = new ReportePedidoGeneralDTO();
            
            dto.id = pedido.getId();
            dto.clienteNombre = pedido.getCliente() != null ? pedido.getCliente().getNombre() : "N/A";
            dto.direccion = pedido.getDireccion() != null ? pedido.getDireccion().getDireccion() : "N/A";
            dto.ciudad = pedido.getDireccion() != null ? pedido.getDireccion().getCiudad() : "N/A";
            dto.departamento = pedido.getDireccion() != null ? pedido.getDireccion().getDepartamento() : "";
            dto.producto = pedido.getProducto();
            dto.cantidad = pedido.getCantidad();
            dto.volumen = pedido.getVolumen() != null ? pedido.getVolumen().doubleValue() : 0.0;
            dto.peso = pedido.getPeso() != null ? pedido.getPeso().doubleValue() : 0.0;
            dto.estado = pedido.getEstado().toString();
            dto.fechaProgramada = pedido.getFechaProgramada();
            dto.ventanaInicio = pedido.getVentanaInicio() != null ? pedido.getVentanaInicio().toString() : "";
            dto.ventanaFin = pedido.getVentanaFin() != null ? pedido.getVentanaFin().toString() : "";
            dto.conductorNombre = pedido.getConductor() != null ? pedido.getConductor().getNombreCompleto() : "";
            dto.conductorId = pedido.getConductorId();
            dto.creadoEn = pedido.getCreadoEn();
            
            reporte.add(dto);
        }

        return reporte;
    }

    /**
     * 📄 Generar reporte de pedidos en formato CSV
     */
    public byte[] generarReportePedidosCSV(LocalDate fechaInicio, LocalDate fechaFin, String estado, Long conductorId) {
        List<ReportePedidoGeneralDTO> datos = generarReportePedidos(fechaInicio, fechaFin, estado, conductorId);
        
        StringBuilder csv = new StringBuilder();
        csv.append("ID,Cliente,Dirección,Ciudad,Departamento,Producto,Cantidad,Volumen (m³),Peso (kg),Estado,Fecha Programada,Ventana Inicio,Ventana Fin,Conductor,ID Conductor,Creado\n");
        
        DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        
        for (ReportePedidoGeneralDTO dto : datos) {
            csv.append(escapeCsv(dto.id)).append(",");
            csv.append(escapeCsv(dto.clienteNombre)).append(",");
            csv.append(escapeCsv(dto.direccion)).append(",");
            csv.append(escapeCsv(dto.ciudad)).append(",");
            csv.append(escapeCsv(dto.departamento)).append(",");
            csv.append(escapeCsv(dto.producto)).append(",");
            csv.append(escapeCsv(dto.cantidad)).append(",");
            csv.append(escapeCsv(dto.volumen)).append(",");
            csv.append(escapeCsv(dto.peso)).append(",");
            csv.append(escapeCsv(dto.estado)).append(",");
            csv.append(escapeCsv(dto.fechaProgramada)).append(",");
            csv.append(escapeCsv(dto.ventanaInicio)).append(",");
            csv.append(escapeCsv(dto.ventanaFin)).append(",");
            csv.append(escapeCsv(dto.conductorNombre)).append(",");
            csv.append(escapeCsv(dto.conductorId)).append(",");
            csv.append(escapeCsv(dto.creadoEn != null ? dto.creadoEn.format(dateTimeFormatter) : "")).append("\n");
        }
        
        return csv.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    /**
     * 📊 Generar reporte de pedidos en formato Excel
     */
    public byte[] generarReportePedidosExcel(LocalDate fechaInicio, LocalDate fechaFin, String estado, Long conductorId) throws Exception {
        List<ReportePedidoGeneralDTO> datos = generarReportePedidos(fechaInicio, fechaFin, estado, conductorId);
        
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Reporte Pedidos");
            
            // Estilo para encabezados
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);
            
            // Crear encabezados
            Row headerRow = sheet.createRow(0);
            String[] headers = {
                "ID", "Cliente", "Dirección", "Ciudad", "Departamento", "Producto", 
                "Cantidad", "Volumen (m³)", "Peso (kg)", "Estado", "Fecha Programada", 
                "Ventana Inicio", "Ventana Fin", "Conductor", "ID Conductor", "Creado"
            };
            
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Llenar datos
            DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
            int rowNum = 1;
            
            for (ReportePedidoGeneralDTO dto : datos) {
                Row row = sheet.createRow(rowNum++);
                
                row.createCell(0).setCellValue(dto.id != null ? dto.id : 0);
                row.createCell(1).setCellValue(dto.clienteNombre != null ? dto.clienteNombre : "");
                row.createCell(2).setCellValue(dto.direccion != null ? dto.direccion : "");
                row.createCell(3).setCellValue(dto.ciudad != null ? dto.ciudad : "");
                row.createCell(4).setCellValue(dto.departamento != null ? dto.departamento : "");
                row.createCell(5).setCellValue(dto.producto != null ? dto.producto : "");
                row.createCell(6).setCellValue(dto.cantidad != null ? dto.cantidad : 0);
                row.createCell(7).setCellValue(dto.volumen != null ? dto.volumen : 0.0);
                row.createCell(8).setCellValue(dto.peso != null ? dto.peso : 0.0);
                row.createCell(9).setCellValue(dto.estado != null ? dto.estado : "");
                row.createCell(10).setCellValue(dto.fechaProgramada != null ? dto.fechaProgramada.toString() : "");
                row.createCell(11).setCellValue(dto.ventanaInicio != null ? dto.ventanaInicio : "");
                row.createCell(12).setCellValue(dto.ventanaFin != null ? dto.ventanaFin : "");
                row.createCell(13).setCellValue(dto.conductorNombre != null ? dto.conductorNombre : "");
                row.createCell(14).setCellValue(dto.conductorId != null ? dto.conductorId : 0);
                row.createCell(15).setCellValue(dto.creadoEn != null ? dto.creadoEn.format(dateTimeFormatter) : "");
            }
            
            // Ajustar ancho de columnas
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(out);
            return out.toByteArray();
        }
    }
}
