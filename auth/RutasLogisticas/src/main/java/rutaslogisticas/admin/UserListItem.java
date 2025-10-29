package rutaslogisticas.admin;

import rutaslogisticas.entity.Role;
import rutaslogisticas.entity.User;

public class UserListItem {
    private Long id;
    private String name;
    private String email;
    private Role role;

    public UserListItem() {}

    public UserListItem(Long id, String name, String email, Role role) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
    }

    public static UserListItem from(User u) {
        return new UserListItem(u.getId(), u.getName(), u.getEmail(), u.getRole());
    }

    // getters y setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}

