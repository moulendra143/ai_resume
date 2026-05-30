package com.example.backend.service.impl;

import com.example.backend.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final String fromAddress;

    public EmailServiceImpl(JavaMailSender mailSender,
                            @Value("${spring.mail.username}") String fromAddress) {
        this.mailSender = mailSender;
        this.fromAddress = fromAddress;
    }

    @Override
    public void sendWelcomeEmail(String to, String name) {
        String subject = "Welcome to AI Resume Builder & ATS Analyzer";
        String content = "<h2>Welcome, " + name + "!</h2>"
                + "<p>Your account is ready. Start building your AI-powered resume and analyzing job matches today.</p>"
                + "<p>If you need help, reply to this email and our support team will assist you.</p>";
        sendHtmlMessage(to, subject, content);
    }

    @Override
    public void sendOtpEmail(String to, String code, String purpose) {
        String subject = switch (purpose) {
            case "PASSWORD_RESET" -> "Your Password Reset Code";
            case "EMAIL_VERIFICATION" -> "Verify Your Email Address";
            default -> "Your Verification Code";
        };
        String description = switch (purpose) {
            case "PASSWORD_RESET" -> "Use the code below to reset your password.";
            case "EMAIL_VERIFICATION" -> "Enter this code to verify your email address.";
            default -> "Use this code to complete your request.";
        };
        String content = "<div style=\"font-family:Arial,sans-serif;color:#111;\">"
                + "<h2>" + subject + "</h2>"
                + "<p>" + description + "</p>"
                + "<div style=\"font-size:24px;font-weight:bold;padding:16px;background:#f4f4f4;border-radius:12px;display:inline-block;\">" + code + "</div>"
                + "<p>This code expires in 10 minutes.</p>"
                + "</div>";
        sendHtmlMessage(to, subject, content);
    }

    @Override
    public void sendPasswordResetNotification(String to, String name) {
        String subject = "Your password has been reset";
        String content = "<h2>Hello " + name + ",</h2>"
                + "<p>Your password was successfully reset. If you did not request this change, please contact support immediately.</p>";
        sendHtmlMessage(to, subject, content);
    }

    private void sendHtmlMessage(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("WARNING: Unable to send email to " + to + " (subject: " + subject + "). Error: " + e.getMessage());
        }
    }
}
