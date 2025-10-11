package com.yourorg.logistics.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Entity
@Table(name="vehicles", indexes = {
  @Index(name="idx_plate", columnList="plate", unique = true),
  @Index(name="idx_vehicle_status", columnList="status")
})
public class Vehicle {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotBlank @Size(max=15) @Column(nullable=false, unique=true)
  private String plate;

  @NotBlank @Size(max=80) private String model;
  @NotNull @Min(1900) @Max(2100) private Integer year;
  @NotBlank @Size(max=20) private String type;
  @NotBlank @Size(max=20) private String status;
  @Positive private Double capacityKg;

  @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="driver_id")
  private Driver assignedDriver;

  private LocalDate lastServiceAt;

  public Long getId(){return id;} public void setId(Long id){this.id=id;}
  public String getPlate(){return plate;} public void setPlate(String v){this.plate=v;}
  public String getModel(){return model;} public void setModel(String v){this.model=v;}
  public Integer getYear(){return year;} public void setYear(Integer v){this.year=v;}
  public String getType(){return type;} public void setType(String v){this.type=v;}
  public String getStatus(){return status;} public void setStatus(String v){this.status=v;}
  public Double getCapacityKg(){return capacityKg;} public void setCapacityKg(Double v){this.capacityKg=v;}
  public Driver getAssignedDriver(){return assignedDriver;} public void setAssignedDriver(Driver v){this.assignedDriver=v;}
  public LocalDate getLastServiceAt(){return lastServiceAt;} public void setLastServiceAt(LocalDate v){this.lastServiceAt=v;}
}
