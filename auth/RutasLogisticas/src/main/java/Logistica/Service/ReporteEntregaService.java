/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Logistica.Service;

import Logistica.Entity.Pedido;
import Logistica.Entity.EstadoPedido;
import Logistica.Repository.PedidoRepository;
import Logistica.delivery.view.PedidoView;
import Logistica.delivery.view.PedidosFiltro;

import org.springframework.stereotype.Service;

import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.stream.Collectors;

import Logistica.delivery.export.CsvExporter;
import Logistica.delivery.export.PdfExporter;

@Service
public class ReporteEntregaService {

    private final PedidoRepository repo;
    private final ZoneId zone = ZoneId.systemDefault();

    public ReporteEntregaService(PedidoRepository repo) {
        this.repo = repo;
    }

    /* =========================
       LISTADO (negocio/filtrado)
       ========================= */
    public List<PedidoView> listar(PedidosFiltro f) {
        // Carga base: por estado si viene; si no, todo
        List<Pedido> base = (f.getEstado() != null)
                ? repo.findByEstado(f.getEstado())
                : repo.findAll();

        // Normaliza filtros de texto
        String cliente = safeLower(f.getCliente());
        String destino = safeLower(f.getDestino());

        LocalDate desde = f.getDesde();
        LocalDate hasta = f.getHasta();
        Long vehiculoId = f.getVehiculoId();
        Long conductorId = f.getConductorId();

        return base.stream()
                // cliente contiene (case-insensitive)
                .filter(p -> cliente == null || safeLower(p.getCliente()).contains(cliente))
                // destino contiene (case-insensitive)
                .filter(p -> destino == null || safeLower(p.getDestino()).contains(destino))
                // vehículo exacto
                .filter(p -> vehiculoId == null || Objects.equals(p.getVehiculoId(), vehiculoId))
                // conductor exacto
                .filter(p -> conductorId == null || Objects.equals(p.getConductorId(), conductorId))
                // rango de fecha de entrega por día (mapeando Instant -> LocalDate)
                .filter(p -> {
                    Instant fe = p.getFechaEntrega();
                    if (fe == null || (desde == null && hasta == null)) return true;
                    LocalDate d = fe.atZone(zone).toLocalDate();
                    boolean okDesde = (desde == null) || !d.isBefore(desde);
                    boolean okHasta = (hasta == null) || !d.isAfter(hasta);
                    return okDesde && okHasta;
                })
                .map(this::toView)
                .collect(Collectors.toList());
    }

    /* ===============
       EXPORTACIONES
       =============== */
    public byte[] exportCsv(PedidosFiltro f) throws Exception {
        // Para CSV usamos la entidad (exporter actual recibe List<Pedido>)
        List<Pedido> rows = cargarParaExport(f);
        String csv = CsvExporter.toCsv(rows);
        return csv.getBytes(StandardCharsets.UTF_8);
    }

    public byte[] exportPdf(PedidosFiltro f) throws Exception {
        // Para PDF también usamos la entidad y el exporter genera el byte[]
        List<Pedido> rows = cargarParaExport(f);
        return PdfExporter.toPdf(rows);
    }

    /* =========================
       Helpers internos
       ========================= */
    private List<Pedido> cargarParaExport(PedidosFiltro f) {
        List<Pedido> base = (f.getEstado() != null)
                ? repo.findByEstado(f.getEstado())
                : repo.findAll();

        String cliente = safeLower(f.getCliente());
        String destino = safeLower(f.getDestino());
        LocalDate desde = f.getDesde();
        LocalDate hasta = f.getHasta();
        Long vehiculoId = f.getVehiculoId();
        Long conductorId = f.getConductorId();

        return base.stream()
                .filter(p -> cliente == null || safeLower(p.getCliente()).contains(cliente))
                .filter(p -> destino == null || safeLower(p.getDestino()).contains(destino))
                .filter(p -> vehiculoId == null || Objects.equals(p.getVehiculoId(), vehiculoId))
                .filter(p -> conductorId == null || Objects.equals(p.getConductorId(), conductorId))
                .filter(p -> {
                    Instant fe = p.getFechaEntrega();
                    if (fe == null || (desde == null && hasta == null)) return true;
                    LocalDate d = fe.atZone(zone).toLocalDate();
                    boolean okDesde = (desde == null) || !d.isBefore(desde);
                    boolean okHasta = (hasta == null) || !d.isAfter(hasta);
                    return okDesde && okHasta;
                })
                .collect(Collectors.toList());
    }

    private PedidoView toView(Pedido p) {
        PedidoView v = new PedidoView();
        v.setId(p.getId());
        v.setCliente(p.getCliente());
        v.setDestino(p.getDestino());

        // fechaEntrega como texto legible (o vacío si null)
        String fechaTxt = (p.getFechaEntrega() == null)
                ? ""
                : p.getFechaEntrega().atZone(zone).toLocalDate().toString();
        v.setFechaEntrega(fechaTxt);

        // costo con 2 decimales; si es null, ""
        String costoTxt = (p.getCosto() == null)
                ? ""
                : p.getCosto().setScale(2, RoundingMode.HALF_UP).toPlainString();
        v.setCosto(costoTxt);

        v.setVehiculoId(p.getVehiculoId());
        v.setConductorId(p.getConductorId());
        v.setEstado(p.getEstado() == null ? "" : p.getEstado().name());
        return v;
    }

    private static String safeLower(String s) {
        return (s == null) ? null : s.toLowerCase(Locale.ROOT).trim();
    }
}





