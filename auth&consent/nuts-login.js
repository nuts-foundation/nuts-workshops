let NutsLogin = (function () {

  const init = function (config) {

    // set default config values

    // the url of the nuts-auth server
    config.nutsAuthUrl = 'nutsAuthUrl' in config ? config.nutsAuthUrl : 'http://localhost:1323';
    // which element to show the qrcode in
    config.qrEl = 'qrEl' in config ? config.qrEl : 'qrcode';
    // log login results to console.log
    config.logLevel = 'logLevel' in config ? config.logLevel : 'none';
    // on success, post token to which path?
    config.postTokenPath = 'postTokenPath' in config ? config.postTokenPath : '/login';

    if (!document.getElementById(config.qrEl)) {
      throw(`Could not load qr code: element with id ${config.qrEl} not found!`);
    }
    // attach a qrcode the qrcode div
    let qrcode = new QRCode(config.qrEl);

    const fetchStatus = function (sessionId) {
      return fetch(`${config.nutsAuthUrl}/auth/contract/session/${sessionId}`, {
        method: 'GET',
        mode: 'cors',
        headers: {"Content-Type": "application/json"},
        cache: 'reload'
      }).then((result) => result.json())
    };

    const showHelper = function () {
      document.querySelector('.irma-web-form .header').classList.add('show-helper');
    };

    const hideHelper = function () {
      document.querySelector('.irma-web-form .header').classList.remove('show-helper');
    };


    const start = function () {
      qrcode.clear()

      setState(WAIT_FOR_QR_CODE);

      let existingSessionInit = JSON.parse(localStorage.getItem('session_init_info'));
      if (existingSessionInit) {
        qrcode.makeCode(JSON.stringify(existingSessionInit.qr_code_info));
        pollForStatus(existingSessionInit.session_id);
        return;
      }

      // show helper after 20 seconds
      setTimeout(showHelper, 20000);

      let postData = {
        type: "BehandelaarLogin",
        language: "NL",
        version: "v1"
      };

      fetch(`${config.nutsAuthUrl}/auth/contract/session`, {
        method: 'POST',
        mode: 'cors',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(postData),
        cache: 'reload'
      }).then((result) => result.json()
      ).then((result) => {
        qrcode.makeCode(JSON.stringify(result.qr_code_info));
        localStorage.setItem('session_init_info', JSON.stringify(result));
        pollForStatus(result.session_id);
      }).catch((err) => {
          console.log("err", err);
          stateMachine("ERROR")
        }
      );
    };


    const pollForStatus = function (sessionId) {
      fetchStatus(sessionId)
        .then((status) => {
          if (config.logLevel === 'debug') {
            console.log("state:", status);
          }
          stateMachine(status);
        }).catch((err) => {
          console.log(err);
          stateMachine("ERROR");
        }
      )
    };

// handle these cases: https://godoc.org/github.com/privacybydesign/irmago/server#Status
    const stateMachine = function (status) {
      switch (status.status) {
        case "INITIALIZED":
          setState(INITIALIZED_STATE);
          setTimeout(() => pollForStatus(status.token), 1000);
          break;
        case "CONNECTED":
          setState(WAITING_FOR_USER_STATE);
          setTimeout(() => pollForStatus(status.token), 1000);
          break;
        case "TIMEOUT":
          localStorage.clear();
          setState(EXPIRED_STATE);
          break;
        case "CANCELLED":
          localStorage.clear();
          setState(CANCELLED_STATE);
          break;
        case "DONE":
          localStorage.clear();
          if (status.proofStatus === "VALID") {
            setState(SUCCESS_STATE);
            setTimeout(() => handleSuccess(status), 2000)
          } else {
            setState(ERROR_STATE);
          }
          break;
        case "ERROR":
        default:
          localStorage.clear();
          setState(ERROR_STATE);
          break;
      }
    };

    const handleSuccess = function (status) {
      fetch(config.postTokenPath, {
        method: 'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(status.nuts_auth_token),
        cache: 'reload',
        json: true
      }).then((res) => {
        if (config.logLevel === 'debug') {
          console.log("result", res);
        }
        window.location = '/user'
      }).catch((err) => {
        console.log("error while validating session", err);
      })
    };

    const WAIT_FOR_QR_CODE = 'loading';
    const INITIALIZED_STATE = 'initialized';
    const WAITING_FOR_USER_STATE = 'waiting-for-user';
    const SUCCESS_STATE = 'success';
    const EXPIRED_STATE = 'expired';
    const CANCELLED_STATE = 'cancelled';
    const ERROR_STATE = 'errored';

    let currentState;

    const stateEl = function (state) {
      return document.querySelector(`.irma-web-form .content .${state}`)
    };

    const setState = function (state) {
      currentState = state;
      hideAllStates();
      stateEl(state).style.display = ""
    };

    const hideAllStates = function () {
      document.querySelectorAll(`.irma-web-form .content .centered`).forEach((el) => {
        el.style.display = 'none'
      })
    };

    return {
      hideHelper,
      start,
    }
  };

  return {
    init,
  };

})();
