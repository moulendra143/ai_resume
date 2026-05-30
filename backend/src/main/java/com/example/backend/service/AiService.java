package com.example.backend.service;

import java.util.Map;

public interface AiService {
    String generateProfessionalSummary(Map<String, Object> profileData);
    String generateCareerObjective(Map<String, Object> profileData);
    String suggestSkills(String experienceText);
    String enhanceExperience(String experienceBullet);
    Map<String, Object> reviewResume(String resumeText);
    Map<String, Object> optimizeResume(String resumeText, String jobDescription);
    String parseResumeFromText(String resumeText);
    String callGemini(String prompt);
}
