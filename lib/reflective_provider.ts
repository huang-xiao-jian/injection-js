/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Self, SkipSelf } from './metadata';
import { Provider, ProviderNormalizer } from './provider';
import { MixingMultiProvidersWithRegularProvidersError } from './reflective_errors';
import { ReflectiveKey } from './reflective_key';
import { ReflectiveProviderResolver, ResolvedReflectiveFactory } from './reflective_provider_resolver';

const _EMPTY_LIST: any[] = [];

/**
 * An internal resolved representation of a {@link Provider} used by the {@link Injector}.
 *
 * It is usually created automatically by `Injector.resolveAndCreate`.
 *
 * It can be created manually, as follows:
 *
 * ### Example ([live demo](http://plnkr.co/edit/RfEnhh8kUEI0G3qsnIeT?p%3Dpreview&p=preview))
 *
 * ```typescript
 * var resolvedProviders = Injector.resolve([{ provide: 'message', useValue: 'Hello' }]);
 * var injector = Injector.fromResolvedProviders(resolvedProviders);
 *
 * expect(injector.get('message')).toEqual('Hello');
 * ```
 *
 * @experimental
 */
export interface ResolvedReflectiveProvider {
  /**
   * A key, usually a `Type<any>`.
   */
  key: ReflectiveKey;

  /**
   * Factory function which can return an instance of an object represented by a key.
   */
  resolvedFactories: ResolvedReflectiveFactory[];

  /**
   * Indicates if the provider is a multi-provider or a regular provider.
   */
  multiProvider: boolean;
}

/**
 * Resolve a list of Providers.
 */
export function resolveReflectiveProviders(providers: Provider[]): ResolvedReflectiveProvider[] {
  // NormalizeProvider 作用于接入层，标准化 Provider 结构
  const normalized = ProviderNormalizer.normalize(providers);
  // 解析物料工厂函数，函数 + 函数依赖
  const resolved = normalized.map((provider) => ReflectiveProviderResolver.resolve(provider));
  const resolvedProviderMap = mergeResolvedReflectiveProviders(resolved, new Map());

  return Array.from(resolvedProviderMap.values());
}

/**
 * Merges a list of ResolvedProviders into a list where
 * each key is contained exactly once and multi providers
 * have been merged.
 */
export function mergeResolvedReflectiveProviders(
  providers: ResolvedReflectiveProvider[],
  normalizedProvidersMap: Map<number, ResolvedReflectiveProvider>
): Map<number, ResolvedReflectiveProvider> {
  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i];
    const existing = normalizedProvidersMap.get(provider.key.id);
    if (existing) {
      if (provider.multiProvider !== existing.multiProvider) {
        throw new MixingMultiProvidersWithRegularProvidersError(existing, provider);
      }
      if (provider.multiProvider) {
        for (let j = 0; j < provider.resolvedFactories.length; j++) {
          existing.resolvedFactories.push(provider.resolvedFactories[j]);
        }
      } else {
        normalizedProvidersMap.set(provider.key.id, provider);
      }
    } else {
      let resolvedProvider: ResolvedReflectiveProvider;
      if (provider.multiProvider) {
        resolvedProvider = ReflectiveProviderResolver.shallow(provider);
      } else {
        resolvedProvider = provider;
      }
      normalizedProvidersMap.set(provider.key.id, resolvedProvider);
    }
  }
  return normalizedProvidersMap;
}
