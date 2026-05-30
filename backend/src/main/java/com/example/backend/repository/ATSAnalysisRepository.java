package com.example.backend.repository;

import com.example.backend.entity.ATSAnalysis;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ATSAnalysisRepository extends JpaRepository<ATSAnalysis, Long> {
    List<ATSAnalysis> findByUserOrderByCreatedAtDesc(User user);
}
