import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { LoginComponent } from './pages/login/login.component';
import { NuevaCuentaComponent } from './pages/nueva-cuenta/nueva-cuenta.component';
import { OlvidePasswordComponent } from './pages/olvide-password/olvide-password.component';
import { NuevaPasswordComponent } from './nueva-contraseña/nueva-password.component';
import { ConfirmarCuentaComponent } from './pages/confirmar-cuenta/confirmar-cuenta.component';
import { NotAuthenticatedGuard } from './guards/not-authenticated.guard';

const authRoutes: Routes = [
    {
        path: '',
        component: AuthLayoutComponent,
        children: [
            {
                path: '',
                canActivate: [NotAuthenticatedGuard],   //lo pongo asi por que si no al tener dos path con '' se ejecuta dos veces el guard
                component: LoginComponent
            },
            {
                path: 'crear-cuenta',
                canActivate: [NotAuthenticatedGuard],
                component: NuevaCuentaComponent
            },
            {
                path: 'olvide-password',
                canActivate: [NotAuthenticatedGuard],
                component: OlvidePasswordComponent
            },
            {
                path: 'olvide-password/:token',
                canActivate: [NotAuthenticatedGuard],
                component: NuevaPasswordComponent
            },
            {
                path: 'confirmar/:token',
                canActivate: [NotAuthenticatedGuard],
                component: ConfirmarCuentaComponent
            }
        ]
    },
]

export default authRoutes;