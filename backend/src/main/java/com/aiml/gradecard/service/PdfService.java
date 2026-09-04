package com.aiml.gradecard.service;

import com.aiml.gradecard.dto.SemesterGradecardDto;
import com.aiml.gradecard.dto.SubjectResultDto;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;

/** Renders a semester grade card in the style of a real institute
 * provisional marksheet: centered letterhead, bordered info block, course
 * table, then side-by-side Current/Cumulative record boxes. Times-Roman
 * (a built-in PDF base font) matches the site's serif typeface with no font
 * embedding needed. */
@Service
public class PdfService {

    private static final Color NAVY = new Color(13, 31, 69);
    private static final Color PANEL = new Color(234, 241, 251);
    private static final String YEAR_LABEL_FY = "First Year";
    private static final String YEAR_LABEL_SY = "Second Year";
    private static final String YEAR_LABEL_TY = "Third Year";

    public byte[] gradecardPdf(SemesterGradecardDto gc) {
        Document doc = new Document(PageSize.A4, 40, 40, 40, 40);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter.getInstance(doc, out);
            doc.open();

            Font instFont = FontFactory.getFont(FontFactory.TIMES_ROMAN, 10, Color.DARK_GRAY);
            Font instBoldFont = FontFactory.getFont(FontFactory.TIMES_BOLD, 15, NAVY);
            Font instItalicFont = FontFactory.getFont(FontFactory.TIMES_ITALIC, 9, Color.DARK_GRAY);
            Font titleFont = FontFactory.getFont(FontFactory.TIMES_BOLD, 14, Color.BLACK);
            Font labelFont = FontFactory.getFont(FontFactory.TIMES_BOLD, 10, Color.BLACK);
            Font valueFont = FontFactory.getFont(FontFactory.TIMES_ROMAN, 10, Color.BLACK);
            Font headerFont = FontFactory.getFont(FontFactory.TIMES_BOLD, 9, Color.WHITE);
            Font cellFont = FontFactory.getFont(FontFactory.TIMES_ROMAN, 9, Color.BLACK);
            Font summaryLabelFont = FontFactory.getFont(FontFactory.TIMES_ROMAN, 9, Color.DARK_GRAY);
            Font summaryValueFont = FontFactory.getFont(FontFactory.TIMES_BOLD, 12, NAVY);

            Paragraph trust = new Paragraph("Bansilal Ramnath Agarwal Charitable Trust's", instFont);
            trust.setAlignment(Element.ALIGN_CENTER);
            doc.add(trust);
            Paragraph inst = new Paragraph("Vishwakarma Institute of Technology, Pune", instBoldFont);
            inst.setAlignment(Element.ALIGN_CENTER);
            doc.add(inst);
            Paragraph aff = new Paragraph("(An Autonomous Institute affiliated to Savitribai Phule Pune University)", instItalicFont);
            aff.setAlignment(Element.ALIGN_CENTER);
            aff.setSpacingAfter(4);
            doc.add(aff);
            Paragraph addr = new Paragraph("666, Upper Indiranagar, Bibwewadi, Pune - 411 037.", instFont);
            addr.setAlignment(Element.ALIGN_CENTER);
            addr.setSpacingAfter(14);
            doc.add(addr);

            Paragraph title = new Paragraph("Semester Grade Card", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(16);
            doc.add(title);

            PdfPTable info = new PdfPTable(2);
            info.setWidthPercentage(100);
            info.setSpacingAfter(16);
            info.setWidths(new float[]{1f, 1f});
            addInfoRow(info, "Name", gc.student().name(), labelFont, valueFont);
            addInfoRow(info, "PRN", gc.student().prn(), labelFont, valueFont);
            addInfoRow(info, "Roll No.", String.valueOf(gc.student().rollNo()), labelFont, valueFont);
            addInfoRow(info, "Division", gc.student().division(), labelFont, valueFont);
            addInfoRow(info, "Program", "Bachelor of Technology", labelFont, valueFont);
            addInfoRow(info, "Branch", "Computer Science and Engineering (AI & ML)", labelFont, valueFont);
            addInfoRow(info, "Class", yearLabel(gc.year()), labelFont, valueFont);
            addInfoRow(info, "Semester", String.valueOf(gc.semester()), labelFont, valueFont);
            doc.add(info);

            if (!gc.hasResults()) {
                Paragraph note = new Paragraph("Results have not yet been declared for this semester.", valueFont);
                note.setSpacingBefore(6);
                doc.add(note);
            } else {
                PdfPTable table = new PdfPTable(new float[]{0.6f, 1.4f, 4f, 1f, 1f});
                table.setWidthPercentage(100);
                addHeaderCell(table, "Sr.No", headerFont);
                addHeaderCell(table, "Course Code", headerFont);
                addHeaderCell(table, "Course Title", headerFont);
                addHeaderCell(table, "Credits", headerFont);
                addHeaderCell(table, "Grade", headerFont);

                int sr = 1;
                for (SubjectResultDto s : gc.subjects()) {
                    table.addCell(bodyCell(String.valueOf(sr++), cellFont));
                    table.addCell(bodyCell(s.code(), cellFont));
                    table.addCell(bodyCell(s.title(), cellFont));
                    table.addCell(bodyCell(String.valueOf(s.credits()), cellFont));
                    table.addCell(bodyCell(s.letterGrade() == null ? "-" : s.letterGrade(), cellFont));
                }
                doc.add(table);

                PdfPTable summary = new PdfPTable(2);
                summary.setWidthPercentage(100);
                summary.setSpacingBefore(18);
                summary.setWidths(new float[]{1f, 1f});
                summary.addCell(summaryBox("Current Semester Record", new String[][]{
                        {"Credits Registered", String.valueOf(gc.currentCreditsRegistered())},
                        {"Credits Earned", String.valueOf(gc.currentCreditsEarned())},
                        {"SGPA", gc.sgpa() == null ? "-" : String.valueOf(gc.sgpa())},
                }, labelFont, summaryLabelFont, summaryValueFont));
                summary.addCell(summaryBox("Cumulative Record", new String[][]{
                        {"Credits Registered", String.valueOf(gc.cumulativeCreditsRegistered())},
                        {"Credits Earned", String.valueOf(gc.cumulativeCreditsEarned())},
                        {"CGPA", gc.cgpa() == null ? "-" : String.valueOf(gc.cgpa())},
                }, labelFont, summaryLabelFont, summaryValueFont));
                doc.add(summary);

                Paragraph status = new Paragraph("Result Status: " + gc.resultStatus(), labelFont);
                status.setSpacingBefore(14);
                doc.add(status);
            }

            doc.close();
        } catch (DocumentException e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }
        return out.toByteArray();
    }

    private String yearLabel(String year) {
        return switch (year) {
            case "FY" -> YEAR_LABEL_FY;
            case "SY" -> YEAR_LABEL_SY;
            case "TY" -> YEAR_LABEL_TY;
            default -> year;
        };
    }

    private void addInfoRow(PdfPTable table, String label, String value, Font labelFont, Font valueFont) {
        PdfPCell l = new PdfPCell(new Phrase(label, labelFont));
        l.setBorder(Rectangle.BOTTOM);
        l.setBorderColor(new Color(219, 228, 240));
        l.setPadding(5);
        PdfPCell v = new PdfPCell(new Phrase(value == null ? "-" : value, valueFont));
        v.setBorder(Rectangle.BOTTOM);
        v.setBorderColor(new Color(219, 228, 240));
        v.setPadding(5);
        table.addCell(l);
        table.addCell(v);
    }

    private void addHeaderCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(NAVY);
        cell.setPadding(6);
        table.addCell(cell);
    }

    private PdfPCell bodyCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(5);
        return cell;
    }

    private PdfPCell summaryBox(String title, String[][] rows, Font titleFont, Font labelFont, Font valueFont) {
        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(PANEL);
        cell.setPadding(12);
        cell.setBorderColor(new Color(219, 228, 240));
        Paragraph p = new Paragraph();
        p.add(new Chunk(title + "\n\n", titleFont));
        for (String[] row : rows) {
            p.add(new Chunk(row[0] + ": ", labelFont));
            p.add(new Chunk(row[1] + "\n", valueFont));
        }
        cell.addElement(p);
        return cell;
    }
}
