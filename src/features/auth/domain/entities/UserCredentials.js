import { DomainError } from '../../../../core/errors/AppError';

export class UserCredentials {
  constructor({ email, password, firstName, lastName, role = 'customer' }) {
    this.email = email ? email.trim() : '';
    this.password = password || '';
    this.firstName = firstName ? firstName.trim() : '';
    this.lastName = lastName ? lastName.trim() : '';
    this.role = role;
  }

  validateLogin() {
    if (!this.email) {
      throw new DomainError('Email address is required.');
    }
    if (!this.isValidEmail()) {
      throw new DomainError('Please provide a valid email address.');
    }
    if (!this.password) {
      throw new DomainError('Password is required.');
    }
  }

  validateRegistration() {
    this.validateLogin();

    if (!this.firstName) {
      throw new DomainError('First name is required.');
    }
    if (!this.lastName) {
      throw new DomainError('Last name is required.');
    }
    if (this.password.length < 6) {
      throw new DomainError('Password must be at least 6 characters long.');
    }
  }

  isValidEmail() {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.email);
  }
}
