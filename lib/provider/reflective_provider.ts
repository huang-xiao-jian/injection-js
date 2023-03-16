import { ResolvedReflectiveFactory } from '../factory/reflective_factory';
import { ReflectiveKey } from '../reflective_key';

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
   * Factory function which can return an instance of an object represented by a key.
   */
  resolvedFactory: ResolvedReflectiveFactory;

  /**
   * Indicates if the provider is a multi-provider or a regular provider.
   */
  multiProvider: boolean;
}

// tslint:disable-next-line:class-name
export class ResolvedReflectiveProviderImpl implements ResolvedReflectiveProvider {
  constructor(
    public key: ReflectiveKey,
    public resolvedFactories: ResolvedReflectiveFactory[],
    public multiProvider: boolean,
  ) {}

  get resolvedFactory(): ResolvedReflectiveFactory {
    return this.resolvedFactories[0];
  }
}
