package com.example.backend.service;

import java.io.File;

public interface FileProcessingService {
    String extractTextFromPdf(File file);
    String extractTextFromDocx(File file);
}
