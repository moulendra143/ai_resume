package com.example.backend.repository;

import com.example.backend.entity.Education;
import com.example.backend.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EducationRepository extends JpaRepository<Education, Long> {
    List<Education> findByResumeOrderByStartDateDesc(Resume resume);
}
