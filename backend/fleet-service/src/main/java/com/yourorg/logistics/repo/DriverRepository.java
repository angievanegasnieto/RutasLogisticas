package com.yourorg.logistics.repo;
import com.yourorg.logistics.domain.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface DriverRepository extends JpaRepository<Driver, Long> {
  boolean existsByLicenseNumber(String licenseNumber);
  Optional<Driver> findByLicenseNumber(String licenseNumber);
}
