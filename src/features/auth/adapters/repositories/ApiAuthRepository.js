import { IAuthRepository } from '../../domain/repositories/IAuthRepository';
import { defaultHttpClient } from '../../../../core/http/AxiosHttpClient';

export class ApiAuthRepository extends IAuthRepository {
  constructor(httpClient = defaultHttpClient) {
    super();
    this.httpClient = httpClient;
  }

  async login(credentials) {
    const data = await this.httpClient.post('/api/users/login', {
      email: credentials.email,
      password: credentials.password,
    });
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  }

  async register(credentials) {
    const data = await this.httpClient.post('/api/users/', {
      email: credentials.email,
      password: credentials.password,
      firstName: credentials.firstName,
      lastName: credentials.lastName,
    });
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  }

  async getCurrentUser() {
    return await this.httpClient.get('/api/users/profile');
  }

  async logout() {
    localStorage.removeItem('token');
  }
}

export const defaultAuthRepository = new ApiAuthRepository();
