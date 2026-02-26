import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule, RouterModule]
})

export class LoginPage {

  email: string = '';
  senha: string = '';

  constructor(private router: Router, private http: HttpClient) {}

  login() {

    if (!this.email || !this.senha) {
      alert('Preencha todos os campos!');
      return;
    }

    const payload = { email: this.email, senha: this.senha };

    this.http.post<any>('http://localhost:3000/api/login', payload)
  .subscribe({
    next: (res) => {

      // 🔐 Salva o token
      localStorage.setItem('token', res.token);

      // 👤 Salva dados do usuário
      localStorage.setItem('userEmail', res.user.email);
      localStorage.setItem('userCidade', res.user.cidade);
      localStorage.setItem('userUf', res.user.uf);

      alert('Login realizado com sucesso!');
      this.router.navigate(['/dashboard']);
    },
    error: (err) => {
      console.error('Erro no login:', err);

      localStorage.clear();

      alert('Email ou senha inválidos!');
    }
  });
  }

}
