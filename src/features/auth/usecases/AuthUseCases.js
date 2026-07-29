import { UserCredentials } from '../domain/entities/UserCredentials';

export class LoginUserUseCase {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  async execute({ email, password }) {
    const credentials = new UserCredentials({ email, password });
    credentials.validateLogin();
    return await this.authRepository.login(credentials);
  }
}

export class RegisterUserUseCase {
  constructor(authRepository) {
    this.authRepository = authRepository;
  }

  async execute(userData) {
    const credentials = new UserCredentials(userData);
    credentials.validateRegistration();
    return await this.authRepository.register(credentials);
  }
}
