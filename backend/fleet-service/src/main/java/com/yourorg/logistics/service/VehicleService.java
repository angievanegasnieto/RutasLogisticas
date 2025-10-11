package com.yourorg.logistics.service;

import com.yourorg.logistics.domain.Vehicle;
import com.yourorg.logistics.dto.*;
import com.yourorg.logistics.repo.VehicleRepository;
import org.springframework.data.domain.*; import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional;

@Service @Transactional
public class VehicleService {
  private final VehicleRepository repo; private final DriverService driverService;
  public VehicleService(VehicleRepository repo, DriverService driverService){ this.repo = repo; this.driverService = driverService; }

  public VehicleDTO create(CreateVehicleRequest r){
    if (repo.existsByPlate(r.plate())) throw new IllegalArgumentException("Plate already exists");
    var v = new Vehicle();
    v.setPlate(r.plate()); v.setModel(r.model()); v.setYear(r.year()); v.setType(r.type());
    v.setStatus(r.status()); v.setCapacityKg(r.capacityKg()); v.setLastServiceAt(r.lastServiceAt());
    if (r.assignedDriverId()!=null) v.setAssignedDriver(driverService.getEntity(r.assignedDriverId()));
    return toDTO(repo.save(v));
  }

  public Page<VehicleDTO> list(String status, Long driverId, Pageable pg){
    if (status!=null && !status.isBlank()) return repo.findByStatusIgnoreCase(status, pg).map(this::toDTO);
    if (driverId!=null) return repo.findByAssignedDriver_Id(driverId, pg).map(this::toDTO);
    return repo.findAll(pg).map(this::toDTO);
  }

  public VehicleDTO get(Long id){ return repo.findById(id).map(this::toDTO).orElseThrow(() -> new IllegalArgumentException("Vehicle not found")); }

  public VehicleDTO update(Long id, UpdateVehicleRequest r){
    var v = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Vehicle not found"));
    v.setModel(r.model()); v.setYear(r.year()); v.setType(r.type()); v.setStatus(r.status());
    v.setCapacityKg(r.capacityKg()); v.setLastServiceAt(r.lastServiceAt());
    if (r.assignedDriverId()!=null) v.setAssignedDriver(driverService.getEntity(r.assignedDriverId()));
    else v.setAssignedDriver(null);
    return toDTO(v);
  }

  public void delete(Long id){ repo.deleteById(id); }
  public VehicleDTO assignDriver(Long vehicleId, Long driverId){
    var v = repo.findById(vehicleId).orElseThrow(() -> new IllegalArgumentException("Vehicle not found"));
    v.setAssignedDriver(driverService.getEntity(driverId)); return toDTO(v);
  }
  public VehicleDTO unassignDriver(Long vehicleId){
    var v = repo.findById(vehicleId).orElseThrow(() -> new IllegalArgumentException("Vehicle not found"));
    v.setAssignedDriver(null); return toDTO(v);
  }

  private VehicleDTO toDTO(Vehicle v){
    var d = v.getAssignedDriver();
    return new VehicleDTO(v.getId(), v.getPlate(), v.getModel(), v.getYear(), v.getType(), v.getStatus(), v.getCapacityKg(),
      d!=null?d.getId():null, d!=null?d.getFullName():null, v.getLastServiceAt());
  }
}
