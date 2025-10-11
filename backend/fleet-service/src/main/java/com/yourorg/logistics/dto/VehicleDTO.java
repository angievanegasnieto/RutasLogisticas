package com.yourorg.logistics.dto;
import java.time.LocalDate;
public record VehicleDTO(Long id, String plate, String model, Integer year,
                         String type, String status, Double capacityKg,
                         Long assignedDriverId, String assignedDriverName,
                         LocalDate lastServiceAt) {}
