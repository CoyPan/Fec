import * as typeDetect from '../utils/typeDetect';

const ERROR_TYPE = {
    'EVENT': 'addEventListener',
    'FETCH': 'fetch',
    'AJAX': 'ajax',
    'CONSOLE': 'console.error',
    'PROMISE': 'promise'
};

class Fec {

    constructor(props) {

        this.nativeAddEventListener = null;
        this.nativeFetch = null;
        this.nativeAjaxSend = null;
        this.nativeAjaxOpen = null;
        this.nativeConsoleError = null;
        this.nativePromiseCatch = null;
        this.nativePromiseThen = null;

        this.onErrorCallBack = props.onError;
    }

    init() {
        this.proxyAddEventListener();
        this.proxyFetch();
        this.proxyAjax();
        this.proxyOnError();
        this.proxyConsoleError();
    }

    proxyAddEventListener() {
        const self = this;
        this.nativeAddEventListener = EventTarget.prototype.addEventListener;
        EventTarget.prototype.addEventListener = function (type, func, options) {
            const wrappedFunc = function (...args) {
                try {
                    return func.apply(this, args);
                } catch (e) {
                    const errorObj = {
                        error_msg: e.message || '',
                        error_stack: e.stack || (e.error && e.error.stack) || '',
                        error_catched_type: e['error_catched_type'] || ERROR_TYPE['EVENT'],
                        error_native: e
                    };
                    self.fire(errorObj);
                }
            }
            return self.nativeAddEventListener.call(this, type, wrappedFunc, options);
        }
    }

    proxyFetch() {
        if (!window.fetch) {
            return;
        }
        const self = this;
        this.nativeFetch = window.fetch;
        window.fetch = function (...args) {
            return self.nativeFetch(...args)
                .then(res => {
                    if (!res.ok) {
                        this.fire({
                            error_msg: JSON.stringify({
                                code: res.status,
                                msg: res.statusText
                            }),
                            error_stack: '',
                            error_catched_type: ERROR_TYPE['FETCH'],
                            error_native: res
                        });
                    }
                }).catch(e => {
                    this.fire({
                        error_msg: e.message || '',
                        error_stack: e.stack || '',
                        error_catched_type: ERROR_TYPE['FETCH'],
                        error_native: e
                    });
                });
        }
    }

    proxyAjax() {
        if (!XMLHttpRequest) {
            return;
        }

        this.nativeAjaxSend = XMLHttpRequest.prototype.send;
        this.nativeAjaxOpen = XMLHttpRequest.prototype.open;

        const self = this;

        XMLHttpRequest.prototype.open = function (mothod, url, ...args) {
            const xhrInstance = this;
            xhrInstance._url = url;
            return self.nativeAjaxOpen.apply(this, [mothod, url].concat(args));
        }

        XMLHttpRequest.prototype.send = function (...args) {

            const oldCb = this.onreadystatechange;
            const xhrInstance = this;

            xhrInstance.addEventListener('error', function (e) {
                const errorObj = {
                    error_msg: 'ajax filed',
                    error_stack: JSON.stringify({
                        status: e.target.status,
                        statusText: e.target.statusText
                    }),
                    error_catched_type: ERROR_TYPE['AJAX'],
                    error_native: e
                }
                self.fire(errorObj);
            });


            xhrInstance.addEventListener('abort', function (e) {
                if (e.type === 'abort') {
                    xhrInstance._isAbort = true;
                }
            });


            this.onreadystatechange = function (...innerArgs) {
                if (xhrInstance.readyState === 4) {
                    if (!xhrInstance._isAbort && xhrInstance.status !== 200) {
                        self.fire({
                            error_msg: JSON.stringify({
                                code: xhrInstance.status,
                                msg: xhrInstance.statusText,
                                url: xhrInstance._url
                            }),
                            error_stack: '',
                            error_catched_type: ERROR_TYPE['AJAX'],
                            error_native: xhrInstance
                        });
                    }
                }
                oldCb && oldCb.apply(this, innerArgs);
            }
            return self.nativeAjaxSend.apply(this, args);
        }
    }

    proxyOnError() {
        const self = this;
        window.addEventListener('error', function (e) {
            throw e;
        });

        window.addEventListener('unhandledrejection', function (e) {
            self.fire({
                error_msg: e.reason && e.reason.message || '',
                error_stack: e.reason && e.reason.stack || '',
                error_catched_type: ERROR_TYPE['PROMISE'],
                error_native: e
            });
        });
    }

    proxyConsoleError() {
        const self = this;
        this.nativeConsoleError = window.console.error;
        window.console.error = function (...args) {
            args.forEach(item => {
                if (typeDetect.isObject(item) || typeDetect.isError(item)) {
                    self.fire({
                        error_msg: item.message || '',
                        error_stack: item.stack || '',
                        error_catched_type: ERROR_TYPE['CONSOLE'],
                        error_native: item
                    });
                } else {
                    self.fire({
                        error_msg: JSON.stringify(item),
                        error_stack: JSON.stringify(item),
                        error_catched_type: ERROR_TYPE['CONSOLE'],
                        error_native: item
                    });
                }
            });
            self.nativeConsoleError.apply(this, args);
        }
    }

    fire(e) {
        this.onErrorCallBack && this.onErrorCallBack(e);
    }

}

export default Fec;