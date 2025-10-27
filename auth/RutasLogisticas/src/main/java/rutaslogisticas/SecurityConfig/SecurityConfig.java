package rutaslogisticas.SecurityConfig;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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
  public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthFilter jwtFilter,
                                         DaoAuthenticationProvider provider) throws Exception {
    http
      .csrf(csrf -> csrf.disable())
      .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
      .authenticationProvider(provider)
      .authorizeHttpRequests(auth -> auth
          // público: login/registro/health
          .requestMatchers("/auth/login", "/auth/register", "/auth/ping", "/actuator/health").permitAll()

          // ---- ADMIN: CRUD de usuarios/roles ----
          .requestMatchers("/admin/users/**").hasRole("ADMIN")

          // (Opcionales, por si luego creas endpoints por rol)
          .requestMatchers("/CONDUCTOR/**").hasAnyRole("CONDUCTOR","ADMIN")
          .requestMatchers("/OPERADOR/**").hasAnyRole("OPERADOR","ADMIN")

          // todo lo demás requiere estar autenticado
          .anyRequest().authenticated()
      )
      .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
      .httpBasic(b -> b.disable())
      .formLogin(f -> f.disable());

    return http.build();
  }
}


