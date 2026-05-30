package com.example.backend.repository;

import com.example.backend.entity.OTPVerification;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OTPVerificationRepository extends JpaRepository<OTPVerification, Long> {
    Optional<OTPVerification> findByUserAndCodeAndPurpose(User user, String code, OTPVerification.OTPPurpose purpose);
    Optional<OTPVerification> findFirstByUserAndPurposeOrderByCreatedAtDesc(User user, OTPVerification.OTPPurpose purpose);
}
