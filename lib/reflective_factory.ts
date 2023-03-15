import { ReflectiveDependency } from './reflective_dependency';

/**
 * An internal resolved representation of a factory function created by resolving {@link
 * Provider}.
 * @experimental
 */
export class ResolvedReflectiveFactory {
  constructor(
    /**
     * Factory function which can return an instance of an object represented by a key.
     */
    public factory: Function,
    /**
     * Arguments (dependencies) to the `factory` function.
     */
    public dependencies: ReflectiveDependency[]
  ) {}
}
