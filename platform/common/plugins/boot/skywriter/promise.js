require.def(['require', 'exports', 'module'
], function(require, exports, module
) {

/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Skywriter.
 *
 * The Initial Developer of the Original Code is
 * Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Skywriter Team (skywriter@mozilla.com)
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

/*FIXME/Refactor, put this code in the platform's boot script'*/
var nodejs = typeof(process) !== undefined ? true: false;

var Trace;

if(nodejs) {
    Trace = require('skywriter/util/stacktrace').Trace
} else {
    Trace = require('skywriter:util/stacktrace').Trace;
    console = require('skywriter:console').console
}

/**
 * A promise can be in one of 2 states.
 * The ERROR and SUCCESS states are terminal, the PENDING state is the only
 * start state.
 */
var ERROR = -1;
var PENDING = 0;
var SUCCESS = 1;

/**
 * We give promises and ID so we can track which are outstanding
 */
var _nextId = 0;

/**
 * Debugging help if 2 things try to complete the same promise.
 * This can be slow (especially on chrome due to the stack trace unwinding) so
 * we should leave this turned off in normal use.
 */
var _traceCompletion = false;

/**
 * Outstanding promises. Handy list for debugging only.
 */
exports._outstanding = [];

/**
 * Recently resolved promises. Also for debugging only.
 */
exports._recent = [];

/**
 * Create an unfulfilled promise
 */
exports.Promise = function () {
    this._status = PENDING;
    this._value = undefined;
    this._onSuccessHandlers = [];
    this._onErrorHandlers = [];

    // Debugging help
    this._id = _nextId++;
    //this._createTrace = new Trace(new Error());
    exports._outstanding[this._id] = this;
};

/**
 * Yeay for RTTI.
 */
exports.Promise.prototype.isPromise = true;

/**
 * Have we either been resolve()ed or reject()ed?
 */
exports.Promise.prototype.isComplete = function() {
    return this._status != PENDING;
};

/**
 * Have we resolve()ed?
 */
exports.Promise.prototype.isResolved = function() {
    return this._status == SUCCESS;
};

/**
 * Have we reject()ed?
 */
exports.Promise.prototype.isRejected = function() {
    return this._status == ERROR;
};

/**
 * Take the specified action of fulfillment of a promise, and (optionally)
 * a different action on promise rejection.
 */
exports.Promise.prototype.then = function(onSuccess, onError) {
    if (typeof onSuccess === 'function') {
        if (this._status === SUCCESS) {
            onSuccess.call(null, this._value);
        } else if (this._status === PENDING) {
            this._onSuccessHandlers.push(onSuccess);
        }
    }

    if (typeof onError === 'function') {
        if (this._status === ERROR) {
            onError.call(null, this._value);
        } else if (this._status === PENDING) {
            this._onErrorHandlers.push(onError);
        }
    }

    return this;
};

/**
 * Like then() except that rather than returning <tt>this</tt> we return
 * a promise which
 */
exports.Promise.prototype.chainPromise = function(onSuccess) {
    var chain = new exports.Promise();
    chain._chainedFrom = this;
    this.then(function(data) {
        try {
            chain.resolve(onSuccess(data));
        } catch (ex) {
            chain.reject(ex);
        }
    }, function(ex) {
        chain.reject(ex);
    });
    return chain;
};

/**
 * Supply the fulfillment of a promise
 */
exports.Promise.prototype.resolve = function(data) {
    return this._complete(this._onSuccessHandlers, SUCCESS, data, 'resolve');
};

/**
 * Renege on a promise
 */
exports.Promise.prototype.reject = function(data) {
    return this._complete(this._onErrorHandlers, ERROR, data, 'reject');
};

/**
 * Internal method to be called on resolve() or reject().
 * @private
 */
exports.Promise.prototype._complete = function(list, status, data, name) {
    // Complain if we've already been completed
    if (this._status != PENDING) {
        console.group('Promise already closed');
        console.error('Attempted ' + name + '() with ', data);
        console.error('Previous status = ', this._status,
                ', previous value = ', this._value);
        console.trace();

        if (this._completeTrace) {
            console.error('Trace of previous completion:');
            this._completeTrace.log(5);
        }
        console.groupEnd();
        return this;
    }

    if (_traceCompletion) {
        this._completeTrace = new Trace(new Error());
    }

    this._status = status;
    this._value = data;

    // Call all the handlers, and then delete them
    list.forEach(function(handler) {
        handler.call(null, this._value);
    }, this);
    this._onSuccessHandlers.length = 0;
    this._onErrorHandlers.length = 0;

    // Remove the given {promise} from the _outstanding list, and add it to the
    // _recent list, pruning more than 20 recent promises from that list.
    delete exports._outstanding[this._id];
    exports._recent.push(this);
    while (exports._recent.length > 20) {
        exports._recent.shift();
    }

    return this;
};

/**
 * Takes an array of promises and returns a promise that that is fulfilled once
 * all the promises in the array are fulfilled
 * @param group The array of promises
 * @return the promise that is fulfilled when all the array is fulfilled
 */
exports.group = function(promiseList) {
    if (!(promiseList instanceof Array)) {
        promiseList = Array.prototype.slice.call(arguments);
    }

    // If the original array has nothing in it, return now to avoid waiting
    if (promiseList.length === 0) {
        return new exports.Promise().resolve([]);
    }

    var groupPromise = new exports.Promise();
    var results = [];
    var fulfilled = 0;

    var onSuccessFactory = function(index) {
        return function(data) {
            results[index] = data;
            fulfilled++;
            // If the group has already failed, silently drop extra results
            if (groupPromise._status !== ERROR) {
                if (fulfilled === promiseList.length) {
                    groupPromise.resolve(results);
                }
            }
        };
    };

    promiseList.forEach(function(promise, index) {
        var onSuccess = onSuccessFactory(index);
        var onError = groupPromise.reject.bind(groupPromise);
        promise.then(onSuccess, onError);
    });

    return groupPromise;
};

/**
 * Take an asynchronous function (i.e. one that returns a promise) and
 * return a synchronous version of the same function.
 * Clearly this is impossible without blocking or busy waiting (both evil).
 * In this case we make the assumption that the called function is only
 * theoretically asynchronous (which is actually common with Skywriter, because the
 * most common cause of asynchronaity is the lazy loading module system which
 * can sometimes be proved to be synchronous in use, even though in theory
 * there is the potential for asynch behaviour)
 */
exports.synchronizer = function(func, scope) {
    return function() {
        var promise = func.apply(scope, arguments);
        if (!promise.isComplete()) {
            throw new Error('asynchronous function can\'t be synchronized');
        }
        return promise._value;
    };
};


});
