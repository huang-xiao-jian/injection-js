import { NormalizedProvider, Provider } from './provider';
import { isObject } from 'lodash';

export class ProviderNormalizer {
  /**
   * TODO - InvalidProviderError
   * TODO - Array<Provider>
   */
  static normalize(providers: Provider[]): NormalizedProvider[] {
    return providers.map((provider) => {
      if ('provide' in provider) {
        return provider;
      }

      return {
        provide: provider,
        useClass: provider,
      };
    });
  }
}
