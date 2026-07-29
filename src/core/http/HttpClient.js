/**
 * Abstract HttpClient interface to adhere to the Dependency Inversion Principle.
 * High-level Use Cases depend on this abstraction rather than concrete HTTP client libraries like Axios or Fetch.
 */
export class HttpClient {
  async get(url, config = {}) {
    throw new Error('HttpClient.get must be implemented');
  }

  async post(url, body, config = {}) {
    throw new Error('HttpClient.post must be implemented');
  }

  async put(url, body, config = {}) {
    throw new Error('HttpClient.put must be implemented');
  }

  async delete(url, config = {}) {
    throw new Error('HttpClient.delete must be implemented');
  }
}
