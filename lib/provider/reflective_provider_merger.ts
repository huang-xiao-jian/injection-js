/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { MixingMultiProvidersWithRegularProvidersError } from '../reflective_errors';
import { ReflectiveProviderResolver, ResolvedReflectiveProvider } from './reflective_provider_resolver';

/**
 * Merges a list of ResolvedProviders into a list where
 * each key is contained exactly once and multi providers
 * have been merged.
 */
export class ResolvedReflectiveProvidersMerger {
  static merge(
    providers: ResolvedReflectiveProvider[],
    normalizedProvidersMap: Map<number, ResolvedReflectiveProvider> = new Map()
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
}
