import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit, OnDestroy {

  userEmail = '';
  userCidade = '';
  userUf = '';

  umidade: number = 0;
  ultimaAtualizacao: string = '';
  clima: any = null;

  lat: number =  48.8566;
  lon: number = 2.3522;

  private sensorApiUrl = 'http://localhost:3000/api/sensor';
  private climaApiUrl = 'http://localhost:3000/api/clima';
  private subscription!: Subscription;

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    this.userEmail = localStorage.getItem('userEmail') || '';
    this.userCidade = localStorage.getItem('userCidade') || '';
    this.userUf = localStorage.getItem('userUf') || '';
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  getColor(umidade: number): string {
    if (umidade < 30) return "danger";
    if (umidade >= 30 && umidade <= 60) return "success";
    return "primary";
  }

  ngOnInit() {

    const token = localStorage.getItem('token');

    // 🔒 Se não tiver token, volta pro login
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });

    // 🔄 Atualiza sensor a cada 5s
    this.subscription = interval(5000)
      .pipe(
        switchMap(() =>
          this.http.get<any>(this.sensorApiUrl, { headers })
        )
      )
      .subscribe({
        next: (res) => {
          if (res && res.recebido) {
            this.umidade = res.recebido.umidade;
            this.ultimaAtualizacao = new Date().toLocaleTimeString();
          }
        },
        error: (err) => {
          console.error('Erro ao buscar sensor:', err);

          // Se token expirou (401), força logout
          if (err.status === 401) {
            localStorage.clear();
            this.router.navigate(['/login']);
          }
        }
      });

    // 🔹 Buscar clima
    this.buscarClima(headers);
  }

  buscarClima(headers: HttpHeaders) {

    const url = `${this.climaApiUrl}?lat=${this.lat}&lon=${this.lon}`;

    this.http.get<any>(url, { headers })
      .subscribe({
        next: (res) => {
          if (res && res.atual) {
            this.clima = res;
          }
        },
        error: (err) => {
          console.error('Erro ao buscar clima:', err);
        }
      });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}