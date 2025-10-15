import { Routes } from "@angular/router";
import { authGuard } from "./core/auth.guard";

export const routes: Routes = [
  { path: "", redirectTo: "dashboard", pathMatch: "full" },

  {
    path: "login",
    loadComponent: () =>
      import("./pages/login/login.component").then((m) => m.LoginComponent),
  },
  {
    path: "register",
    loadComponent: () =>
      import("./pages/register/register.component").then(
        (m) => m.RegisterComponent
      ),
  },

  {
    path: "",
    canActivate: [authGuard],
    children: [
      {
        path: "dashboard",
        loadComponent: () =>
          import("./pages/dashboard/dashboard.component").then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: "admin/users",
        loadComponent: () =>
          import("./pages/admin/users.component").then(
            (m) => m.AdminUsersComponent
          ),
      },
      {
        path: "profile",
        loadComponent: () =>
          import("./pages/profile/profile.component").then(
            (m) => m.ProfileComponent
          ),
      },
    ],
  },

  {
    path: "**",
    loadComponent: () =>
      import("./pages/not-found/not-found.component").then(
        (m) => m.NotFoundComponent
      ),
  },
];
