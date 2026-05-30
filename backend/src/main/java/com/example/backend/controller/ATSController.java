package com.example.backend.controller;

import com.example.backend.entity.ATSAnalysis;
import com.example.backend.payload.response.MessageResponse;
import com.example.backend.service.ATSAnalyzerService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import java.util.Map;

@RestController
@RequestMapping("/api/ats")
public class ATSController {

    private final ATSAnalyzerService atsAnalyzerService;

    public ATSController(ATSAnalyzerService atsAnalyzerService) {
        this.atsAnalyzerService = atsAnalyzerService;
    }

    @PostMapping("/analyze/text")
    public ResponseEntity<ATSAnalysis> analyzeText(@RequestBody Map<String, String> request) {
        String jobDescription = request.get("jobDescription");
        String resumeText = request.get("resumeText");
        return ResponseEntity.ok(atsAnalyzerService.analyzeResumeText(jobDescription, resumeText));
    }

    @PostMapping(value = "/analyze/file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ATSAnalysis> analyzeFile(@RequestParam MultipartFile file,
                                                   @RequestParam String jobDescription) throws IOException {
        Path tempFile = Files.createTempFile("resume-upload", file.getOriginalFilename());
        Files.write(tempFile, file.getBytes());
        ATSAnalysis analysis = atsAnalyzerService.analyzeResumeFile(tempFile.toFile(), jobDescription);
        Files.deleteIfExists(tempFile);
        return ResponseEntity.ok(analysis);
    }

    @PostMapping("/improve-text")
    public ResponseEntity<Map<String, String>> improveText(@RequestBody Map<String, Object> request) {
        String resumeText = (String) request.get("resumeText");
        @SuppressWarnings("unchecked")
        java.util.List<String> missingKeywords = (java.util.List<String>) request.get("missingKeywords");
        
        String improvedText = atsAnalyzerService.improveResumeText(resumeText, missingKeywords);
        return ResponseEntity.ok(Map.of("improvedText", improvedText));
    }

    @GetMapping("/ping")
    public ResponseEntity<MessageResponse> healthCheck() {
        return ResponseEntity.ok(new MessageResponse("ATS analyzer is available"));
    }
}
