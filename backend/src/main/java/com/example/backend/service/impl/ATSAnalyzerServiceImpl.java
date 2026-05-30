package com.example.backend.service.impl;

import com.example.backend.entity.ATSAnalysis;
import com.example.backend.service.ATSAnalyzerService;
import com.example.backend.service.FileProcessingService;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ATSAnalyzerServiceImpl implements ATSAnalyzerService {

    private final FileProcessingService fileProcessingService;
    private final com.example.backend.repository.ATSAnalysisRepository atsAnalysisRepository;
    private final com.example.backend.service.UserService userService;
    private final com.example.backend.service.AiService aiService;

    public ATSAnalyzerServiceImpl(FileProcessingService fileProcessingService,
                                  com.example.backend.repository.ATSAnalysisRepository atsAnalysisRepository,
                                  com.example.backend.service.UserService userService,
                                  com.example.backend.service.AiService aiService) {
        this.fileProcessingService = fileProcessingService;
        this.atsAnalysisRepository = atsAnalysisRepository;
        this.userService = userService;
        this.aiService = aiService;
    }

    @Override
    public ATSAnalysis analyzeResumeText(String jobDescription, String resumeText) {
        Set<String> jobTokens = tokenize(jobDescription);
        Set<String> resumeTokens = tokenize(resumeText);

        int matched = (int) resumeTokens.stream().filter(jobTokens::contains).count();
        int total = Math.max(jobTokens.size(), 1);
        double matchPercentage = Math.min(100, Math.round((matched / (double) total) * 100));
        double atsScore = Math.round((matchPercentage * 0.8 + Math.min(100, resumeTokens.size() * 0.2)) * 100.0) / 100.0;

        Set<String> missingKeywords = jobTokens.stream()
                .filter(token -> !resumeTokens.contains(token))
                .limit(20)
                .collect(Collectors.toCollection(LinkedHashSet::new));

        String suggestedKeywords = missingKeywords.stream().limit(10).collect(Collectors.joining(", "));
        String matchingSkills = resumeTokens.stream().filter(jobTokens::contains).limit(20).collect(Collectors.joining(", "));
        String missingSkills = missingKeywords.stream().limit(10).collect(Collectors.joining(", "));

        double readiness = Math.max(0, matchPercentage - 5);

        ATSAnalysis analysis = ATSAnalysis.builder()
                .user(userService.getCurrentUser())
                .jobDescription(jobDescription)
                .resumeText(resumeText)
                .matchPercentage(matchPercentage)
                .atsScore(atsScore)
                .matchingSkills(matchingSkills)
                .missingSkills(missingSkills)
                .missingKeywords(suggestedKeywords)
                .suggestedKeywords(suggestedKeywords)
                .sectionFeedback("Add more measurable achievements, relevant keywords, and a skills section that mirrors the job description.")
                .hiringReadinessScore(readiness)
                .build();

        return atsAnalysisRepository.save(analysis);
    }

    @Override
    public ATSAnalysis analyzeResumeFile(File file, String jobDescription) {
        String content;
        String lowerName = file.getName().toLowerCase();
        if (lowerName.endsWith(".pdf")) {
            content = fileProcessingService.extractTextFromPdf(file);
        } else if (lowerName.endsWith(".docx")) {
            content = fileProcessingService.extractTextFromDocx(file);
        } else {
            throw new IllegalArgumentException("Unsupported file type: " + file.getName());
        }
        return analyzeResumeText(jobDescription, content);
    }

    private Set<String> tokenize(String text) {
        if (text == null || text.isBlank()) {
            return Set.of();
        }
        return Arrays.stream(text.toLowerCase().replaceAll("[^a-z0-9 ]", " ").split("\\s+"))
                .filter(token -> token.length() > 2)
                .collect(Collectors.toCollection(LinkedHashSet::new));
    }

    @Override
    public String improveResumeText(String resumeText, java.util.List<String> missingKeywords) {
        if (missingKeywords == null || missingKeywords.isEmpty()) {
            return resumeText;
        }
        String joinedKeywords = String.join(", ", missingKeywords);
        String prompt = "You are an expert ATS optimizer and resume writer. " +
                "I have a raw resume text below. It is missing the following important keywords: " + joinedKeywords + ". " +
                "Please rewrite the text to naturally integrate as many of these missing keywords as possible. " +
                "Do NOT invent new job titles or false experiences, just weave the keywords into existing descriptions or the skills section smoothly. " +
                "Return ONLY the updated raw resume text and nothing else, without markdown code block formatting.\n\n" +
                "Resume Text:\n" + resumeText;
        
        return aiService.callGemini(prompt);
    }
}
