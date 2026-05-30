package com.example.backend.payload.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserProfileUpdateRequest(
        @NotBlank(message = "Full name is required")
        @Size(max = 100)
        String fullName,
        
        String phone,
        String bio,
        
        @jakarta.validation.constraints.Pattern(regexp = "^$|^(https?://).*", message = "LinkedIn URL must start with http:// or https://")
        String linkedinUrl,
        
        @jakarta.validation.constraints.Pattern(regexp = "^$|^(https?://).*", message = "GitHub URL must start with http:// or https://")
        String githubUrl,
        
        @jakarta.validation.constraints.Pattern(regexp = "^$|^(https?://).*", message = "LeetCode URL must start with http:// or https://")
        String leetcodeUrl,
        
        @jakarta.validation.constraints.Pattern(regexp = "^$|^(https?://).*", message = "Portfolio URL must start with http:// or https://")
        String portfolioUrl,
        
        String profilePhoto,
        String courses,
        Boolean notificationEmail
) {
}
