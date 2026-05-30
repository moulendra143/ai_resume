package com.example.backend.service.impl;

import com.example.backend.entity.OTPVerification;
import com.example.backend.entity.RefreshToken;
import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.exception.BadRequestException;
import com.example.backend.payload.auth.*;
import com.example.backend.payload.auth.AuthResponse;
import com.example.backend.payload.response.MessageResponse;
import com.example.backend.repository.OTPVerificationRepository;
import com.example.backend.repository.RefreshTokenRepository;
import com.example.backend.repository.RoleRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.JwtTokenProvider;
import com.example.backend.security.CustomUserDetails;
import com.example.backend.service.AuthService;
import com.example.backend.service.EmailService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenRepository refreshTokenRepository;
    private final OTPVerificationRepository otpVerificationRepository;
    private final EmailService emailService;
    private final long refreshTokenDurationMs;

    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           UserRepository userRepository,
                           RoleRepository roleRepository,
                           PasswordEncoder passwordEncoder,
                           JwtTokenProvider jwtTokenProvider,
                           RefreshTokenRepository refreshTokenRepository,
                           OTPVerificationRepository otpVerificationRepository,
                           EmailService emailService,
                           @org.springframework.beans.factory.annotation.Value("${app.jwt.refresh-expiration}") long refreshTokenDurationMs) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.refreshTokenRepository = refreshTokenRepository;
        this.otpVerificationRepository = otpVerificationRepository;
        this.emailService = emailService;
        this.refreshTokenDurationMs = refreshTokenDurationMs;
    }

    @Override
    public MessageResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email is already registered");
        }
        if (!request.password().equals(request.confirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }

        Role userRole = roleRepository.findByName(Role.ERole.ROLE_USER)
                .orElseGet(() -> roleRepository.save(new Role(null, Role.ERole.ROLE_USER)));

        Set<Role> roles = new HashSet<>();
        roles.add(userRole);

        User user = User.builder()
                .fullName(request.fullName())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .isEmailVerified(false)
                .isActive(true)
                .roles(roles)
                .build();

        userRepository.save(user);
        String otpCode = generateOtpCode();
        OTPVerification verification = OTPVerification.builder()
                .user(user)
                .code(otpCode)
                .purpose(OTPVerification.OTPPurpose.EMAIL_VERIFICATION)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .build();
        otpVerificationRepository.save(verification);
        emailService.sendOtpEmail(user.getEmail(), otpCode, "EMAIL_VERIFICATION");
        emailService.sendWelcomeEmail(user.getEmail(), user.getFullName());
        return new MessageResponse("Account created. Please verify your email using the code sent to your inbox.");
    }

    @Override
    public AuthResponse authenticate(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email(), request.password()));
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            User user = userRepository.findByEmail(userDetails.getEmail())
                    .orElseThrow(() -> new BadRequestException("User not found"));

            // Block login if email has not been verified yet
            if (!Boolean.TRUE.equals(user.getIsEmailVerified())) {
                throw new BadRequestException("Please verify your email before logging in. Check your inbox for the verification code.");
            }

            String accessToken = jwtTokenProvider.generateAccessToken(authentication);
            String refreshToken = jwtTokenProvider.generateRefreshToken(authentication);
            refreshTokenRepository.save(RefreshToken.builder()
                    .user(user)
                    .token(refreshToken)
                    .expiresAt(LocalDateTime.now().plus(Duration.ofMillis(refreshTokenDurationMs)))
                    .revoked(false)
                    .build());
            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);

            java.util.List<String> rolesList = user.getRoles().stream()
                    .map(role -> role.getName().name())
                    .collect(java.util.stream.Collectors.toList());

            return new AuthResponse(accessToken, refreshToken, "Bearer", jwtTokenProvider.getJwtExpirationMs(), user.getEmail(), user.getFullName(), rolesList);
        } catch (BadCredentialsException ex) {
            throw new BadRequestException("Invalid credentials");
        }
    }

    @Override
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken token = refreshTokenRepository.findByToken(request.refreshToken())
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));
        if (token.getRevoked() || token.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Refresh token expired or revoked");
        }
        User user = token.getUser();
        String roles = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(java.util.stream.Collectors.joining(","));
        String accessToken = jwtTokenProvider.generateAccessToken(user.getEmail(), roles);
        java.util.List<String> rolesList = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(java.util.stream.Collectors.toList());
        return new AuthResponse(accessToken, token.getToken(), "Bearer", jwtTokenProvider.getJwtExpirationMs(), user.getEmail(), user.getFullName(), rolesList);
    }

    @Override
    public MessageResponse verifyEmail(VerifyEmailRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadRequestException("User not found"));
        OTPVerification verification = otpVerificationRepository
                .findByUserAndCodeAndPurpose(user, request.code(), OTPVerification.OTPPurpose.EMAIL_VERIFICATION)
                .orElseThrow(() -> new BadRequestException("Invalid verification code"));
        if (verification.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Verification code expired");
        }
        verification.setIsVerified(true);
        otpVerificationRepository.save(verification);
        user.setIsEmailVerified(true);
        userRepository.save(user);
        return new MessageResponse("Email successfully verified.");
    }

    @Override
    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadRequestException("User not found"));
        String otpCode = generateOtpCode();
        OTPVerification verification = OTPVerification.builder()
                .user(user)
                .code(otpCode)
                .purpose(OTPVerification.OTPPurpose.PASSWORD_RESET)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .build();
        otpVerificationRepository.save(verification);
        emailService.sendOtpEmail(user.getEmail(), otpCode, "PASSWORD_RESET");
        return new MessageResponse("Password reset code sent to your email.");
    }

    @Override
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new BadRequestException("Passwords do not match");
        }
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadRequestException("User not found"));
        OTPVerification verification = otpVerificationRepository
                .findByUserAndCodeAndPurpose(user, request.otp(), OTPVerification.OTPPurpose.PASSWORD_RESET)
                .orElseThrow(() -> new BadRequestException("Invalid OTP"));
        if (verification.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP has expired");
        }
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        emailService.sendPasswordResetNotification(user.getEmail(), user.getFullName());
        return new MessageResponse("Password reset successfully.");
    }

    @Override
    public void logout(String refreshToken) {
        Optional<RefreshToken> token = refreshTokenRepository.findByToken(refreshToken);
        token.ifPresent(t -> {
            t.setRevoked(true);
            refreshTokenRepository.save(t);
        });
    }

    @Override
    public MessageResponse resendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
        if (Boolean.TRUE.equals(user.getIsEmailVerified())) {
            throw new BadRequestException("Email is already verified");
        }
        String otpCode = generateOtpCode();
        OTPVerification verification = OTPVerification.builder()
                .user(user)
                .code(otpCode)
                .purpose(OTPVerification.OTPPurpose.EMAIL_VERIFICATION)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .build();
        otpVerificationRepository.save(verification);
        emailService.sendOtpEmail(user.getEmail(), otpCode, "EMAIL_VERIFICATION");
        return new MessageResponse("A new verification code has been sent to your email.");
    }

    private String generateOtpCode() {
        int random = (int) ((Math.random() * 900000) + 100000);
        return String.valueOf(random);
    }
}
