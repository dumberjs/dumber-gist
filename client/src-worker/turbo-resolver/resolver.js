import semver from 'semver';
import { Graph } from 'graphlib';
import {NpmHttpRegistry} from './registries/npm-http';
import {inject} from 'aurelia-dependency-injection';
import _ from 'lodash';

@inject(NpmHttpRegistry)
export class Resolver {
  constructor(registry) {
    this.registry = registry;

    this.graph = new Graph();
    this.jpack = {
      appDependencies: {},
      resDependencies: {}
    };
    this.jobs = [];
  }

  loadRegistryPackage(task){
    const job = this.registry.fetch(task.name).then(registryPackage =>
      this.resolveDependencies(task, registryPackage)
    );
    const index = this.jobs.length;
    this.jobs.push(job);

    job.then(
      () => {
        this.jobs[index] = {done: true};
      },
      err => {
        console.error(err);
        this.jobs[index] = {done: true, error: err.message};
      }
    ).then(() => {
      // check finishes
      if (this.jobs.filter(j => !j.done).length === 0) {
        const errors = this.jobs.filter(j => j.error).map(j => j.error);

        if (errors.length) {
          this._reject(new Error(_.uniq(errors).join('\n')));
        } else {
          this._resolve(this.renderJpack());
        }
      }
    });
  }

  // Resolution & Iteration
  resolveDependencies(task, registryPackage){
    const version = this.resolveVersion(task.version, registryPackage);

    const fullName = `${registryPackage.name}@${version}`;
    const versionPackageJson = registryPackage.versions[version];
    const isRootDependency = task.parentNode === 'root';
    const subDepsResolved = this.graph.hasNode(fullName);

    if (isRootDependency) {
      this.graph.setNode(registryPackage.name, { version, fullName });
      this.graph.setNode(fullName);
      this.graph.setEdge(task.parentNode, registryPackage.name);
    } else {
      this.graph.setEdge(task.parentNode, fullName);
    }

    if (subDepsResolved) {
      return;
    }

    const dependencies = versionPackageJson.dependencies || {};
    const depNames = Object.keys(dependencies);

    return this.registry.batchFetch(depNames).then(() => {
      depNames.forEach(name => {
        this.loadRegistryPackage({
          name,
          version: dependencies[name],
          parentNode: fullName
        })
      });
    });
  }

  resolveVersion(requestedVersion, registryPackage){
    if(registryPackage['dist-tags'] && registryPackage['dist-tags'].hasOwnProperty(requestedVersion)){
      return registryPackage['dist-tags'][requestedVersion];
    }

    const availableVersions = Object.keys(registryPackage.versions || {});

    if(requestedVersion === ''){
      requestedVersion = '*';
    }

    let version = semver.maxSatisfying(availableVersions, requestedVersion, true);

    if(!version && requestedVersion === '*' && availableVersions.every(availableVersion => !!semver(availableVersion, true).prerelease.length)){
      version = registryPackage['dist-tags'] && registryPackage['dist-tags'].latest;
    }

    if(!version){
      throw new Error(`jsdelivr has not synced "${registryPackage.name}": "${requestedVersion}".`);
    }
    return version;
  }

  // Jpack Rendering
  fillJpackDep(fullName, versionPkg, dep){
    this.graph.successors(fullName).forEach(name => {
      if(name.substr(1).indexOf('@') === -1){ // dependency is a peer
        const peerDep = this.graph.node(name);

        if(peerDep){
          dep.dependencies[name] = `${name}@${peerDep.version}`;
        }
      } else {
        dep.dependencies[name.substr(0, name.lastIndexOf('@'))] = name;
        this.addJpackResDep(name);
      }
    });
  }

  addJpackResDep(fullName){
    if(!this.jpack.resDependencies.hasOwnProperty(fullName)){
      // TODO: encode this information in nodes instead of using string ops
      const atIndex = fullName.lastIndexOf('@');

      if(atIndex <= 0){ // No '@' in string, or only '@' is first character (dependency is a peer)
        this.fillJpackDep(fullName, null, this.jpack.appDependencies[fullName])
      } else {
        const depName = fullName.substr(0, atIndex);
        const version = fullName.substr(atIndex + 1);
        const versionPkg = this.registry.cache[depName].versions[version];
        const resDep = this.jpack.resDependencies[fullName] = { dependencies: {} };

        this.fillJpackDep(fullName, versionPkg, resDep);
      }
    }
  }

  renderJpack(){
    this.graph.successors('root').forEach(depName => {
      const { version, fullName } = this.graph.node(depName);
      const versionPkg = this.registry.cache[depName].versions[version];
      const appDep = this.jpack.appDependencies[depName] = { version, dependencies: {} };

      this.fillJpackDep(fullName, versionPkg, appDep);
    });

    return this.jpack;
  }

  resolve(dependencies){
    return new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
      const depNames = Object.keys(dependencies);

      if(depNames.length === 0){
        return resolve(this.jpack);
      }

      this.startTime = Date.now();

      this.registry.batchFetch(depNames).then(() => {
        depNames.forEach(name => {
          this.loadRegistryPackage({
            name,
            version: dependencies[name],
            parentNode: 'root'
          })
        });
      });
    });
  }
}
