package com.yourorg.logistics.dto;
import jakarta.validation.constraints.*; import java.time.LocalDate;
public record CreateDriverRequest(
  @NotBlank @Size(max=120) String fullName,
  @NotBlank @Size(max=50) String licenseNumber,
  @PastOrPresent LocalDate licenseIssuedAt,
  @Future LocalDate licenseExpiresAt,
  @NotBlank @Size(max=30) String phone,
  @Email @Size(max=120) String email
) {}
