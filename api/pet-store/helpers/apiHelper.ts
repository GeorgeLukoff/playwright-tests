import { APIRequestContext } from '@playwright/test';
import { apiConfig } from '../config/apiConfig';

export class ApiHelper {
  private request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  async createUser(user: any) {
    return this.request.post(`${apiConfig.baseUrl}/user`, { data: user });
  }

  async getUser(userId: number) {
    return this.request.get(`${apiConfig.baseUrl}/user/${userId}`);
  }

  async deleteUser(userId: number, token?: string) {
    return this.request.delete(`${apiConfig.baseUrl}/user/${userId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  }

  async login(username: string, password: string) {
    return this.request.get(`${apiConfig.baseUrl}/user/login`, {
      params: { username, password },
    });
  }
}