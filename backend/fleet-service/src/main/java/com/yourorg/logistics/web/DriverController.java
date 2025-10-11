package com.yourorg.logistics.web;

import com.yourorg.logistics.dto.CreateDriverRequest;
import com.yourorg.logistics.dto.DriverDTO;
import com.yourorg.logistics.dto.UpdateDriverRequest;
import com.yourorg.logistics.service.DriverService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/drivers")
public class DriverController {

  private final DriverService service;
  public DriverController(DriverService service){ this.service = service; }

  @PostMapping
  public DriverDTO create(@Valid @RequestBody CreateDriverRequest r){ return service.create(r); }

  @GetMapping
  public Page<DriverDTO> list(Pageable pageable){ return service.list(pageable); }

  @GetMapping("/{id}")
  public DriverDTO get(@PathVariable Long id){ return service.get(id); }

  @PutMapping("/{id}")
  public DriverDTO update(@PathVariable Long id, @Valid @RequestBody UpdateDriverRequest r){ return service.update(id, r); }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable Long id){ service.delete(id); }
}
