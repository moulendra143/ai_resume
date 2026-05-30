package com.example.backend.service;

import com.example.backend.entity.User;
import com.example.backend.payload.response.MessageResponse;

import java.util.Map;

import com.example.backend.payload.user.UserProfileUpdateRequest;

public interface UserService {
    User getCurrentUser();
    User updateProfile(UserProfileUpdateRequest request);
    String changePassword(String email, String oldPassword, String newPassword);
    Map<String, Object> buildDashboardMetrics();
    void deleteCurrentUserAccount();
}

