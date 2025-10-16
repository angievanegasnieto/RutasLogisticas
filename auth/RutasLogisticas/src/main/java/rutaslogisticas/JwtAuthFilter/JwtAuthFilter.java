/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package rutaslogisticas.JwtAuthFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.security.web.util.matcher.RequestMatcher;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.util.List;

import rutaslogisticas.JwtUtil.JwtUtil;
import rutaslogisticas.CustomUserDetailsService.CustomUserDetailsService;

@Component
public class JwtAuthFilter extends org.springframework.web.filter.OncePerRequestFilter {

  private final JwtUtil jwt;
  private final CustomUserDetailsService uds;

  // Rutas públicas (ajústalas según tu API)
  private static final List<RequestMatcher> PUBLIC = List.of(
      new AntPathRequestMatcher("/auth/**"),
      new AntPathRequestMatcher("/actuator/health"),
      new AntPathRequestMatcher("/api/users", "POST") // crear usuario sin token
  );

  public JwtAuthFilter(JwtUtil jwt, CustomUserDetailsService uds) {
    this.jwt = jwt;
    this.uds = uds;
  }

  protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
      throws ServletException, IOException {

    // 1) Si la ruta es pública, no tocar el SecurityContext
    for (RequestMatcher m : PUBLIC) {
      if (m.matches(req)) {
        chain.doFilter(req, res);
        return;
      }
    }

    // 2) Leer token si viene
    String header = req.getHeader("Authorization");
    String token = (StringUtils.hasText(header) && header.startsWith("Bearer "))
        ? header.substring(7) : null;

    try {
      // 3) Si hay token y aún no hay autenticación → validar y autenticar
      if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
        var claims = jwt.parse(token).getBody();
        String email = claims.getSubject();

        UserDetails userDetails = uds.loadUserByUsername(email);

        var auth = new UsernamePasswordAuthenticationToken(
            userDetails, null, userDetails.getAuthorities());
        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));

        SecurityContextHolder.getContext().setAuthentication(auth);
      }
      // Si no hay token o es inválido, simplemente seguimos sin auth;
      // luego Security decidirá (401 si la ruta no es pública).
    } catch (Exception ignored) { /* token inválido => continuar sin auth */ }

    chain.doFilter(req, res);
  }
}


