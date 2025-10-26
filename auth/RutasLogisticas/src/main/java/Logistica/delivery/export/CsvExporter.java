/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Logistica.delivery.export;

import java.io.StringWriter;
import java.math.RoundingMode;
import java.util.List;

import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;

import Logistica.Entity.Pedido;


public class CsvExporter {

  public static String toCsv(List<Pedido> rows) throws Exception {
    var w = new StringWriter();
    try (var printer = new CSVPrinter(
            w,
            CSVFormat.DEFAULT.builder()
              .setHeader("ID","Cliente","Destino","FechaEntrega","Costo","VehiculoId","ConductorId")
              .build())) {

      for (var p : rows) {
        String costo = p.getCosto()==null ? "" :
            p.getCosto().setScale(2, RoundingMode.HALF_UP).toPlainString();

        printer.printRecord(
          p.getId(),
          nz(p.getCliente()),
          nz(p.getDestino()),
          p.getFechaEntrega()==null ? "" : p.getFechaEntrega().toString(),
          costo,
          p.getVehiculoId()==null ? "" : p.getVehiculoId().toString(),
          p.getConductorId()==null ? "" : p.getConductorId().toString()
        );
      }
    }
    return w.toString();
  }

  private static String nz(String s) { return s == null ? "" : s; }
}



