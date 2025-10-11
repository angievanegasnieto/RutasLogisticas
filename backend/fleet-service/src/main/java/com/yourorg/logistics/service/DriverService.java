package com.yourorg.logistics.service;

import com.yourorg.logistics.domain.Driver;
import com.yourorg.logistics.dto.*;
import com.yourorg.logistics.repo.DriverRepository;
import org.springframework.data.domain.*; import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional;

@Service @Transactional
public class DriverService {
  private final DriverRepository repo;
  public DriverService(DriverRepository repo){ this.repo = repo; }

  public DriverDTO create(CreateDriverRequest r){
    if (repo.existsByLicenseNumber(r.licenseNumber())) throw new IllegalArgumentException("License number already exists");
    var d = new Driver();
    d.setFullName(r.fullName()); d.setLicenseNumber(r.licenseNumber());
    d.setLicenseIssuedAt(r.licenseIssuedAt()); d.setLicenseExpiresAt(r.licenseExpiresAt());
    d.setPhone(r.phone()); d.setEmail(r.email());
    return toDTO(repo.save(d));
  }
  public Page<DriverDTO> list(Pageable pg){ return repo.findAll(pg).map(this::toDTO); }
  public DriverDTO get(Long id){ return repo.findById(id).map(this::toDTO).orElseThrow(() -> new IllegalArgumentException("Driver not found")); }
  public DriverDTO update(Long id, UpdateDriverRequest r){
    var d = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Driver not found"));
    d.setFullName(r.fullName()); d.setLicenseIssuedAt(r.licenseIssuedAt()); d.setLicenseExpiresAt(r.licenseExpiresAt());
    d.setPhone(r.phone()); d.setEmail(r.email()); return toDTO(d);
  }
  public void delete(Long id){ repo.deleteById(id); }
  public Driver getEntity(Long id){ return repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Driver not found")); }
  private DriverDTO toDTO(Driver d){ return new DriverDTO(d.getId(), d.getFullName(), d.getLicenseNumber(),
    d.getLicenseIssuedAt(), d.getLicenseExpiresAt(), d.getPhone(), d.getEmail()); }
}
