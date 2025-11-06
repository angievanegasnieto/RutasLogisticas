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

  // Rutas públicas: permitir solo login y dev; el resto evalúa token si viene
  private static final List<RequestMatcher> PUBLIC = List.of(
      new AntPathRequestMatcher("/auth/login"),
      new AntPathRequestMatcher("/auth/dev/**"),
      new AntPathRequestMatcher("/actuator/health")
  );

  public JwtAuthFilter(JwtUtil jwt, CustomUserDetailsService uds) {
    this.jwt = jwt;
    this.uds = uds;
  }

  @Override
  protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
      throws ServletException, IOException {

    for (RequestMatcher m : PUBLIC) {
      if (m.matches(req)) { chain.doFilter(req, res); return; }
    }

    String header = req.getHeader("Authorization");
    String token = (StringUtils.hasText(header) && header.startsWith("Bearer ")) ? header.substring(7) : null;

    try {
      if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
        var claims = jwt.parse(token).getBody();
        String email = claims.getSubject();
        UserDetails userDetails = uds.loadUserByUsername(email);
        var auth = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
        SecurityContextHolder.getContext().setAuthentication(auth);
      }
    } catch (Exception ignored) {
      // token inválido -> continuar sin auth; seguridad decidirá
    }

    chain.doFilter(req, res);
  }
}

