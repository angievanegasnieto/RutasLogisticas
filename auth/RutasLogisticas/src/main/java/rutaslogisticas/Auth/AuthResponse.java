/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package rutaslogisticas.Auth;

/**
 *
 * @author johan
 */


public class AuthResponse {
  public Object user;
  public String token;
  public AuthResponse(Object user, String token) { this.user=user; this.token=token; }
}

