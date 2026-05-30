package com.example.backend.controller;

import com.example.backend.entity.Resume;
import com.example.backend.payload.response.MessageResponse;
import com.example.backend.service.ResumeService;
import com.example.backend.service.FileProcessingService;
import com.example.backend.service.AiService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

@RestController
@RequestMapping("/api/resumes")
public class ResumeController {

    private final ResumeService resumeService;
    private final FileProcessingService fileProcessingService;
    private final AiService aiService;
    private final ObjectMapper objectMapper;

    public ResumeController(ResumeService resumeService,
                            FileProcessingService fileProcessingService,
                            AiService aiService,
                            ObjectMapper objectMapper) {
        this.resumeService = resumeService;
        this.fileProcessingService = fileProcessingService;
        this.aiService = aiService;
        this.objectMapper = objectMapper;
    }

    @PostMapping
    public ResponseEntity<Resume> createResume(@RequestBody Resume resume) {
        return ResponseEntity.ok(resumeService.createResume(resume));
    }

    @PostMapping("/import")
    public ResponseEntity<Resume> importResume(@RequestParam("file") MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            throw new IllegalArgumentException("Invalid file name");
        }
        
        File tempFile = File.createTempFile("resume_upload_", originalFilename.substring(originalFilename.lastIndexOf(".")));
        try (FileOutputStream fos = new FileOutputStream(tempFile)) {
            fos.write(file.getBytes());
        }

        String text = "";
        if (originalFilename.endsWith(".pdf")) {
            text = fileProcessingService.extractTextFromPdf(tempFile);
        } else if (originalFilename.endsWith(".docx")) {
            text = fileProcessingService.extractTextFromDocx(tempFile);
        } else {
            tempFile.delete();
            throw new IllegalArgumentException("Unsupported file format. Only PDF and DOCX are allowed.");
        }

        tempFile.delete();

        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException("The uploaded file contains no readable text.");
        }

        String parsedJson = aiService.parseResumeFromText(text);
        if (parsedJson == null || parsedJson.isBlank()) {
            throw new RuntimeException("AI was unable to parse structured information from the resume.");
        }

        Resume parsedResume = objectMapper.readValue(parsedJson, Resume.class);
        return ResponseEntity.ok(parsedResume);
    }

    @PostMapping("/import-text")
    public ResponseEntity<Resume> importResumeFromText(@RequestBody java.util.Map<String, String> request) throws IOException {
        String text = request.get("text");
        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException("No text provided for import.");
        }

        String parsedJson = aiService.parseResumeFromText(text);
        if (parsedJson == null || parsedJson.isBlank()) {
            throw new RuntimeException("AI was unable to parse structured information from the text.");
        }

        Resume parsedResume = objectMapper.readValue(parsedJson, Resume.class);
        return ResponseEntity.ok(resumeService.createResume(parsedResume));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Resume> updateResume(@PathVariable Long id, @RequestBody Resume resume) {
        resume.setId(id);
        return ResponseEntity.ok(resumeService.updateResume(resume));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteResume(@PathVariable Long id) {
        resumeService.deleteResume(id);
        return ResponseEntity.ok(new MessageResponse("Resume deleted successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resume> getResume(@PathVariable Long id) {
        return ResponseEntity.ok(resumeService.getResume(id));
    }

    @GetMapping
    public ResponseEntity<?> listResumes() {
        return ResponseEntity.ok(resumeService.getCurrentUserResumes());
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<Resume> duplicateResume(@PathVariable Long id) {
        return ResponseEntity.ok(resumeService.duplicateResume(id));
    }

    @GetMapping("/{id}/download")
    public void downloadResumePdf(@PathVariable Long id, HttpServletResponse response) throws IOException {
        Resume resume = resumeService.getResume(id);
        byte[] pdfData = buildPdf(resume);
        response.setContentType(MediaType.APPLICATION_PDF_VALUE);
        response.setHeader(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=resume-" + id + ".pdf");
        response.getOutputStream().write(pdfData);
    }

    private byte[] buildPdf(Resume resume) throws IOException {
        try (ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            com.itextpdf.text.Document document = new com.itextpdf.text.Document();
            com.itextpdf.text.pdf.PdfWriter.getInstance(document, output);
            document.open();
            com.itextpdf.text.Font heading = new com.itextpdf.text.Font(com.itextpdf.text.Font.FontFamily.HELVETICA, 18, com.itextpdf.text.Font.BOLD);
            com.itextpdf.text.Font section = new com.itextpdf.text.Font(com.itextpdf.text.Font.FontFamily.HELVETICA, 12, com.itextpdf.text.Font.BOLD);
            com.itextpdf.text.Font body = new com.itextpdf.text.Font(com.itextpdf.text.Font.FontFamily.HELVETICA, 11);
            com.itextpdf.text.Font bodyItalic = new com.itextpdf.text.Font(com.itextpdf.text.Font.FontFamily.HELVETICA, 10, com.itextpdf.text.Font.ITALIC);

            // Personal Information
            if (resume.getFullName() != null) {
                document.add(new com.itextpdf.text.Paragraph(resume.getFullName(), heading));
            }
            String contactInfo = (resume.getEmail() != null ? resume.getEmail() : "")
                    + (resume.getPhone() != null ? " | " + resume.getPhone() : "")
                    + (resume.getAddress() != null ? " | " + resume.getAddress() : "");
            if (!contactInfo.isBlank()) {
                document.add(new com.itextpdf.text.Paragraph(contactInfo, body));
            }
            String urls = (resume.getLinkedinUrl() != null ? "LinkedIn: " + resume.getLinkedinUrl() : "")
                    + (resume.getGithubUrl() != null ? " | GitHub: " + resume.getGithubUrl() : "")
                    + (resume.getPortfolioUrl() != null ? " | Portfolio: " + resume.getPortfolioUrl() : "");
            if (!urls.isBlank()) {
                document.add(new com.itextpdf.text.Paragraph(urls, bodyItalic));
            }
            document.add(new com.itextpdf.text.Paragraph(" "));

            // Professional Summary
            if (resume.getProfessionalSummary() != null && !resume.getProfessionalSummary().isBlank()) {
                document.add(new com.itextpdf.text.Paragraph("Professional Summary", section));
                document.add(new com.itextpdf.text.Paragraph(resume.getProfessionalSummary(), body));
                document.add(new com.itextpdf.text.Paragraph(" "));
            }

            // Career Objective
            if (resume.getCareerObjective() != null && !resume.getCareerObjective().isBlank()) {
                document.add(new com.itextpdf.text.Paragraph("Career Objective", section));
                document.add(new com.itextpdf.text.Paragraph(resume.getCareerObjective(), body));
                document.add(new com.itextpdf.text.Paragraph(" "));
            }

            // Education
            if (resume.getEducations() != null && !resume.getEducations().isEmpty()) {
                document.add(new com.itextpdf.text.Paragraph("Education", section));
                for (com.example.backend.entity.Education education : resume.getEducations()) {
                    document.add(new com.itextpdf.text.Paragraph(education.getDegree() + " — " + education.getInstitution(), body));
                    document.add(new com.itextpdf.text.Paragraph(education.getFieldOfStudy() + " | " + education.getStartDate() + " - " + education.getEndDate(), bodyItalic));
                    if (education.getDescription() != null && !education.getDescription().isBlank()) {
                        document.add(new com.itextpdf.text.Paragraph(education.getDescription(), body));
                    }
                    document.add(new com.itextpdf.text.Paragraph(" "));
                }
            }

            // Experience
            if (resume.getExperiences() != null && !resume.getExperiences().isEmpty()) {
                document.add(new com.itextpdf.text.Paragraph("Work Experience", section));
                for (com.example.backend.entity.Experience experience : resume.getExperiences()) {
                    document.add(new com.itextpdf.text.Paragraph(experience.getJobTitle() + " at " + experience.getCompanyName() + " (" + experience.getLocation() + ")", body));
                    document.add(new com.itextpdf.text.Paragraph(experience.getStartDate() + " - " + experience.getEndDate(), bodyItalic));
                    if (experience.getDescription() != null && !experience.getDescription().isBlank()) {
                        document.add(new com.itextpdf.text.Paragraph(experience.getDescription(), body));
                    }
                    document.add(new com.itextpdf.text.Paragraph(" "));
                }
            }

            // Projects
            if (resume.getProjects() != null && !resume.getProjects().isEmpty()) {
                document.add(new com.itextpdf.text.Paragraph("Projects", section));
                for (com.example.backend.entity.Project project : resume.getProjects()) {
                    String titleStr = project.getProjectName()
                            + (project.getProjectUrl() != null && !project.getProjectUrl().isBlank() ? " (" + project.getProjectUrl() + ")" : "");
                    document.add(new com.itextpdf.text.Paragraph(titleStr, body));
                    document.add(new com.itextpdf.text.Paragraph("Tech: " + project.getTechnologiesUsed() + " | " + project.getStartDate() + " - " + project.getEndDate(), bodyItalic));
                    if (project.getDescription() != null && !project.getDescription().isBlank()) {
                        document.add(new com.itextpdf.text.Paragraph(project.getDescription(), body));
                    }
                    document.add(new com.itextpdf.text.Paragraph(" "));
                }
            }

            // Skills
            if (resume.getSkills() != null && !resume.getSkills().isEmpty()) {
                document.add(new com.itextpdf.text.Paragraph("Skills", section));
                String skillsStr = resume.getSkills().stream()
                        .map(s -> s.getSkillName() + " (" + (s.getProficiencyLevel() != null ? s.getProficiencyLevel() : "Intermediate") + ")")
                        .collect(java.util.stream.Collectors.joining(", "));
                document.add(new com.itextpdf.text.Paragraph(skillsStr, body));
                document.add(new com.itextpdf.text.Paragraph(" "));
            }

            // Certifications
            if (resume.getCertifications() != null && !resume.getCertifications().isEmpty()) {
                document.add(new com.itextpdf.text.Paragraph("Certifications", section));
                for (com.example.backend.entity.Certification cert : resume.getCertifications()) {
                    document.add(new com.itextpdf.text.Paragraph(cert.getCertificationName() + " — " + cert.getIssuingOrganization(), body));
                    String certDates = "Issued: " + cert.getIssueDate() + (cert.getExpiryDate() != null ? " | Expires: " + cert.getExpiryDate() : "");
                    document.add(new com.itextpdf.text.Paragraph(certDates, bodyItalic));
                    document.add(new com.itextpdf.text.Paragraph(" "));
                }
            }

            // Achievements
            if (resume.getAchievements() != null && !resume.getAchievements().isEmpty()) {
                document.add(new com.itextpdf.text.Paragraph("Achievements", section));
                for (com.example.backend.entity.Achievement ach : resume.getAchievements()) {
                    document.add(new com.itextpdf.text.Paragraph(ach.getTitle() + ": " + ach.getDescription(), body));
                }
                document.add(new com.itextpdf.text.Paragraph(" "));
            }

            // Languages, Interests, References
            if (resume.getLanguages() != null && !resume.getLanguages().isBlank()) {
                document.add(new com.itextpdf.text.Paragraph("Languages", section));
                document.add(new com.itextpdf.text.Paragraph(resume.getLanguages(), body));
                document.add(new com.itextpdf.text.Paragraph(" "));
            }

            if (resume.getInterests() != null && !resume.getInterests().isBlank()) {
                document.add(new com.itextpdf.text.Paragraph("Interests", section));
                document.add(new com.itextpdf.text.Paragraph(resume.getInterests(), body));
                document.add(new com.itextpdf.text.Paragraph(" "));
            }

            if (resume.getReferencesInfo() != null && !resume.getReferencesInfo().isBlank()) {
                document.add(new com.itextpdf.text.Paragraph("References", section));
                document.add(new com.itextpdf.text.Paragraph(resume.getReferencesInfo(), body));
                document.add(new com.itextpdf.text.Paragraph(" "));
            }

            document.close();
            return output.toByteArray();
        } catch (com.itextpdf.text.DocumentException e) {
            throw new IOException("Unable to generate PDF", e);
        }
    }
}
