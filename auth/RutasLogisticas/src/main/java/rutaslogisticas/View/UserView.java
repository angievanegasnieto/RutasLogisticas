/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package rutaslogisticas.View;

/**
 *
 * @author johan
 */

public class UserView {
  public Long id;
  public String name;
  public String email;
  public String role;
  public Boolean enabled;

  public UserView(Long id, String name, String email, String role) {
    this.id=id; this.name=name; this.email=email; this.role=role;
  }
  
  public UserView(Long id, String name, String email, String role, Boolean enabled) {
    this.id=id; this.name=name; this.email=email; this.role=role; this.enabled=enabled;
  }
}

