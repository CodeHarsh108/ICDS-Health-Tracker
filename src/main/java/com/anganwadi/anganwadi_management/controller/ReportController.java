package com.anganwadi.anganwadi_management.controller;

import com.anganwadi.anganwadi_management.dto.*;
import com.anganwadi.anganwadi_management.service.NutritionDistributionService;
import com.anganwadi.anganwadi_management.service.ReportService;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/reports")
public class ReportController {

    private final NutritionDistributionService nutritionService;
    private final ReportService reportService;

    public ReportController(NutritionDistributionService nutritionService,
                            ReportService reportService) {
        this.nutritionService = nutritionService;
        this.reportService = reportService;
    }

    // === Your existing JSON endpoint ===
    @GetMapping("/nutrition-summary/monthly")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public ResponseEntity<List<MonthlySummaryDto>> getMonthlyNutritionSummary(
            @RequestParam Long centerId,
            @RequestParam int year,
            @RequestParam int month) {
        return ResponseEntity.ok(nutritionService.getMonthlySummary(centerId, year, month));
    }

    // === New: Growth Summary CSV ===
    @GetMapping("/monthly-growth-summary/csv")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'WORKER')")
    public void exportGrowthSummaryCsv(HttpServletResponse response,
                                       @RequestParam Long centerId,
                                       @RequestParam int year,
                                       @RequestParam int month) throws IOException {
        List<GrowthSummaryDto> data = reportService.getMonthlyGrowthSummary(centerId, year, month);
        response.setContentType("text/csv");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=growth_summary_" + centerId + "_" + year + "_" + month + ".csv");
        CSVPrinter printer = new CSVPrinter(response.getWriter(), CSVFormat.DEFAULT.withHeader(
                "Beneficiary Name", "Beneficiary ID", "Previous Weight (kg)", "Current Weight (kg)", "Change (kg)", "Trend"));
        for (GrowthSummaryDto dto : data) {
            printer.printRecord(dto.getBeneficiaryName(), dto.getBeneficiaryId(),
                    dto.getPreviousWeight(), dto.getCurrentWeight(), dto.getWeightChange(), dto.getTrend());
        }
        printer.flush();
    }

    // === New: Growth Summary PDF ===
    @GetMapping("/monthly-growth-summary/pdf")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'WORKER')")
    public void exportGrowthSummaryPdf(HttpServletResponse response,
                                       @RequestParam Long centerId,
                                       @RequestParam int year,
                                       @RequestParam int month) throws Exception {
        List<GrowthSummaryDto> data = reportService.getMonthlyGrowthSummary(centerId, year, month);
        response.setContentType("application/pdf");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=growth_summary_" + centerId + "_" + year + "_" + month + ".pdf");
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, response.getOutputStream());
        document.open();
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
        Paragraph title = new Paragraph("Monthly Growth Summary - Center " + centerId + " (" + year + "/" + month + ")", titleFont);
        title.setAlignment(Paragraph.ALIGN_CENTER);
        document.add(title);
        document.add(new Paragraph(" "));
        PdfPTable table = new PdfPTable(6);
        table.setWidthPercentage(100);
        table.addCell("Beneficiary Name");
        table.addCell("Beneficiary ID");
        table.addCell("Prev Weight (kg)");
        table.addCell("Current Weight (kg)");
        table.addCell("Change (kg)");
        table.addCell("Trend");
        for (GrowthSummaryDto d : data) {
            table.addCell(d.getBeneficiaryName());
            table.addCell(d.getBeneficiaryId());
            table.addCell(String.valueOf(d.getPreviousWeight()));
            table.addCell(String.valueOf(d.getCurrentWeight()));
            table.addCell(String.valueOf(d.getWeightChange()));
            table.addCell(d.getTrend());
        }
        document.add(table);
        document.close();
    }

    // === New: Vaccination Coverage CSV ===
    @GetMapping("/vaccination-coverage/csv")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'WORKER')")
    public void exportVaccinationCoverageCsv(HttpServletResponse response,
                                             @RequestParam Long centerId) throws IOException {
        List<VaccinationCoverageDto> data = reportService.getVaccinationCoverage(centerId);
        response.setContentType("text/csv");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=vaccination_coverage_" + centerId + ".csv");
        CSVPrinter printer = new CSVPrinter(response.getWriter(), CSVFormat.DEFAULT.withHeader(
                "Vaccine Name", "Total Due", "Total Given", "Coverage (%)"));
        for (VaccinationCoverageDto dto : data) {
            printer.printRecord(dto.getVaccineName(), dto.getTotalDue(), dto.getTotalGiven(), dto.getCoveragePercentage());
        }
        printer.flush();
    }

    // === New: Vaccination Coverage PDF ===
    @GetMapping("/vaccination-coverage/pdf")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR', 'WORKER')")
    public void exportVaccinationCoveragePdf(HttpServletResponse response,
                                             @RequestParam Long centerId) throws Exception {
        List<VaccinationCoverageDto> data = reportService.getVaccinationCoverage(centerId);
        response.setContentType("application/pdf");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=vaccination_coverage_" + centerId + ".pdf");
        Document document = new Document(PageSize.A4.rotate());
        PdfWriter.getInstance(document, response.getOutputStream());
        document.open();
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
        Paragraph title = new Paragraph("Vaccination Coverage Report - Center " + centerId, titleFont);
        title.setAlignment(Paragraph.ALIGN_CENTER);
        document.add(title);
        document.add(new Paragraph(" "));
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.addCell("Vaccine Name");
        table.addCell("Total Due");
        table.addCell("Total Given");
        table.addCell("Coverage (%)");
        for (VaccinationCoverageDto d : data) {
            table.addCell(d.getVaccineName());
            table.addCell(String.valueOf(d.getTotalDue()));
            table.addCell(String.valueOf(d.getTotalGiven()));
            table.addCell(String.format("%.2f", d.getCoveragePercentage()));
        }
        document.add(table);
        document.close();
    }

    // === New: Nutrition Summary CSV ===
    @GetMapping("/nutrition-summary/csv")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public void exportNutritionSummaryCsv(HttpServletResponse response,
                                          @RequestParam Long centerId,
                                          @RequestParam int year,
                                          @RequestParam int month) throws IOException {
        List<MonthlySummaryDto> data = nutritionService.getMonthlySummary(centerId, year, month);
        response.setContentType("text/csv");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=nutrition_summary_" + centerId + "_" + year + "_" + month + ".csv");
        CSVPrinter printer = new CSVPrinter(response.getWriter(), CSVFormat.DEFAULT.withHeader(
                "Item Name", "Total Quantity", "Unit"));
        for (MonthlySummaryDto dto : data) {
            printer.printRecord(dto.getItemName(), dto.getTotalQuantity(), dto.getUnit());
        }
        printer.flush();
    }

    // === New: Nutrition Summary PDF ===
    @GetMapping("/nutrition-summary/pdf")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERVISOR')")
    public void exportNutritionSummaryPdf(HttpServletResponse response,
                                          @RequestParam Long centerId,
                                          @RequestParam int year,
                                          @RequestParam int month) throws Exception {
        List<MonthlySummaryDto> data = nutritionService.getMonthlySummary(centerId, year, month);
        response.setContentType("application/pdf");
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=nutrition_summary_" + centerId + "_" + year + "_" + month + ".pdf");
        Document document = new Document(PageSize.A4);
        PdfWriter.getInstance(document, response.getOutputStream());
        document.open();
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
        Paragraph title = new Paragraph("Nutrition Distribution Summary - Center " + centerId + " (" + year + "/" + month + ")", titleFont);
        title.setAlignment(Paragraph.ALIGN_CENTER);
        document.add(title);
        document.add(new Paragraph(" "));
        PdfPTable table = new PdfPTable(3);
        table.setWidthPercentage(100);
        table.addCell("Item Name");
        table.addCell("Total Quantity");
        table.addCell("Unit");
        for (MonthlySummaryDto d : data) {
            table.addCell(d.getItemName());
            table.addCell(String.valueOf(d.getTotalQuantity()));
            table.addCell(d.getUnit());
        }
        document.add(table);
        document.close();
    }
}