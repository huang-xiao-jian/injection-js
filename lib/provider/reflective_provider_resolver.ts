/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ReflectiveFactoryResolver } from '../factory';
import { ReflectiveKey } from '../reflective_key';
import { NormalizedProvider, Provider } from './provider';
import { ProviderNormalizer } from './provider_normalizer';
import { ResolvedReflectiveProvider, ResolvedReflectiveProviderImpl } from './reflective_provider';
import { ResolvedReflectiveProvidersMerger } from './reflective_provider_merger';

export class ReflectiveProviderResolver {
  /**
   * Shallow clone the {@link ResolvedReflectiveProvider}.
   *
   * Only occur within multi merge scenario
   *
   */
  static shallow(provider: ResolvedReflectiveProvider): ResolvedReflectiveProvider {
    // 后续合并动作不应该影响原始的 ReflectiveProvider，因而需要进行浅克隆，务必注意
    return new ResolvedReflectiveProviderImpl(
      provider.key,
      provider.resolvedFactories.slice(),
      provider.multiProvider,
    );
  }

  /**
   * Converts the Provider into ResolvedProvider.
   *
   * Injector internally only uses ResolvedProvider, Provider contains
   * convenience provider syntax.
   */
  static resolve(provider: NormalizedProvider): ResolvedReflectiveProvider {
    return new ResolvedReflectiveProviderImpl(
      ReflectiveKey.get(provider.provide),
      [ReflectiveFactoryResolver.resolve(provider)],
      provider.multi || false,
    );
  }

  /**
   * Resolve a list of Providers.
   */
  static batchResolve(providers: Provider[]): ResolvedReflectiveProvider[] {
    // NormalizeProvider 作用于接入层，标准化 Provider 结构
    const normalized = ProviderNormalizer.normalize(providers);
    // 解析Provider 工厂函数 + 函数依赖，可实例化预备
    const resolved = normalized.map((provider) => this.resolve(provider));
    // 相同 token 进行合并
    const resolvedProviderMap = ResolvedReflectiveProvidersMerger.merge(resolved);

    return Array.from(resolvedProviderMap.values());
  }
}
