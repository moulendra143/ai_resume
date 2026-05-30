package com.example.backend.payload.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record VerifyEmailRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Provide a valid email address")
        String email,

        @NotBlank(message = "Verification code is required")
        String code
) {
}
