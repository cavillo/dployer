export default class ClientUser {

  private LOCAL_STORAGE_USER_TOKEN = '@DPLOYER_CLIENT:USER_TOKEN';

  public async setCurrentToken(token: string): Promise<void> {
    if (token) {
      localStorage.setItem(this.LOCAL_STORAGE_USER_TOKEN, token);
    }
  }

  public async getCurrentToken(): Promise<string | null> {
    const token = localStorage.getItem(this.LOCAL_STORAGE_USER_TOKEN);
    if (token) {
      return token;
    }
    return null;
  }

  public async deleteCurrentToken(): Promise<void> {
    localStorage.removeItem(this.LOCAL_STORAGE_USER_TOKEN);
  }
}
