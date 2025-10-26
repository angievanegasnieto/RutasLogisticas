/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Logistica.ServiceController;

import Logistica.Service.ReporteEntregaService;
import Logistica.delivery.view.PedidoView;
import Logistica.delivery.view.PedidosFiltro;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/reportes/entregas")
public class ReporteEntregaController {

    private final ReporteEntregaService service;

    public ReporteEntregaController(ReporteEntregaService service) {
        this.service = service;
    }

    // Listado JSON para la tabla del FRONT
    @GetMapping
    public List<PedidoView> listar(PedidosFiltro filtro) {
        return service.listar(filtro);
    }

    // Exportación CSV
    @GetMapping(value = "/csv", produces = "text/csv")
    public ResponseEntity<byte[]> exportCsv(PedidosFiltro filtro) throws Exception {
        byte[] file = service.exportCsv(filtro);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"reporte_pedidos.csv\"")
                .contentType(new MediaType("text", "csv", StandardCharsets.UTF_8))
                .body(file);
    }

    // Exportación PDF
    @GetMapping(value = "/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> exportPdf(PedidosFiltro filtro) throws Exception {
        byte[] file = service.exportPdf(filtro);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"reporte_pedidos.pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(file);
    }
}


