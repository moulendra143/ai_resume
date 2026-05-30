package com.example.backend.service;

public interface EmailService {
    void sendWelcomeEmail(String to, String name);
    void sendOtpEmail(String to, String code, String purpose);
    void sendPasswordResetNotification(String to, String name);
}
