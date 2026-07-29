/**
 * Abstract IAuthRepository defining authentication operations contract.
 */
export class IAuthRepository {
  async login(credentials) {
    throw new Error('IAuthRepository.login must be implemented');
  }

  async register(credentials) {
    throw new Error('IAuthRepository.register must be implemented');
  }

  async getCurrentUser() {
    throw new Error('IAuthRepository.getCurrentUser must be implemented');
  }

  async logout() {
    throw new Error('IAuthRepository.logout must be implemented');
  }
}
