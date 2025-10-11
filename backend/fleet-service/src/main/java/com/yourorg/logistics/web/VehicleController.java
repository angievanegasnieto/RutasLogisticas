package com.yourorg.logistics.web;

import com.yourorg.logistics.dto.CreateVehicleRequest;
import com.yourorg.logistics.dto.UpdateVehicleRequest;
import com.yourorg.logistics.dto.VehicleDTO;
import com.yourorg.logistics.service.VehicleService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

  private final VehicleService service;
  public VehicleController(VehicleService service){ this.service = service; }

  @PostMapping
  public VehicleDTO create(@Valid @RequestBody CreateVehicleRequest r){ return service.create(r); }

  @GetMapping
  public Page<VehicleDTO> list(@RequestParam(required = false) String status,
                               @RequestParam(required = false) Long driverId,
                               Pageable pageable){
    return service.list(status, driverId, pageable);
  }

  @GetMapping("/{id}")
  public VehicleDTO get(@PathVariable Long id){ return service.get(id); }

  @PutMapping("/{id}")
  public VehicleDTO update(@PathVariable Long id, @Valid @RequestBody UpdateVehicleRequest r){
    return service.update(id, r);
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable Long id){ service.delete(id); }

  @PostMapping("/{vehicleId}/assign/{driverId}")
  public VehicleDTO assign(@PathVariable Long vehicleId, @PathVariable Long driverId){
    return service.assignDriver(vehicleId, driverId);
  }

  @PostMapping("/{vehicleId}/unassign")
  public VehicleDTO unassign(@PathVariable Long vehicleId){
    return service.unassignDriver(vehicleId);
  }
}
