import { Routes } from '@angular/router';
import { LayoutComponent } from '../../shared/layout/layout.component';
import { VerProductoComponent } from './ver-producto/pages/ver-producto.component';
import { EditarProductoComponent } from './editar-producto/pages/editar-producto/editar-producto.component';


const productoRoutes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            {
                path: ':token',
                component: VerProductoComponent
            },
            {
                path: 'editar/:token',
                component: EditarProductoComponent
            },
        ]
    }
]

export default productoRoutes;