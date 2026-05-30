package com.example.backend.repository;

import com.example.backend.entity.Experience;
import com.example.backend.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExperienceRepository extends JpaRepository<Experience, Long> {
    List<Experience> findByResumeOrderByStartDateDesc(Resume resume);
}
