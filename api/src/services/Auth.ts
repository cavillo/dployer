import * as _ from 'lodash';
import jwt, { TAlgorithm } from 'jwt-simple';
import * as CryptoJS from 'crypto-js';
import MongoDB from './MongoDB';

export interface AuthSecret {
  _id?: string; // Secret value
  value: string; // Secret value
  active: boolean; // Expiration Time
  exp: number; // Expiration Time
  iat: number; // Issued at
}

export interface AuthPayload {
  _id?: string; // Issuer
  iss: string; // Issuer
  sub: string; // Subject
  aud: string; // Audience
  exp: number; // Expiration Time
  nbf: number; // Not Before
  iat: number; // Issued at
  jit: string; // JWT ID
}

export default class Auth {
  private dbCollectionName = 'auth_secret';
  private encodeAlg: TAlgorithm = 'HS512';
  mongo: MongoDB;

  constructor(mongo: MongoDB) {
    this.mongo = mongo;
  }

  public async getToken(): Promise<string> {
    const secret: AuthSecret = await this.getSecret();

    const payload: AuthPayload = {
      iss: 'io.dployer', // Issuer
      sub: 'random user', // Subject
      aud: 'random audience', // Audience
      exp: this.getNextPayloadExpTime(), // Expiration Time
      nbf: this.getTimeInSecconds(), // Not Before
      iat: this.getTimeInSecconds(), // Issued at
      jit: `${Math.random()}-${this.getTimeInSecconds()}`, // JWT ID
    };

    const token = await jwt.encode(payload, secret.value, this.encodeAlg);
    return token;
  }

  public async validateToken(token: string): Promise<void> {
    const secret: AuthSecret = await this.getSecret();
    const decoded: AuthPayload = await jwt.decode(token, secret.value, false, this.encodeAlg);

    if (!decoded || decoded.exp < this.getTimeInSecconds()) {
      throw Error('Invalid token');
    }
  }

  private async getSecret(): Promise<AuthSecret> {
    const secrets = await this.mongo.findAllDocumentsByQuery(this.dbCollectionName, { active: true });
    let secret: AuthSecret | null = _.get(secrets, '[0]', null);

    // verify the token. If expired or there is no token... genreate one
    if (!secret || secret.exp < this.getTimeInSecconds()) {
      secret = await this.generateSecret();
    }

    return secret;
  }

  private async generateSecret(): Promise<AuthSecret> {
    const activeSecrets: AuthSecret[] = await this.mongo.findAllDocumentsByQuery(this.dbCollectionName, { exp: { $gt: this.getTimeInSecconds() } });
    for (const secret of activeSecrets) {
      await this.mongo.updateDocument(this.dbCollectionName, { _id: _.get(secret, '_id', null) }, { active: false });
    }
    const newSecret = await this.mongo.insertDocument(this.dbCollectionName, {
      active: true,
      exp: this.getNextSecretExpTime(),
      iat: this.getTimeInSecconds(),
      value: this.getSecretRandomValue(),
    } as AuthSecret);

    return newSecret;
  }

  private getTimeInSecconds(date?: Date): number {
    if (date) return _.round(date.getTime() / 1000);

    return _.round(new Date().getTime() / 1000);
  }

  private getNextSecretExpTime = (): number  => this.getTimeInSecconds() + (60 * 60 * 24 * 30);

  private getNextPayloadExpTime = (): number => this.getTimeInSecconds() + (60 * 60 * 24 * 1);

  private getSecretRandomValue = (): string => CryptoJS.SHA512(`${Math.random()}-${Math.random()}-${Math.random()}-${new Date().toISOString()}-${Math.random()}`).toString();
}
