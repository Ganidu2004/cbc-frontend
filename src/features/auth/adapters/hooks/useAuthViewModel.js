import { useState } from 'react';
import { defaultAuthRepository } from '../repositories/ApiAuthRepository';
import { LoginUserUseCase, RegisterUserUseCase } from '../../usecases/AuthUseCases';

export function useAuthViewModel(authRepository = defaultAuthRepository) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loginUserUseCase = new LoginUserUseCase(authRepository);
  const registerUserUseCase = new RegisterUserUseCase(authRepository);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const result = await loginUserUseCase.execute({ email, password });
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message || 'Login failed');
      setLoading(false);
      throw err;
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const result = await registerUserUseCase.execute(userData);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err.message || 'Registration failed');
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    await authRepository.logout();
  };

  return {
    loading,
    error,
    login,
    register,
    logout,
  };
}
