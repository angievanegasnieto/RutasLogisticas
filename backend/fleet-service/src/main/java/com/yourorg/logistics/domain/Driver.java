package com.yourorg.logistics.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Entity
@Table(name = "drivers", indexes = {@Index(name="idx_driver_license", columnList = "licenseNumber", unique = true)})
public class Driver {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @NotBlank @Size(max=120)
  private String fullName;

  @NotBlank @Size(max=50)
  @Column(nullable=false, unique=true)
  private String licenseNumber;

  @PastOrPresent private LocalDate licenseIssuedAt;
  @Future private LocalDate licenseExpiresAt;

  @NotBlank @Size(max=30) private String phone;
  @Email @Size(max=120) private String email;

  public Long getId(){return id;} public void setId(Long id){this.id=id;}
  public String getFullName(){return fullName;} public void setFullName(String v){this.fullName=v;}
  public String getLicenseNumber(){return licenseNumber;} public void setLicenseNumber(String v){this.licenseNumber=v;}
  public LocalDate getLicenseIssuedAt(){return licenseIssuedAt;} public void setLicenseIssuedAt(LocalDate v){this.licenseIssuedAt=v;}
  public LocalDate getLicenseExpiresAt(){return licenseExpiresAt;} public void setLicenseExpiresAt(LocalDate v){this.licenseExpiresAt=v;}
  public String getPhone(){return phone;} public void setPhone(String v){this.phone=v;}
  public String getEmail(){return email;} public void setEmail(String v){this.email=v;}
}
