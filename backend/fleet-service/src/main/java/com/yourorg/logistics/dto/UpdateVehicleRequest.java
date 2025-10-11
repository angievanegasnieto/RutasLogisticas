package com.yourorg.logistics.dto;
import jakarta.validation.constraints.*; import java.time.LocalDate;
public record UpdateVehicleRequest(
  @NotBlank @Size(max=80) String model,
  @NotNull @Min(1900) @Max(2100) Integer year,
  @NotBlank @Size(max=20) String type,
  @NotBlank @Size(max=20) String status,
  @Positive Double capacityKg,
  LocalDate lastServiceAt,
  Long assignedDriverId
) {}
