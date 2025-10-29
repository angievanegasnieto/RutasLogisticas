package rutaslogisticas.gateway;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {
  @Bean
  public WebMvcConfigurer corsConfigurer() {
    return new WebMvcConfigurer() {
      @Override
      public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")  // Configuración para todas las rutas
            .allowedOrigins("http://localhost:4200")  // Permite el acceso desde localhost:4200 (frontend)
            .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")  // Métodos permitidos
            .allowedHeaders("*")  // Acepta todos los encabezados
            .allowCredentials(true);  // Permite credenciales como cookies y cabeceras de autorización
      }
    };
  }
}

