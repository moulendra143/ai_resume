package com.example.backend.controller;

import com.example.backend.service.AiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/summary")
    public ResponseEntity<Map<String, String>> generateSummary(@RequestBody Map<String, Object> profileData) {
        return ResponseEntity.ok(Map.of("summary", aiService.generateProfessionalSummary(profileData)));
    }

    @PostMapping("/objective")
    public ResponseEntity<Map<String, String>> generateObjective(@RequestBody Map<String, Object> profileData) {
        return ResponseEntity.ok(Map.of("objective", aiService.generateCareerObjective(profileData)));
    }

    @PostMapping("/skills")
    public ResponseEntity<Map<String, String>> suggestSkills(@RequestBody Map<String, String> request) {
        return ResponseEntity.ok(Map.of("skills", aiService.suggestSkills(request.getOrDefault("experienceText", ""))));
    }

    @PostMapping("/experience/enhance")
    public ResponseEntity<Map<String, String>> enhanceExperience(@RequestBody Map<String, String> request) {
        return ResponseEntity.ok(Map.of("enhancedExperience", aiService.enhanceExperience(request.getOrDefault("experienceBullet", ""))));
    }

    @PostMapping("/review")
    public ResponseEntity<Map<String, Object>> reviewResume(@RequestBody Map<String, String> request) {
        return ResponseEntity.ok(aiService.reviewResume(request.getOrDefault("resumeText", "")));
    }

    @PostMapping("/optimize")
    public ResponseEntity<Map<String, Object>> optimizeResume(@RequestBody Map<String, String> request) {
        return ResponseEntity.ok(aiService.optimizeResume(request.getOrDefault("resumeText", ""), request.getOrDefault("jobDescription", "")));
    }
}
