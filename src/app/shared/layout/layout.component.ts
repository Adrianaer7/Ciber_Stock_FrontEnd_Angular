import { Component, computed, inject, signal } from '@angular/core';
import {  Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, CommonModule],
  templateUrl: './layout.component.html',
})
export class LayoutComponent {
  router = inject(Router)
  authService = inject(AuthService)
  panel = signal<boolean>(false)
  mostrarVarios = signal<boolean>(false)

  usuario = computed(() => this.authService.user())
  urlActual = computed(() => this.router.url)

  tuerca() {
    this.panel.set(!this.panel())
  }

  logout() {
    localStorage.removeItem('token')
    this.authService.logout()
    this.router.navigate([''])
  }

 }
