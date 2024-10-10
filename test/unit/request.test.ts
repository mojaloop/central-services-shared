import tape from 'tape';
import tapes from 'tapes';

import sinon from 'sinon';
import proxyquire from 'proxyquire';
import { Http } from '../../src/enums';

const Test = tapes(tape);

Test('sendRequest Tests -->', test => {
  let sandbox;
  let axios;
  let request;

  test.beforeEach(t => {
    sandbox = sinon.createSandbox();
    axios = sandbox.stub();
    request = proxyquire('../../src/util/request', { axios });
    // sinon can't mock such way of using axios: axios(requestOptions)
    t.end();
  });

  test.afterEach(t => {
    sandbox.restore();
    t.end();
  });

  test.test('should add fspiop-signature header if jwsSigner is passed ', async test => {
    const signature = 'signature';
    const jwsSigner = {
      getSignature: sandbox.stub().callsFake(() => signature)
    };

    await request.sendRequest({
      url: 'http://localhost:1234',
      jwsSigner,
      headers: {
        [Http.Headers.FSPIOP.SOURCE]: 'source'
      },
      source: 'source',
      destination: 'destination',
      hubNameRegex: 'hubNameRegex'
    });

    test.ok(axios.calledOnce);
    const { headers } = axios.lastCall.args[0];
    test.equal(headers['fspiop-signature'], signature);
    test.end();
  });

  test.end();
});
