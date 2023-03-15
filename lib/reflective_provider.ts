/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import { Provider } from './provider';
import { ProviderNormalizer } from './provider_normalizer';
import { ResolvedReflectiveProvidersMerger } from './reflective_provider_merger';
import { ReflectiveProviderResolver, ResolvedReflectiveProvider } from './reflective_provider_resolver';

/**
 * Resolve a list of Providers.
 */
export function resolveReflectiveProviders(providers: Provider[]): ResolvedReflectiveProvider[] {
  // NormalizeProvider 作用于接入层，标准化 Provider 结构
  const normalized = ProviderNormalizer.normalize(providers);
  // 解析物料工厂函数，函数 + 函数依赖，可实例化
  const resolved = normalized.map((provider) => ReflectiveProviderResolver.resolve(provider));
  // 相同 token 进行合并
  const resolvedProviderMap = ResolvedReflectiveProvidersMerger.merge(resolved);

  return Array.from(resolvedProviderMap.values());
}
