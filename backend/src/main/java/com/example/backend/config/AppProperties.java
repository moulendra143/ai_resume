package com.example.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    private String uploadDir = "uploads";
    private String frontendUrl = "http://localhost:5173";
    private int otpExpiryMinutes = 10;
    private JwtProperties jwt = new JwtProperties();
    private GeminiProperties gemini = new GeminiProperties();

    @Data
    public static class JwtProperties {
        private String secret = "ChangeThisSecretForProduction";
        private long expiration = 86400000L;
        private long refreshExpiration = 604800000L;
    }

    @Data
    public static class GeminiProperties {
        private String apiKey;
        private String apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
    }
}
