/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package rutaslogisticas.SecurityConfig;

/**
 *
 * @author johan
 */


import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import rutaslogisticas.CustomUserDetailsService.CustomUserDetailsService;
import rutaslogisticas.JwtAuthFilter.JwtAuthFilter;

@Configuration
public class SecurityConfig {

  @Bean
  public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

  @Bean
  public DaoAuthenticationProvider authProvider(CustomUserDetailsService uds, PasswordEncoder pe) {
    var p = new DaoAuthenticationProvider();
    p.setUserDetailsService(uds);
    p.setPasswordEncoder(pe);
    return p;
  }

  @Bean
  public AuthenticationManager authenticationManager(AuthenticationConfiguration cfg) throws Exception {
    return cfg.getAuthenticationManager();
  }

 @Bean
public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthFilter jwtFilter) throws Exception {
  http.csrf(csrf -> csrf.disable())
     .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
     .authorizeHttpRequests(auth -> auth
         .requestMatchers("/auth/login", "/auth/register", "/auth/ping", "/actuator/health").permitAll()
         .requestMatchers(HttpMethod.POST, "/api/users").permitAll()
         .anyRequest().authenticated()
     )
     .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
  return http.build();
}

}

