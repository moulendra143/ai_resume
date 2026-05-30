package com.example.backend.service;

import com.example.backend.entity.ATSAnalysis;

import java.io.File;

public interface ATSAnalyzerService {
    ATSAnalysis analyzeResumeText(String jobDescription, String resumeText);
    ATSAnalysis analyzeResumeFile(File file, String jobDescription);
    String improveResumeText(String resumeText, java.util.List<String> missingKeywords);
}
