import { Routes } from '@angular/router';
import { LayoutComponent } from '../../shared/layout/layout.component';
import { NuevoProductoComponent } from './pages/nuevo-producto/nuevo-producto.component';


const nuevoProductoRoutes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            {
                path: '',
                component: NuevoProductoComponent
            }
        ]
    },
]

export default nuevoProductoRoutes;