export class AppError extends Error {
  constructor(message, code = 'UNKNOWN_ERROR', details = null) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
  }
}

export class DomainError extends AppError {
  constructor(message, details = null) {
    super(message, 'DOMAIN_ERROR', details);
    this.name = 'DomainError';
  }
}

export class NetworkError extends AppError {
  constructor(message, status = 500, details = null) {
    super(message, 'NETWORK_ERROR', details);
    this.name = 'NetworkError';
    this.status = status;
  }
}
