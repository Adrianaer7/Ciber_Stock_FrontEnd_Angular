import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { LoginComponent } from './pages/login/login.component';
import { NuevaCuentaComponent } from './pages/nueva-cuenta/nueva-cuenta.component';
import { OlvidePasswordComponent } from './pages/olvide-password/olvide-password.component';
import { NuevaContraseñaComponent } from './nueva-contraseña/nueva-contraseña.component';
import { ConfirmarCuentaComponent } from './pages/confirmar-cuenta/confirmar-cuenta.component';

const authRoutes: Routes = [
    {
        path: '',
        component: AuthLayoutComponent,
        children: [
            {
                path: '',
                component: LoginComponent
            },
            {
                path: 'crear-cuenta',
                component: NuevaCuentaComponent
            },
            {
                path: 'olvide-password',
                component: OlvidePasswordComponent
            },
            {
                path: 'olvide-password/:token',
                component: NuevaContraseñaComponent
            },
            {
                path: 'confirmar/:token',
                component: ConfirmarCuentaComponent
            }
        ]
    },
]

export default authRoutes;