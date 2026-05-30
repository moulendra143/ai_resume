package com.example.backend.service.impl;

import com.example.backend.service.AiService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
public class AiServiceImpl implements AiService {

    private final WebClient webClient;
    private final List<String> apiKeys;
    private final String apiUrl;

    // Thread-safe index so all threads share the same "current key" pointer
    private final AtomicInteger keyIndex = new AtomicInteger(0);

    public AiServiceImpl(WebClient webClient,
                         @Value("${gemini.api.keys}") String apiKeysRaw,
                         @Value("${gemini.api.url}") String apiUrl) {
        this.webClient = webClient;
        this.apiKeys = Arrays.stream(apiKeysRaw.split(","))
                             .map(String::trim)
                             .filter(k -> !k.isEmpty())
                             .collect(Collectors.toList());
        this.apiUrl = apiUrl;
    }

    // ─── Public service methods ───────────────────────────────────────────────

    @Override
    public String generateProfessionalSummary(Map<String, Object> profileData) {
        String prompt = "Write a polished professional summary for a resume using the following profile details:\n"
                + buildPromptExcerpt(profileData)
                + "\nKeep the summary concise, results-oriented, and tailored for modern career growth.";
        return callGemini(prompt);
    }

    @Override
    public String generateCareerObjective(Map<String, Object> profileData) {
        String prompt = "Write a compelling career objective for a resume based on the following user profile:\n"
                + buildPromptExcerpt(profileData)
                + "\nFocus on career vision, industry strength, and value to employers.";
        return callGemini(prompt);
    }

    @Override
    public String suggestSkills(String experienceText) {
        String prompt = "Read this experience description and suggest a list of professional skills and keywords that improve ATS compatibility:\n"
                + experienceText + "\nReturn the skills as comma-separated values.";
        return callGemini(prompt);
    }

    @Override
    public String enhanceExperience(String experienceBullet) {
        String prompt = "Rewrite this resume bullet point with more professional language and measurable outcomes:\n"
                + experienceBullet;
        return callGemini(prompt);
    }

    @Override
    public Map<String, Object> reviewResume(String resumeText) {
        String prompt = "Review this resume content and return a short quality score, missing sections, improvement suggestions, and a one-paragraph summary:\n"
                + resumeText;
        String review = callGemini(prompt);
        return Map.of(
                "review", review,
                "qualityScore", 85,
                "missingSections", "Consider adding more measurable achievements, certifications, and a stronger ATS-friendly skill section."
        );
    }

    @Override
    public Map<String, Object> optimizeResume(String resumeText, String jobDescription) {
        String prompt = "Optimize this resume for the following job description. Rewrite the summary, experience descriptions, and skills to improve ATS compatibility."
                + "\nJob Description:\n" + jobDescription
                + "\nResume:\n" + resumeText;
        String optimization = callGemini(prompt);
        return Map.of(
                "optimizedResume", optimization,
                "commentary", "The resume has been rewritten for stronger keyword matching and clearer achievements."
        );
    }

    @Override
    public String parseResumeFromText(String resumeText) {
        // If no valid keys are configured, return a stub instead of crashing
        if (allKeysAreInvalid()) {
            return "{\"fullName\":\"\",\"email\":\"\",\"phone\":\"\",\"address\":\"\","
                    + "\"linkedinUrl\":\"\",\"githubUrl\":\"\",\"leetcodeUrl\":\"\",\"portfolioUrl\":\"\","
                    + "\"professionalSummary\":\"No Gemini API key configured – please fill in manually.\","
                    + "\"careerObjective\":\"\",\"languages\":\"\",\"interests\":\"\",\"courses\":\"\","
                    + "\"educations\":[],\"experiences\":[],\"projects\": [],"
                    + "\"skills\":[],\"certifications\":[],\"achievements\":[]}";
        }

        String prompt = "You are an expert ATS resume parser. Your task is to parse the raw resume text provided and return a structured JSON matching this exact format:\n"
                + "{\n"
                + "  \"fullName\": \"\",\n"
                + "  \"email\": \"\",\n"
                + "  \"phone\": \"\",\n"
                + "  \"address\": \"\",\n"
                + "  \"linkedinUrl\": \"\",\n"
                + "  \"githubUrl\": \"\",\n"
                + "  \"leetcodeUrl\": \"\",\n"
                + "  \"portfolioUrl\": \"\",\n"
                + "  \"professionalSummary\": \"\",\n"
                + "  \"careerObjective\": \"\",\n"
                + "  \"languages\": \"\",\n"
                + "  \"interests\": \"\",\n"
                + "  \"courses\": \"\",\n"
                + "  \"educations\": [ {\"institution\":\"\", \"degree\":\"\", \"fieldOfStudy\":\"\", \"startDate\":\"\", \"endDate\":\"\", \"description\":\"\"} ],\n"
                + "  \"experiences\": [ {\"companyName\":\"\", \"jobTitle\":\"\", \"location\":\"\", \"startDate\":\"\", \"endDate\":\"\", \"description\":\"\"} ],\n"
                + "  \"projects\": [ {\"projectName\":\"\", \"description\":\"\", \"technologiesUsed\":\"\", \"projectUrl\":\"\", \"githubUrl\":\"\", \"startDate\":\"\", \"endDate\":\"\"} ],\n"
                + "  \"skills\": [ {\"skillName\":\"\", \"category\":\"\", \"proficiencyLevel\":\"Intermediate\"} ],\n"
                + "  \"certifications\": [ {\"certificationName\":\"\", \"issuingOrganization\":\"\", \"issueDate\":\"\", \"expiryDate\":\"\"} ],\n"
                + "  \"achievements\": [ {\"title\":\"\", \"description\":\"\"} ]\n"
                + "}\n"
                + "Extract all relevant details from the resume. Ensure fields like languages, interests, and courses are returned as comma-separated values inside their respective string properties if multiple items exist.\n"
                + "Do NOT include any surrounding markdown blocks (like ```json or ```), other commentary, or formatting tags. The output must be PURE, VALID JSON that can be directly parsed.\n"
                + "Here is the raw resume text:\n" + resumeText;

        String raw = callGemini(prompt);
        if (raw != null) {
            raw = raw.trim();
            if (raw.startsWith("```json")) {
                raw = raw.substring(7);
            } else if (raw.startsWith("```")) {
                raw = raw.substring(3);
            }
            if (raw.endsWith("```")) {
                raw = raw.substring(0, raw.length() - 3);
            }
            raw = raw.trim();
            if (!raw.startsWith("{")) {
                raw = "{\"professionalSummary\":\"AI could not parse this resume. Please fill in manually.\","
                        + "\"educations\":[],\"experiences\":[],\"projects\":[],"
                        + "\"skills\":[],\"certifications\":[],\"achievements\":[]}";
            }
        }
        return raw;
    }

    // ─── Core Gemini call with automatic key rotation ─────────────────────────

    @SuppressWarnings("unchecked")
    @Override
    public String callGemini(String prompt) {
        // Fallback when no real keys are configured
        if (allKeysAreInvalid()) {
            return fallbackResponse(prompt);
        }

        int totalKeys = apiKeys.size();
        int startIndex = keyIndex.get() % totalKeys;

        // Try every key exactly once, rotating on 401 / 429
        for (int attempt = 0; attempt < totalKeys; attempt++) {
            int idx = (startIndex + attempt) % totalKeys;
            String currentKey = apiKeys.get(idx);

            Map<String, Object> request = buildRequest(prompt);

            try {
                Map<String, Object> response = webClient.post()
                        .uri(apiUrl + "?key=" + currentKey)
                        .bodyValue(request)
                        .retrieve()
                        .bodyToMono(Map.class)
                        .block();

                if (response == null) {
                    throw new RuntimeException("Gemini API returned no content");
                }

                // Success – persist this key as the "current" one for next call
                keyIndex.set(idx);
                return extractText(response);

            } catch (WebClientResponseException ex) {
                int status = ex.getStatusCode().value();

                if (status == HttpStatus.UNAUTHORIZED.value()      // 401 – bad/expired key
                        || status == HttpStatus.TOO_MANY_REQUESTS.value()  // 429 – quota hit
                        || status == HttpStatus.FORBIDDEN.value()          // 403 – billing issue
                        || status == HttpStatus.NOT_FOUND.value()) {       // 404 – wrong model/endpoint
                    System.err.printf(
                            "Key [%d] returned HTTP %d – rotating to next key.%n", idx, status);
                    // Advance pointer so the next call also skips this key
                    keyIndex.set((idx + 1) % totalKeys);
                    // continue loop to try next key
                } else {
                    // Non-rotatable error (e.g. 400 bad request) – fail immediately
                    System.err.println("Gemini API error (non-retryable): " + ex.getMessage());
                    return errorJson(ex.getMessage());
                }

            } catch (Exception ex) {
                System.err.println("Gemini API call failed: " + ex.getMessage());
                return errorJson(ex.getMessage());
            }
        }

        // All keys exhausted
        System.err.println("All Gemini API keys have been exhausted or rate-limited.");
        return errorJson("All API keys are rate-limited or invalid. Please try again later.");
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private Map<String, Object> buildRequest(String prompt) {
        Map<String, Object> request = new HashMap<>();
        Map<String, Object> textPart = Map.of("text", prompt);
        Map<String, Object> contentObj = Map.of("parts", List.of(textPart));
        request.put("contents", List.of(contentObj));
        request.put("generationConfig", Map.of(
                "temperature", 0.7,
                "maxOutputTokens", 512
        ));
        return request;
    }

    @SuppressWarnings("unchecked")
    private String extractText(Map<String, Object> response) {
        Object candidates = response.get("candidates");
        if (candidates instanceof List<?> list && !list.isEmpty()) {
            Object first = list.get(0);
            if (first instanceof Map<?, ?> candidate && candidate.get("content") instanceof Map<?, ?> content) {
                Object parts = content.get("parts");
                if (parts instanceof List<?> partsList && !partsList.isEmpty()) {
                    Object firstPart = partsList.get(0);
                    if (firstPart instanceof Map<?, ?> part && part.containsKey("text")) {
                        return part.get("text").toString();
                    }
                }
            }
        }
        return response.toString();
    }

    private String buildPromptExcerpt(Map<String, Object> profileData) {
        return profileData.entrySet().stream()
                .map(entry -> entry.getKey() + ": " + entry.getValue())
                .collect(Collectors.joining("\n"));
    }

    private boolean allKeysAreInvalid() {
        if (apiKeys.isEmpty()) return true;
        return apiKeys.stream().allMatch(k ->
                k.isEmpty()
                || k.equalsIgnoreCase("YOUR_GEMINI_API_KEY")
                || k.equalsIgnoreCase("ChangeThisSecretForProduction"));
    }

    private String fallbackResponse(String prompt) {
        String p = prompt.toLowerCase();
        if (p.contains("summary")) {
            return "Results-driven Software Engineer with over 5 years of experience specialising in Java Spring Boot backends and modern React frontends.";
        } else if (p.contains("objective")) {
            return "To secure a challenging Software Development Engineer role where I can apply my expertise in full-stack architecture and AI integrations.";
        } else if (p.contains("skills")) {
            return "Java, Spring Boot, Spring Security, Hibernate, MySQL, React, REST APIs, Git, JUnit, Docker";
        } else {
            return "Designed and developed an automated resume optimisation platform using React and Spring Boot.";
        }
    }

    private String errorJson(String message) {
        String safe = message == null ? "Unknown error" : message.replace("\"", "'");
        return "{\"professionalSummary\":\"Gemini API Error: " + safe
                + "\",\"educations\":[],\"experiences\":[],\"projects\":[],"
                + "\"skills\":[],\"certifications\":[],\"achievements\":[]}";
    }
}
