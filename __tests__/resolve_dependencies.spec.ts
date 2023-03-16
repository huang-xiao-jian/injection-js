import {
  Inject,
  Injectable,
  Optional,
  Provider,
  ReflectiveDependencyResolver,
  ReflectiveInjector,
} from '../lib';

class Engine {}

class DashboardSoftware {}

@Injectable()
class Dashboard {
  constructor(software: DashboardSoftware) {}
}

class TurboEngine extends Engine {}

@Injectable()
class CarWithDashboard {
  engine: Engine;
  dashboard: Dashboard;
  constructor(engine: Engine, dashboard: Dashboard) {
    this.engine = engine;
    this.dashboard = dashboard;
  }
}

@Injectable()
class CarWithOptionalEngine {
  constructor(@Optional() public engine: Engine) {}
}

@Injectable()
class CarWithInject {
  constructor(@Inject(TurboEngine) public engine: Engine) {}
}

function createInjector(providers: Provider[]): ReflectiveInjector {
  return ReflectiveInjector.resolveAndCreate(providers);
}

describe('resolveDependencies', function () {
  let deps: Array<new (...args: any[]) => any>;
  let injector: ReflectiveInjector | null;

  beforeEach(function () {
    deps = [];
    injector = null;
  });

  it('should resolve direct dependencies', function () {
    deps = ReflectiveDependencyResolver.resolve(Dashboard);

    expect(deps).toEqual([Dashboard, DashboardSoftware]);

    injector = createInjector(deps);

    expect(injector.get(Dashboard) instanceof Dashboard).toBe(true);
  });

  it('should resolve dependencies of dependencies', function () {
    deps = ReflectiveDependencyResolver.resolve(CarWithDashboard);

    expect(deps).toEqual([CarWithDashboard, Engine, Dashboard, DashboardSoftware]);

    injector = createInjector(deps);

    expect(injector.get(CarWithDashboard) instanceof CarWithDashboard).toBe(true);
  });

  it('should resolve optional dependencies', function () {
    deps = ReflectiveDependencyResolver.resolve(CarWithOptionalEngine);

    expect(deps).toEqual([CarWithOptionalEngine, Engine]);

    injector = createInjector(deps);

    expect(injector.get(CarWithOptionalEngine) instanceof CarWithOptionalEngine).toBe(true);
  });

  it('should resolve re-provided dependencies', function () {
    deps = ReflectiveDependencyResolver.resolve(CarWithInject);

    expect(deps).toEqual([CarWithInject, TurboEngine]);

    injector = createInjector(deps);

    expect(injector.get(CarWithInject) instanceof CarWithInject).toBe(true);
  });
});
