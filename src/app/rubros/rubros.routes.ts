import {  Routes } from "@angular/router";
import { LayoutComponent } from "app/shared/layout/layout.component";
import { ListadoRubrosComponent } from "./listado-rubros/pages/listado-rubros/listado-rubros.component";

const rubrosRoutes: Routes = [
    {
        path: "",
        component: LayoutComponent,
        children: [
            {
                path: "",
                component: ListadoRubrosComponent
            }
        ]
    }
]

export default rubrosRoutes;