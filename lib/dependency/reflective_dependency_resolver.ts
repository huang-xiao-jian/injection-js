import { ReflectiveDependency } from './reflective_dependency';
import { ResolvedReflectiveFactory } from '../reflective_factory';
import { ReflectiveInjector } from '../reflective_injector';
import { ResolvedReflectiveProvider } from '../provider';

type Constructor = new (...args: any[]) => any;

function resolver(cls: Constructor, deps: Set<Constructor>) {
  if (deps.has(cls)) return;

  deps.add(cls);

  // resolve all dependencies of the provided class and run the `resolver()` function
  // on their constructor functions.
  ReflectiveInjector.resolve([cls])
    .reduce((a, x: ResolvedReflectiveProvider) => a.concat(x.resolvedFactories), [] as ResolvedReflectiveFactory[])
    .reduce((a, r: ResolvedReflectiveFactory) => a.concat(r.dependencies), [] as ReflectiveDependency[])
    .forEach((d) => resolver(d.key.token as Constructor, deps));
}

export class ReflectiveDependencyResolver {
  /**
   * This utility function receives a spread of injectable classes
   * and returns an array of all their dependencies. Also resolves
   * optional dependencies.
   *
   * ### Important:
   *
   * Dynamically resolving dependencies using this function
   * will not play nice with static analysis tools, including tree-shaking.
   * From a static analysis perspective, any dependencies which are only resolved
   * using this function will look as though they are not used (and will be
   * removed by tree-shaking). This *severely* limits the usefulness of this function.
   *
   * ### Example:
   *
   * ```typescript
   * class HTTP {}
   * class Database {}
   *
   * // commenting out the decorator because the `@` symbol is spoiling
   * // jsDoc rendering in vscode
   * // @Injectable()
   * class PersonService {
   *   constructor(
   *     private http: HTTP,
   *     private database: Database,
   *   ) {}
   * }
   *
   * // @Injectable()
   * class OrganizationService {
   *   constructor(
   *     private http: HTTP,
   *     private personService: PersonService,
   *   ) {}
   * }
   *
   * const injector = ReflectiveInjector.resolveAndCreate(
   *   resolveDependencies(OrganizationService)
   * );
   *
   * const organizationService = injector.get(OrganizationService);
   * ```
   */
  static resolve(...inputs: Constructor[]) {
    const deps = new Set<Constructor>();

    for (const input of inputs) {
      resolver(input, deps);
    }

    return Array.from(deps);
  }
}
