/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package rutaslogisticas.Repository;

/**
 *
 * @author johan
 */


import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import rutaslogisticas.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByEmail(String email);
  boolean existsByEmail(String email);
}

