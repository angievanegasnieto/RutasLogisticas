/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */

/**
 *
 * @author johan
 */
// package com.logistics.delivery.export;

package Logistica.delivery.export;


import Logistica.Entity.Pedido;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfWriter;
import java.awt.Color;                       // <- en vez de BaseColor
import java.io.ByteArrayOutputStream;
import java.util.List;

public class PdfExporter {

  public static byte[] toPdf(List<Pedido> rows) throws Exception {
    var baos = new ByteArrayOutputStream();
    var doc  = new Document(PageSize.A4.rotate(), 36, 36, 36, 36);
    PdfWriter.getInstance(doc, baos);
    doc.open();

    var title = new Paragraph("Reporte de Pedidos Entregados");
    title.setAlignment(Element.ALIGN_CENTER);
    title.setSpacingAfter(10f);
    doc.add(title);

    var table = new PdfPTable(7);
    table.setWidthPercentage(100);
    table.setWidths(new float[]{6,18,18,18,10,10,10});
    addHeader(table, "ID","Cliente","Destino","Fecha Entrega","Costo","Vehículo","Conductor");

    for (var p : rows) {
      table.addCell(String.valueOf(p.getId()));
      table.addCell(nz(p.getCliente()));
      table.addCell(nz(p.getDestino()));
      table.addCell(p.getFechaEntrega()==null ? "" : p.getFechaEntrega().toString());
      table.addCell(p.getCosto()==null ? "" : p.getCosto().toPlainString());
      table.addCell(p.getVehiculoId()==null ? "" : p.getVehiculoId().toString());
      table.addCell(p.getConductorId()==null ? "" : p.getConductorId().toString());
    }

    doc.add(table);
    doc.close();
    return baos.toByteArray();
  }

  private static void addHeader(PdfPTable t, String... th) {
    for (var h : th) {
      PdfPCell cell = new PdfPCell(new Phrase(h));
      cell.setBackgroundColor(new Color(230,230,230));  // <- Color
      t.addCell(cell);
    }
  }

  private static String nz(String s) { return s==null ? "" : s; }
}





