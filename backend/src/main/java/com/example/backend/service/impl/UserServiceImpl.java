package com.example.backend.service.impl;

import com.example.backend.entity.User;
import com.example.backend.exception.BadRequestException;
import com.example.backend.repository.ATSAnalysisRepository;
import com.example.backend.repository.ActivityLogRepository;
import com.example.backend.repository.ResumeRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.security.CustomUserDetails;
import com.example.backend.service.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.backend.payload.user.UserProfileUpdateRequest;

import java.util.HashMap;
import java.util.Map;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;
    private final ATSAnalysisRepository atsAnalysisRepository;
    private final ActivityLogRepository activityLogRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository,
                           ResumeRepository resumeRepository,
                           ATSAnalysisRepository atsAnalysisRepository,
                           ActivityLogRepository activityLogRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.resumeRepository = resumeRepository;
        this.atsAnalysisRepository = atsAnalysisRepository;
        this.activityLogRepository = activityLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof CustomUserDetails details)) {
            throw new BadRequestException("Unable to find authenticated user");
        }
        return userRepository.findByEmail(details.getEmail())
                .orElseThrow(() -> new BadRequestException("Authenticated user not found"));
    }

    @Override
    public User updateProfile(UserProfileUpdateRequest profile) {
        User current = getCurrentUser();
        current.setFullName(profile.fullName());
        current.setPhone(profile.phone());
        current.setBio(profile.bio());
        current.setLinkedinUrl(profile.linkedinUrl());
        current.setGithubUrl(profile.githubUrl());
        current.setLeetcodeUrl(profile.leetcodeUrl());
        current.setPortfolioUrl(profile.portfolioUrl());
        current.setProfilePhoto(profile.profilePhoto());
        current.setCourses(profile.courses());
        if (profile.notificationEmail() != null) {
            current.setNotificationEmail(profile.notificationEmail());
        }
        return userRepository.save(current);
    }

    @Override
    public Map<String, Object> buildDashboardMetrics() {
        User current = getCurrentUser();
        long totalResumes = resumeRepository.findByUserOrderByUpdatedAtDesc(current).size();
        long totalAnalyses = atsAnalysisRepository.findByUserOrderByCreatedAtDesc(current).size();
        long downloads = resumeRepository.findByUserOrderByUpdatedAtDesc(current).stream().mapToLong(resume -> resume.getDownloadCount() == null ? 0 : resume.getDownloadCount()).sum();
        long activities = activityLogRepository.findByUserOrderByCreatedAtDesc(current).size();

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalResumes", totalResumes);
        metrics.put("totalAnalyses", totalAnalyses);
        metrics.put("resumeDownloads", downloads);
        metrics.put("activityHistory", activities);
        metrics.put("profileCompletion", calculateProfileCompletion(current));
        return metrics;
    }

    @Override
    public String changePassword(String email, String oldPassword, String newPassword) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new BadRequestException("Email not found"));
        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new BadRequestException("Old password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return "Password updated successfully";
    }

    @Override
    public void deleteCurrentUserAccount() {
        User current = getCurrentUser();
        userRepository.delete(current);
    }

    private int calculateProfileCompletion(User user) {
        int score = 0;
        if (user.getFullName() != null && !user.getFullName().isBlank()) score += 15;
        if (user.getPhone() != null && !user.getPhone().isBlank()) score += 10;
        if (user.getLinkedinUrl() != null && !user.getLinkedinUrl().isBlank()) score += 10;
        if (user.getGithubUrl() != null && !user.getGithubUrl().isBlank()) score += 10;
        if (user.getLeetcodeUrl() != null && !user.getLeetcodeUrl().isBlank()) score += 10;
        if (user.getPortfolioUrl() != null && !user.getPortfolioUrl().isBlank()) score += 10;
        if (user.getBio() != null && !user.getBio().isBlank()) score += 15;
        if (user.getCourses() != null && !user.getCourses().isBlank()) score += 20;
        return Math.min(score, 100);
    }
}
