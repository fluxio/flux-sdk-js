import { setPorts } from './ports';
import FluxSdk from './models/flux-sdk';

function fluxSdkWrapper(ports = {}) {
  setPorts(ports);
  return FluxSdk;
}

export default fluxSdkWrapper;
