import { Routes } from "@angular/router";
import { LayoutComponent } from "app/shared/layout/layout.component";
import { ListadoFaltantesComponent } from "./listado-faltantes/pages/listado-faltantes/listado-faltantes.component";

const faltantesRoutes: Routes = [
    {
        path: "",
        component: LayoutComponent,
        children: [
            {
                path: "",
                component: ListadoFaltantesComponent
            }
        ]
    }
]

export default faltantesRoutes;