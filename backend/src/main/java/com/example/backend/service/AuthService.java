package com.example.backend.service;

import com.example.backend.payload.auth.*;
import com.example.backend.payload.response.MessageResponse;
import org.springframework.security.core.Authentication;

public interface AuthService {
    MessageResponse register(RegisterRequest request);
    AuthResponse authenticate(LoginRequest request);
    AuthResponse refreshToken(RefreshTokenRequest request);
    MessageResponse verifyEmail(VerifyEmailRequest request);
    MessageResponse resendOtp(String email);
    MessageResponse forgotPassword(ForgotPasswordRequest request);
    MessageResponse resetPassword(ResetPasswordRequest request);
    void logout(String refreshToken);
}
