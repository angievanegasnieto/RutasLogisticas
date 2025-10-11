package com.yourorg.logistics.dto;
import java.time.LocalDate;
public record DriverDTO(Long id, String fullName, String licenseNumber,
                        LocalDate licenseIssuedAt, LocalDate licenseExpiresAt,
                        String phone, String email) {}
