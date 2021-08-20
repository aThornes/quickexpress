import {
  initialiseEndpoints,
  validateWrapperData,
} from './src/initialiseHandler';

class ExpressWrapper {
  wrapperData: WrapperStruc;

  constructor(data: WrapperStruc) {
    /* Mongo client is required for using a request limiter */
    validateWrapperData(data);

    this.wrapperData = data;
  }

  /**
   * Intialise all endpoints and begin express listener
   */
  async initialise() {
    return initialiseEndpoints(this.wrapperData);
  }

  /**
   * Get endpoint names
   * @returns array of all endpoint names
   */
  getEndpointList() {
    return this.wrapperData.endpoints.map((x) => x.name);
  }

  /**
   * Get endpoint data
   * @returns array of endpoint structures
   */
  getEndpointData() {
    return this.wrapperData.endpoints;
  }
}

export default ExpressWrapper;
