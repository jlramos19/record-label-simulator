function ak(D) {
  return D && D.__esModule && Object.prototype.hasOwnProperty.call(D, "default") ? D.default : D;
}
var mE = { exports: {} }, Xp = {}, Wm = { exports: {} }, Rt = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var nT;
function ik() {
  if (nT) return Rt;
  nT = 1;
  var D = Symbol.for("react.element"), F = Symbol.for("react.portal"), k = Symbol.for("react.fragment"), ce = Symbol.for("react.strict_mode"), Te = Symbol.for("react.profiler"), ze = Symbol.for("react.provider"), S = Symbol.for("react.context"), mt = Symbol.for("react.forward_ref"), Y = Symbol.for("react.suspense"), te = Symbol.for("react.memo"), _e = Symbol.for("react.lazy"), ee = Symbol.iterator;
  function ge(_) {
    return _ === null || typeof _ != "object" ? null : (_ = ee && _[ee] || _["@@iterator"], typeof _ == "function" ? _ : null);
  }
  var ae = { isMounted: function() {
    return !1;
  }, enqueueForceUpdate: function() {
  }, enqueueReplaceState: function() {
  }, enqueueSetState: function() {
  } }, fe = Object.assign, Ie = {};
  function Je(_, B, $e) {
    this.props = _, this.context = B, this.refs = Ie, this.updater = $e || ae;
  }
  Je.prototype.isReactComponent = {}, Je.prototype.setState = function(_, B) {
    if (typeof _ != "object" && typeof _ != "function" && _ != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
    this.updater.enqueueSetState(this, _, B, "setState");
  }, Je.prototype.forceUpdate = function(_) {
    this.updater.enqueueForceUpdate(this, _, "forceUpdate");
  };
  function It() {
  }
  It.prototype = Je.prototype;
  function tt(_, B, $e) {
    this.props = _, this.context = B, this.refs = Ie, this.updater = $e || ae;
  }
  var Ge = tt.prototype = new It();
  Ge.constructor = tt, fe(Ge, Je.prototype), Ge.isPureReactComponent = !0;
  var ft = Array.isArray, Ne = Object.prototype.hasOwnProperty, Ze = { current: null }, He = { key: !0, ref: !0, __self: !0, __source: !0 };
  function en(_, B, $e) {
    var Be, dt = {}, ut = null, it = null;
    if (B != null) for (Be in B.ref !== void 0 && (it = B.ref), B.key !== void 0 && (ut = "" + B.key), B) Ne.call(B, Be) && !He.hasOwnProperty(Be) && (dt[Be] = B[Be]);
    var ot = arguments.length - 2;
    if (ot === 1) dt.children = $e;
    else if (1 < ot) {
      for (var pt = Array(ot), Yt = 0; Yt < ot; Yt++) pt[Yt] = arguments[Yt + 2];
      dt.children = pt;
    }
    if (_ && _.defaultProps) for (Be in ot = _.defaultProps, ot) dt[Be] === void 0 && (dt[Be] = ot[Be]);
    return { $$typeof: D, type: _, key: ut, ref: it, props: dt, _owner: Ze.current };
  }
  function Ht(_, B) {
    return { $$typeof: D, type: _.type, key: B, ref: _.ref, props: _.props, _owner: _._owner };
  }
  function $t(_) {
    return typeof _ == "object" && _ !== null && _.$$typeof === D;
  }
  function Lt(_) {
    var B = { "=": "=0", ":": "=2" };
    return "$" + _.replace(/[=:]/g, function($e) {
      return B[$e];
    });
  }
  var yt = /\/+/g;
  function Le(_, B) {
    return typeof _ == "object" && _ !== null && _.key != null ? Lt("" + _.key) : B.toString(36);
  }
  function Et(_, B, $e, Be, dt) {
    var ut = typeof _;
    (ut === "undefined" || ut === "boolean") && (_ = null);
    var it = !1;
    if (_ === null) it = !0;
    else switch (ut) {
      case "string":
      case "number":
        it = !0;
        break;
      case "object":
        switch (_.$$typeof) {
          case D:
          case F:
            it = !0;
        }
    }
    if (it) return it = _, dt = dt(it), _ = Be === "" ? "." + Le(it, 0) : Be, ft(dt) ? ($e = "", _ != null && ($e = _.replace(yt, "$&/") + "/"), Et(dt, B, $e, "", function(Yt) {
      return Yt;
    })) : dt != null && ($t(dt) && (dt = Ht(dt, $e + (!dt.key || it && it.key === dt.key ? "" : ("" + dt.key).replace(yt, "$&/") + "/") + _)), B.push(dt)), 1;
    if (it = 0, Be = Be === "" ? "." : Be + ":", ft(_)) for (var ot = 0; ot < _.length; ot++) {
      ut = _[ot];
      var pt = Be + Le(ut, ot);
      it += Et(ut, B, $e, pt, dt);
    }
    else if (pt = ge(_), typeof pt == "function") for (_ = pt.call(_), ot = 0; !(ut = _.next()).done; ) ut = ut.value, pt = Be + Le(ut, ot++), it += Et(ut, B, $e, pt, dt);
    else if (ut === "object") throw B = String(_), Error("Objects are not valid as a React child (found: " + (B === "[object Object]" ? "object with keys {" + Object.keys(_).join(", ") + "}" : B) + "). If you meant to render a collection of children, use an array instead.");
    return it;
  }
  function Tt(_, B, $e) {
    if (_ == null) return _;
    var Be = [], dt = 0;
    return Et(_, Be, "", "", function(ut) {
      return B.call($e, ut, dt++);
    }), Be;
  }
  function kt(_) {
    if (_._status === -1) {
      var B = _._result;
      B = B(), B.then(function($e) {
        (_._status === 0 || _._status === -1) && (_._status = 1, _._result = $e);
      }, function($e) {
        (_._status === 0 || _._status === -1) && (_._status = 2, _._result = $e);
      }), _._status === -1 && (_._status = 0, _._result = B);
    }
    if (_._status === 1) return _._result.default;
    throw _._result;
  }
  var Se = { current: null }, Z = { transition: null }, xe = { ReactCurrentDispatcher: Se, ReactCurrentBatchConfig: Z, ReactCurrentOwner: Ze };
  function ie() {
    throw Error("act(...) is not supported in production builds of React.");
  }
  return Rt.Children = { map: Tt, forEach: function(_, B, $e) {
    Tt(_, function() {
      B.apply(this, arguments);
    }, $e);
  }, count: function(_) {
    var B = 0;
    return Tt(_, function() {
      B++;
    }), B;
  }, toArray: function(_) {
    return Tt(_, function(B) {
      return B;
    }) || [];
  }, only: function(_) {
    if (!$t(_)) throw Error("React.Children.only expected to receive a single React element child.");
    return _;
  } }, Rt.Component = Je, Rt.Fragment = k, Rt.Profiler = Te, Rt.PureComponent = tt, Rt.StrictMode = ce, Rt.Suspense = Y, Rt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = xe, Rt.act = ie, Rt.cloneElement = function(_, B, $e) {
    if (_ == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + _ + ".");
    var Be = fe({}, _.props), dt = _.key, ut = _.ref, it = _._owner;
    if (B != null) {
      if (B.ref !== void 0 && (ut = B.ref, it = Ze.current), B.key !== void 0 && (dt = "" + B.key), _.type && _.type.defaultProps) var ot = _.type.defaultProps;
      for (pt in B) Ne.call(B, pt) && !He.hasOwnProperty(pt) && (Be[pt] = B[pt] === void 0 && ot !== void 0 ? ot[pt] : B[pt]);
    }
    var pt = arguments.length - 2;
    if (pt === 1) Be.children = $e;
    else if (1 < pt) {
      ot = Array(pt);
      for (var Yt = 0; Yt < pt; Yt++) ot[Yt] = arguments[Yt + 2];
      Be.children = ot;
    }
    return { $$typeof: D, type: _.type, key: dt, ref: ut, props: Be, _owner: it };
  }, Rt.createContext = function(_) {
    return _ = { $$typeof: S, _currentValue: _, _currentValue2: _, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, _.Provider = { $$typeof: ze, _context: _ }, _.Consumer = _;
  }, Rt.createElement = en, Rt.createFactory = function(_) {
    var B = en.bind(null, _);
    return B.type = _, B;
  }, Rt.createRef = function() {
    return { current: null };
  }, Rt.forwardRef = function(_) {
    return { $$typeof: mt, render: _ };
  }, Rt.isValidElement = $t, Rt.lazy = function(_) {
    return { $$typeof: _e, _payload: { _status: -1, _result: _ }, _init: kt };
  }, Rt.memo = function(_, B) {
    return { $$typeof: te, type: _, compare: B === void 0 ? null : B };
  }, Rt.startTransition = function(_) {
    var B = Z.transition;
    Z.transition = {};
    try {
      _();
    } finally {
      Z.transition = B;
    }
  }, Rt.unstable_act = ie, Rt.useCallback = function(_, B) {
    return Se.current.useCallback(_, B);
  }, Rt.useContext = function(_) {
    return Se.current.useContext(_);
  }, Rt.useDebugValue = function() {
  }, Rt.useDeferredValue = function(_) {
    return Se.current.useDeferredValue(_);
  }, Rt.useEffect = function(_, B) {
    return Se.current.useEffect(_, B);
  }, Rt.useId = function() {
    return Se.current.useId();
  }, Rt.useImperativeHandle = function(_, B, $e) {
    return Se.current.useImperativeHandle(_, B, $e);
  }, Rt.useInsertionEffect = function(_, B) {
    return Se.current.useInsertionEffect(_, B);
  }, Rt.useLayoutEffect = function(_, B) {
    return Se.current.useLayoutEffect(_, B);
  }, Rt.useMemo = function(_, B) {
    return Se.current.useMemo(_, B);
  }, Rt.useReducer = function(_, B, $e) {
    return Se.current.useReducer(_, B, $e);
  }, Rt.useRef = function(_) {
    return Se.current.useRef(_);
  }, Rt.useState = function(_) {
    return Se.current.useState(_);
  }, Rt.useSyncExternalStore = function(_, B, $e) {
    return Se.current.useSyncExternalStore(_, B, $e);
  }, Rt.useTransition = function() {
    return Se.current.useTransition();
  }, Rt.version = "18.3.1", Rt;
}
var Zp = { exports: {} };
/**
 * @license React
 * react.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
Zp.exports;
var rT;
function lk() {
  return rT || (rT = 1, function(D, F) {
    process.env.NODE_ENV !== "production" && function() {
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(new Error());
      var k = "18.3.1", ce = Symbol.for("react.element"), Te = Symbol.for("react.portal"), ze = Symbol.for("react.fragment"), S = Symbol.for("react.strict_mode"), mt = Symbol.for("react.profiler"), Y = Symbol.for("react.provider"), te = Symbol.for("react.context"), _e = Symbol.for("react.forward_ref"), ee = Symbol.for("react.suspense"), ge = Symbol.for("react.suspense_list"), ae = Symbol.for("react.memo"), fe = Symbol.for("react.lazy"), Ie = Symbol.for("react.offscreen"), Je = Symbol.iterator, It = "@@iterator";
      function tt(h) {
        if (h === null || typeof h != "object")
          return null;
        var C = Je && h[Je] || h[It];
        return typeof C == "function" ? C : null;
      }
      var Ge = {
        /**
         * @internal
         * @type {ReactComponent}
         */
        current: null
      }, ft = {
        transition: null
      }, Ne = {
        current: null,
        // Used to reproduce behavior of `batchedUpdates` in legacy mode.
        isBatchingLegacy: !1,
        didScheduleLegacyUpdate: !1
      }, Ze = {
        /**
         * @internal
         * @type {ReactComponent}
         */
        current: null
      }, He = {}, en = null;
      function Ht(h) {
        en = h;
      }
      He.setExtraStackFrame = function(h) {
        en = h;
      }, He.getCurrentStack = null, He.getStackAddendum = function() {
        var h = "";
        en && (h += en);
        var C = He.getCurrentStack;
        return C && (h += C() || ""), h;
      };
      var $t = !1, Lt = !1, yt = !1, Le = !1, Et = !1, Tt = {
        ReactCurrentDispatcher: Ge,
        ReactCurrentBatchConfig: ft,
        ReactCurrentOwner: Ze
      };
      Tt.ReactDebugCurrentFrame = He, Tt.ReactCurrentActQueue = Ne;
      function kt(h) {
        {
          for (var C = arguments.length, z = new Array(C > 1 ? C - 1 : 0), H = 1; H < C; H++)
            z[H - 1] = arguments[H];
          Z("warn", h, z);
        }
      }
      function Se(h) {
        {
          for (var C = arguments.length, z = new Array(C > 1 ? C - 1 : 0), H = 1; H < C; H++)
            z[H - 1] = arguments[H];
          Z("error", h, z);
        }
      }
      function Z(h, C, z) {
        {
          var H = Tt.ReactDebugCurrentFrame, J = H.getStackAddendum();
          J !== "" && (C += "%s", z = z.concat([J]));
          var Ae = z.map(function(le) {
            return String(le);
          });
          Ae.unshift("Warning: " + C), Function.prototype.apply.call(console[h], console, Ae);
        }
      }
      var xe = {};
      function ie(h, C) {
        {
          var z = h.constructor, H = z && (z.displayName || z.name) || "ReactClass", J = H + "." + C;
          if (xe[J])
            return;
          Se("Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.", C, H), xe[J] = !0;
        }
      }
      var _ = {
        /**
         * Checks whether or not this composite component is mounted.
         * @param {ReactClass} publicInstance The instance we want to test.
         * @return {boolean} True if mounted, false otherwise.
         * @protected
         * @final
         */
        isMounted: function(h) {
          return !1;
        },
        /**
         * Forces an update. This should only be invoked when it is known with
         * certainty that we are **not** in a DOM transaction.
         *
         * You may want to call this when you know that some deeper aspect of the
         * component's state has changed but `setState` was not called.
         *
         * This will not invoke `shouldComponentUpdate`, but it will invoke
         * `componentWillUpdate` and `componentDidUpdate`.
         *
         * @param {ReactClass} publicInstance The instance that should rerender.
         * @param {?function} callback Called after component is updated.
         * @param {?string} callerName name of the calling function in the public API.
         * @internal
         */
        enqueueForceUpdate: function(h, C, z) {
          ie(h, "forceUpdate");
        },
        /**
         * Replaces all of the state. Always use this or `setState` to mutate state.
         * You should treat `this.state` as immutable.
         *
         * There is no guarantee that `this.state` will be immediately updated, so
         * accessing `this.state` after calling this method may return the old value.
         *
         * @param {ReactClass} publicInstance The instance that should rerender.
         * @param {object} completeState Next state.
         * @param {?function} callback Called after component is updated.
         * @param {?string} callerName name of the calling function in the public API.
         * @internal
         */
        enqueueReplaceState: function(h, C, z, H) {
          ie(h, "replaceState");
        },
        /**
         * Sets a subset of the state. This only exists because _pendingState is
         * internal. This provides a merging strategy that is not available to deep
         * properties which is confusing. TODO: Expose pendingState or don't use it
         * during the merge.
         *
         * @param {ReactClass} publicInstance The instance that should rerender.
         * @param {object} partialState Next partial state to be merged with state.
         * @param {?function} callback Called after component is updated.
         * @param {?string} Name of the calling function in the public API.
         * @internal
         */
        enqueueSetState: function(h, C, z, H) {
          ie(h, "setState");
        }
      }, B = Object.assign, $e = {};
      Object.freeze($e);
      function Be(h, C, z) {
        this.props = h, this.context = C, this.refs = $e, this.updater = z || _;
      }
      Be.prototype.isReactComponent = {}, Be.prototype.setState = function(h, C) {
        if (typeof h != "object" && typeof h != "function" && h != null)
          throw new Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
        this.updater.enqueueSetState(this, h, C, "setState");
      }, Be.prototype.forceUpdate = function(h) {
        this.updater.enqueueForceUpdate(this, h, "forceUpdate");
      };
      {
        var dt = {
          isMounted: ["isMounted", "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."],
          replaceState: ["replaceState", "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."]
        }, ut = function(h, C) {
          Object.defineProperty(Be.prototype, h, {
            get: function() {
              kt("%s(...) is deprecated in plain JavaScript React classes. %s", C[0], C[1]);
            }
          });
        };
        for (var it in dt)
          dt.hasOwnProperty(it) && ut(it, dt[it]);
      }
      function ot() {
      }
      ot.prototype = Be.prototype;
      function pt(h, C, z) {
        this.props = h, this.context = C, this.refs = $e, this.updater = z || _;
      }
      var Yt = pt.prototype = new ot();
      Yt.constructor = pt, B(Yt, Be.prototype), Yt.isPureReactComponent = !0;
      function On() {
        var h = {
          current: null
        };
        return Object.seal(h), h;
      }
      var br = Array.isArray;
      function Cn(h) {
        return br(h);
      }
      function nr(h) {
        {
          var C = typeof Symbol == "function" && Symbol.toStringTag, z = C && h[Symbol.toStringTag] || h.constructor.name || "Object";
          return z;
        }
      }
      function Vn(h) {
        try {
          return Bn(h), !1;
        } catch {
          return !0;
        }
      }
      function Bn(h) {
        return "" + h;
      }
      function Yr(h) {
        if (Vn(h))
          return Se("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", nr(h)), Bn(h);
      }
      function si(h, C, z) {
        var H = h.displayName;
        if (H)
          return H;
        var J = C.displayName || C.name || "";
        return J !== "" ? z + "(" + J + ")" : z;
      }
      function oa(h) {
        return h.displayName || "Context";
      }
      function qn(h) {
        if (h == null)
          return null;
        if (typeof h.tag == "number" && Se("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof h == "function")
          return h.displayName || h.name || null;
        if (typeof h == "string")
          return h;
        switch (h) {
          case ze:
            return "Fragment";
          case Te:
            return "Portal";
          case mt:
            return "Profiler";
          case S:
            return "StrictMode";
          case ee:
            return "Suspense";
          case ge:
            return "SuspenseList";
        }
        if (typeof h == "object")
          switch (h.$$typeof) {
            case te:
              var C = h;
              return oa(C) + ".Consumer";
            case Y:
              var z = h;
              return oa(z._context) + ".Provider";
            case _e:
              return si(h, h.render, "ForwardRef");
            case ae:
              var H = h.displayName || null;
              return H !== null ? H : qn(h.type) || "Memo";
            case fe: {
              var J = h, Ae = J._payload, le = J._init;
              try {
                return qn(le(Ae));
              } catch {
                return null;
              }
            }
          }
        return null;
      }
      var Rn = Object.prototype.hasOwnProperty, In = {
        key: !0,
        ref: !0,
        __self: !0,
        __source: !0
      }, gr, Ya, Nn;
      Nn = {};
      function Sr(h) {
        if (Rn.call(h, "ref")) {
          var C = Object.getOwnPropertyDescriptor(h, "ref").get;
          if (C && C.isReactWarning)
            return !1;
        }
        return h.ref !== void 0;
      }
      function sa(h) {
        if (Rn.call(h, "key")) {
          var C = Object.getOwnPropertyDescriptor(h, "key").get;
          if (C && C.isReactWarning)
            return !1;
        }
        return h.key !== void 0;
      }
      function $a(h, C) {
        var z = function() {
          gr || (gr = !0, Se("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", C));
        };
        z.isReactWarning = !0, Object.defineProperty(h, "key", {
          get: z,
          configurable: !0
        });
      }
      function ci(h, C) {
        var z = function() {
          Ya || (Ya = !0, Se("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", C));
        };
        z.isReactWarning = !0, Object.defineProperty(h, "ref", {
          get: z,
          configurable: !0
        });
      }
      function ne(h) {
        if (typeof h.ref == "string" && Ze.current && h.__self && Ze.current.stateNode !== h.__self) {
          var C = qn(Ze.current.type);
          Nn[C] || (Se('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', C, h.ref), Nn[C] = !0);
        }
      }
      var ke = function(h, C, z, H, J, Ae, le) {
        var Pe = {
          // This tag allows us to uniquely identify this as a React Element
          $$typeof: ce,
          // Built-in properties that belong on the element
          type: h,
          key: C,
          ref: z,
          props: le,
          // Record the component responsible for creating this element.
          _owner: Ae
        };
        return Pe._store = {}, Object.defineProperty(Pe._store, "validated", {
          configurable: !1,
          enumerable: !1,
          writable: !0,
          value: !1
        }), Object.defineProperty(Pe, "_self", {
          configurable: !1,
          enumerable: !1,
          writable: !1,
          value: H
        }), Object.defineProperty(Pe, "_source", {
          configurable: !1,
          enumerable: !1,
          writable: !1,
          value: J
        }), Object.freeze && (Object.freeze(Pe.props), Object.freeze(Pe)), Pe;
      };
      function st(h, C, z) {
        var H, J = {}, Ae = null, le = null, Pe = null, St = null;
        if (C != null) {
          Sr(C) && (le = C.ref, ne(C)), sa(C) && (Yr(C.key), Ae = "" + C.key), Pe = C.__self === void 0 ? null : C.__self, St = C.__source === void 0 ? null : C.__source;
          for (H in C)
            Rn.call(C, H) && !In.hasOwnProperty(H) && (J[H] = C[H]);
        }
        var Ot = arguments.length - 2;
        if (Ot === 1)
          J.children = z;
        else if (Ot > 1) {
          for (var ln = Array(Ot), qt = 0; qt < Ot; qt++)
            ln[qt] = arguments[qt + 2];
          Object.freeze && Object.freeze(ln), J.children = ln;
        }
        if (h && h.defaultProps) {
          var ct = h.defaultProps;
          for (H in ct)
            J[H] === void 0 && (J[H] = ct[H]);
        }
        if (Ae || le) {
          var Kt = typeof h == "function" ? h.displayName || h.name || "Unknown" : h;
          Ae && $a(J, Kt), le && ci(J, Kt);
        }
        return ke(h, Ae, le, Pe, St, Ze.current, J);
      }
      function Pt(h, C) {
        var z = ke(h.type, C, h.ref, h._self, h._source, h._owner, h.props);
        return z;
      }
      function nn(h, C, z) {
        if (h == null)
          throw new Error("React.cloneElement(...): The argument must be a React element, but you passed " + h + ".");
        var H, J = B({}, h.props), Ae = h.key, le = h.ref, Pe = h._self, St = h._source, Ot = h._owner;
        if (C != null) {
          Sr(C) && (le = C.ref, Ot = Ze.current), sa(C) && (Yr(C.key), Ae = "" + C.key);
          var ln;
          h.type && h.type.defaultProps && (ln = h.type.defaultProps);
          for (H in C)
            Rn.call(C, H) && !In.hasOwnProperty(H) && (C[H] === void 0 && ln !== void 0 ? J[H] = ln[H] : J[H] = C[H]);
        }
        var qt = arguments.length - 2;
        if (qt === 1)
          J.children = z;
        else if (qt > 1) {
          for (var ct = Array(qt), Kt = 0; Kt < qt; Kt++)
            ct[Kt] = arguments[Kt + 2];
          J.children = ct;
        }
        return ke(h.type, Ae, le, Pe, St, Ot, J);
      }
      function vn(h) {
        return typeof h == "object" && h !== null && h.$$typeof === ce;
      }
      var on = ".", Kn = ":";
      function rn(h) {
        var C = /[=:]/g, z = {
          "=": "=0",
          ":": "=2"
        }, H = h.replace(C, function(J) {
          return z[J];
        });
        return "$" + H;
      }
      var Qt = !1, Wt = /\/+/g;
      function ca(h) {
        return h.replace(Wt, "$&/");
      }
      function Er(h, C) {
        return typeof h == "object" && h !== null && h.key != null ? (Yr(h.key), rn("" + h.key)) : C.toString(36);
      }
      function Ta(h, C, z, H, J) {
        var Ae = typeof h;
        (Ae === "undefined" || Ae === "boolean") && (h = null);
        var le = !1;
        if (h === null)
          le = !0;
        else
          switch (Ae) {
            case "string":
            case "number":
              le = !0;
              break;
            case "object":
              switch (h.$$typeof) {
                case ce:
                case Te:
                  le = !0;
              }
          }
        if (le) {
          var Pe = h, St = J(Pe), Ot = H === "" ? on + Er(Pe, 0) : H;
          if (Cn(St)) {
            var ln = "";
            Ot != null && (ln = ca(Ot) + "/"), Ta(St, C, ln, "", function(qf) {
              return qf;
            });
          } else St != null && (vn(St) && (St.key && (!Pe || Pe.key !== St.key) && Yr(St.key), St = Pt(
            St,
            // Keep both the (mapped) and old keys if they differ, just as
            // traverseAllChildren used to do for objects as children
            z + // $FlowFixMe Flow incorrectly thinks React.Portal doesn't have a key
            (St.key && (!Pe || Pe.key !== St.key) ? (
              // $FlowFixMe Flow incorrectly thinks existing element's key can be a number
              // eslint-disable-next-line react-internal/safe-string-coercion
              ca("" + St.key) + "/"
            ) : "") + Ot
          )), C.push(St));
          return 1;
        }
        var qt, ct, Kt = 0, hn = H === "" ? on : H + Kn;
        if (Cn(h))
          for (var Cl = 0; Cl < h.length; Cl++)
            qt = h[Cl], ct = hn + Er(qt, Cl), Kt += Ta(qt, C, z, ct, J);
        else {
          var Go = tt(h);
          if (typeof Go == "function") {
            var Vi = h;
            Go === Vi.entries && (Qt || kt("Using Maps as children is not supported. Use an array of keyed ReactElements instead."), Qt = !0);
            for (var qo = Go.call(Vi), uu, Gf = 0; !(uu = qo.next()).done; )
              qt = uu.value, ct = hn + Er(qt, Gf++), Kt += Ta(qt, C, z, ct, J);
          } else if (Ae === "object") {
            var uc = String(h);
            throw new Error("Objects are not valid as a React child (found: " + (uc === "[object Object]" ? "object with keys {" + Object.keys(h).join(", ") + "}" : uc) + "). If you meant to render a collection of children, use an array instead.");
          }
        }
        return Kt;
      }
      function Fi(h, C, z) {
        if (h == null)
          return h;
        var H = [], J = 0;
        return Ta(h, H, "", "", function(Ae) {
          return C.call(z, Ae, J++);
        }), H;
      }
      function Jl(h) {
        var C = 0;
        return Fi(h, function() {
          C++;
        }), C;
      }
      function Zl(h, C, z) {
        Fi(h, function() {
          C.apply(this, arguments);
        }, z);
      }
      function dl(h) {
        return Fi(h, function(C) {
          return C;
        }) || [];
      }
      function pl(h) {
        if (!vn(h))
          throw new Error("React.Children.only expected to receive a single React element child.");
        return h;
      }
      function eu(h) {
        var C = {
          $$typeof: te,
          // As a workaround to support multiple concurrent renderers, we categorize
          // some renderers as primary and others as secondary. We only expect
          // there to be two concurrent renderers at most: React Native (primary) and
          // Fabric (secondary); React DOM (primary) and React ART (secondary).
          // Secondary renderers store their context values on separate fields.
          _currentValue: h,
          _currentValue2: h,
          // Used to track how many concurrent renderers this context currently
          // supports within in a single renderer. Such as parallel server rendering.
          _threadCount: 0,
          // These are circular
          Provider: null,
          Consumer: null,
          // Add these to use same hidden class in VM as ServerContext
          _defaultValue: null,
          _globalName: null
        };
        C.Provider = {
          $$typeof: Y,
          _context: C
        };
        var z = !1, H = !1, J = !1;
        {
          var Ae = {
            $$typeof: te,
            _context: C
          };
          Object.defineProperties(Ae, {
            Provider: {
              get: function() {
                return H || (H = !0, Se("Rendering <Context.Consumer.Provider> is not supported and will be removed in a future major release. Did you mean to render <Context.Provider> instead?")), C.Provider;
              },
              set: function(le) {
                C.Provider = le;
              }
            },
            _currentValue: {
              get: function() {
                return C._currentValue;
              },
              set: function(le) {
                C._currentValue = le;
              }
            },
            _currentValue2: {
              get: function() {
                return C._currentValue2;
              },
              set: function(le) {
                C._currentValue2 = le;
              }
            },
            _threadCount: {
              get: function() {
                return C._threadCount;
              },
              set: function(le) {
                C._threadCount = le;
              }
            },
            Consumer: {
              get: function() {
                return z || (z = !0, Se("Rendering <Context.Consumer.Consumer> is not supported and will be removed in a future major release. Did you mean to render <Context.Consumer> instead?")), C.Consumer;
              }
            },
            displayName: {
              get: function() {
                return C.displayName;
              },
              set: function(le) {
                J || (kt("Setting `displayName` on Context.Consumer has no effect. You should set it directly on the context with Context.displayName = '%s'.", le), J = !0);
              }
            }
          }), C.Consumer = Ae;
        }
        return C._currentRenderer = null, C._currentRenderer2 = null, C;
      }
      var xr = -1, _r = 0, rr = 1, fi = 2;
      function Qa(h) {
        if (h._status === xr) {
          var C = h._result, z = C();
          if (z.then(function(Ae) {
            if (h._status === _r || h._status === xr) {
              var le = h;
              le._status = rr, le._result = Ae;
            }
          }, function(Ae) {
            if (h._status === _r || h._status === xr) {
              var le = h;
              le._status = fi, le._result = Ae;
            }
          }), h._status === xr) {
            var H = h;
            H._status = _r, H._result = z;
          }
        }
        if (h._status === rr) {
          var J = h._result;
          return J === void 0 && Se(`lazy: Expected the result of a dynamic import() call. Instead received: %s

Your code should look like: 
  const MyComponent = lazy(() => import('./MyComponent'))

Did you accidentally put curly braces around the import?`, J), "default" in J || Se(`lazy: Expected the result of a dynamic import() call. Instead received: %s

Your code should look like: 
  const MyComponent = lazy(() => import('./MyComponent'))`, J), J.default;
        } else
          throw h._result;
      }
      function di(h) {
        var C = {
          // We use these fields to store the result.
          _status: xr,
          _result: h
        }, z = {
          $$typeof: fe,
          _payload: C,
          _init: Qa
        };
        {
          var H, J;
          Object.defineProperties(z, {
            defaultProps: {
              configurable: !0,
              get: function() {
                return H;
              },
              set: function(Ae) {
                Se("React.lazy(...): It is not supported to assign `defaultProps` to a lazy component import. Either specify them where the component is defined, or create a wrapping component around it."), H = Ae, Object.defineProperty(z, "defaultProps", {
                  enumerable: !0
                });
              }
            },
            propTypes: {
              configurable: !0,
              get: function() {
                return J;
              },
              set: function(Ae) {
                Se("React.lazy(...): It is not supported to assign `propTypes` to a lazy component import. Either specify them where the component is defined, or create a wrapping component around it."), J = Ae, Object.defineProperty(z, "propTypes", {
                  enumerable: !0
                });
              }
            }
          });
        }
        return z;
      }
      function pi(h) {
        h != null && h.$$typeof === ae ? Se("forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...)).") : typeof h != "function" ? Se("forwardRef requires a render function but was given %s.", h === null ? "null" : typeof h) : h.length !== 0 && h.length !== 2 && Se("forwardRef render functions accept exactly two parameters: props and ref. %s", h.length === 1 ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined."), h != null && (h.defaultProps != null || h.propTypes != null) && Se("forwardRef render functions do not support propTypes or defaultProps. Did you accidentally pass a React component?");
        var C = {
          $$typeof: _e,
          render: h
        };
        {
          var z;
          Object.defineProperty(C, "displayName", {
            enumerable: !1,
            configurable: !0,
            get: function() {
              return z;
            },
            set: function(H) {
              z = H, !h.name && !h.displayName && (h.displayName = H);
            }
          });
        }
        return C;
      }
      var R;
      R = Symbol.for("react.module.reference");
      function $(h) {
        return !!(typeof h == "string" || typeof h == "function" || h === ze || h === mt || Et || h === S || h === ee || h === ge || Le || h === Ie || $t || Lt || yt || typeof h == "object" && h !== null && (h.$$typeof === fe || h.$$typeof === ae || h.$$typeof === Y || h.$$typeof === te || h.$$typeof === _e || // This needs to include all possible module reference object
        // types supported by any Flight configuration anywhere since
        // we don't know which Flight build this will end up being used
        // with.
        h.$$typeof === R || h.getModuleId !== void 0));
      }
      function ue(h, C) {
        $(h) || Se("memo: The first argument must be a component. Instead received: %s", h === null ? "null" : typeof h);
        var z = {
          $$typeof: ae,
          type: h,
          compare: C === void 0 ? null : C
        };
        {
          var H;
          Object.defineProperty(z, "displayName", {
            enumerable: !1,
            configurable: !0,
            get: function() {
              return H;
            },
            set: function(J) {
              H = J, !h.name && !h.displayName && (h.displayName = J);
            }
          });
        }
        return z;
      }
      function ye() {
        var h = Ge.current;
        return h === null && Se(`Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app
See https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.`), h;
      }
      function nt(h) {
        var C = ye();
        if (h._context !== void 0) {
          var z = h._context;
          z.Consumer === h ? Se("Calling useContext(Context.Consumer) is not supported, may cause bugs, and will be removed in a future major release. Did you mean to call useContext(Context) instead?") : z.Provider === h && Se("Calling useContext(Context.Provider) is not supported. Did you mean to call useContext(Context) instead?");
        }
        return C.useContext(h);
      }
      function Ke(h) {
        var C = ye();
        return C.useState(h);
      }
      function gt(h, C, z) {
        var H = ye();
        return H.useReducer(h, C, z);
      }
      function vt(h) {
        var C = ye();
        return C.useRef(h);
      }
      function Tn(h, C) {
        var z = ye();
        return z.useEffect(h, C);
      }
      function an(h, C) {
        var z = ye();
        return z.useInsertionEffect(h, C);
      }
      function sn(h, C) {
        var z = ye();
        return z.useLayoutEffect(h, C);
      }
      function ar(h, C) {
        var z = ye();
        return z.useCallback(h, C);
      }
      function Wa(h, C) {
        var z = ye();
        return z.useMemo(h, C);
      }
      function Ga(h, C, z) {
        var H = ye();
        return H.useImperativeHandle(h, C, z);
      }
      function rt(h, C) {
        {
          var z = ye();
          return z.useDebugValue(h, C);
        }
      }
      function lt() {
        var h = ye();
        return h.useTransition();
      }
      function qa(h) {
        var C = ye();
        return C.useDeferredValue(h);
      }
      function tu() {
        var h = ye();
        return h.useId();
      }
      function nu(h, C, z) {
        var H = ye();
        return H.useSyncExternalStore(h, C, z);
      }
      var vl = 0, Qu, hl, $r, Yo, kr, ic, lc;
      function Wu() {
      }
      Wu.__reactDisabledLog = !0;
      function ml() {
        {
          if (vl === 0) {
            Qu = console.log, hl = console.info, $r = console.warn, Yo = console.error, kr = console.group, ic = console.groupCollapsed, lc = console.groupEnd;
            var h = {
              configurable: !0,
              enumerable: !0,
              value: Wu,
              writable: !0
            };
            Object.defineProperties(console, {
              info: h,
              log: h,
              warn: h,
              error: h,
              group: h,
              groupCollapsed: h,
              groupEnd: h
            });
          }
          vl++;
        }
      }
      function fa() {
        {
          if (vl--, vl === 0) {
            var h = {
              configurable: !0,
              enumerable: !0,
              writable: !0
            };
            Object.defineProperties(console, {
              log: B({}, h, {
                value: Qu
              }),
              info: B({}, h, {
                value: hl
              }),
              warn: B({}, h, {
                value: $r
              }),
              error: B({}, h, {
                value: Yo
              }),
              group: B({}, h, {
                value: kr
              }),
              groupCollapsed: B({}, h, {
                value: ic
              }),
              groupEnd: B({}, h, {
                value: lc
              })
            });
          }
          vl < 0 && Se("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
        }
      }
      var Ka = Tt.ReactCurrentDispatcher, Xa;
      function Gu(h, C, z) {
        {
          if (Xa === void 0)
            try {
              throw Error();
            } catch (J) {
              var H = J.stack.trim().match(/\n( *(at )?)/);
              Xa = H && H[1] || "";
            }
          return `
` + Xa + h;
        }
      }
      var ru = !1, yl;
      {
        var qu = typeof WeakMap == "function" ? WeakMap : Map;
        yl = new qu();
      }
      function Ku(h, C) {
        if (!h || ru)
          return "";
        {
          var z = yl.get(h);
          if (z !== void 0)
            return z;
        }
        var H;
        ru = !0;
        var J = Error.prepareStackTrace;
        Error.prepareStackTrace = void 0;
        var Ae;
        Ae = Ka.current, Ka.current = null, ml();
        try {
          if (C) {
            var le = function() {
              throw Error();
            };
            if (Object.defineProperty(le.prototype, "props", {
              set: function() {
                throw Error();
              }
            }), typeof Reflect == "object" && Reflect.construct) {
              try {
                Reflect.construct(le, []);
              } catch (hn) {
                H = hn;
              }
              Reflect.construct(h, [], le);
            } else {
              try {
                le.call();
              } catch (hn) {
                H = hn;
              }
              h.call(le.prototype);
            }
          } else {
            try {
              throw Error();
            } catch (hn) {
              H = hn;
            }
            h();
          }
        } catch (hn) {
          if (hn && H && typeof hn.stack == "string") {
            for (var Pe = hn.stack.split(`
`), St = H.stack.split(`
`), Ot = Pe.length - 1, ln = St.length - 1; Ot >= 1 && ln >= 0 && Pe[Ot] !== St[ln]; )
              ln--;
            for (; Ot >= 1 && ln >= 0; Ot--, ln--)
              if (Pe[Ot] !== St[ln]) {
                if (Ot !== 1 || ln !== 1)
                  do
                    if (Ot--, ln--, ln < 0 || Pe[Ot] !== St[ln]) {
                      var qt = `
` + Pe[Ot].replace(" at new ", " at ");
                      return h.displayName && qt.includes("<anonymous>") && (qt = qt.replace("<anonymous>", h.displayName)), typeof h == "function" && yl.set(h, qt), qt;
                    }
                  while (Ot >= 1 && ln >= 0);
                break;
              }
          }
        } finally {
          ru = !1, Ka.current = Ae, fa(), Error.prepareStackTrace = J;
        }
        var ct = h ? h.displayName || h.name : "", Kt = ct ? Gu(ct) : "";
        return typeof h == "function" && yl.set(h, Kt), Kt;
      }
      function Hi(h, C, z) {
        return Ku(h, !1);
      }
      function Qf(h) {
        var C = h.prototype;
        return !!(C && C.isReactComponent);
      }
      function Pi(h, C, z) {
        if (h == null)
          return "";
        if (typeof h == "function")
          return Ku(h, Qf(h));
        if (typeof h == "string")
          return Gu(h);
        switch (h) {
          case ee:
            return Gu("Suspense");
          case ge:
            return Gu("SuspenseList");
        }
        if (typeof h == "object")
          switch (h.$$typeof) {
            case _e:
              return Hi(h.render);
            case ae:
              return Pi(h.type, C, z);
            case fe: {
              var H = h, J = H._payload, Ae = H._init;
              try {
                return Pi(Ae(J), C, z);
              } catch {
              }
            }
          }
        return "";
      }
      var Mt = {}, Xu = Tt.ReactDebugCurrentFrame;
      function Dt(h) {
        if (h) {
          var C = h._owner, z = Pi(h.type, h._source, C ? C.type : null);
          Xu.setExtraStackFrame(z);
        } else
          Xu.setExtraStackFrame(null);
      }
      function $o(h, C, z, H, J) {
        {
          var Ae = Function.call.bind(Rn);
          for (var le in h)
            if (Ae(h, le)) {
              var Pe = void 0;
              try {
                if (typeof h[le] != "function") {
                  var St = Error((H || "React class") + ": " + z + " type `" + le + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof h[le] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                  throw St.name = "Invariant Violation", St;
                }
                Pe = h[le](C, le, H, z, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
              } catch (Ot) {
                Pe = Ot;
              }
              Pe && !(Pe instanceof Error) && (Dt(J), Se("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", H || "React class", z, le, typeof Pe), Dt(null)), Pe instanceof Error && !(Pe.message in Mt) && (Mt[Pe.message] = !0, Dt(J), Se("Failed %s type: %s", z, Pe.message), Dt(null));
            }
        }
      }
      function vi(h) {
        if (h) {
          var C = h._owner, z = Pi(h.type, h._source, C ? C.type : null);
          Ht(z);
        } else
          Ht(null);
      }
      var qe;
      qe = !1;
      function Ju() {
        if (Ze.current) {
          var h = qn(Ze.current.type);
          if (h)
            return `

Check the render method of \`` + h + "`.";
        }
        return "";
      }
      function ir(h) {
        if (h !== void 0) {
          var C = h.fileName.replace(/^.*[\\\/]/, ""), z = h.lineNumber;
          return `

Check your code at ` + C + ":" + z + ".";
        }
        return "";
      }
      function hi(h) {
        return h != null ? ir(h.__source) : "";
      }
      var Dr = {};
      function mi(h) {
        var C = Ju();
        if (!C) {
          var z = typeof h == "string" ? h : h.displayName || h.name;
          z && (C = `

Check the top-level render call using <` + z + ">.");
        }
        return C;
      }
      function cn(h, C) {
        if (!(!h._store || h._store.validated || h.key != null)) {
          h._store.validated = !0;
          var z = mi(C);
          if (!Dr[z]) {
            Dr[z] = !0;
            var H = "";
            h && h._owner && h._owner !== Ze.current && (H = " It was passed a child from " + qn(h._owner.type) + "."), vi(h), Se('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', z, H), vi(null);
          }
        }
      }
      function Gt(h, C) {
        if (typeof h == "object") {
          if (Cn(h))
            for (var z = 0; z < h.length; z++) {
              var H = h[z];
              vn(H) && cn(H, C);
            }
          else if (vn(h))
            h._store && (h._store.validated = !0);
          else if (h) {
            var J = tt(h);
            if (typeof J == "function" && J !== h.entries)
              for (var Ae = J.call(h), le; !(le = Ae.next()).done; )
                vn(le.value) && cn(le.value, C);
          }
        }
      }
      function gl(h) {
        {
          var C = h.type;
          if (C == null || typeof C == "string")
            return;
          var z;
          if (typeof C == "function")
            z = C.propTypes;
          else if (typeof C == "object" && (C.$$typeof === _e || // Note: Memo only checks outer props here.
          // Inner props are checked in the reconciler.
          C.$$typeof === ae))
            z = C.propTypes;
          else
            return;
          if (z) {
            var H = qn(C);
            $o(z, h.props, "prop", H, h);
          } else if (C.PropTypes !== void 0 && !qe) {
            qe = !0;
            var J = qn(C);
            Se("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", J || "Unknown");
          }
          typeof C.getDefaultProps == "function" && !C.getDefaultProps.isReactClassApproved && Se("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
        }
      }
      function Yn(h) {
        {
          for (var C = Object.keys(h.props), z = 0; z < C.length; z++) {
            var H = C[z];
            if (H !== "children" && H !== "key") {
              vi(h), Se("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", H), vi(null);
              break;
            }
          }
          h.ref !== null && (vi(h), Se("Invalid attribute `ref` supplied to `React.Fragment`."), vi(null));
        }
      }
      function Or(h, C, z) {
        var H = $(h);
        if (!H) {
          var J = "";
          (h === void 0 || typeof h == "object" && h !== null && Object.keys(h).length === 0) && (J += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var Ae = hi(C);
          Ae ? J += Ae : J += Ju();
          var le;
          h === null ? le = "null" : Cn(h) ? le = "array" : h !== void 0 && h.$$typeof === ce ? (le = "<" + (qn(h.type) || "Unknown") + " />", J = " Did you accidentally export a JSX literal instead of a component?") : le = typeof h, Se("React.createElement: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", le, J);
        }
        var Pe = st.apply(this, arguments);
        if (Pe == null)
          return Pe;
        if (H)
          for (var St = 2; St < arguments.length; St++)
            Gt(arguments[St], h);
        return h === ze ? Yn(Pe) : gl(Pe), Pe;
      }
      var wa = !1;
      function au(h) {
        var C = Or.bind(null, h);
        return C.type = h, wa || (wa = !0, kt("React.createFactory() is deprecated and will be removed in a future major release. Consider using JSX or use React.createElement() directly instead.")), Object.defineProperty(C, "type", {
          enumerable: !1,
          get: function() {
            return kt("Factory.type is deprecated. Access the class directly before passing it to createFactory."), Object.defineProperty(this, "type", {
              value: h
            }), h;
          }
        }), C;
      }
      function Qo(h, C, z) {
        for (var H = nn.apply(this, arguments), J = 2; J < arguments.length; J++)
          Gt(arguments[J], H.type);
        return gl(H), H;
      }
      function Wo(h, C) {
        var z = ft.transition;
        ft.transition = {};
        var H = ft.transition;
        ft.transition._updatedFibers = /* @__PURE__ */ new Set();
        try {
          h();
        } finally {
          if (ft.transition = z, z === null && H._updatedFibers) {
            var J = H._updatedFibers.size;
            J > 10 && kt("Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table."), H._updatedFibers.clear();
          }
        }
      }
      var Sl = !1, iu = null;
      function Wf(h) {
        if (iu === null)
          try {
            var C = ("require" + Math.random()).slice(0, 7), z = D && D[C];
            iu = z.call(D, "timers").setImmediate;
          } catch {
            iu = function(J) {
              Sl === !1 && (Sl = !0, typeof MessageChannel > "u" && Se("This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning."));
              var Ae = new MessageChannel();
              Ae.port1.onmessage = J, Ae.port2.postMessage(void 0);
            };
          }
        return iu(h);
      }
      var ba = 0, Ja = !1;
      function yi(h) {
        {
          var C = ba;
          ba++, Ne.current === null && (Ne.current = []);
          var z = Ne.isBatchingLegacy, H;
          try {
            if (Ne.isBatchingLegacy = !0, H = h(), !z && Ne.didScheduleLegacyUpdate) {
              var J = Ne.current;
              J !== null && (Ne.didScheduleLegacyUpdate = !1, El(J));
            }
          } catch (ct) {
            throw xa(C), ct;
          } finally {
            Ne.isBatchingLegacy = z;
          }
          if (H !== null && typeof H == "object" && typeof H.then == "function") {
            var Ae = H, le = !1, Pe = {
              then: function(ct, Kt) {
                le = !0, Ae.then(function(hn) {
                  xa(C), ba === 0 ? Zu(hn, ct, Kt) : ct(hn);
                }, function(hn) {
                  xa(C), Kt(hn);
                });
              }
            };
            return !Ja && typeof Promise < "u" && Promise.resolve().then(function() {
            }).then(function() {
              le || (Ja = !0, Se("You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);"));
            }), Pe;
          } else {
            var St = H;
            if (xa(C), ba === 0) {
              var Ot = Ne.current;
              Ot !== null && (El(Ot), Ne.current = null);
              var ln = {
                then: function(ct, Kt) {
                  Ne.current === null ? (Ne.current = [], Zu(St, ct, Kt)) : ct(St);
                }
              };
              return ln;
            } else {
              var qt = {
                then: function(ct, Kt) {
                  ct(St);
                }
              };
              return qt;
            }
          }
        }
      }
      function xa(h) {
        h !== ba - 1 && Se("You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. "), ba = h;
      }
      function Zu(h, C, z) {
        {
          var H = Ne.current;
          if (H !== null)
            try {
              El(H), Wf(function() {
                H.length === 0 ? (Ne.current = null, C(h)) : Zu(h, C, z);
              });
            } catch (J) {
              z(J);
            }
          else
            C(h);
        }
      }
      var eo = !1;
      function El(h) {
        if (!eo) {
          eo = !0;
          var C = 0;
          try {
            for (; C < h.length; C++) {
              var z = h[C];
              do
                z = z(!0);
              while (z !== null);
            }
            h.length = 0;
          } catch (H) {
            throw h = h.slice(C + 1), H;
          } finally {
            eo = !1;
          }
        }
      }
      var lu = Or, to = Qo, no = au, Za = {
        map: Fi,
        forEach: Zl,
        count: Jl,
        toArray: dl,
        only: pl
      };
      F.Children = Za, F.Component = Be, F.Fragment = ze, F.Profiler = mt, F.PureComponent = pt, F.StrictMode = S, F.Suspense = ee, F.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Tt, F.act = yi, F.cloneElement = to, F.createContext = eu, F.createElement = lu, F.createFactory = no, F.createRef = On, F.forwardRef = pi, F.isValidElement = vn, F.lazy = di, F.memo = ue, F.startTransition = Wo, F.unstable_act = yi, F.useCallback = ar, F.useContext = nt, F.useDebugValue = rt, F.useDeferredValue = qa, F.useEffect = Tn, F.useId = tu, F.useImperativeHandle = Ga, F.useInsertionEffect = an, F.useLayoutEffect = sn, F.useMemo = Wa, F.useReducer = gt, F.useRef = vt, F.useState = Ke, F.useSyncExternalStore = nu, F.useTransition = lt, F.version = k, typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(new Error());
    }();
  }(Zp, Zp.exports)), Zp.exports;
}
var aT;
function tv() {
  return aT || (aT = 1, process.env.NODE_ENV === "production" ? Wm.exports = ik() : Wm.exports = lk()), Wm.exports;
}
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var iT;
function uk() {
  if (iT) return Xp;
  iT = 1;
  var D = tv(), F = Symbol.for("react.element"), k = Symbol.for("react.fragment"), ce = Object.prototype.hasOwnProperty, Te = D.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, ze = { key: !0, ref: !0, __self: !0, __source: !0 };
  function S(mt, Y, te) {
    var _e, ee = {}, ge = null, ae = null;
    te !== void 0 && (ge = "" + te), Y.key !== void 0 && (ge = "" + Y.key), Y.ref !== void 0 && (ae = Y.ref);
    for (_e in Y) ce.call(Y, _e) && !ze.hasOwnProperty(_e) && (ee[_e] = Y[_e]);
    if (mt && mt.defaultProps) for (_e in Y = mt.defaultProps, Y) ee[_e] === void 0 && (ee[_e] = Y[_e]);
    return { $$typeof: F, type: mt, key: ge, ref: ae, props: ee, _owner: Te.current };
  }
  return Xp.Fragment = k, Xp.jsx = S, Xp.jsxs = S, Xp;
}
var Jp = {};
/**
 * @license React
 * react-jsx-runtime.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var lT;
function ok() {
  return lT || (lT = 1, process.env.NODE_ENV !== "production" && function() {
    var D = tv(), F = Symbol.for("react.element"), k = Symbol.for("react.portal"), ce = Symbol.for("react.fragment"), Te = Symbol.for("react.strict_mode"), ze = Symbol.for("react.profiler"), S = Symbol.for("react.provider"), mt = Symbol.for("react.context"), Y = Symbol.for("react.forward_ref"), te = Symbol.for("react.suspense"), _e = Symbol.for("react.suspense_list"), ee = Symbol.for("react.memo"), ge = Symbol.for("react.lazy"), ae = Symbol.for("react.offscreen"), fe = Symbol.iterator, Ie = "@@iterator";
    function Je(R) {
      if (R === null || typeof R != "object")
        return null;
      var $ = fe && R[fe] || R[Ie];
      return typeof $ == "function" ? $ : null;
    }
    var It = D.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    function tt(R) {
      {
        for (var $ = arguments.length, ue = new Array($ > 1 ? $ - 1 : 0), ye = 1; ye < $; ye++)
          ue[ye - 1] = arguments[ye];
        Ge("error", R, ue);
      }
    }
    function Ge(R, $, ue) {
      {
        var ye = It.ReactDebugCurrentFrame, nt = ye.getStackAddendum();
        nt !== "" && ($ += "%s", ue = ue.concat([nt]));
        var Ke = ue.map(function(gt) {
          return String(gt);
        });
        Ke.unshift("Warning: " + $), Function.prototype.apply.call(console[R], console, Ke);
      }
    }
    var ft = !1, Ne = !1, Ze = !1, He = !1, en = !1, Ht;
    Ht = Symbol.for("react.module.reference");
    function $t(R) {
      return !!(typeof R == "string" || typeof R == "function" || R === ce || R === ze || en || R === Te || R === te || R === _e || He || R === ae || ft || Ne || Ze || typeof R == "object" && R !== null && (R.$$typeof === ge || R.$$typeof === ee || R.$$typeof === S || R.$$typeof === mt || R.$$typeof === Y || // This needs to include all possible module reference object
      // types supported by any Flight configuration anywhere since
      // we don't know which Flight build this will end up being used
      // with.
      R.$$typeof === Ht || R.getModuleId !== void 0));
    }
    function Lt(R, $, ue) {
      var ye = R.displayName;
      if (ye)
        return ye;
      var nt = $.displayName || $.name || "";
      return nt !== "" ? ue + "(" + nt + ")" : ue;
    }
    function yt(R) {
      return R.displayName || "Context";
    }
    function Le(R) {
      if (R == null)
        return null;
      if (typeof R.tag == "number" && tt("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof R == "function")
        return R.displayName || R.name || null;
      if (typeof R == "string")
        return R;
      switch (R) {
        case ce:
          return "Fragment";
        case k:
          return "Portal";
        case ze:
          return "Profiler";
        case Te:
          return "StrictMode";
        case te:
          return "Suspense";
        case _e:
          return "SuspenseList";
      }
      if (typeof R == "object")
        switch (R.$$typeof) {
          case mt:
            var $ = R;
            return yt($) + ".Consumer";
          case S:
            var ue = R;
            return yt(ue._context) + ".Provider";
          case Y:
            return Lt(R, R.render, "ForwardRef");
          case ee:
            var ye = R.displayName || null;
            return ye !== null ? ye : Le(R.type) || "Memo";
          case ge: {
            var nt = R, Ke = nt._payload, gt = nt._init;
            try {
              return Le(gt(Ke));
            } catch {
              return null;
            }
          }
        }
      return null;
    }
    var Et = Object.assign, Tt = 0, kt, Se, Z, xe, ie, _, B;
    function $e() {
    }
    $e.__reactDisabledLog = !0;
    function Be() {
      {
        if (Tt === 0) {
          kt = console.log, Se = console.info, Z = console.warn, xe = console.error, ie = console.group, _ = console.groupCollapsed, B = console.groupEnd;
          var R = {
            configurable: !0,
            enumerable: !0,
            value: $e,
            writable: !0
          };
          Object.defineProperties(console, {
            info: R,
            log: R,
            warn: R,
            error: R,
            group: R,
            groupCollapsed: R,
            groupEnd: R
          });
        }
        Tt++;
      }
    }
    function dt() {
      {
        if (Tt--, Tt === 0) {
          var R = {
            configurable: !0,
            enumerable: !0,
            writable: !0
          };
          Object.defineProperties(console, {
            log: Et({}, R, {
              value: kt
            }),
            info: Et({}, R, {
              value: Se
            }),
            warn: Et({}, R, {
              value: Z
            }),
            error: Et({}, R, {
              value: xe
            }),
            group: Et({}, R, {
              value: ie
            }),
            groupCollapsed: Et({}, R, {
              value: _
            }),
            groupEnd: Et({}, R, {
              value: B
            })
          });
        }
        Tt < 0 && tt("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
      }
    }
    var ut = It.ReactCurrentDispatcher, it;
    function ot(R, $, ue) {
      {
        if (it === void 0)
          try {
            throw Error();
          } catch (nt) {
            var ye = nt.stack.trim().match(/\n( *(at )?)/);
            it = ye && ye[1] || "";
          }
        return `
` + it + R;
      }
    }
    var pt = !1, Yt;
    {
      var On = typeof WeakMap == "function" ? WeakMap : Map;
      Yt = new On();
    }
    function br(R, $) {
      if (!R || pt)
        return "";
      {
        var ue = Yt.get(R);
        if (ue !== void 0)
          return ue;
      }
      var ye;
      pt = !0;
      var nt = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      var Ke;
      Ke = ut.current, ut.current = null, Be();
      try {
        if ($) {
          var gt = function() {
            throw Error();
          };
          if (Object.defineProperty(gt.prototype, "props", {
            set: function() {
              throw Error();
            }
          }), typeof Reflect == "object" && Reflect.construct) {
            try {
              Reflect.construct(gt, []);
            } catch (rt) {
              ye = rt;
            }
            Reflect.construct(R, [], gt);
          } else {
            try {
              gt.call();
            } catch (rt) {
              ye = rt;
            }
            R.call(gt.prototype);
          }
        } else {
          try {
            throw Error();
          } catch (rt) {
            ye = rt;
          }
          R();
        }
      } catch (rt) {
        if (rt && ye && typeof rt.stack == "string") {
          for (var vt = rt.stack.split(`
`), Tn = ye.stack.split(`
`), an = vt.length - 1, sn = Tn.length - 1; an >= 1 && sn >= 0 && vt[an] !== Tn[sn]; )
            sn--;
          for (; an >= 1 && sn >= 0; an--, sn--)
            if (vt[an] !== Tn[sn]) {
              if (an !== 1 || sn !== 1)
                do
                  if (an--, sn--, sn < 0 || vt[an] !== Tn[sn]) {
                    var ar = `
` + vt[an].replace(" at new ", " at ");
                    return R.displayName && ar.includes("<anonymous>") && (ar = ar.replace("<anonymous>", R.displayName)), typeof R == "function" && Yt.set(R, ar), ar;
                  }
                while (an >= 1 && sn >= 0);
              break;
            }
        }
      } finally {
        pt = !1, ut.current = Ke, dt(), Error.prepareStackTrace = nt;
      }
      var Wa = R ? R.displayName || R.name : "", Ga = Wa ? ot(Wa) : "";
      return typeof R == "function" && Yt.set(R, Ga), Ga;
    }
    function Cn(R, $, ue) {
      return br(R, !1);
    }
    function nr(R) {
      var $ = R.prototype;
      return !!($ && $.isReactComponent);
    }
    function Vn(R, $, ue) {
      if (R == null)
        return "";
      if (typeof R == "function")
        return br(R, nr(R));
      if (typeof R == "string")
        return ot(R);
      switch (R) {
        case te:
          return ot("Suspense");
        case _e:
          return ot("SuspenseList");
      }
      if (typeof R == "object")
        switch (R.$$typeof) {
          case Y:
            return Cn(R.render);
          case ee:
            return Vn(R.type, $, ue);
          case ge: {
            var ye = R, nt = ye._payload, Ke = ye._init;
            try {
              return Vn(Ke(nt), $, ue);
            } catch {
            }
          }
        }
      return "";
    }
    var Bn = Object.prototype.hasOwnProperty, Yr = {}, si = It.ReactDebugCurrentFrame;
    function oa(R) {
      if (R) {
        var $ = R._owner, ue = Vn(R.type, R._source, $ ? $.type : null);
        si.setExtraStackFrame(ue);
      } else
        si.setExtraStackFrame(null);
    }
    function qn(R, $, ue, ye, nt) {
      {
        var Ke = Function.call.bind(Bn);
        for (var gt in R)
          if (Ke(R, gt)) {
            var vt = void 0;
            try {
              if (typeof R[gt] != "function") {
                var Tn = Error((ye || "React class") + ": " + ue + " type `" + gt + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof R[gt] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                throw Tn.name = "Invariant Violation", Tn;
              }
              vt = R[gt]($, gt, ye, ue, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
            } catch (an) {
              vt = an;
            }
            vt && !(vt instanceof Error) && (oa(nt), tt("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", ye || "React class", ue, gt, typeof vt), oa(null)), vt instanceof Error && !(vt.message in Yr) && (Yr[vt.message] = !0, oa(nt), tt("Failed %s type: %s", ue, vt.message), oa(null));
          }
      }
    }
    var Rn = Array.isArray;
    function In(R) {
      return Rn(R);
    }
    function gr(R) {
      {
        var $ = typeof Symbol == "function" && Symbol.toStringTag, ue = $ && R[Symbol.toStringTag] || R.constructor.name || "Object";
        return ue;
      }
    }
    function Ya(R) {
      try {
        return Nn(R), !1;
      } catch {
        return !0;
      }
    }
    function Nn(R) {
      return "" + R;
    }
    function Sr(R) {
      if (Ya(R))
        return tt("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", gr(R)), Nn(R);
    }
    var sa = It.ReactCurrentOwner, $a = {
      key: !0,
      ref: !0,
      __self: !0,
      __source: !0
    }, ci, ne;
    function ke(R) {
      if (Bn.call(R, "ref")) {
        var $ = Object.getOwnPropertyDescriptor(R, "ref").get;
        if ($ && $.isReactWarning)
          return !1;
      }
      return R.ref !== void 0;
    }
    function st(R) {
      if (Bn.call(R, "key")) {
        var $ = Object.getOwnPropertyDescriptor(R, "key").get;
        if ($ && $.isReactWarning)
          return !1;
      }
      return R.key !== void 0;
    }
    function Pt(R, $) {
      typeof R.ref == "string" && sa.current;
    }
    function nn(R, $) {
      {
        var ue = function() {
          ci || (ci = !0, tt("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", $));
        };
        ue.isReactWarning = !0, Object.defineProperty(R, "key", {
          get: ue,
          configurable: !0
        });
      }
    }
    function vn(R, $) {
      {
        var ue = function() {
          ne || (ne = !0, tt("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", $));
        };
        ue.isReactWarning = !0, Object.defineProperty(R, "ref", {
          get: ue,
          configurable: !0
        });
      }
    }
    var on = function(R, $, ue, ye, nt, Ke, gt) {
      var vt = {
        // This tag allows us to uniquely identify this as a React Element
        $$typeof: F,
        // Built-in properties that belong on the element
        type: R,
        key: $,
        ref: ue,
        props: gt,
        // Record the component responsible for creating this element.
        _owner: Ke
      };
      return vt._store = {}, Object.defineProperty(vt._store, "validated", {
        configurable: !1,
        enumerable: !1,
        writable: !0,
        value: !1
      }), Object.defineProperty(vt, "_self", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: ye
      }), Object.defineProperty(vt, "_source", {
        configurable: !1,
        enumerable: !1,
        writable: !1,
        value: nt
      }), Object.freeze && (Object.freeze(vt.props), Object.freeze(vt)), vt;
    };
    function Kn(R, $, ue, ye, nt) {
      {
        var Ke, gt = {}, vt = null, Tn = null;
        ue !== void 0 && (Sr(ue), vt = "" + ue), st($) && (Sr($.key), vt = "" + $.key), ke($) && (Tn = $.ref, Pt($, nt));
        for (Ke in $)
          Bn.call($, Ke) && !$a.hasOwnProperty(Ke) && (gt[Ke] = $[Ke]);
        if (R && R.defaultProps) {
          var an = R.defaultProps;
          for (Ke in an)
            gt[Ke] === void 0 && (gt[Ke] = an[Ke]);
        }
        if (vt || Tn) {
          var sn = typeof R == "function" ? R.displayName || R.name || "Unknown" : R;
          vt && nn(gt, sn), Tn && vn(gt, sn);
        }
        return on(R, vt, Tn, nt, ye, sa.current, gt);
      }
    }
    var rn = It.ReactCurrentOwner, Qt = It.ReactDebugCurrentFrame;
    function Wt(R) {
      if (R) {
        var $ = R._owner, ue = Vn(R.type, R._source, $ ? $.type : null);
        Qt.setExtraStackFrame(ue);
      } else
        Qt.setExtraStackFrame(null);
    }
    var ca;
    ca = !1;
    function Er(R) {
      return typeof R == "object" && R !== null && R.$$typeof === F;
    }
    function Ta() {
      {
        if (rn.current) {
          var R = Le(rn.current.type);
          if (R)
            return `

Check the render method of \`` + R + "`.";
        }
        return "";
      }
    }
    function Fi(R) {
      return "";
    }
    var Jl = {};
    function Zl(R) {
      {
        var $ = Ta();
        if (!$) {
          var ue = typeof R == "string" ? R : R.displayName || R.name;
          ue && ($ = `

Check the top-level render call using <` + ue + ">.");
        }
        return $;
      }
    }
    function dl(R, $) {
      {
        if (!R._store || R._store.validated || R.key != null)
          return;
        R._store.validated = !0;
        var ue = Zl($);
        if (Jl[ue])
          return;
        Jl[ue] = !0;
        var ye = "";
        R && R._owner && R._owner !== rn.current && (ye = " It was passed a child from " + Le(R._owner.type) + "."), Wt(R), tt('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', ue, ye), Wt(null);
      }
    }
    function pl(R, $) {
      {
        if (typeof R != "object")
          return;
        if (In(R))
          for (var ue = 0; ue < R.length; ue++) {
            var ye = R[ue];
            Er(ye) && dl(ye, $);
          }
        else if (Er(R))
          R._store && (R._store.validated = !0);
        else if (R) {
          var nt = Je(R);
          if (typeof nt == "function" && nt !== R.entries)
            for (var Ke = nt.call(R), gt; !(gt = Ke.next()).done; )
              Er(gt.value) && dl(gt.value, $);
        }
      }
    }
    function eu(R) {
      {
        var $ = R.type;
        if ($ == null || typeof $ == "string")
          return;
        var ue;
        if (typeof $ == "function")
          ue = $.propTypes;
        else if (typeof $ == "object" && ($.$$typeof === Y || // Note: Memo only checks outer props here.
        // Inner props are checked in the reconciler.
        $.$$typeof === ee))
          ue = $.propTypes;
        else
          return;
        if (ue) {
          var ye = Le($);
          qn(ue, R.props, "prop", ye, R);
        } else if ($.PropTypes !== void 0 && !ca) {
          ca = !0;
          var nt = Le($);
          tt("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", nt || "Unknown");
        }
        typeof $.getDefaultProps == "function" && !$.getDefaultProps.isReactClassApproved && tt("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
      }
    }
    function xr(R) {
      {
        for (var $ = Object.keys(R.props), ue = 0; ue < $.length; ue++) {
          var ye = $[ue];
          if (ye !== "children" && ye !== "key") {
            Wt(R), tt("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", ye), Wt(null);
            break;
          }
        }
        R.ref !== null && (Wt(R), tt("Invalid attribute `ref` supplied to `React.Fragment`."), Wt(null));
      }
    }
    var _r = {};
    function rr(R, $, ue, ye, nt, Ke) {
      {
        var gt = $t(R);
        if (!gt) {
          var vt = "";
          (R === void 0 || typeof R == "object" && R !== null && Object.keys(R).length === 0) && (vt += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
          var Tn = Fi();
          Tn ? vt += Tn : vt += Ta();
          var an;
          R === null ? an = "null" : In(R) ? an = "array" : R !== void 0 && R.$$typeof === F ? (an = "<" + (Le(R.type) || "Unknown") + " />", vt = " Did you accidentally export a JSX literal instead of a component?") : an = typeof R, tt("React.jsx: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", an, vt);
        }
        var sn = Kn(R, $, ue, nt, Ke);
        if (sn == null)
          return sn;
        if (gt) {
          var ar = $.children;
          if (ar !== void 0)
            if (ye)
              if (In(ar)) {
                for (var Wa = 0; Wa < ar.length; Wa++)
                  pl(ar[Wa], R);
                Object.freeze && Object.freeze(ar);
              } else
                tt("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
            else
              pl(ar, R);
        }
        if (Bn.call($, "key")) {
          var Ga = Le(R), rt = Object.keys($).filter(function(tu) {
            return tu !== "key";
          }), lt = rt.length > 0 ? "{key: someKey, " + rt.join(": ..., ") + ": ...}" : "{key: someKey}";
          if (!_r[Ga + lt]) {
            var qa = rt.length > 0 ? "{" + rt.join(": ..., ") + ": ...}" : "{}";
            tt(`A props object containing a "key" prop is being spread into JSX:
  let props = %s;
  <%s {...props} />
React keys must be passed directly to JSX without using spread:
  let props = %s;
  <%s key={someKey} {...props} />`, lt, Ga, qa, Ga), _r[Ga + lt] = !0;
          }
        }
        return R === ce ? xr(sn) : eu(sn), sn;
      }
    }
    function fi(R, $, ue) {
      return rr(R, $, ue, !0);
    }
    function Qa(R, $, ue) {
      return rr(R, $, ue, !1);
    }
    var di = Qa, pi = fi;
    Jp.Fragment = ce, Jp.jsx = di, Jp.jsxs = pi;
  }()), Jp;
}
process.env.NODE_ENV === "production" ? mE.exports = uk() : mE.exports = ok();
var we = mE.exports, yE = { exports: {} }, Ba = {}, Gm = { exports: {} }, pE = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var uT;
function sk() {
  return uT || (uT = 1, function(D) {
    function F(Z, xe) {
      var ie = Z.length;
      Z.push(xe);
      e: for (; 0 < ie; ) {
        var _ = ie - 1 >>> 1, B = Z[_];
        if (0 < Te(B, xe)) Z[_] = xe, Z[ie] = B, ie = _;
        else break e;
      }
    }
    function k(Z) {
      return Z.length === 0 ? null : Z[0];
    }
    function ce(Z) {
      if (Z.length === 0) return null;
      var xe = Z[0], ie = Z.pop();
      if (ie !== xe) {
        Z[0] = ie;
        e: for (var _ = 0, B = Z.length, $e = B >>> 1; _ < $e; ) {
          var Be = 2 * (_ + 1) - 1, dt = Z[Be], ut = Be + 1, it = Z[ut];
          if (0 > Te(dt, ie)) ut < B && 0 > Te(it, dt) ? (Z[_] = it, Z[ut] = ie, _ = ut) : (Z[_] = dt, Z[Be] = ie, _ = Be);
          else if (ut < B && 0 > Te(it, ie)) Z[_] = it, Z[ut] = ie, _ = ut;
          else break e;
        }
      }
      return xe;
    }
    function Te(Z, xe) {
      var ie = Z.sortIndex - xe.sortIndex;
      return ie !== 0 ? ie : Z.id - xe.id;
    }
    if (typeof performance == "object" && typeof performance.now == "function") {
      var ze = performance;
      D.unstable_now = function() {
        return ze.now();
      };
    } else {
      var S = Date, mt = S.now();
      D.unstable_now = function() {
        return S.now() - mt;
      };
    }
    var Y = [], te = [], _e = 1, ee = null, ge = 3, ae = !1, fe = !1, Ie = !1, Je = typeof setTimeout == "function" ? setTimeout : null, It = typeof clearTimeout == "function" ? clearTimeout : null, tt = typeof setImmediate < "u" ? setImmediate : null;
    typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
    function Ge(Z) {
      for (var xe = k(te); xe !== null; ) {
        if (xe.callback === null) ce(te);
        else if (xe.startTime <= Z) ce(te), xe.sortIndex = xe.expirationTime, F(Y, xe);
        else break;
        xe = k(te);
      }
    }
    function ft(Z) {
      if (Ie = !1, Ge(Z), !fe) if (k(Y) !== null) fe = !0, kt(Ne);
      else {
        var xe = k(te);
        xe !== null && Se(ft, xe.startTime - Z);
      }
    }
    function Ne(Z, xe) {
      fe = !1, Ie && (Ie = !1, It(en), en = -1), ae = !0;
      var ie = ge;
      try {
        for (Ge(xe), ee = k(Y); ee !== null && (!(ee.expirationTime > xe) || Z && !Lt()); ) {
          var _ = ee.callback;
          if (typeof _ == "function") {
            ee.callback = null, ge = ee.priorityLevel;
            var B = _(ee.expirationTime <= xe);
            xe = D.unstable_now(), typeof B == "function" ? ee.callback = B : ee === k(Y) && ce(Y), Ge(xe);
          } else ce(Y);
          ee = k(Y);
        }
        if (ee !== null) var $e = !0;
        else {
          var Be = k(te);
          Be !== null && Se(ft, Be.startTime - xe), $e = !1;
        }
        return $e;
      } finally {
        ee = null, ge = ie, ae = !1;
      }
    }
    var Ze = !1, He = null, en = -1, Ht = 5, $t = -1;
    function Lt() {
      return !(D.unstable_now() - $t < Ht);
    }
    function yt() {
      if (He !== null) {
        var Z = D.unstable_now();
        $t = Z;
        var xe = !0;
        try {
          xe = He(!0, Z);
        } finally {
          xe ? Le() : (Ze = !1, He = null);
        }
      } else Ze = !1;
    }
    var Le;
    if (typeof tt == "function") Le = function() {
      tt(yt);
    };
    else if (typeof MessageChannel < "u") {
      var Et = new MessageChannel(), Tt = Et.port2;
      Et.port1.onmessage = yt, Le = function() {
        Tt.postMessage(null);
      };
    } else Le = function() {
      Je(yt, 0);
    };
    function kt(Z) {
      He = Z, Ze || (Ze = !0, Le());
    }
    function Se(Z, xe) {
      en = Je(function() {
        Z(D.unstable_now());
      }, xe);
    }
    D.unstable_IdlePriority = 5, D.unstable_ImmediatePriority = 1, D.unstable_LowPriority = 4, D.unstable_NormalPriority = 3, D.unstable_Profiling = null, D.unstable_UserBlockingPriority = 2, D.unstable_cancelCallback = function(Z) {
      Z.callback = null;
    }, D.unstable_continueExecution = function() {
      fe || ae || (fe = !0, kt(Ne));
    }, D.unstable_forceFrameRate = function(Z) {
      0 > Z || 125 < Z ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : Ht = 0 < Z ? Math.floor(1e3 / Z) : 5;
    }, D.unstable_getCurrentPriorityLevel = function() {
      return ge;
    }, D.unstable_getFirstCallbackNode = function() {
      return k(Y);
    }, D.unstable_next = function(Z) {
      switch (ge) {
        case 1:
        case 2:
        case 3:
          var xe = 3;
          break;
        default:
          xe = ge;
      }
      var ie = ge;
      ge = xe;
      try {
        return Z();
      } finally {
        ge = ie;
      }
    }, D.unstable_pauseExecution = function() {
    }, D.unstable_requestPaint = function() {
    }, D.unstable_runWithPriority = function(Z, xe) {
      switch (Z) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          Z = 3;
      }
      var ie = ge;
      ge = Z;
      try {
        return xe();
      } finally {
        ge = ie;
      }
    }, D.unstable_scheduleCallback = function(Z, xe, ie) {
      var _ = D.unstable_now();
      switch (typeof ie == "object" && ie !== null ? (ie = ie.delay, ie = typeof ie == "number" && 0 < ie ? _ + ie : _) : ie = _, Z) {
        case 1:
          var B = -1;
          break;
        case 2:
          B = 250;
          break;
        case 5:
          B = 1073741823;
          break;
        case 4:
          B = 1e4;
          break;
        default:
          B = 5e3;
      }
      return B = ie + B, Z = { id: _e++, callback: xe, priorityLevel: Z, startTime: ie, expirationTime: B, sortIndex: -1 }, ie > _ ? (Z.sortIndex = ie, F(te, Z), k(Y) === null && Z === k(te) && (Ie ? (It(en), en = -1) : Ie = !0, Se(ft, ie - _))) : (Z.sortIndex = B, F(Y, Z), fe || ae || (fe = !0, kt(Ne))), Z;
    }, D.unstable_shouldYield = Lt, D.unstable_wrapCallback = function(Z) {
      var xe = ge;
      return function() {
        var ie = ge;
        ge = xe;
        try {
          return Z.apply(this, arguments);
        } finally {
          ge = ie;
        }
      };
    };
  }(pE)), pE;
}
var vE = {};
/**
 * @license React
 * scheduler.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var oT;
function ck() {
  return oT || (oT = 1, function(D) {
    process.env.NODE_ENV !== "production" && function() {
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(new Error());
      var F = !1, k = 5;
      function ce(ne, ke) {
        var st = ne.length;
        ne.push(ke), S(ne, ke, st);
      }
      function Te(ne) {
        return ne.length === 0 ? null : ne[0];
      }
      function ze(ne) {
        if (ne.length === 0)
          return null;
        var ke = ne[0], st = ne.pop();
        return st !== ke && (ne[0] = st, mt(ne, st, 0)), ke;
      }
      function S(ne, ke, st) {
        for (var Pt = st; Pt > 0; ) {
          var nn = Pt - 1 >>> 1, vn = ne[nn];
          if (Y(vn, ke) > 0)
            ne[nn] = ke, ne[Pt] = vn, Pt = nn;
          else
            return;
        }
      }
      function mt(ne, ke, st) {
        for (var Pt = st, nn = ne.length, vn = nn >>> 1; Pt < vn; ) {
          var on = (Pt + 1) * 2 - 1, Kn = ne[on], rn = on + 1, Qt = ne[rn];
          if (Y(Kn, ke) < 0)
            rn < nn && Y(Qt, Kn) < 0 ? (ne[Pt] = Qt, ne[rn] = ke, Pt = rn) : (ne[Pt] = Kn, ne[on] = ke, Pt = on);
          else if (rn < nn && Y(Qt, ke) < 0)
            ne[Pt] = Qt, ne[rn] = ke, Pt = rn;
          else
            return;
        }
      }
      function Y(ne, ke) {
        var st = ne.sortIndex - ke.sortIndex;
        return st !== 0 ? st : ne.id - ke.id;
      }
      var te = 1, _e = 2, ee = 3, ge = 4, ae = 5;
      function fe(ne, ke) {
      }
      var Ie = typeof performance == "object" && typeof performance.now == "function";
      if (Ie) {
        var Je = performance;
        D.unstable_now = function() {
          return Je.now();
        };
      } else {
        var It = Date, tt = It.now();
        D.unstable_now = function() {
          return It.now() - tt;
        };
      }
      var Ge = 1073741823, ft = -1, Ne = 250, Ze = 5e3, He = 1e4, en = Ge, Ht = [], $t = [], Lt = 1, yt = null, Le = ee, Et = !1, Tt = !1, kt = !1, Se = typeof setTimeout == "function" ? setTimeout : null, Z = typeof clearTimeout == "function" ? clearTimeout : null, xe = typeof setImmediate < "u" ? setImmediate : null;
      typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
      function ie(ne) {
        for (var ke = Te($t); ke !== null; ) {
          if (ke.callback === null)
            ze($t);
          else if (ke.startTime <= ne)
            ze($t), ke.sortIndex = ke.expirationTime, ce(Ht, ke);
          else
            return;
          ke = Te($t);
        }
      }
      function _(ne) {
        if (kt = !1, ie(ne), !Tt)
          if (Te(Ht) !== null)
            Tt = !0, Nn(B);
          else {
            var ke = Te($t);
            ke !== null && Sr(_, ke.startTime - ne);
          }
      }
      function B(ne, ke) {
        Tt = !1, kt && (kt = !1, sa()), Et = !0;
        var st = Le;
        try {
          var Pt;
          if (!F) return $e(ne, ke);
        } finally {
          yt = null, Le = st, Et = !1;
        }
      }
      function $e(ne, ke) {
        var st = ke;
        for (ie(st), yt = Te(Ht); yt !== null && !(yt.expirationTime > st && (!ne || si())); ) {
          var Pt = yt.callback;
          if (typeof Pt == "function") {
            yt.callback = null, Le = yt.priorityLevel;
            var nn = yt.expirationTime <= st, vn = Pt(nn);
            st = D.unstable_now(), typeof vn == "function" ? yt.callback = vn : yt === Te(Ht) && ze(Ht), ie(st);
          } else
            ze(Ht);
          yt = Te(Ht);
        }
        if (yt !== null)
          return !0;
        var on = Te($t);
        return on !== null && Sr(_, on.startTime - st), !1;
      }
      function Be(ne, ke) {
        switch (ne) {
          case te:
          case _e:
          case ee:
          case ge:
          case ae:
            break;
          default:
            ne = ee;
        }
        var st = Le;
        Le = ne;
        try {
          return ke();
        } finally {
          Le = st;
        }
      }
      function dt(ne) {
        var ke;
        switch (Le) {
          case te:
          case _e:
          case ee:
            ke = ee;
            break;
          default:
            ke = Le;
            break;
        }
        var st = Le;
        Le = ke;
        try {
          return ne();
        } finally {
          Le = st;
        }
      }
      function ut(ne) {
        var ke = Le;
        return function() {
          var st = Le;
          Le = ke;
          try {
            return ne.apply(this, arguments);
          } finally {
            Le = st;
          }
        };
      }
      function it(ne, ke, st) {
        var Pt = D.unstable_now(), nn;
        if (typeof st == "object" && st !== null) {
          var vn = st.delay;
          typeof vn == "number" && vn > 0 ? nn = Pt + vn : nn = Pt;
        } else
          nn = Pt;
        var on;
        switch (ne) {
          case te:
            on = ft;
            break;
          case _e:
            on = Ne;
            break;
          case ae:
            on = en;
            break;
          case ge:
            on = He;
            break;
          case ee:
          default:
            on = Ze;
            break;
        }
        var Kn = nn + on, rn = {
          id: Lt++,
          callback: ke,
          priorityLevel: ne,
          startTime: nn,
          expirationTime: Kn,
          sortIndex: -1
        };
        return nn > Pt ? (rn.sortIndex = nn, ce($t, rn), Te(Ht) === null && rn === Te($t) && (kt ? sa() : kt = !0, Sr(_, nn - Pt))) : (rn.sortIndex = Kn, ce(Ht, rn), !Tt && !Et && (Tt = !0, Nn(B))), rn;
      }
      function ot() {
      }
      function pt() {
        !Tt && !Et && (Tt = !0, Nn(B));
      }
      function Yt() {
        return Te(Ht);
      }
      function On(ne) {
        ne.callback = null;
      }
      function br() {
        return Le;
      }
      var Cn = !1, nr = null, Vn = -1, Bn = k, Yr = -1;
      function si() {
        var ne = D.unstable_now() - Yr;
        return !(ne < Bn);
      }
      function oa() {
      }
      function qn(ne) {
        if (ne < 0 || ne > 125) {
          console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported");
          return;
        }
        ne > 0 ? Bn = Math.floor(1e3 / ne) : Bn = k;
      }
      var Rn = function() {
        if (nr !== null) {
          var ne = D.unstable_now();
          Yr = ne;
          var ke = !0, st = !0;
          try {
            st = nr(ke, ne);
          } finally {
            st ? In() : (Cn = !1, nr = null);
          }
        } else
          Cn = !1;
      }, In;
      if (typeof xe == "function")
        In = function() {
          xe(Rn);
        };
      else if (typeof MessageChannel < "u") {
        var gr = new MessageChannel(), Ya = gr.port2;
        gr.port1.onmessage = Rn, In = function() {
          Ya.postMessage(null);
        };
      } else
        In = function() {
          Se(Rn, 0);
        };
      function Nn(ne) {
        nr = ne, Cn || (Cn = !0, In());
      }
      function Sr(ne, ke) {
        Vn = Se(function() {
          ne(D.unstable_now());
        }, ke);
      }
      function sa() {
        Z(Vn), Vn = -1;
      }
      var $a = oa, ci = null;
      D.unstable_IdlePriority = ae, D.unstable_ImmediatePriority = te, D.unstable_LowPriority = ge, D.unstable_NormalPriority = ee, D.unstable_Profiling = ci, D.unstable_UserBlockingPriority = _e, D.unstable_cancelCallback = On, D.unstable_continueExecution = pt, D.unstable_forceFrameRate = qn, D.unstable_getCurrentPriorityLevel = br, D.unstable_getFirstCallbackNode = Yt, D.unstable_next = dt, D.unstable_pauseExecution = ot, D.unstable_requestPaint = $a, D.unstable_runWithPriority = Be, D.unstable_scheduleCallback = it, D.unstable_shouldYield = si, D.unstable_wrapCallback = ut, typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(new Error());
    }();
  }(vE)), vE;
}
var sT;
function vT() {
  return sT || (sT = 1, process.env.NODE_ENV === "production" ? Gm.exports = sk() : Gm.exports = ck()), Gm.exports;
}
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var cT;
function fk() {
  if (cT) return Ba;
  cT = 1;
  var D = tv(), F = vT();
  function k(n) {
    for (var r = "https://reactjs.org/docs/error-decoder.html?invariant=" + n, l = 1; l < arguments.length; l++) r += "&args[]=" + encodeURIComponent(arguments[l]);
    return "Minified React error #" + n + "; visit " + r + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
  }
  var ce = /* @__PURE__ */ new Set(), Te = {};
  function ze(n, r) {
    S(n, r), S(n + "Capture", r);
  }
  function S(n, r) {
    for (Te[n] = r, n = 0; n < r.length; n++) ce.add(r[n]);
  }
  var mt = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), Y = Object.prototype.hasOwnProperty, te = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, _e = {}, ee = {};
  function ge(n) {
    return Y.call(ee, n) ? !0 : Y.call(_e, n) ? !1 : te.test(n) ? ee[n] = !0 : (_e[n] = !0, !1);
  }
  function ae(n, r, l, o) {
    if (l !== null && l.type === 0) return !1;
    switch (typeof r) {
      case "function":
      case "symbol":
        return !0;
      case "boolean":
        return o ? !1 : l !== null ? !l.acceptsBooleans : (n = n.toLowerCase().slice(0, 5), n !== "data-" && n !== "aria-");
      default:
        return !1;
    }
  }
  function fe(n, r, l, o) {
    if (r === null || typeof r > "u" || ae(n, r, l, o)) return !0;
    if (o) return !1;
    if (l !== null) switch (l.type) {
      case 3:
        return !r;
      case 4:
        return r === !1;
      case 5:
        return isNaN(r);
      case 6:
        return isNaN(r) || 1 > r;
    }
    return !1;
  }
  function Ie(n, r, l, o, c, d, m) {
    this.acceptsBooleans = r === 2 || r === 3 || r === 4, this.attributeName = o, this.attributeNamespace = c, this.mustUseProperty = l, this.propertyName = n, this.type = r, this.sanitizeURL = d, this.removeEmptyString = m;
  }
  var Je = {};
  "children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(n) {
    Je[n] = new Ie(n, 0, !1, n, null, !1, !1);
  }), [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(n) {
    var r = n[0];
    Je[r] = new Ie(r, 1, !1, n[1], null, !1, !1);
  }), ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(n) {
    Je[n] = new Ie(n, 2, !1, n.toLowerCase(), null, !1, !1);
  }), ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(n) {
    Je[n] = new Ie(n, 2, !1, n, null, !1, !1);
  }), "allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(n) {
    Je[n] = new Ie(n, 3, !1, n.toLowerCase(), null, !1, !1);
  }), ["checked", "multiple", "muted", "selected"].forEach(function(n) {
    Je[n] = new Ie(n, 3, !0, n, null, !1, !1);
  }), ["capture", "download"].forEach(function(n) {
    Je[n] = new Ie(n, 4, !1, n, null, !1, !1);
  }), ["cols", "rows", "size", "span"].forEach(function(n) {
    Je[n] = new Ie(n, 6, !1, n, null, !1, !1);
  }), ["rowSpan", "start"].forEach(function(n) {
    Je[n] = new Ie(n, 5, !1, n.toLowerCase(), null, !1, !1);
  });
  var It = /[\-:]([a-z])/g;
  function tt(n) {
    return n[1].toUpperCase();
  }
  "accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(n) {
    var r = n.replace(
      It,
      tt
    );
    Je[r] = new Ie(r, 1, !1, n, null, !1, !1);
  }), "xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(n) {
    var r = n.replace(It, tt);
    Je[r] = new Ie(r, 1, !1, n, "http://www.w3.org/1999/xlink", !1, !1);
  }), ["xml:base", "xml:lang", "xml:space"].forEach(function(n) {
    var r = n.replace(It, tt);
    Je[r] = new Ie(r, 1, !1, n, "http://www.w3.org/XML/1998/namespace", !1, !1);
  }), ["tabIndex", "crossOrigin"].forEach(function(n) {
    Je[n] = new Ie(n, 1, !1, n.toLowerCase(), null, !1, !1);
  }), Je.xlinkHref = new Ie("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0, !1), ["src", "href", "action", "formAction"].forEach(function(n) {
    Je[n] = new Ie(n, 1, !1, n.toLowerCase(), null, !0, !0);
  });
  function Ge(n, r, l, o) {
    var c = Je.hasOwnProperty(r) ? Je[r] : null;
    (c !== null ? c.type !== 0 : o || !(2 < r.length) || r[0] !== "o" && r[0] !== "O" || r[1] !== "n" && r[1] !== "N") && (fe(r, l, c, o) && (l = null), o || c === null ? ge(r) && (l === null ? n.removeAttribute(r) : n.setAttribute(r, "" + l)) : c.mustUseProperty ? n[c.propertyName] = l === null ? c.type === 3 ? !1 : "" : l : (r = c.attributeName, o = c.attributeNamespace, l === null ? n.removeAttribute(r) : (c = c.type, l = c === 3 || c === 4 && l === !0 ? "" : "" + l, o ? n.setAttributeNS(o, r, l) : n.setAttribute(r, l))));
  }
  var ft = D.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, Ne = Symbol.for("react.element"), Ze = Symbol.for("react.portal"), He = Symbol.for("react.fragment"), en = Symbol.for("react.strict_mode"), Ht = Symbol.for("react.profiler"), $t = Symbol.for("react.provider"), Lt = Symbol.for("react.context"), yt = Symbol.for("react.forward_ref"), Le = Symbol.for("react.suspense"), Et = Symbol.for("react.suspense_list"), Tt = Symbol.for("react.memo"), kt = Symbol.for("react.lazy"), Se = Symbol.for("react.offscreen"), Z = Symbol.iterator;
  function xe(n) {
    return n === null || typeof n != "object" ? null : (n = Z && n[Z] || n["@@iterator"], typeof n == "function" ? n : null);
  }
  var ie = Object.assign, _;
  function B(n) {
    if (_ === void 0) try {
      throw Error();
    } catch (l) {
      var r = l.stack.trim().match(/\n( *(at )?)/);
      _ = r && r[1] || "";
    }
    return `
` + _ + n;
  }
  var $e = !1;
  function Be(n, r) {
    if (!n || $e) return "";
    $e = !0;
    var l = Error.prepareStackTrace;
    Error.prepareStackTrace = void 0;
    try {
      if (r) if (r = function() {
        throw Error();
      }, Object.defineProperty(r.prototype, "props", { set: function() {
        throw Error();
      } }), typeof Reflect == "object" && Reflect.construct) {
        try {
          Reflect.construct(r, []);
        } catch (A) {
          var o = A;
        }
        Reflect.construct(n, [], r);
      } else {
        try {
          r.call();
        } catch (A) {
          o = A;
        }
        n.call(r.prototype);
      }
      else {
        try {
          throw Error();
        } catch (A) {
          o = A;
        }
        n();
      }
    } catch (A) {
      if (A && o && typeof A.stack == "string") {
        for (var c = A.stack.split(`
`), d = o.stack.split(`
`), m = c.length - 1, E = d.length - 1; 1 <= m && 0 <= E && c[m] !== d[E]; ) E--;
        for (; 1 <= m && 0 <= E; m--, E--) if (c[m] !== d[E]) {
          if (m !== 1 || E !== 1)
            do
              if (m--, E--, 0 > E || c[m] !== d[E]) {
                var T = `
` + c[m].replace(" at new ", " at ");
                return n.displayName && T.includes("<anonymous>") && (T = T.replace("<anonymous>", n.displayName)), T;
              }
            while (1 <= m && 0 <= E);
          break;
        }
      }
    } finally {
      $e = !1, Error.prepareStackTrace = l;
    }
    return (n = n ? n.displayName || n.name : "") ? B(n) : "";
  }
  function dt(n) {
    switch (n.tag) {
      case 5:
        return B(n.type);
      case 16:
        return B("Lazy");
      case 13:
        return B("Suspense");
      case 19:
        return B("SuspenseList");
      case 0:
      case 2:
      case 15:
        return n = Be(n.type, !1), n;
      case 11:
        return n = Be(n.type.render, !1), n;
      case 1:
        return n = Be(n.type, !0), n;
      default:
        return "";
    }
  }
  function ut(n) {
    if (n == null) return null;
    if (typeof n == "function") return n.displayName || n.name || null;
    if (typeof n == "string") return n;
    switch (n) {
      case He:
        return "Fragment";
      case Ze:
        return "Portal";
      case Ht:
        return "Profiler";
      case en:
        return "StrictMode";
      case Le:
        return "Suspense";
      case Et:
        return "SuspenseList";
    }
    if (typeof n == "object") switch (n.$$typeof) {
      case Lt:
        return (n.displayName || "Context") + ".Consumer";
      case $t:
        return (n._context.displayName || "Context") + ".Provider";
      case yt:
        var r = n.render;
        return n = n.displayName, n || (n = r.displayName || r.name || "", n = n !== "" ? "ForwardRef(" + n + ")" : "ForwardRef"), n;
      case Tt:
        return r = n.displayName || null, r !== null ? r : ut(n.type) || "Memo";
      case kt:
        r = n._payload, n = n._init;
        try {
          return ut(n(r));
        } catch {
        }
    }
    return null;
  }
  function it(n) {
    var r = n.type;
    switch (n.tag) {
      case 24:
        return "Cache";
      case 9:
        return (r.displayName || "Context") + ".Consumer";
      case 10:
        return (r._context.displayName || "Context") + ".Provider";
      case 18:
        return "DehydratedFragment";
      case 11:
        return n = r.render, n = n.displayName || n.name || "", r.displayName || (n !== "" ? "ForwardRef(" + n + ")" : "ForwardRef");
      case 7:
        return "Fragment";
      case 5:
        return r;
      case 4:
        return "Portal";
      case 3:
        return "Root";
      case 6:
        return "Text";
      case 16:
        return ut(r);
      case 8:
        return r === en ? "StrictMode" : "Mode";
      case 22:
        return "Offscreen";
      case 12:
        return "Profiler";
      case 21:
        return "Scope";
      case 13:
        return "Suspense";
      case 19:
        return "SuspenseList";
      case 25:
        return "TracingMarker";
      case 1:
      case 0:
      case 17:
      case 2:
      case 14:
      case 15:
        if (typeof r == "function") return r.displayName || r.name || null;
        if (typeof r == "string") return r;
    }
    return null;
  }
  function ot(n) {
    switch (typeof n) {
      case "boolean":
      case "number":
      case "string":
      case "undefined":
        return n;
      case "object":
        return n;
      default:
        return "";
    }
  }
  function pt(n) {
    var r = n.type;
    return (n = n.nodeName) && n.toLowerCase() === "input" && (r === "checkbox" || r === "radio");
  }
  function Yt(n) {
    var r = pt(n) ? "checked" : "value", l = Object.getOwnPropertyDescriptor(n.constructor.prototype, r), o = "" + n[r];
    if (!n.hasOwnProperty(r) && typeof l < "u" && typeof l.get == "function" && typeof l.set == "function") {
      var c = l.get, d = l.set;
      return Object.defineProperty(n, r, { configurable: !0, get: function() {
        return c.call(this);
      }, set: function(m) {
        o = "" + m, d.call(this, m);
      } }), Object.defineProperty(n, r, { enumerable: l.enumerable }), { getValue: function() {
        return o;
      }, setValue: function(m) {
        o = "" + m;
      }, stopTracking: function() {
        n._valueTracker = null, delete n[r];
      } };
    }
  }
  function On(n) {
    n._valueTracker || (n._valueTracker = Yt(n));
  }
  function br(n) {
    if (!n) return !1;
    var r = n._valueTracker;
    if (!r) return !0;
    var l = r.getValue(), o = "";
    return n && (o = pt(n) ? n.checked ? "true" : "false" : n.value), n = o, n !== l ? (r.setValue(n), !0) : !1;
  }
  function Cn(n) {
    if (n = n || (typeof document < "u" ? document : void 0), typeof n > "u") return null;
    try {
      return n.activeElement || n.body;
    } catch {
      return n.body;
    }
  }
  function nr(n, r) {
    var l = r.checked;
    return ie({}, r, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: l ?? n._wrapperState.initialChecked });
  }
  function Vn(n, r) {
    var l = r.defaultValue == null ? "" : r.defaultValue, o = r.checked != null ? r.checked : r.defaultChecked;
    l = ot(r.value != null ? r.value : l), n._wrapperState = { initialChecked: o, initialValue: l, controlled: r.type === "checkbox" || r.type === "radio" ? r.checked != null : r.value != null };
  }
  function Bn(n, r) {
    r = r.checked, r != null && Ge(n, "checked", r, !1);
  }
  function Yr(n, r) {
    Bn(n, r);
    var l = ot(r.value), o = r.type;
    if (l != null) o === "number" ? (l === 0 && n.value === "" || n.value != l) && (n.value = "" + l) : n.value !== "" + l && (n.value = "" + l);
    else if (o === "submit" || o === "reset") {
      n.removeAttribute("value");
      return;
    }
    r.hasOwnProperty("value") ? oa(n, r.type, l) : r.hasOwnProperty("defaultValue") && oa(n, r.type, ot(r.defaultValue)), r.checked == null && r.defaultChecked != null && (n.defaultChecked = !!r.defaultChecked);
  }
  function si(n, r, l) {
    if (r.hasOwnProperty("value") || r.hasOwnProperty("defaultValue")) {
      var o = r.type;
      if (!(o !== "submit" && o !== "reset" || r.value !== void 0 && r.value !== null)) return;
      r = "" + n._wrapperState.initialValue, l || r === n.value || (n.value = r), n.defaultValue = r;
    }
    l = n.name, l !== "" && (n.name = ""), n.defaultChecked = !!n._wrapperState.initialChecked, l !== "" && (n.name = l);
  }
  function oa(n, r, l) {
    (r !== "number" || Cn(n.ownerDocument) !== n) && (l == null ? n.defaultValue = "" + n._wrapperState.initialValue : n.defaultValue !== "" + l && (n.defaultValue = "" + l));
  }
  var qn = Array.isArray;
  function Rn(n, r, l, o) {
    if (n = n.options, r) {
      r = {};
      for (var c = 0; c < l.length; c++) r["$" + l[c]] = !0;
      for (l = 0; l < n.length; l++) c = r.hasOwnProperty("$" + n[l].value), n[l].selected !== c && (n[l].selected = c), c && o && (n[l].defaultSelected = !0);
    } else {
      for (l = "" + ot(l), r = null, c = 0; c < n.length; c++) {
        if (n[c].value === l) {
          n[c].selected = !0, o && (n[c].defaultSelected = !0);
          return;
        }
        r !== null || n[c].disabled || (r = n[c]);
      }
      r !== null && (r.selected = !0);
    }
  }
  function In(n, r) {
    if (r.dangerouslySetInnerHTML != null) throw Error(k(91));
    return ie({}, r, { value: void 0, defaultValue: void 0, children: "" + n._wrapperState.initialValue });
  }
  function gr(n, r) {
    var l = r.value;
    if (l == null) {
      if (l = r.children, r = r.defaultValue, l != null) {
        if (r != null) throw Error(k(92));
        if (qn(l)) {
          if (1 < l.length) throw Error(k(93));
          l = l[0];
        }
        r = l;
      }
      r == null && (r = ""), l = r;
    }
    n._wrapperState = { initialValue: ot(l) };
  }
  function Ya(n, r) {
    var l = ot(r.value), o = ot(r.defaultValue);
    l != null && (l = "" + l, l !== n.value && (n.value = l), r.defaultValue == null && n.defaultValue !== l && (n.defaultValue = l)), o != null && (n.defaultValue = "" + o);
  }
  function Nn(n) {
    var r = n.textContent;
    r === n._wrapperState.initialValue && r !== "" && r !== null && (n.value = r);
  }
  function Sr(n) {
    switch (n) {
      case "svg":
        return "http://www.w3.org/2000/svg";
      case "math":
        return "http://www.w3.org/1998/Math/MathML";
      default:
        return "http://www.w3.org/1999/xhtml";
    }
  }
  function sa(n, r) {
    return n == null || n === "http://www.w3.org/1999/xhtml" ? Sr(r) : n === "http://www.w3.org/2000/svg" && r === "foreignObject" ? "http://www.w3.org/1999/xhtml" : n;
  }
  var $a, ci = function(n) {
    return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(r, l, o, c) {
      MSApp.execUnsafeLocalFunction(function() {
        return n(r, l, o, c);
      });
    } : n;
  }(function(n, r) {
    if (n.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in n) n.innerHTML = r;
    else {
      for ($a = $a || document.createElement("div"), $a.innerHTML = "<svg>" + r.valueOf().toString() + "</svg>", r = $a.firstChild; n.firstChild; ) n.removeChild(n.firstChild);
      for (; r.firstChild; ) n.appendChild(r.firstChild);
    }
  });
  function ne(n, r) {
    if (r) {
      var l = n.firstChild;
      if (l && l === n.lastChild && l.nodeType === 3) {
        l.nodeValue = r;
        return;
      }
    }
    n.textContent = r;
  }
  var ke = {
    animationIterationCount: !0,
    aspectRatio: !0,
    borderImageOutset: !0,
    borderImageSlice: !0,
    borderImageWidth: !0,
    boxFlex: !0,
    boxFlexGroup: !0,
    boxOrdinalGroup: !0,
    columnCount: !0,
    columns: !0,
    flex: !0,
    flexGrow: !0,
    flexPositive: !0,
    flexShrink: !0,
    flexNegative: !0,
    flexOrder: !0,
    gridArea: !0,
    gridRow: !0,
    gridRowEnd: !0,
    gridRowSpan: !0,
    gridRowStart: !0,
    gridColumn: !0,
    gridColumnEnd: !0,
    gridColumnSpan: !0,
    gridColumnStart: !0,
    fontWeight: !0,
    lineClamp: !0,
    lineHeight: !0,
    opacity: !0,
    order: !0,
    orphans: !0,
    tabSize: !0,
    widows: !0,
    zIndex: !0,
    zoom: !0,
    fillOpacity: !0,
    floodOpacity: !0,
    stopOpacity: !0,
    strokeDasharray: !0,
    strokeDashoffset: !0,
    strokeMiterlimit: !0,
    strokeOpacity: !0,
    strokeWidth: !0
  }, st = ["Webkit", "ms", "Moz", "O"];
  Object.keys(ke).forEach(function(n) {
    st.forEach(function(r) {
      r = r + n.charAt(0).toUpperCase() + n.substring(1), ke[r] = ke[n];
    });
  });
  function Pt(n, r, l) {
    return r == null || typeof r == "boolean" || r === "" ? "" : l || typeof r != "number" || r === 0 || ke.hasOwnProperty(n) && ke[n] ? ("" + r).trim() : r + "px";
  }
  function nn(n, r) {
    n = n.style;
    for (var l in r) if (r.hasOwnProperty(l)) {
      var o = l.indexOf("--") === 0, c = Pt(l, r[l], o);
      l === "float" && (l = "cssFloat"), o ? n.setProperty(l, c) : n[l] = c;
    }
  }
  var vn = ie({ menuitem: !0 }, { area: !0, base: !0, br: !0, col: !0, embed: !0, hr: !0, img: !0, input: !0, keygen: !0, link: !0, meta: !0, param: !0, source: !0, track: !0, wbr: !0 });
  function on(n, r) {
    if (r) {
      if (vn[n] && (r.children != null || r.dangerouslySetInnerHTML != null)) throw Error(k(137, n));
      if (r.dangerouslySetInnerHTML != null) {
        if (r.children != null) throw Error(k(60));
        if (typeof r.dangerouslySetInnerHTML != "object" || !("__html" in r.dangerouslySetInnerHTML)) throw Error(k(61));
      }
      if (r.style != null && typeof r.style != "object") throw Error(k(62));
    }
  }
  function Kn(n, r) {
    if (n.indexOf("-") === -1) return typeof r.is == "string";
    switch (n) {
      case "annotation-xml":
      case "color-profile":
      case "font-face":
      case "font-face-src":
      case "font-face-uri":
      case "font-face-format":
      case "font-face-name":
      case "missing-glyph":
        return !1;
      default:
        return !0;
    }
  }
  var rn = null;
  function Qt(n) {
    return n = n.target || n.srcElement || window, n.correspondingUseElement && (n = n.correspondingUseElement), n.nodeType === 3 ? n.parentNode : n;
  }
  var Wt = null, ca = null, Er = null;
  function Ta(n) {
    if (n = Me(n)) {
      if (typeof Wt != "function") throw Error(k(280));
      var r = n.stateNode;
      r && (r = mn(r), Wt(n.stateNode, n.type, r));
    }
  }
  function Fi(n) {
    ca ? Er ? Er.push(n) : Er = [n] : ca = n;
  }
  function Jl() {
    if (ca) {
      var n = ca, r = Er;
      if (Er = ca = null, Ta(n), r) for (n = 0; n < r.length; n++) Ta(r[n]);
    }
  }
  function Zl(n, r) {
    return n(r);
  }
  function dl() {
  }
  var pl = !1;
  function eu(n, r, l) {
    if (pl) return n(r, l);
    pl = !0;
    try {
      return Zl(n, r, l);
    } finally {
      pl = !1, (ca !== null || Er !== null) && (dl(), Jl());
    }
  }
  function xr(n, r) {
    var l = n.stateNode;
    if (l === null) return null;
    var o = mn(l);
    if (o === null) return null;
    l = o[r];
    e: switch (r) {
      case "onClick":
      case "onClickCapture":
      case "onDoubleClick":
      case "onDoubleClickCapture":
      case "onMouseDown":
      case "onMouseDownCapture":
      case "onMouseMove":
      case "onMouseMoveCapture":
      case "onMouseUp":
      case "onMouseUpCapture":
      case "onMouseEnter":
        (o = !o.disabled) || (n = n.type, o = !(n === "button" || n === "input" || n === "select" || n === "textarea")), n = !o;
        break e;
      default:
        n = !1;
    }
    if (n) return null;
    if (l && typeof l != "function") throw Error(k(231, r, typeof l));
    return l;
  }
  var _r = !1;
  if (mt) try {
    var rr = {};
    Object.defineProperty(rr, "passive", { get: function() {
      _r = !0;
    } }), window.addEventListener("test", rr, rr), window.removeEventListener("test", rr, rr);
  } catch {
    _r = !1;
  }
  function fi(n, r, l, o, c, d, m, E, T) {
    var A = Array.prototype.slice.call(arguments, 3);
    try {
      r.apply(l, A);
    } catch (G) {
      this.onError(G);
    }
  }
  var Qa = !1, di = null, pi = !1, R = null, $ = { onError: function(n) {
    Qa = !0, di = n;
  } };
  function ue(n, r, l, o, c, d, m, E, T) {
    Qa = !1, di = null, fi.apply($, arguments);
  }
  function ye(n, r, l, o, c, d, m, E, T) {
    if (ue.apply(this, arguments), Qa) {
      if (Qa) {
        var A = di;
        Qa = !1, di = null;
      } else throw Error(k(198));
      pi || (pi = !0, R = A);
    }
  }
  function nt(n) {
    var r = n, l = n;
    if (n.alternate) for (; r.return; ) r = r.return;
    else {
      n = r;
      do
        r = n, r.flags & 4098 && (l = r.return), n = r.return;
      while (n);
    }
    return r.tag === 3 ? l : null;
  }
  function Ke(n) {
    if (n.tag === 13) {
      var r = n.memoizedState;
      if (r === null && (n = n.alternate, n !== null && (r = n.memoizedState)), r !== null) return r.dehydrated;
    }
    return null;
  }
  function gt(n) {
    if (nt(n) !== n) throw Error(k(188));
  }
  function vt(n) {
    var r = n.alternate;
    if (!r) {
      if (r = nt(n), r === null) throw Error(k(188));
      return r !== n ? null : n;
    }
    for (var l = n, o = r; ; ) {
      var c = l.return;
      if (c === null) break;
      var d = c.alternate;
      if (d === null) {
        if (o = c.return, o !== null) {
          l = o;
          continue;
        }
        break;
      }
      if (c.child === d.child) {
        for (d = c.child; d; ) {
          if (d === l) return gt(c), n;
          if (d === o) return gt(c), r;
          d = d.sibling;
        }
        throw Error(k(188));
      }
      if (l.return !== o.return) l = c, o = d;
      else {
        for (var m = !1, E = c.child; E; ) {
          if (E === l) {
            m = !0, l = c, o = d;
            break;
          }
          if (E === o) {
            m = !0, o = c, l = d;
            break;
          }
          E = E.sibling;
        }
        if (!m) {
          for (E = d.child; E; ) {
            if (E === l) {
              m = !0, l = d, o = c;
              break;
            }
            if (E === o) {
              m = !0, o = d, l = c;
              break;
            }
            E = E.sibling;
          }
          if (!m) throw Error(k(189));
        }
      }
      if (l.alternate !== o) throw Error(k(190));
    }
    if (l.tag !== 3) throw Error(k(188));
    return l.stateNode.current === l ? n : r;
  }
  function Tn(n) {
    return n = vt(n), n !== null ? an(n) : null;
  }
  function an(n) {
    if (n.tag === 5 || n.tag === 6) return n;
    for (n = n.child; n !== null; ) {
      var r = an(n);
      if (r !== null) return r;
      n = n.sibling;
    }
    return null;
  }
  var sn = F.unstable_scheduleCallback, ar = F.unstable_cancelCallback, Wa = F.unstable_shouldYield, Ga = F.unstable_requestPaint, rt = F.unstable_now, lt = F.unstable_getCurrentPriorityLevel, qa = F.unstable_ImmediatePriority, tu = F.unstable_UserBlockingPriority, nu = F.unstable_NormalPriority, vl = F.unstable_LowPriority, Qu = F.unstable_IdlePriority, hl = null, $r = null;
  function Yo(n) {
    if ($r && typeof $r.onCommitFiberRoot == "function") try {
      $r.onCommitFiberRoot(hl, n, void 0, (n.current.flags & 128) === 128);
    } catch {
    }
  }
  var kr = Math.clz32 ? Math.clz32 : Wu, ic = Math.log, lc = Math.LN2;
  function Wu(n) {
    return n >>>= 0, n === 0 ? 32 : 31 - (ic(n) / lc | 0) | 0;
  }
  var ml = 64, fa = 4194304;
  function Ka(n) {
    switch (n & -n) {
      case 1:
        return 1;
      case 2:
        return 2;
      case 4:
        return 4;
      case 8:
        return 8;
      case 16:
        return 16;
      case 32:
        return 32;
      case 64:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return n & 4194240;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
      case 67108864:
        return n & 130023424;
      case 134217728:
        return 134217728;
      case 268435456:
        return 268435456;
      case 536870912:
        return 536870912;
      case 1073741824:
        return 1073741824;
      default:
        return n;
    }
  }
  function Xa(n, r) {
    var l = n.pendingLanes;
    if (l === 0) return 0;
    var o = 0, c = n.suspendedLanes, d = n.pingedLanes, m = l & 268435455;
    if (m !== 0) {
      var E = m & ~c;
      E !== 0 ? o = Ka(E) : (d &= m, d !== 0 && (o = Ka(d)));
    } else m = l & ~c, m !== 0 ? o = Ka(m) : d !== 0 && (o = Ka(d));
    if (o === 0) return 0;
    if (r !== 0 && r !== o && !(r & c) && (c = o & -o, d = r & -r, c >= d || c === 16 && (d & 4194240) !== 0)) return r;
    if (o & 4 && (o |= l & 16), r = n.entangledLanes, r !== 0) for (n = n.entanglements, r &= o; 0 < r; ) l = 31 - kr(r), c = 1 << l, o |= n[l], r &= ~c;
    return o;
  }
  function Gu(n, r) {
    switch (n) {
      case 1:
      case 2:
      case 4:
        return r + 250;
      case 8:
      case 16:
      case 32:
      case 64:
      case 128:
      case 256:
      case 512:
      case 1024:
      case 2048:
      case 4096:
      case 8192:
      case 16384:
      case 32768:
      case 65536:
      case 131072:
      case 262144:
      case 524288:
      case 1048576:
      case 2097152:
        return r + 5e3;
      case 4194304:
      case 8388608:
      case 16777216:
      case 33554432:
      case 67108864:
        return -1;
      case 134217728:
      case 268435456:
      case 536870912:
      case 1073741824:
        return -1;
      default:
        return -1;
    }
  }
  function ru(n, r) {
    for (var l = n.suspendedLanes, o = n.pingedLanes, c = n.expirationTimes, d = n.pendingLanes; 0 < d; ) {
      var m = 31 - kr(d), E = 1 << m, T = c[m];
      T === -1 ? (!(E & l) || E & o) && (c[m] = Gu(E, r)) : T <= r && (n.expiredLanes |= E), d &= ~E;
    }
  }
  function yl(n) {
    return n = n.pendingLanes & -1073741825, n !== 0 ? n : n & 1073741824 ? 1073741824 : 0;
  }
  function qu() {
    var n = ml;
    return ml <<= 1, !(ml & 4194240) && (ml = 64), n;
  }
  function Ku(n) {
    for (var r = [], l = 0; 31 > l; l++) r.push(n);
    return r;
  }
  function Hi(n, r, l) {
    n.pendingLanes |= r, r !== 536870912 && (n.suspendedLanes = 0, n.pingedLanes = 0), n = n.eventTimes, r = 31 - kr(r), n[r] = l;
  }
  function Qf(n, r) {
    var l = n.pendingLanes & ~r;
    n.pendingLanes = r, n.suspendedLanes = 0, n.pingedLanes = 0, n.expiredLanes &= r, n.mutableReadLanes &= r, n.entangledLanes &= r, r = n.entanglements;
    var o = n.eventTimes;
    for (n = n.expirationTimes; 0 < l; ) {
      var c = 31 - kr(l), d = 1 << c;
      r[c] = 0, o[c] = -1, n[c] = -1, l &= ~d;
    }
  }
  function Pi(n, r) {
    var l = n.entangledLanes |= r;
    for (n = n.entanglements; l; ) {
      var o = 31 - kr(l), c = 1 << o;
      c & r | n[o] & r && (n[o] |= r), l &= ~c;
    }
  }
  var Mt = 0;
  function Xu(n) {
    return n &= -n, 1 < n ? 4 < n ? n & 268435455 ? 16 : 536870912 : 4 : 1;
  }
  var Dt, $o, vi, qe, Ju, ir = !1, hi = [], Dr = null, mi = null, cn = null, Gt = /* @__PURE__ */ new Map(), gl = /* @__PURE__ */ new Map(), Yn = [], Or = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
  function wa(n, r) {
    switch (n) {
      case "focusin":
      case "focusout":
        Dr = null;
        break;
      case "dragenter":
      case "dragleave":
        mi = null;
        break;
      case "mouseover":
      case "mouseout":
        cn = null;
        break;
      case "pointerover":
      case "pointerout":
        Gt.delete(r.pointerId);
        break;
      case "gotpointercapture":
      case "lostpointercapture":
        gl.delete(r.pointerId);
    }
  }
  function au(n, r, l, o, c, d) {
    return n === null || n.nativeEvent !== d ? (n = { blockedOn: r, domEventName: l, eventSystemFlags: o, nativeEvent: d, targetContainers: [c] }, r !== null && (r = Me(r), r !== null && $o(r)), n) : (n.eventSystemFlags |= o, r = n.targetContainers, c !== null && r.indexOf(c) === -1 && r.push(c), n);
  }
  function Qo(n, r, l, o, c) {
    switch (r) {
      case "focusin":
        return Dr = au(Dr, n, r, l, o, c), !0;
      case "dragenter":
        return mi = au(mi, n, r, l, o, c), !0;
      case "mouseover":
        return cn = au(cn, n, r, l, o, c), !0;
      case "pointerover":
        var d = c.pointerId;
        return Gt.set(d, au(Gt.get(d) || null, n, r, l, o, c)), !0;
      case "gotpointercapture":
        return d = c.pointerId, gl.set(d, au(gl.get(d) || null, n, r, l, o, c)), !0;
    }
    return !1;
  }
  function Wo(n) {
    var r = pu(n.target);
    if (r !== null) {
      var l = nt(r);
      if (l !== null) {
        if (r = l.tag, r === 13) {
          if (r = Ke(l), r !== null) {
            n.blockedOn = r, Ju(n.priority, function() {
              vi(l);
            });
            return;
          }
        } else if (r === 3 && l.stateNode.current.memoizedState.isDehydrated) {
          n.blockedOn = l.tag === 3 ? l.stateNode.containerInfo : null;
          return;
        }
      }
    }
    n.blockedOn = null;
  }
  function Sl(n) {
    if (n.blockedOn !== null) return !1;
    for (var r = n.targetContainers; 0 < r.length; ) {
      var l = to(n.domEventName, n.eventSystemFlags, r[0], n.nativeEvent);
      if (l === null) {
        l = n.nativeEvent;
        var o = new l.constructor(l.type, l);
        rn = o, l.target.dispatchEvent(o), rn = null;
      } else return r = Me(l), r !== null && $o(r), n.blockedOn = l, !1;
      r.shift();
    }
    return !0;
  }
  function iu(n, r, l) {
    Sl(n) && l.delete(r);
  }
  function Wf() {
    ir = !1, Dr !== null && Sl(Dr) && (Dr = null), mi !== null && Sl(mi) && (mi = null), cn !== null && Sl(cn) && (cn = null), Gt.forEach(iu), gl.forEach(iu);
  }
  function ba(n, r) {
    n.blockedOn === r && (n.blockedOn = null, ir || (ir = !0, F.unstable_scheduleCallback(F.unstable_NormalPriority, Wf)));
  }
  function Ja(n) {
    function r(c) {
      return ba(c, n);
    }
    if (0 < hi.length) {
      ba(hi[0], n);
      for (var l = 1; l < hi.length; l++) {
        var o = hi[l];
        o.blockedOn === n && (o.blockedOn = null);
      }
    }
    for (Dr !== null && ba(Dr, n), mi !== null && ba(mi, n), cn !== null && ba(cn, n), Gt.forEach(r), gl.forEach(r), l = 0; l < Yn.length; l++) o = Yn[l], o.blockedOn === n && (o.blockedOn = null);
    for (; 0 < Yn.length && (l = Yn[0], l.blockedOn === null); ) Wo(l), l.blockedOn === null && Yn.shift();
  }
  var yi = ft.ReactCurrentBatchConfig, xa = !0;
  function Zu(n, r, l, o) {
    var c = Mt, d = yi.transition;
    yi.transition = null;
    try {
      Mt = 1, El(n, r, l, o);
    } finally {
      Mt = c, yi.transition = d;
    }
  }
  function eo(n, r, l, o) {
    var c = Mt, d = yi.transition;
    yi.transition = null;
    try {
      Mt = 4, El(n, r, l, o);
    } finally {
      Mt = c, yi.transition = d;
    }
  }
  function El(n, r, l, o) {
    if (xa) {
      var c = to(n, r, l, o);
      if (c === null) gc(n, r, o, lu, l), wa(n, o);
      else if (Qo(c, n, r, l, o)) o.stopPropagation();
      else if (wa(n, o), r & 4 && -1 < Or.indexOf(n)) {
        for (; c !== null; ) {
          var d = Me(c);
          if (d !== null && Dt(d), d = to(n, r, l, o), d === null && gc(n, r, o, lu, l), d === c) break;
          c = d;
        }
        c !== null && o.stopPropagation();
      } else gc(n, r, o, null, l);
    }
  }
  var lu = null;
  function to(n, r, l, o) {
    if (lu = null, n = Qt(o), n = pu(n), n !== null) if (r = nt(n), r === null) n = null;
    else if (l = r.tag, l === 13) {
      if (n = Ke(r), n !== null) return n;
      n = null;
    } else if (l === 3) {
      if (r.stateNode.current.memoizedState.isDehydrated) return r.tag === 3 ? r.stateNode.containerInfo : null;
      n = null;
    } else r !== n && (n = null);
    return lu = n, null;
  }
  function no(n) {
    switch (n) {
      case "cancel":
      case "click":
      case "close":
      case "contextmenu":
      case "copy":
      case "cut":
      case "auxclick":
      case "dblclick":
      case "dragend":
      case "dragstart":
      case "drop":
      case "focusin":
      case "focusout":
      case "input":
      case "invalid":
      case "keydown":
      case "keypress":
      case "keyup":
      case "mousedown":
      case "mouseup":
      case "paste":
      case "pause":
      case "play":
      case "pointercancel":
      case "pointerdown":
      case "pointerup":
      case "ratechange":
      case "reset":
      case "resize":
      case "seeked":
      case "submit":
      case "touchcancel":
      case "touchend":
      case "touchstart":
      case "volumechange":
      case "change":
      case "selectionchange":
      case "textInput":
      case "compositionstart":
      case "compositionend":
      case "compositionupdate":
      case "beforeblur":
      case "afterblur":
      case "beforeinput":
      case "blur":
      case "fullscreenchange":
      case "focus":
      case "hashchange":
      case "popstate":
      case "select":
      case "selectstart":
        return 1;
      case "drag":
      case "dragenter":
      case "dragexit":
      case "dragleave":
      case "dragover":
      case "mousemove":
      case "mouseout":
      case "mouseover":
      case "pointermove":
      case "pointerout":
      case "pointerover":
      case "scroll":
      case "toggle":
      case "touchmove":
      case "wheel":
      case "mouseenter":
      case "mouseleave":
      case "pointerenter":
      case "pointerleave":
        return 4;
      case "message":
        switch (lt()) {
          case qa:
            return 1;
          case tu:
            return 4;
          case nu:
          case vl:
            return 16;
          case Qu:
            return 536870912;
          default:
            return 16;
        }
      default:
        return 16;
    }
  }
  var Za = null, h = null, C = null;
  function z() {
    if (C) return C;
    var n, r = h, l = r.length, o, c = "value" in Za ? Za.value : Za.textContent, d = c.length;
    for (n = 0; n < l && r[n] === c[n]; n++) ;
    var m = l - n;
    for (o = 1; o <= m && r[l - o] === c[d - o]; o++) ;
    return C = c.slice(n, 1 < o ? 1 - o : void 0);
  }
  function H(n) {
    var r = n.keyCode;
    return "charCode" in n ? (n = n.charCode, n === 0 && r === 13 && (n = 13)) : n = r, n === 10 && (n = 13), 32 <= n || n === 13 ? n : 0;
  }
  function J() {
    return !0;
  }
  function Ae() {
    return !1;
  }
  function le(n) {
    function r(l, o, c, d, m) {
      this._reactName = l, this._targetInst = c, this.type = o, this.nativeEvent = d, this.target = m, this.currentTarget = null;
      for (var E in n) n.hasOwnProperty(E) && (l = n[E], this[E] = l ? l(d) : d[E]);
      return this.isDefaultPrevented = (d.defaultPrevented != null ? d.defaultPrevented : d.returnValue === !1) ? J : Ae, this.isPropagationStopped = Ae, this;
    }
    return ie(r.prototype, { preventDefault: function() {
      this.defaultPrevented = !0;
      var l = this.nativeEvent;
      l && (l.preventDefault ? l.preventDefault() : typeof l.returnValue != "unknown" && (l.returnValue = !1), this.isDefaultPrevented = J);
    }, stopPropagation: function() {
      var l = this.nativeEvent;
      l && (l.stopPropagation ? l.stopPropagation() : typeof l.cancelBubble != "unknown" && (l.cancelBubble = !0), this.isPropagationStopped = J);
    }, persist: function() {
    }, isPersistent: J }), r;
  }
  var Pe = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(n) {
    return n.timeStamp || Date.now();
  }, defaultPrevented: 0, isTrusted: 0 }, St = le(Pe), Ot = ie({}, Pe, { view: 0, detail: 0 }), ln = le(Ot), qt, ct, Kt, hn = ie({}, Ot, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: Jf, button: 0, buttons: 0, relatedTarget: function(n) {
    return n.relatedTarget === void 0 ? n.fromElement === n.srcElement ? n.toElement : n.fromElement : n.relatedTarget;
  }, movementX: function(n) {
    return "movementX" in n ? n.movementX : (n !== Kt && (Kt && n.type === "mousemove" ? (qt = n.screenX - Kt.screenX, ct = n.screenY - Kt.screenY) : ct = qt = 0, Kt = n), qt);
  }, movementY: function(n) {
    return "movementY" in n ? n.movementY : ct;
  } }), Cl = le(hn), Go = ie({}, hn, { dataTransfer: 0 }), Vi = le(Go), qo = ie({}, Ot, { relatedTarget: 0 }), uu = le(qo), Gf = ie({}, Pe, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), uc = le(Gf), qf = ie({}, Pe, { clipboardData: function(n) {
    return "clipboardData" in n ? n.clipboardData : window.clipboardData;
  } }), nv = le(qf), Kf = ie({}, Pe, { data: 0 }), Xf = le(Kf), rv = {
    Esc: "Escape",
    Spacebar: " ",
    Left: "ArrowLeft",
    Up: "ArrowUp",
    Right: "ArrowRight",
    Down: "ArrowDown",
    Del: "Delete",
    Win: "OS",
    Menu: "ContextMenu",
    Apps: "ContextMenu",
    Scroll: "ScrollLock",
    MozPrintableKey: "Unidentified"
  }, av = {
    8: "Backspace",
    9: "Tab",
    12: "Clear",
    13: "Enter",
    16: "Shift",
    17: "Control",
    18: "Alt",
    19: "Pause",
    20: "CapsLock",
    27: "Escape",
    32: " ",
    33: "PageUp",
    34: "PageDown",
    35: "End",
    36: "Home",
    37: "ArrowLeft",
    38: "ArrowUp",
    39: "ArrowRight",
    40: "ArrowDown",
    45: "Insert",
    46: "Delete",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    144: "NumLock",
    145: "ScrollLock",
    224: "Meta"
  }, Xm = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
  function Bi(n) {
    var r = this.nativeEvent;
    return r.getModifierState ? r.getModifierState(n) : (n = Xm[n]) ? !!r[n] : !1;
  }
  function Jf() {
    return Bi;
  }
  var Zf = ie({}, Ot, { key: function(n) {
    if (n.key) {
      var r = rv[n.key] || n.key;
      if (r !== "Unidentified") return r;
    }
    return n.type === "keypress" ? (n = H(n), n === 13 ? "Enter" : String.fromCharCode(n)) : n.type === "keydown" || n.type === "keyup" ? av[n.keyCode] || "Unidentified" : "";
  }, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: Jf, charCode: function(n) {
    return n.type === "keypress" ? H(n) : 0;
  }, keyCode: function(n) {
    return n.type === "keydown" || n.type === "keyup" ? n.keyCode : 0;
  }, which: function(n) {
    return n.type === "keypress" ? H(n) : n.type === "keydown" || n.type === "keyup" ? n.keyCode : 0;
  } }), ed = le(Zf), td = ie({}, hn, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), iv = le(td), oc = ie({}, Ot, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: Jf }), lv = le(oc), Qr = ie({}, Pe, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), Ii = le(Qr), Ln = ie({}, hn, {
    deltaX: function(n) {
      return "deltaX" in n ? n.deltaX : "wheelDeltaX" in n ? -n.wheelDeltaX : 0;
    },
    deltaY: function(n) {
      return "deltaY" in n ? n.deltaY : "wheelDeltaY" in n ? -n.wheelDeltaY : "wheelDelta" in n ? -n.wheelDelta : 0;
    },
    deltaZ: 0,
    deltaMode: 0
  }), Yi = le(Ln), nd = [9, 13, 27, 32], ro = mt && "CompositionEvent" in window, Ko = null;
  mt && "documentMode" in document && (Ko = document.documentMode);
  var Xo = mt && "TextEvent" in window && !Ko, uv = mt && (!ro || Ko && 8 < Ko && 11 >= Ko), ov = " ", sc = !1;
  function sv(n, r) {
    switch (n) {
      case "keyup":
        return nd.indexOf(r.keyCode) !== -1;
      case "keydown":
        return r.keyCode !== 229;
      case "keypress":
      case "mousedown":
      case "focusout":
        return !0;
      default:
        return !1;
    }
  }
  function cv(n) {
    return n = n.detail, typeof n == "object" && "data" in n ? n.data : null;
  }
  var ao = !1;
  function fv(n, r) {
    switch (n) {
      case "compositionend":
        return cv(r);
      case "keypress":
        return r.which !== 32 ? null : (sc = !0, ov);
      case "textInput":
        return n = r.data, n === ov && sc ? null : n;
      default:
        return null;
    }
  }
  function Jm(n, r) {
    if (ao) return n === "compositionend" || !ro && sv(n, r) ? (n = z(), C = h = Za = null, ao = !1, n) : null;
    switch (n) {
      case "paste":
        return null;
      case "keypress":
        if (!(r.ctrlKey || r.altKey || r.metaKey) || r.ctrlKey && r.altKey) {
          if (r.char && 1 < r.char.length) return r.char;
          if (r.which) return String.fromCharCode(r.which);
        }
        return null;
      case "compositionend":
        return uv && r.locale !== "ko" ? null : r.data;
      default:
        return null;
    }
  }
  var Zm = { color: !0, date: !0, datetime: !0, "datetime-local": !0, email: !0, month: !0, number: !0, password: !0, range: !0, search: !0, tel: !0, text: !0, time: !0, url: !0, week: !0 };
  function dv(n) {
    var r = n && n.nodeName && n.nodeName.toLowerCase();
    return r === "input" ? !!Zm[n.type] : r === "textarea";
  }
  function rd(n, r, l, o) {
    Fi(o), r = rs(r, "onChange"), 0 < r.length && (l = new St("onChange", "change", null, l, o), n.push({ event: l, listeners: r }));
  }
  var gi = null, ou = null;
  function pv(n) {
    fu(n, 0);
  }
  function Jo(n) {
    var r = ti(n);
    if (br(r)) return n;
  }
  function ey(n, r) {
    if (n === "change") return r;
  }
  var vv = !1;
  if (mt) {
    var ad;
    if (mt) {
      var id = "oninput" in document;
      if (!id) {
        var hv = document.createElement("div");
        hv.setAttribute("oninput", "return;"), id = typeof hv.oninput == "function";
      }
      ad = id;
    } else ad = !1;
    vv = ad && (!document.documentMode || 9 < document.documentMode);
  }
  function mv() {
    gi && (gi.detachEvent("onpropertychange", yv), ou = gi = null);
  }
  function yv(n) {
    if (n.propertyName === "value" && Jo(ou)) {
      var r = [];
      rd(r, ou, n, Qt(n)), eu(pv, r);
    }
  }
  function ty(n, r, l) {
    n === "focusin" ? (mv(), gi = r, ou = l, gi.attachEvent("onpropertychange", yv)) : n === "focusout" && mv();
  }
  function gv(n) {
    if (n === "selectionchange" || n === "keyup" || n === "keydown") return Jo(ou);
  }
  function ny(n, r) {
    if (n === "click") return Jo(r);
  }
  function Sv(n, r) {
    if (n === "input" || n === "change") return Jo(r);
  }
  function ry(n, r) {
    return n === r && (n !== 0 || 1 / n === 1 / r) || n !== n && r !== r;
  }
  var ei = typeof Object.is == "function" ? Object.is : ry;
  function Zo(n, r) {
    if (ei(n, r)) return !0;
    if (typeof n != "object" || n === null || typeof r != "object" || r === null) return !1;
    var l = Object.keys(n), o = Object.keys(r);
    if (l.length !== o.length) return !1;
    for (o = 0; o < l.length; o++) {
      var c = l[o];
      if (!Y.call(r, c) || !ei(n[c], r[c])) return !1;
    }
    return !0;
  }
  function Ev(n) {
    for (; n && n.firstChild; ) n = n.firstChild;
    return n;
  }
  function cc(n, r) {
    var l = Ev(n);
    n = 0;
    for (var o; l; ) {
      if (l.nodeType === 3) {
        if (o = n + l.textContent.length, n <= r && o >= r) return { node: l, offset: r - n };
        n = o;
      }
      e: {
        for (; l; ) {
          if (l.nextSibling) {
            l = l.nextSibling;
            break e;
          }
          l = l.parentNode;
        }
        l = void 0;
      }
      l = Ev(l);
    }
  }
  function Rl(n, r) {
    return n && r ? n === r ? !0 : n && n.nodeType === 3 ? !1 : r && r.nodeType === 3 ? Rl(n, r.parentNode) : "contains" in n ? n.contains(r) : n.compareDocumentPosition ? !!(n.compareDocumentPosition(r) & 16) : !1 : !1;
  }
  function es() {
    for (var n = window, r = Cn(); r instanceof n.HTMLIFrameElement; ) {
      try {
        var l = typeof r.contentWindow.location.href == "string";
      } catch {
        l = !1;
      }
      if (l) n = r.contentWindow;
      else break;
      r = Cn(n.document);
    }
    return r;
  }
  function fc(n) {
    var r = n && n.nodeName && n.nodeName.toLowerCase();
    return r && (r === "input" && (n.type === "text" || n.type === "search" || n.type === "tel" || n.type === "url" || n.type === "password") || r === "textarea" || n.contentEditable === "true");
  }
  function io(n) {
    var r = es(), l = n.focusedElem, o = n.selectionRange;
    if (r !== l && l && l.ownerDocument && Rl(l.ownerDocument.documentElement, l)) {
      if (o !== null && fc(l)) {
        if (r = o.start, n = o.end, n === void 0 && (n = r), "selectionStart" in l) l.selectionStart = r, l.selectionEnd = Math.min(n, l.value.length);
        else if (n = (r = l.ownerDocument || document) && r.defaultView || window, n.getSelection) {
          n = n.getSelection();
          var c = l.textContent.length, d = Math.min(o.start, c);
          o = o.end === void 0 ? d : Math.min(o.end, c), !n.extend && d > o && (c = o, o = d, d = c), c = cc(l, d);
          var m = cc(
            l,
            o
          );
          c && m && (n.rangeCount !== 1 || n.anchorNode !== c.node || n.anchorOffset !== c.offset || n.focusNode !== m.node || n.focusOffset !== m.offset) && (r = r.createRange(), r.setStart(c.node, c.offset), n.removeAllRanges(), d > o ? (n.addRange(r), n.extend(m.node, m.offset)) : (r.setEnd(m.node, m.offset), n.addRange(r)));
        }
      }
      for (r = [], n = l; n = n.parentNode; ) n.nodeType === 1 && r.push({ element: n, left: n.scrollLeft, top: n.scrollTop });
      for (typeof l.focus == "function" && l.focus(), l = 0; l < r.length; l++) n = r[l], n.element.scrollLeft = n.left, n.element.scrollTop = n.top;
    }
  }
  var ay = mt && "documentMode" in document && 11 >= document.documentMode, lo = null, ld = null, ts = null, ud = !1;
  function od(n, r, l) {
    var o = l.window === l ? l.document : l.nodeType === 9 ? l : l.ownerDocument;
    ud || lo == null || lo !== Cn(o) || (o = lo, "selectionStart" in o && fc(o) ? o = { start: o.selectionStart, end: o.selectionEnd } : (o = (o.ownerDocument && o.ownerDocument.defaultView || window).getSelection(), o = { anchorNode: o.anchorNode, anchorOffset: o.anchorOffset, focusNode: o.focusNode, focusOffset: o.focusOffset }), ts && Zo(ts, o) || (ts = o, o = rs(ld, "onSelect"), 0 < o.length && (r = new St("onSelect", "select", null, r, l), n.push({ event: r, listeners: o }), r.target = lo)));
  }
  function dc(n, r) {
    var l = {};
    return l[n.toLowerCase()] = r.toLowerCase(), l["Webkit" + n] = "webkit" + r, l["Moz" + n] = "moz" + r, l;
  }
  var su = { animationend: dc("Animation", "AnimationEnd"), animationiteration: dc("Animation", "AnimationIteration"), animationstart: dc("Animation", "AnimationStart"), transitionend: dc("Transition", "TransitionEnd") }, lr = {}, sd = {};
  mt && (sd = document.createElement("div").style, "AnimationEvent" in window || (delete su.animationend.animation, delete su.animationiteration.animation, delete su.animationstart.animation), "TransitionEvent" in window || delete su.transitionend.transition);
  function pc(n) {
    if (lr[n]) return lr[n];
    if (!su[n]) return n;
    var r = su[n], l;
    for (l in r) if (r.hasOwnProperty(l) && l in sd) return lr[n] = r[l];
    return n;
  }
  var Cv = pc("animationend"), Rv = pc("animationiteration"), Tv = pc("animationstart"), wv = pc("transitionend"), cd = /* @__PURE__ */ new Map(), vc = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
  function _a(n, r) {
    cd.set(n, r), ze(r, [n]);
  }
  for (var fd = 0; fd < vc.length; fd++) {
    var cu = vc[fd], iy = cu.toLowerCase(), ly = cu[0].toUpperCase() + cu.slice(1);
    _a(iy, "on" + ly);
  }
  _a(Cv, "onAnimationEnd"), _a(Rv, "onAnimationIteration"), _a(Tv, "onAnimationStart"), _a("dblclick", "onDoubleClick"), _a("focusin", "onFocus"), _a("focusout", "onBlur"), _a(wv, "onTransitionEnd"), S("onMouseEnter", ["mouseout", "mouseover"]), S("onMouseLeave", ["mouseout", "mouseover"]), S("onPointerEnter", ["pointerout", "pointerover"]), S("onPointerLeave", ["pointerout", "pointerover"]), ze("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")), ze("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")), ze("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]), ze("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")), ze("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")), ze("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
  var ns = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), dd = new Set("cancel close invalid load scroll toggle".split(" ").concat(ns));
  function hc(n, r, l) {
    var o = n.type || "unknown-event";
    n.currentTarget = l, ye(o, r, void 0, n), n.currentTarget = null;
  }
  function fu(n, r) {
    r = (r & 4) !== 0;
    for (var l = 0; l < n.length; l++) {
      var o = n[l], c = o.event;
      o = o.listeners;
      e: {
        var d = void 0;
        if (r) for (var m = o.length - 1; 0 <= m; m--) {
          var E = o[m], T = E.instance, A = E.currentTarget;
          if (E = E.listener, T !== d && c.isPropagationStopped()) break e;
          hc(c, E, A), d = T;
        }
        else for (m = 0; m < o.length; m++) {
          if (E = o[m], T = E.instance, A = E.currentTarget, E = E.listener, T !== d && c.isPropagationStopped()) break e;
          hc(c, E, A), d = T;
        }
      }
    }
    if (pi) throw n = R, pi = !1, R = null, n;
  }
  function Vt(n, r) {
    var l = r[ls];
    l === void 0 && (l = r[ls] = /* @__PURE__ */ new Set());
    var o = n + "__bubble";
    l.has(o) || (bv(r, n, 2, !1), l.add(o));
  }
  function mc(n, r, l) {
    var o = 0;
    r && (o |= 4), bv(l, n, o, r);
  }
  var yc = "_reactListening" + Math.random().toString(36).slice(2);
  function uo(n) {
    if (!n[yc]) {
      n[yc] = !0, ce.forEach(function(l) {
        l !== "selectionchange" && (dd.has(l) || mc(l, !1, n), mc(l, !0, n));
      });
      var r = n.nodeType === 9 ? n : n.ownerDocument;
      r === null || r[yc] || (r[yc] = !0, mc("selectionchange", !1, r));
    }
  }
  function bv(n, r, l, o) {
    switch (no(r)) {
      case 1:
        var c = Zu;
        break;
      case 4:
        c = eo;
        break;
      default:
        c = El;
    }
    l = c.bind(null, r, l, n), c = void 0, !_r || r !== "touchstart" && r !== "touchmove" && r !== "wheel" || (c = !0), o ? c !== void 0 ? n.addEventListener(r, l, { capture: !0, passive: c }) : n.addEventListener(r, l, !0) : c !== void 0 ? n.addEventListener(r, l, { passive: c }) : n.addEventListener(r, l, !1);
  }
  function gc(n, r, l, o, c) {
    var d = o;
    if (!(r & 1) && !(r & 2) && o !== null) e: for (; ; ) {
      if (o === null) return;
      var m = o.tag;
      if (m === 3 || m === 4) {
        var E = o.stateNode.containerInfo;
        if (E === c || E.nodeType === 8 && E.parentNode === c) break;
        if (m === 4) for (m = o.return; m !== null; ) {
          var T = m.tag;
          if ((T === 3 || T === 4) && (T = m.stateNode.containerInfo, T === c || T.nodeType === 8 && T.parentNode === c)) return;
          m = m.return;
        }
        for (; E !== null; ) {
          if (m = pu(E), m === null) return;
          if (T = m.tag, T === 5 || T === 6) {
            o = d = m;
            continue e;
          }
          E = E.parentNode;
        }
      }
      o = o.return;
    }
    eu(function() {
      var A = d, G = Qt(l), K = [];
      e: {
        var W = cd.get(n);
        if (W !== void 0) {
          var pe = St, Ee = n;
          switch (n) {
            case "keypress":
              if (H(l) === 0) break e;
            case "keydown":
            case "keyup":
              pe = ed;
              break;
            case "focusin":
              Ee = "focus", pe = uu;
              break;
            case "focusout":
              Ee = "blur", pe = uu;
              break;
            case "beforeblur":
            case "afterblur":
              pe = uu;
              break;
            case "click":
              if (l.button === 2) break e;
            case "auxclick":
            case "dblclick":
            case "mousedown":
            case "mousemove":
            case "mouseup":
            case "mouseout":
            case "mouseover":
            case "contextmenu":
              pe = Cl;
              break;
            case "drag":
            case "dragend":
            case "dragenter":
            case "dragexit":
            case "dragleave":
            case "dragover":
            case "dragstart":
            case "drop":
              pe = Vi;
              break;
            case "touchcancel":
            case "touchend":
            case "touchmove":
            case "touchstart":
              pe = lv;
              break;
            case Cv:
            case Rv:
            case Tv:
              pe = uc;
              break;
            case wv:
              pe = Ii;
              break;
            case "scroll":
              pe = ln;
              break;
            case "wheel":
              pe = Yi;
              break;
            case "copy":
            case "cut":
            case "paste":
              pe = nv;
              break;
            case "gotpointercapture":
            case "lostpointercapture":
            case "pointercancel":
            case "pointerdown":
            case "pointermove":
            case "pointerout":
            case "pointerover":
            case "pointerup":
              pe = iv;
          }
          var be = (r & 4) !== 0, kn = !be && n === "scroll", O = be ? W !== null ? W + "Capture" : null : W;
          be = [];
          for (var b = A, M; b !== null; ) {
            M = b;
            var q = M.stateNode;
            if (M.tag === 5 && q !== null && (M = q, O !== null && (q = xr(b, O), q != null && be.push(oo(b, q, M)))), kn) break;
            b = b.return;
          }
          0 < be.length && (W = new pe(W, Ee, null, l, G), K.push({ event: W, listeners: be }));
        }
      }
      if (!(r & 7)) {
        e: {
          if (W = n === "mouseover" || n === "pointerover", pe = n === "mouseout" || n === "pointerout", W && l !== rn && (Ee = l.relatedTarget || l.fromElement) && (pu(Ee) || Ee[$i])) break e;
          if ((pe || W) && (W = G.window === G ? G : (W = G.ownerDocument) ? W.defaultView || W.parentWindow : window, pe ? (Ee = l.relatedTarget || l.toElement, pe = A, Ee = Ee ? pu(Ee) : null, Ee !== null && (kn = nt(Ee), Ee !== kn || Ee.tag !== 5 && Ee.tag !== 6) && (Ee = null)) : (pe = null, Ee = A), pe !== Ee)) {
            if (be = Cl, q = "onMouseLeave", O = "onMouseEnter", b = "mouse", (n === "pointerout" || n === "pointerover") && (be = iv, q = "onPointerLeave", O = "onPointerEnter", b = "pointer"), kn = pe == null ? W : ti(pe), M = Ee == null ? W : ti(Ee), W = new be(q, b + "leave", pe, l, G), W.target = kn, W.relatedTarget = M, q = null, pu(G) === A && (be = new be(O, b + "enter", Ee, l, G), be.target = M, be.relatedTarget = kn, q = be), kn = q, pe && Ee) t: {
              for (be = pe, O = Ee, b = 0, M = be; M; M = Tl(M)) b++;
              for (M = 0, q = O; q; q = Tl(q)) M++;
              for (; 0 < b - M; ) be = Tl(be), b--;
              for (; 0 < M - b; ) O = Tl(O), M--;
              for (; b--; ) {
                if (be === O || O !== null && be === O.alternate) break t;
                be = Tl(be), O = Tl(O);
              }
              be = null;
            }
            else be = null;
            pe !== null && xv(K, W, pe, be, !1), Ee !== null && kn !== null && xv(K, kn, Ee, be, !0);
          }
        }
        e: {
          if (W = A ? ti(A) : window, pe = W.nodeName && W.nodeName.toLowerCase(), pe === "select" || pe === "input" && W.type === "file") var Ce = ey;
          else if (dv(W)) if (vv) Ce = Sv;
          else {
            Ce = gv;
            var Fe = ty;
          }
          else (pe = W.nodeName) && pe.toLowerCase() === "input" && (W.type === "checkbox" || W.type === "radio") && (Ce = ny);
          if (Ce && (Ce = Ce(n, A))) {
            rd(K, Ce, l, G);
            break e;
          }
          Fe && Fe(n, W, A), n === "focusout" && (Fe = W._wrapperState) && Fe.controlled && W.type === "number" && oa(W, "number", W.value);
        }
        switch (Fe = A ? ti(A) : window, n) {
          case "focusin":
            (dv(Fe) || Fe.contentEditable === "true") && (lo = Fe, ld = A, ts = null);
            break;
          case "focusout":
            ts = ld = lo = null;
            break;
          case "mousedown":
            ud = !0;
            break;
          case "contextmenu":
          case "mouseup":
          case "dragend":
            ud = !1, od(K, l, G);
            break;
          case "selectionchange":
            if (ay) break;
          case "keydown":
          case "keyup":
            od(K, l, G);
        }
        var Ve;
        if (ro) e: {
          switch (n) {
            case "compositionstart":
              var We = "onCompositionStart";
              break e;
            case "compositionend":
              We = "onCompositionEnd";
              break e;
            case "compositionupdate":
              We = "onCompositionUpdate";
              break e;
          }
          We = void 0;
        }
        else ao ? sv(n, l) && (We = "onCompositionEnd") : n === "keydown" && l.keyCode === 229 && (We = "onCompositionStart");
        We && (uv && l.locale !== "ko" && (ao || We !== "onCompositionStart" ? We === "onCompositionEnd" && ao && (Ve = z()) : (Za = G, h = "value" in Za ? Za.value : Za.textContent, ao = !0)), Fe = rs(A, We), 0 < Fe.length && (We = new Xf(We, n, null, l, G), K.push({ event: We, listeners: Fe }), Ve ? We.data = Ve : (Ve = cv(l), Ve !== null && (We.data = Ve)))), (Ve = Xo ? fv(n, l) : Jm(n, l)) && (A = rs(A, "onBeforeInput"), 0 < A.length && (G = new Xf("onBeforeInput", "beforeinput", null, l, G), K.push({ event: G, listeners: A }), G.data = Ve));
      }
      fu(K, r);
    });
  }
  function oo(n, r, l) {
    return { instance: n, listener: r, currentTarget: l };
  }
  function rs(n, r) {
    for (var l = r + "Capture", o = []; n !== null; ) {
      var c = n, d = c.stateNode;
      c.tag === 5 && d !== null && (c = d, d = xr(n, l), d != null && o.unshift(oo(n, d, c)), d = xr(n, r), d != null && o.push(oo(n, d, c))), n = n.return;
    }
    return o;
  }
  function Tl(n) {
    if (n === null) return null;
    do
      n = n.return;
    while (n && n.tag !== 5);
    return n || null;
  }
  function xv(n, r, l, o, c) {
    for (var d = r._reactName, m = []; l !== null && l !== o; ) {
      var E = l, T = E.alternate, A = E.stateNode;
      if (T !== null && T === o) break;
      E.tag === 5 && A !== null && (E = A, c ? (T = xr(l, d), T != null && m.unshift(oo(l, T, E))) : c || (T = xr(l, d), T != null && m.push(oo(l, T, E)))), l = l.return;
    }
    m.length !== 0 && n.push({ event: r, listeners: m });
  }
  var _v = /\r\n?/g, uy = /\u0000|\uFFFD/g;
  function kv(n) {
    return (typeof n == "string" ? n : "" + n).replace(_v, `
`).replace(uy, "");
  }
  function Sc(n, r, l) {
    if (r = kv(r), kv(n) !== r && l) throw Error(k(425));
  }
  function wl() {
  }
  var as = null, du = null;
  function Ec(n, r) {
    return n === "textarea" || n === "noscript" || typeof r.children == "string" || typeof r.children == "number" || typeof r.dangerouslySetInnerHTML == "object" && r.dangerouslySetInnerHTML !== null && r.dangerouslySetInnerHTML.__html != null;
  }
  var Cc = typeof setTimeout == "function" ? setTimeout : void 0, pd = typeof clearTimeout == "function" ? clearTimeout : void 0, Dv = typeof Promise == "function" ? Promise : void 0, so = typeof queueMicrotask == "function" ? queueMicrotask : typeof Dv < "u" ? function(n) {
    return Dv.resolve(null).then(n).catch(Rc);
  } : Cc;
  function Rc(n) {
    setTimeout(function() {
      throw n;
    });
  }
  function co(n, r) {
    var l = r, o = 0;
    do {
      var c = l.nextSibling;
      if (n.removeChild(l), c && c.nodeType === 8) if (l = c.data, l === "/$") {
        if (o === 0) {
          n.removeChild(c), Ja(r);
          return;
        }
        o--;
      } else l !== "$" && l !== "$?" && l !== "$!" || o++;
      l = c;
    } while (l);
    Ja(r);
  }
  function Si(n) {
    for (; n != null; n = n.nextSibling) {
      var r = n.nodeType;
      if (r === 1 || r === 3) break;
      if (r === 8) {
        if (r = n.data, r === "$" || r === "$!" || r === "$?") break;
        if (r === "/$") return null;
      }
    }
    return n;
  }
  function Ov(n) {
    n = n.previousSibling;
    for (var r = 0; n; ) {
      if (n.nodeType === 8) {
        var l = n.data;
        if (l === "$" || l === "$!" || l === "$?") {
          if (r === 0) return n;
          r--;
        } else l === "/$" && r++;
      }
      n = n.previousSibling;
    }
    return null;
  }
  var bl = Math.random().toString(36).slice(2), Ei = "__reactFiber$" + bl, is = "__reactProps$" + bl, $i = "__reactContainer$" + bl, ls = "__reactEvents$" + bl, fo = "__reactListeners$" + bl, oy = "__reactHandles$" + bl;
  function pu(n) {
    var r = n[Ei];
    if (r) return r;
    for (var l = n.parentNode; l; ) {
      if (r = l[$i] || l[Ei]) {
        if (l = r.alternate, r.child !== null || l !== null && l.child !== null) for (n = Ov(n); n !== null; ) {
          if (l = n[Ei]) return l;
          n = Ov(n);
        }
        return r;
      }
      n = l, l = n.parentNode;
    }
    return null;
  }
  function Me(n) {
    return n = n[Ei] || n[$i], !n || n.tag !== 5 && n.tag !== 6 && n.tag !== 13 && n.tag !== 3 ? null : n;
  }
  function ti(n) {
    if (n.tag === 5 || n.tag === 6) return n.stateNode;
    throw Error(k(33));
  }
  function mn(n) {
    return n[is] || null;
  }
  var wt = [], ka = -1;
  function Da(n) {
    return { current: n };
  }
  function un(n) {
    0 > ka || (n.current = wt[ka], wt[ka] = null, ka--);
  }
  function Oe(n, r) {
    ka++, wt[ka] = n.current, n.current = r;
  }
  var Cr = {}, En = Da(Cr), $n = Da(!1), Wr = Cr;
  function Gr(n, r) {
    var l = n.type.contextTypes;
    if (!l) return Cr;
    var o = n.stateNode;
    if (o && o.__reactInternalMemoizedUnmaskedChildContext === r) return o.__reactInternalMemoizedMaskedChildContext;
    var c = {}, d;
    for (d in l) c[d] = r[d];
    return o && (n = n.stateNode, n.__reactInternalMemoizedUnmaskedChildContext = r, n.__reactInternalMemoizedMaskedChildContext = c), c;
  }
  function Mn(n) {
    return n = n.childContextTypes, n != null;
  }
  function po() {
    un($n), un(En);
  }
  function Nv(n, r, l) {
    if (En.current !== Cr) throw Error(k(168));
    Oe(En, r), Oe($n, l);
  }
  function us(n, r, l) {
    var o = n.stateNode;
    if (r = r.childContextTypes, typeof o.getChildContext != "function") return l;
    o = o.getChildContext();
    for (var c in o) if (!(c in r)) throw Error(k(108, it(n) || "Unknown", c));
    return ie({}, l, o);
  }
  function Xn(n) {
    return n = (n = n.stateNode) && n.__reactInternalMemoizedMergedChildContext || Cr, Wr = En.current, Oe(En, n), Oe($n, $n.current), !0;
  }
  function Tc(n, r, l) {
    var o = n.stateNode;
    if (!o) throw Error(k(169));
    l ? (n = us(n, r, Wr), o.__reactInternalMemoizedMergedChildContext = n, un($n), un(En), Oe(En, n)) : un($n), Oe($n, l);
  }
  var Ci = null, vo = !1, Qi = !1;
  function wc(n) {
    Ci === null ? Ci = [n] : Ci.push(n);
  }
  function xl(n) {
    vo = !0, wc(n);
  }
  function Ri() {
    if (!Qi && Ci !== null) {
      Qi = !0;
      var n = 0, r = Mt;
      try {
        var l = Ci;
        for (Mt = 1; n < l.length; n++) {
          var o = l[n];
          do
            o = o(!0);
          while (o !== null);
        }
        Ci = null, vo = !1;
      } catch (c) {
        throw Ci !== null && (Ci = Ci.slice(n + 1)), sn(qa, Ri), c;
      } finally {
        Mt = r, Qi = !1;
      }
    }
    return null;
  }
  var _l = [], kl = 0, Dl = null, Wi = 0, Un = [], Oa = 0, da = null, Ti = 1, wi = "";
  function vu(n, r) {
    _l[kl++] = Wi, _l[kl++] = Dl, Dl = n, Wi = r;
  }
  function Lv(n, r, l) {
    Un[Oa++] = Ti, Un[Oa++] = wi, Un[Oa++] = da, da = n;
    var o = Ti;
    n = wi;
    var c = 32 - kr(o) - 1;
    o &= ~(1 << c), l += 1;
    var d = 32 - kr(r) + c;
    if (30 < d) {
      var m = c - c % 5;
      d = (o & (1 << m) - 1).toString(32), o >>= m, c -= m, Ti = 1 << 32 - kr(r) + c | l << c | o, wi = d + n;
    } else Ti = 1 << d | l << c | o, wi = n;
  }
  function bc(n) {
    n.return !== null && (vu(n, 1), Lv(n, 1, 0));
  }
  function xc(n) {
    for (; n === Dl; ) Dl = _l[--kl], _l[kl] = null, Wi = _l[--kl], _l[kl] = null;
    for (; n === da; ) da = Un[--Oa], Un[Oa] = null, wi = Un[--Oa], Un[Oa] = null, Ti = Un[--Oa], Un[Oa] = null;
  }
  var qr = null, Kr = null, dn = !1, Na = null;
  function vd(n, r) {
    var l = Aa(5, null, null, 0);
    l.elementType = "DELETED", l.stateNode = r, l.return = n, r = n.deletions, r === null ? (n.deletions = [l], n.flags |= 16) : r.push(l);
  }
  function Mv(n, r) {
    switch (n.tag) {
      case 5:
        var l = n.type;
        return r = r.nodeType !== 1 || l.toLowerCase() !== r.nodeName.toLowerCase() ? null : r, r !== null ? (n.stateNode = r, qr = n, Kr = Si(r.firstChild), !0) : !1;
      case 6:
        return r = n.pendingProps === "" || r.nodeType !== 3 ? null : r, r !== null ? (n.stateNode = r, qr = n, Kr = null, !0) : !1;
      case 13:
        return r = r.nodeType !== 8 ? null : r, r !== null ? (l = da !== null ? { id: Ti, overflow: wi } : null, n.memoizedState = { dehydrated: r, treeContext: l, retryLane: 1073741824 }, l = Aa(18, null, null, 0), l.stateNode = r, l.return = n, n.child = l, qr = n, Kr = null, !0) : !1;
      default:
        return !1;
    }
  }
  function hd(n) {
    return (n.mode & 1) !== 0 && (n.flags & 128) === 0;
  }
  function md(n) {
    if (dn) {
      var r = Kr;
      if (r) {
        var l = r;
        if (!Mv(n, r)) {
          if (hd(n)) throw Error(k(418));
          r = Si(l.nextSibling);
          var o = qr;
          r && Mv(n, r) ? vd(o, l) : (n.flags = n.flags & -4097 | 2, dn = !1, qr = n);
        }
      } else {
        if (hd(n)) throw Error(k(418));
        n.flags = n.flags & -4097 | 2, dn = !1, qr = n;
      }
    }
  }
  function Qn(n) {
    for (n = n.return; n !== null && n.tag !== 5 && n.tag !== 3 && n.tag !== 13; ) n = n.return;
    qr = n;
  }
  function _c(n) {
    if (n !== qr) return !1;
    if (!dn) return Qn(n), dn = !0, !1;
    var r;
    if ((r = n.tag !== 3) && !(r = n.tag !== 5) && (r = n.type, r = r !== "head" && r !== "body" && !Ec(n.type, n.memoizedProps)), r && (r = Kr)) {
      if (hd(n)) throw os(), Error(k(418));
      for (; r; ) vd(n, r), r = Si(r.nextSibling);
    }
    if (Qn(n), n.tag === 13) {
      if (n = n.memoizedState, n = n !== null ? n.dehydrated : null, !n) throw Error(k(317));
      e: {
        for (n = n.nextSibling, r = 0; n; ) {
          if (n.nodeType === 8) {
            var l = n.data;
            if (l === "/$") {
              if (r === 0) {
                Kr = Si(n.nextSibling);
                break e;
              }
              r--;
            } else l !== "$" && l !== "$!" && l !== "$?" || r++;
          }
          n = n.nextSibling;
        }
        Kr = null;
      }
    } else Kr = qr ? Si(n.stateNode.nextSibling) : null;
    return !0;
  }
  function os() {
    for (var n = Kr; n; ) n = Si(n.nextSibling);
  }
  function Ol() {
    Kr = qr = null, dn = !1;
  }
  function Gi(n) {
    Na === null ? Na = [n] : Na.push(n);
  }
  var sy = ft.ReactCurrentBatchConfig;
  function hu(n, r, l) {
    if (n = l.ref, n !== null && typeof n != "function" && typeof n != "object") {
      if (l._owner) {
        if (l = l._owner, l) {
          if (l.tag !== 1) throw Error(k(309));
          var o = l.stateNode;
        }
        if (!o) throw Error(k(147, n));
        var c = o, d = "" + n;
        return r !== null && r.ref !== null && typeof r.ref == "function" && r.ref._stringRef === d ? r.ref : (r = function(m) {
          var E = c.refs;
          m === null ? delete E[d] : E[d] = m;
        }, r._stringRef = d, r);
      }
      if (typeof n != "string") throw Error(k(284));
      if (!l._owner) throw Error(k(290, n));
    }
    return n;
  }
  function kc(n, r) {
    throw n = Object.prototype.toString.call(r), Error(k(31, n === "[object Object]" ? "object with keys {" + Object.keys(r).join(", ") + "}" : n));
  }
  function Uv(n) {
    var r = n._init;
    return r(n._payload);
  }
  function mu(n) {
    function r(O, b) {
      if (n) {
        var M = O.deletions;
        M === null ? (O.deletions = [b], O.flags |= 16) : M.push(b);
      }
    }
    function l(O, b) {
      if (!n) return null;
      for (; b !== null; ) r(O, b), b = b.sibling;
      return null;
    }
    function o(O, b) {
      for (O = /* @__PURE__ */ new Map(); b !== null; ) b.key !== null ? O.set(b.key, b) : O.set(b.index, b), b = b.sibling;
      return O;
    }
    function c(O, b) {
      return O = Fl(O, b), O.index = 0, O.sibling = null, O;
    }
    function d(O, b, M) {
      return O.index = M, n ? (M = O.alternate, M !== null ? (M = M.index, M < b ? (O.flags |= 2, b) : M) : (O.flags |= 2, b)) : (O.flags |= 1048576, b);
    }
    function m(O) {
      return n && O.alternate === null && (O.flags |= 2), O;
    }
    function E(O, b, M, q) {
      return b === null || b.tag !== 6 ? (b = Wd(M, O.mode, q), b.return = O, b) : (b = c(b, M), b.return = O, b);
    }
    function T(O, b, M, q) {
      var Ce = M.type;
      return Ce === He ? G(O, b, M.props.children, q, M.key) : b !== null && (b.elementType === Ce || typeof Ce == "object" && Ce !== null && Ce.$$typeof === kt && Uv(Ce) === b.type) ? (q = c(b, M.props), q.ref = hu(O, b, M), q.return = O, q) : (q = Fs(M.type, M.key, M.props, null, O.mode, q), q.ref = hu(O, b, M), q.return = O, q);
    }
    function A(O, b, M, q) {
      return b === null || b.tag !== 4 || b.stateNode.containerInfo !== M.containerInfo || b.stateNode.implementation !== M.implementation ? (b = of(M, O.mode, q), b.return = O, b) : (b = c(b, M.children || []), b.return = O, b);
    }
    function G(O, b, M, q, Ce) {
      return b === null || b.tag !== 7 ? (b = el(M, O.mode, q, Ce), b.return = O, b) : (b = c(b, M), b.return = O, b);
    }
    function K(O, b, M) {
      if (typeof b == "string" && b !== "" || typeof b == "number") return b = Wd("" + b, O.mode, M), b.return = O, b;
      if (typeof b == "object" && b !== null) {
        switch (b.$$typeof) {
          case Ne:
            return M = Fs(b.type, b.key, b.props, null, O.mode, M), M.ref = hu(O, null, b), M.return = O, M;
          case Ze:
            return b = of(b, O.mode, M), b.return = O, b;
          case kt:
            var q = b._init;
            return K(O, q(b._payload), M);
        }
        if (qn(b) || xe(b)) return b = el(b, O.mode, M, null), b.return = O, b;
        kc(O, b);
      }
      return null;
    }
    function W(O, b, M, q) {
      var Ce = b !== null ? b.key : null;
      if (typeof M == "string" && M !== "" || typeof M == "number") return Ce !== null ? null : E(O, b, "" + M, q);
      if (typeof M == "object" && M !== null) {
        switch (M.$$typeof) {
          case Ne:
            return M.key === Ce ? T(O, b, M, q) : null;
          case Ze:
            return M.key === Ce ? A(O, b, M, q) : null;
          case kt:
            return Ce = M._init, W(
              O,
              b,
              Ce(M._payload),
              q
            );
        }
        if (qn(M) || xe(M)) return Ce !== null ? null : G(O, b, M, q, null);
        kc(O, M);
      }
      return null;
    }
    function pe(O, b, M, q, Ce) {
      if (typeof q == "string" && q !== "" || typeof q == "number") return O = O.get(M) || null, E(b, O, "" + q, Ce);
      if (typeof q == "object" && q !== null) {
        switch (q.$$typeof) {
          case Ne:
            return O = O.get(q.key === null ? M : q.key) || null, T(b, O, q, Ce);
          case Ze:
            return O = O.get(q.key === null ? M : q.key) || null, A(b, O, q, Ce);
          case kt:
            var Fe = q._init;
            return pe(O, b, M, Fe(q._payload), Ce);
        }
        if (qn(q) || xe(q)) return O = O.get(M) || null, G(b, O, q, Ce, null);
        kc(b, q);
      }
      return null;
    }
    function Ee(O, b, M, q) {
      for (var Ce = null, Fe = null, Ve = b, We = b = 0, er = null; Ve !== null && We < M.length; We++) {
        Ve.index > We ? (er = Ve, Ve = null) : er = Ve.sibling;
        var At = W(O, Ve, M[We], q);
        if (At === null) {
          Ve === null && (Ve = er);
          break;
        }
        n && Ve && At.alternate === null && r(O, Ve), b = d(At, b, We), Fe === null ? Ce = At : Fe.sibling = At, Fe = At, Ve = er;
      }
      if (We === M.length) return l(O, Ve), dn && vu(O, We), Ce;
      if (Ve === null) {
        for (; We < M.length; We++) Ve = K(O, M[We], q), Ve !== null && (b = d(Ve, b, We), Fe === null ? Ce = Ve : Fe.sibling = Ve, Fe = Ve);
        return dn && vu(O, We), Ce;
      }
      for (Ve = o(O, Ve); We < M.length; We++) er = pe(Ve, O, We, M[We], q), er !== null && (n && er.alternate !== null && Ve.delete(er.key === null ? We : er.key), b = d(er, b, We), Fe === null ? Ce = er : Fe.sibling = er, Fe = er);
      return n && Ve.forEach(function(Vl) {
        return r(O, Vl);
      }), dn && vu(O, We), Ce;
    }
    function be(O, b, M, q) {
      var Ce = xe(M);
      if (typeof Ce != "function") throw Error(k(150));
      if (M = Ce.call(M), M == null) throw Error(k(151));
      for (var Fe = Ce = null, Ve = b, We = b = 0, er = null, At = M.next(); Ve !== null && !At.done; We++, At = M.next()) {
        Ve.index > We ? (er = Ve, Ve = null) : er = Ve.sibling;
        var Vl = W(O, Ve, At.value, q);
        if (Vl === null) {
          Ve === null && (Ve = er);
          break;
        }
        n && Ve && Vl.alternate === null && r(O, Ve), b = d(Vl, b, We), Fe === null ? Ce = Vl : Fe.sibling = Vl, Fe = Vl, Ve = er;
      }
      if (At.done) return l(
        O,
        Ve
      ), dn && vu(O, We), Ce;
      if (Ve === null) {
        for (; !At.done; We++, At = M.next()) At = K(O, At.value, q), At !== null && (b = d(At, b, We), Fe === null ? Ce = At : Fe.sibling = At, Fe = At);
        return dn && vu(O, We), Ce;
      }
      for (Ve = o(O, Ve); !At.done; We++, At = M.next()) At = pe(Ve, O, We, At.value, q), At !== null && (n && At.alternate !== null && Ve.delete(At.key === null ? We : At.key), b = d(At, b, We), Fe === null ? Ce = At : Fe.sibling = At, Fe = At);
      return n && Ve.forEach(function(mh) {
        return r(O, mh);
      }), dn && vu(O, We), Ce;
    }
    function kn(O, b, M, q) {
      if (typeof M == "object" && M !== null && M.type === He && M.key === null && (M = M.props.children), typeof M == "object" && M !== null) {
        switch (M.$$typeof) {
          case Ne:
            e: {
              for (var Ce = M.key, Fe = b; Fe !== null; ) {
                if (Fe.key === Ce) {
                  if (Ce = M.type, Ce === He) {
                    if (Fe.tag === 7) {
                      l(O, Fe.sibling), b = c(Fe, M.props.children), b.return = O, O = b;
                      break e;
                    }
                  } else if (Fe.elementType === Ce || typeof Ce == "object" && Ce !== null && Ce.$$typeof === kt && Uv(Ce) === Fe.type) {
                    l(O, Fe.sibling), b = c(Fe, M.props), b.ref = hu(O, Fe, M), b.return = O, O = b;
                    break e;
                  }
                  l(O, Fe);
                  break;
                } else r(O, Fe);
                Fe = Fe.sibling;
              }
              M.type === He ? (b = el(M.props.children, O.mode, q, M.key), b.return = O, O = b) : (q = Fs(M.type, M.key, M.props, null, O.mode, q), q.ref = hu(O, b, M), q.return = O, O = q);
            }
            return m(O);
          case Ze:
            e: {
              for (Fe = M.key; b !== null; ) {
                if (b.key === Fe) if (b.tag === 4 && b.stateNode.containerInfo === M.containerInfo && b.stateNode.implementation === M.implementation) {
                  l(O, b.sibling), b = c(b, M.children || []), b.return = O, O = b;
                  break e;
                } else {
                  l(O, b);
                  break;
                }
                else r(O, b);
                b = b.sibling;
              }
              b = of(M, O.mode, q), b.return = O, O = b;
            }
            return m(O);
          case kt:
            return Fe = M._init, kn(O, b, Fe(M._payload), q);
        }
        if (qn(M)) return Ee(O, b, M, q);
        if (xe(M)) return be(O, b, M, q);
        kc(O, M);
      }
      return typeof M == "string" && M !== "" || typeof M == "number" ? (M = "" + M, b !== null && b.tag === 6 ? (l(O, b.sibling), b = c(b, M), b.return = O, O = b) : (l(O, b), b = Wd(M, O.mode, q), b.return = O, O = b), m(O)) : l(O, b);
    }
    return kn;
  }
  var wn = mu(!0), oe = mu(!1), pa = Da(null), Xr = null, ho = null, yd = null;
  function gd() {
    yd = ho = Xr = null;
  }
  function Sd(n) {
    var r = pa.current;
    un(pa), n._currentValue = r;
  }
  function Ed(n, r, l) {
    for (; n !== null; ) {
      var o = n.alternate;
      if ((n.childLanes & r) !== r ? (n.childLanes |= r, o !== null && (o.childLanes |= r)) : o !== null && (o.childLanes & r) !== r && (o.childLanes |= r), n === l) break;
      n = n.return;
    }
  }
  function yn(n, r) {
    Xr = n, yd = ho = null, n = n.dependencies, n !== null && n.firstContext !== null && (n.lanes & r && (An = !0), n.firstContext = null);
  }
  function La(n) {
    var r = n._currentValue;
    if (yd !== n) if (n = { context: n, memoizedValue: r, next: null }, ho === null) {
      if (Xr === null) throw Error(k(308));
      ho = n, Xr.dependencies = { lanes: 0, firstContext: n };
    } else ho = ho.next = n;
    return r;
  }
  var yu = null;
  function Cd(n) {
    yu === null ? yu = [n] : yu.push(n);
  }
  function Rd(n, r, l, o) {
    var c = r.interleaved;
    return c === null ? (l.next = l, Cd(r)) : (l.next = c.next, c.next = l), r.interleaved = l, va(n, o);
  }
  function va(n, r) {
    n.lanes |= r;
    var l = n.alternate;
    for (l !== null && (l.lanes |= r), l = n, n = n.return; n !== null; ) n.childLanes |= r, l = n.alternate, l !== null && (l.childLanes |= r), l = n, n = n.return;
    return l.tag === 3 ? l.stateNode : null;
  }
  var ha = !1;
  function Td(n) {
    n.updateQueue = { baseState: n.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
  }
  function zv(n, r) {
    n = n.updateQueue, r.updateQueue === n && (r.updateQueue = { baseState: n.baseState, firstBaseUpdate: n.firstBaseUpdate, lastBaseUpdate: n.lastBaseUpdate, shared: n.shared, effects: n.effects });
  }
  function qi(n, r) {
    return { eventTime: n, lane: r, tag: 0, payload: null, callback: null, next: null };
  }
  function Nl(n, r, l) {
    var o = n.updateQueue;
    if (o === null) return null;
    if (o = o.shared, bt & 2) {
      var c = o.pending;
      return c === null ? r.next = r : (r.next = c.next, c.next = r), o.pending = r, va(n, l);
    }
    return c = o.interleaved, c === null ? (r.next = r, Cd(o)) : (r.next = c.next, c.next = r), o.interleaved = r, va(n, l);
  }
  function Dc(n, r, l) {
    if (r = r.updateQueue, r !== null && (r = r.shared, (l & 4194240) !== 0)) {
      var o = r.lanes;
      o &= n.pendingLanes, l |= o, r.lanes = l, Pi(n, l);
    }
  }
  function Av(n, r) {
    var l = n.updateQueue, o = n.alternate;
    if (o !== null && (o = o.updateQueue, l === o)) {
      var c = null, d = null;
      if (l = l.firstBaseUpdate, l !== null) {
        do {
          var m = { eventTime: l.eventTime, lane: l.lane, tag: l.tag, payload: l.payload, callback: l.callback, next: null };
          d === null ? c = d = m : d = d.next = m, l = l.next;
        } while (l !== null);
        d === null ? c = d = r : d = d.next = r;
      } else c = d = r;
      l = { baseState: o.baseState, firstBaseUpdate: c, lastBaseUpdate: d, shared: o.shared, effects: o.effects }, n.updateQueue = l;
      return;
    }
    n = l.lastBaseUpdate, n === null ? l.firstBaseUpdate = r : n.next = r, l.lastBaseUpdate = r;
  }
  function ss(n, r, l, o) {
    var c = n.updateQueue;
    ha = !1;
    var d = c.firstBaseUpdate, m = c.lastBaseUpdate, E = c.shared.pending;
    if (E !== null) {
      c.shared.pending = null;
      var T = E, A = T.next;
      T.next = null, m === null ? d = A : m.next = A, m = T;
      var G = n.alternate;
      G !== null && (G = G.updateQueue, E = G.lastBaseUpdate, E !== m && (E === null ? G.firstBaseUpdate = A : E.next = A, G.lastBaseUpdate = T));
    }
    if (d !== null) {
      var K = c.baseState;
      m = 0, G = A = T = null, E = d;
      do {
        var W = E.lane, pe = E.eventTime;
        if ((o & W) === W) {
          G !== null && (G = G.next = {
            eventTime: pe,
            lane: 0,
            tag: E.tag,
            payload: E.payload,
            callback: E.callback,
            next: null
          });
          e: {
            var Ee = n, be = E;
            switch (W = r, pe = l, be.tag) {
              case 1:
                if (Ee = be.payload, typeof Ee == "function") {
                  K = Ee.call(pe, K, W);
                  break e;
                }
                K = Ee;
                break e;
              case 3:
                Ee.flags = Ee.flags & -65537 | 128;
              case 0:
                if (Ee = be.payload, W = typeof Ee == "function" ? Ee.call(pe, K, W) : Ee, W == null) break e;
                K = ie({}, K, W);
                break e;
              case 2:
                ha = !0;
            }
          }
          E.callback !== null && E.lane !== 0 && (n.flags |= 64, W = c.effects, W === null ? c.effects = [E] : W.push(E));
        } else pe = { eventTime: pe, lane: W, tag: E.tag, payload: E.payload, callback: E.callback, next: null }, G === null ? (A = G = pe, T = K) : G = G.next = pe, m |= W;
        if (E = E.next, E === null) {
          if (E = c.shared.pending, E === null) break;
          W = E, E = W.next, W.next = null, c.lastBaseUpdate = W, c.shared.pending = null;
        }
      } while (!0);
      if (G === null && (T = K), c.baseState = T, c.firstBaseUpdate = A, c.lastBaseUpdate = G, r = c.shared.interleaved, r !== null) {
        c = r;
        do
          m |= c.lane, c = c.next;
        while (c !== r);
      } else d === null && (c.shared.lanes = 0);
      Di |= m, n.lanes = m, n.memoizedState = K;
    }
  }
  function wd(n, r, l) {
    if (n = r.effects, r.effects = null, n !== null) for (r = 0; r < n.length; r++) {
      var o = n[r], c = o.callback;
      if (c !== null) {
        if (o.callback = null, o = l, typeof c != "function") throw Error(k(191, c));
        c.call(o);
      }
    }
  }
  var cs = {}, bi = Da(cs), fs = Da(cs), ds = Da(cs);
  function gu(n) {
    if (n === cs) throw Error(k(174));
    return n;
  }
  function bd(n, r) {
    switch (Oe(ds, r), Oe(fs, n), Oe(bi, cs), n = r.nodeType, n) {
      case 9:
      case 11:
        r = (r = r.documentElement) ? r.namespaceURI : sa(null, "");
        break;
      default:
        n = n === 8 ? r.parentNode : r, r = n.namespaceURI || null, n = n.tagName, r = sa(r, n);
    }
    un(bi), Oe(bi, r);
  }
  function Su() {
    un(bi), un(fs), un(ds);
  }
  function jv(n) {
    gu(ds.current);
    var r = gu(bi.current), l = sa(r, n.type);
    r !== l && (Oe(fs, n), Oe(bi, l));
  }
  function Oc(n) {
    fs.current === n && (un(bi), un(fs));
  }
  var gn = Da(0);
  function Nc(n) {
    for (var r = n; r !== null; ) {
      if (r.tag === 13) {
        var l = r.memoizedState;
        if (l !== null && (l = l.dehydrated, l === null || l.data === "$?" || l.data === "$!")) return r;
      } else if (r.tag === 19 && r.memoizedProps.revealOrder !== void 0) {
        if (r.flags & 128) return r;
      } else if (r.child !== null) {
        r.child.return = r, r = r.child;
        continue;
      }
      if (r === n) break;
      for (; r.sibling === null; ) {
        if (r.return === null || r.return === n) return null;
        r = r.return;
      }
      r.sibling.return = r.return, r = r.sibling;
    }
    return null;
  }
  var ps = [];
  function Ue() {
    for (var n = 0; n < ps.length; n++) ps[n]._workInProgressVersionPrimary = null;
    ps.length = 0;
  }
  var ht = ft.ReactCurrentDispatcher, Ut = ft.ReactCurrentBatchConfig, Xt = 0, zt = null, zn = null, Jn = null, Lc = !1, vs = !1, Eu = 0, Q = 0;
  function Nt() {
    throw Error(k(321));
  }
  function Ye(n, r) {
    if (r === null) return !1;
    for (var l = 0; l < r.length && l < n.length; l++) if (!ei(n[l], r[l])) return !1;
    return !0;
  }
  function Ll(n, r, l, o, c, d) {
    if (Xt = d, zt = r, r.memoizedState = null, r.updateQueue = null, r.lanes = 0, ht.current = n === null || n.memoizedState === null ? Wc : Es, n = l(o, c), vs) {
      d = 0;
      do {
        if (vs = !1, Eu = 0, 25 <= d) throw Error(k(301));
        d += 1, Jn = zn = null, r.updateQueue = null, ht.current = Gc, n = l(o, c);
      } while (vs);
    }
    if (ht.current = bu, r = zn !== null && zn.next !== null, Xt = 0, Jn = zn = zt = null, Lc = !1, r) throw Error(k(300));
    return n;
  }
  function ni() {
    var n = Eu !== 0;
    return Eu = 0, n;
  }
  function Rr() {
    var n = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
    return Jn === null ? zt.memoizedState = Jn = n : Jn = Jn.next = n, Jn;
  }
  function bn() {
    if (zn === null) {
      var n = zt.alternate;
      n = n !== null ? n.memoizedState : null;
    } else n = zn.next;
    var r = Jn === null ? zt.memoizedState : Jn.next;
    if (r !== null) Jn = r, zn = n;
    else {
      if (n === null) throw Error(k(310));
      zn = n, n = { memoizedState: zn.memoizedState, baseState: zn.baseState, baseQueue: zn.baseQueue, queue: zn.queue, next: null }, Jn === null ? zt.memoizedState = Jn = n : Jn = Jn.next = n;
    }
    return Jn;
  }
  function Ki(n, r) {
    return typeof r == "function" ? r(n) : r;
  }
  function Ml(n) {
    var r = bn(), l = r.queue;
    if (l === null) throw Error(k(311));
    l.lastRenderedReducer = n;
    var o = zn, c = o.baseQueue, d = l.pending;
    if (d !== null) {
      if (c !== null) {
        var m = c.next;
        c.next = d.next, d.next = m;
      }
      o.baseQueue = c = d, l.pending = null;
    }
    if (c !== null) {
      d = c.next, o = o.baseState;
      var E = m = null, T = null, A = d;
      do {
        var G = A.lane;
        if ((Xt & G) === G) T !== null && (T = T.next = { lane: 0, action: A.action, hasEagerState: A.hasEagerState, eagerState: A.eagerState, next: null }), o = A.hasEagerState ? A.eagerState : n(o, A.action);
        else {
          var K = {
            lane: G,
            action: A.action,
            hasEagerState: A.hasEagerState,
            eagerState: A.eagerState,
            next: null
          };
          T === null ? (E = T = K, m = o) : T = T.next = K, zt.lanes |= G, Di |= G;
        }
        A = A.next;
      } while (A !== null && A !== d);
      T === null ? m = o : T.next = E, ei(o, r.memoizedState) || (An = !0), r.memoizedState = o, r.baseState = m, r.baseQueue = T, l.lastRenderedState = o;
    }
    if (n = l.interleaved, n !== null) {
      c = n;
      do
        d = c.lane, zt.lanes |= d, Di |= d, c = c.next;
      while (c !== n);
    } else c === null && (l.lanes = 0);
    return [r.memoizedState, l.dispatch];
  }
  function Cu(n) {
    var r = bn(), l = r.queue;
    if (l === null) throw Error(k(311));
    l.lastRenderedReducer = n;
    var o = l.dispatch, c = l.pending, d = r.memoizedState;
    if (c !== null) {
      l.pending = null;
      var m = c = c.next;
      do
        d = n(d, m.action), m = m.next;
      while (m !== c);
      ei(d, r.memoizedState) || (An = !0), r.memoizedState = d, r.baseQueue === null && (r.baseState = d), l.lastRenderedState = d;
    }
    return [d, o];
  }
  function Mc() {
  }
  function Uc(n, r) {
    var l = zt, o = bn(), c = r(), d = !ei(o.memoizedState, c);
    if (d && (o.memoizedState = c, An = !0), o = o.queue, hs(jc.bind(null, l, o, n), [n]), o.getSnapshot !== r || d || Jn !== null && Jn.memoizedState.tag & 1) {
      if (l.flags |= 2048, Ru(9, Ac.bind(null, l, o, c, r), void 0, null), Wn === null) throw Error(k(349));
      Xt & 30 || zc(l, r, c);
    }
    return c;
  }
  function zc(n, r, l) {
    n.flags |= 16384, n = { getSnapshot: r, value: l }, r = zt.updateQueue, r === null ? (r = { lastEffect: null, stores: null }, zt.updateQueue = r, r.stores = [n]) : (l = r.stores, l === null ? r.stores = [n] : l.push(n));
  }
  function Ac(n, r, l, o) {
    r.value = l, r.getSnapshot = o, Fc(r) && Hc(n);
  }
  function jc(n, r, l) {
    return l(function() {
      Fc(r) && Hc(n);
    });
  }
  function Fc(n) {
    var r = n.getSnapshot;
    n = n.value;
    try {
      var l = r();
      return !ei(n, l);
    } catch {
      return !0;
    }
  }
  function Hc(n) {
    var r = va(n, 1);
    r !== null && Ur(r, n, 1, -1);
  }
  function Pc(n) {
    var r = Rr();
    return typeof n == "function" && (n = n()), r.memoizedState = r.baseState = n, n = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: Ki, lastRenderedState: n }, r.queue = n, n = n.dispatch = wu.bind(null, zt, n), [r.memoizedState, n];
  }
  function Ru(n, r, l, o) {
    return n = { tag: n, create: r, destroy: l, deps: o, next: null }, r = zt.updateQueue, r === null ? (r = { lastEffect: null, stores: null }, zt.updateQueue = r, r.lastEffect = n.next = n) : (l = r.lastEffect, l === null ? r.lastEffect = n.next = n : (o = l.next, l.next = n, n.next = o, r.lastEffect = n)), n;
  }
  function Vc() {
    return bn().memoizedState;
  }
  function mo(n, r, l, o) {
    var c = Rr();
    zt.flags |= n, c.memoizedState = Ru(1 | r, l, void 0, o === void 0 ? null : o);
  }
  function yo(n, r, l, o) {
    var c = bn();
    o = o === void 0 ? null : o;
    var d = void 0;
    if (zn !== null) {
      var m = zn.memoizedState;
      if (d = m.destroy, o !== null && Ye(o, m.deps)) {
        c.memoizedState = Ru(r, l, d, o);
        return;
      }
    }
    zt.flags |= n, c.memoizedState = Ru(1 | r, l, d, o);
  }
  function Bc(n, r) {
    return mo(8390656, 8, n, r);
  }
  function hs(n, r) {
    return yo(2048, 8, n, r);
  }
  function Ic(n, r) {
    return yo(4, 2, n, r);
  }
  function ms(n, r) {
    return yo(4, 4, n, r);
  }
  function Tu(n, r) {
    if (typeof r == "function") return n = n(), r(n), function() {
      r(null);
    };
    if (r != null) return n = n(), r.current = n, function() {
      r.current = null;
    };
  }
  function Yc(n, r, l) {
    return l = l != null ? l.concat([n]) : null, yo(4, 4, Tu.bind(null, r, n), l);
  }
  function ys() {
  }
  function $c(n, r) {
    var l = bn();
    r = r === void 0 ? null : r;
    var o = l.memoizedState;
    return o !== null && r !== null && Ye(r, o[1]) ? o[0] : (l.memoizedState = [n, r], n);
  }
  function Qc(n, r) {
    var l = bn();
    r = r === void 0 ? null : r;
    var o = l.memoizedState;
    return o !== null && r !== null && Ye(r, o[1]) ? o[0] : (n = n(), l.memoizedState = [n, r], n);
  }
  function xd(n, r, l) {
    return Xt & 21 ? (ei(l, r) || (l = qu(), zt.lanes |= l, Di |= l, n.baseState = !0), r) : (n.baseState && (n.baseState = !1, An = !0), n.memoizedState = l);
  }
  function gs(n, r) {
    var l = Mt;
    Mt = l !== 0 && 4 > l ? l : 4, n(!0);
    var o = Ut.transition;
    Ut.transition = {};
    try {
      n(!1), r();
    } finally {
      Mt = l, Ut.transition = o;
    }
  }
  function _d() {
    return bn().memoizedState;
  }
  function Ss(n, r, l) {
    var o = Oi(n);
    if (l = { lane: o, action: l, hasEagerState: !1, eagerState: null, next: null }, Jr(n)) Fv(r, l);
    else if (l = Rd(n, r, l, o), l !== null) {
      var c = Hn();
      Ur(l, n, o, c), tn(l, r, o);
    }
  }
  function wu(n, r, l) {
    var o = Oi(n), c = { lane: o, action: l, hasEagerState: !1, eagerState: null, next: null };
    if (Jr(n)) Fv(r, c);
    else {
      var d = n.alternate;
      if (n.lanes === 0 && (d === null || d.lanes === 0) && (d = r.lastRenderedReducer, d !== null)) try {
        var m = r.lastRenderedState, E = d(m, l);
        if (c.hasEagerState = !0, c.eagerState = E, ei(E, m)) {
          var T = r.interleaved;
          T === null ? (c.next = c, Cd(r)) : (c.next = T.next, T.next = c), r.interleaved = c;
          return;
        }
      } catch {
      } finally {
      }
      l = Rd(n, r, c, o), l !== null && (c = Hn(), Ur(l, n, o, c), tn(l, r, o));
    }
  }
  function Jr(n) {
    var r = n.alternate;
    return n === zt || r !== null && r === zt;
  }
  function Fv(n, r) {
    vs = Lc = !0;
    var l = n.pending;
    l === null ? r.next = r : (r.next = l.next, l.next = r), n.pending = r;
  }
  function tn(n, r, l) {
    if (l & 4194240) {
      var o = r.lanes;
      o &= n.pendingLanes, l |= o, r.lanes = l, Pi(n, l);
    }
  }
  var bu = { readContext: La, useCallback: Nt, useContext: Nt, useEffect: Nt, useImperativeHandle: Nt, useInsertionEffect: Nt, useLayoutEffect: Nt, useMemo: Nt, useReducer: Nt, useRef: Nt, useState: Nt, useDebugValue: Nt, useDeferredValue: Nt, useTransition: Nt, useMutableSource: Nt, useSyncExternalStore: Nt, useId: Nt, unstable_isNewReconciler: !1 }, Wc = { readContext: La, useCallback: function(n, r) {
    return Rr().memoizedState = [n, r === void 0 ? null : r], n;
  }, useContext: La, useEffect: Bc, useImperativeHandle: function(n, r, l) {
    return l = l != null ? l.concat([n]) : null, mo(
      4194308,
      4,
      Tu.bind(null, r, n),
      l
    );
  }, useLayoutEffect: function(n, r) {
    return mo(4194308, 4, n, r);
  }, useInsertionEffect: function(n, r) {
    return mo(4, 2, n, r);
  }, useMemo: function(n, r) {
    var l = Rr();
    return r = r === void 0 ? null : r, n = n(), l.memoizedState = [n, r], n;
  }, useReducer: function(n, r, l) {
    var o = Rr();
    return r = l !== void 0 ? l(r) : r, o.memoizedState = o.baseState = r, n = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: n, lastRenderedState: r }, o.queue = n, n = n.dispatch = Ss.bind(null, zt, n), [o.memoizedState, n];
  }, useRef: function(n) {
    var r = Rr();
    return n = { current: n }, r.memoizedState = n;
  }, useState: Pc, useDebugValue: ys, useDeferredValue: function(n) {
    return Rr().memoizedState = n;
  }, useTransition: function() {
    var n = Pc(!1), r = n[0];
    return n = gs.bind(null, n[1]), Rr().memoizedState = n, [r, n];
  }, useMutableSource: function() {
  }, useSyncExternalStore: function(n, r, l) {
    var o = zt, c = Rr();
    if (dn) {
      if (l === void 0) throw Error(k(407));
      l = l();
    } else {
      if (l = r(), Wn === null) throw Error(k(349));
      Xt & 30 || zc(o, r, l);
    }
    c.memoizedState = l;
    var d = { value: l, getSnapshot: r };
    return c.queue = d, Bc(jc.bind(
      null,
      o,
      d,
      n
    ), [n]), o.flags |= 2048, Ru(9, Ac.bind(null, o, d, l, r), void 0, null), l;
  }, useId: function() {
    var n = Rr(), r = Wn.identifierPrefix;
    if (dn) {
      var l = wi, o = Ti;
      l = (o & ~(1 << 32 - kr(o) - 1)).toString(32) + l, r = ":" + r + "R" + l, l = Eu++, 0 < l && (r += "H" + l.toString(32)), r += ":";
    } else l = Q++, r = ":" + r + "r" + l.toString(32) + ":";
    return n.memoizedState = r;
  }, unstable_isNewReconciler: !1 }, Es = {
    readContext: La,
    useCallback: $c,
    useContext: La,
    useEffect: hs,
    useImperativeHandle: Yc,
    useInsertionEffect: Ic,
    useLayoutEffect: ms,
    useMemo: Qc,
    useReducer: Ml,
    useRef: Vc,
    useState: function() {
      return Ml(Ki);
    },
    useDebugValue: ys,
    useDeferredValue: function(n) {
      var r = bn();
      return xd(r, zn.memoizedState, n);
    },
    useTransition: function() {
      var n = Ml(Ki)[0], r = bn().memoizedState;
      return [n, r];
    },
    useMutableSource: Mc,
    useSyncExternalStore: Uc,
    useId: _d,
    unstable_isNewReconciler: !1
  }, Gc = { readContext: La, useCallback: $c, useContext: La, useEffect: hs, useImperativeHandle: Yc, useInsertionEffect: Ic, useLayoutEffect: ms, useMemo: Qc, useReducer: Cu, useRef: Vc, useState: function() {
    return Cu(Ki);
  }, useDebugValue: ys, useDeferredValue: function(n) {
    var r = bn();
    return zn === null ? r.memoizedState = n : xd(r, zn.memoizedState, n);
  }, useTransition: function() {
    var n = Cu(Ki)[0], r = bn().memoizedState;
    return [n, r];
  }, useMutableSource: Mc, useSyncExternalStore: Uc, useId: _d, unstable_isNewReconciler: !1 };
  function ri(n, r) {
    if (n && n.defaultProps) {
      r = ie({}, r), n = n.defaultProps;
      for (var l in n) r[l] === void 0 && (r[l] = n[l]);
      return r;
    }
    return r;
  }
  function kd(n, r, l, o) {
    r = n.memoizedState, l = l(o, r), l = l == null ? r : ie({}, r, l), n.memoizedState = l, n.lanes === 0 && (n.updateQueue.baseState = l);
  }
  var qc = { isMounted: function(n) {
    return (n = n._reactInternals) ? nt(n) === n : !1;
  }, enqueueSetState: function(n, r, l) {
    n = n._reactInternals;
    var o = Hn(), c = Oi(n), d = qi(o, c);
    d.payload = r, l != null && (d.callback = l), r = Nl(n, d, c), r !== null && (Ur(r, n, c, o), Dc(r, n, c));
  }, enqueueReplaceState: function(n, r, l) {
    n = n._reactInternals;
    var o = Hn(), c = Oi(n), d = qi(o, c);
    d.tag = 1, d.payload = r, l != null && (d.callback = l), r = Nl(n, d, c), r !== null && (Ur(r, n, c, o), Dc(r, n, c));
  }, enqueueForceUpdate: function(n, r) {
    n = n._reactInternals;
    var l = Hn(), o = Oi(n), c = qi(l, o);
    c.tag = 2, r != null && (c.callback = r), r = Nl(n, c, o), r !== null && (Ur(r, n, o, l), Dc(r, n, o));
  } };
  function Hv(n, r, l, o, c, d, m) {
    return n = n.stateNode, typeof n.shouldComponentUpdate == "function" ? n.shouldComponentUpdate(o, d, m) : r.prototype && r.prototype.isPureReactComponent ? !Zo(l, o) || !Zo(c, d) : !0;
  }
  function Kc(n, r, l) {
    var o = !1, c = Cr, d = r.contextType;
    return typeof d == "object" && d !== null ? d = La(d) : (c = Mn(r) ? Wr : En.current, o = r.contextTypes, d = (o = o != null) ? Gr(n, c) : Cr), r = new r(l, d), n.memoizedState = r.state !== null && r.state !== void 0 ? r.state : null, r.updater = qc, n.stateNode = r, r._reactInternals = n, o && (n = n.stateNode, n.__reactInternalMemoizedUnmaskedChildContext = c, n.__reactInternalMemoizedMaskedChildContext = d), r;
  }
  function Pv(n, r, l, o) {
    n = r.state, typeof r.componentWillReceiveProps == "function" && r.componentWillReceiveProps(l, o), typeof r.UNSAFE_componentWillReceiveProps == "function" && r.UNSAFE_componentWillReceiveProps(l, o), r.state !== n && qc.enqueueReplaceState(r, r.state, null);
  }
  function Cs(n, r, l, o) {
    var c = n.stateNode;
    c.props = l, c.state = n.memoizedState, c.refs = {}, Td(n);
    var d = r.contextType;
    typeof d == "object" && d !== null ? c.context = La(d) : (d = Mn(r) ? Wr : En.current, c.context = Gr(n, d)), c.state = n.memoizedState, d = r.getDerivedStateFromProps, typeof d == "function" && (kd(n, r, d, l), c.state = n.memoizedState), typeof r.getDerivedStateFromProps == "function" || typeof c.getSnapshotBeforeUpdate == "function" || typeof c.UNSAFE_componentWillMount != "function" && typeof c.componentWillMount != "function" || (r = c.state, typeof c.componentWillMount == "function" && c.componentWillMount(), typeof c.UNSAFE_componentWillMount == "function" && c.UNSAFE_componentWillMount(), r !== c.state && qc.enqueueReplaceState(c, c.state, null), ss(n, l, c, o), c.state = n.memoizedState), typeof c.componentDidMount == "function" && (n.flags |= 4194308);
  }
  function xu(n, r) {
    try {
      var l = "", o = r;
      do
        l += dt(o), o = o.return;
      while (o);
      var c = l;
    } catch (d) {
      c = `
Error generating stack: ` + d.message + `
` + d.stack;
    }
    return { value: n, source: r, stack: c, digest: null };
  }
  function Dd(n, r, l) {
    return { value: n, source: null, stack: l ?? null, digest: r ?? null };
  }
  function Od(n, r) {
    try {
      console.error(r.value);
    } catch (l) {
      setTimeout(function() {
        throw l;
      });
    }
  }
  var Xc = typeof WeakMap == "function" ? WeakMap : Map;
  function Vv(n, r, l) {
    l = qi(-1, l), l.tag = 3, l.payload = { element: null };
    var o = r.value;
    return l.callback = function() {
      To || (To = !0, Du = o), Od(n, r);
    }, l;
  }
  function Nd(n, r, l) {
    l = qi(-1, l), l.tag = 3;
    var o = n.type.getDerivedStateFromError;
    if (typeof o == "function") {
      var c = r.value;
      l.payload = function() {
        return o(c);
      }, l.callback = function() {
        Od(n, r);
      };
    }
    var d = n.stateNode;
    return d !== null && typeof d.componentDidCatch == "function" && (l.callback = function() {
      Od(n, r), typeof o != "function" && (Al === null ? Al = /* @__PURE__ */ new Set([this]) : Al.add(this));
      var m = r.stack;
      this.componentDidCatch(r.value, { componentStack: m !== null ? m : "" });
    }), l;
  }
  function Ld(n, r, l) {
    var o = n.pingCache;
    if (o === null) {
      o = n.pingCache = new Xc();
      var c = /* @__PURE__ */ new Set();
      o.set(r, c);
    } else c = o.get(r), c === void 0 && (c = /* @__PURE__ */ new Set(), o.set(r, c));
    c.has(l) || (c.add(l), n = my.bind(null, n, r, l), r.then(n, n));
  }
  function Bv(n) {
    do {
      var r;
      if ((r = n.tag === 13) && (r = n.memoizedState, r = r !== null ? r.dehydrated !== null : !0), r) return n;
      n = n.return;
    } while (n !== null);
    return null;
  }
  function Ul(n, r, l, o, c) {
    return n.mode & 1 ? (n.flags |= 65536, n.lanes = c, n) : (n === r ? n.flags |= 65536 : (n.flags |= 128, l.flags |= 131072, l.flags &= -52805, l.tag === 1 && (l.alternate === null ? l.tag = 17 : (r = qi(-1, 1), r.tag = 2, Nl(l, r, 1))), l.lanes |= 1), n);
  }
  var Rs = ft.ReactCurrentOwner, An = !1;
  function ur(n, r, l, o) {
    r.child = n === null ? oe(r, null, l, o) : wn(r, n.child, l, o);
  }
  function Zr(n, r, l, o, c) {
    l = l.render;
    var d = r.ref;
    return yn(r, c), o = Ll(n, r, l, o, d, c), l = ni(), n !== null && !An ? (r.updateQueue = n.updateQueue, r.flags &= -2053, n.lanes &= ~c, Ua(n, r, c)) : (dn && l && bc(r), r.flags |= 1, ur(n, r, o, c), r.child);
  }
  function _u(n, r, l, o, c) {
    if (n === null) {
      var d = l.type;
      return typeof d == "function" && !Qd(d) && d.defaultProps === void 0 && l.compare === null && l.defaultProps === void 0 ? (r.tag = 15, r.type = d, at(n, r, d, o, c)) : (n = Fs(l.type, null, o, r, r.mode, c), n.ref = r.ref, n.return = r, r.child = n);
    }
    if (d = n.child, !(n.lanes & c)) {
      var m = d.memoizedProps;
      if (l = l.compare, l = l !== null ? l : Zo, l(m, o) && n.ref === r.ref) return Ua(n, r, c);
    }
    return r.flags |= 1, n = Fl(d, o), n.ref = r.ref, n.return = r, r.child = n;
  }
  function at(n, r, l, o, c) {
    if (n !== null) {
      var d = n.memoizedProps;
      if (Zo(d, o) && n.ref === r.ref) if (An = !1, r.pendingProps = o = d, (n.lanes & c) !== 0) n.flags & 131072 && (An = !0);
      else return r.lanes = n.lanes, Ua(n, r, c);
    }
    return Iv(n, r, l, o, c);
  }
  function Ts(n, r, l) {
    var o = r.pendingProps, c = o.children, d = n !== null ? n.memoizedState : null;
    if (o.mode === "hidden") if (!(r.mode & 1)) r.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, Oe(Eo, ma), ma |= l;
    else {
      if (!(l & 1073741824)) return n = d !== null ? d.baseLanes | l : l, r.lanes = r.childLanes = 1073741824, r.memoizedState = { baseLanes: n, cachePool: null, transitions: null }, r.updateQueue = null, Oe(Eo, ma), ma |= n, null;
      r.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, o = d !== null ? d.baseLanes : l, Oe(Eo, ma), ma |= o;
    }
    else d !== null ? (o = d.baseLanes | l, r.memoizedState = null) : o = l, Oe(Eo, ma), ma |= o;
    return ur(n, r, c, l), r.child;
  }
  function Md(n, r) {
    var l = r.ref;
    (n === null && l !== null || n !== null && n.ref !== l) && (r.flags |= 512, r.flags |= 2097152);
  }
  function Iv(n, r, l, o, c) {
    var d = Mn(l) ? Wr : En.current;
    return d = Gr(r, d), yn(r, c), l = Ll(n, r, l, o, d, c), o = ni(), n !== null && !An ? (r.updateQueue = n.updateQueue, r.flags &= -2053, n.lanes &= ~c, Ua(n, r, c)) : (dn && o && bc(r), r.flags |= 1, ur(n, r, l, c), r.child);
  }
  function Yv(n, r, l, o, c) {
    if (Mn(l)) {
      var d = !0;
      Xn(r);
    } else d = !1;
    if (yn(r, c), r.stateNode === null) Ma(n, r), Kc(r, l, o), Cs(r, l, o, c), o = !0;
    else if (n === null) {
      var m = r.stateNode, E = r.memoizedProps;
      m.props = E;
      var T = m.context, A = l.contextType;
      typeof A == "object" && A !== null ? A = La(A) : (A = Mn(l) ? Wr : En.current, A = Gr(r, A));
      var G = l.getDerivedStateFromProps, K = typeof G == "function" || typeof m.getSnapshotBeforeUpdate == "function";
      K || typeof m.UNSAFE_componentWillReceiveProps != "function" && typeof m.componentWillReceiveProps != "function" || (E !== o || T !== A) && Pv(r, m, o, A), ha = !1;
      var W = r.memoizedState;
      m.state = W, ss(r, o, m, c), T = r.memoizedState, E !== o || W !== T || $n.current || ha ? (typeof G == "function" && (kd(r, l, G, o), T = r.memoizedState), (E = ha || Hv(r, l, E, o, W, T, A)) ? (K || typeof m.UNSAFE_componentWillMount != "function" && typeof m.componentWillMount != "function" || (typeof m.componentWillMount == "function" && m.componentWillMount(), typeof m.UNSAFE_componentWillMount == "function" && m.UNSAFE_componentWillMount()), typeof m.componentDidMount == "function" && (r.flags |= 4194308)) : (typeof m.componentDidMount == "function" && (r.flags |= 4194308), r.memoizedProps = o, r.memoizedState = T), m.props = o, m.state = T, m.context = A, o = E) : (typeof m.componentDidMount == "function" && (r.flags |= 4194308), o = !1);
    } else {
      m = r.stateNode, zv(n, r), E = r.memoizedProps, A = r.type === r.elementType ? E : ri(r.type, E), m.props = A, K = r.pendingProps, W = m.context, T = l.contextType, typeof T == "object" && T !== null ? T = La(T) : (T = Mn(l) ? Wr : En.current, T = Gr(r, T));
      var pe = l.getDerivedStateFromProps;
      (G = typeof pe == "function" || typeof m.getSnapshotBeforeUpdate == "function") || typeof m.UNSAFE_componentWillReceiveProps != "function" && typeof m.componentWillReceiveProps != "function" || (E !== K || W !== T) && Pv(r, m, o, T), ha = !1, W = r.memoizedState, m.state = W, ss(r, o, m, c);
      var Ee = r.memoizedState;
      E !== K || W !== Ee || $n.current || ha ? (typeof pe == "function" && (kd(r, l, pe, o), Ee = r.memoizedState), (A = ha || Hv(r, l, A, o, W, Ee, T) || !1) ? (G || typeof m.UNSAFE_componentWillUpdate != "function" && typeof m.componentWillUpdate != "function" || (typeof m.componentWillUpdate == "function" && m.componentWillUpdate(o, Ee, T), typeof m.UNSAFE_componentWillUpdate == "function" && m.UNSAFE_componentWillUpdate(o, Ee, T)), typeof m.componentDidUpdate == "function" && (r.flags |= 4), typeof m.getSnapshotBeforeUpdate == "function" && (r.flags |= 1024)) : (typeof m.componentDidUpdate != "function" || E === n.memoizedProps && W === n.memoizedState || (r.flags |= 4), typeof m.getSnapshotBeforeUpdate != "function" || E === n.memoizedProps && W === n.memoizedState || (r.flags |= 1024), r.memoizedProps = o, r.memoizedState = Ee), m.props = o, m.state = Ee, m.context = T, o = A) : (typeof m.componentDidUpdate != "function" || E === n.memoizedProps && W === n.memoizedState || (r.flags |= 4), typeof m.getSnapshotBeforeUpdate != "function" || E === n.memoizedProps && W === n.memoizedState || (r.flags |= 1024), o = !1);
    }
    return ws(n, r, l, o, d, c);
  }
  function ws(n, r, l, o, c, d) {
    Md(n, r);
    var m = (r.flags & 128) !== 0;
    if (!o && !m) return c && Tc(r, l, !1), Ua(n, r, d);
    o = r.stateNode, Rs.current = r;
    var E = m && typeof l.getDerivedStateFromError != "function" ? null : o.render();
    return r.flags |= 1, n !== null && m ? (r.child = wn(r, n.child, null, d), r.child = wn(r, null, E, d)) : ur(n, r, E, d), r.memoizedState = o.state, c && Tc(r, l, !0), r.child;
  }
  function go(n) {
    var r = n.stateNode;
    r.pendingContext ? Nv(n, r.pendingContext, r.pendingContext !== r.context) : r.context && Nv(n, r.context, !1), bd(n, r.containerInfo);
  }
  function $v(n, r, l, o, c) {
    return Ol(), Gi(c), r.flags |= 256, ur(n, r, l, o), r.child;
  }
  var Jc = { dehydrated: null, treeContext: null, retryLane: 0 };
  function Ud(n) {
    return { baseLanes: n, cachePool: null, transitions: null };
  }
  function Zc(n, r, l) {
    var o = r.pendingProps, c = gn.current, d = !1, m = (r.flags & 128) !== 0, E;
    if ((E = m) || (E = n !== null && n.memoizedState === null ? !1 : (c & 2) !== 0), E ? (d = !0, r.flags &= -129) : (n === null || n.memoizedState !== null) && (c |= 1), Oe(gn, c & 1), n === null)
      return md(r), n = r.memoizedState, n !== null && (n = n.dehydrated, n !== null) ? (r.mode & 1 ? n.data === "$!" ? r.lanes = 8 : r.lanes = 1073741824 : r.lanes = 1, null) : (m = o.children, n = o.fallback, d ? (o = r.mode, d = r.child, m = { mode: "hidden", children: m }, !(o & 1) && d !== null ? (d.childLanes = 0, d.pendingProps = m) : d = Hl(m, o, 0, null), n = el(n, o, l, null), d.return = r, n.return = r, d.sibling = n, r.child = d, r.child.memoizedState = Ud(l), r.memoizedState = Jc, n) : zd(r, m));
    if (c = n.memoizedState, c !== null && (E = c.dehydrated, E !== null)) return Qv(n, r, m, o, E, c, l);
    if (d) {
      d = o.fallback, m = r.mode, c = n.child, E = c.sibling;
      var T = { mode: "hidden", children: o.children };
      return !(m & 1) && r.child !== c ? (o = r.child, o.childLanes = 0, o.pendingProps = T, r.deletions = null) : (o = Fl(c, T), o.subtreeFlags = c.subtreeFlags & 14680064), E !== null ? d = Fl(E, d) : (d = el(d, m, l, null), d.flags |= 2), d.return = r, o.return = r, o.sibling = d, r.child = o, o = d, d = r.child, m = n.child.memoizedState, m = m === null ? Ud(l) : { baseLanes: m.baseLanes | l, cachePool: null, transitions: m.transitions }, d.memoizedState = m, d.childLanes = n.childLanes & ~l, r.memoizedState = Jc, o;
    }
    return d = n.child, n = d.sibling, o = Fl(d, { mode: "visible", children: o.children }), !(r.mode & 1) && (o.lanes = l), o.return = r, o.sibling = null, n !== null && (l = r.deletions, l === null ? (r.deletions = [n], r.flags |= 16) : l.push(n)), r.child = o, r.memoizedState = null, o;
  }
  function zd(n, r) {
    return r = Hl({ mode: "visible", children: r }, n.mode, 0, null), r.return = n, n.child = r;
  }
  function bs(n, r, l, o) {
    return o !== null && Gi(o), wn(r, n.child, null, l), n = zd(r, r.pendingProps.children), n.flags |= 2, r.memoizedState = null, n;
  }
  function Qv(n, r, l, o, c, d, m) {
    if (l)
      return r.flags & 256 ? (r.flags &= -257, o = Dd(Error(k(422))), bs(n, r, m, o)) : r.memoizedState !== null ? (r.child = n.child, r.flags |= 128, null) : (d = o.fallback, c = r.mode, o = Hl({ mode: "visible", children: o.children }, c, 0, null), d = el(d, c, m, null), d.flags |= 2, o.return = r, d.return = r, o.sibling = d, r.child = o, r.mode & 1 && wn(r, n.child, null, m), r.child.memoizedState = Ud(m), r.memoizedState = Jc, d);
    if (!(r.mode & 1)) return bs(n, r, m, null);
    if (c.data === "$!") {
      if (o = c.nextSibling && c.nextSibling.dataset, o) var E = o.dgst;
      return o = E, d = Error(k(419)), o = Dd(d, o, void 0), bs(n, r, m, o);
    }
    if (E = (m & n.childLanes) !== 0, An || E) {
      if (o = Wn, o !== null) {
        switch (m & -m) {
          case 4:
            c = 2;
            break;
          case 16:
            c = 8;
            break;
          case 64:
          case 128:
          case 256:
          case 512:
          case 1024:
          case 2048:
          case 4096:
          case 8192:
          case 16384:
          case 32768:
          case 65536:
          case 131072:
          case 262144:
          case 524288:
          case 1048576:
          case 2097152:
          case 4194304:
          case 8388608:
          case 16777216:
          case 33554432:
          case 67108864:
            c = 32;
            break;
          case 536870912:
            c = 268435456;
            break;
          default:
            c = 0;
        }
        c = c & (o.suspendedLanes | m) ? 0 : c, c !== 0 && c !== d.retryLane && (d.retryLane = c, va(n, c), Ur(o, n, c, -1));
      }
      return $d(), o = Dd(Error(k(421))), bs(n, r, m, o);
    }
    return c.data === "$?" ? (r.flags |= 128, r.child = n.child, r = yy.bind(null, n), c._reactRetry = r, null) : (n = d.treeContext, Kr = Si(c.nextSibling), qr = r, dn = !0, Na = null, n !== null && (Un[Oa++] = Ti, Un[Oa++] = wi, Un[Oa++] = da, Ti = n.id, wi = n.overflow, da = r), r = zd(r, o.children), r.flags |= 4096, r);
  }
  function Ad(n, r, l) {
    n.lanes |= r;
    var o = n.alternate;
    o !== null && (o.lanes |= r), Ed(n.return, r, l);
  }
  function Nr(n, r, l, o, c) {
    var d = n.memoizedState;
    d === null ? n.memoizedState = { isBackwards: r, rendering: null, renderingStartTime: 0, last: o, tail: l, tailMode: c } : (d.isBackwards = r, d.rendering = null, d.renderingStartTime = 0, d.last = o, d.tail = l, d.tailMode = c);
  }
  function xi(n, r, l) {
    var o = r.pendingProps, c = o.revealOrder, d = o.tail;
    if (ur(n, r, o.children, l), o = gn.current, o & 2) o = o & 1 | 2, r.flags |= 128;
    else {
      if (n !== null && n.flags & 128) e: for (n = r.child; n !== null; ) {
        if (n.tag === 13) n.memoizedState !== null && Ad(n, l, r);
        else if (n.tag === 19) Ad(n, l, r);
        else if (n.child !== null) {
          n.child.return = n, n = n.child;
          continue;
        }
        if (n === r) break e;
        for (; n.sibling === null; ) {
          if (n.return === null || n.return === r) break e;
          n = n.return;
        }
        n.sibling.return = n.return, n = n.sibling;
      }
      o &= 1;
    }
    if (Oe(gn, o), !(r.mode & 1)) r.memoizedState = null;
    else switch (c) {
      case "forwards":
        for (l = r.child, c = null; l !== null; ) n = l.alternate, n !== null && Nc(n) === null && (c = l), l = l.sibling;
        l = c, l === null ? (c = r.child, r.child = null) : (c = l.sibling, l.sibling = null), Nr(r, !1, c, l, d);
        break;
      case "backwards":
        for (l = null, c = r.child, r.child = null; c !== null; ) {
          if (n = c.alternate, n !== null && Nc(n) === null) {
            r.child = c;
            break;
          }
          n = c.sibling, c.sibling = l, l = c, c = n;
        }
        Nr(r, !0, l, null, d);
        break;
      case "together":
        Nr(r, !1, null, null, void 0);
        break;
      default:
        r.memoizedState = null;
    }
    return r.child;
  }
  function Ma(n, r) {
    !(r.mode & 1) && n !== null && (n.alternate = null, r.alternate = null, r.flags |= 2);
  }
  function Ua(n, r, l) {
    if (n !== null && (r.dependencies = n.dependencies), Di |= r.lanes, !(l & r.childLanes)) return null;
    if (n !== null && r.child !== n.child) throw Error(k(153));
    if (r.child !== null) {
      for (n = r.child, l = Fl(n, n.pendingProps), r.child = l, l.return = r; n.sibling !== null; ) n = n.sibling, l = l.sibling = Fl(n, n.pendingProps), l.return = r;
      l.sibling = null;
    }
    return r.child;
  }
  function xs(n, r, l) {
    switch (r.tag) {
      case 3:
        go(r), Ol();
        break;
      case 5:
        jv(r);
        break;
      case 1:
        Mn(r.type) && Xn(r);
        break;
      case 4:
        bd(r, r.stateNode.containerInfo);
        break;
      case 10:
        var o = r.type._context, c = r.memoizedProps.value;
        Oe(pa, o._currentValue), o._currentValue = c;
        break;
      case 13:
        if (o = r.memoizedState, o !== null)
          return o.dehydrated !== null ? (Oe(gn, gn.current & 1), r.flags |= 128, null) : l & r.child.childLanes ? Zc(n, r, l) : (Oe(gn, gn.current & 1), n = Ua(n, r, l), n !== null ? n.sibling : null);
        Oe(gn, gn.current & 1);
        break;
      case 19:
        if (o = (l & r.childLanes) !== 0, n.flags & 128) {
          if (o) return xi(n, r, l);
          r.flags |= 128;
        }
        if (c = r.memoizedState, c !== null && (c.rendering = null, c.tail = null, c.lastEffect = null), Oe(gn, gn.current), o) break;
        return null;
      case 22:
      case 23:
        return r.lanes = 0, Ts(n, r, l);
    }
    return Ua(n, r, l);
  }
  var za, jn, Wv, Gv;
  za = function(n, r) {
    for (var l = r.child; l !== null; ) {
      if (l.tag === 5 || l.tag === 6) n.appendChild(l.stateNode);
      else if (l.tag !== 4 && l.child !== null) {
        l.child.return = l, l = l.child;
        continue;
      }
      if (l === r) break;
      for (; l.sibling === null; ) {
        if (l.return === null || l.return === r) return;
        l = l.return;
      }
      l.sibling.return = l.return, l = l.sibling;
    }
  }, jn = function() {
  }, Wv = function(n, r, l, o) {
    var c = n.memoizedProps;
    if (c !== o) {
      n = r.stateNode, gu(bi.current);
      var d = null;
      switch (l) {
        case "input":
          c = nr(n, c), o = nr(n, o), d = [];
          break;
        case "select":
          c = ie({}, c, { value: void 0 }), o = ie({}, o, { value: void 0 }), d = [];
          break;
        case "textarea":
          c = In(n, c), o = In(n, o), d = [];
          break;
        default:
          typeof c.onClick != "function" && typeof o.onClick == "function" && (n.onclick = wl);
      }
      on(l, o);
      var m;
      l = null;
      for (A in c) if (!o.hasOwnProperty(A) && c.hasOwnProperty(A) && c[A] != null) if (A === "style") {
        var E = c[A];
        for (m in E) E.hasOwnProperty(m) && (l || (l = {}), l[m] = "");
      } else A !== "dangerouslySetInnerHTML" && A !== "children" && A !== "suppressContentEditableWarning" && A !== "suppressHydrationWarning" && A !== "autoFocus" && (Te.hasOwnProperty(A) ? d || (d = []) : (d = d || []).push(A, null));
      for (A in o) {
        var T = o[A];
        if (E = c != null ? c[A] : void 0, o.hasOwnProperty(A) && T !== E && (T != null || E != null)) if (A === "style") if (E) {
          for (m in E) !E.hasOwnProperty(m) || T && T.hasOwnProperty(m) || (l || (l = {}), l[m] = "");
          for (m in T) T.hasOwnProperty(m) && E[m] !== T[m] && (l || (l = {}), l[m] = T[m]);
        } else l || (d || (d = []), d.push(
          A,
          l
        )), l = T;
        else A === "dangerouslySetInnerHTML" ? (T = T ? T.__html : void 0, E = E ? E.__html : void 0, T != null && E !== T && (d = d || []).push(A, T)) : A === "children" ? typeof T != "string" && typeof T != "number" || (d = d || []).push(A, "" + T) : A !== "suppressContentEditableWarning" && A !== "suppressHydrationWarning" && (Te.hasOwnProperty(A) ? (T != null && A === "onScroll" && Vt("scroll", n), d || E === T || (d = [])) : (d = d || []).push(A, T));
      }
      l && (d = d || []).push("style", l);
      var A = d;
      (r.updateQueue = A) && (r.flags |= 4);
    }
  }, Gv = function(n, r, l, o) {
    l !== o && (r.flags |= 4);
  };
  function _s(n, r) {
    if (!dn) switch (n.tailMode) {
      case "hidden":
        r = n.tail;
        for (var l = null; r !== null; ) r.alternate !== null && (l = r), r = r.sibling;
        l === null ? n.tail = null : l.sibling = null;
        break;
      case "collapsed":
        l = n.tail;
        for (var o = null; l !== null; ) l.alternate !== null && (o = l), l = l.sibling;
        o === null ? r || n.tail === null ? n.tail = null : n.tail.sibling = null : o.sibling = null;
    }
  }
  function Zn(n) {
    var r = n.alternate !== null && n.alternate.child === n.child, l = 0, o = 0;
    if (r) for (var c = n.child; c !== null; ) l |= c.lanes | c.childLanes, o |= c.subtreeFlags & 14680064, o |= c.flags & 14680064, c.return = n, c = c.sibling;
    else for (c = n.child; c !== null; ) l |= c.lanes | c.childLanes, o |= c.subtreeFlags, o |= c.flags, c.return = n, c = c.sibling;
    return n.subtreeFlags |= o, n.childLanes = l, r;
  }
  function qv(n, r, l) {
    var o = r.pendingProps;
    switch (xc(r), r.tag) {
      case 2:
      case 16:
      case 15:
      case 0:
      case 11:
      case 7:
      case 8:
      case 12:
      case 9:
      case 14:
        return Zn(r), null;
      case 1:
        return Mn(r.type) && po(), Zn(r), null;
      case 3:
        return o = r.stateNode, Su(), un($n), un(En), Ue(), o.pendingContext && (o.context = o.pendingContext, o.pendingContext = null), (n === null || n.child === null) && (_c(r) ? r.flags |= 4 : n === null || n.memoizedState.isDehydrated && !(r.flags & 256) || (r.flags |= 1024, Na !== null && (Ou(Na), Na = null))), jn(n, r), Zn(r), null;
      case 5:
        Oc(r);
        var c = gu(ds.current);
        if (l = r.type, n !== null && r.stateNode != null) Wv(n, r, l, o, c), n.ref !== r.ref && (r.flags |= 512, r.flags |= 2097152);
        else {
          if (!o) {
            if (r.stateNode === null) throw Error(k(166));
            return Zn(r), null;
          }
          if (n = gu(bi.current), _c(r)) {
            o = r.stateNode, l = r.type;
            var d = r.memoizedProps;
            switch (o[Ei] = r, o[is] = d, n = (r.mode & 1) !== 0, l) {
              case "dialog":
                Vt("cancel", o), Vt("close", o);
                break;
              case "iframe":
              case "object":
              case "embed":
                Vt("load", o);
                break;
              case "video":
              case "audio":
                for (c = 0; c < ns.length; c++) Vt(ns[c], o);
                break;
              case "source":
                Vt("error", o);
                break;
              case "img":
              case "image":
              case "link":
                Vt(
                  "error",
                  o
                ), Vt("load", o);
                break;
              case "details":
                Vt("toggle", o);
                break;
              case "input":
                Vn(o, d), Vt("invalid", o);
                break;
              case "select":
                o._wrapperState = { wasMultiple: !!d.multiple }, Vt("invalid", o);
                break;
              case "textarea":
                gr(o, d), Vt("invalid", o);
            }
            on(l, d), c = null;
            for (var m in d) if (d.hasOwnProperty(m)) {
              var E = d[m];
              m === "children" ? typeof E == "string" ? o.textContent !== E && (d.suppressHydrationWarning !== !0 && Sc(o.textContent, E, n), c = ["children", E]) : typeof E == "number" && o.textContent !== "" + E && (d.suppressHydrationWarning !== !0 && Sc(
                o.textContent,
                E,
                n
              ), c = ["children", "" + E]) : Te.hasOwnProperty(m) && E != null && m === "onScroll" && Vt("scroll", o);
            }
            switch (l) {
              case "input":
                On(o), si(o, d, !0);
                break;
              case "textarea":
                On(o), Nn(o);
                break;
              case "select":
              case "option":
                break;
              default:
                typeof d.onClick == "function" && (o.onclick = wl);
            }
            o = c, r.updateQueue = o, o !== null && (r.flags |= 4);
          } else {
            m = c.nodeType === 9 ? c : c.ownerDocument, n === "http://www.w3.org/1999/xhtml" && (n = Sr(l)), n === "http://www.w3.org/1999/xhtml" ? l === "script" ? (n = m.createElement("div"), n.innerHTML = "<script><\/script>", n = n.removeChild(n.firstChild)) : typeof o.is == "string" ? n = m.createElement(l, { is: o.is }) : (n = m.createElement(l), l === "select" && (m = n, o.multiple ? m.multiple = !0 : o.size && (m.size = o.size))) : n = m.createElementNS(n, l), n[Ei] = r, n[is] = o, za(n, r, !1, !1), r.stateNode = n;
            e: {
              switch (m = Kn(l, o), l) {
                case "dialog":
                  Vt("cancel", n), Vt("close", n), c = o;
                  break;
                case "iframe":
                case "object":
                case "embed":
                  Vt("load", n), c = o;
                  break;
                case "video":
                case "audio":
                  for (c = 0; c < ns.length; c++) Vt(ns[c], n);
                  c = o;
                  break;
                case "source":
                  Vt("error", n), c = o;
                  break;
                case "img":
                case "image":
                case "link":
                  Vt(
                    "error",
                    n
                  ), Vt("load", n), c = o;
                  break;
                case "details":
                  Vt("toggle", n), c = o;
                  break;
                case "input":
                  Vn(n, o), c = nr(n, o), Vt("invalid", n);
                  break;
                case "option":
                  c = o;
                  break;
                case "select":
                  n._wrapperState = { wasMultiple: !!o.multiple }, c = ie({}, o, { value: void 0 }), Vt("invalid", n);
                  break;
                case "textarea":
                  gr(n, o), c = In(n, o), Vt("invalid", n);
                  break;
                default:
                  c = o;
              }
              on(l, c), E = c;
              for (d in E) if (E.hasOwnProperty(d)) {
                var T = E[d];
                d === "style" ? nn(n, T) : d === "dangerouslySetInnerHTML" ? (T = T ? T.__html : void 0, T != null && ci(n, T)) : d === "children" ? typeof T == "string" ? (l !== "textarea" || T !== "") && ne(n, T) : typeof T == "number" && ne(n, "" + T) : d !== "suppressContentEditableWarning" && d !== "suppressHydrationWarning" && d !== "autoFocus" && (Te.hasOwnProperty(d) ? T != null && d === "onScroll" && Vt("scroll", n) : T != null && Ge(n, d, T, m));
              }
              switch (l) {
                case "input":
                  On(n), si(n, o, !1);
                  break;
                case "textarea":
                  On(n), Nn(n);
                  break;
                case "option":
                  o.value != null && n.setAttribute("value", "" + ot(o.value));
                  break;
                case "select":
                  n.multiple = !!o.multiple, d = o.value, d != null ? Rn(n, !!o.multiple, d, !1) : o.defaultValue != null && Rn(
                    n,
                    !!o.multiple,
                    o.defaultValue,
                    !0
                  );
                  break;
                default:
                  typeof c.onClick == "function" && (n.onclick = wl);
              }
              switch (l) {
                case "button":
                case "input":
                case "select":
                case "textarea":
                  o = !!o.autoFocus;
                  break e;
                case "img":
                  o = !0;
                  break e;
                default:
                  o = !1;
              }
            }
            o && (r.flags |= 4);
          }
          r.ref !== null && (r.flags |= 512, r.flags |= 2097152);
        }
        return Zn(r), null;
      case 6:
        if (n && r.stateNode != null) Gv(n, r, n.memoizedProps, o);
        else {
          if (typeof o != "string" && r.stateNode === null) throw Error(k(166));
          if (l = gu(ds.current), gu(bi.current), _c(r)) {
            if (o = r.stateNode, l = r.memoizedProps, o[Ei] = r, (d = o.nodeValue !== l) && (n = qr, n !== null)) switch (n.tag) {
              case 3:
                Sc(o.nodeValue, l, (n.mode & 1) !== 0);
                break;
              case 5:
                n.memoizedProps.suppressHydrationWarning !== !0 && Sc(o.nodeValue, l, (n.mode & 1) !== 0);
            }
            d && (r.flags |= 4);
          } else o = (l.nodeType === 9 ? l : l.ownerDocument).createTextNode(o), o[Ei] = r, r.stateNode = o;
        }
        return Zn(r), null;
      case 13:
        if (un(gn), o = r.memoizedState, n === null || n.memoizedState !== null && n.memoizedState.dehydrated !== null) {
          if (dn && Kr !== null && r.mode & 1 && !(r.flags & 128)) os(), Ol(), r.flags |= 98560, d = !1;
          else if (d = _c(r), o !== null && o.dehydrated !== null) {
            if (n === null) {
              if (!d) throw Error(k(318));
              if (d = r.memoizedState, d = d !== null ? d.dehydrated : null, !d) throw Error(k(317));
              d[Ei] = r;
            } else Ol(), !(r.flags & 128) && (r.memoizedState = null), r.flags |= 4;
            Zn(r), d = !1;
          } else Na !== null && (Ou(Na), Na = null), d = !0;
          if (!d) return r.flags & 65536 ? r : null;
        }
        return r.flags & 128 ? (r.lanes = l, r) : (o = o !== null, o !== (n !== null && n.memoizedState !== null) && o && (r.child.flags |= 8192, r.mode & 1 && (n === null || gn.current & 1 ? _n === 0 && (_n = 3) : $d())), r.updateQueue !== null && (r.flags |= 4), Zn(r), null);
      case 4:
        return Su(), jn(n, r), n === null && uo(r.stateNode.containerInfo), Zn(r), null;
      case 10:
        return Sd(r.type._context), Zn(r), null;
      case 17:
        return Mn(r.type) && po(), Zn(r), null;
      case 19:
        if (un(gn), d = r.memoizedState, d === null) return Zn(r), null;
        if (o = (r.flags & 128) !== 0, m = d.rendering, m === null) if (o) _s(d, !1);
        else {
          if (_n !== 0 || n !== null && n.flags & 128) for (n = r.child; n !== null; ) {
            if (m = Nc(n), m !== null) {
              for (r.flags |= 128, _s(d, !1), o = m.updateQueue, o !== null && (r.updateQueue = o, r.flags |= 4), r.subtreeFlags = 0, o = l, l = r.child; l !== null; ) d = l, n = o, d.flags &= 14680066, m = d.alternate, m === null ? (d.childLanes = 0, d.lanes = n, d.child = null, d.subtreeFlags = 0, d.memoizedProps = null, d.memoizedState = null, d.updateQueue = null, d.dependencies = null, d.stateNode = null) : (d.childLanes = m.childLanes, d.lanes = m.lanes, d.child = m.child, d.subtreeFlags = 0, d.deletions = null, d.memoizedProps = m.memoizedProps, d.memoizedState = m.memoizedState, d.updateQueue = m.updateQueue, d.type = m.type, n = m.dependencies, d.dependencies = n === null ? null : { lanes: n.lanes, firstContext: n.firstContext }), l = l.sibling;
              return Oe(gn, gn.current & 1 | 2), r.child;
            }
            n = n.sibling;
          }
          d.tail !== null && rt() > Ro && (r.flags |= 128, o = !0, _s(d, !1), r.lanes = 4194304);
        }
        else {
          if (!o) if (n = Nc(m), n !== null) {
            if (r.flags |= 128, o = !0, l = n.updateQueue, l !== null && (r.updateQueue = l, r.flags |= 4), _s(d, !0), d.tail === null && d.tailMode === "hidden" && !m.alternate && !dn) return Zn(r), null;
          } else 2 * rt() - d.renderingStartTime > Ro && l !== 1073741824 && (r.flags |= 128, o = !0, _s(d, !1), r.lanes = 4194304);
          d.isBackwards ? (m.sibling = r.child, r.child = m) : (l = d.last, l !== null ? l.sibling = m : r.child = m, d.last = m);
        }
        return d.tail !== null ? (r = d.tail, d.rendering = r, d.tail = r.sibling, d.renderingStartTime = rt(), r.sibling = null, l = gn.current, Oe(gn, o ? l & 1 | 2 : l & 1), r) : (Zn(r), null);
      case 22:
      case 23:
        return Yd(), o = r.memoizedState !== null, n !== null && n.memoizedState !== null !== o && (r.flags |= 8192), o && r.mode & 1 ? ma & 1073741824 && (Zn(r), r.subtreeFlags & 6 && (r.flags |= 8192)) : Zn(r), null;
      case 24:
        return null;
      case 25:
        return null;
    }
    throw Error(k(156, r.tag));
  }
  function ef(n, r) {
    switch (xc(r), r.tag) {
      case 1:
        return Mn(r.type) && po(), n = r.flags, n & 65536 ? (r.flags = n & -65537 | 128, r) : null;
      case 3:
        return Su(), un($n), un(En), Ue(), n = r.flags, n & 65536 && !(n & 128) ? (r.flags = n & -65537 | 128, r) : null;
      case 5:
        return Oc(r), null;
      case 13:
        if (un(gn), n = r.memoizedState, n !== null && n.dehydrated !== null) {
          if (r.alternate === null) throw Error(k(340));
          Ol();
        }
        return n = r.flags, n & 65536 ? (r.flags = n & -65537 | 128, r) : null;
      case 19:
        return un(gn), null;
      case 4:
        return Su(), null;
      case 10:
        return Sd(r.type._context), null;
      case 22:
      case 23:
        return Yd(), null;
      case 24:
        return null;
      default:
        return null;
    }
  }
  var ks = !1, Tr = !1, cy = typeof WeakSet == "function" ? WeakSet : Set, me = null;
  function So(n, r) {
    var l = n.ref;
    if (l !== null) if (typeof l == "function") try {
      l(null);
    } catch (o) {
      pn(n, r, o);
    }
    else l.current = null;
  }
  function tf(n, r, l) {
    try {
      l();
    } catch (o) {
      pn(n, r, o);
    }
  }
  var Kv = !1;
  function Xv(n, r) {
    if (as = xa, n = es(), fc(n)) {
      if ("selectionStart" in n) var l = { start: n.selectionStart, end: n.selectionEnd };
      else e: {
        l = (l = n.ownerDocument) && l.defaultView || window;
        var o = l.getSelection && l.getSelection();
        if (o && o.rangeCount !== 0) {
          l = o.anchorNode;
          var c = o.anchorOffset, d = o.focusNode;
          o = o.focusOffset;
          try {
            l.nodeType, d.nodeType;
          } catch {
            l = null;
            break e;
          }
          var m = 0, E = -1, T = -1, A = 0, G = 0, K = n, W = null;
          t: for (; ; ) {
            for (var pe; K !== l || c !== 0 && K.nodeType !== 3 || (E = m + c), K !== d || o !== 0 && K.nodeType !== 3 || (T = m + o), K.nodeType === 3 && (m += K.nodeValue.length), (pe = K.firstChild) !== null; )
              W = K, K = pe;
            for (; ; ) {
              if (K === n) break t;
              if (W === l && ++A === c && (E = m), W === d && ++G === o && (T = m), (pe = K.nextSibling) !== null) break;
              K = W, W = K.parentNode;
            }
            K = pe;
          }
          l = E === -1 || T === -1 ? null : { start: E, end: T };
        } else l = null;
      }
      l = l || { start: 0, end: 0 };
    } else l = null;
    for (du = { focusedElem: n, selectionRange: l }, xa = !1, me = r; me !== null; ) if (r = me, n = r.child, (r.subtreeFlags & 1028) !== 0 && n !== null) n.return = r, me = n;
    else for (; me !== null; ) {
      r = me;
      try {
        var Ee = r.alternate;
        if (r.flags & 1024) switch (r.tag) {
          case 0:
          case 11:
          case 15:
            break;
          case 1:
            if (Ee !== null) {
              var be = Ee.memoizedProps, kn = Ee.memoizedState, O = r.stateNode, b = O.getSnapshotBeforeUpdate(r.elementType === r.type ? be : ri(r.type, be), kn);
              O.__reactInternalSnapshotBeforeUpdate = b;
            }
            break;
          case 3:
            var M = r.stateNode.containerInfo;
            M.nodeType === 1 ? M.textContent = "" : M.nodeType === 9 && M.documentElement && M.removeChild(M.documentElement);
            break;
          case 5:
          case 6:
          case 4:
          case 17:
            break;
          default:
            throw Error(k(163));
        }
      } catch (q) {
        pn(r, r.return, q);
      }
      if (n = r.sibling, n !== null) {
        n.return = r.return, me = n;
        break;
      }
      me = r.return;
    }
    return Ee = Kv, Kv = !1, Ee;
  }
  function Ds(n, r, l) {
    var o = r.updateQueue;
    if (o = o !== null ? o.lastEffect : null, o !== null) {
      var c = o = o.next;
      do {
        if ((c.tag & n) === n) {
          var d = c.destroy;
          c.destroy = void 0, d !== void 0 && tf(r, l, d);
        }
        c = c.next;
      } while (c !== o);
    }
  }
  function Os(n, r) {
    if (r = r.updateQueue, r = r !== null ? r.lastEffect : null, r !== null) {
      var l = r = r.next;
      do {
        if ((l.tag & n) === n) {
          var o = l.create;
          l.destroy = o();
        }
        l = l.next;
      } while (l !== r);
    }
  }
  function jd(n) {
    var r = n.ref;
    if (r !== null) {
      var l = n.stateNode;
      switch (n.tag) {
        case 5:
          n = l;
          break;
        default:
          n = l;
      }
      typeof r == "function" ? r(n) : r.current = n;
    }
  }
  function nf(n) {
    var r = n.alternate;
    r !== null && (n.alternate = null, nf(r)), n.child = null, n.deletions = null, n.sibling = null, n.tag === 5 && (r = n.stateNode, r !== null && (delete r[Ei], delete r[is], delete r[ls], delete r[fo], delete r[oy])), n.stateNode = null, n.return = null, n.dependencies = null, n.memoizedProps = null, n.memoizedState = null, n.pendingProps = null, n.stateNode = null, n.updateQueue = null;
  }
  function Ns(n) {
    return n.tag === 5 || n.tag === 3 || n.tag === 4;
  }
  function Xi(n) {
    e: for (; ; ) {
      for (; n.sibling === null; ) {
        if (n.return === null || Ns(n.return)) return null;
        n = n.return;
      }
      for (n.sibling.return = n.return, n = n.sibling; n.tag !== 5 && n.tag !== 6 && n.tag !== 18; ) {
        if (n.flags & 2 || n.child === null || n.tag === 4) continue e;
        n.child.return = n, n = n.child;
      }
      if (!(n.flags & 2)) return n.stateNode;
    }
  }
  function _i(n, r, l) {
    var o = n.tag;
    if (o === 5 || o === 6) n = n.stateNode, r ? l.nodeType === 8 ? l.parentNode.insertBefore(n, r) : l.insertBefore(n, r) : (l.nodeType === 8 ? (r = l.parentNode, r.insertBefore(n, l)) : (r = l, r.appendChild(n)), l = l._reactRootContainer, l != null || r.onclick !== null || (r.onclick = wl));
    else if (o !== 4 && (n = n.child, n !== null)) for (_i(n, r, l), n = n.sibling; n !== null; ) _i(n, r, l), n = n.sibling;
  }
  function ki(n, r, l) {
    var o = n.tag;
    if (o === 5 || o === 6) n = n.stateNode, r ? l.insertBefore(n, r) : l.appendChild(n);
    else if (o !== 4 && (n = n.child, n !== null)) for (ki(n, r, l), n = n.sibling; n !== null; ) ki(n, r, l), n = n.sibling;
  }
  var xn = null, Lr = !1;
  function Mr(n, r, l) {
    for (l = l.child; l !== null; ) Jv(n, r, l), l = l.sibling;
  }
  function Jv(n, r, l) {
    if ($r && typeof $r.onCommitFiberUnmount == "function") try {
      $r.onCommitFiberUnmount(hl, l);
    } catch {
    }
    switch (l.tag) {
      case 5:
        Tr || So(l, r);
      case 6:
        var o = xn, c = Lr;
        xn = null, Mr(n, r, l), xn = o, Lr = c, xn !== null && (Lr ? (n = xn, l = l.stateNode, n.nodeType === 8 ? n.parentNode.removeChild(l) : n.removeChild(l)) : xn.removeChild(l.stateNode));
        break;
      case 18:
        xn !== null && (Lr ? (n = xn, l = l.stateNode, n.nodeType === 8 ? co(n.parentNode, l) : n.nodeType === 1 && co(n, l), Ja(n)) : co(xn, l.stateNode));
        break;
      case 4:
        o = xn, c = Lr, xn = l.stateNode.containerInfo, Lr = !0, Mr(n, r, l), xn = o, Lr = c;
        break;
      case 0:
      case 11:
      case 14:
      case 15:
        if (!Tr && (o = l.updateQueue, o !== null && (o = o.lastEffect, o !== null))) {
          c = o = o.next;
          do {
            var d = c, m = d.destroy;
            d = d.tag, m !== void 0 && (d & 2 || d & 4) && tf(l, r, m), c = c.next;
          } while (c !== o);
        }
        Mr(n, r, l);
        break;
      case 1:
        if (!Tr && (So(l, r), o = l.stateNode, typeof o.componentWillUnmount == "function")) try {
          o.props = l.memoizedProps, o.state = l.memoizedState, o.componentWillUnmount();
        } catch (E) {
          pn(l, r, E);
        }
        Mr(n, r, l);
        break;
      case 21:
        Mr(n, r, l);
        break;
      case 22:
        l.mode & 1 ? (Tr = (o = Tr) || l.memoizedState !== null, Mr(n, r, l), Tr = o) : Mr(n, r, l);
        break;
      default:
        Mr(n, r, l);
    }
  }
  function Zv(n) {
    var r = n.updateQueue;
    if (r !== null) {
      n.updateQueue = null;
      var l = n.stateNode;
      l === null && (l = n.stateNode = new cy()), r.forEach(function(o) {
        var c = oh.bind(null, n, o);
        l.has(o) || (l.add(o), o.then(c, c));
      });
    }
  }
  function ai(n, r) {
    var l = r.deletions;
    if (l !== null) for (var o = 0; o < l.length; o++) {
      var c = l[o];
      try {
        var d = n, m = r, E = m;
        e: for (; E !== null; ) {
          switch (E.tag) {
            case 5:
              xn = E.stateNode, Lr = !1;
              break e;
            case 3:
              xn = E.stateNode.containerInfo, Lr = !0;
              break e;
            case 4:
              xn = E.stateNode.containerInfo, Lr = !0;
              break e;
          }
          E = E.return;
        }
        if (xn === null) throw Error(k(160));
        Jv(d, m, c), xn = null, Lr = !1;
        var T = c.alternate;
        T !== null && (T.return = null), c.return = null;
      } catch (A) {
        pn(c, r, A);
      }
    }
    if (r.subtreeFlags & 12854) for (r = r.child; r !== null; ) Fd(r, n), r = r.sibling;
  }
  function Fd(n, r) {
    var l = n.alternate, o = n.flags;
    switch (n.tag) {
      case 0:
      case 11:
      case 14:
      case 15:
        if (ai(r, n), ea(n), o & 4) {
          try {
            Ds(3, n, n.return), Os(3, n);
          } catch (be) {
            pn(n, n.return, be);
          }
          try {
            Ds(5, n, n.return);
          } catch (be) {
            pn(n, n.return, be);
          }
        }
        break;
      case 1:
        ai(r, n), ea(n), o & 512 && l !== null && So(l, l.return);
        break;
      case 5:
        if (ai(r, n), ea(n), o & 512 && l !== null && So(l, l.return), n.flags & 32) {
          var c = n.stateNode;
          try {
            ne(c, "");
          } catch (be) {
            pn(n, n.return, be);
          }
        }
        if (o & 4 && (c = n.stateNode, c != null)) {
          var d = n.memoizedProps, m = l !== null ? l.memoizedProps : d, E = n.type, T = n.updateQueue;
          if (n.updateQueue = null, T !== null) try {
            E === "input" && d.type === "radio" && d.name != null && Bn(c, d), Kn(E, m);
            var A = Kn(E, d);
            for (m = 0; m < T.length; m += 2) {
              var G = T[m], K = T[m + 1];
              G === "style" ? nn(c, K) : G === "dangerouslySetInnerHTML" ? ci(c, K) : G === "children" ? ne(c, K) : Ge(c, G, K, A);
            }
            switch (E) {
              case "input":
                Yr(c, d);
                break;
              case "textarea":
                Ya(c, d);
                break;
              case "select":
                var W = c._wrapperState.wasMultiple;
                c._wrapperState.wasMultiple = !!d.multiple;
                var pe = d.value;
                pe != null ? Rn(c, !!d.multiple, pe, !1) : W !== !!d.multiple && (d.defaultValue != null ? Rn(
                  c,
                  !!d.multiple,
                  d.defaultValue,
                  !0
                ) : Rn(c, !!d.multiple, d.multiple ? [] : "", !1));
            }
            c[is] = d;
          } catch (be) {
            pn(n, n.return, be);
          }
        }
        break;
      case 6:
        if (ai(r, n), ea(n), o & 4) {
          if (n.stateNode === null) throw Error(k(162));
          c = n.stateNode, d = n.memoizedProps;
          try {
            c.nodeValue = d;
          } catch (be) {
            pn(n, n.return, be);
          }
        }
        break;
      case 3:
        if (ai(r, n), ea(n), o & 4 && l !== null && l.memoizedState.isDehydrated) try {
          Ja(r.containerInfo);
        } catch (be) {
          pn(n, n.return, be);
        }
        break;
      case 4:
        ai(r, n), ea(n);
        break;
      case 13:
        ai(r, n), ea(n), c = n.child, c.flags & 8192 && (d = c.memoizedState !== null, c.stateNode.isHidden = d, !d || c.alternate !== null && c.alternate.memoizedState !== null || (Vd = rt())), o & 4 && Zv(n);
        break;
      case 22:
        if (G = l !== null && l.memoizedState !== null, n.mode & 1 ? (Tr = (A = Tr) || G, ai(r, n), Tr = A) : ai(r, n), ea(n), o & 8192) {
          if (A = n.memoizedState !== null, (n.stateNode.isHidden = A) && !G && n.mode & 1) for (me = n, G = n.child; G !== null; ) {
            for (K = me = G; me !== null; ) {
              switch (W = me, pe = W.child, W.tag) {
                case 0:
                case 11:
                case 14:
                case 15:
                  Ds(4, W, W.return);
                  break;
                case 1:
                  So(W, W.return);
                  var Ee = W.stateNode;
                  if (typeof Ee.componentWillUnmount == "function") {
                    o = W, l = W.return;
                    try {
                      r = o, Ee.props = r.memoizedProps, Ee.state = r.memoizedState, Ee.componentWillUnmount();
                    } catch (be) {
                      pn(o, l, be);
                    }
                  }
                  break;
                case 5:
                  So(W, W.return);
                  break;
                case 22:
                  if (W.memoizedState !== null) {
                    Ls(K);
                    continue;
                  }
              }
              pe !== null ? (pe.return = W, me = pe) : Ls(K);
            }
            G = G.sibling;
          }
          e: for (G = null, K = n; ; ) {
            if (K.tag === 5) {
              if (G === null) {
                G = K;
                try {
                  c = K.stateNode, A ? (d = c.style, typeof d.setProperty == "function" ? d.setProperty("display", "none", "important") : d.display = "none") : (E = K.stateNode, T = K.memoizedProps.style, m = T != null && T.hasOwnProperty("display") ? T.display : null, E.style.display = Pt("display", m));
                } catch (be) {
                  pn(n, n.return, be);
                }
              }
            } else if (K.tag === 6) {
              if (G === null) try {
                K.stateNode.nodeValue = A ? "" : K.memoizedProps;
              } catch (be) {
                pn(n, n.return, be);
              }
            } else if ((K.tag !== 22 && K.tag !== 23 || K.memoizedState === null || K === n) && K.child !== null) {
              K.child.return = K, K = K.child;
              continue;
            }
            if (K === n) break e;
            for (; K.sibling === null; ) {
              if (K.return === null || K.return === n) break e;
              G === K && (G = null), K = K.return;
            }
            G === K && (G = null), K.sibling.return = K.return, K = K.sibling;
          }
        }
        break;
      case 19:
        ai(r, n), ea(n), o & 4 && Zv(n);
        break;
      case 21:
        break;
      default:
        ai(
          r,
          n
        ), ea(n);
    }
  }
  function ea(n) {
    var r = n.flags;
    if (r & 2) {
      try {
        e: {
          for (var l = n.return; l !== null; ) {
            if (Ns(l)) {
              var o = l;
              break e;
            }
            l = l.return;
          }
          throw Error(k(160));
        }
        switch (o.tag) {
          case 5:
            var c = o.stateNode;
            o.flags & 32 && (ne(c, ""), o.flags &= -33);
            var d = Xi(n);
            ki(n, d, c);
            break;
          case 3:
          case 4:
            var m = o.stateNode.containerInfo, E = Xi(n);
            _i(n, E, m);
            break;
          default:
            throw Error(k(161));
        }
      } catch (T) {
        pn(n, n.return, T);
      }
      n.flags &= -3;
    }
    r & 4096 && (n.flags &= -4097);
  }
  function fy(n, r, l) {
    me = n, Hd(n);
  }
  function Hd(n, r, l) {
    for (var o = (n.mode & 1) !== 0; me !== null; ) {
      var c = me, d = c.child;
      if (c.tag === 22 && o) {
        var m = c.memoizedState !== null || ks;
        if (!m) {
          var E = c.alternate, T = E !== null && E.memoizedState !== null || Tr;
          E = ks;
          var A = Tr;
          if (ks = m, (Tr = T) && !A) for (me = c; me !== null; ) m = me, T = m.child, m.tag === 22 && m.memoizedState !== null ? Pd(c) : T !== null ? (T.return = m, me = T) : Pd(c);
          for (; d !== null; ) me = d, Hd(d), d = d.sibling;
          me = c, ks = E, Tr = A;
        }
        eh(n);
      } else c.subtreeFlags & 8772 && d !== null ? (d.return = c, me = d) : eh(n);
    }
  }
  function eh(n) {
    for (; me !== null; ) {
      var r = me;
      if (r.flags & 8772) {
        var l = r.alternate;
        try {
          if (r.flags & 8772) switch (r.tag) {
            case 0:
            case 11:
            case 15:
              Tr || Os(5, r);
              break;
            case 1:
              var o = r.stateNode;
              if (r.flags & 4 && !Tr) if (l === null) o.componentDidMount();
              else {
                var c = r.elementType === r.type ? l.memoizedProps : ri(r.type, l.memoizedProps);
                o.componentDidUpdate(c, l.memoizedState, o.__reactInternalSnapshotBeforeUpdate);
              }
              var d = r.updateQueue;
              d !== null && wd(r, d, o);
              break;
            case 3:
              var m = r.updateQueue;
              if (m !== null) {
                if (l = null, r.child !== null) switch (r.child.tag) {
                  case 5:
                    l = r.child.stateNode;
                    break;
                  case 1:
                    l = r.child.stateNode;
                }
                wd(r, m, l);
              }
              break;
            case 5:
              var E = r.stateNode;
              if (l === null && r.flags & 4) {
                l = E;
                var T = r.memoizedProps;
                switch (r.type) {
                  case "button":
                  case "input":
                  case "select":
                  case "textarea":
                    T.autoFocus && l.focus();
                    break;
                  case "img":
                    T.src && (l.src = T.src);
                }
              }
              break;
            case 6:
              break;
            case 4:
              break;
            case 12:
              break;
            case 13:
              if (r.memoizedState === null) {
                var A = r.alternate;
                if (A !== null) {
                  var G = A.memoizedState;
                  if (G !== null) {
                    var K = G.dehydrated;
                    K !== null && Ja(K);
                  }
                }
              }
              break;
            case 19:
            case 17:
            case 21:
            case 22:
            case 23:
            case 25:
              break;
            default:
              throw Error(k(163));
          }
          Tr || r.flags & 512 && jd(r);
        } catch (W) {
          pn(r, r.return, W);
        }
      }
      if (r === n) {
        me = null;
        break;
      }
      if (l = r.sibling, l !== null) {
        l.return = r.return, me = l;
        break;
      }
      me = r.return;
    }
  }
  function Ls(n) {
    for (; me !== null; ) {
      var r = me;
      if (r === n) {
        me = null;
        break;
      }
      var l = r.sibling;
      if (l !== null) {
        l.return = r.return, me = l;
        break;
      }
      me = r.return;
    }
  }
  function Pd(n) {
    for (; me !== null; ) {
      var r = me;
      try {
        switch (r.tag) {
          case 0:
          case 11:
          case 15:
            var l = r.return;
            try {
              Os(4, r);
            } catch (T) {
              pn(r, l, T);
            }
            break;
          case 1:
            var o = r.stateNode;
            if (typeof o.componentDidMount == "function") {
              var c = r.return;
              try {
                o.componentDidMount();
              } catch (T) {
                pn(r, c, T);
              }
            }
            var d = r.return;
            try {
              jd(r);
            } catch (T) {
              pn(r, d, T);
            }
            break;
          case 5:
            var m = r.return;
            try {
              jd(r);
            } catch (T) {
              pn(r, m, T);
            }
        }
      } catch (T) {
        pn(r, r.return, T);
      }
      if (r === n) {
        me = null;
        break;
      }
      var E = r.sibling;
      if (E !== null) {
        E.return = r.return, me = E;
        break;
      }
      me = r.return;
    }
  }
  var dy = Math.ceil, zl = ft.ReactCurrentDispatcher, ku = ft.ReactCurrentOwner, or = ft.ReactCurrentBatchConfig, bt = 0, Wn = null, Fn = null, sr = 0, ma = 0, Eo = Da(0), _n = 0, Ms = null, Di = 0, Co = 0, rf = 0, Us = null, ta = null, Vd = 0, Ro = 1 / 0, ya = null, To = !1, Du = null, Al = null, af = !1, Ji = null, zs = 0, jl = 0, wo = null, As = -1, wr = 0;
  function Hn() {
    return bt & 6 ? rt() : As !== -1 ? As : As = rt();
  }
  function Oi(n) {
    return n.mode & 1 ? bt & 2 && sr !== 0 ? sr & -sr : sy.transition !== null ? (wr === 0 && (wr = qu()), wr) : (n = Mt, n !== 0 || (n = window.event, n = n === void 0 ? 16 : no(n.type)), n) : 1;
  }
  function Ur(n, r, l, o) {
    if (50 < jl) throw jl = 0, wo = null, Error(k(185));
    Hi(n, l, o), (!(bt & 2) || n !== Wn) && (n === Wn && (!(bt & 2) && (Co |= l), _n === 4 && ii(n, sr)), na(n, o), l === 1 && bt === 0 && !(r.mode & 1) && (Ro = rt() + 500, vo && Ri()));
  }
  function na(n, r) {
    var l = n.callbackNode;
    ru(n, r);
    var o = Xa(n, n === Wn ? sr : 0);
    if (o === 0) l !== null && ar(l), n.callbackNode = null, n.callbackPriority = 0;
    else if (r = o & -o, n.callbackPriority !== r) {
      if (l != null && ar(l), r === 1) n.tag === 0 ? xl(Bd.bind(null, n)) : wc(Bd.bind(null, n)), so(function() {
        !(bt & 6) && Ri();
      }), l = null;
      else {
        switch (Xu(o)) {
          case 1:
            l = qa;
            break;
          case 4:
            l = tu;
            break;
          case 16:
            l = nu;
            break;
          case 536870912:
            l = Qu;
            break;
          default:
            l = nu;
        }
        l = ch(l, lf.bind(null, n));
      }
      n.callbackPriority = r, n.callbackNode = l;
    }
  }
  function lf(n, r) {
    if (As = -1, wr = 0, bt & 6) throw Error(k(327));
    var l = n.callbackNode;
    if (bo() && n.callbackNode !== l) return null;
    var o = Xa(n, n === Wn ? sr : 0);
    if (o === 0) return null;
    if (o & 30 || o & n.expiredLanes || r) r = uf(n, o);
    else {
      r = o;
      var c = bt;
      bt |= 2;
      var d = nh();
      (Wn !== n || sr !== r) && (ya = null, Ro = rt() + 500, Zi(n, r));
      do
        try {
          rh();
          break;
        } catch (E) {
          th(n, E);
        }
      while (!0);
      gd(), zl.current = d, bt = c, Fn !== null ? r = 0 : (Wn = null, sr = 0, r = _n);
    }
    if (r !== 0) {
      if (r === 2 && (c = yl(n), c !== 0 && (o = c, r = js(n, c))), r === 1) throw l = Ms, Zi(n, 0), ii(n, o), na(n, rt()), l;
      if (r === 6) ii(n, o);
      else {
        if (c = n.current.alternate, !(o & 30) && !py(c) && (r = uf(n, o), r === 2 && (d = yl(n), d !== 0 && (o = d, r = js(n, d))), r === 1)) throw l = Ms, Zi(n, 0), ii(n, o), na(n, rt()), l;
        switch (n.finishedWork = c, n.finishedLanes = o, r) {
          case 0:
          case 1:
            throw Error(k(345));
          case 2:
            Lu(n, ta, ya);
            break;
          case 3:
            if (ii(n, o), (o & 130023424) === o && (r = Vd + 500 - rt(), 10 < r)) {
              if (Xa(n, 0) !== 0) break;
              if (c = n.suspendedLanes, (c & o) !== o) {
                Hn(), n.pingedLanes |= n.suspendedLanes & c;
                break;
              }
              n.timeoutHandle = Cc(Lu.bind(null, n, ta, ya), r);
              break;
            }
            Lu(n, ta, ya);
            break;
          case 4:
            if (ii(n, o), (o & 4194240) === o) break;
            for (r = n.eventTimes, c = -1; 0 < o; ) {
              var m = 31 - kr(o);
              d = 1 << m, m = r[m], m > c && (c = m), o &= ~d;
            }
            if (o = c, o = rt() - o, o = (120 > o ? 120 : 480 > o ? 480 : 1080 > o ? 1080 : 1920 > o ? 1920 : 3e3 > o ? 3e3 : 4320 > o ? 4320 : 1960 * dy(o / 1960)) - o, 10 < o) {
              n.timeoutHandle = Cc(Lu.bind(null, n, ta, ya), o);
              break;
            }
            Lu(n, ta, ya);
            break;
          case 5:
            Lu(n, ta, ya);
            break;
          default:
            throw Error(k(329));
        }
      }
    }
    return na(n, rt()), n.callbackNode === l ? lf.bind(null, n) : null;
  }
  function js(n, r) {
    var l = Us;
    return n.current.memoizedState.isDehydrated && (Zi(n, r).flags |= 256), n = uf(n, r), n !== 2 && (r = ta, ta = l, r !== null && Ou(r)), n;
  }
  function Ou(n) {
    ta === null ? ta = n : ta.push.apply(ta, n);
  }
  function py(n) {
    for (var r = n; ; ) {
      if (r.flags & 16384) {
        var l = r.updateQueue;
        if (l !== null && (l = l.stores, l !== null)) for (var o = 0; o < l.length; o++) {
          var c = l[o], d = c.getSnapshot;
          c = c.value;
          try {
            if (!ei(d(), c)) return !1;
          } catch {
            return !1;
          }
        }
      }
      if (l = r.child, r.subtreeFlags & 16384 && l !== null) l.return = r, r = l;
      else {
        if (r === n) break;
        for (; r.sibling === null; ) {
          if (r.return === null || r.return === n) return !0;
          r = r.return;
        }
        r.sibling.return = r.return, r = r.sibling;
      }
    }
    return !0;
  }
  function ii(n, r) {
    for (r &= ~rf, r &= ~Co, n.suspendedLanes |= r, n.pingedLanes &= ~r, n = n.expirationTimes; 0 < r; ) {
      var l = 31 - kr(r), o = 1 << l;
      n[l] = -1, r &= ~o;
    }
  }
  function Bd(n) {
    if (bt & 6) throw Error(k(327));
    bo();
    var r = Xa(n, 0);
    if (!(r & 1)) return na(n, rt()), null;
    var l = uf(n, r);
    if (n.tag !== 0 && l === 2) {
      var o = yl(n);
      o !== 0 && (r = o, l = js(n, o));
    }
    if (l === 1) throw l = Ms, Zi(n, 0), ii(n, r), na(n, rt()), l;
    if (l === 6) throw Error(k(345));
    return n.finishedWork = n.current.alternate, n.finishedLanes = r, Lu(n, ta, ya), na(n, rt()), null;
  }
  function Id(n, r) {
    var l = bt;
    bt |= 1;
    try {
      return n(r);
    } finally {
      bt = l, bt === 0 && (Ro = rt() + 500, vo && Ri());
    }
  }
  function Nu(n) {
    Ji !== null && Ji.tag === 0 && !(bt & 6) && bo();
    var r = bt;
    bt |= 1;
    var l = or.transition, o = Mt;
    try {
      if (or.transition = null, Mt = 1, n) return n();
    } finally {
      Mt = o, or.transition = l, bt = r, !(bt & 6) && Ri();
    }
  }
  function Yd() {
    ma = Eo.current, un(Eo);
  }
  function Zi(n, r) {
    n.finishedWork = null, n.finishedLanes = 0;
    var l = n.timeoutHandle;
    if (l !== -1 && (n.timeoutHandle = -1, pd(l)), Fn !== null) for (l = Fn.return; l !== null; ) {
      var o = l;
      switch (xc(o), o.tag) {
        case 1:
          o = o.type.childContextTypes, o != null && po();
          break;
        case 3:
          Su(), un($n), un(En), Ue();
          break;
        case 5:
          Oc(o);
          break;
        case 4:
          Su();
          break;
        case 13:
          un(gn);
          break;
        case 19:
          un(gn);
          break;
        case 10:
          Sd(o.type._context);
          break;
        case 22:
        case 23:
          Yd();
      }
      l = l.return;
    }
    if (Wn = n, Fn = n = Fl(n.current, null), sr = ma = r, _n = 0, Ms = null, rf = Co = Di = 0, ta = Us = null, yu !== null) {
      for (r = 0; r < yu.length; r++) if (l = yu[r], o = l.interleaved, o !== null) {
        l.interleaved = null;
        var c = o.next, d = l.pending;
        if (d !== null) {
          var m = d.next;
          d.next = c, o.next = m;
        }
        l.pending = o;
      }
      yu = null;
    }
    return n;
  }
  function th(n, r) {
    do {
      var l = Fn;
      try {
        if (gd(), ht.current = bu, Lc) {
          for (var o = zt.memoizedState; o !== null; ) {
            var c = o.queue;
            c !== null && (c.pending = null), o = o.next;
          }
          Lc = !1;
        }
        if (Xt = 0, Jn = zn = zt = null, vs = !1, Eu = 0, ku.current = null, l === null || l.return === null) {
          _n = 1, Ms = r, Fn = null;
          break;
        }
        e: {
          var d = n, m = l.return, E = l, T = r;
          if (r = sr, E.flags |= 32768, T !== null && typeof T == "object" && typeof T.then == "function") {
            var A = T, G = E, K = G.tag;
            if (!(G.mode & 1) && (K === 0 || K === 11 || K === 15)) {
              var W = G.alternate;
              W ? (G.updateQueue = W.updateQueue, G.memoizedState = W.memoizedState, G.lanes = W.lanes) : (G.updateQueue = null, G.memoizedState = null);
            }
            var pe = Bv(m);
            if (pe !== null) {
              pe.flags &= -257, Ul(pe, m, E, d, r), pe.mode & 1 && Ld(d, A, r), r = pe, T = A;
              var Ee = r.updateQueue;
              if (Ee === null) {
                var be = /* @__PURE__ */ new Set();
                be.add(T), r.updateQueue = be;
              } else Ee.add(T);
              break e;
            } else {
              if (!(r & 1)) {
                Ld(d, A, r), $d();
                break e;
              }
              T = Error(k(426));
            }
          } else if (dn && E.mode & 1) {
            var kn = Bv(m);
            if (kn !== null) {
              !(kn.flags & 65536) && (kn.flags |= 256), Ul(kn, m, E, d, r), Gi(xu(T, E));
              break e;
            }
          }
          d = T = xu(T, E), _n !== 4 && (_n = 2), Us === null ? Us = [d] : Us.push(d), d = m;
          do {
            switch (d.tag) {
              case 3:
                d.flags |= 65536, r &= -r, d.lanes |= r;
                var O = Vv(d, T, r);
                Av(d, O);
                break e;
              case 1:
                E = T;
                var b = d.type, M = d.stateNode;
                if (!(d.flags & 128) && (typeof b.getDerivedStateFromError == "function" || M !== null && typeof M.componentDidCatch == "function" && (Al === null || !Al.has(M)))) {
                  d.flags |= 65536, r &= -r, d.lanes |= r;
                  var q = Nd(d, E, r);
                  Av(d, q);
                  break e;
                }
            }
            d = d.return;
          } while (d !== null);
        }
        ih(l);
      } catch (Ce) {
        r = Ce, Fn === l && l !== null && (Fn = l = l.return);
        continue;
      }
      break;
    } while (!0);
  }
  function nh() {
    var n = zl.current;
    return zl.current = bu, n === null ? bu : n;
  }
  function $d() {
    (_n === 0 || _n === 3 || _n === 2) && (_n = 4), Wn === null || !(Di & 268435455) && !(Co & 268435455) || ii(Wn, sr);
  }
  function uf(n, r) {
    var l = bt;
    bt |= 2;
    var o = nh();
    (Wn !== n || sr !== r) && (ya = null, Zi(n, r));
    do
      try {
        vy();
        break;
      } catch (c) {
        th(n, c);
      }
    while (!0);
    if (gd(), bt = l, zl.current = o, Fn !== null) throw Error(k(261));
    return Wn = null, sr = 0, _n;
  }
  function vy() {
    for (; Fn !== null; ) ah(Fn);
  }
  function rh() {
    for (; Fn !== null && !Wa(); ) ah(Fn);
  }
  function ah(n) {
    var r = sh(n.alternate, n, ma);
    n.memoizedProps = n.pendingProps, r === null ? ih(n) : Fn = r, ku.current = null;
  }
  function ih(n) {
    var r = n;
    do {
      var l = r.alternate;
      if (n = r.return, r.flags & 32768) {
        if (l = ef(l, r), l !== null) {
          l.flags &= 32767, Fn = l;
          return;
        }
        if (n !== null) n.flags |= 32768, n.subtreeFlags = 0, n.deletions = null;
        else {
          _n = 6, Fn = null;
          return;
        }
      } else if (l = qv(l, r, ma), l !== null) {
        Fn = l;
        return;
      }
      if (r = r.sibling, r !== null) {
        Fn = r;
        return;
      }
      Fn = r = n;
    } while (r !== null);
    _n === 0 && (_n = 5);
  }
  function Lu(n, r, l) {
    var o = Mt, c = or.transition;
    try {
      or.transition = null, Mt = 1, hy(n, r, l, o);
    } finally {
      or.transition = c, Mt = o;
    }
    return null;
  }
  function hy(n, r, l, o) {
    do
      bo();
    while (Ji !== null);
    if (bt & 6) throw Error(k(327));
    l = n.finishedWork;
    var c = n.finishedLanes;
    if (l === null) return null;
    if (n.finishedWork = null, n.finishedLanes = 0, l === n.current) throw Error(k(177));
    n.callbackNode = null, n.callbackPriority = 0;
    var d = l.lanes | l.childLanes;
    if (Qf(n, d), n === Wn && (Fn = Wn = null, sr = 0), !(l.subtreeFlags & 2064) && !(l.flags & 2064) || af || (af = !0, ch(nu, function() {
      return bo(), null;
    })), d = (l.flags & 15990) !== 0, l.subtreeFlags & 15990 || d) {
      d = or.transition, or.transition = null;
      var m = Mt;
      Mt = 1;
      var E = bt;
      bt |= 4, ku.current = null, Xv(n, l), Fd(l, n), io(du), xa = !!as, du = as = null, n.current = l, fy(l), Ga(), bt = E, Mt = m, or.transition = d;
    } else n.current = l;
    if (af && (af = !1, Ji = n, zs = c), d = n.pendingLanes, d === 0 && (Al = null), Yo(l.stateNode), na(n, rt()), r !== null) for (o = n.onRecoverableError, l = 0; l < r.length; l++) c = r[l], o(c.value, { componentStack: c.stack, digest: c.digest });
    if (To) throw To = !1, n = Du, Du = null, n;
    return zs & 1 && n.tag !== 0 && bo(), d = n.pendingLanes, d & 1 ? n === wo ? jl++ : (jl = 0, wo = n) : jl = 0, Ri(), null;
  }
  function bo() {
    if (Ji !== null) {
      var n = Xu(zs), r = or.transition, l = Mt;
      try {
        if (or.transition = null, Mt = 16 > n ? 16 : n, Ji === null) var o = !1;
        else {
          if (n = Ji, Ji = null, zs = 0, bt & 6) throw Error(k(331));
          var c = bt;
          for (bt |= 4, me = n.current; me !== null; ) {
            var d = me, m = d.child;
            if (me.flags & 16) {
              var E = d.deletions;
              if (E !== null) {
                for (var T = 0; T < E.length; T++) {
                  var A = E[T];
                  for (me = A; me !== null; ) {
                    var G = me;
                    switch (G.tag) {
                      case 0:
                      case 11:
                      case 15:
                        Ds(8, G, d);
                    }
                    var K = G.child;
                    if (K !== null) K.return = G, me = K;
                    else for (; me !== null; ) {
                      G = me;
                      var W = G.sibling, pe = G.return;
                      if (nf(G), G === A) {
                        me = null;
                        break;
                      }
                      if (W !== null) {
                        W.return = pe, me = W;
                        break;
                      }
                      me = pe;
                    }
                  }
                }
                var Ee = d.alternate;
                if (Ee !== null) {
                  var be = Ee.child;
                  if (be !== null) {
                    Ee.child = null;
                    do {
                      var kn = be.sibling;
                      be.sibling = null, be = kn;
                    } while (be !== null);
                  }
                }
                me = d;
              }
            }
            if (d.subtreeFlags & 2064 && m !== null) m.return = d, me = m;
            else e: for (; me !== null; ) {
              if (d = me, d.flags & 2048) switch (d.tag) {
                case 0:
                case 11:
                case 15:
                  Ds(9, d, d.return);
              }
              var O = d.sibling;
              if (O !== null) {
                O.return = d.return, me = O;
                break e;
              }
              me = d.return;
            }
          }
          var b = n.current;
          for (me = b; me !== null; ) {
            m = me;
            var M = m.child;
            if (m.subtreeFlags & 2064 && M !== null) M.return = m, me = M;
            else e: for (m = b; me !== null; ) {
              if (E = me, E.flags & 2048) try {
                switch (E.tag) {
                  case 0:
                  case 11:
                  case 15:
                    Os(9, E);
                }
              } catch (Ce) {
                pn(E, E.return, Ce);
              }
              if (E === m) {
                me = null;
                break e;
              }
              var q = E.sibling;
              if (q !== null) {
                q.return = E.return, me = q;
                break e;
              }
              me = E.return;
            }
          }
          if (bt = c, Ri(), $r && typeof $r.onPostCommitFiberRoot == "function") try {
            $r.onPostCommitFiberRoot(hl, n);
          } catch {
          }
          o = !0;
        }
        return o;
      } finally {
        Mt = l, or.transition = r;
      }
    }
    return !1;
  }
  function lh(n, r, l) {
    r = xu(l, r), r = Vv(n, r, 1), n = Nl(n, r, 1), r = Hn(), n !== null && (Hi(n, 1, r), na(n, r));
  }
  function pn(n, r, l) {
    if (n.tag === 3) lh(n, n, l);
    else for (; r !== null; ) {
      if (r.tag === 3) {
        lh(r, n, l);
        break;
      } else if (r.tag === 1) {
        var o = r.stateNode;
        if (typeof r.type.getDerivedStateFromError == "function" || typeof o.componentDidCatch == "function" && (Al === null || !Al.has(o))) {
          n = xu(l, n), n = Nd(r, n, 1), r = Nl(r, n, 1), n = Hn(), r !== null && (Hi(r, 1, n), na(r, n));
          break;
        }
      }
      r = r.return;
    }
  }
  function my(n, r, l) {
    var o = n.pingCache;
    o !== null && o.delete(r), r = Hn(), n.pingedLanes |= n.suspendedLanes & l, Wn === n && (sr & l) === l && (_n === 4 || _n === 3 && (sr & 130023424) === sr && 500 > rt() - Vd ? Zi(n, 0) : rf |= l), na(n, r);
  }
  function uh(n, r) {
    r === 0 && (n.mode & 1 ? (r = fa, fa <<= 1, !(fa & 130023424) && (fa = 4194304)) : r = 1);
    var l = Hn();
    n = va(n, r), n !== null && (Hi(n, r, l), na(n, l));
  }
  function yy(n) {
    var r = n.memoizedState, l = 0;
    r !== null && (l = r.retryLane), uh(n, l);
  }
  function oh(n, r) {
    var l = 0;
    switch (n.tag) {
      case 13:
        var o = n.stateNode, c = n.memoizedState;
        c !== null && (l = c.retryLane);
        break;
      case 19:
        o = n.stateNode;
        break;
      default:
        throw Error(k(314));
    }
    o !== null && o.delete(r), uh(n, l);
  }
  var sh;
  sh = function(n, r, l) {
    if (n !== null) if (n.memoizedProps !== r.pendingProps || $n.current) An = !0;
    else {
      if (!(n.lanes & l) && !(r.flags & 128)) return An = !1, xs(n, r, l);
      An = !!(n.flags & 131072);
    }
    else An = !1, dn && r.flags & 1048576 && Lv(r, Wi, r.index);
    switch (r.lanes = 0, r.tag) {
      case 2:
        var o = r.type;
        Ma(n, r), n = r.pendingProps;
        var c = Gr(r, En.current);
        yn(r, l), c = Ll(null, r, o, n, c, l);
        var d = ni();
        return r.flags |= 1, typeof c == "object" && c !== null && typeof c.render == "function" && c.$$typeof === void 0 ? (r.tag = 1, r.memoizedState = null, r.updateQueue = null, Mn(o) ? (d = !0, Xn(r)) : d = !1, r.memoizedState = c.state !== null && c.state !== void 0 ? c.state : null, Td(r), c.updater = qc, r.stateNode = c, c._reactInternals = r, Cs(r, o, n, l), r = ws(null, r, o, !0, d, l)) : (r.tag = 0, dn && d && bc(r), ur(null, r, c, l), r = r.child), r;
      case 16:
        o = r.elementType;
        e: {
          switch (Ma(n, r), n = r.pendingProps, c = o._init, o = c(o._payload), r.type = o, c = r.tag = Sy(o), n = ri(o, n), c) {
            case 0:
              r = Iv(null, r, o, n, l);
              break e;
            case 1:
              r = Yv(null, r, o, n, l);
              break e;
            case 11:
              r = Zr(null, r, o, n, l);
              break e;
            case 14:
              r = _u(null, r, o, ri(o.type, n), l);
              break e;
          }
          throw Error(k(
            306,
            o,
            ""
          ));
        }
        return r;
      case 0:
        return o = r.type, c = r.pendingProps, c = r.elementType === o ? c : ri(o, c), Iv(n, r, o, c, l);
      case 1:
        return o = r.type, c = r.pendingProps, c = r.elementType === o ? c : ri(o, c), Yv(n, r, o, c, l);
      case 3:
        e: {
          if (go(r), n === null) throw Error(k(387));
          o = r.pendingProps, d = r.memoizedState, c = d.element, zv(n, r), ss(r, o, null, l);
          var m = r.memoizedState;
          if (o = m.element, d.isDehydrated) if (d = { element: o, isDehydrated: !1, cache: m.cache, pendingSuspenseBoundaries: m.pendingSuspenseBoundaries, transitions: m.transitions }, r.updateQueue.baseState = d, r.memoizedState = d, r.flags & 256) {
            c = xu(Error(k(423)), r), r = $v(n, r, o, l, c);
            break e;
          } else if (o !== c) {
            c = xu(Error(k(424)), r), r = $v(n, r, o, l, c);
            break e;
          } else for (Kr = Si(r.stateNode.containerInfo.firstChild), qr = r, dn = !0, Na = null, l = oe(r, null, o, l), r.child = l; l; ) l.flags = l.flags & -3 | 4096, l = l.sibling;
          else {
            if (Ol(), o === c) {
              r = Ua(n, r, l);
              break e;
            }
            ur(n, r, o, l);
          }
          r = r.child;
        }
        return r;
      case 5:
        return jv(r), n === null && md(r), o = r.type, c = r.pendingProps, d = n !== null ? n.memoizedProps : null, m = c.children, Ec(o, c) ? m = null : d !== null && Ec(o, d) && (r.flags |= 32), Md(n, r), ur(n, r, m, l), r.child;
      case 6:
        return n === null && md(r), null;
      case 13:
        return Zc(n, r, l);
      case 4:
        return bd(r, r.stateNode.containerInfo), o = r.pendingProps, n === null ? r.child = wn(r, null, o, l) : ur(n, r, o, l), r.child;
      case 11:
        return o = r.type, c = r.pendingProps, c = r.elementType === o ? c : ri(o, c), Zr(n, r, o, c, l);
      case 7:
        return ur(n, r, r.pendingProps, l), r.child;
      case 8:
        return ur(n, r, r.pendingProps.children, l), r.child;
      case 12:
        return ur(n, r, r.pendingProps.children, l), r.child;
      case 10:
        e: {
          if (o = r.type._context, c = r.pendingProps, d = r.memoizedProps, m = c.value, Oe(pa, o._currentValue), o._currentValue = m, d !== null) if (ei(d.value, m)) {
            if (d.children === c.children && !$n.current) {
              r = Ua(n, r, l);
              break e;
            }
          } else for (d = r.child, d !== null && (d.return = r); d !== null; ) {
            var E = d.dependencies;
            if (E !== null) {
              m = d.child;
              for (var T = E.firstContext; T !== null; ) {
                if (T.context === o) {
                  if (d.tag === 1) {
                    T = qi(-1, l & -l), T.tag = 2;
                    var A = d.updateQueue;
                    if (A !== null) {
                      A = A.shared;
                      var G = A.pending;
                      G === null ? T.next = T : (T.next = G.next, G.next = T), A.pending = T;
                    }
                  }
                  d.lanes |= l, T = d.alternate, T !== null && (T.lanes |= l), Ed(
                    d.return,
                    l,
                    r
                  ), E.lanes |= l;
                  break;
                }
                T = T.next;
              }
            } else if (d.tag === 10) m = d.type === r.type ? null : d.child;
            else if (d.tag === 18) {
              if (m = d.return, m === null) throw Error(k(341));
              m.lanes |= l, E = m.alternate, E !== null && (E.lanes |= l), Ed(m, l, r), m = d.sibling;
            } else m = d.child;
            if (m !== null) m.return = d;
            else for (m = d; m !== null; ) {
              if (m === r) {
                m = null;
                break;
              }
              if (d = m.sibling, d !== null) {
                d.return = m.return, m = d;
                break;
              }
              m = m.return;
            }
            d = m;
          }
          ur(n, r, c.children, l), r = r.child;
        }
        return r;
      case 9:
        return c = r.type, o = r.pendingProps.children, yn(r, l), c = La(c), o = o(c), r.flags |= 1, ur(n, r, o, l), r.child;
      case 14:
        return o = r.type, c = ri(o, r.pendingProps), c = ri(o.type, c), _u(n, r, o, c, l);
      case 15:
        return at(n, r, r.type, r.pendingProps, l);
      case 17:
        return o = r.type, c = r.pendingProps, c = r.elementType === o ? c : ri(o, c), Ma(n, r), r.tag = 1, Mn(o) ? (n = !0, Xn(r)) : n = !1, yn(r, l), Kc(r, o, c), Cs(r, o, c, l), ws(null, r, o, !0, n, l);
      case 19:
        return xi(n, r, l);
      case 22:
        return Ts(n, r, l);
    }
    throw Error(k(156, r.tag));
  };
  function ch(n, r) {
    return sn(n, r);
  }
  function gy(n, r, l, o) {
    this.tag = n, this.key = l, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = r, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = o, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
  }
  function Aa(n, r, l, o) {
    return new gy(n, r, l, o);
  }
  function Qd(n) {
    return n = n.prototype, !(!n || !n.isReactComponent);
  }
  function Sy(n) {
    if (typeof n == "function") return Qd(n) ? 1 : 0;
    if (n != null) {
      if (n = n.$$typeof, n === yt) return 11;
      if (n === Tt) return 14;
    }
    return 2;
  }
  function Fl(n, r) {
    var l = n.alternate;
    return l === null ? (l = Aa(n.tag, r, n.key, n.mode), l.elementType = n.elementType, l.type = n.type, l.stateNode = n.stateNode, l.alternate = n, n.alternate = l) : (l.pendingProps = r, l.type = n.type, l.flags = 0, l.subtreeFlags = 0, l.deletions = null), l.flags = n.flags & 14680064, l.childLanes = n.childLanes, l.lanes = n.lanes, l.child = n.child, l.memoizedProps = n.memoizedProps, l.memoizedState = n.memoizedState, l.updateQueue = n.updateQueue, r = n.dependencies, l.dependencies = r === null ? null : { lanes: r.lanes, firstContext: r.firstContext }, l.sibling = n.sibling, l.index = n.index, l.ref = n.ref, l;
  }
  function Fs(n, r, l, o, c, d) {
    var m = 2;
    if (o = n, typeof n == "function") Qd(n) && (m = 1);
    else if (typeof n == "string") m = 5;
    else e: switch (n) {
      case He:
        return el(l.children, c, d, r);
      case en:
        m = 8, c |= 8;
        break;
      case Ht:
        return n = Aa(12, l, r, c | 2), n.elementType = Ht, n.lanes = d, n;
      case Le:
        return n = Aa(13, l, r, c), n.elementType = Le, n.lanes = d, n;
      case Et:
        return n = Aa(19, l, r, c), n.elementType = Et, n.lanes = d, n;
      case Se:
        return Hl(l, c, d, r);
      default:
        if (typeof n == "object" && n !== null) switch (n.$$typeof) {
          case $t:
            m = 10;
            break e;
          case Lt:
            m = 9;
            break e;
          case yt:
            m = 11;
            break e;
          case Tt:
            m = 14;
            break e;
          case kt:
            m = 16, o = null;
            break e;
        }
        throw Error(k(130, n == null ? n : typeof n, ""));
    }
    return r = Aa(m, l, r, c), r.elementType = n, r.type = o, r.lanes = d, r;
  }
  function el(n, r, l, o) {
    return n = Aa(7, n, o, r), n.lanes = l, n;
  }
  function Hl(n, r, l, o) {
    return n = Aa(22, n, o, r), n.elementType = Se, n.lanes = l, n.stateNode = { isHidden: !1 }, n;
  }
  function Wd(n, r, l) {
    return n = Aa(6, n, null, r), n.lanes = l, n;
  }
  function of(n, r, l) {
    return r = Aa(4, n.children !== null ? n.children : [], n.key, r), r.lanes = l, r.stateNode = { containerInfo: n.containerInfo, pendingChildren: null, implementation: n.implementation }, r;
  }
  function fh(n, r, l, o, c) {
    this.tag = r, this.containerInfo = n, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = Ku(0), this.expirationTimes = Ku(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Ku(0), this.identifierPrefix = o, this.onRecoverableError = c, this.mutableSourceEagerHydrationData = null;
  }
  function sf(n, r, l, o, c, d, m, E, T) {
    return n = new fh(n, r, l, E, T), r === 1 ? (r = 1, d === !0 && (r |= 8)) : r = 0, d = Aa(3, null, null, r), n.current = d, d.stateNode = n, d.memoizedState = { element: o, isDehydrated: l, cache: null, transitions: null, pendingSuspenseBoundaries: null }, Td(d), n;
  }
  function Ey(n, r, l) {
    var o = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
    return { $$typeof: Ze, key: o == null ? null : "" + o, children: n, containerInfo: r, implementation: l };
  }
  function Gd(n) {
    if (!n) return Cr;
    n = n._reactInternals;
    e: {
      if (nt(n) !== n || n.tag !== 1) throw Error(k(170));
      var r = n;
      do {
        switch (r.tag) {
          case 3:
            r = r.stateNode.context;
            break e;
          case 1:
            if (Mn(r.type)) {
              r = r.stateNode.__reactInternalMemoizedMergedChildContext;
              break e;
            }
        }
        r = r.return;
      } while (r !== null);
      throw Error(k(171));
    }
    if (n.tag === 1) {
      var l = n.type;
      if (Mn(l)) return us(n, l, r);
    }
    return r;
  }
  function dh(n, r, l, o, c, d, m, E, T) {
    return n = sf(l, o, !0, n, c, d, m, E, T), n.context = Gd(null), l = n.current, o = Hn(), c = Oi(l), d = qi(o, c), d.callback = r ?? null, Nl(l, d, c), n.current.lanes = c, Hi(n, c, o), na(n, o), n;
  }
  function cf(n, r, l, o) {
    var c = r.current, d = Hn(), m = Oi(c);
    return l = Gd(l), r.context === null ? r.context = l : r.pendingContext = l, r = qi(d, m), r.payload = { element: n }, o = o === void 0 ? null : o, o !== null && (r.callback = o), n = Nl(c, r, m), n !== null && (Ur(n, c, m, d), Dc(n, c, m)), m;
  }
  function ff(n) {
    if (n = n.current, !n.child) return null;
    switch (n.child.tag) {
      case 5:
        return n.child.stateNode;
      default:
        return n.child.stateNode;
    }
  }
  function qd(n, r) {
    if (n = n.memoizedState, n !== null && n.dehydrated !== null) {
      var l = n.retryLane;
      n.retryLane = l !== 0 && l < r ? l : r;
    }
  }
  function df(n, r) {
    qd(n, r), (n = n.alternate) && qd(n, r);
  }
  function ph() {
    return null;
  }
  var Mu = typeof reportError == "function" ? reportError : function(n) {
    console.error(n);
  };
  function Kd(n) {
    this._internalRoot = n;
  }
  pf.prototype.render = Kd.prototype.render = function(n) {
    var r = this._internalRoot;
    if (r === null) throw Error(k(409));
    cf(n, r, null, null);
  }, pf.prototype.unmount = Kd.prototype.unmount = function() {
    var n = this._internalRoot;
    if (n !== null) {
      this._internalRoot = null;
      var r = n.containerInfo;
      Nu(function() {
        cf(null, n, null, null);
      }), r[$i] = null;
    }
  };
  function pf(n) {
    this._internalRoot = n;
  }
  pf.prototype.unstable_scheduleHydration = function(n) {
    if (n) {
      var r = qe();
      n = { blockedOn: null, target: n, priority: r };
      for (var l = 0; l < Yn.length && r !== 0 && r < Yn[l].priority; l++) ;
      Yn.splice(l, 0, n), l === 0 && Wo(n);
    }
  };
  function Xd(n) {
    return !(!n || n.nodeType !== 1 && n.nodeType !== 9 && n.nodeType !== 11);
  }
  function vf(n) {
    return !(!n || n.nodeType !== 1 && n.nodeType !== 9 && n.nodeType !== 11 && (n.nodeType !== 8 || n.nodeValue !== " react-mount-point-unstable "));
  }
  function vh() {
  }
  function Cy(n, r, l, o, c) {
    if (c) {
      if (typeof o == "function") {
        var d = o;
        o = function() {
          var A = ff(m);
          d.call(A);
        };
      }
      var m = dh(r, o, n, 0, null, !1, !1, "", vh);
      return n._reactRootContainer = m, n[$i] = m.current, uo(n.nodeType === 8 ? n.parentNode : n), Nu(), m;
    }
    for (; c = n.lastChild; ) n.removeChild(c);
    if (typeof o == "function") {
      var E = o;
      o = function() {
        var A = ff(T);
        E.call(A);
      };
    }
    var T = sf(n, 0, !1, null, null, !1, !1, "", vh);
    return n._reactRootContainer = T, n[$i] = T.current, uo(n.nodeType === 8 ? n.parentNode : n), Nu(function() {
      cf(r, T, l, o);
    }), T;
  }
  function Hs(n, r, l, o, c) {
    var d = l._reactRootContainer;
    if (d) {
      var m = d;
      if (typeof c == "function") {
        var E = c;
        c = function() {
          var T = ff(m);
          E.call(T);
        };
      }
      cf(r, m, n, c);
    } else m = Cy(l, r, n, c, o);
    return ff(m);
  }
  Dt = function(n) {
    switch (n.tag) {
      case 3:
        var r = n.stateNode;
        if (r.current.memoizedState.isDehydrated) {
          var l = Ka(r.pendingLanes);
          l !== 0 && (Pi(r, l | 1), na(r, rt()), !(bt & 6) && (Ro = rt() + 500, Ri()));
        }
        break;
      case 13:
        Nu(function() {
          var o = va(n, 1);
          if (o !== null) {
            var c = Hn();
            Ur(o, n, 1, c);
          }
        }), df(n, 1);
    }
  }, $o = function(n) {
    if (n.tag === 13) {
      var r = va(n, 134217728);
      if (r !== null) {
        var l = Hn();
        Ur(r, n, 134217728, l);
      }
      df(n, 134217728);
    }
  }, vi = function(n) {
    if (n.tag === 13) {
      var r = Oi(n), l = va(n, r);
      if (l !== null) {
        var o = Hn();
        Ur(l, n, r, o);
      }
      df(n, r);
    }
  }, qe = function() {
    return Mt;
  }, Ju = function(n, r) {
    var l = Mt;
    try {
      return Mt = n, r();
    } finally {
      Mt = l;
    }
  }, Wt = function(n, r, l) {
    switch (r) {
      case "input":
        if (Yr(n, l), r = l.name, l.type === "radio" && r != null) {
          for (l = n; l.parentNode; ) l = l.parentNode;
          for (l = l.querySelectorAll("input[name=" + JSON.stringify("" + r) + '][type="radio"]'), r = 0; r < l.length; r++) {
            var o = l[r];
            if (o !== n && o.form === n.form) {
              var c = mn(o);
              if (!c) throw Error(k(90));
              br(o), Yr(o, c);
            }
          }
        }
        break;
      case "textarea":
        Ya(n, l);
        break;
      case "select":
        r = l.value, r != null && Rn(n, !!l.multiple, r, !1);
    }
  }, Zl = Id, dl = Nu;
  var Ry = { usingClientEntryPoint: !1, Events: [Me, ti, mn, Fi, Jl, Id] }, Ps = { findFiberByHostInstance: pu, bundleType: 0, version: "18.3.1", rendererPackageName: "react-dom" }, hh = { bundleType: Ps.bundleType, version: Ps.version, rendererPackageName: Ps.rendererPackageName, rendererConfig: Ps.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: ft.ReactCurrentDispatcher, findHostInstanceByFiber: function(n) {
    return n = Tn(n), n === null ? null : n.stateNode;
  }, findFiberByHostInstance: Ps.findFiberByHostInstance || ph, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1-next-f1338f8080-20240426" };
  if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
    var Pl = __REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (!Pl.isDisabled && Pl.supportsFiber) try {
      hl = Pl.inject(hh), $r = Pl;
    } catch {
    }
  }
  return Ba.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Ry, Ba.createPortal = function(n, r) {
    var l = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
    if (!Xd(r)) throw Error(k(200));
    return Ey(n, r, null, l);
  }, Ba.createRoot = function(n, r) {
    if (!Xd(n)) throw Error(k(299));
    var l = !1, o = "", c = Mu;
    return r != null && (r.unstable_strictMode === !0 && (l = !0), r.identifierPrefix !== void 0 && (o = r.identifierPrefix), r.onRecoverableError !== void 0 && (c = r.onRecoverableError)), r = sf(n, 1, !1, null, null, l, !1, o, c), n[$i] = r.current, uo(n.nodeType === 8 ? n.parentNode : n), new Kd(r);
  }, Ba.findDOMNode = function(n) {
    if (n == null) return null;
    if (n.nodeType === 1) return n;
    var r = n._reactInternals;
    if (r === void 0)
      throw typeof n.render == "function" ? Error(k(188)) : (n = Object.keys(n).join(","), Error(k(268, n)));
    return n = Tn(r), n = n === null ? null : n.stateNode, n;
  }, Ba.flushSync = function(n) {
    return Nu(n);
  }, Ba.hydrate = function(n, r, l) {
    if (!vf(r)) throw Error(k(200));
    return Hs(null, n, r, !0, l);
  }, Ba.hydrateRoot = function(n, r, l) {
    if (!Xd(n)) throw Error(k(405));
    var o = l != null && l.hydratedSources || null, c = !1, d = "", m = Mu;
    if (l != null && (l.unstable_strictMode === !0 && (c = !0), l.identifierPrefix !== void 0 && (d = l.identifierPrefix), l.onRecoverableError !== void 0 && (m = l.onRecoverableError)), r = dh(r, null, n, 1, l ?? null, c, !1, d, m), n[$i] = r.current, uo(n), o) for (n = 0; n < o.length; n++) l = o[n], c = l._getVersion, c = c(l._source), r.mutableSourceEagerHydrationData == null ? r.mutableSourceEagerHydrationData = [l, c] : r.mutableSourceEagerHydrationData.push(
      l,
      c
    );
    return new pf(r);
  }, Ba.render = function(n, r, l) {
    if (!vf(r)) throw Error(k(200));
    return Hs(null, n, r, !1, l);
  }, Ba.unmountComponentAtNode = function(n) {
    if (!vf(n)) throw Error(k(40));
    return n._reactRootContainer ? (Nu(function() {
      Hs(null, null, n, !1, function() {
        n._reactRootContainer = null, n[$i] = null;
      });
    }), !0) : !1;
  }, Ba.unstable_batchedUpdates = Id, Ba.unstable_renderSubtreeIntoContainer = function(n, r, l, o) {
    if (!vf(l)) throw Error(k(200));
    if (n == null || n._reactInternals === void 0) throw Error(k(38));
    return Hs(n, r, l, !1, o);
  }, Ba.version = "18.3.1-next-f1338f8080-20240426", Ba;
}
var Ia = {};
/**
 * @license React
 * react-dom.development.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var fT;
function dk() {
  return fT || (fT = 1, process.env.NODE_ENV !== "production" && function() {
    typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(new Error());
    var D = tv(), F = vT(), k = D.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, ce = !1;
    function Te(e) {
      ce = e;
    }
    function ze(e) {
      if (!ce) {
        for (var t = arguments.length, a = new Array(t > 1 ? t - 1 : 0), i = 1; i < t; i++)
          a[i - 1] = arguments[i];
        mt("warn", e, a);
      }
    }
    function S(e) {
      if (!ce) {
        for (var t = arguments.length, a = new Array(t > 1 ? t - 1 : 0), i = 1; i < t; i++)
          a[i - 1] = arguments[i];
        mt("error", e, a);
      }
    }
    function mt(e, t, a) {
      {
        var i = k.ReactDebugCurrentFrame, u = i.getStackAddendum();
        u !== "" && (t += "%s", a = a.concat([u]));
        var s = a.map(function(f) {
          return String(f);
        });
        s.unshift("Warning: " + t), Function.prototype.apply.call(console[e], console, s);
      }
    }
    var Y = 0, te = 1, _e = 2, ee = 3, ge = 4, ae = 5, fe = 6, Ie = 7, Je = 8, It = 9, tt = 10, Ge = 11, ft = 12, Ne = 13, Ze = 14, He = 15, en = 16, Ht = 17, $t = 18, Lt = 19, yt = 21, Le = 22, Et = 23, Tt = 24, kt = 25, Se = !0, Z = !1, xe = !1, ie = !1, _ = !1, B = !0, $e = !0, Be = !0, dt = !0, ut = /* @__PURE__ */ new Set(), it = {}, ot = {};
    function pt(e, t) {
      Yt(e, t), Yt(e + "Capture", t);
    }
    function Yt(e, t) {
      it[e] && S("EventRegistry: More than one plugin attempted to publish the same registration name, `%s`.", e), it[e] = t;
      {
        var a = e.toLowerCase();
        ot[a] = e, e === "onDoubleClick" && (ot.ondblclick = e);
      }
      for (var i = 0; i < t.length; i++)
        ut.add(t[i]);
    }
    var On = typeof window < "u" && typeof window.document < "u" && typeof window.document.createElement < "u", br = Object.prototype.hasOwnProperty;
    function Cn(e) {
      {
        var t = typeof Symbol == "function" && Symbol.toStringTag, a = t && e[Symbol.toStringTag] || e.constructor.name || "Object";
        return a;
      }
    }
    function nr(e) {
      try {
        return Vn(e), !1;
      } catch {
        return !0;
      }
    }
    function Vn(e) {
      return "" + e;
    }
    function Bn(e, t) {
      if (nr(e))
        return S("The provided `%s` attribute is an unsupported type %s. This value must be coerced to a string before before using it here.", t, Cn(e)), Vn(e);
    }
    function Yr(e) {
      if (nr(e))
        return S("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", Cn(e)), Vn(e);
    }
    function si(e, t) {
      if (nr(e))
        return S("The provided `%s` prop is an unsupported type %s. This value must be coerced to a string before before using it here.", t, Cn(e)), Vn(e);
    }
    function oa(e, t) {
      if (nr(e))
        return S("The provided `%s` CSS property is an unsupported type %s. This value must be coerced to a string before before using it here.", t, Cn(e)), Vn(e);
    }
    function qn(e) {
      if (nr(e))
        return S("The provided HTML markup uses a value of unsupported type %s. This value must be coerced to a string before before using it here.", Cn(e)), Vn(e);
    }
    function Rn(e) {
      if (nr(e))
        return S("Form field values (value, checked, defaultValue, or defaultChecked props) must be strings, not %s. This value must be coerced to a string before before using it here.", Cn(e)), Vn(e);
    }
    var In = 0, gr = 1, Ya = 2, Nn = 3, Sr = 4, sa = 5, $a = 6, ci = ":A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD", ne = ci + "\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040", ke = new RegExp("^[" + ci + "][" + ne + "]*$"), st = {}, Pt = {};
    function nn(e) {
      return br.call(Pt, e) ? !0 : br.call(st, e) ? !1 : ke.test(e) ? (Pt[e] = !0, !0) : (st[e] = !0, S("Invalid attribute name: `%s`", e), !1);
    }
    function vn(e, t, a) {
      return t !== null ? t.type === In : a ? !1 : e.length > 2 && (e[0] === "o" || e[0] === "O") && (e[1] === "n" || e[1] === "N");
    }
    function on(e, t, a, i) {
      if (a !== null && a.type === In)
        return !1;
      switch (typeof t) {
        case "function":
        case "symbol":
          return !0;
        case "boolean": {
          if (i)
            return !1;
          if (a !== null)
            return !a.acceptsBooleans;
          var u = e.toLowerCase().slice(0, 5);
          return u !== "data-" && u !== "aria-";
        }
        default:
          return !1;
      }
    }
    function Kn(e, t, a, i) {
      if (t === null || typeof t > "u" || on(e, t, a, i))
        return !0;
      if (i)
        return !1;
      if (a !== null)
        switch (a.type) {
          case Nn:
            return !t;
          case Sr:
            return t === !1;
          case sa:
            return isNaN(t);
          case $a:
            return isNaN(t) || t < 1;
        }
      return !1;
    }
    function rn(e) {
      return Wt.hasOwnProperty(e) ? Wt[e] : null;
    }
    function Qt(e, t, a, i, u, s, f) {
      this.acceptsBooleans = t === Ya || t === Nn || t === Sr, this.attributeName = i, this.attributeNamespace = u, this.mustUseProperty = a, this.propertyName = e, this.type = t, this.sanitizeURL = s, this.removeEmptyString = f;
    }
    var Wt = {}, ca = [
      "children",
      "dangerouslySetInnerHTML",
      // TODO: This prevents the assignment of defaultValue to regular
      // elements (not just inputs). Now that ReactDOMInput assigns to the
      // defaultValue property -- do we need this?
      "defaultValue",
      "defaultChecked",
      "innerHTML",
      "suppressContentEditableWarning",
      "suppressHydrationWarning",
      "style"
    ];
    ca.forEach(function(e) {
      Wt[e] = new Qt(
        e,
        In,
        !1,
        // mustUseProperty
        e,
        // attributeName
        null,
        // attributeNamespace
        !1,
        // sanitizeURL
        !1
      );
    }), [["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(e) {
      var t = e[0], a = e[1];
      Wt[t] = new Qt(
        t,
        gr,
        !1,
        // mustUseProperty
        a,
        // attributeName
        null,
        // attributeNamespace
        !1,
        // sanitizeURL
        !1
      );
    }), ["contentEditable", "draggable", "spellCheck", "value"].forEach(function(e) {
      Wt[e] = new Qt(
        e,
        Ya,
        !1,
        // mustUseProperty
        e.toLowerCase(),
        // attributeName
        null,
        // attributeNamespace
        !1,
        // sanitizeURL
        !1
      );
    }), ["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(e) {
      Wt[e] = new Qt(
        e,
        Ya,
        !1,
        // mustUseProperty
        e,
        // attributeName
        null,
        // attributeNamespace
        !1,
        // sanitizeURL
        !1
      );
    }), [
      "allowFullScreen",
      "async",
      // Note: there is a special case that prevents it from being written to the DOM
      // on the client side because the browsers are inconsistent. Instead we call focus().
      "autoFocus",
      "autoPlay",
      "controls",
      "default",
      "defer",
      "disabled",
      "disablePictureInPicture",
      "disableRemotePlayback",
      "formNoValidate",
      "hidden",
      "loop",
      "noModule",
      "noValidate",
      "open",
      "playsInline",
      "readOnly",
      "required",
      "reversed",
      "scoped",
      "seamless",
      // Microdata
      "itemScope"
    ].forEach(function(e) {
      Wt[e] = new Qt(
        e,
        Nn,
        !1,
        // mustUseProperty
        e.toLowerCase(),
        // attributeName
        null,
        // attributeNamespace
        !1,
        // sanitizeURL
        !1
      );
    }), [
      "checked",
      // Note: `option.selected` is not updated if `select.multiple` is
      // disabled with `removeAttribute`. We have special logic for handling this.
      "multiple",
      "muted",
      "selected"
      // NOTE: if you add a camelCased prop to this list,
      // you'll need to set attributeName to name.toLowerCase()
      // instead in the assignment below.
    ].forEach(function(e) {
      Wt[e] = new Qt(
        e,
        Nn,
        !0,
        // mustUseProperty
        e,
        // attributeName
        null,
        // attributeNamespace
        !1,
        // sanitizeURL
        !1
      );
    }), [
      "capture",
      "download"
      // NOTE: if you add a camelCased prop to this list,
      // you'll need to set attributeName to name.toLowerCase()
      // instead in the assignment below.
    ].forEach(function(e) {
      Wt[e] = new Qt(
        e,
        Sr,
        !1,
        // mustUseProperty
        e,
        // attributeName
        null,
        // attributeNamespace
        !1,
        // sanitizeURL
        !1
      );
    }), [
      "cols",
      "rows",
      "size",
      "span"
      // NOTE: if you add a camelCased prop to this list,
      // you'll need to set attributeName to name.toLowerCase()
      // instead in the assignment below.
    ].forEach(function(e) {
      Wt[e] = new Qt(
        e,
        $a,
        !1,
        // mustUseProperty
        e,
        // attributeName
        null,
        // attributeNamespace
        !1,
        // sanitizeURL
        !1
      );
    }), ["rowSpan", "start"].forEach(function(e) {
      Wt[e] = new Qt(
        e,
        sa,
        !1,
        // mustUseProperty
        e.toLowerCase(),
        // attributeName
        null,
        // attributeNamespace
        !1,
        // sanitizeURL
        !1
      );
    });
    var Er = /[\-\:]([a-z])/g, Ta = function(e) {
      return e[1].toUpperCase();
    };
    [
      "accent-height",
      "alignment-baseline",
      "arabic-form",
      "baseline-shift",
      "cap-height",
      "clip-path",
      "clip-rule",
      "color-interpolation",
      "color-interpolation-filters",
      "color-profile",
      "color-rendering",
      "dominant-baseline",
      "enable-background",
      "fill-opacity",
      "fill-rule",
      "flood-color",
      "flood-opacity",
      "font-family",
      "font-size",
      "font-size-adjust",
      "font-stretch",
      "font-style",
      "font-variant",
      "font-weight",
      "glyph-name",
      "glyph-orientation-horizontal",
      "glyph-orientation-vertical",
      "horiz-adv-x",
      "horiz-origin-x",
      "image-rendering",
      "letter-spacing",
      "lighting-color",
      "marker-end",
      "marker-mid",
      "marker-start",
      "overline-position",
      "overline-thickness",
      "paint-order",
      "panose-1",
      "pointer-events",
      "rendering-intent",
      "shape-rendering",
      "stop-color",
      "stop-opacity",
      "strikethrough-position",
      "strikethrough-thickness",
      "stroke-dasharray",
      "stroke-dashoffset",
      "stroke-linecap",
      "stroke-linejoin",
      "stroke-miterlimit",
      "stroke-opacity",
      "stroke-width",
      "text-anchor",
      "text-decoration",
      "text-rendering",
      "underline-position",
      "underline-thickness",
      "unicode-bidi",
      "unicode-range",
      "units-per-em",
      "v-alphabetic",
      "v-hanging",
      "v-ideographic",
      "v-mathematical",
      "vector-effect",
      "vert-adv-y",
      "vert-origin-x",
      "vert-origin-y",
      "word-spacing",
      "writing-mode",
      "xmlns:xlink",
      "x-height"
      // NOTE: if you add a camelCased prop to this list,
      // you'll need to set attributeName to name.toLowerCase()
      // instead in the assignment below.
    ].forEach(function(e) {
      var t = e.replace(Er, Ta);
      Wt[t] = new Qt(
        t,
        gr,
        !1,
        // mustUseProperty
        e,
        null,
        // attributeNamespace
        !1,
        // sanitizeURL
        !1
      );
    }), [
      "xlink:actuate",
      "xlink:arcrole",
      "xlink:role",
      "xlink:show",
      "xlink:title",
      "xlink:type"
      // NOTE: if you add a camelCased prop to this list,
      // you'll need to set attributeName to name.toLowerCase()
      // instead in the assignment below.
    ].forEach(function(e) {
      var t = e.replace(Er, Ta);
      Wt[t] = new Qt(
        t,
        gr,
        !1,
        // mustUseProperty
        e,
        "http://www.w3.org/1999/xlink",
        !1,
        // sanitizeURL
        !1
      );
    }), [
      "xml:base",
      "xml:lang",
      "xml:space"
      // NOTE: if you add a camelCased prop to this list,
      // you'll need to set attributeName to name.toLowerCase()
      // instead in the assignment below.
    ].forEach(function(e) {
      var t = e.replace(Er, Ta);
      Wt[t] = new Qt(
        t,
        gr,
        !1,
        // mustUseProperty
        e,
        "http://www.w3.org/XML/1998/namespace",
        !1,
        // sanitizeURL
        !1
      );
    }), ["tabIndex", "crossOrigin"].forEach(function(e) {
      Wt[e] = new Qt(
        e,
        gr,
        !1,
        // mustUseProperty
        e.toLowerCase(),
        // attributeName
        null,
        // attributeNamespace
        !1,
        // sanitizeURL
        !1
      );
    });
    var Fi = "xlinkHref";
    Wt[Fi] = new Qt(
      "xlinkHref",
      gr,
      !1,
      // mustUseProperty
      "xlink:href",
      "http://www.w3.org/1999/xlink",
      !0,
      // sanitizeURL
      !1
    ), ["src", "href", "action", "formAction"].forEach(function(e) {
      Wt[e] = new Qt(
        e,
        gr,
        !1,
        // mustUseProperty
        e.toLowerCase(),
        // attributeName
        null,
        // attributeNamespace
        !0,
        // sanitizeURL
        !0
      );
    });
    var Jl = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*\:/i, Zl = !1;
    function dl(e) {
      !Zl && Jl.test(e) && (Zl = !0, S("A future version of React will block javascript: URLs as a security precaution. Use event handlers instead if you can. If you need to generate unsafe HTML try using dangerouslySetInnerHTML instead. React was passed %s.", JSON.stringify(e)));
    }
    function pl(e, t, a, i) {
      if (i.mustUseProperty) {
        var u = i.propertyName;
        return e[u];
      } else {
        Bn(a, t), i.sanitizeURL && dl("" + a);
        var s = i.attributeName, f = null;
        if (i.type === Sr) {
          if (e.hasAttribute(s)) {
            var p = e.getAttribute(s);
            return p === "" ? !0 : Kn(t, a, i, !1) ? p : p === "" + a ? a : p;
          }
        } else if (e.hasAttribute(s)) {
          if (Kn(t, a, i, !1))
            return e.getAttribute(s);
          if (i.type === Nn)
            return a;
          f = e.getAttribute(s);
        }
        return Kn(t, a, i, !1) ? f === null ? a : f : f === "" + a ? a : f;
      }
    }
    function eu(e, t, a, i) {
      {
        if (!nn(t))
          return;
        if (!e.hasAttribute(t))
          return a === void 0 ? void 0 : null;
        var u = e.getAttribute(t);
        return Bn(a, t), u === "" + a ? a : u;
      }
    }
    function xr(e, t, a, i) {
      var u = rn(t);
      if (!vn(t, u, i)) {
        if (Kn(t, a, u, i) && (a = null), i || u === null) {
          if (nn(t)) {
            var s = t;
            a === null ? e.removeAttribute(s) : (Bn(a, t), e.setAttribute(s, "" + a));
          }
          return;
        }
        var f = u.mustUseProperty;
        if (f) {
          var p = u.propertyName;
          if (a === null) {
            var v = u.type;
            e[p] = v === Nn ? !1 : "";
          } else
            e[p] = a;
          return;
        }
        var y = u.attributeName, g = u.attributeNamespace;
        if (a === null)
          e.removeAttribute(y);
        else {
          var x = u.type, w;
          x === Nn || x === Sr && a === !0 ? w = "" : (Bn(a, y), w = "" + a, u.sanitizeURL && dl(w.toString())), g ? e.setAttributeNS(g, y, w) : e.setAttribute(y, w);
        }
      }
    }
    var _r = Symbol.for("react.element"), rr = Symbol.for("react.portal"), fi = Symbol.for("react.fragment"), Qa = Symbol.for("react.strict_mode"), di = Symbol.for("react.profiler"), pi = Symbol.for("react.provider"), R = Symbol.for("react.context"), $ = Symbol.for("react.forward_ref"), ue = Symbol.for("react.suspense"), ye = Symbol.for("react.suspense_list"), nt = Symbol.for("react.memo"), Ke = Symbol.for("react.lazy"), gt = Symbol.for("react.scope"), vt = Symbol.for("react.debug_trace_mode"), Tn = Symbol.for("react.offscreen"), an = Symbol.for("react.legacy_hidden"), sn = Symbol.for("react.cache"), ar = Symbol.for("react.tracing_marker"), Wa = Symbol.iterator, Ga = "@@iterator";
    function rt(e) {
      if (e === null || typeof e != "object")
        return null;
      var t = Wa && e[Wa] || e[Ga];
      return typeof t == "function" ? t : null;
    }
    var lt = Object.assign, qa = 0, tu, nu, vl, Qu, hl, $r, Yo;
    function kr() {
    }
    kr.__reactDisabledLog = !0;
    function ic() {
      {
        if (qa === 0) {
          tu = console.log, nu = console.info, vl = console.warn, Qu = console.error, hl = console.group, $r = console.groupCollapsed, Yo = console.groupEnd;
          var e = {
            configurable: !0,
            enumerable: !0,
            value: kr,
            writable: !0
          };
          Object.defineProperties(console, {
            info: e,
            log: e,
            warn: e,
            error: e,
            group: e,
            groupCollapsed: e,
            groupEnd: e
          });
        }
        qa++;
      }
    }
    function lc() {
      {
        if (qa--, qa === 0) {
          var e = {
            configurable: !0,
            enumerable: !0,
            writable: !0
          };
          Object.defineProperties(console, {
            log: lt({}, e, {
              value: tu
            }),
            info: lt({}, e, {
              value: nu
            }),
            warn: lt({}, e, {
              value: vl
            }),
            error: lt({}, e, {
              value: Qu
            }),
            group: lt({}, e, {
              value: hl
            }),
            groupCollapsed: lt({}, e, {
              value: $r
            }),
            groupEnd: lt({}, e, {
              value: Yo
            })
          });
        }
        qa < 0 && S("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
      }
    }
    var Wu = k.ReactCurrentDispatcher, ml;
    function fa(e, t, a) {
      {
        if (ml === void 0)
          try {
            throw Error();
          } catch (u) {
            var i = u.stack.trim().match(/\n( *(at )?)/);
            ml = i && i[1] || "";
          }
        return `
` + ml + e;
      }
    }
    var Ka = !1, Xa;
    {
      var Gu = typeof WeakMap == "function" ? WeakMap : Map;
      Xa = new Gu();
    }
    function ru(e, t) {
      if (!e || Ka)
        return "";
      {
        var a = Xa.get(e);
        if (a !== void 0)
          return a;
      }
      var i;
      Ka = !0;
      var u = Error.prepareStackTrace;
      Error.prepareStackTrace = void 0;
      var s;
      s = Wu.current, Wu.current = null, ic();
      try {
        if (t) {
          var f = function() {
            throw Error();
          };
          if (Object.defineProperty(f.prototype, "props", {
            set: function() {
              throw Error();
            }
          }), typeof Reflect == "object" && Reflect.construct) {
            try {
              Reflect.construct(f, []);
            } catch (j) {
              i = j;
            }
            Reflect.construct(e, [], f);
          } else {
            try {
              f.call();
            } catch (j) {
              i = j;
            }
            e.call(f.prototype);
          }
        } else {
          try {
            throw Error();
          } catch (j) {
            i = j;
          }
          e();
        }
      } catch (j) {
        if (j && i && typeof j.stack == "string") {
          for (var p = j.stack.split(`
`), v = i.stack.split(`
`), y = p.length - 1, g = v.length - 1; y >= 1 && g >= 0 && p[y] !== v[g]; )
            g--;
          for (; y >= 1 && g >= 0; y--, g--)
            if (p[y] !== v[g]) {
              if (y !== 1 || g !== 1)
                do
                  if (y--, g--, g < 0 || p[y] !== v[g]) {
                    var x = `
` + p[y].replace(" at new ", " at ");
                    return e.displayName && x.includes("<anonymous>") && (x = x.replace("<anonymous>", e.displayName)), typeof e == "function" && Xa.set(e, x), x;
                  }
                while (y >= 1 && g >= 0);
              break;
            }
        }
      } finally {
        Ka = !1, Wu.current = s, lc(), Error.prepareStackTrace = u;
      }
      var w = e ? e.displayName || e.name : "", U = w ? fa(w) : "";
      return typeof e == "function" && Xa.set(e, U), U;
    }
    function yl(e, t, a) {
      return ru(e, !0);
    }
    function qu(e, t, a) {
      return ru(e, !1);
    }
    function Ku(e) {
      var t = e.prototype;
      return !!(t && t.isReactComponent);
    }
    function Hi(e, t, a) {
      if (e == null)
        return "";
      if (typeof e == "function")
        return ru(e, Ku(e));
      if (typeof e == "string")
        return fa(e);
      switch (e) {
        case ue:
          return fa("Suspense");
        case ye:
          return fa("SuspenseList");
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case $:
            return qu(e.render);
          case nt:
            return Hi(e.type, t, a);
          case Ke: {
            var i = e, u = i._payload, s = i._init;
            try {
              return Hi(s(u), t, a);
            } catch {
            }
          }
        }
      return "";
    }
    function Qf(e) {
      switch (e._debugOwner && e._debugOwner.type, e._debugSource, e.tag) {
        case ae:
          return fa(e.type);
        case en:
          return fa("Lazy");
        case Ne:
          return fa("Suspense");
        case Lt:
          return fa("SuspenseList");
        case Y:
        case _e:
        case He:
          return qu(e.type);
        case Ge:
          return qu(e.type.render);
        case te:
          return yl(e.type);
        default:
          return "";
      }
    }
    function Pi(e) {
      try {
        var t = "", a = e;
        do
          t += Qf(a), a = a.return;
        while (a);
        return t;
      } catch (i) {
        return `
Error generating stack: ` + i.message + `
` + i.stack;
      }
    }
    function Mt(e, t, a) {
      var i = e.displayName;
      if (i)
        return i;
      var u = t.displayName || t.name || "";
      return u !== "" ? a + "(" + u + ")" : a;
    }
    function Xu(e) {
      return e.displayName || "Context";
    }
    function Dt(e) {
      if (e == null)
        return null;
      if (typeof e.tag == "number" && S("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), typeof e == "function")
        return e.displayName || e.name || null;
      if (typeof e == "string")
        return e;
      switch (e) {
        case fi:
          return "Fragment";
        case rr:
          return "Portal";
        case di:
          return "Profiler";
        case Qa:
          return "StrictMode";
        case ue:
          return "Suspense";
        case ye:
          return "SuspenseList";
      }
      if (typeof e == "object")
        switch (e.$$typeof) {
          case R:
            var t = e;
            return Xu(t) + ".Consumer";
          case pi:
            var a = e;
            return Xu(a._context) + ".Provider";
          case $:
            return Mt(e, e.render, "ForwardRef");
          case nt:
            var i = e.displayName || null;
            return i !== null ? i : Dt(e.type) || "Memo";
          case Ke: {
            var u = e, s = u._payload, f = u._init;
            try {
              return Dt(f(s));
            } catch {
              return null;
            }
          }
        }
      return null;
    }
    function $o(e, t, a) {
      var i = t.displayName || t.name || "";
      return e.displayName || (i !== "" ? a + "(" + i + ")" : a);
    }
    function vi(e) {
      return e.displayName || "Context";
    }
    function qe(e) {
      var t = e.tag, a = e.type;
      switch (t) {
        case Tt:
          return "Cache";
        case It:
          var i = a;
          return vi(i) + ".Consumer";
        case tt:
          var u = a;
          return vi(u._context) + ".Provider";
        case $t:
          return "DehydratedFragment";
        case Ge:
          return $o(a, a.render, "ForwardRef");
        case Ie:
          return "Fragment";
        case ae:
          return a;
        case ge:
          return "Portal";
        case ee:
          return "Root";
        case fe:
          return "Text";
        case en:
          return Dt(a);
        case Je:
          return a === Qa ? "StrictMode" : "Mode";
        case Le:
          return "Offscreen";
        case ft:
          return "Profiler";
        case yt:
          return "Scope";
        case Ne:
          return "Suspense";
        case Lt:
          return "SuspenseList";
        case kt:
          return "TracingMarker";
        case te:
        case Y:
        case Ht:
        case _e:
        case Ze:
        case He:
          if (typeof a == "function")
            return a.displayName || a.name || null;
          if (typeof a == "string")
            return a;
          break;
      }
      return null;
    }
    var Ju = k.ReactDebugCurrentFrame, ir = null, hi = !1;
    function Dr() {
      {
        if (ir === null)
          return null;
        var e = ir._debugOwner;
        if (e !== null && typeof e < "u")
          return qe(e);
      }
      return null;
    }
    function mi() {
      return ir === null ? "" : Pi(ir);
    }
    function cn() {
      Ju.getCurrentStack = null, ir = null, hi = !1;
    }
    function Gt(e) {
      Ju.getCurrentStack = e === null ? null : mi, ir = e, hi = !1;
    }
    function gl() {
      return ir;
    }
    function Yn(e) {
      hi = e;
    }
    function Or(e) {
      return "" + e;
    }
    function wa(e) {
      switch (typeof e) {
        case "boolean":
        case "number":
        case "string":
        case "undefined":
          return e;
        case "object":
          return Rn(e), e;
        default:
          return "";
      }
    }
    var au = {
      button: !0,
      checkbox: !0,
      image: !0,
      hidden: !0,
      radio: !0,
      reset: !0,
      submit: !0
    };
    function Qo(e, t) {
      au[t.type] || t.onChange || t.onInput || t.readOnly || t.disabled || t.value == null || S("You provided a `value` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultValue`. Otherwise, set either `onChange` or `readOnly`."), t.onChange || t.readOnly || t.disabled || t.checked == null || S("You provided a `checked` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultChecked`. Otherwise, set either `onChange` or `readOnly`.");
    }
    function Wo(e) {
      var t = e.type, a = e.nodeName;
      return a && a.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
    }
    function Sl(e) {
      return e._valueTracker;
    }
    function iu(e) {
      e._valueTracker = null;
    }
    function Wf(e) {
      var t = "";
      return e && (Wo(e) ? t = e.checked ? "true" : "false" : t = e.value), t;
    }
    function ba(e) {
      var t = Wo(e) ? "checked" : "value", a = Object.getOwnPropertyDescriptor(e.constructor.prototype, t);
      Rn(e[t]);
      var i = "" + e[t];
      if (!(e.hasOwnProperty(t) || typeof a > "u" || typeof a.get != "function" || typeof a.set != "function")) {
        var u = a.get, s = a.set;
        Object.defineProperty(e, t, {
          configurable: !0,
          get: function() {
            return u.call(this);
          },
          set: function(p) {
            Rn(p), i = "" + p, s.call(this, p);
          }
        }), Object.defineProperty(e, t, {
          enumerable: a.enumerable
        });
        var f = {
          getValue: function() {
            return i;
          },
          setValue: function(p) {
            Rn(p), i = "" + p;
          },
          stopTracking: function() {
            iu(e), delete e[t];
          }
        };
        return f;
      }
    }
    function Ja(e) {
      Sl(e) || (e._valueTracker = ba(e));
    }
    function yi(e) {
      if (!e)
        return !1;
      var t = Sl(e);
      if (!t)
        return !0;
      var a = t.getValue(), i = Wf(e);
      return i !== a ? (t.setValue(i), !0) : !1;
    }
    function xa(e) {
      if (e = e || (typeof document < "u" ? document : void 0), typeof e > "u")
        return null;
      try {
        return e.activeElement || e.body;
      } catch {
        return e.body;
      }
    }
    var Zu = !1, eo = !1, El = !1, lu = !1;
    function to(e) {
      var t = e.type === "checkbox" || e.type === "radio";
      return t ? e.checked != null : e.value != null;
    }
    function no(e, t) {
      var a = e, i = t.checked, u = lt({}, t, {
        defaultChecked: void 0,
        defaultValue: void 0,
        value: void 0,
        checked: i ?? a._wrapperState.initialChecked
      });
      return u;
    }
    function Za(e, t) {
      Qo("input", t), t.checked !== void 0 && t.defaultChecked !== void 0 && !eo && (S("%s contains an input of type %s with both checked and defaultChecked props. Input elements must be either controlled or uncontrolled (specify either the checked prop, or the defaultChecked prop, but not both). Decide between using a controlled or uncontrolled input element and remove one of these props. More info: https://reactjs.org/link/controlled-components", Dr() || "A component", t.type), eo = !0), t.value !== void 0 && t.defaultValue !== void 0 && !Zu && (S("%s contains an input of type %s with both value and defaultValue props. Input elements must be either controlled or uncontrolled (specify either the value prop, or the defaultValue prop, but not both). Decide between using a controlled or uncontrolled input element and remove one of these props. More info: https://reactjs.org/link/controlled-components", Dr() || "A component", t.type), Zu = !0);
      var a = e, i = t.defaultValue == null ? "" : t.defaultValue;
      a._wrapperState = {
        initialChecked: t.checked != null ? t.checked : t.defaultChecked,
        initialValue: wa(t.value != null ? t.value : i),
        controlled: to(t)
      };
    }
    function h(e, t) {
      var a = e, i = t.checked;
      i != null && xr(a, "checked", i, !1);
    }
    function C(e, t) {
      var a = e;
      {
        var i = to(t);
        !a._wrapperState.controlled && i && !lu && (S("A component is changing an uncontrolled input to be controlled. This is likely caused by the value changing from undefined to a defined value, which should not happen. Decide between using a controlled or uncontrolled input element for the lifetime of the component. More info: https://reactjs.org/link/controlled-components"), lu = !0), a._wrapperState.controlled && !i && !El && (S("A component is changing a controlled input to be uncontrolled. This is likely caused by the value changing from a defined to undefined, which should not happen. Decide between using a controlled or uncontrolled input element for the lifetime of the component. More info: https://reactjs.org/link/controlled-components"), El = !0);
      }
      h(e, t);
      var u = wa(t.value), s = t.type;
      if (u != null)
        s === "number" ? (u === 0 && a.value === "" || // We explicitly want to coerce to number here if possible.
        // eslint-disable-next-line
        a.value != u) && (a.value = Or(u)) : a.value !== Or(u) && (a.value = Or(u));
      else if (s === "submit" || s === "reset") {
        a.removeAttribute("value");
        return;
      }
      t.hasOwnProperty("value") ? Ae(a, t.type, u) : t.hasOwnProperty("defaultValue") && Ae(a, t.type, wa(t.defaultValue)), t.checked == null && t.defaultChecked != null && (a.defaultChecked = !!t.defaultChecked);
    }
    function z(e, t, a) {
      var i = e;
      if (t.hasOwnProperty("value") || t.hasOwnProperty("defaultValue")) {
        var u = t.type, s = u === "submit" || u === "reset";
        if (s && (t.value === void 0 || t.value === null))
          return;
        var f = Or(i._wrapperState.initialValue);
        a || f !== i.value && (i.value = f), i.defaultValue = f;
      }
      var p = i.name;
      p !== "" && (i.name = ""), i.defaultChecked = !i.defaultChecked, i.defaultChecked = !!i._wrapperState.initialChecked, p !== "" && (i.name = p);
    }
    function H(e, t) {
      var a = e;
      C(a, t), J(a, t);
    }
    function J(e, t) {
      var a = t.name;
      if (t.type === "radio" && a != null) {
        for (var i = e; i.parentNode; )
          i = i.parentNode;
        Bn(a, "name");
        for (var u = i.querySelectorAll("input[name=" + JSON.stringify("" + a) + '][type="radio"]'), s = 0; s < u.length; s++) {
          var f = u[s];
          if (!(f === e || f.form !== e.form)) {
            var p = Mh(f);
            if (!p)
              throw new Error("ReactDOMInput: Mixing React and non-React radio inputs with the same `name` is not supported.");
            yi(f), C(f, p);
          }
        }
      }
    }
    function Ae(e, t, a) {
      // Focused number inputs synchronize on blur. See ChangeEventPlugin.js
      (t !== "number" || xa(e.ownerDocument) !== e) && (a == null ? e.defaultValue = Or(e._wrapperState.initialValue) : e.defaultValue !== Or(a) && (e.defaultValue = Or(a)));
    }
    var le = !1, Pe = !1, St = !1;
    function Ot(e, t) {
      t.value == null && (typeof t.children == "object" && t.children !== null ? D.Children.forEach(t.children, function(a) {
        a != null && (typeof a == "string" || typeof a == "number" || Pe || (Pe = !0, S("Cannot infer the option value of complex children. Pass a `value` prop or use a plain string as children to <option>.")));
      }) : t.dangerouslySetInnerHTML != null && (St || (St = !0, S("Pass a `value` prop if you set dangerouslyInnerHTML so React knows which value should be selected.")))), t.selected != null && !le && (S("Use the `defaultValue` or `value` props on <select> instead of setting `selected` on <option>."), le = !0);
    }
    function ln(e, t) {
      t.value != null && e.setAttribute("value", Or(wa(t.value)));
    }
    var qt = Array.isArray;
    function ct(e) {
      return qt(e);
    }
    var Kt;
    Kt = !1;
    function hn() {
      var e = Dr();
      return e ? `

Check the render method of \`` + e + "`." : "";
    }
    var Cl = ["value", "defaultValue"];
    function Go(e) {
      {
        Qo("select", e);
        for (var t = 0; t < Cl.length; t++) {
          var a = Cl[t];
          if (e[a] != null) {
            var i = ct(e[a]);
            e.multiple && !i ? S("The `%s` prop supplied to <select> must be an array if `multiple` is true.%s", a, hn()) : !e.multiple && i && S("The `%s` prop supplied to <select> must be a scalar value if `multiple` is false.%s", a, hn());
          }
        }
      }
    }
    function Vi(e, t, a, i) {
      var u = e.options;
      if (t) {
        for (var s = a, f = {}, p = 0; p < s.length; p++)
          f["$" + s[p]] = !0;
        for (var v = 0; v < u.length; v++) {
          var y = f.hasOwnProperty("$" + u[v].value);
          u[v].selected !== y && (u[v].selected = y), y && i && (u[v].defaultSelected = !0);
        }
      } else {
        for (var g = Or(wa(a)), x = null, w = 0; w < u.length; w++) {
          if (u[w].value === g) {
            u[w].selected = !0, i && (u[w].defaultSelected = !0);
            return;
          }
          x === null && !u[w].disabled && (x = u[w]);
        }
        x !== null && (x.selected = !0);
      }
    }
    function qo(e, t) {
      return lt({}, t, {
        value: void 0
      });
    }
    function uu(e, t) {
      var a = e;
      Go(t), a._wrapperState = {
        wasMultiple: !!t.multiple
      }, t.value !== void 0 && t.defaultValue !== void 0 && !Kt && (S("Select elements must be either controlled or uncontrolled (specify either the value prop, or the defaultValue prop, but not both). Decide between using a controlled or uncontrolled select element and remove one of these props. More info: https://reactjs.org/link/controlled-components"), Kt = !0);
    }
    function Gf(e, t) {
      var a = e;
      a.multiple = !!t.multiple;
      var i = t.value;
      i != null ? Vi(a, !!t.multiple, i, !1) : t.defaultValue != null && Vi(a, !!t.multiple, t.defaultValue, !0);
    }
    function uc(e, t) {
      var a = e, i = a._wrapperState.wasMultiple;
      a._wrapperState.wasMultiple = !!t.multiple;
      var u = t.value;
      u != null ? Vi(a, !!t.multiple, u, !1) : i !== !!t.multiple && (t.defaultValue != null ? Vi(a, !!t.multiple, t.defaultValue, !0) : Vi(a, !!t.multiple, t.multiple ? [] : "", !1));
    }
    function qf(e, t) {
      var a = e, i = t.value;
      i != null && Vi(a, !!t.multiple, i, !1);
    }
    var nv = !1;
    function Kf(e, t) {
      var a = e;
      if (t.dangerouslySetInnerHTML != null)
        throw new Error("`dangerouslySetInnerHTML` does not make sense on <textarea>.");
      var i = lt({}, t, {
        value: void 0,
        defaultValue: void 0,
        children: Or(a._wrapperState.initialValue)
      });
      return i;
    }
    function Xf(e, t) {
      var a = e;
      Qo("textarea", t), t.value !== void 0 && t.defaultValue !== void 0 && !nv && (S("%s contains a textarea with both value and defaultValue props. Textarea elements must be either controlled or uncontrolled (specify either the value prop, or the defaultValue prop, but not both). Decide between using a controlled or uncontrolled textarea and remove one of these props. More info: https://reactjs.org/link/controlled-components", Dr() || "A component"), nv = !0);
      var i = t.value;
      if (i == null) {
        var u = t.children, s = t.defaultValue;
        if (u != null) {
          S("Use the `defaultValue` or `value` props instead of setting children on <textarea>.");
          {
            if (s != null)
              throw new Error("If you supply `defaultValue` on a <textarea>, do not pass children.");
            if (ct(u)) {
              if (u.length > 1)
                throw new Error("<textarea> can only have at most one child.");
              u = u[0];
            }
            s = u;
          }
        }
        s == null && (s = ""), i = s;
      }
      a._wrapperState = {
        initialValue: wa(i)
      };
    }
    function rv(e, t) {
      var a = e, i = wa(t.value), u = wa(t.defaultValue);
      if (i != null) {
        var s = Or(i);
        s !== a.value && (a.value = s), t.defaultValue == null && a.defaultValue !== s && (a.defaultValue = s);
      }
      u != null && (a.defaultValue = Or(u));
    }
    function av(e, t) {
      var a = e, i = a.textContent;
      i === a._wrapperState.initialValue && i !== "" && i !== null && (a.value = i);
    }
    function Xm(e, t) {
      rv(e, t);
    }
    var Bi = "http://www.w3.org/1999/xhtml", Jf = "http://www.w3.org/1998/Math/MathML", Zf = "http://www.w3.org/2000/svg";
    function ed(e) {
      switch (e) {
        case "svg":
          return Zf;
        case "math":
          return Jf;
        default:
          return Bi;
      }
    }
    function td(e, t) {
      return e == null || e === Bi ? ed(t) : e === Zf && t === "foreignObject" ? Bi : e;
    }
    var iv = function(e) {
      return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(t, a, i, u) {
        MSApp.execUnsafeLocalFunction(function() {
          return e(t, a, i, u);
        });
      } : e;
    }, oc, lv = iv(function(e, t) {
      if (e.namespaceURI === Zf && !("innerHTML" in e)) {
        oc = oc || document.createElement("div"), oc.innerHTML = "<svg>" + t.valueOf().toString() + "</svg>";
        for (var a = oc.firstChild; e.firstChild; )
          e.removeChild(e.firstChild);
        for (; a.firstChild; )
          e.appendChild(a.firstChild);
        return;
      }
      e.innerHTML = t;
    }), Qr = 1, Ii = 3, Ln = 8, Yi = 9, nd = 11, ro = function(e, t) {
      if (t) {
        var a = e.firstChild;
        if (a && a === e.lastChild && a.nodeType === Ii) {
          a.nodeValue = t;
          return;
        }
      }
      e.textContent = t;
    }, Ko = {
      animation: ["animationDelay", "animationDirection", "animationDuration", "animationFillMode", "animationIterationCount", "animationName", "animationPlayState", "animationTimingFunction"],
      background: ["backgroundAttachment", "backgroundClip", "backgroundColor", "backgroundImage", "backgroundOrigin", "backgroundPositionX", "backgroundPositionY", "backgroundRepeat", "backgroundSize"],
      backgroundPosition: ["backgroundPositionX", "backgroundPositionY"],
      border: ["borderBottomColor", "borderBottomStyle", "borderBottomWidth", "borderImageOutset", "borderImageRepeat", "borderImageSlice", "borderImageSource", "borderImageWidth", "borderLeftColor", "borderLeftStyle", "borderLeftWidth", "borderRightColor", "borderRightStyle", "borderRightWidth", "borderTopColor", "borderTopStyle", "borderTopWidth"],
      borderBlockEnd: ["borderBlockEndColor", "borderBlockEndStyle", "borderBlockEndWidth"],
      borderBlockStart: ["borderBlockStartColor", "borderBlockStartStyle", "borderBlockStartWidth"],
      borderBottom: ["borderBottomColor", "borderBottomStyle", "borderBottomWidth"],
      borderColor: ["borderBottomColor", "borderLeftColor", "borderRightColor", "borderTopColor"],
      borderImage: ["borderImageOutset", "borderImageRepeat", "borderImageSlice", "borderImageSource", "borderImageWidth"],
      borderInlineEnd: ["borderInlineEndColor", "borderInlineEndStyle", "borderInlineEndWidth"],
      borderInlineStart: ["borderInlineStartColor", "borderInlineStartStyle", "borderInlineStartWidth"],
      borderLeft: ["borderLeftColor", "borderLeftStyle", "borderLeftWidth"],
      borderRadius: ["borderBottomLeftRadius", "borderBottomRightRadius", "borderTopLeftRadius", "borderTopRightRadius"],
      borderRight: ["borderRightColor", "borderRightStyle", "borderRightWidth"],
      borderStyle: ["borderBottomStyle", "borderLeftStyle", "borderRightStyle", "borderTopStyle"],
      borderTop: ["borderTopColor", "borderTopStyle", "borderTopWidth"],
      borderWidth: ["borderBottomWidth", "borderLeftWidth", "borderRightWidth", "borderTopWidth"],
      columnRule: ["columnRuleColor", "columnRuleStyle", "columnRuleWidth"],
      columns: ["columnCount", "columnWidth"],
      flex: ["flexBasis", "flexGrow", "flexShrink"],
      flexFlow: ["flexDirection", "flexWrap"],
      font: ["fontFamily", "fontFeatureSettings", "fontKerning", "fontLanguageOverride", "fontSize", "fontSizeAdjust", "fontStretch", "fontStyle", "fontVariant", "fontVariantAlternates", "fontVariantCaps", "fontVariantEastAsian", "fontVariantLigatures", "fontVariantNumeric", "fontVariantPosition", "fontWeight", "lineHeight"],
      fontVariant: ["fontVariantAlternates", "fontVariantCaps", "fontVariantEastAsian", "fontVariantLigatures", "fontVariantNumeric", "fontVariantPosition"],
      gap: ["columnGap", "rowGap"],
      grid: ["gridAutoColumns", "gridAutoFlow", "gridAutoRows", "gridTemplateAreas", "gridTemplateColumns", "gridTemplateRows"],
      gridArea: ["gridColumnEnd", "gridColumnStart", "gridRowEnd", "gridRowStart"],
      gridColumn: ["gridColumnEnd", "gridColumnStart"],
      gridColumnGap: ["columnGap"],
      gridGap: ["columnGap", "rowGap"],
      gridRow: ["gridRowEnd", "gridRowStart"],
      gridRowGap: ["rowGap"],
      gridTemplate: ["gridTemplateAreas", "gridTemplateColumns", "gridTemplateRows"],
      listStyle: ["listStyleImage", "listStylePosition", "listStyleType"],
      margin: ["marginBottom", "marginLeft", "marginRight", "marginTop"],
      marker: ["markerEnd", "markerMid", "markerStart"],
      mask: ["maskClip", "maskComposite", "maskImage", "maskMode", "maskOrigin", "maskPositionX", "maskPositionY", "maskRepeat", "maskSize"],
      maskPosition: ["maskPositionX", "maskPositionY"],
      outline: ["outlineColor", "outlineStyle", "outlineWidth"],
      overflow: ["overflowX", "overflowY"],
      padding: ["paddingBottom", "paddingLeft", "paddingRight", "paddingTop"],
      placeContent: ["alignContent", "justifyContent"],
      placeItems: ["alignItems", "justifyItems"],
      placeSelf: ["alignSelf", "justifySelf"],
      textDecoration: ["textDecorationColor", "textDecorationLine", "textDecorationStyle"],
      textEmphasis: ["textEmphasisColor", "textEmphasisStyle"],
      transition: ["transitionDelay", "transitionDuration", "transitionProperty", "transitionTimingFunction"],
      wordWrap: ["overflowWrap"]
    }, Xo = {
      animationIterationCount: !0,
      aspectRatio: !0,
      borderImageOutset: !0,
      borderImageSlice: !0,
      borderImageWidth: !0,
      boxFlex: !0,
      boxFlexGroup: !0,
      boxOrdinalGroup: !0,
      columnCount: !0,
      columns: !0,
      flex: !0,
      flexGrow: !0,
      flexPositive: !0,
      flexShrink: !0,
      flexNegative: !0,
      flexOrder: !0,
      gridArea: !0,
      gridRow: !0,
      gridRowEnd: !0,
      gridRowSpan: !0,
      gridRowStart: !0,
      gridColumn: !0,
      gridColumnEnd: !0,
      gridColumnSpan: !0,
      gridColumnStart: !0,
      fontWeight: !0,
      lineClamp: !0,
      lineHeight: !0,
      opacity: !0,
      order: !0,
      orphans: !0,
      tabSize: !0,
      widows: !0,
      zIndex: !0,
      zoom: !0,
      // SVG-related properties
      fillOpacity: !0,
      floodOpacity: !0,
      stopOpacity: !0,
      strokeDasharray: !0,
      strokeDashoffset: !0,
      strokeMiterlimit: !0,
      strokeOpacity: !0,
      strokeWidth: !0
    };
    function uv(e, t) {
      return e + t.charAt(0).toUpperCase() + t.substring(1);
    }
    var ov = ["Webkit", "ms", "Moz", "O"];
    Object.keys(Xo).forEach(function(e) {
      ov.forEach(function(t) {
        Xo[uv(t, e)] = Xo[e];
      });
    });
    function sc(e, t, a) {
      var i = t == null || typeof t == "boolean" || t === "";
      return i ? "" : !a && typeof t == "number" && t !== 0 && !(Xo.hasOwnProperty(e) && Xo[e]) ? t + "px" : (oa(t, e), ("" + t).trim());
    }
    var sv = /([A-Z])/g, cv = /^ms-/;
    function ao(e) {
      return e.replace(sv, "-$1").toLowerCase().replace(cv, "-ms-");
    }
    var fv = function() {
    };
    {
      var Jm = /^(?:webkit|moz|o)[A-Z]/, Zm = /^-ms-/, dv = /-(.)/g, rd = /;\s*$/, gi = {}, ou = {}, pv = !1, Jo = !1, ey = function(e) {
        return e.replace(dv, function(t, a) {
          return a.toUpperCase();
        });
      }, vv = function(e) {
        gi.hasOwnProperty(e) && gi[e] || (gi[e] = !0, S(
          "Unsupported style property %s. Did you mean %s?",
          e,
          // As Andi Smith suggests
          // (http://www.andismith.com/blog/2012/02/modernizr-prefixed/), an `-ms` prefix
          // is converted to lowercase `ms`.
          ey(e.replace(Zm, "ms-"))
        ));
      }, ad = function(e) {
        gi.hasOwnProperty(e) && gi[e] || (gi[e] = !0, S("Unsupported vendor-prefixed style property %s. Did you mean %s?", e, e.charAt(0).toUpperCase() + e.slice(1)));
      }, id = function(e, t) {
        ou.hasOwnProperty(t) && ou[t] || (ou[t] = !0, S(`Style property values shouldn't contain a semicolon. Try "%s: %s" instead.`, e, t.replace(rd, "")));
      }, hv = function(e, t) {
        pv || (pv = !0, S("`NaN` is an invalid value for the `%s` css style property.", e));
      }, mv = function(e, t) {
        Jo || (Jo = !0, S("`Infinity` is an invalid value for the `%s` css style property.", e));
      };
      fv = function(e, t) {
        e.indexOf("-") > -1 ? vv(e) : Jm.test(e) ? ad(e) : rd.test(t) && id(e, t), typeof t == "number" && (isNaN(t) ? hv(e, t) : isFinite(t) || mv(e, t));
      };
    }
    var yv = fv;
    function ty(e) {
      {
        var t = "", a = "";
        for (var i in e)
          if (e.hasOwnProperty(i)) {
            var u = e[i];
            if (u != null) {
              var s = i.indexOf("--") === 0;
              t += a + (s ? i : ao(i)) + ":", t += sc(i, u, s), a = ";";
            }
          }
        return t || null;
      }
    }
    function gv(e, t) {
      var a = e.style;
      for (var i in t)
        if (t.hasOwnProperty(i)) {
          var u = i.indexOf("--") === 0;
          u || yv(i, t[i]);
          var s = sc(i, t[i], u);
          i === "float" && (i = "cssFloat"), u ? a.setProperty(i, s) : a[i] = s;
        }
    }
    function ny(e) {
      return e == null || typeof e == "boolean" || e === "";
    }
    function Sv(e) {
      var t = {};
      for (var a in e)
        for (var i = Ko[a] || [a], u = 0; u < i.length; u++)
          t[i[u]] = a;
      return t;
    }
    function ry(e, t) {
      {
        if (!t)
          return;
        var a = Sv(e), i = Sv(t), u = {};
        for (var s in a) {
          var f = a[s], p = i[s];
          if (p && f !== p) {
            var v = f + "," + p;
            if (u[v])
              continue;
            u[v] = !0, S("%s a style property during rerender (%s) when a conflicting property is set (%s) can lead to styling bugs. To avoid this, don't mix shorthand and non-shorthand properties for the same value; instead, replace the shorthand with separate values.", ny(e[f]) ? "Removing" : "Updating", f, p);
          }
        }
      }
    }
    var ei = {
      area: !0,
      base: !0,
      br: !0,
      col: !0,
      embed: !0,
      hr: !0,
      img: !0,
      input: !0,
      keygen: !0,
      link: !0,
      meta: !0,
      param: !0,
      source: !0,
      track: !0,
      wbr: !0
      // NOTE: menuitem's close tag should be omitted, but that causes problems.
    }, Zo = lt({
      menuitem: !0
    }, ei), Ev = "__html";
    function cc(e, t) {
      if (t) {
        if (Zo[e] && (t.children != null || t.dangerouslySetInnerHTML != null))
          throw new Error(e + " is a void element tag and must neither have `children` nor use `dangerouslySetInnerHTML`.");
        if (t.dangerouslySetInnerHTML != null) {
          if (t.children != null)
            throw new Error("Can only set one of `children` or `props.dangerouslySetInnerHTML`.");
          if (typeof t.dangerouslySetInnerHTML != "object" || !(Ev in t.dangerouslySetInnerHTML))
            throw new Error("`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. Please visit https://reactjs.org/link/dangerously-set-inner-html for more information.");
        }
        if (!t.suppressContentEditableWarning && t.contentEditable && t.children != null && S("A component is `contentEditable` and contains `children` managed by React. It is now your responsibility to guarantee that none of those nodes are unexpectedly modified or duplicated. This is probably not intentional."), t.style != null && typeof t.style != "object")
          throw new Error("The `style` prop expects a mapping from style properties to values, not a string. For example, style={{marginRight: spacing + 'em'}} when using JSX.");
      }
    }
    function Rl(e, t) {
      if (e.indexOf("-") === -1)
        return typeof t.is == "string";
      switch (e) {
        case "annotation-xml":
        case "color-profile":
        case "font-face":
        case "font-face-src":
        case "font-face-uri":
        case "font-face-format":
        case "font-face-name":
        case "missing-glyph":
          return !1;
        default:
          return !0;
      }
    }
    var es = {
      // HTML
      accept: "accept",
      acceptcharset: "acceptCharset",
      "accept-charset": "acceptCharset",
      accesskey: "accessKey",
      action: "action",
      allowfullscreen: "allowFullScreen",
      alt: "alt",
      as: "as",
      async: "async",
      autocapitalize: "autoCapitalize",
      autocomplete: "autoComplete",
      autocorrect: "autoCorrect",
      autofocus: "autoFocus",
      autoplay: "autoPlay",
      autosave: "autoSave",
      capture: "capture",
      cellpadding: "cellPadding",
      cellspacing: "cellSpacing",
      challenge: "challenge",
      charset: "charSet",
      checked: "checked",
      children: "children",
      cite: "cite",
      class: "className",
      classid: "classID",
      classname: "className",
      cols: "cols",
      colspan: "colSpan",
      content: "content",
      contenteditable: "contentEditable",
      contextmenu: "contextMenu",
      controls: "controls",
      controlslist: "controlsList",
      coords: "coords",
      crossorigin: "crossOrigin",
      dangerouslysetinnerhtml: "dangerouslySetInnerHTML",
      data: "data",
      datetime: "dateTime",
      default: "default",
      defaultchecked: "defaultChecked",
      defaultvalue: "defaultValue",
      defer: "defer",
      dir: "dir",
      disabled: "disabled",
      disablepictureinpicture: "disablePictureInPicture",
      disableremoteplayback: "disableRemotePlayback",
      download: "download",
      draggable: "draggable",
      enctype: "encType",
      enterkeyhint: "enterKeyHint",
      for: "htmlFor",
      form: "form",
      formmethod: "formMethod",
      formaction: "formAction",
      formenctype: "formEncType",
      formnovalidate: "formNoValidate",
      formtarget: "formTarget",
      frameborder: "frameBorder",
      headers: "headers",
      height: "height",
      hidden: "hidden",
      high: "high",
      href: "href",
      hreflang: "hrefLang",
      htmlfor: "htmlFor",
      httpequiv: "httpEquiv",
      "http-equiv": "httpEquiv",
      icon: "icon",
      id: "id",
      imagesizes: "imageSizes",
      imagesrcset: "imageSrcSet",
      innerhtml: "innerHTML",
      inputmode: "inputMode",
      integrity: "integrity",
      is: "is",
      itemid: "itemID",
      itemprop: "itemProp",
      itemref: "itemRef",
      itemscope: "itemScope",
      itemtype: "itemType",
      keyparams: "keyParams",
      keytype: "keyType",
      kind: "kind",
      label: "label",
      lang: "lang",
      list: "list",
      loop: "loop",
      low: "low",
      manifest: "manifest",
      marginwidth: "marginWidth",
      marginheight: "marginHeight",
      max: "max",
      maxlength: "maxLength",
      media: "media",
      mediagroup: "mediaGroup",
      method: "method",
      min: "min",
      minlength: "minLength",
      multiple: "multiple",
      muted: "muted",
      name: "name",
      nomodule: "noModule",
      nonce: "nonce",
      novalidate: "noValidate",
      open: "open",
      optimum: "optimum",
      pattern: "pattern",
      placeholder: "placeholder",
      playsinline: "playsInline",
      poster: "poster",
      preload: "preload",
      profile: "profile",
      radiogroup: "radioGroup",
      readonly: "readOnly",
      referrerpolicy: "referrerPolicy",
      rel: "rel",
      required: "required",
      reversed: "reversed",
      role: "role",
      rows: "rows",
      rowspan: "rowSpan",
      sandbox: "sandbox",
      scope: "scope",
      scoped: "scoped",
      scrolling: "scrolling",
      seamless: "seamless",
      selected: "selected",
      shape: "shape",
      size: "size",
      sizes: "sizes",
      span: "span",
      spellcheck: "spellCheck",
      src: "src",
      srcdoc: "srcDoc",
      srclang: "srcLang",
      srcset: "srcSet",
      start: "start",
      step: "step",
      style: "style",
      summary: "summary",
      tabindex: "tabIndex",
      target: "target",
      title: "title",
      type: "type",
      usemap: "useMap",
      value: "value",
      width: "width",
      wmode: "wmode",
      wrap: "wrap",
      // SVG
      about: "about",
      accentheight: "accentHeight",
      "accent-height": "accentHeight",
      accumulate: "accumulate",
      additive: "additive",
      alignmentbaseline: "alignmentBaseline",
      "alignment-baseline": "alignmentBaseline",
      allowreorder: "allowReorder",
      alphabetic: "alphabetic",
      amplitude: "amplitude",
      arabicform: "arabicForm",
      "arabic-form": "arabicForm",
      ascent: "ascent",
      attributename: "attributeName",
      attributetype: "attributeType",
      autoreverse: "autoReverse",
      azimuth: "azimuth",
      basefrequency: "baseFrequency",
      baselineshift: "baselineShift",
      "baseline-shift": "baselineShift",
      baseprofile: "baseProfile",
      bbox: "bbox",
      begin: "begin",
      bias: "bias",
      by: "by",
      calcmode: "calcMode",
      capheight: "capHeight",
      "cap-height": "capHeight",
      clip: "clip",
      clippath: "clipPath",
      "clip-path": "clipPath",
      clippathunits: "clipPathUnits",
      cliprule: "clipRule",
      "clip-rule": "clipRule",
      color: "color",
      colorinterpolation: "colorInterpolation",
      "color-interpolation": "colorInterpolation",
      colorinterpolationfilters: "colorInterpolationFilters",
      "color-interpolation-filters": "colorInterpolationFilters",
      colorprofile: "colorProfile",
      "color-profile": "colorProfile",
      colorrendering: "colorRendering",
      "color-rendering": "colorRendering",
      contentscripttype: "contentScriptType",
      contentstyletype: "contentStyleType",
      cursor: "cursor",
      cx: "cx",
      cy: "cy",
      d: "d",
      datatype: "datatype",
      decelerate: "decelerate",
      descent: "descent",
      diffuseconstant: "diffuseConstant",
      direction: "direction",
      display: "display",
      divisor: "divisor",
      dominantbaseline: "dominantBaseline",
      "dominant-baseline": "dominantBaseline",
      dur: "dur",
      dx: "dx",
      dy: "dy",
      edgemode: "edgeMode",
      elevation: "elevation",
      enablebackground: "enableBackground",
      "enable-background": "enableBackground",
      end: "end",
      exponent: "exponent",
      externalresourcesrequired: "externalResourcesRequired",
      fill: "fill",
      fillopacity: "fillOpacity",
      "fill-opacity": "fillOpacity",
      fillrule: "fillRule",
      "fill-rule": "fillRule",
      filter: "filter",
      filterres: "filterRes",
      filterunits: "filterUnits",
      floodopacity: "floodOpacity",
      "flood-opacity": "floodOpacity",
      floodcolor: "floodColor",
      "flood-color": "floodColor",
      focusable: "focusable",
      fontfamily: "fontFamily",
      "font-family": "fontFamily",
      fontsize: "fontSize",
      "font-size": "fontSize",
      fontsizeadjust: "fontSizeAdjust",
      "font-size-adjust": "fontSizeAdjust",
      fontstretch: "fontStretch",
      "font-stretch": "fontStretch",
      fontstyle: "fontStyle",
      "font-style": "fontStyle",
      fontvariant: "fontVariant",
      "font-variant": "fontVariant",
      fontweight: "fontWeight",
      "font-weight": "fontWeight",
      format: "format",
      from: "from",
      fx: "fx",
      fy: "fy",
      g1: "g1",
      g2: "g2",
      glyphname: "glyphName",
      "glyph-name": "glyphName",
      glyphorientationhorizontal: "glyphOrientationHorizontal",
      "glyph-orientation-horizontal": "glyphOrientationHorizontal",
      glyphorientationvertical: "glyphOrientationVertical",
      "glyph-orientation-vertical": "glyphOrientationVertical",
      glyphref: "glyphRef",
      gradienttransform: "gradientTransform",
      gradientunits: "gradientUnits",
      hanging: "hanging",
      horizadvx: "horizAdvX",
      "horiz-adv-x": "horizAdvX",
      horizoriginx: "horizOriginX",
      "horiz-origin-x": "horizOriginX",
      ideographic: "ideographic",
      imagerendering: "imageRendering",
      "image-rendering": "imageRendering",
      in2: "in2",
      in: "in",
      inlist: "inlist",
      intercept: "intercept",
      k1: "k1",
      k2: "k2",
      k3: "k3",
      k4: "k4",
      k: "k",
      kernelmatrix: "kernelMatrix",
      kernelunitlength: "kernelUnitLength",
      kerning: "kerning",
      keypoints: "keyPoints",
      keysplines: "keySplines",
      keytimes: "keyTimes",
      lengthadjust: "lengthAdjust",
      letterspacing: "letterSpacing",
      "letter-spacing": "letterSpacing",
      lightingcolor: "lightingColor",
      "lighting-color": "lightingColor",
      limitingconeangle: "limitingConeAngle",
      local: "local",
      markerend: "markerEnd",
      "marker-end": "markerEnd",
      markerheight: "markerHeight",
      markermid: "markerMid",
      "marker-mid": "markerMid",
      markerstart: "markerStart",
      "marker-start": "markerStart",
      markerunits: "markerUnits",
      markerwidth: "markerWidth",
      mask: "mask",
      maskcontentunits: "maskContentUnits",
      maskunits: "maskUnits",
      mathematical: "mathematical",
      mode: "mode",
      numoctaves: "numOctaves",
      offset: "offset",
      opacity: "opacity",
      operator: "operator",
      order: "order",
      orient: "orient",
      orientation: "orientation",
      origin: "origin",
      overflow: "overflow",
      overlineposition: "overlinePosition",
      "overline-position": "overlinePosition",
      overlinethickness: "overlineThickness",
      "overline-thickness": "overlineThickness",
      paintorder: "paintOrder",
      "paint-order": "paintOrder",
      panose1: "panose1",
      "panose-1": "panose1",
      pathlength: "pathLength",
      patterncontentunits: "patternContentUnits",
      patterntransform: "patternTransform",
      patternunits: "patternUnits",
      pointerevents: "pointerEvents",
      "pointer-events": "pointerEvents",
      points: "points",
      pointsatx: "pointsAtX",
      pointsaty: "pointsAtY",
      pointsatz: "pointsAtZ",
      prefix: "prefix",
      preservealpha: "preserveAlpha",
      preserveaspectratio: "preserveAspectRatio",
      primitiveunits: "primitiveUnits",
      property: "property",
      r: "r",
      radius: "radius",
      refx: "refX",
      refy: "refY",
      renderingintent: "renderingIntent",
      "rendering-intent": "renderingIntent",
      repeatcount: "repeatCount",
      repeatdur: "repeatDur",
      requiredextensions: "requiredExtensions",
      requiredfeatures: "requiredFeatures",
      resource: "resource",
      restart: "restart",
      result: "result",
      results: "results",
      rotate: "rotate",
      rx: "rx",
      ry: "ry",
      scale: "scale",
      security: "security",
      seed: "seed",
      shaperendering: "shapeRendering",
      "shape-rendering": "shapeRendering",
      slope: "slope",
      spacing: "spacing",
      specularconstant: "specularConstant",
      specularexponent: "specularExponent",
      speed: "speed",
      spreadmethod: "spreadMethod",
      startoffset: "startOffset",
      stddeviation: "stdDeviation",
      stemh: "stemh",
      stemv: "stemv",
      stitchtiles: "stitchTiles",
      stopcolor: "stopColor",
      "stop-color": "stopColor",
      stopopacity: "stopOpacity",
      "stop-opacity": "stopOpacity",
      strikethroughposition: "strikethroughPosition",
      "strikethrough-position": "strikethroughPosition",
      strikethroughthickness: "strikethroughThickness",
      "strikethrough-thickness": "strikethroughThickness",
      string: "string",
      stroke: "stroke",
      strokedasharray: "strokeDasharray",
      "stroke-dasharray": "strokeDasharray",
      strokedashoffset: "strokeDashoffset",
      "stroke-dashoffset": "strokeDashoffset",
      strokelinecap: "strokeLinecap",
      "stroke-linecap": "strokeLinecap",
      strokelinejoin: "strokeLinejoin",
      "stroke-linejoin": "strokeLinejoin",
      strokemiterlimit: "strokeMiterlimit",
      "stroke-miterlimit": "strokeMiterlimit",
      strokewidth: "strokeWidth",
      "stroke-width": "strokeWidth",
      strokeopacity: "strokeOpacity",
      "stroke-opacity": "strokeOpacity",
      suppresscontenteditablewarning: "suppressContentEditableWarning",
      suppresshydrationwarning: "suppressHydrationWarning",
      surfacescale: "surfaceScale",
      systemlanguage: "systemLanguage",
      tablevalues: "tableValues",
      targetx: "targetX",
      targety: "targetY",
      textanchor: "textAnchor",
      "text-anchor": "textAnchor",
      textdecoration: "textDecoration",
      "text-decoration": "textDecoration",
      textlength: "textLength",
      textrendering: "textRendering",
      "text-rendering": "textRendering",
      to: "to",
      transform: "transform",
      typeof: "typeof",
      u1: "u1",
      u2: "u2",
      underlineposition: "underlinePosition",
      "underline-position": "underlinePosition",
      underlinethickness: "underlineThickness",
      "underline-thickness": "underlineThickness",
      unicode: "unicode",
      unicodebidi: "unicodeBidi",
      "unicode-bidi": "unicodeBidi",
      unicoderange: "unicodeRange",
      "unicode-range": "unicodeRange",
      unitsperem: "unitsPerEm",
      "units-per-em": "unitsPerEm",
      unselectable: "unselectable",
      valphabetic: "vAlphabetic",
      "v-alphabetic": "vAlphabetic",
      values: "values",
      vectoreffect: "vectorEffect",
      "vector-effect": "vectorEffect",
      version: "version",
      vertadvy: "vertAdvY",
      "vert-adv-y": "vertAdvY",
      vertoriginx: "vertOriginX",
      "vert-origin-x": "vertOriginX",
      vertoriginy: "vertOriginY",
      "vert-origin-y": "vertOriginY",
      vhanging: "vHanging",
      "v-hanging": "vHanging",
      videographic: "vIdeographic",
      "v-ideographic": "vIdeographic",
      viewbox: "viewBox",
      viewtarget: "viewTarget",
      visibility: "visibility",
      vmathematical: "vMathematical",
      "v-mathematical": "vMathematical",
      vocab: "vocab",
      widths: "widths",
      wordspacing: "wordSpacing",
      "word-spacing": "wordSpacing",
      writingmode: "writingMode",
      "writing-mode": "writingMode",
      x1: "x1",
      x2: "x2",
      x: "x",
      xchannelselector: "xChannelSelector",
      xheight: "xHeight",
      "x-height": "xHeight",
      xlinkactuate: "xlinkActuate",
      "xlink:actuate": "xlinkActuate",
      xlinkarcrole: "xlinkArcrole",
      "xlink:arcrole": "xlinkArcrole",
      xlinkhref: "xlinkHref",
      "xlink:href": "xlinkHref",
      xlinkrole: "xlinkRole",
      "xlink:role": "xlinkRole",
      xlinkshow: "xlinkShow",
      "xlink:show": "xlinkShow",
      xlinktitle: "xlinkTitle",
      "xlink:title": "xlinkTitle",
      xlinktype: "xlinkType",
      "xlink:type": "xlinkType",
      xmlbase: "xmlBase",
      "xml:base": "xmlBase",
      xmllang: "xmlLang",
      "xml:lang": "xmlLang",
      xmlns: "xmlns",
      "xml:space": "xmlSpace",
      xmlnsxlink: "xmlnsXlink",
      "xmlns:xlink": "xmlnsXlink",
      xmlspace: "xmlSpace",
      y1: "y1",
      y2: "y2",
      y: "y",
      ychannelselector: "yChannelSelector",
      z: "z",
      zoomandpan: "zoomAndPan"
    }, fc = {
      "aria-current": 0,
      // state
      "aria-description": 0,
      "aria-details": 0,
      "aria-disabled": 0,
      // state
      "aria-hidden": 0,
      // state
      "aria-invalid": 0,
      // state
      "aria-keyshortcuts": 0,
      "aria-label": 0,
      "aria-roledescription": 0,
      // Widget Attributes
      "aria-autocomplete": 0,
      "aria-checked": 0,
      "aria-expanded": 0,
      "aria-haspopup": 0,
      "aria-level": 0,
      "aria-modal": 0,
      "aria-multiline": 0,
      "aria-multiselectable": 0,
      "aria-orientation": 0,
      "aria-placeholder": 0,
      "aria-pressed": 0,
      "aria-readonly": 0,
      "aria-required": 0,
      "aria-selected": 0,
      "aria-sort": 0,
      "aria-valuemax": 0,
      "aria-valuemin": 0,
      "aria-valuenow": 0,
      "aria-valuetext": 0,
      // Live Region Attributes
      "aria-atomic": 0,
      "aria-busy": 0,
      "aria-live": 0,
      "aria-relevant": 0,
      // Drag-and-Drop Attributes
      "aria-dropeffect": 0,
      "aria-grabbed": 0,
      // Relationship Attributes
      "aria-activedescendant": 0,
      "aria-colcount": 0,
      "aria-colindex": 0,
      "aria-colspan": 0,
      "aria-controls": 0,
      "aria-describedby": 0,
      "aria-errormessage": 0,
      "aria-flowto": 0,
      "aria-labelledby": 0,
      "aria-owns": 0,
      "aria-posinset": 0,
      "aria-rowcount": 0,
      "aria-rowindex": 0,
      "aria-rowspan": 0,
      "aria-setsize": 0
    }, io = {}, ay = new RegExp("^(aria)-[" + ne + "]*$"), lo = new RegExp("^(aria)[A-Z][" + ne + "]*$");
    function ld(e, t) {
      {
        if (br.call(io, t) && io[t])
          return !0;
        if (lo.test(t)) {
          var a = "aria-" + t.slice(4).toLowerCase(), i = fc.hasOwnProperty(a) ? a : null;
          if (i == null)
            return S("Invalid ARIA attribute `%s`. ARIA attributes follow the pattern aria-* and must be lowercase.", t), io[t] = !0, !0;
          if (t !== i)
            return S("Invalid ARIA attribute `%s`. Did you mean `%s`?", t, i), io[t] = !0, !0;
        }
        if (ay.test(t)) {
          var u = t.toLowerCase(), s = fc.hasOwnProperty(u) ? u : null;
          if (s == null)
            return io[t] = !0, !1;
          if (t !== s)
            return S("Unknown ARIA attribute `%s`. Did you mean `%s`?", t, s), io[t] = !0, !0;
        }
      }
      return !0;
    }
    function ts(e, t) {
      {
        var a = [];
        for (var i in t) {
          var u = ld(e, i);
          u || a.push(i);
        }
        var s = a.map(function(f) {
          return "`" + f + "`";
        }).join(", ");
        a.length === 1 ? S("Invalid aria prop %s on <%s> tag. For details, see https://reactjs.org/link/invalid-aria-props", s, e) : a.length > 1 && S("Invalid aria props %s on <%s> tag. For details, see https://reactjs.org/link/invalid-aria-props", s, e);
      }
    }
    function ud(e, t) {
      Rl(e, t) || ts(e, t);
    }
    var od = !1;
    function dc(e, t) {
      {
        if (e !== "input" && e !== "textarea" && e !== "select")
          return;
        t != null && t.value === null && !od && (od = !0, e === "select" && t.multiple ? S("`value` prop on `%s` should not be null. Consider using an empty array when `multiple` is set to `true` to clear the component or `undefined` for uncontrolled components.", e) : S("`value` prop on `%s` should not be null. Consider using an empty string to clear the component or `undefined` for uncontrolled components.", e));
      }
    }
    var su = function() {
    };
    {
      var lr = {}, sd = /^on./, pc = /^on[^A-Z]/, Cv = new RegExp("^(aria)-[" + ne + "]*$"), Rv = new RegExp("^(aria)[A-Z][" + ne + "]*$");
      su = function(e, t, a, i) {
        if (br.call(lr, t) && lr[t])
          return !0;
        var u = t.toLowerCase();
        if (u === "onfocusin" || u === "onfocusout")
          return S("React uses onFocus and onBlur instead of onFocusIn and onFocusOut. All React events are normalized to bubble, so onFocusIn and onFocusOut are not needed/supported by React."), lr[t] = !0, !0;
        if (i != null) {
          var s = i.registrationNameDependencies, f = i.possibleRegistrationNames;
          if (s.hasOwnProperty(t))
            return !0;
          var p = f.hasOwnProperty(u) ? f[u] : null;
          if (p != null)
            return S("Invalid event handler property `%s`. Did you mean `%s`?", t, p), lr[t] = !0, !0;
          if (sd.test(t))
            return S("Unknown event handler property `%s`. It will be ignored.", t), lr[t] = !0, !0;
        } else if (sd.test(t))
          return pc.test(t) && S("Invalid event handler property `%s`. React events use the camelCase naming convention, for example `onClick`.", t), lr[t] = !0, !0;
        if (Cv.test(t) || Rv.test(t))
          return !0;
        if (u === "innerhtml")
          return S("Directly setting property `innerHTML` is not permitted. For more information, lookup documentation on `dangerouslySetInnerHTML`."), lr[t] = !0, !0;
        if (u === "aria")
          return S("The `aria` attribute is reserved for future use in React. Pass individual `aria-` attributes instead."), lr[t] = !0, !0;
        if (u === "is" && a !== null && a !== void 0 && typeof a != "string")
          return S("Received a `%s` for a string attribute `is`. If this is expected, cast the value to a string.", typeof a), lr[t] = !0, !0;
        if (typeof a == "number" && isNaN(a))
          return S("Received NaN for the `%s` attribute. If this is expected, cast the value to a string.", t), lr[t] = !0, !0;
        var v = rn(t), y = v !== null && v.type === In;
        if (es.hasOwnProperty(u)) {
          var g = es[u];
          if (g !== t)
            return S("Invalid DOM property `%s`. Did you mean `%s`?", t, g), lr[t] = !0, !0;
        } else if (!y && t !== u)
          return S("React does not recognize the `%s` prop on a DOM element. If you intentionally want it to appear in the DOM as a custom attribute, spell it as lowercase `%s` instead. If you accidentally passed it from a parent component, remove it from the DOM element.", t, u), lr[t] = !0, !0;
        return typeof a == "boolean" && on(t, a, v, !1) ? (a ? S('Received `%s` for a non-boolean attribute `%s`.\n\nIf you want to write it to the DOM, pass a string instead: %s="%s" or %s={value.toString()}.', a, t, t, a, t) : S('Received `%s` for a non-boolean attribute `%s`.\n\nIf you want to write it to the DOM, pass a string instead: %s="%s" or %s={value.toString()}.\n\nIf you used to conditionally omit it with %s={condition && value}, pass %s={condition ? value : undefined} instead.', a, t, t, a, t, t, t), lr[t] = !0, !0) : y ? !0 : on(t, a, v, !1) ? (lr[t] = !0, !1) : ((a === "false" || a === "true") && v !== null && v.type === Nn && (S("Received the string `%s` for the boolean attribute `%s`. %s Did you mean %s={%s}?", a, t, a === "false" ? "The browser will interpret it as a truthy value." : 'Although this works, it will not work as expected if you pass the string "false".', t, a), lr[t] = !0), !0);
      };
    }
    var Tv = function(e, t, a) {
      {
        var i = [];
        for (var u in t) {
          var s = su(e, u, t[u], a);
          s || i.push(u);
        }
        var f = i.map(function(p) {
          return "`" + p + "`";
        }).join(", ");
        i.length === 1 ? S("Invalid value for prop %s on <%s> tag. Either remove it from the element, or pass a string or number value to keep it in the DOM. For details, see https://reactjs.org/link/attribute-behavior ", f, e) : i.length > 1 && S("Invalid values for props %s on <%s> tag. Either remove them from the element, or pass a string or number value to keep them in the DOM. For details, see https://reactjs.org/link/attribute-behavior ", f, e);
      }
    };
    function wv(e, t, a) {
      Rl(e, t) || Tv(e, t, a);
    }
    var cd = 1, vc = 2, _a = 4, fd = cd | vc | _a, cu = null;
    function iy(e) {
      cu !== null && S("Expected currently replaying event to be null. This error is likely caused by a bug in React. Please file an issue."), cu = e;
    }
    function ly() {
      cu === null && S("Expected currently replaying event to not be null. This error is likely caused by a bug in React. Please file an issue."), cu = null;
    }
    function ns(e) {
      return e === cu;
    }
    function dd(e) {
      var t = e.target || e.srcElement || window;
      return t.correspondingUseElement && (t = t.correspondingUseElement), t.nodeType === Ii ? t.parentNode : t;
    }
    var hc = null, fu = null, Vt = null;
    function mc(e) {
      var t = ko(e);
      if (t) {
        if (typeof hc != "function")
          throw new Error("setRestoreImplementation() needs to be called to handle a target for controlled events. This error is likely caused by a bug in React. Please file an issue.");
        var a = t.stateNode;
        if (a) {
          var i = Mh(a);
          hc(t.stateNode, t.type, i);
        }
      }
    }
    function yc(e) {
      hc = e;
    }
    function uo(e) {
      fu ? Vt ? Vt.push(e) : Vt = [e] : fu = e;
    }
    function bv() {
      return fu !== null || Vt !== null;
    }
    function gc() {
      if (fu) {
        var e = fu, t = Vt;
        if (fu = null, Vt = null, mc(e), t)
          for (var a = 0; a < t.length; a++)
            mc(t[a]);
      }
    }
    var oo = function(e, t) {
      return e(t);
    }, rs = function() {
    }, Tl = !1;
    function xv() {
      var e = bv();
      e && (rs(), gc());
    }
    function _v(e, t, a) {
      if (Tl)
        return e(t, a);
      Tl = !0;
      try {
        return oo(e, t, a);
      } finally {
        Tl = !1, xv();
      }
    }
    function uy(e, t, a) {
      oo = e, rs = a;
    }
    function kv(e) {
      return e === "button" || e === "input" || e === "select" || e === "textarea";
    }
    function Sc(e, t, a) {
      switch (e) {
        case "onClick":
        case "onClickCapture":
        case "onDoubleClick":
        case "onDoubleClickCapture":
        case "onMouseDown":
        case "onMouseDownCapture":
        case "onMouseMove":
        case "onMouseMoveCapture":
        case "onMouseUp":
        case "onMouseUpCapture":
        case "onMouseEnter":
          return !!(a.disabled && kv(t));
        default:
          return !1;
      }
    }
    function wl(e, t) {
      var a = e.stateNode;
      if (a === null)
        return null;
      var i = Mh(a);
      if (i === null)
        return null;
      var u = i[t];
      if (Sc(t, e.type, i))
        return null;
      if (u && typeof u != "function")
        throw new Error("Expected `" + t + "` listener to be a function, instead got a value of `" + typeof u + "` type.");
      return u;
    }
    var as = !1;
    if (On)
      try {
        var du = {};
        Object.defineProperty(du, "passive", {
          get: function() {
            as = !0;
          }
        }), window.addEventListener("test", du, du), window.removeEventListener("test", du, du);
      } catch {
        as = !1;
      }
    function Ec(e, t, a, i, u, s, f, p, v) {
      var y = Array.prototype.slice.call(arguments, 3);
      try {
        t.apply(a, y);
      } catch (g) {
        this.onError(g);
      }
    }
    var Cc = Ec;
    if (typeof window < "u" && typeof window.dispatchEvent == "function" && typeof document < "u" && typeof document.createEvent == "function") {
      var pd = document.createElement("react");
      Cc = function(t, a, i, u, s, f, p, v, y) {
        if (typeof document > "u" || document === null)
          throw new Error("The `document` global was defined when React was initialized, but is not defined anymore. This can happen in a test environment if a component schedules an update from an asynchronous callback, but the test has already finished running. To solve this, you can either unmount the component at the end of your test (and ensure that any asynchronous operations get canceled in `componentWillUnmount`), or you can change the test itself to be asynchronous.");
        var g = document.createEvent("Event"), x = !1, w = !0, U = window.event, j = Object.getOwnPropertyDescriptor(window, "event");
        function P() {
          pd.removeEventListener(V, je, !1), typeof window.event < "u" && window.hasOwnProperty("event") && (window.event = U);
        }
        var se = Array.prototype.slice.call(arguments, 3);
        function je() {
          x = !0, P(), a.apply(i, se), w = !1;
        }
        var De, _t = !1, Ct = !1;
        function N(L) {
          if (De = L.error, _t = !0, De === null && L.colno === 0 && L.lineno === 0 && (Ct = !0), L.defaultPrevented && De != null && typeof De == "object")
            try {
              De._suppressLogging = !0;
            } catch {
            }
        }
        var V = "react-" + (t || "invokeguardedcallback");
        if (window.addEventListener("error", N), pd.addEventListener(V, je, !1), g.initEvent(V, !1, !1), pd.dispatchEvent(g), j && Object.defineProperty(window, "event", j), x && w && (_t ? Ct && (De = new Error("A cross-origin error was thrown. React doesn't have access to the actual error object in development. See https://reactjs.org/link/crossorigin-error for more information.")) : De = new Error(`An error was thrown inside one of your components, but React doesn't know what it was. This is likely due to browser flakiness. React does its best to preserve the "Pause on exceptions" behavior of the DevTools, which requires some DEV-mode only tricks. It's possible that these don't work in your browser. Try triggering the error in production mode, or switching to a modern browser. If you suspect that this is actually an issue with React, please file an issue.`), this.onError(De)), window.removeEventListener("error", N), !x)
          return P(), Ec.apply(this, arguments);
      };
    }
    var Dv = Cc, so = !1, Rc = null, co = !1, Si = null, Ov = {
      onError: function(e) {
        so = !0, Rc = e;
      }
    };
    function bl(e, t, a, i, u, s, f, p, v) {
      so = !1, Rc = null, Dv.apply(Ov, arguments);
    }
    function Ei(e, t, a, i, u, s, f, p, v) {
      if (bl.apply(this, arguments), so) {
        var y = ls();
        co || (co = !0, Si = y);
      }
    }
    function is() {
      if (co) {
        var e = Si;
        throw co = !1, Si = null, e;
      }
    }
    function $i() {
      return so;
    }
    function ls() {
      if (so) {
        var e = Rc;
        return so = !1, Rc = null, e;
      } else
        throw new Error("clearCaughtError was called but no error was captured. This error is likely caused by a bug in React. Please file an issue.");
    }
    function fo(e) {
      return e._reactInternals;
    }
    function oy(e) {
      return e._reactInternals !== void 0;
    }
    function pu(e, t) {
      e._reactInternals = t;
    }
    var Me = (
      /*                      */
      0
    ), ti = (
      /*                */
      1
    ), mn = (
      /*                    */
      2
    ), wt = (
      /*                       */
      4
    ), ka = (
      /*                */
      16
    ), Da = (
      /*                 */
      32
    ), un = (
      /*                     */
      64
    ), Oe = (
      /*                   */
      128
    ), Cr = (
      /*            */
      256
    ), En = (
      /*                          */
      512
    ), $n = (
      /*                     */
      1024
    ), Wr = (
      /*                      */
      2048
    ), Gr = (
      /*                    */
      4096
    ), Mn = (
      /*                   */
      8192
    ), po = (
      /*             */
      16384
    ), Nv = (
      /*               */
      32767
    ), us = (
      /*                   */
      32768
    ), Xn = (
      /*                */
      65536
    ), Tc = (
      /* */
      131072
    ), Ci = (
      /*                       */
      1048576
    ), vo = (
      /*                    */
      2097152
    ), Qi = (
      /*                 */
      4194304
    ), wc = (
      /*                */
      8388608
    ), xl = (
      /*               */
      16777216
    ), Ri = (
      /*              */
      33554432
    ), _l = (
      // TODO: Remove Update flag from before mutation phase by re-landing Visibility
      // flag logic (see #20043)
      wt | $n | 0
    ), kl = mn | wt | ka | Da | En | Gr | Mn, Dl = wt | un | En | Mn, Wi = Wr | ka, Un = Qi | wc | vo, Oa = k.ReactCurrentOwner;
    function da(e) {
      var t = e, a = e;
      if (e.alternate)
        for (; t.return; )
          t = t.return;
      else {
        var i = t;
        do
          t = i, (t.flags & (mn | Gr)) !== Me && (a = t.return), i = t.return;
        while (i);
      }
      return t.tag === ee ? a : null;
    }
    function Ti(e) {
      if (e.tag === Ne) {
        var t = e.memoizedState;
        if (t === null) {
          var a = e.alternate;
          a !== null && (t = a.memoizedState);
        }
        if (t !== null)
          return t.dehydrated;
      }
      return null;
    }
    function wi(e) {
      return e.tag === ee ? e.stateNode.containerInfo : null;
    }
    function vu(e) {
      return da(e) === e;
    }
    function Lv(e) {
      {
        var t = Oa.current;
        if (t !== null && t.tag === te) {
          var a = t, i = a.stateNode;
          i._warnedAboutRefsInRender || S("%s is accessing isMounted inside its render() function. render() should be a pure function of props and state. It should never access something that requires stale data from the previous render, such as refs. Move this logic to componentDidMount and componentDidUpdate instead.", qe(a) || "A component"), i._warnedAboutRefsInRender = !0;
        }
      }
      var u = fo(e);
      return u ? da(u) === u : !1;
    }
    function bc(e) {
      if (da(e) !== e)
        throw new Error("Unable to find node on an unmounted component.");
    }
    function xc(e) {
      var t = e.alternate;
      if (!t) {
        var a = da(e);
        if (a === null)
          throw new Error("Unable to find node on an unmounted component.");
        return a !== e ? null : e;
      }
      for (var i = e, u = t; ; ) {
        var s = i.return;
        if (s === null)
          break;
        var f = s.alternate;
        if (f === null) {
          var p = s.return;
          if (p !== null) {
            i = u = p;
            continue;
          }
          break;
        }
        if (s.child === f.child) {
          for (var v = s.child; v; ) {
            if (v === i)
              return bc(s), e;
            if (v === u)
              return bc(s), t;
            v = v.sibling;
          }
          throw new Error("Unable to find node on an unmounted component.");
        }
        if (i.return !== u.return)
          i = s, u = f;
        else {
          for (var y = !1, g = s.child; g; ) {
            if (g === i) {
              y = !0, i = s, u = f;
              break;
            }
            if (g === u) {
              y = !0, u = s, i = f;
              break;
            }
            g = g.sibling;
          }
          if (!y) {
            for (g = f.child; g; ) {
              if (g === i) {
                y = !0, i = f, u = s;
                break;
              }
              if (g === u) {
                y = !0, u = f, i = s;
                break;
              }
              g = g.sibling;
            }
            if (!y)
              throw new Error("Child was not found in either parent set. This indicates a bug in React related to the return pointer. Please file an issue.");
          }
        }
        if (i.alternate !== u)
          throw new Error("Return fibers should always be each others' alternates. This error is likely caused by a bug in React. Please file an issue.");
      }
      if (i.tag !== ee)
        throw new Error("Unable to find node on an unmounted component.");
      return i.stateNode.current === i ? e : t;
    }
    function qr(e) {
      var t = xc(e);
      return t !== null ? Kr(t) : null;
    }
    function Kr(e) {
      if (e.tag === ae || e.tag === fe)
        return e;
      for (var t = e.child; t !== null; ) {
        var a = Kr(t);
        if (a !== null)
          return a;
        t = t.sibling;
      }
      return null;
    }
    function dn(e) {
      var t = xc(e);
      return t !== null ? Na(t) : null;
    }
    function Na(e) {
      if (e.tag === ae || e.tag === fe)
        return e;
      for (var t = e.child; t !== null; ) {
        if (t.tag !== ge) {
          var a = Na(t);
          if (a !== null)
            return a;
        }
        t = t.sibling;
      }
      return null;
    }
    var vd = F.unstable_scheduleCallback, Mv = F.unstable_cancelCallback, hd = F.unstable_shouldYield, md = F.unstable_requestPaint, Qn = F.unstable_now, _c = F.unstable_getCurrentPriorityLevel, os = F.unstable_ImmediatePriority, Ol = F.unstable_UserBlockingPriority, Gi = F.unstable_NormalPriority, sy = F.unstable_LowPriority, hu = F.unstable_IdlePriority, kc = F.unstable_yieldValue, Uv = F.unstable_setDisableYieldValue, mu = null, wn = null, oe = null, pa = !1, Xr = typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u";
    function ho(e) {
      if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u")
        return !1;
      var t = __REACT_DEVTOOLS_GLOBAL_HOOK__;
      if (t.isDisabled)
        return !0;
      if (!t.supportsFiber)
        return S("The installed version of React DevTools is too old and will not work with the current version of React. Please update React DevTools. https://reactjs.org/link/react-devtools"), !0;
      try {
        $e && (e = lt({}, e, {
          getLaneLabelMap: yu,
          injectProfilingHooks: La
        })), mu = t.inject(e), wn = t;
      } catch (a) {
        S("React instrumentation encountered an error: %s.", a);
      }
      return !!t.checkDCE;
    }
    function yd(e, t) {
      if (wn && typeof wn.onScheduleFiberRoot == "function")
        try {
          wn.onScheduleFiberRoot(mu, e, t);
        } catch (a) {
          pa || (pa = !0, S("React instrumentation encountered an error: %s", a));
        }
    }
    function gd(e, t) {
      if (wn && typeof wn.onCommitFiberRoot == "function")
        try {
          var a = (e.current.flags & Oe) === Oe;
          if (Be) {
            var i;
            switch (t) {
              case Nr:
                i = os;
                break;
              case xi:
                i = Ol;
                break;
              case Ma:
                i = Gi;
                break;
              case Ua:
                i = hu;
                break;
              default:
                i = Gi;
                break;
            }
            wn.onCommitFiberRoot(mu, e, i, a);
          }
        } catch (u) {
          pa || (pa = !0, S("React instrumentation encountered an error: %s", u));
        }
    }
    function Sd(e) {
      if (wn && typeof wn.onPostCommitFiberRoot == "function")
        try {
          wn.onPostCommitFiberRoot(mu, e);
        } catch (t) {
          pa || (pa = !0, S("React instrumentation encountered an error: %s", t));
        }
    }
    function Ed(e) {
      if (wn && typeof wn.onCommitFiberUnmount == "function")
        try {
          wn.onCommitFiberUnmount(mu, e);
        } catch (t) {
          pa || (pa = !0, S("React instrumentation encountered an error: %s", t));
        }
    }
    function yn(e) {
      if (typeof kc == "function" && (Uv(e), Te(e)), wn && typeof wn.setStrictMode == "function")
        try {
          wn.setStrictMode(mu, e);
        } catch (t) {
          pa || (pa = !0, S("React instrumentation encountered an error: %s", t));
        }
    }
    function La(e) {
      oe = e;
    }
    function yu() {
      {
        for (var e = /* @__PURE__ */ new Map(), t = 1, a = 0; a < Eu; a++) {
          var i = Fv(t);
          e.set(t, i), t *= 2;
        }
        return e;
      }
    }
    function Cd(e) {
      oe !== null && typeof oe.markCommitStarted == "function" && oe.markCommitStarted(e);
    }
    function Rd() {
      oe !== null && typeof oe.markCommitStopped == "function" && oe.markCommitStopped();
    }
    function va(e) {
      oe !== null && typeof oe.markComponentRenderStarted == "function" && oe.markComponentRenderStarted(e);
    }
    function ha() {
      oe !== null && typeof oe.markComponentRenderStopped == "function" && oe.markComponentRenderStopped();
    }
    function Td(e) {
      oe !== null && typeof oe.markComponentPassiveEffectMountStarted == "function" && oe.markComponentPassiveEffectMountStarted(e);
    }
    function zv() {
      oe !== null && typeof oe.markComponentPassiveEffectMountStopped == "function" && oe.markComponentPassiveEffectMountStopped();
    }
    function qi(e) {
      oe !== null && typeof oe.markComponentPassiveEffectUnmountStarted == "function" && oe.markComponentPassiveEffectUnmountStarted(e);
    }
    function Nl() {
      oe !== null && typeof oe.markComponentPassiveEffectUnmountStopped == "function" && oe.markComponentPassiveEffectUnmountStopped();
    }
    function Dc(e) {
      oe !== null && typeof oe.markComponentLayoutEffectMountStarted == "function" && oe.markComponentLayoutEffectMountStarted(e);
    }
    function Av() {
      oe !== null && typeof oe.markComponentLayoutEffectMountStopped == "function" && oe.markComponentLayoutEffectMountStopped();
    }
    function ss(e) {
      oe !== null && typeof oe.markComponentLayoutEffectUnmountStarted == "function" && oe.markComponentLayoutEffectUnmountStarted(e);
    }
    function wd() {
      oe !== null && typeof oe.markComponentLayoutEffectUnmountStopped == "function" && oe.markComponentLayoutEffectUnmountStopped();
    }
    function cs(e, t, a) {
      oe !== null && typeof oe.markComponentErrored == "function" && oe.markComponentErrored(e, t, a);
    }
    function bi(e, t, a) {
      oe !== null && typeof oe.markComponentSuspended == "function" && oe.markComponentSuspended(e, t, a);
    }
    function fs(e) {
      oe !== null && typeof oe.markLayoutEffectsStarted == "function" && oe.markLayoutEffectsStarted(e);
    }
    function ds() {
      oe !== null && typeof oe.markLayoutEffectsStopped == "function" && oe.markLayoutEffectsStopped();
    }
    function gu(e) {
      oe !== null && typeof oe.markPassiveEffectsStarted == "function" && oe.markPassiveEffectsStarted(e);
    }
    function bd() {
      oe !== null && typeof oe.markPassiveEffectsStopped == "function" && oe.markPassiveEffectsStopped();
    }
    function Su(e) {
      oe !== null && typeof oe.markRenderStarted == "function" && oe.markRenderStarted(e);
    }
    function jv() {
      oe !== null && typeof oe.markRenderYielded == "function" && oe.markRenderYielded();
    }
    function Oc() {
      oe !== null && typeof oe.markRenderStopped == "function" && oe.markRenderStopped();
    }
    function gn(e) {
      oe !== null && typeof oe.markRenderScheduled == "function" && oe.markRenderScheduled(e);
    }
    function Nc(e, t) {
      oe !== null && typeof oe.markForceUpdateScheduled == "function" && oe.markForceUpdateScheduled(e, t);
    }
    function ps(e, t) {
      oe !== null && typeof oe.markStateUpdateScheduled == "function" && oe.markStateUpdateScheduled(e, t);
    }
    var Ue = (
      /*                         */
      0
    ), ht = (
      /*                 */
      1
    ), Ut = (
      /*                    */
      2
    ), Xt = (
      /*               */
      8
    ), zt = (
      /*              */
      16
    ), zn = Math.clz32 ? Math.clz32 : vs, Jn = Math.log, Lc = Math.LN2;
    function vs(e) {
      var t = e >>> 0;
      return t === 0 ? 32 : 31 - (Jn(t) / Lc | 0) | 0;
    }
    var Eu = 31, Q = (
      /*                        */
      0
    ), Nt = (
      /*                          */
      0
    ), Ye = (
      /*                        */
      1
    ), Ll = (
      /*    */
      2
    ), ni = (
      /*             */
      4
    ), Rr = (
      /*            */
      8
    ), bn = (
      /*                     */
      16
    ), Ki = (
      /*                */
      32
    ), Ml = (
      /*                       */
      4194240
    ), Cu = (
      /*                        */
      64
    ), Mc = (
      /*                        */
      128
    ), Uc = (
      /*                        */
      256
    ), zc = (
      /*                        */
      512
    ), Ac = (
      /*                        */
      1024
    ), jc = (
      /*                        */
      2048
    ), Fc = (
      /*                        */
      4096
    ), Hc = (
      /*                        */
      8192
    ), Pc = (
      /*                        */
      16384
    ), Ru = (
      /*                       */
      32768
    ), Vc = (
      /*                       */
      65536
    ), mo = (
      /*                       */
      131072
    ), yo = (
      /*                       */
      262144
    ), Bc = (
      /*                       */
      524288
    ), hs = (
      /*                       */
      1048576
    ), Ic = (
      /*                       */
      2097152
    ), ms = (
      /*                            */
      130023424
    ), Tu = (
      /*                             */
      4194304
    ), Yc = (
      /*                             */
      8388608
    ), ys = (
      /*                             */
      16777216
    ), $c = (
      /*                             */
      33554432
    ), Qc = (
      /*                             */
      67108864
    ), xd = Tu, gs = (
      /*          */
      134217728
    ), _d = (
      /*                          */
      268435455
    ), Ss = (
      /*               */
      268435456
    ), wu = (
      /*                        */
      536870912
    ), Jr = (
      /*                   */
      1073741824
    );
    function Fv(e) {
      {
        if (e & Ye)
          return "Sync";
        if (e & Ll)
          return "InputContinuousHydration";
        if (e & ni)
          return "InputContinuous";
        if (e & Rr)
          return "DefaultHydration";
        if (e & bn)
          return "Default";
        if (e & Ki)
          return "TransitionHydration";
        if (e & Ml)
          return "Transition";
        if (e & ms)
          return "Retry";
        if (e & gs)
          return "SelectiveHydration";
        if (e & Ss)
          return "IdleHydration";
        if (e & wu)
          return "Idle";
        if (e & Jr)
          return "Offscreen";
      }
    }
    var tn = -1, bu = Cu, Wc = Tu;
    function Es(e) {
      switch (Ul(e)) {
        case Ye:
          return Ye;
        case Ll:
          return Ll;
        case ni:
          return ni;
        case Rr:
          return Rr;
        case bn:
          return bn;
        case Ki:
          return Ki;
        case Cu:
        case Mc:
        case Uc:
        case zc:
        case Ac:
        case jc:
        case Fc:
        case Hc:
        case Pc:
        case Ru:
        case Vc:
        case mo:
        case yo:
        case Bc:
        case hs:
        case Ic:
          return e & Ml;
        case Tu:
        case Yc:
        case ys:
        case $c:
        case Qc:
          return e & ms;
        case gs:
          return gs;
        case Ss:
          return Ss;
        case wu:
          return wu;
        case Jr:
          return Jr;
        default:
          return S("Should have found matching lanes. This is a bug in React."), e;
      }
    }
    function Gc(e, t) {
      var a = e.pendingLanes;
      if (a === Q)
        return Q;
      var i = Q, u = e.suspendedLanes, s = e.pingedLanes, f = a & _d;
      if (f !== Q) {
        var p = f & ~u;
        if (p !== Q)
          i = Es(p);
        else {
          var v = f & s;
          v !== Q && (i = Es(v));
        }
      } else {
        var y = a & ~u;
        y !== Q ? i = Es(y) : s !== Q && (i = Es(s));
      }
      if (i === Q)
        return Q;
      if (t !== Q && t !== i && // If we already suspended with a delay, then interrupting is fine. Don't
      // bother waiting until the root is complete.
      (t & u) === Q) {
        var g = Ul(i), x = Ul(t);
        if (
          // Tests whether the next lane is equal or lower priority than the wip
          // one. This works because the bits decrease in priority as you go left.
          g >= x || // Default priority updates should not interrupt transition updates. The
          // only difference between default updates and transition updates is that
          // default updates do not support refresh transitions.
          g === bn && (x & Ml) !== Q
        )
          return t;
      }
      (i & ni) !== Q && (i |= a & bn);
      var w = e.entangledLanes;
      if (w !== Q)
        for (var U = e.entanglements, j = i & w; j > 0; ) {
          var P = An(j), se = 1 << P;
          i |= U[P], j &= ~se;
        }
      return i;
    }
    function ri(e, t) {
      for (var a = e.eventTimes, i = tn; t > 0; ) {
        var u = An(t), s = 1 << u, f = a[u];
        f > i && (i = f), t &= ~s;
      }
      return i;
    }
    function kd(e, t) {
      switch (e) {
        case Ye:
        case Ll:
        case ni:
          return t + 250;
        case Rr:
        case bn:
        case Ki:
        case Cu:
        case Mc:
        case Uc:
        case zc:
        case Ac:
        case jc:
        case Fc:
        case Hc:
        case Pc:
        case Ru:
        case Vc:
        case mo:
        case yo:
        case Bc:
        case hs:
        case Ic:
          return t + 5e3;
        case Tu:
        case Yc:
        case ys:
        case $c:
        case Qc:
          return tn;
        case gs:
        case Ss:
        case wu:
        case Jr:
          return tn;
        default:
          return S("Should have found matching lanes. This is a bug in React."), tn;
      }
    }
    function qc(e, t) {
      for (var a = e.pendingLanes, i = e.suspendedLanes, u = e.pingedLanes, s = e.expirationTimes, f = a; f > 0; ) {
        var p = An(f), v = 1 << p, y = s[p];
        y === tn ? ((v & i) === Q || (v & u) !== Q) && (s[p] = kd(v, t)) : y <= t && (e.expiredLanes |= v), f &= ~v;
      }
    }
    function Hv(e) {
      return Es(e.pendingLanes);
    }
    function Kc(e) {
      var t = e.pendingLanes & ~Jr;
      return t !== Q ? t : t & Jr ? Jr : Q;
    }
    function Pv(e) {
      return (e & Ye) !== Q;
    }
    function Cs(e) {
      return (e & _d) !== Q;
    }
    function xu(e) {
      return (e & ms) === e;
    }
    function Dd(e) {
      var t = Ye | ni | bn;
      return (e & t) === Q;
    }
    function Od(e) {
      return (e & Ml) === e;
    }
    function Xc(e, t) {
      var a = Ll | ni | Rr | bn;
      return (t & a) !== Q;
    }
    function Vv(e, t) {
      return (t & e.expiredLanes) !== Q;
    }
    function Nd(e) {
      return (e & Ml) !== Q;
    }
    function Ld() {
      var e = bu;
      return bu <<= 1, (bu & Ml) === Q && (bu = Cu), e;
    }
    function Bv() {
      var e = Wc;
      return Wc <<= 1, (Wc & ms) === Q && (Wc = Tu), e;
    }
    function Ul(e) {
      return e & -e;
    }
    function Rs(e) {
      return Ul(e);
    }
    function An(e) {
      return 31 - zn(e);
    }
    function ur(e) {
      return An(e);
    }
    function Zr(e, t) {
      return (e & t) !== Q;
    }
    function _u(e, t) {
      return (e & t) === t;
    }
    function at(e, t) {
      return e | t;
    }
    function Ts(e, t) {
      return e & ~t;
    }
    function Md(e, t) {
      return e & t;
    }
    function Iv(e) {
      return e;
    }
    function Yv(e, t) {
      return e !== Nt && e < t ? e : t;
    }
    function ws(e) {
      for (var t = [], a = 0; a < Eu; a++)
        t.push(e);
      return t;
    }
    function go(e, t, a) {
      e.pendingLanes |= t, t !== wu && (e.suspendedLanes = Q, e.pingedLanes = Q);
      var i = e.eventTimes, u = ur(t);
      i[u] = a;
    }
    function $v(e, t) {
      e.suspendedLanes |= t, e.pingedLanes &= ~t;
      for (var a = e.expirationTimes, i = t; i > 0; ) {
        var u = An(i), s = 1 << u;
        a[u] = tn, i &= ~s;
      }
    }
    function Jc(e, t, a) {
      e.pingedLanes |= e.suspendedLanes & t;
    }
    function Ud(e, t) {
      var a = e.pendingLanes & ~t;
      e.pendingLanes = t, e.suspendedLanes = Q, e.pingedLanes = Q, e.expiredLanes &= t, e.mutableReadLanes &= t, e.entangledLanes &= t;
      for (var i = e.entanglements, u = e.eventTimes, s = e.expirationTimes, f = a; f > 0; ) {
        var p = An(f), v = 1 << p;
        i[p] = Q, u[p] = tn, s[p] = tn, f &= ~v;
      }
    }
    function Zc(e, t) {
      for (var a = e.entangledLanes |= t, i = e.entanglements, u = a; u; ) {
        var s = An(u), f = 1 << s;
        // Is this one of the newly entangled lanes?
        f & t | // Is this lane transitively entangled with the newly entangled lanes?
        i[s] & t && (i[s] |= t), u &= ~f;
      }
    }
    function zd(e, t) {
      var a = Ul(t), i;
      switch (a) {
        case ni:
          i = Ll;
          break;
        case bn:
          i = Rr;
          break;
        case Cu:
        case Mc:
        case Uc:
        case zc:
        case Ac:
        case jc:
        case Fc:
        case Hc:
        case Pc:
        case Ru:
        case Vc:
        case mo:
        case yo:
        case Bc:
        case hs:
        case Ic:
        case Tu:
        case Yc:
        case ys:
        case $c:
        case Qc:
          i = Ki;
          break;
        case wu:
          i = Ss;
          break;
        default:
          i = Nt;
          break;
      }
      return (i & (e.suspendedLanes | t)) !== Nt ? Nt : i;
    }
    function bs(e, t, a) {
      if (Xr)
        for (var i = e.pendingUpdatersLaneMap; a > 0; ) {
          var u = ur(a), s = 1 << u, f = i[u];
          f.add(t), a &= ~s;
        }
    }
    function Qv(e, t) {
      if (Xr)
        for (var a = e.pendingUpdatersLaneMap, i = e.memoizedUpdaters; t > 0; ) {
          var u = ur(t), s = 1 << u, f = a[u];
          f.size > 0 && (f.forEach(function(p) {
            var v = p.alternate;
            (v === null || !i.has(v)) && i.add(p);
          }), f.clear()), t &= ~s;
        }
    }
    function Ad(e, t) {
      return null;
    }
    var Nr = Ye, xi = ni, Ma = bn, Ua = wu, xs = Nt;
    function za() {
      return xs;
    }
    function jn(e) {
      xs = e;
    }
    function Wv(e, t) {
      var a = xs;
      try {
        return xs = e, t();
      } finally {
        xs = a;
      }
    }
    function Gv(e, t) {
      return e !== 0 && e < t ? e : t;
    }
    function _s(e, t) {
      return e > t ? e : t;
    }
    function Zn(e, t) {
      return e !== 0 && e < t;
    }
    function qv(e) {
      var t = Ul(e);
      return Zn(Nr, t) ? Zn(xi, t) ? Cs(t) ? Ma : Ua : xi : Nr;
    }
    function ef(e) {
      var t = e.current.memoizedState;
      return t.isDehydrated;
    }
    var ks;
    function Tr(e) {
      ks = e;
    }
    function cy(e) {
      ks(e);
    }
    var me;
    function So(e) {
      me = e;
    }
    var tf;
    function Kv(e) {
      tf = e;
    }
    var Xv;
    function Ds(e) {
      Xv = e;
    }
    var Os;
    function jd(e) {
      Os = e;
    }
    var nf = !1, Ns = [], Xi = null, _i = null, ki = null, xn = /* @__PURE__ */ new Map(), Lr = /* @__PURE__ */ new Map(), Mr = [], Jv = [
      "mousedown",
      "mouseup",
      "touchcancel",
      "touchend",
      "touchstart",
      "auxclick",
      "dblclick",
      "pointercancel",
      "pointerdown",
      "pointerup",
      "dragend",
      "dragstart",
      "drop",
      "compositionend",
      "compositionstart",
      "keydown",
      "keypress",
      "keyup",
      "input",
      "textInput",
      // Intentionally camelCase
      "copy",
      "cut",
      "paste",
      "click",
      "change",
      "contextmenu",
      "reset",
      "submit"
    ];
    function Zv(e) {
      return Jv.indexOf(e) > -1;
    }
    function ai(e, t, a, i, u) {
      return {
        blockedOn: e,
        domEventName: t,
        eventSystemFlags: a,
        nativeEvent: u,
        targetContainers: [i]
      };
    }
    function Fd(e, t) {
      switch (e) {
        case "focusin":
        case "focusout":
          Xi = null;
          break;
        case "dragenter":
        case "dragleave":
          _i = null;
          break;
        case "mouseover":
        case "mouseout":
          ki = null;
          break;
        case "pointerover":
        case "pointerout": {
          var a = t.pointerId;
          xn.delete(a);
          break;
        }
        case "gotpointercapture":
        case "lostpointercapture": {
          var i = t.pointerId;
          Lr.delete(i);
          break;
        }
      }
    }
    function ea(e, t, a, i, u, s) {
      if (e === null || e.nativeEvent !== s) {
        var f = ai(t, a, i, u, s);
        if (t !== null) {
          var p = ko(t);
          p !== null && me(p);
        }
        return f;
      }
      e.eventSystemFlags |= i;
      var v = e.targetContainers;
      return u !== null && v.indexOf(u) === -1 && v.push(u), e;
    }
    function fy(e, t, a, i, u) {
      switch (t) {
        case "focusin": {
          var s = u;
          return Xi = ea(Xi, e, t, a, i, s), !0;
        }
        case "dragenter": {
          var f = u;
          return _i = ea(_i, e, t, a, i, f), !0;
        }
        case "mouseover": {
          var p = u;
          return ki = ea(ki, e, t, a, i, p), !0;
        }
        case "pointerover": {
          var v = u, y = v.pointerId;
          return xn.set(y, ea(xn.get(y) || null, e, t, a, i, v)), !0;
        }
        case "gotpointercapture": {
          var g = u, x = g.pointerId;
          return Lr.set(x, ea(Lr.get(x) || null, e, t, a, i, g)), !0;
        }
      }
      return !1;
    }
    function Hd(e) {
      var t = Is(e.target);
      if (t !== null) {
        var a = da(t);
        if (a !== null) {
          var i = a.tag;
          if (i === Ne) {
            var u = Ti(a);
            if (u !== null) {
              e.blockedOn = u, Os(e.priority, function() {
                tf(a);
              });
              return;
            }
          } else if (i === ee) {
            var s = a.stateNode;
            if (ef(s)) {
              e.blockedOn = wi(a);
              return;
            }
          }
        }
      }
      e.blockedOn = null;
    }
    function eh(e) {
      for (var t = Xv(), a = {
        blockedOn: null,
        target: e,
        priority: t
      }, i = 0; i < Mr.length && Zn(t, Mr[i].priority); i++)
        ;
      Mr.splice(i, 0, a), i === 0 && Hd(a);
    }
    function Ls(e) {
      if (e.blockedOn !== null)
        return !1;
      for (var t = e.targetContainers; t.length > 0; ) {
        var a = t[0], i = Co(e.domEventName, e.eventSystemFlags, a, e.nativeEvent);
        if (i === null) {
          var u = e.nativeEvent, s = new u.constructor(u.type, u);
          iy(s), u.target.dispatchEvent(s), ly();
        } else {
          var f = ko(i);
          return f !== null && me(f), e.blockedOn = i, !1;
        }
        t.shift();
      }
      return !0;
    }
    function Pd(e, t, a) {
      Ls(e) && a.delete(t);
    }
    function dy() {
      nf = !1, Xi !== null && Ls(Xi) && (Xi = null), _i !== null && Ls(_i) && (_i = null), ki !== null && Ls(ki) && (ki = null), xn.forEach(Pd), Lr.forEach(Pd);
    }
    function zl(e, t) {
      e.blockedOn === t && (e.blockedOn = null, nf || (nf = !0, F.unstable_scheduleCallback(F.unstable_NormalPriority, dy)));
    }
    function ku(e) {
      if (Ns.length > 0) {
        zl(Ns[0], e);
        for (var t = 1; t < Ns.length; t++) {
          var a = Ns[t];
          a.blockedOn === e && (a.blockedOn = null);
        }
      }
      Xi !== null && zl(Xi, e), _i !== null && zl(_i, e), ki !== null && zl(ki, e);
      var i = function(p) {
        return zl(p, e);
      };
      xn.forEach(i), Lr.forEach(i);
      for (var u = 0; u < Mr.length; u++) {
        var s = Mr[u];
        s.blockedOn === e && (s.blockedOn = null);
      }
      for (; Mr.length > 0; ) {
        var f = Mr[0];
        if (f.blockedOn !== null)
          break;
        Hd(f), f.blockedOn === null && Mr.shift();
      }
    }
    var or = k.ReactCurrentBatchConfig, bt = !0;
    function Wn(e) {
      bt = !!e;
    }
    function Fn() {
      return bt;
    }
    function sr(e, t, a) {
      var i = rf(t), u;
      switch (i) {
        case Nr:
          u = ma;
          break;
        case xi:
          u = Eo;
          break;
        case Ma:
        default:
          u = _n;
          break;
      }
      return u.bind(null, t, a, e);
    }
    function ma(e, t, a, i) {
      var u = za(), s = or.transition;
      or.transition = null;
      try {
        jn(Nr), _n(e, t, a, i);
      } finally {
        jn(u), or.transition = s;
      }
    }
    function Eo(e, t, a, i) {
      var u = za(), s = or.transition;
      or.transition = null;
      try {
        jn(xi), _n(e, t, a, i);
      } finally {
        jn(u), or.transition = s;
      }
    }
    function _n(e, t, a, i) {
      bt && Ms(e, t, a, i);
    }
    function Ms(e, t, a, i) {
      var u = Co(e, t, a, i);
      if (u === null) {
        Dy(e, t, i, Di, a), Fd(e, i);
        return;
      }
      if (fy(u, e, t, a, i)) {
        i.stopPropagation();
        return;
      }
      if (Fd(e, i), t & _a && Zv(e)) {
        for (; u !== null; ) {
          var s = ko(u);
          s !== null && cy(s);
          var f = Co(e, t, a, i);
          if (f === null && Dy(e, t, i, Di, a), f === u)
            break;
          u = f;
        }
        u !== null && i.stopPropagation();
        return;
      }
      Dy(e, t, i, null, a);
    }
    var Di = null;
    function Co(e, t, a, i) {
      Di = null;
      var u = dd(i), s = Is(u);
      if (s !== null) {
        var f = da(s);
        if (f === null)
          s = null;
        else {
          var p = f.tag;
          if (p === Ne) {
            var v = Ti(f);
            if (v !== null)
              return v;
            s = null;
          } else if (p === ee) {
            var y = f.stateNode;
            if (ef(y))
              return wi(f);
            s = null;
          } else f !== s && (s = null);
        }
      }
      return Di = s, null;
    }
    function rf(e) {
      switch (e) {
        case "cancel":
        case "click":
        case "close":
        case "contextmenu":
        case "copy":
        case "cut":
        case "auxclick":
        case "dblclick":
        case "dragend":
        case "dragstart":
        case "drop":
        case "focusin":
        case "focusout":
        case "input":
        case "invalid":
        case "keydown":
        case "keypress":
        case "keyup":
        case "mousedown":
        case "mouseup":
        case "paste":
        case "pause":
        case "play":
        case "pointercancel":
        case "pointerdown":
        case "pointerup":
        case "ratechange":
        case "reset":
        case "resize":
        case "seeked":
        case "submit":
        case "touchcancel":
        case "touchend":
        case "touchstart":
        case "volumechange":
        case "change":
        case "selectionchange":
        case "textInput":
        case "compositionstart":
        case "compositionend":
        case "compositionupdate":
        case "beforeblur":
        case "afterblur":
        case "beforeinput":
        case "blur":
        case "fullscreenchange":
        case "focus":
        case "hashchange":
        case "popstate":
        case "select":
        case "selectstart":
          return Nr;
        case "drag":
        case "dragenter":
        case "dragexit":
        case "dragleave":
        case "dragover":
        case "mousemove":
        case "mouseout":
        case "mouseover":
        case "pointermove":
        case "pointerout":
        case "pointerover":
        case "scroll":
        case "toggle":
        case "touchmove":
        case "wheel":
        case "mouseenter":
        case "mouseleave":
        case "pointerenter":
        case "pointerleave":
          return xi;
        case "message": {
          var t = _c();
          switch (t) {
            case os:
              return Nr;
            case Ol:
              return xi;
            case Gi:
            case sy:
              return Ma;
            case hu:
              return Ua;
            default:
              return Ma;
          }
        }
        default:
          return Ma;
      }
    }
    function Us(e, t, a) {
      return e.addEventListener(t, a, !1), a;
    }
    function ta(e, t, a) {
      return e.addEventListener(t, a, !0), a;
    }
    function Vd(e, t, a, i) {
      return e.addEventListener(t, a, {
        capture: !0,
        passive: i
      }), a;
    }
    function Ro(e, t, a, i) {
      return e.addEventListener(t, a, {
        passive: i
      }), a;
    }
    var ya = null, To = null, Du = null;
    function Al(e) {
      return ya = e, To = zs(), !0;
    }
    function af() {
      ya = null, To = null, Du = null;
    }
    function Ji() {
      if (Du)
        return Du;
      var e, t = To, a = t.length, i, u = zs(), s = u.length;
      for (e = 0; e < a && t[e] === u[e]; e++)
        ;
      var f = a - e;
      for (i = 1; i <= f && t[a - i] === u[s - i]; i++)
        ;
      var p = i > 1 ? 1 - i : void 0;
      return Du = u.slice(e, p), Du;
    }
    function zs() {
      return "value" in ya ? ya.value : ya.textContent;
    }
    function jl(e) {
      var t, a = e.keyCode;
      return "charCode" in e ? (t = e.charCode, t === 0 && a === 13 && (t = 13)) : t = a, t === 10 && (t = 13), t >= 32 || t === 13 ? t : 0;
    }
    function wo() {
      return !0;
    }
    function As() {
      return !1;
    }
    function wr(e) {
      function t(a, i, u, s, f) {
        this._reactName = a, this._targetInst = u, this.type = i, this.nativeEvent = s, this.target = f, this.currentTarget = null;
        for (var p in e)
          if (e.hasOwnProperty(p)) {
            var v = e[p];
            v ? this[p] = v(s) : this[p] = s[p];
          }
        var y = s.defaultPrevented != null ? s.defaultPrevented : s.returnValue === !1;
        return y ? this.isDefaultPrevented = wo : this.isDefaultPrevented = As, this.isPropagationStopped = As, this;
      }
      return lt(t.prototype, {
        preventDefault: function() {
          this.defaultPrevented = !0;
          var a = this.nativeEvent;
          a && (a.preventDefault ? a.preventDefault() : typeof a.returnValue != "unknown" && (a.returnValue = !1), this.isDefaultPrevented = wo);
        },
        stopPropagation: function() {
          var a = this.nativeEvent;
          a && (a.stopPropagation ? a.stopPropagation() : typeof a.cancelBubble != "unknown" && (a.cancelBubble = !0), this.isPropagationStopped = wo);
        },
        /**
         * We release all dispatched `SyntheticEvent`s after each event loop, adding
         * them back into the pool. This allows a way to hold onto a reference that
         * won't be added back into the pool.
         */
        persist: function() {
        },
        /**
         * Checks if this event should be released back into the pool.
         *
         * @return {boolean} True if this should not be released, false otherwise.
         */
        isPersistent: wo
      }), t;
    }
    var Hn = {
      eventPhase: 0,
      bubbles: 0,
      cancelable: 0,
      timeStamp: function(e) {
        return e.timeStamp || Date.now();
      },
      defaultPrevented: 0,
      isTrusted: 0
    }, Oi = wr(Hn), Ur = lt({}, Hn, {
      view: 0,
      detail: 0
    }), na = wr(Ur), lf, js, Ou;
    function py(e) {
      e !== Ou && (Ou && e.type === "mousemove" ? (lf = e.screenX - Ou.screenX, js = e.screenY - Ou.screenY) : (lf = 0, js = 0), Ou = e);
    }
    var ii = lt({}, Ur, {
      screenX: 0,
      screenY: 0,
      clientX: 0,
      clientY: 0,
      pageX: 0,
      pageY: 0,
      ctrlKey: 0,
      shiftKey: 0,
      altKey: 0,
      metaKey: 0,
      getModifierState: pn,
      button: 0,
      buttons: 0,
      relatedTarget: function(e) {
        return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
      },
      movementX: function(e) {
        return "movementX" in e ? e.movementX : (py(e), lf);
      },
      movementY: function(e) {
        return "movementY" in e ? e.movementY : js;
      }
    }), Bd = wr(ii), Id = lt({}, ii, {
      dataTransfer: 0
    }), Nu = wr(Id), Yd = lt({}, Ur, {
      relatedTarget: 0
    }), Zi = wr(Yd), th = lt({}, Hn, {
      animationName: 0,
      elapsedTime: 0,
      pseudoElement: 0
    }), nh = wr(th), $d = lt({}, Hn, {
      clipboardData: function(e) {
        return "clipboardData" in e ? e.clipboardData : window.clipboardData;
      }
    }), uf = wr($d), vy = lt({}, Hn, {
      data: 0
    }), rh = wr(vy), ah = rh, ih = {
      Esc: "Escape",
      Spacebar: " ",
      Left: "ArrowLeft",
      Up: "ArrowUp",
      Right: "ArrowRight",
      Down: "ArrowDown",
      Del: "Delete",
      Win: "OS",
      Menu: "ContextMenu",
      Apps: "ContextMenu",
      Scroll: "ScrollLock",
      MozPrintableKey: "Unidentified"
    }, Lu = {
      8: "Backspace",
      9: "Tab",
      12: "Clear",
      13: "Enter",
      16: "Shift",
      17: "Control",
      18: "Alt",
      19: "Pause",
      20: "CapsLock",
      27: "Escape",
      32: " ",
      33: "PageUp",
      34: "PageDown",
      35: "End",
      36: "Home",
      37: "ArrowLeft",
      38: "ArrowUp",
      39: "ArrowRight",
      40: "ArrowDown",
      45: "Insert",
      46: "Delete",
      112: "F1",
      113: "F2",
      114: "F3",
      115: "F4",
      116: "F5",
      117: "F6",
      118: "F7",
      119: "F8",
      120: "F9",
      121: "F10",
      122: "F11",
      123: "F12",
      144: "NumLock",
      145: "ScrollLock",
      224: "Meta"
    };
    function hy(e) {
      if (e.key) {
        var t = ih[e.key] || e.key;
        if (t !== "Unidentified")
          return t;
      }
      if (e.type === "keypress") {
        var a = jl(e);
        return a === 13 ? "Enter" : String.fromCharCode(a);
      }
      return e.type === "keydown" || e.type === "keyup" ? Lu[e.keyCode] || "Unidentified" : "";
    }
    var bo = {
      Alt: "altKey",
      Control: "ctrlKey",
      Meta: "metaKey",
      Shift: "shiftKey"
    };
    function lh(e) {
      var t = this, a = t.nativeEvent;
      if (a.getModifierState)
        return a.getModifierState(e);
      var i = bo[e];
      return i ? !!a[i] : !1;
    }
    function pn(e) {
      return lh;
    }
    var my = lt({}, Ur, {
      key: hy,
      code: 0,
      location: 0,
      ctrlKey: 0,
      shiftKey: 0,
      altKey: 0,
      metaKey: 0,
      repeat: 0,
      locale: 0,
      getModifierState: pn,
      // Legacy Interface
      charCode: function(e) {
        return e.type === "keypress" ? jl(e) : 0;
      },
      keyCode: function(e) {
        return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
      },
      which: function(e) {
        return e.type === "keypress" ? jl(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
      }
    }), uh = wr(my), yy = lt({}, ii, {
      pointerId: 0,
      width: 0,
      height: 0,
      pressure: 0,
      tangentialPressure: 0,
      tiltX: 0,
      tiltY: 0,
      twist: 0,
      pointerType: 0,
      isPrimary: 0
    }), oh = wr(yy), sh = lt({}, Ur, {
      touches: 0,
      targetTouches: 0,
      changedTouches: 0,
      altKey: 0,
      metaKey: 0,
      ctrlKey: 0,
      shiftKey: 0,
      getModifierState: pn
    }), ch = wr(sh), gy = lt({}, Hn, {
      propertyName: 0,
      elapsedTime: 0,
      pseudoElement: 0
    }), Aa = wr(gy), Qd = lt({}, ii, {
      deltaX: function(e) {
        return "deltaX" in e ? e.deltaX : (
          // Fallback to `wheelDeltaX` for Webkit and normalize (right is positive).
          "wheelDeltaX" in e ? -e.wheelDeltaX : 0
        );
      },
      deltaY: function(e) {
        return "deltaY" in e ? e.deltaY : (
          // Fallback to `wheelDeltaY` for Webkit and normalize (down is positive).
          "wheelDeltaY" in e ? -e.wheelDeltaY : (
            // Fallback to `wheelDelta` for IE<9 and normalize (down is positive).
            "wheelDelta" in e ? -e.wheelDelta : 0
          )
        );
      },
      deltaZ: 0,
      // Browsers without "deltaMode" is reporting in raw wheel delta where one
      // notch on the scroll is always +/- 120, roughly equivalent to pixels.
      // A good approximation of DOM_DELTA_LINE (1) is 5% of viewport size or
      // ~40 pixels, for DOM_DELTA_SCREEN (2) it is 87.5% of viewport size.
      deltaMode: 0
    }), Sy = wr(Qd), Fl = [9, 13, 27, 32], Fs = 229, el = On && "CompositionEvent" in window, Hl = null;
    On && "documentMode" in document && (Hl = document.documentMode);
    var Wd = On && "TextEvent" in window && !Hl, of = On && (!el || Hl && Hl > 8 && Hl <= 11), fh = 32, sf = String.fromCharCode(fh);
    function Ey() {
      pt("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]), pt("onCompositionEnd", ["compositionend", "focusout", "keydown", "keypress", "keyup", "mousedown"]), pt("onCompositionStart", ["compositionstart", "focusout", "keydown", "keypress", "keyup", "mousedown"]), pt("onCompositionUpdate", ["compositionupdate", "focusout", "keydown", "keypress", "keyup", "mousedown"]);
    }
    var Gd = !1;
    function dh(e) {
      return (e.ctrlKey || e.altKey || e.metaKey) && // ctrlKey && altKey is equivalent to AltGr, and is not a command.
      !(e.ctrlKey && e.altKey);
    }
    function cf(e) {
      switch (e) {
        case "compositionstart":
          return "onCompositionStart";
        case "compositionend":
          return "onCompositionEnd";
        case "compositionupdate":
          return "onCompositionUpdate";
      }
    }
    function ff(e, t) {
      return e === "keydown" && t.keyCode === Fs;
    }
    function qd(e, t) {
      switch (e) {
        case "keyup":
          return Fl.indexOf(t.keyCode) !== -1;
        case "keydown":
          return t.keyCode !== Fs;
        case "keypress":
        case "mousedown":
        case "focusout":
          return !0;
        default:
          return !1;
      }
    }
    function df(e) {
      var t = e.detail;
      return typeof t == "object" && "data" in t ? t.data : null;
    }
    function ph(e) {
      return e.locale === "ko";
    }
    var Mu = !1;
    function Kd(e, t, a, i, u) {
      var s, f;
      if (el ? s = cf(t) : Mu ? qd(t, i) && (s = "onCompositionEnd") : ff(t, i) && (s = "onCompositionStart"), !s)
        return null;
      of && !ph(i) && (!Mu && s === "onCompositionStart" ? Mu = Al(u) : s === "onCompositionEnd" && Mu && (f = Ji()));
      var p = Eh(a, s);
      if (p.length > 0) {
        var v = new rh(s, t, null, i, u);
        if (e.push({
          event: v,
          listeners: p
        }), f)
          v.data = f;
        else {
          var y = df(i);
          y !== null && (v.data = y);
        }
      }
    }
    function pf(e, t) {
      switch (e) {
        case "compositionend":
          return df(t);
        case "keypress":
          var a = t.which;
          return a !== fh ? null : (Gd = !0, sf);
        case "textInput":
          var i = t.data;
          return i === sf && Gd ? null : i;
        default:
          return null;
      }
    }
    function Xd(e, t) {
      if (Mu) {
        if (e === "compositionend" || !el && qd(e, t)) {
          var a = Ji();
          return af(), Mu = !1, a;
        }
        return null;
      }
      switch (e) {
        case "paste":
          return null;
        case "keypress":
          if (!dh(t)) {
            if (t.char && t.char.length > 1)
              return t.char;
            if (t.which)
              return String.fromCharCode(t.which);
          }
          return null;
        case "compositionend":
          return of && !ph(t) ? null : t.data;
        default:
          return null;
      }
    }
    function vf(e, t, a, i, u) {
      var s;
      if (Wd ? s = pf(t, i) : s = Xd(t, i), !s)
        return null;
      var f = Eh(a, "onBeforeInput");
      if (f.length > 0) {
        var p = new ah("onBeforeInput", "beforeinput", null, i, u);
        e.push({
          event: p,
          listeners: f
        }), p.data = s;
      }
    }
    function vh(e, t, a, i, u, s, f) {
      Kd(e, t, a, i, u), vf(e, t, a, i, u);
    }
    var Cy = {
      color: !0,
      date: !0,
      datetime: !0,
      "datetime-local": !0,
      email: !0,
      month: !0,
      number: !0,
      password: !0,
      range: !0,
      search: !0,
      tel: !0,
      text: !0,
      time: !0,
      url: !0,
      week: !0
    };
    function Hs(e) {
      var t = e && e.nodeName && e.nodeName.toLowerCase();
      return t === "input" ? !!Cy[e.type] : t === "textarea";
    }
    /**
     * Checks if an event is supported in the current execution environment.
     *
     * NOTE: This will not work correctly for non-generic events such as `change`,
     * `reset`, `load`, `error`, and `select`.
     *
     * Borrows from Modernizr.
     *
     * @param {string} eventNameSuffix Event name, e.g. "click".
     * @return {boolean} True if the event is supported.
     * @internal
     * @license Modernizr 3.0.0pre (Custom Build) | MIT
     */
    function Ry(e) {
      if (!On)
        return !1;
      var t = "on" + e, a = t in document;
      if (!a) {
        var i = document.createElement("div");
        i.setAttribute(t, "return;"), a = typeof i[t] == "function";
      }
      return a;
    }
    function Ps() {
      pt("onChange", ["change", "click", "focusin", "focusout", "input", "keydown", "keyup", "selectionchange"]);
    }
    function hh(e, t, a, i) {
      uo(i);
      var u = Eh(t, "onChange");
      if (u.length > 0) {
        var s = new Oi("onChange", "change", null, a, i);
        e.push({
          event: s,
          listeners: u
        });
      }
    }
    var Pl = null, n = null;
    function r(e) {
      var t = e.nodeName && e.nodeName.toLowerCase();
      return t === "select" || t === "input" && e.type === "file";
    }
    function l(e) {
      var t = [];
      hh(t, n, e, dd(e)), _v(o, t);
    }
    function o(e) {
      ME(e, 0);
    }
    function c(e) {
      var t = Ef(e);
      if (yi(t))
        return e;
    }
    function d(e, t) {
      if (e === "change")
        return t;
    }
    var m = !1;
    On && (m = Ry("input") && (!document.documentMode || document.documentMode > 9));
    function E(e, t) {
      Pl = e, n = t, Pl.attachEvent("onpropertychange", A);
    }
    function T() {
      Pl && (Pl.detachEvent("onpropertychange", A), Pl = null, n = null);
    }
    function A(e) {
      e.propertyName === "value" && c(n) && l(e);
    }
    function G(e, t, a) {
      e === "focusin" ? (T(), E(t, a)) : e === "focusout" && T();
    }
    function K(e, t) {
      if (e === "selectionchange" || e === "keyup" || e === "keydown")
        return c(n);
    }
    function W(e) {
      var t = e.nodeName;
      return t && t.toLowerCase() === "input" && (e.type === "checkbox" || e.type === "radio");
    }
    function pe(e, t) {
      if (e === "click")
        return c(t);
    }
    function Ee(e, t) {
      if (e === "input" || e === "change")
        return c(t);
    }
    function be(e) {
      var t = e._wrapperState;
      !t || !t.controlled || e.type !== "number" || Ae(e, "number", e.value);
    }
    function kn(e, t, a, i, u, s, f) {
      var p = a ? Ef(a) : window, v, y;
      if (r(p) ? v = d : Hs(p) ? m ? v = Ee : (v = K, y = G) : W(p) && (v = pe), v) {
        var g = v(t, a);
        if (g) {
          hh(e, g, i, u);
          return;
        }
      }
      y && y(t, p, a), t === "focusout" && be(p);
    }
    function O() {
      Yt("onMouseEnter", ["mouseout", "mouseover"]), Yt("onMouseLeave", ["mouseout", "mouseover"]), Yt("onPointerEnter", ["pointerout", "pointerover"]), Yt("onPointerLeave", ["pointerout", "pointerover"]);
    }
    function b(e, t, a, i, u, s, f) {
      var p = t === "mouseover" || t === "pointerover", v = t === "mouseout" || t === "pointerout";
      if (p && !ns(i)) {
        var y = i.relatedTarget || i.fromElement;
        if (y && (Is(y) || fp(y)))
          return;
      }
      if (!(!v && !p)) {
        var g;
        if (u.window === u)
          g = u;
        else {
          var x = u.ownerDocument;
          x ? g = x.defaultView || x.parentWindow : g = window;
        }
        var w, U;
        if (v) {
          var j = i.relatedTarget || i.toElement;
          if (w = a, U = j ? Is(j) : null, U !== null) {
            var P = da(U);
            (U !== P || U.tag !== ae && U.tag !== fe) && (U = null);
          }
        } else
          w = null, U = a;
        if (w !== U) {
          var se = Bd, je = "onMouseLeave", De = "onMouseEnter", _t = "mouse";
          (t === "pointerout" || t === "pointerover") && (se = oh, je = "onPointerLeave", De = "onPointerEnter", _t = "pointer");
          var Ct = w == null ? g : Ef(w), N = U == null ? g : Ef(U), V = new se(je, _t + "leave", w, i, u);
          V.target = Ct, V.relatedTarget = N;
          var L = null, X = Is(u);
          if (X === a) {
            var he = new se(De, _t + "enter", U, i, u);
            he.target = N, he.relatedTarget = Ct, L = he;
          }
          AT(e, V, L, w, U);
        }
      }
    }
    function M(e, t) {
      return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
    }
    var q = typeof Object.is == "function" ? Object.is : M;
    function Ce(e, t) {
      if (q(e, t))
        return !0;
      if (typeof e != "object" || e === null || typeof t != "object" || t === null)
        return !1;
      var a = Object.keys(e), i = Object.keys(t);
      if (a.length !== i.length)
        return !1;
      for (var u = 0; u < a.length; u++) {
        var s = a[u];
        if (!br.call(t, s) || !q(e[s], t[s]))
          return !1;
      }
      return !0;
    }
    function Fe(e) {
      for (; e && e.firstChild; )
        e = e.firstChild;
      return e;
    }
    function Ve(e) {
      for (; e; ) {
        if (e.nextSibling)
          return e.nextSibling;
        e = e.parentNode;
      }
    }
    function We(e, t) {
      for (var a = Fe(e), i = 0, u = 0; a; ) {
        if (a.nodeType === Ii) {
          if (u = i + a.textContent.length, i <= t && u >= t)
            return {
              node: a,
              offset: t - i
            };
          i = u;
        }
        a = Fe(Ve(a));
      }
    }
    function er(e) {
      var t = e.ownerDocument, a = t && t.defaultView || window, i = a.getSelection && a.getSelection();
      if (!i || i.rangeCount === 0)
        return null;
      var u = i.anchorNode, s = i.anchorOffset, f = i.focusNode, p = i.focusOffset;
      try {
        u.nodeType, f.nodeType;
      } catch {
        return null;
      }
      return At(e, u, s, f, p);
    }
    function At(e, t, a, i, u) {
      var s = 0, f = -1, p = -1, v = 0, y = 0, g = e, x = null;
      e: for (; ; ) {
        for (var w = null; g === t && (a === 0 || g.nodeType === Ii) && (f = s + a), g === i && (u === 0 || g.nodeType === Ii) && (p = s + u), g.nodeType === Ii && (s += g.nodeValue.length), (w = g.firstChild) !== null; )
          x = g, g = w;
        for (; ; ) {
          if (g === e)
            break e;
          if (x === t && ++v === a && (f = s), x === i && ++y === u && (p = s), (w = g.nextSibling) !== null)
            break;
          g = x, x = g.parentNode;
        }
        g = w;
      }
      return f === -1 || p === -1 ? null : {
        start: f,
        end: p
      };
    }
    function Vl(e, t) {
      var a = e.ownerDocument || document, i = a && a.defaultView || window;
      if (i.getSelection) {
        var u = i.getSelection(), s = e.textContent.length, f = Math.min(t.start, s), p = t.end === void 0 ? f : Math.min(t.end, s);
        if (!u.extend && f > p) {
          var v = p;
          p = f, f = v;
        }
        var y = We(e, f), g = We(e, p);
        if (y && g) {
          if (u.rangeCount === 1 && u.anchorNode === y.node && u.anchorOffset === y.offset && u.focusNode === g.node && u.focusOffset === g.offset)
            return;
          var x = a.createRange();
          x.setStart(y.node, y.offset), u.removeAllRanges(), f > p ? (u.addRange(x), u.extend(g.node, g.offset)) : (x.setEnd(g.node, g.offset), u.addRange(x));
        }
      }
    }
    function mh(e) {
      return e && e.nodeType === Ii;
    }
    function RE(e, t) {
      return !e || !t ? !1 : e === t ? !0 : mh(e) ? !1 : mh(t) ? RE(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1;
    }
    function gT(e) {
      return e && e.ownerDocument && RE(e.ownerDocument.documentElement, e);
    }
    function ST(e) {
      try {
        return typeof e.contentWindow.location.href == "string";
      } catch {
        return !1;
      }
    }
    function TE() {
      for (var e = window, t = xa(); t instanceof e.HTMLIFrameElement; ) {
        if (ST(t))
          e = t.contentWindow;
        else
          return t;
        t = xa(e.document);
      }
      return t;
    }
    function Ty(e) {
      var t = e && e.nodeName && e.nodeName.toLowerCase();
      return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
    }
    function ET() {
      var e = TE();
      return {
        focusedElem: e,
        selectionRange: Ty(e) ? RT(e) : null
      };
    }
    function CT(e) {
      var t = TE(), a = e.focusedElem, i = e.selectionRange;
      if (t !== a && gT(a)) {
        i !== null && Ty(a) && TT(a, i);
        for (var u = [], s = a; s = s.parentNode; )
          s.nodeType === Qr && u.push({
            element: s,
            left: s.scrollLeft,
            top: s.scrollTop
          });
        typeof a.focus == "function" && a.focus();
        for (var f = 0; f < u.length; f++) {
          var p = u[f];
          p.element.scrollLeft = p.left, p.element.scrollTop = p.top;
        }
      }
    }
    function RT(e) {
      var t;
      return "selectionStart" in e ? t = {
        start: e.selectionStart,
        end: e.selectionEnd
      } : t = er(e), t || {
        start: 0,
        end: 0
      };
    }
    function TT(e, t) {
      var a = t.start, i = t.end;
      i === void 0 && (i = a), "selectionStart" in e ? (e.selectionStart = a, e.selectionEnd = Math.min(i, e.value.length)) : Vl(e, t);
    }
    var wT = On && "documentMode" in document && document.documentMode <= 11;
    function bT() {
      pt("onSelect", ["focusout", "contextmenu", "dragend", "focusin", "keydown", "keyup", "mousedown", "mouseup", "selectionchange"]);
    }
    var hf = null, wy = null, Jd = null, by = !1;
    function xT(e) {
      if ("selectionStart" in e && Ty(e))
        return {
          start: e.selectionStart,
          end: e.selectionEnd
        };
      var t = e.ownerDocument && e.ownerDocument.defaultView || window, a = t.getSelection();
      return {
        anchorNode: a.anchorNode,
        anchorOffset: a.anchorOffset,
        focusNode: a.focusNode,
        focusOffset: a.focusOffset
      };
    }
    function _T(e) {
      return e.window === e ? e.document : e.nodeType === Yi ? e : e.ownerDocument;
    }
    function wE(e, t, a) {
      var i = _T(a);
      if (!(by || hf == null || hf !== xa(i))) {
        var u = xT(hf);
        if (!Jd || !Ce(Jd, u)) {
          Jd = u;
          var s = Eh(wy, "onSelect");
          if (s.length > 0) {
            var f = new Oi("onSelect", "select", null, t, a);
            e.push({
              event: f,
              listeners: s
            }), f.target = hf;
          }
        }
      }
    }
    function kT(e, t, a, i, u, s, f) {
      var p = a ? Ef(a) : window;
      switch (t) {
        case "focusin":
          (Hs(p) || p.contentEditable === "true") && (hf = p, wy = a, Jd = null);
          break;
        case "focusout":
          hf = null, wy = null, Jd = null;
          break;
        case "mousedown":
          by = !0;
          break;
        case "contextmenu":
        case "mouseup":
        case "dragend":
          by = !1, wE(e, i, u);
          break;
        case "selectionchange":
          if (wT)
            break;
        case "keydown":
        case "keyup":
          wE(e, i, u);
      }
    }
    function yh(e, t) {
      var a = {};
      return a[e.toLowerCase()] = t.toLowerCase(), a["Webkit" + e] = "webkit" + t, a["Moz" + e] = "moz" + t, a;
    }
    var mf = {
      animationend: yh("Animation", "AnimationEnd"),
      animationiteration: yh("Animation", "AnimationIteration"),
      animationstart: yh("Animation", "AnimationStart"),
      transitionend: yh("Transition", "TransitionEnd")
    }, xy = {}, bE = {};
    On && (bE = document.createElement("div").style, "AnimationEvent" in window || (delete mf.animationend.animation, delete mf.animationiteration.animation, delete mf.animationstart.animation), "TransitionEvent" in window || delete mf.transitionend.transition);
    function gh(e) {
      if (xy[e])
        return xy[e];
      if (!mf[e])
        return e;
      var t = mf[e];
      for (var a in t)
        if (t.hasOwnProperty(a) && a in bE)
          return xy[e] = t[a];
      return e;
    }
    var xE = gh("animationend"), _E = gh("animationiteration"), kE = gh("animationstart"), DE = gh("transitionend"), OE = /* @__PURE__ */ new Map(), NE = ["abort", "auxClick", "cancel", "canPlay", "canPlayThrough", "click", "close", "contextMenu", "copy", "cut", "drag", "dragEnd", "dragEnter", "dragExit", "dragLeave", "dragOver", "dragStart", "drop", "durationChange", "emptied", "encrypted", "ended", "error", "gotPointerCapture", "input", "invalid", "keyDown", "keyPress", "keyUp", "load", "loadedData", "loadedMetadata", "loadStart", "lostPointerCapture", "mouseDown", "mouseMove", "mouseOut", "mouseOver", "mouseUp", "paste", "pause", "play", "playing", "pointerCancel", "pointerDown", "pointerMove", "pointerOut", "pointerOver", "pointerUp", "progress", "rateChange", "reset", "resize", "seeked", "seeking", "stalled", "submit", "suspend", "timeUpdate", "touchCancel", "touchEnd", "touchStart", "volumeChange", "scroll", "toggle", "touchMove", "waiting", "wheel"];
    function xo(e, t) {
      OE.set(e, t), pt(t, [e]);
    }
    function DT() {
      for (var e = 0; e < NE.length; e++) {
        var t = NE[e], a = t.toLowerCase(), i = t[0].toUpperCase() + t.slice(1);
        xo(a, "on" + i);
      }
      xo(xE, "onAnimationEnd"), xo(_E, "onAnimationIteration"), xo(kE, "onAnimationStart"), xo("dblclick", "onDoubleClick"), xo("focusin", "onFocus"), xo("focusout", "onBlur"), xo(DE, "onTransitionEnd");
    }
    function OT(e, t, a, i, u, s, f) {
      var p = OE.get(t);
      if (p !== void 0) {
        var v = Oi, y = t;
        switch (t) {
          case "keypress":
            if (jl(i) === 0)
              return;
          case "keydown":
          case "keyup":
            v = uh;
            break;
          case "focusin":
            y = "focus", v = Zi;
            break;
          case "focusout":
            y = "blur", v = Zi;
            break;
          case "beforeblur":
          case "afterblur":
            v = Zi;
            break;
          case "click":
            if (i.button === 2)
              return;
          case "auxclick":
          case "dblclick":
          case "mousedown":
          case "mousemove":
          case "mouseup":
          case "mouseout":
          case "mouseover":
          case "contextmenu":
            v = Bd;
            break;
          case "drag":
          case "dragend":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "dragstart":
          case "drop":
            v = Nu;
            break;
          case "touchcancel":
          case "touchend":
          case "touchmove":
          case "touchstart":
            v = ch;
            break;
          case xE:
          case _E:
          case kE:
            v = nh;
            break;
          case DE:
            v = Aa;
            break;
          case "scroll":
            v = na;
            break;
          case "wheel":
            v = Sy;
            break;
          case "copy":
          case "cut":
          case "paste":
            v = uf;
            break;
          case "gotpointercapture":
          case "lostpointercapture":
          case "pointercancel":
          case "pointerdown":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "pointerup":
            v = oh;
            break;
        }
        var g = (s & _a) !== 0;
        {
          var x = !g && // TODO: ideally, we'd eventually add all events from
          // nonDelegatedEvents list in DOMPluginEventSystem.
          // Then we can remove this special list.
          // This is a breaking change that can wait until React 18.
          t === "scroll", w = UT(a, p, i.type, g, x);
          if (w.length > 0) {
            var U = new v(p, y, null, i, u);
            e.push({
              event: U,
              listeners: w
            });
          }
        }
      }
    }
    DT(), O(), Ps(), bT(), Ey();
    function NT(e, t, a, i, u, s, f) {
      OT(e, t, a, i, u, s);
      var p = (s & fd) === 0;
      p && (b(e, t, a, i, u), kn(e, t, a, i, u), kT(e, t, a, i, u), vh(e, t, a, i, u));
    }
    var Zd = ["abort", "canplay", "canplaythrough", "durationchange", "emptied", "encrypted", "ended", "error", "loadeddata", "loadedmetadata", "loadstart", "pause", "play", "playing", "progress", "ratechange", "resize", "seeked", "seeking", "stalled", "suspend", "timeupdate", "volumechange", "waiting"], _y = new Set(["cancel", "close", "invalid", "load", "scroll", "toggle"].concat(Zd));
    function LE(e, t, a) {
      var i = e.type || "unknown-event";
      e.currentTarget = a, Ei(i, t, void 0, e), e.currentTarget = null;
    }
    function LT(e, t, a) {
      var i;
      if (a)
        for (var u = t.length - 1; u >= 0; u--) {
          var s = t[u], f = s.instance, p = s.currentTarget, v = s.listener;
          if (f !== i && e.isPropagationStopped())
            return;
          LE(e, v, p), i = f;
        }
      else
        for (var y = 0; y < t.length; y++) {
          var g = t[y], x = g.instance, w = g.currentTarget, U = g.listener;
          if (x !== i && e.isPropagationStopped())
            return;
          LE(e, U, w), i = x;
        }
    }
    function ME(e, t) {
      for (var a = (t & _a) !== 0, i = 0; i < e.length; i++) {
        var u = e[i], s = u.event, f = u.listeners;
        LT(s, f, a);
      }
      is();
    }
    function MT(e, t, a, i, u) {
      var s = dd(a), f = [];
      NT(f, e, i, a, s, t), ME(f, t);
    }
    function Sn(e, t) {
      _y.has(e) || S('Did not expect a listenToNonDelegatedEvent() call for "%s". This is a bug in React. Please file an issue.', e);
      var a = !1, i = sb(t), u = jT(e);
      i.has(u) || (UE(t, e, vc, a), i.add(u));
    }
    function ky(e, t, a) {
      _y.has(e) && !t && S('Did not expect a listenToNativeEvent() call for "%s" in the bubble phase. This is a bug in React. Please file an issue.', e);
      var i = 0;
      t && (i |= _a), UE(a, e, i, t);
    }
    var Sh = "_reactListening" + Math.random().toString(36).slice(2);
    function ep(e) {
      if (!e[Sh]) {
        e[Sh] = !0, ut.forEach(function(a) {
          a !== "selectionchange" && (_y.has(a) || ky(a, !1, e), ky(a, !0, e));
        });
        var t = e.nodeType === Yi ? e : e.ownerDocument;
        t !== null && (t[Sh] || (t[Sh] = !0, ky("selectionchange", !1, t)));
      }
    }
    function UE(e, t, a, i, u) {
      var s = sr(e, t, a), f = void 0;
      as && (t === "touchstart" || t === "touchmove" || t === "wheel") && (f = !0), e = e, i ? f !== void 0 ? Vd(e, t, s, f) : ta(e, t, s) : f !== void 0 ? Ro(e, t, s, f) : Us(e, t, s);
    }
    function zE(e, t) {
      return e === t || e.nodeType === Ln && e.parentNode === t;
    }
    function Dy(e, t, a, i, u) {
      var s = i;
      if (!(t & cd) && !(t & vc)) {
        var f = u;
        if (i !== null) {
          var p = i;
          e: for (; ; ) {
            if (p === null)
              return;
            var v = p.tag;
            if (v === ee || v === ge) {
              var y = p.stateNode.containerInfo;
              if (zE(y, f))
                break;
              if (v === ge)
                for (var g = p.return; g !== null; ) {
                  var x = g.tag;
                  if (x === ee || x === ge) {
                    var w = g.stateNode.containerInfo;
                    if (zE(w, f))
                      return;
                  }
                  g = g.return;
                }
              for (; y !== null; ) {
                var U = Is(y);
                if (U === null)
                  return;
                var j = U.tag;
                if (j === ae || j === fe) {
                  p = s = U;
                  continue e;
                }
                y = y.parentNode;
              }
            }
            p = p.return;
          }
        }
      }
      _v(function() {
        return MT(e, t, a, s);
      });
    }
    function tp(e, t, a) {
      return {
        instance: e,
        listener: t,
        currentTarget: a
      };
    }
    function UT(e, t, a, i, u, s) {
      for (var f = t !== null ? t + "Capture" : null, p = i ? f : t, v = [], y = e, g = null; y !== null; ) {
        var x = y, w = x.stateNode, U = x.tag;
        if (U === ae && w !== null && (g = w, p !== null)) {
          var j = wl(y, p);
          j != null && v.push(tp(y, j, g));
        }
        if (u)
          break;
        y = y.return;
      }
      return v;
    }
    function Eh(e, t) {
      for (var a = t + "Capture", i = [], u = e; u !== null; ) {
        var s = u, f = s.stateNode, p = s.tag;
        if (p === ae && f !== null) {
          var v = f, y = wl(u, a);
          y != null && i.unshift(tp(u, y, v));
          var g = wl(u, t);
          g != null && i.push(tp(u, g, v));
        }
        u = u.return;
      }
      return i;
    }
    function yf(e) {
      if (e === null)
        return null;
      do
        e = e.return;
      while (e && e.tag !== ae);
      return e || null;
    }
    function zT(e, t) {
      for (var a = e, i = t, u = 0, s = a; s; s = yf(s))
        u++;
      for (var f = 0, p = i; p; p = yf(p))
        f++;
      for (; u - f > 0; )
        a = yf(a), u--;
      for (; f - u > 0; )
        i = yf(i), f--;
      for (var v = u; v--; ) {
        if (a === i || i !== null && a === i.alternate)
          return a;
        a = yf(a), i = yf(i);
      }
      return null;
    }
    function AE(e, t, a, i, u) {
      for (var s = t._reactName, f = [], p = a; p !== null && p !== i; ) {
        var v = p, y = v.alternate, g = v.stateNode, x = v.tag;
        if (y !== null && y === i)
          break;
        if (x === ae && g !== null) {
          var w = g;
          if (u) {
            var U = wl(p, s);
            U != null && f.unshift(tp(p, U, w));
          } else if (!u) {
            var j = wl(p, s);
            j != null && f.push(tp(p, j, w));
          }
        }
        p = p.return;
      }
      f.length !== 0 && e.push({
        event: t,
        listeners: f
      });
    }
    function AT(e, t, a, i, u) {
      var s = i && u ? zT(i, u) : null;
      i !== null && AE(e, t, i, s, !1), u !== null && a !== null && AE(e, a, u, s, !0);
    }
    function jT(e, t) {
      return e + "__bubble";
    }
    var ja = !1, np = "dangerouslySetInnerHTML", Ch = "suppressContentEditableWarning", _o = "suppressHydrationWarning", jE = "autoFocus", Vs = "children", Bs = "style", Rh = "__html", Oy, Th, rp, FE, wh, HE, PE;
    Oy = {
      // There are working polyfills for <dialog>. Let people use it.
      dialog: !0,
      // Electron ships a custom <webview> tag to display external web content in
      // an isolated frame and process.
      // This tag is not present in non Electron environments such as JSDom which
      // is often used for testing purposes.
      // @see https://electronjs.org/docs/api/webview-tag
      webview: !0
    }, Th = function(e, t) {
      ud(e, t), dc(e, t), wv(e, t, {
        registrationNameDependencies: it,
        possibleRegistrationNames: ot
      });
    }, HE = On && !document.documentMode, rp = function(e, t, a) {
      if (!ja) {
        var i = bh(a), u = bh(t);
        u !== i && (ja = !0, S("Prop `%s` did not match. Server: %s Client: %s", e, JSON.stringify(u), JSON.stringify(i)));
      }
    }, FE = function(e) {
      if (!ja) {
        ja = !0;
        var t = [];
        e.forEach(function(a) {
          t.push(a);
        }), S("Extra attributes from the server: %s", t);
      }
    }, wh = function(e, t) {
      t === !1 ? S("Expected `%s` listener to be a function, instead got `false`.\n\nIf you used to conditionally omit it with %s={condition && value}, pass %s={condition ? value : undefined} instead.", e, e, e) : S("Expected `%s` listener to be a function, instead got a value of `%s` type.", e, typeof t);
    }, PE = function(e, t) {
      var a = e.namespaceURI === Bi ? e.ownerDocument.createElement(e.tagName) : e.ownerDocument.createElementNS(e.namespaceURI, e.tagName);
      return a.innerHTML = t, a.innerHTML;
    };
    var FT = /\r\n?/g, HT = /\u0000|\uFFFD/g;
    function bh(e) {
      qn(e);
      var t = typeof e == "string" ? e : "" + e;
      return t.replace(FT, `
`).replace(HT, "");
    }
    function xh(e, t, a, i) {
      var u = bh(t), s = bh(e);
      if (s !== u && (i && (ja || (ja = !0, S('Text content did not match. Server: "%s" Client: "%s"', s, u))), a && Se))
        throw new Error("Text content does not match server-rendered HTML.");
    }
    function VE(e) {
      return e.nodeType === Yi ? e : e.ownerDocument;
    }
    function PT() {
    }
    function _h(e) {
      e.onclick = PT;
    }
    function VT(e, t, a, i, u) {
      for (var s in i)
        if (i.hasOwnProperty(s)) {
          var f = i[s];
          if (s === Bs)
            f && Object.freeze(f), gv(t, f);
          else if (s === np) {
            var p = f ? f[Rh] : void 0;
            p != null && lv(t, p);
          } else if (s === Vs)
            if (typeof f == "string") {
              var v = e !== "textarea" || f !== "";
              v && ro(t, f);
            } else typeof f == "number" && ro(t, "" + f);
          else s === Ch || s === _o || s === jE || (it.hasOwnProperty(s) ? f != null && (typeof f != "function" && wh(s, f), s === "onScroll" && Sn("scroll", t)) : f != null && xr(t, s, f, u));
        }
    }
    function BT(e, t, a, i) {
      for (var u = 0; u < t.length; u += 2) {
        var s = t[u], f = t[u + 1];
        s === Bs ? gv(e, f) : s === np ? lv(e, f) : s === Vs ? ro(e, f) : xr(e, s, f, i);
      }
    }
    function IT(e, t, a, i) {
      var u, s = VE(a), f, p = i;
      if (p === Bi && (p = ed(e)), p === Bi) {
        if (u = Rl(e, t), !u && e !== e.toLowerCase() && S("<%s /> is using incorrect casing. Use PascalCase for React components, or lowercase for HTML elements.", e), e === "script") {
          var v = s.createElement("div");
          v.innerHTML = "<script><\/script>";
          var y = v.firstChild;
          f = v.removeChild(y);
        } else if (typeof t.is == "string")
          f = s.createElement(e, {
            is: t.is
          });
        else if (f = s.createElement(e), e === "select") {
          var g = f;
          t.multiple ? g.multiple = !0 : t.size && (g.size = t.size);
        }
      } else
        f = s.createElementNS(p, e);
      return p === Bi && !u && Object.prototype.toString.call(f) === "[object HTMLUnknownElement]" && !br.call(Oy, e) && (Oy[e] = !0, S("The tag <%s> is unrecognized in this browser. If you meant to render a React component, start its name with an uppercase letter.", e)), f;
    }
    function YT(e, t) {
      return VE(t).createTextNode(e);
    }
    function $T(e, t, a, i) {
      var u = Rl(t, a);
      Th(t, a);
      var s;
      switch (t) {
        case "dialog":
          Sn("cancel", e), Sn("close", e), s = a;
          break;
        case "iframe":
        case "object":
        case "embed":
          Sn("load", e), s = a;
          break;
        case "video":
        case "audio":
          for (var f = 0; f < Zd.length; f++)
            Sn(Zd[f], e);
          s = a;
          break;
        case "source":
          Sn("error", e), s = a;
          break;
        case "img":
        case "image":
        case "link":
          Sn("error", e), Sn("load", e), s = a;
          break;
        case "details":
          Sn("toggle", e), s = a;
          break;
        case "input":
          Za(e, a), s = no(e, a), Sn("invalid", e);
          break;
        case "option":
          Ot(e, a), s = a;
          break;
        case "select":
          uu(e, a), s = qo(e, a), Sn("invalid", e);
          break;
        case "textarea":
          Xf(e, a), s = Kf(e, a), Sn("invalid", e);
          break;
        default:
          s = a;
      }
      switch (cc(t, s), VT(t, e, i, s, u), t) {
        case "input":
          Ja(e), z(e, a, !1);
          break;
        case "textarea":
          Ja(e), av(e);
          break;
        case "option":
          ln(e, a);
          break;
        case "select":
          Gf(e, a);
          break;
        default:
          typeof s.onClick == "function" && _h(e);
          break;
      }
    }
    function QT(e, t, a, i, u) {
      Th(t, i);
      var s = null, f, p;
      switch (t) {
        case "input":
          f = no(e, a), p = no(e, i), s = [];
          break;
        case "select":
          f = qo(e, a), p = qo(e, i), s = [];
          break;
        case "textarea":
          f = Kf(e, a), p = Kf(e, i), s = [];
          break;
        default:
          f = a, p = i, typeof f.onClick != "function" && typeof p.onClick == "function" && _h(e);
          break;
      }
      cc(t, p);
      var v, y, g = null;
      for (v in f)
        if (!(p.hasOwnProperty(v) || !f.hasOwnProperty(v) || f[v] == null))
          if (v === Bs) {
            var x = f[v];
            for (y in x)
              x.hasOwnProperty(y) && (g || (g = {}), g[y] = "");
          } else v === np || v === Vs || v === Ch || v === _o || v === jE || (it.hasOwnProperty(v) ? s || (s = []) : (s = s || []).push(v, null));
      for (v in p) {
        var w = p[v], U = f != null ? f[v] : void 0;
        if (!(!p.hasOwnProperty(v) || w === U || w == null && U == null))
          if (v === Bs)
            if (w && Object.freeze(w), U) {
              for (y in U)
                U.hasOwnProperty(y) && (!w || !w.hasOwnProperty(y)) && (g || (g = {}), g[y] = "");
              for (y in w)
                w.hasOwnProperty(y) && U[y] !== w[y] && (g || (g = {}), g[y] = w[y]);
            } else
              g || (s || (s = []), s.push(v, g)), g = w;
          else if (v === np) {
            var j = w ? w[Rh] : void 0, P = U ? U[Rh] : void 0;
            j != null && P !== j && (s = s || []).push(v, j);
          } else v === Vs ? (typeof w == "string" || typeof w == "number") && (s = s || []).push(v, "" + w) : v === Ch || v === _o || (it.hasOwnProperty(v) ? (w != null && (typeof w != "function" && wh(v, w), v === "onScroll" && Sn("scroll", e)), !s && U !== w && (s = [])) : (s = s || []).push(v, w));
      }
      return g && (ry(g, p[Bs]), (s = s || []).push(Bs, g)), s;
    }
    function WT(e, t, a, i, u) {
      a === "input" && u.type === "radio" && u.name != null && h(e, u);
      var s = Rl(a, i), f = Rl(a, u);
      switch (BT(e, t, s, f), a) {
        case "input":
          C(e, u);
          break;
        case "textarea":
          rv(e, u);
          break;
        case "select":
          uc(e, u);
          break;
      }
    }
    function GT(e) {
      {
        var t = e.toLowerCase();
        return es.hasOwnProperty(t) && es[t] || null;
      }
    }
    function qT(e, t, a, i, u, s, f) {
      var p, v;
      switch (p = Rl(t, a), Th(t, a), t) {
        case "dialog":
          Sn("cancel", e), Sn("close", e);
          break;
        case "iframe":
        case "object":
        case "embed":
          Sn("load", e);
          break;
        case "video":
        case "audio":
          for (var y = 0; y < Zd.length; y++)
            Sn(Zd[y], e);
          break;
        case "source":
          Sn("error", e);
          break;
        case "img":
        case "image":
        case "link":
          Sn("error", e), Sn("load", e);
          break;
        case "details":
          Sn("toggle", e);
          break;
        case "input":
          Za(e, a), Sn("invalid", e);
          break;
        case "option":
          Ot(e, a);
          break;
        case "select":
          uu(e, a), Sn("invalid", e);
          break;
        case "textarea":
          Xf(e, a), Sn("invalid", e);
          break;
      }
      cc(t, a);
      {
        v = /* @__PURE__ */ new Set();
        for (var g = e.attributes, x = 0; x < g.length; x++) {
          var w = g[x].name.toLowerCase();
          switch (w) {
            case "value":
              break;
            case "checked":
              break;
            case "selected":
              break;
            default:
              v.add(g[x].name);
          }
        }
      }
      var U = null;
      for (var j in a)
        if (a.hasOwnProperty(j)) {
          var P = a[j];
          if (j === Vs)
            typeof P == "string" ? e.textContent !== P && (a[_o] !== !0 && xh(e.textContent, P, s, f), U = [Vs, P]) : typeof P == "number" && e.textContent !== "" + P && (a[_o] !== !0 && xh(e.textContent, P, s, f), U = [Vs, "" + P]);
          else if (it.hasOwnProperty(j))
            P != null && (typeof P != "function" && wh(j, P), j === "onScroll" && Sn("scroll", e));
          else if (f && // Convince Flow we've calculated it (it's DEV-only in this method.)
          typeof p == "boolean") {
            var se = void 0, je = rn(j);
            if (a[_o] !== !0) {
              if (!(j === Ch || j === _o || // Controlled attributes are not validated
              // TODO: Only ignore them on controlled tags.
              j === "value" || j === "checked" || j === "selected")) {
                if (j === np) {
                  var De = e.innerHTML, _t = P ? P[Rh] : void 0;
                  if (_t != null) {
                    var Ct = PE(e, _t);
                    Ct !== De && rp(j, De, Ct);
                  }
                } else if (j === Bs) {
                  if (v.delete(j), HE) {
                    var N = ty(P);
                    se = e.getAttribute("style"), N !== se && rp(j, se, N);
                  }
                } else if (p && !_)
                  v.delete(j.toLowerCase()), se = eu(e, j, P), P !== se && rp(j, se, P);
                else if (!vn(j, je, p) && !Kn(j, P, je, p)) {
                  var V = !1;
                  if (je !== null)
                    v.delete(je.attributeName), se = pl(e, j, P, je);
                  else {
                    var L = i;
                    if (L === Bi && (L = ed(t)), L === Bi)
                      v.delete(j.toLowerCase());
                    else {
                      var X = GT(j);
                      X !== null && X !== j && (V = !0, v.delete(X)), v.delete(j);
                    }
                    se = eu(e, j, P);
                  }
                  var he = _;
                  !he && P !== se && !V && rp(j, se, P);
                }
              }
            }
          }
        }
      switch (f && // $FlowFixMe - Should be inferred as not undefined.
      v.size > 0 && a[_o] !== !0 && FE(v), t) {
        case "input":
          Ja(e), z(e, a, !0);
          break;
        case "textarea":
          Ja(e), av(e);
          break;
        case "select":
        case "option":
          break;
        default:
          typeof a.onClick == "function" && _h(e);
          break;
      }
      return U;
    }
    function KT(e, t, a) {
      var i = e.nodeValue !== t;
      return i;
    }
    function Ny(e, t) {
      {
        if (ja)
          return;
        ja = !0, S("Did not expect server HTML to contain a <%s> in <%s>.", t.nodeName.toLowerCase(), e.nodeName.toLowerCase());
      }
    }
    function Ly(e, t) {
      {
        if (ja)
          return;
        ja = !0, S('Did not expect server HTML to contain the text node "%s" in <%s>.', t.nodeValue, e.nodeName.toLowerCase());
      }
    }
    function My(e, t, a) {
      {
        if (ja)
          return;
        ja = !0, S("Expected server HTML to contain a matching <%s> in <%s>.", t, e.nodeName.toLowerCase());
      }
    }
    function Uy(e, t) {
      {
        if (t === "" || ja)
          return;
        ja = !0, S('Expected server HTML to contain a matching text node for "%s" in <%s>.', t, e.nodeName.toLowerCase());
      }
    }
    function XT(e, t, a) {
      switch (t) {
        case "input":
          H(e, a);
          return;
        case "textarea":
          Xm(e, a);
          return;
        case "select":
          qf(e, a);
          return;
      }
    }
    var ap = function() {
    }, ip = function() {
    };
    {
      var JT = ["address", "applet", "area", "article", "aside", "base", "basefont", "bgsound", "blockquote", "body", "br", "button", "caption", "center", "col", "colgroup", "dd", "details", "dir", "div", "dl", "dt", "embed", "fieldset", "figcaption", "figure", "footer", "form", "frame", "frameset", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "iframe", "img", "input", "isindex", "li", "link", "listing", "main", "marquee", "menu", "menuitem", "meta", "nav", "noembed", "noframes", "noscript", "object", "ol", "p", "param", "plaintext", "pre", "script", "section", "select", "source", "style", "summary", "table", "tbody", "td", "template", "textarea", "tfoot", "th", "thead", "title", "tr", "track", "ul", "wbr", "xmp"], BE = [
        "applet",
        "caption",
        "html",
        "table",
        "td",
        "th",
        "marquee",
        "object",
        "template",
        // https://html.spec.whatwg.org/multipage/syntax.html#html-integration-point
        // TODO: Distinguish by namespace here -- for <title>, including it here
        // errs on the side of fewer warnings
        "foreignObject",
        "desc",
        "title"
      ], ZT = BE.concat(["button"]), ew = ["dd", "dt", "li", "option", "optgroup", "p", "rp", "rt"], IE = {
        current: null,
        formTag: null,
        aTagInScope: null,
        buttonTagInScope: null,
        nobrTagInScope: null,
        pTagInButtonScope: null,
        listItemTagAutoclosing: null,
        dlItemTagAutoclosing: null
      };
      ip = function(e, t) {
        var a = lt({}, e || IE), i = {
          tag: t
        };
        return BE.indexOf(t) !== -1 && (a.aTagInScope = null, a.buttonTagInScope = null, a.nobrTagInScope = null), ZT.indexOf(t) !== -1 && (a.pTagInButtonScope = null), JT.indexOf(t) !== -1 && t !== "address" && t !== "div" && t !== "p" && (a.listItemTagAutoclosing = null, a.dlItemTagAutoclosing = null), a.current = i, t === "form" && (a.formTag = i), t === "a" && (a.aTagInScope = i), t === "button" && (a.buttonTagInScope = i), t === "nobr" && (a.nobrTagInScope = i), t === "p" && (a.pTagInButtonScope = i), t === "li" && (a.listItemTagAutoclosing = i), (t === "dd" || t === "dt") && (a.dlItemTagAutoclosing = i), a;
      };
      var tw = function(e, t) {
        switch (t) {
          case "select":
            return e === "option" || e === "optgroup" || e === "#text";
          case "optgroup":
            return e === "option" || e === "#text";
          case "option":
            return e === "#text";
          case "tr":
            return e === "th" || e === "td" || e === "style" || e === "script" || e === "template";
          case "tbody":
          case "thead":
          case "tfoot":
            return e === "tr" || e === "style" || e === "script" || e === "template";
          case "colgroup":
            return e === "col" || e === "template";
          case "table":
            return e === "caption" || e === "colgroup" || e === "tbody" || e === "tfoot" || e === "thead" || e === "style" || e === "script" || e === "template";
          case "head":
            return e === "base" || e === "basefont" || e === "bgsound" || e === "link" || e === "meta" || e === "title" || e === "noscript" || e === "noframes" || e === "style" || e === "script" || e === "template";
          case "html":
            return e === "head" || e === "body" || e === "frameset";
          case "frameset":
            return e === "frame";
          case "#document":
            return e === "html";
        }
        switch (e) {
          case "h1":
          case "h2":
          case "h3":
          case "h4":
          case "h5":
          case "h6":
            return t !== "h1" && t !== "h2" && t !== "h3" && t !== "h4" && t !== "h5" && t !== "h6";
          case "rp":
          case "rt":
            return ew.indexOf(t) === -1;
          case "body":
          case "caption":
          case "col":
          case "colgroup":
          case "frameset":
          case "frame":
          case "head":
          case "html":
          case "tbody":
          case "td":
          case "tfoot":
          case "th":
          case "thead":
          case "tr":
            return t == null;
        }
        return !0;
      }, nw = function(e, t) {
        switch (e) {
          case "address":
          case "article":
          case "aside":
          case "blockquote":
          case "center":
          case "details":
          case "dialog":
          case "dir":
          case "div":
          case "dl":
          case "fieldset":
          case "figcaption":
          case "figure":
          case "footer":
          case "header":
          case "hgroup":
          case "main":
          case "menu":
          case "nav":
          case "ol":
          case "p":
          case "section":
          case "summary":
          case "ul":
          case "pre":
          case "listing":
          case "table":
          case "hr":
          case "xmp":
          case "h1":
          case "h2":
          case "h3":
          case "h4":
          case "h5":
          case "h6":
            return t.pTagInButtonScope;
          case "form":
            return t.formTag || t.pTagInButtonScope;
          case "li":
            return t.listItemTagAutoclosing;
          case "dd":
          case "dt":
            return t.dlItemTagAutoclosing;
          case "button":
            return t.buttonTagInScope;
          case "a":
            return t.aTagInScope;
          case "nobr":
            return t.nobrTagInScope;
        }
        return null;
      }, YE = {};
      ap = function(e, t, a) {
        a = a || IE;
        var i = a.current, u = i && i.tag;
        t != null && (e != null && S("validateDOMNesting: when childText is passed, childTag should be null"), e = "#text");
        var s = tw(e, u) ? null : i, f = s ? null : nw(e, a), p = s || f;
        if (p) {
          var v = p.tag, y = !!s + "|" + e + "|" + v;
          if (!YE[y]) {
            YE[y] = !0;
            var g = e, x = "";
            if (e === "#text" ? /\S/.test(t) ? g = "Text nodes" : (g = "Whitespace text nodes", x = " Make sure you don't have any extra whitespace between tags on each line of your source code.") : g = "<" + e + ">", s) {
              var w = "";
              v === "table" && e === "tr" && (w += " Add a <tbody>, <thead> or <tfoot> to your code to match the DOM tree generated by the browser."), S("validateDOMNesting(...): %s cannot appear as a child of <%s>.%s%s", g, v, x, w);
            } else
              S("validateDOMNesting(...): %s cannot appear as a descendant of <%s>.", g, v);
          }
        }
      };
    }
    var kh = "suppressHydrationWarning", Dh = "$", Oh = "/$", lp = "$?", up = "$!", rw = "style", zy = null, Ay = null;
    function aw(e) {
      var t, a, i = e.nodeType;
      switch (i) {
        case Yi:
        case nd: {
          t = i === Yi ? "#document" : "#fragment";
          var u = e.documentElement;
          a = u ? u.namespaceURI : td(null, "");
          break;
        }
        default: {
          var s = i === Ln ? e.parentNode : e, f = s.namespaceURI || null;
          t = s.tagName, a = td(f, t);
          break;
        }
      }
      {
        var p = t.toLowerCase(), v = ip(null, p);
        return {
          namespace: a,
          ancestorInfo: v
        };
      }
    }
    function iw(e, t, a) {
      {
        var i = e, u = td(i.namespace, t), s = ip(i.ancestorInfo, t);
        return {
          namespace: u,
          ancestorInfo: s
        };
      }
    }
    function Mk(e) {
      return e;
    }
    function lw(e) {
      zy = Fn(), Ay = ET();
      var t = null;
      return Wn(!1), t;
    }
    function uw(e) {
      CT(Ay), Wn(zy), zy = null, Ay = null;
    }
    function ow(e, t, a, i, u) {
      var s;
      {
        var f = i;
        if (ap(e, null, f.ancestorInfo), typeof t.children == "string" || typeof t.children == "number") {
          var p = "" + t.children, v = ip(f.ancestorInfo, e);
          ap(null, p, v);
        }
        s = f.namespace;
      }
      var y = IT(e, t, a, s);
      return cp(u, y), Yy(y, t), y;
    }
    function sw(e, t) {
      e.appendChild(t);
    }
    function cw(e, t, a, i, u) {
      switch ($T(e, t, a, i), t) {
        case "button":
        case "input":
        case "select":
        case "textarea":
          return !!a.autoFocus;
        case "img":
          return !0;
        default:
          return !1;
      }
    }
    function fw(e, t, a, i, u, s) {
      {
        var f = s;
        if (typeof i.children != typeof a.children && (typeof i.children == "string" || typeof i.children == "number")) {
          var p = "" + i.children, v = ip(f.ancestorInfo, t);
          ap(null, p, v);
        }
      }
      return QT(e, t, a, i);
    }
    function jy(e, t) {
      return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
    }
    function dw(e, t, a, i) {
      {
        var u = a;
        ap(null, e, u.ancestorInfo);
      }
      var s = YT(e, t);
      return cp(i, s), s;
    }
    function pw() {
      var e = window.event;
      return e === void 0 ? Ma : rf(e.type);
    }
    var Fy = typeof setTimeout == "function" ? setTimeout : void 0, vw = typeof clearTimeout == "function" ? clearTimeout : void 0, Hy = -1, $E = typeof Promise == "function" ? Promise : void 0, hw = typeof queueMicrotask == "function" ? queueMicrotask : typeof $E < "u" ? function(e) {
      return $E.resolve(null).then(e).catch(mw);
    } : Fy;
    function mw(e) {
      setTimeout(function() {
        throw e;
      });
    }
    function yw(e, t, a, i) {
      switch (t) {
        case "button":
        case "input":
        case "select":
        case "textarea":
          a.autoFocus && e.focus();
          return;
        case "img": {
          a.src && (e.src = a.src);
          return;
        }
      }
    }
    function gw(e, t, a, i, u, s) {
      WT(e, t, a, i, u), Yy(e, u);
    }
    function QE(e) {
      ro(e, "");
    }
    function Sw(e, t, a) {
      e.nodeValue = a;
    }
    function Ew(e, t) {
      e.appendChild(t);
    }
    function Cw(e, t) {
      var a;
      e.nodeType === Ln ? (a = e.parentNode, a.insertBefore(t, e)) : (a = e, a.appendChild(t));
      var i = e._reactRootContainer;
      i == null && a.onclick === null && _h(a);
    }
    function Rw(e, t, a) {
      e.insertBefore(t, a);
    }
    function Tw(e, t, a) {
      e.nodeType === Ln ? e.parentNode.insertBefore(t, a) : e.insertBefore(t, a);
    }
    function ww(e, t) {
      e.removeChild(t);
    }
    function bw(e, t) {
      e.nodeType === Ln ? e.parentNode.removeChild(t) : e.removeChild(t);
    }
    function Py(e, t) {
      var a = t, i = 0;
      do {
        var u = a.nextSibling;
        if (e.removeChild(a), u && u.nodeType === Ln) {
          var s = u.data;
          if (s === Oh)
            if (i === 0) {
              e.removeChild(u), ku(t);
              return;
            } else
              i--;
          else (s === Dh || s === lp || s === up) && i++;
        }
        a = u;
      } while (a);
      ku(t);
    }
    function xw(e, t) {
      e.nodeType === Ln ? Py(e.parentNode, t) : e.nodeType === Qr && Py(e, t), ku(e);
    }
    function _w(e) {
      e = e;
      var t = e.style;
      typeof t.setProperty == "function" ? t.setProperty("display", "none", "important") : t.display = "none";
    }
    function kw(e) {
      e.nodeValue = "";
    }
    function Dw(e, t) {
      e = e;
      var a = t[rw], i = a != null && a.hasOwnProperty("display") ? a.display : null;
      e.style.display = sc("display", i);
    }
    function Ow(e, t) {
      e.nodeValue = t;
    }
    function Nw(e) {
      e.nodeType === Qr ? e.textContent = "" : e.nodeType === Yi && e.documentElement && e.removeChild(e.documentElement);
    }
    function Lw(e, t, a) {
      return e.nodeType !== Qr || t.toLowerCase() !== e.nodeName.toLowerCase() ? null : e;
    }
    function Mw(e, t) {
      return t === "" || e.nodeType !== Ii ? null : e;
    }
    function Uw(e) {
      return e.nodeType !== Ln ? null : e;
    }
    function WE(e) {
      return e.data === lp;
    }
    function Vy(e) {
      return e.data === up;
    }
    function zw(e) {
      var t = e.nextSibling && e.nextSibling.dataset, a, i, u;
      return t && (a = t.dgst, i = t.msg, u = t.stck), {
        message: i,
        digest: a,
        stack: u
      };
    }
    function Aw(e, t) {
      e._reactRetry = t;
    }
    function Nh(e) {
      for (; e != null; e = e.nextSibling) {
        var t = e.nodeType;
        if (t === Qr || t === Ii)
          break;
        if (t === Ln) {
          var a = e.data;
          if (a === Dh || a === up || a === lp)
            break;
          if (a === Oh)
            return null;
        }
      }
      return e;
    }
    function op(e) {
      return Nh(e.nextSibling);
    }
    function jw(e) {
      return Nh(e.firstChild);
    }
    function Fw(e) {
      return Nh(e.firstChild);
    }
    function Hw(e) {
      return Nh(e.nextSibling);
    }
    function Pw(e, t, a, i, u, s, f) {
      cp(s, e), Yy(e, a);
      var p;
      {
        var v = u;
        p = v.namespace;
      }
      var y = (s.mode & ht) !== Ue;
      return qT(e, t, a, p, i, y, f);
    }
    function Vw(e, t, a, i) {
      return cp(a, e), a.mode & ht, KT(e, t);
    }
    function Bw(e, t) {
      cp(t, e);
    }
    function Iw(e) {
      for (var t = e.nextSibling, a = 0; t; ) {
        if (t.nodeType === Ln) {
          var i = t.data;
          if (i === Oh) {
            if (a === 0)
              return op(t);
            a--;
          } else (i === Dh || i === up || i === lp) && a++;
        }
        t = t.nextSibling;
      }
      return null;
    }
    function GE(e) {
      for (var t = e.previousSibling, a = 0; t; ) {
        if (t.nodeType === Ln) {
          var i = t.data;
          if (i === Dh || i === up || i === lp) {
            if (a === 0)
              return t;
            a--;
          } else i === Oh && a++;
        }
        t = t.previousSibling;
      }
      return null;
    }
    function Yw(e) {
      ku(e);
    }
    function $w(e) {
      ku(e);
    }
    function Qw(e) {
      return e !== "head" && e !== "body";
    }
    function Ww(e, t, a, i) {
      var u = !0;
      xh(t.nodeValue, a, i, u);
    }
    function Gw(e, t, a, i, u, s) {
      if (t[kh] !== !0) {
        var f = !0;
        xh(i.nodeValue, u, s, f);
      }
    }
    function qw(e, t) {
      t.nodeType === Qr ? Ny(e, t) : t.nodeType === Ln || Ly(e, t);
    }
    function Kw(e, t) {
      {
        var a = e.parentNode;
        a !== null && (t.nodeType === Qr ? Ny(a, t) : t.nodeType === Ln || Ly(a, t));
      }
    }
    function Xw(e, t, a, i, u) {
      (u || t[kh] !== !0) && (i.nodeType === Qr ? Ny(a, i) : i.nodeType === Ln || Ly(a, i));
    }
    function Jw(e, t, a) {
      My(e, t);
    }
    function Zw(e, t) {
      Uy(e, t);
    }
    function eb(e, t, a) {
      {
        var i = e.parentNode;
        i !== null && My(i, t);
      }
    }
    function tb(e, t) {
      {
        var a = e.parentNode;
        a !== null && Uy(a, t);
      }
    }
    function nb(e, t, a, i, u, s) {
      (s || t[kh] !== !0) && My(a, i);
    }
    function rb(e, t, a, i, u) {
      (u || t[kh] !== !0) && Uy(a, i);
    }
    function ab(e) {
      S("An error occurred during hydration. The server HTML was replaced with client content in <%s>.", e.nodeName.toLowerCase());
    }
    function ib(e) {
      ep(e);
    }
    var gf = Math.random().toString(36).slice(2), Sf = "__reactFiber$" + gf, By = "__reactProps$" + gf, sp = "__reactContainer$" + gf, Iy = "__reactEvents$" + gf, lb = "__reactListeners$" + gf, ub = "__reactHandles$" + gf;
    function ob(e) {
      delete e[Sf], delete e[By], delete e[Iy], delete e[lb], delete e[ub];
    }
    function cp(e, t) {
      t[Sf] = e;
    }
    function Lh(e, t) {
      t[sp] = e;
    }
    function qE(e) {
      e[sp] = null;
    }
    function fp(e) {
      return !!e[sp];
    }
    function Is(e) {
      var t = e[Sf];
      if (t)
        return t;
      for (var a = e.parentNode; a; ) {
        if (t = a[sp] || a[Sf], t) {
          var i = t.alternate;
          if (t.child !== null || i !== null && i.child !== null)
            for (var u = GE(e); u !== null; ) {
              var s = u[Sf];
              if (s)
                return s;
              u = GE(u);
            }
          return t;
        }
        e = a, a = e.parentNode;
      }
      return null;
    }
    function ko(e) {
      var t = e[Sf] || e[sp];
      return t && (t.tag === ae || t.tag === fe || t.tag === Ne || t.tag === ee) ? t : null;
    }
    function Ef(e) {
      if (e.tag === ae || e.tag === fe)
        return e.stateNode;
      throw new Error("getNodeFromInstance: Invalid argument.");
    }
    function Mh(e) {
      return e[By] || null;
    }
    function Yy(e, t) {
      e[By] = t;
    }
    function sb(e) {
      var t = e[Iy];
      return t === void 0 && (t = e[Iy] = /* @__PURE__ */ new Set()), t;
    }
    var KE = {}, XE = k.ReactDebugCurrentFrame;
    function Uh(e) {
      if (e) {
        var t = e._owner, a = Hi(e.type, e._source, t ? t.type : null);
        XE.setExtraStackFrame(a);
      } else
        XE.setExtraStackFrame(null);
    }
    function tl(e, t, a, i, u) {
      {
        var s = Function.call.bind(br);
        for (var f in e)
          if (s(e, f)) {
            var p = void 0;
            try {
              if (typeof e[f] != "function") {
                var v = Error((i || "React class") + ": " + a + " type `" + f + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof e[f] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                throw v.name = "Invariant Violation", v;
              }
              p = e[f](t, f, i, a, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
            } catch (y) {
              p = y;
            }
            p && !(p instanceof Error) && (Uh(u), S("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", i || "React class", a, f, typeof p), Uh(null)), p instanceof Error && !(p.message in KE) && (KE[p.message] = !0, Uh(u), S("Failed %s type: %s", a, p.message), Uh(null));
          }
      }
    }
    var $y = [], zh;
    zh = [];
    var Uu = -1;
    function Do(e) {
      return {
        current: e
      };
    }
    function ra(e, t) {
      if (Uu < 0) {
        S("Unexpected pop.");
        return;
      }
      t !== zh[Uu] && S("Unexpected Fiber popped."), e.current = $y[Uu], $y[Uu] = null, zh[Uu] = null, Uu--;
    }
    function aa(e, t, a) {
      Uu++, $y[Uu] = e.current, zh[Uu] = a, e.current = t;
    }
    var Qy;
    Qy = {};
    var li = {};
    Object.freeze(li);
    var zu = Do(li), Bl = Do(!1), Wy = li;
    function Cf(e, t, a) {
      return a && Il(t) ? Wy : zu.current;
    }
    function JE(e, t, a) {
      {
        var i = e.stateNode;
        i.__reactInternalMemoizedUnmaskedChildContext = t, i.__reactInternalMemoizedMaskedChildContext = a;
      }
    }
    function Rf(e, t) {
      {
        var a = e.type, i = a.contextTypes;
        if (!i)
          return li;
        var u = e.stateNode;
        if (u && u.__reactInternalMemoizedUnmaskedChildContext === t)
          return u.__reactInternalMemoizedMaskedChildContext;
        var s = {};
        for (var f in i)
          s[f] = t[f];
        {
          var p = qe(e) || "Unknown";
          tl(i, s, "context", p);
        }
        return u && JE(e, t, s), s;
      }
    }
    function Ah() {
      return Bl.current;
    }
    function Il(e) {
      {
        var t = e.childContextTypes;
        return t != null;
      }
    }
    function jh(e) {
      ra(Bl, e), ra(zu, e);
    }
    function Gy(e) {
      ra(Bl, e), ra(zu, e);
    }
    function ZE(e, t, a) {
      {
        if (zu.current !== li)
          throw new Error("Unexpected context found on stack. This error is likely caused by a bug in React. Please file an issue.");
        aa(zu, t, e), aa(Bl, a, e);
      }
    }
    function eC(e, t, a) {
      {
        var i = e.stateNode, u = t.childContextTypes;
        if (typeof i.getChildContext != "function") {
          {
            var s = qe(e) || "Unknown";
            Qy[s] || (Qy[s] = !0, S("%s.childContextTypes is specified but there is no getChildContext() method on the instance. You can either define getChildContext() on %s or remove childContextTypes from it.", s, s));
          }
          return a;
        }
        var f = i.getChildContext();
        for (var p in f)
          if (!(p in u))
            throw new Error((qe(e) || "Unknown") + '.getChildContext(): key "' + p + '" is not defined in childContextTypes.');
        {
          var v = qe(e) || "Unknown";
          tl(u, f, "child context", v);
        }
        return lt({}, a, f);
      }
    }
    function Fh(e) {
      {
        var t = e.stateNode, a = t && t.__reactInternalMemoizedMergedChildContext || li;
        return Wy = zu.current, aa(zu, a, e), aa(Bl, Bl.current, e), !0;
      }
    }
    function tC(e, t, a) {
      {
        var i = e.stateNode;
        if (!i)
          throw new Error("Expected to have an instance by this point. This error is likely caused by a bug in React. Please file an issue.");
        if (a) {
          var u = eC(e, t, Wy);
          i.__reactInternalMemoizedMergedChildContext = u, ra(Bl, e), ra(zu, e), aa(zu, u, e), aa(Bl, a, e);
        } else
          ra(Bl, e), aa(Bl, a, e);
      }
    }
    function cb(e) {
      {
        if (!vu(e) || e.tag !== te)
          throw new Error("Expected subtree parent to be a mounted class component. This error is likely caused by a bug in React. Please file an issue.");
        var t = e;
        do {
          switch (t.tag) {
            case ee:
              return t.stateNode.context;
            case te: {
              var a = t.type;
              if (Il(a))
                return t.stateNode.__reactInternalMemoizedMergedChildContext;
              break;
            }
          }
          t = t.return;
        } while (t !== null);
        throw new Error("Found unexpected detached subtree parent. This error is likely caused by a bug in React. Please file an issue.");
      }
    }
    var Oo = 0, Hh = 1, Au = null, qy = !1, Ky = !1;
    function nC(e) {
      Au === null ? Au = [e] : Au.push(e);
    }
    function fb(e) {
      qy = !0, nC(e);
    }
    function rC() {
      qy && No();
    }
    function No() {
      if (!Ky && Au !== null) {
        Ky = !0;
        var e = 0, t = za();
        try {
          var a = !0, i = Au;
          for (jn(Nr); e < i.length; e++) {
            var u = i[e];
            do
              u = u(a);
            while (u !== null);
          }
          Au = null, qy = !1;
        } catch (s) {
          throw Au !== null && (Au = Au.slice(e + 1)), vd(os, No), s;
        } finally {
          jn(t), Ky = !1;
        }
      }
      return null;
    }
    var Tf = [], wf = 0, Ph = null, Vh = 0, Ni = [], Li = 0, Ys = null, ju = 1, Fu = "";
    function db(e) {
      return Qs(), (e.flags & Ci) !== Me;
    }
    function pb(e) {
      return Qs(), Vh;
    }
    function vb() {
      var e = Fu, t = ju, a = t & ~hb(t);
      return a.toString(32) + e;
    }
    function $s(e, t) {
      Qs(), Tf[wf++] = Vh, Tf[wf++] = Ph, Ph = e, Vh = t;
    }
    function aC(e, t, a) {
      Qs(), Ni[Li++] = ju, Ni[Li++] = Fu, Ni[Li++] = Ys, Ys = e;
      var i = ju, u = Fu, s = Bh(i) - 1, f = i & ~(1 << s), p = a + 1, v = Bh(t) + s;
      if (v > 30) {
        var y = s - s % 5, g = (1 << y) - 1, x = (f & g).toString(32), w = f >> y, U = s - y, j = Bh(t) + U, P = p << U, se = P | w, je = x + u;
        ju = 1 << j | se, Fu = je;
      } else {
        var De = p << s, _t = De | f, Ct = u;
        ju = 1 << v | _t, Fu = Ct;
      }
    }
    function Xy(e) {
      Qs();
      var t = e.return;
      if (t !== null) {
        var a = 1, i = 0;
        $s(e, a), aC(e, a, i);
      }
    }
    function Bh(e) {
      return 32 - zn(e);
    }
    function hb(e) {
      return 1 << Bh(e) - 1;
    }
    function Jy(e) {
      for (; e === Ph; )
        Ph = Tf[--wf], Tf[wf] = null, Vh = Tf[--wf], Tf[wf] = null;
      for (; e === Ys; )
        Ys = Ni[--Li], Ni[Li] = null, Fu = Ni[--Li], Ni[Li] = null, ju = Ni[--Li], Ni[Li] = null;
    }
    function mb() {
      return Qs(), Ys !== null ? {
        id: ju,
        overflow: Fu
      } : null;
    }
    function yb(e, t) {
      Qs(), Ni[Li++] = ju, Ni[Li++] = Fu, Ni[Li++] = Ys, ju = t.id, Fu = t.overflow, Ys = e;
    }
    function Qs() {
      Ar() || S("Expected to be hydrating. This is a bug in React. Please file an issue.");
    }
    var zr = null, Mi = null, nl = !1, Ws = !1, Lo = null;
    function gb() {
      nl && S("We should not be hydrating here. This is a bug in React. Please file a bug.");
    }
    function iC() {
      Ws = !0;
    }
    function Sb() {
      return Ws;
    }
    function Eb(e) {
      var t = e.stateNode.containerInfo;
      return Mi = Fw(t), zr = e, nl = !0, Lo = null, Ws = !1, !0;
    }
    function Cb(e, t, a) {
      return Mi = Hw(t), zr = e, nl = !0, Lo = null, Ws = !1, a !== null && yb(e, a), !0;
    }
    function lC(e, t) {
      switch (e.tag) {
        case ee: {
          qw(e.stateNode.containerInfo, t);
          break;
        }
        case ae: {
          var a = (e.mode & ht) !== Ue;
          Xw(
            e.type,
            e.memoizedProps,
            e.stateNode,
            t,
            // TODO: Delete this argument when we remove the legacy root API.
            a
          );
          break;
        }
        case Ne: {
          var i = e.memoizedState;
          i.dehydrated !== null && Kw(i.dehydrated, t);
          break;
        }
      }
    }
    function uC(e, t) {
      lC(e, t);
      var a = b_();
      a.stateNode = t, a.return = e;
      var i = e.deletions;
      i === null ? (e.deletions = [a], e.flags |= ka) : i.push(a);
    }
    function Zy(e, t) {
      {
        if (Ws)
          return;
        switch (e.tag) {
          case ee: {
            var a = e.stateNode.containerInfo;
            switch (t.tag) {
              case ae:
                var i = t.type;
                t.pendingProps, Jw(a, i);
                break;
              case fe:
                var u = t.pendingProps;
                Zw(a, u);
                break;
            }
            break;
          }
          case ae: {
            var s = e.type, f = e.memoizedProps, p = e.stateNode;
            switch (t.tag) {
              case ae: {
                var v = t.type, y = t.pendingProps, g = (e.mode & ht) !== Ue;
                nb(
                  s,
                  f,
                  p,
                  v,
                  y,
                  // TODO: Delete this argument when we remove the legacy root API.
                  g
                );
                break;
              }
              case fe: {
                var x = t.pendingProps, w = (e.mode & ht) !== Ue;
                rb(
                  s,
                  f,
                  p,
                  x,
                  // TODO: Delete this argument when we remove the legacy root API.
                  w
                );
                break;
              }
            }
            break;
          }
          case Ne: {
            var U = e.memoizedState, j = U.dehydrated;
            if (j !== null) switch (t.tag) {
              case ae:
                var P = t.type;
                t.pendingProps, eb(j, P);
                break;
              case fe:
                var se = t.pendingProps;
                tb(j, se);
                break;
            }
            break;
          }
          default:
            return;
        }
      }
    }
    function oC(e, t) {
      t.flags = t.flags & ~Gr | mn, Zy(e, t);
    }
    function sC(e, t) {
      switch (e.tag) {
        case ae: {
          var a = e.type;
          e.pendingProps;
          var i = Lw(t, a);
          return i !== null ? (e.stateNode = i, zr = e, Mi = jw(i), !0) : !1;
        }
        case fe: {
          var u = e.pendingProps, s = Mw(t, u);
          return s !== null ? (e.stateNode = s, zr = e, Mi = null, !0) : !1;
        }
        case Ne: {
          var f = Uw(t);
          if (f !== null) {
            var p = {
              dehydrated: f,
              treeContext: mb(),
              retryLane: Jr
            };
            e.memoizedState = p;
            var v = x_(f);
            return v.return = e, e.child = v, zr = e, Mi = null, !0;
          }
          return !1;
        }
        default:
          return !1;
      }
    }
    function eg(e) {
      return (e.mode & ht) !== Ue && (e.flags & Oe) === Me;
    }
    function tg(e) {
      throw new Error("Hydration failed because the initial UI does not match what was rendered on the server.");
    }
    function ng(e) {
      if (nl) {
        var t = Mi;
        if (!t) {
          eg(e) && (Zy(zr, e), tg()), oC(zr, e), nl = !1, zr = e;
          return;
        }
        var a = t;
        if (!sC(e, t)) {
          eg(e) && (Zy(zr, e), tg()), t = op(a);
          var i = zr;
          if (!t || !sC(e, t)) {
            oC(zr, e), nl = !1, zr = e;
            return;
          }
          uC(i, a);
        }
      }
    }
    function Rb(e, t, a) {
      var i = e.stateNode, u = !Ws, s = Pw(i, e.type, e.memoizedProps, t, a, e, u);
      return e.updateQueue = s, s !== null;
    }
    function Tb(e) {
      var t = e.stateNode, a = e.memoizedProps, i = Vw(t, a, e);
      if (i) {
        var u = zr;
        if (u !== null)
          switch (u.tag) {
            case ee: {
              var s = u.stateNode.containerInfo, f = (u.mode & ht) !== Ue;
              Ww(
                s,
                t,
                a,
                // TODO: Delete this argument when we remove the legacy root API.
                f
              );
              break;
            }
            case ae: {
              var p = u.type, v = u.memoizedProps, y = u.stateNode, g = (u.mode & ht) !== Ue;
              Gw(
                p,
                v,
                y,
                t,
                a,
                // TODO: Delete this argument when we remove the legacy root API.
                g
              );
              break;
            }
          }
      }
      return i;
    }
    function wb(e) {
      var t = e.memoizedState, a = t !== null ? t.dehydrated : null;
      if (!a)
        throw new Error("Expected to have a hydrated suspense instance. This error is likely caused by a bug in React. Please file an issue.");
      Bw(a, e);
    }
    function bb(e) {
      var t = e.memoizedState, a = t !== null ? t.dehydrated : null;
      if (!a)
        throw new Error("Expected to have a hydrated suspense instance. This error is likely caused by a bug in React. Please file an issue.");
      return Iw(a);
    }
    function cC(e) {
      for (var t = e.return; t !== null && t.tag !== ae && t.tag !== ee && t.tag !== Ne; )
        t = t.return;
      zr = t;
    }
    function Ih(e) {
      if (e !== zr)
        return !1;
      if (!nl)
        return cC(e), nl = !0, !1;
      if (e.tag !== ee && (e.tag !== ae || Qw(e.type) && !jy(e.type, e.memoizedProps))) {
        var t = Mi;
        if (t)
          if (eg(e))
            fC(e), tg();
          else
            for (; t; )
              uC(e, t), t = op(t);
      }
      return cC(e), e.tag === Ne ? Mi = bb(e) : Mi = zr ? op(e.stateNode) : null, !0;
    }
    function xb() {
      return nl && Mi !== null;
    }
    function fC(e) {
      for (var t = Mi; t; )
        lC(e, t), t = op(t);
    }
    function bf() {
      zr = null, Mi = null, nl = !1, Ws = !1;
    }
    function dC() {
      Lo !== null && (iR(Lo), Lo = null);
    }
    function Ar() {
      return nl;
    }
    function rg(e) {
      Lo === null ? Lo = [e] : Lo.push(e);
    }
    var _b = k.ReactCurrentBatchConfig, kb = null;
    function Db() {
      return _b.transition;
    }
    var rl = {
      recordUnsafeLifecycleWarnings: function(e, t) {
      },
      flushPendingUnsafeLifecycleWarnings: function() {
      },
      recordLegacyContextWarning: function(e, t) {
      },
      flushLegacyContextWarning: function() {
      },
      discardPendingWarnings: function() {
      }
    };
    {
      var Ob = function(e) {
        for (var t = null, a = e; a !== null; )
          a.mode & Xt && (t = a), a = a.return;
        return t;
      }, Gs = function(e) {
        var t = [];
        return e.forEach(function(a) {
          t.push(a);
        }), t.sort().join(", ");
      }, dp = [], pp = [], vp = [], hp = [], mp = [], yp = [], qs = /* @__PURE__ */ new Set();
      rl.recordUnsafeLifecycleWarnings = function(e, t) {
        qs.has(e.type) || (typeof t.componentWillMount == "function" && // Don't warn about react-lifecycles-compat polyfilled components.
        t.componentWillMount.__suppressDeprecationWarning !== !0 && dp.push(e), e.mode & Xt && typeof t.UNSAFE_componentWillMount == "function" && pp.push(e), typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps.__suppressDeprecationWarning !== !0 && vp.push(e), e.mode & Xt && typeof t.UNSAFE_componentWillReceiveProps == "function" && hp.push(e), typeof t.componentWillUpdate == "function" && t.componentWillUpdate.__suppressDeprecationWarning !== !0 && mp.push(e), e.mode & Xt && typeof t.UNSAFE_componentWillUpdate == "function" && yp.push(e));
      }, rl.flushPendingUnsafeLifecycleWarnings = function() {
        var e = /* @__PURE__ */ new Set();
        dp.length > 0 && (dp.forEach(function(w) {
          e.add(qe(w) || "Component"), qs.add(w.type);
        }), dp = []);
        var t = /* @__PURE__ */ new Set();
        pp.length > 0 && (pp.forEach(function(w) {
          t.add(qe(w) || "Component"), qs.add(w.type);
        }), pp = []);
        var a = /* @__PURE__ */ new Set();
        vp.length > 0 && (vp.forEach(function(w) {
          a.add(qe(w) || "Component"), qs.add(w.type);
        }), vp = []);
        var i = /* @__PURE__ */ new Set();
        hp.length > 0 && (hp.forEach(function(w) {
          i.add(qe(w) || "Component"), qs.add(w.type);
        }), hp = []);
        var u = /* @__PURE__ */ new Set();
        mp.length > 0 && (mp.forEach(function(w) {
          u.add(qe(w) || "Component"), qs.add(w.type);
        }), mp = []);
        var s = /* @__PURE__ */ new Set();
        if (yp.length > 0 && (yp.forEach(function(w) {
          s.add(qe(w) || "Component"), qs.add(w.type);
        }), yp = []), t.size > 0) {
          var f = Gs(t);
          S(`Using UNSAFE_componentWillMount in strict mode is not recommended and may indicate bugs in your code. See https://reactjs.org/link/unsafe-component-lifecycles for details.

* Move code with side effects to componentDidMount, and set initial state in the constructor.

Please update the following components: %s`, f);
        }
        if (i.size > 0) {
          var p = Gs(i);
          S(`Using UNSAFE_componentWillReceiveProps in strict mode is not recommended and may indicate bugs in your code. See https://reactjs.org/link/unsafe-component-lifecycles for details.

* Move data fetching code or side effects to componentDidUpdate.
* If you're updating state whenever props change, refactor your code to use memoization techniques or move it to static getDerivedStateFromProps. Learn more at: https://reactjs.org/link/derived-state

Please update the following components: %s`, p);
        }
        if (s.size > 0) {
          var v = Gs(s);
          S(`Using UNSAFE_componentWillUpdate in strict mode is not recommended and may indicate bugs in your code. See https://reactjs.org/link/unsafe-component-lifecycles for details.

* Move data fetching code or side effects to componentDidUpdate.

Please update the following components: %s`, v);
        }
        if (e.size > 0) {
          var y = Gs(e);
          ze(`componentWillMount has been renamed, and is not recommended for use. See https://reactjs.org/link/unsafe-component-lifecycles for details.

* Move code with side effects to componentDidMount, and set initial state in the constructor.
* Rename componentWillMount to UNSAFE_componentWillMount to suppress this warning in non-strict mode. In React 18.x, only the UNSAFE_ name will work. To rename all deprecated lifecycles to their new names, you can run \`npx react-codemod rename-unsafe-lifecycles\` in your project source folder.

Please update the following components: %s`, y);
        }
        if (a.size > 0) {
          var g = Gs(a);
          ze(`componentWillReceiveProps has been renamed, and is not recommended for use. See https://reactjs.org/link/unsafe-component-lifecycles for details.

* Move data fetching code or side effects to componentDidUpdate.
* If you're updating state whenever props change, refactor your code to use memoization techniques or move it to static getDerivedStateFromProps. Learn more at: https://reactjs.org/link/derived-state
* Rename componentWillReceiveProps to UNSAFE_componentWillReceiveProps to suppress this warning in non-strict mode. In React 18.x, only the UNSAFE_ name will work. To rename all deprecated lifecycles to their new names, you can run \`npx react-codemod rename-unsafe-lifecycles\` in your project source folder.

Please update the following components: %s`, g);
        }
        if (u.size > 0) {
          var x = Gs(u);
          ze(`componentWillUpdate has been renamed, and is not recommended for use. See https://reactjs.org/link/unsafe-component-lifecycles for details.

* Move data fetching code or side effects to componentDidUpdate.
* Rename componentWillUpdate to UNSAFE_componentWillUpdate to suppress this warning in non-strict mode. In React 18.x, only the UNSAFE_ name will work. To rename all deprecated lifecycles to their new names, you can run \`npx react-codemod rename-unsafe-lifecycles\` in your project source folder.

Please update the following components: %s`, x);
        }
      };
      var Yh = /* @__PURE__ */ new Map(), pC = /* @__PURE__ */ new Set();
      rl.recordLegacyContextWarning = function(e, t) {
        var a = Ob(e);
        if (a === null) {
          S("Expected to find a StrictMode component in a strict mode tree. This error is likely caused by a bug in React. Please file an issue.");
          return;
        }
        if (!pC.has(e.type)) {
          var i = Yh.get(a);
          (e.type.contextTypes != null || e.type.childContextTypes != null || t !== null && typeof t.getChildContext == "function") && (i === void 0 && (i = [], Yh.set(a, i)), i.push(e));
        }
      }, rl.flushLegacyContextWarning = function() {
        Yh.forEach(function(e, t) {
          if (e.length !== 0) {
            var a = e[0], i = /* @__PURE__ */ new Set();
            e.forEach(function(s) {
              i.add(qe(s) || "Component"), pC.add(s.type);
            });
            var u = Gs(i);
            try {
              Gt(a), S(`Legacy context API has been detected within a strict-mode tree.

The old API will be supported in all 16.x releases, but applications using it should migrate to the new version.

Please update the following components: %s

Learn more about this warning here: https://reactjs.org/link/legacy-context`, u);
            } finally {
              cn();
            }
          }
        });
      }, rl.discardPendingWarnings = function() {
        dp = [], pp = [], vp = [], hp = [], mp = [], yp = [], Yh = /* @__PURE__ */ new Map();
      };
    }
    var ag, ig, lg, ug, og, vC = function(e, t) {
    };
    ag = !1, ig = !1, lg = {}, ug = {}, og = {}, vC = function(e, t) {
      if (!(e === null || typeof e != "object") && !(!e._store || e._store.validated || e.key != null)) {
        if (typeof e._store != "object")
          throw new Error("React Component in warnForMissingKey should have a _store. This error is likely caused by a bug in React. Please file an issue.");
        e._store.validated = !0;
        var a = qe(t) || "Component";
        ug[a] || (ug[a] = !0, S('Each child in a list should have a unique "key" prop. See https://reactjs.org/link/warning-keys for more information.'));
      }
    };
    function Nb(e) {
      return e.prototype && e.prototype.isReactComponent;
    }
    function gp(e, t, a) {
      var i = a.ref;
      if (i !== null && typeof i != "function" && typeof i != "object") {
        if ((e.mode & Xt || B) && // We warn in ReactElement.js if owner and self are equal for string refs
        // because these cannot be automatically converted to an arrow function
        // using a codemod. Therefore, we don't have to warn about string refs again.
        !(a._owner && a._self && a._owner.stateNode !== a._self) && // Will already throw with "Function components cannot have string refs"
        !(a._owner && a._owner.tag !== te) && // Will already warn with "Function components cannot be given refs"
        !(typeof a.type == "function" && !Nb(a.type)) && // Will already throw with "Element ref was specified as a string (someStringRef) but no owner was set"
        a._owner) {
          var u = qe(e) || "Component";
          lg[u] || (S('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. We recommend using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', u, i), lg[u] = !0);
        }
        if (a._owner) {
          var s = a._owner, f;
          if (s) {
            var p = s;
            if (p.tag !== te)
              throw new Error("Function components cannot have string refs. We recommend using useRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref");
            f = p.stateNode;
          }
          if (!f)
            throw new Error("Missing owner for string ref " + i + ". This error is likely caused by a bug in React. Please file an issue.");
          var v = f;
          si(i, "ref");
          var y = "" + i;
          if (t !== null && t.ref !== null && typeof t.ref == "function" && t.ref._stringRef === y)
            return t.ref;
          var g = function(x) {
            var w = v.refs;
            x === null ? delete w[y] : w[y] = x;
          };
          return g._stringRef = y, g;
        } else {
          if (typeof i != "string")
            throw new Error("Expected ref to be a function, a string, an object returned by React.createRef(), or null.");
          if (!a._owner)
            throw new Error("Element ref was specified as a string (" + i + `) but no owner was set. This could happen for one of the following reasons:
1. You may be adding a ref to a function component
2. You may be adding a ref to a component that was not created inside a component's render method
3. You have multiple copies of React loaded
See https://reactjs.org/link/refs-must-have-owner for more information.`);
        }
      }
      return i;
    }
    function $h(e, t) {
      var a = Object.prototype.toString.call(t);
      throw new Error("Objects are not valid as a React child (found: " + (a === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : a) + "). If you meant to render a collection of children, use an array instead.");
    }
    function Qh(e) {
      {
        var t = qe(e) || "Component";
        if (og[t])
          return;
        og[t] = !0, S("Functions are not valid as a React child. This may happen if you return a Component instead of <Component /> from render. Or maybe you meant to call this function rather than return it.");
      }
    }
    function hC(e) {
      var t = e._payload, a = e._init;
      return a(t);
    }
    function mC(e) {
      function t(N, V) {
        if (e) {
          var L = N.deletions;
          L === null ? (N.deletions = [V], N.flags |= ka) : L.push(V);
        }
      }
      function a(N, V) {
        if (!e)
          return null;
        for (var L = V; L !== null; )
          t(N, L), L = L.sibling;
        return null;
      }
      function i(N, V) {
        for (var L = /* @__PURE__ */ new Map(), X = V; X !== null; )
          X.key !== null ? L.set(X.key, X) : L.set(X.index, X), X = X.sibling;
        return L;
      }
      function u(N, V) {
        var L = ac(N, V);
        return L.index = 0, L.sibling = null, L;
      }
      function s(N, V, L) {
        if (N.index = L, !e)
          return N.flags |= Ci, V;
        var X = N.alternate;
        if (X !== null) {
          var he = X.index;
          return he < V ? (N.flags |= mn, V) : he;
        } else
          return N.flags |= mn, V;
      }
      function f(N) {
        return e && N.alternate === null && (N.flags |= mn), N;
      }
      function p(N, V, L, X) {
        if (V === null || V.tag !== fe) {
          var he = rE(L, N.mode, X);
          return he.return = N, he;
        } else {
          var de = u(V, L);
          return de.return = N, de;
        }
      }
      function v(N, V, L, X) {
        var he = L.type;
        if (he === fi)
          return g(N, V, L.props.children, X, L.key);
        if (V !== null && (V.elementType === he || // Keep this check inline so it only runs on the false path:
        CR(V, L) || // Lazy types should reconcile their resolved type.
        // We need to do this after the Hot Reloading check above,
        // because hot reloading has different semantics than prod because
        // it doesn't resuspend. So we can't let the call below suspend.
        typeof he == "object" && he !== null && he.$$typeof === Ke && hC(he) === V.type)) {
          var de = u(V, L.props);
          return de.ref = gp(N, V, L), de.return = N, de._debugSource = L._source, de._debugOwner = L._owner, de;
        }
        var Qe = nE(L, N.mode, X);
        return Qe.ref = gp(N, V, L), Qe.return = N, Qe;
      }
      function y(N, V, L, X) {
        if (V === null || V.tag !== ge || V.stateNode.containerInfo !== L.containerInfo || V.stateNode.implementation !== L.implementation) {
          var he = aE(L, N.mode, X);
          return he.return = N, he;
        } else {
          var de = u(V, L.children || []);
          return de.return = N, de;
        }
      }
      function g(N, V, L, X, he) {
        if (V === null || V.tag !== Ie) {
          var de = Io(L, N.mode, X, he);
          return de.return = N, de;
        } else {
          var Qe = u(V, L);
          return Qe.return = N, Qe;
        }
      }
      function x(N, V, L) {
        if (typeof V == "string" && V !== "" || typeof V == "number") {
          var X = rE("" + V, N.mode, L);
          return X.return = N, X;
        }
        if (typeof V == "object" && V !== null) {
          switch (V.$$typeof) {
            case _r: {
              var he = nE(V, N.mode, L);
              return he.ref = gp(N, null, V), he.return = N, he;
            }
            case rr: {
              var de = aE(V, N.mode, L);
              return de.return = N, de;
            }
            case Ke: {
              var Qe = V._payload, et = V._init;
              return x(N, et(Qe), L);
            }
          }
          if (ct(V) || rt(V)) {
            var Zt = Io(V, N.mode, L, null);
            return Zt.return = N, Zt;
          }
          $h(N, V);
        }
        return typeof V == "function" && Qh(N), null;
      }
      function w(N, V, L, X) {
        var he = V !== null ? V.key : null;
        if (typeof L == "string" && L !== "" || typeof L == "number")
          return he !== null ? null : p(N, V, "" + L, X);
        if (typeof L == "object" && L !== null) {
          switch (L.$$typeof) {
            case _r:
              return L.key === he ? v(N, V, L, X) : null;
            case rr:
              return L.key === he ? y(N, V, L, X) : null;
            case Ke: {
              var de = L._payload, Qe = L._init;
              return w(N, V, Qe(de), X);
            }
          }
          if (ct(L) || rt(L))
            return he !== null ? null : g(N, V, L, X, null);
          $h(N, L);
        }
        return typeof L == "function" && Qh(N), null;
      }
      function U(N, V, L, X, he) {
        if (typeof X == "string" && X !== "" || typeof X == "number") {
          var de = N.get(L) || null;
          return p(V, de, "" + X, he);
        }
        if (typeof X == "object" && X !== null) {
          switch (X.$$typeof) {
            case _r: {
              var Qe = N.get(X.key === null ? L : X.key) || null;
              return v(V, Qe, X, he);
            }
            case rr: {
              var et = N.get(X.key === null ? L : X.key) || null;
              return y(V, et, X, he);
            }
            case Ke:
              var Zt = X._payload, jt = X._init;
              return U(N, V, L, jt(Zt), he);
          }
          if (ct(X) || rt(X)) {
            var Gn = N.get(L) || null;
            return g(V, Gn, X, he, null);
          }
          $h(V, X);
        }
        return typeof X == "function" && Qh(V), null;
      }
      function j(N, V, L) {
        {
          if (typeof N != "object" || N === null)
            return V;
          switch (N.$$typeof) {
            case _r:
            case rr:
              vC(N, L);
              var X = N.key;
              if (typeof X != "string")
                break;
              if (V === null) {
                V = /* @__PURE__ */ new Set(), V.add(X);
                break;
              }
              if (!V.has(X)) {
                V.add(X);
                break;
              }
              S("Encountered two children with the same key, `%s`. Keys should be unique so that components maintain their identity across updates. Non-unique keys may cause children to be duplicated and/or omitted — the behavior is unsupported and could change in a future version.", X);
              break;
            case Ke:
              var he = N._payload, de = N._init;
              j(de(he), V, L);
              break;
          }
        }
        return V;
      }
      function P(N, V, L, X) {
        for (var he = null, de = 0; de < L.length; de++) {
          var Qe = L[de];
          he = j(Qe, he, N);
        }
        for (var et = null, Zt = null, jt = V, Gn = 0, Ft = 0, Pn = null; jt !== null && Ft < L.length; Ft++) {
          jt.index > Ft ? (Pn = jt, jt = null) : Pn = jt.sibling;
          var la = w(N, jt, L[Ft], X);
          if (la === null) {
            jt === null && (jt = Pn);
            break;
          }
          e && jt && la.alternate === null && t(N, jt), Gn = s(la, Gn, Ft), Zt === null ? et = la : Zt.sibling = la, Zt = la, jt = Pn;
        }
        if (Ft === L.length) {
          if (a(N, jt), Ar()) {
            var Ir = Ft;
            $s(N, Ir);
          }
          return et;
        }
        if (jt === null) {
          for (; Ft < L.length; Ft++) {
            var oi = x(N, L[Ft], X);
            oi !== null && (Gn = s(oi, Gn, Ft), Zt === null ? et = oi : Zt.sibling = oi, Zt = oi);
          }
          if (Ar()) {
            var Ca = Ft;
            $s(N, Ca);
          }
          return et;
        }
        for (var Ra = i(N, jt); Ft < L.length; Ft++) {
          var ua = U(Ra, N, Ft, L[Ft], X);
          ua !== null && (e && ua.alternate !== null && Ra.delete(ua.key === null ? Ft : ua.key), Gn = s(ua, Gn, Ft), Zt === null ? et = ua : Zt.sibling = ua, Zt = ua);
        }
        if (e && Ra.forEach(function(Yf) {
          return t(N, Yf);
        }), Ar()) {
          var $u = Ft;
          $s(N, $u);
        }
        return et;
      }
      function se(N, V, L, X) {
        var he = rt(L);
        if (typeof he != "function")
          throw new Error("An object is not an iterable. This error is likely caused by a bug in React. Please file an issue.");
        {
          typeof Symbol == "function" && // $FlowFixMe Flow doesn't know about toStringTag
          L[Symbol.toStringTag] === "Generator" && (ig || S("Using Generators as children is unsupported and will likely yield unexpected results because enumerating a generator mutates it. You may convert it to an array with `Array.from()` or the `[...spread]` operator before rendering. Keep in mind you might need to polyfill these features for older browsers."), ig = !0), L.entries === he && (ag || S("Using Maps as children is not supported. Use an array of keyed ReactElements instead."), ag = !0);
          var de = he.call(L);
          if (de)
            for (var Qe = null, et = de.next(); !et.done; et = de.next()) {
              var Zt = et.value;
              Qe = j(Zt, Qe, N);
            }
        }
        var jt = he.call(L);
        if (jt == null)
          throw new Error("An iterable object provided no iterator.");
        for (var Gn = null, Ft = null, Pn = V, la = 0, Ir = 0, oi = null, Ca = jt.next(); Pn !== null && !Ca.done; Ir++, Ca = jt.next()) {
          Pn.index > Ir ? (oi = Pn, Pn = null) : oi = Pn.sibling;
          var Ra = w(N, Pn, Ca.value, X);
          if (Ra === null) {
            Pn === null && (Pn = oi);
            break;
          }
          e && Pn && Ra.alternate === null && t(N, Pn), la = s(Ra, la, Ir), Ft === null ? Gn = Ra : Ft.sibling = Ra, Ft = Ra, Pn = oi;
        }
        if (Ca.done) {
          if (a(N, Pn), Ar()) {
            var ua = Ir;
            $s(N, ua);
          }
          return Gn;
        }
        if (Pn === null) {
          for (; !Ca.done; Ir++, Ca = jt.next()) {
            var $u = x(N, Ca.value, X);
            $u !== null && (la = s($u, la, Ir), Ft === null ? Gn = $u : Ft.sibling = $u, Ft = $u);
          }
          if (Ar()) {
            var Yf = Ir;
            $s(N, Yf);
          }
          return Gn;
        }
        for (var Kp = i(N, Pn); !Ca.done; Ir++, Ca = jt.next()) {
          var Xl = U(Kp, N, Ir, Ca.value, X);
          Xl !== null && (e && Xl.alternate !== null && Kp.delete(Xl.key === null ? Ir : Xl.key), la = s(Xl, la, Ir), Ft === null ? Gn = Xl : Ft.sibling = Xl, Ft = Xl);
        }
        if (e && Kp.forEach(function(rk) {
          return t(N, rk);
        }), Ar()) {
          var nk = Ir;
          $s(N, nk);
        }
        return Gn;
      }
      function je(N, V, L, X) {
        if (V !== null && V.tag === fe) {
          a(N, V.sibling);
          var he = u(V, L);
          return he.return = N, he;
        }
        a(N, V);
        var de = rE(L, N.mode, X);
        return de.return = N, de;
      }
      function De(N, V, L, X) {
        for (var he = L.key, de = V; de !== null; ) {
          if (de.key === he) {
            var Qe = L.type;
            if (Qe === fi) {
              if (de.tag === Ie) {
                a(N, de.sibling);
                var et = u(de, L.props.children);
                return et.return = N, et._debugSource = L._source, et._debugOwner = L._owner, et;
              }
            } else if (de.elementType === Qe || // Keep this check inline so it only runs on the false path:
            CR(de, L) || // Lazy types should reconcile their resolved type.
            // We need to do this after the Hot Reloading check above,
            // because hot reloading has different semantics than prod because
            // it doesn't resuspend. So we can't let the call below suspend.
            typeof Qe == "object" && Qe !== null && Qe.$$typeof === Ke && hC(Qe) === de.type) {
              a(N, de.sibling);
              var Zt = u(de, L.props);
              return Zt.ref = gp(N, de, L), Zt.return = N, Zt._debugSource = L._source, Zt._debugOwner = L._owner, Zt;
            }
            a(N, de);
            break;
          } else
            t(N, de);
          de = de.sibling;
        }
        if (L.type === fi) {
          var jt = Io(L.props.children, N.mode, X, L.key);
          return jt.return = N, jt;
        } else {
          var Gn = nE(L, N.mode, X);
          return Gn.ref = gp(N, V, L), Gn.return = N, Gn;
        }
      }
      function _t(N, V, L, X) {
        for (var he = L.key, de = V; de !== null; ) {
          if (de.key === he)
            if (de.tag === ge && de.stateNode.containerInfo === L.containerInfo && de.stateNode.implementation === L.implementation) {
              a(N, de.sibling);
              var Qe = u(de, L.children || []);
              return Qe.return = N, Qe;
            } else {
              a(N, de);
              break;
            }
          else
            t(N, de);
          de = de.sibling;
        }
        var et = aE(L, N.mode, X);
        return et.return = N, et;
      }
      function Ct(N, V, L, X) {
        var he = typeof L == "object" && L !== null && L.type === fi && L.key === null;
        if (he && (L = L.props.children), typeof L == "object" && L !== null) {
          switch (L.$$typeof) {
            case _r:
              return f(De(N, V, L, X));
            case rr:
              return f(_t(N, V, L, X));
            case Ke:
              var de = L._payload, Qe = L._init;
              return Ct(N, V, Qe(de), X);
          }
          if (ct(L))
            return P(N, V, L, X);
          if (rt(L))
            return se(N, V, L, X);
          $h(N, L);
        }
        return typeof L == "string" && L !== "" || typeof L == "number" ? f(je(N, V, "" + L, X)) : (typeof L == "function" && Qh(N), a(N, V));
      }
      return Ct;
    }
    var xf = mC(!0), yC = mC(!1);
    function Lb(e, t) {
      if (e !== null && t.child !== e.child)
        throw new Error("Resuming work not yet implemented.");
      if (t.child !== null) {
        var a = t.child, i = ac(a, a.pendingProps);
        for (t.child = i, i.return = t; a.sibling !== null; )
          a = a.sibling, i = i.sibling = ac(a, a.pendingProps), i.return = t;
        i.sibling = null;
      }
    }
    function Mb(e, t) {
      for (var a = e.child; a !== null; )
        E_(a, t), a = a.sibling;
    }
    var sg = Do(null), cg;
    cg = {};
    var Wh = null, _f = null, fg = null, Gh = !1;
    function qh() {
      Wh = null, _f = null, fg = null, Gh = !1;
    }
    function gC() {
      Gh = !0;
    }
    function SC() {
      Gh = !1;
    }
    function EC(e, t, a) {
      aa(sg, t._currentValue, e), t._currentValue = a, t._currentRenderer !== void 0 && t._currentRenderer !== null && t._currentRenderer !== cg && S("Detected multiple renderers concurrently rendering the same context provider. This is currently unsupported."), t._currentRenderer = cg;
    }
    function dg(e, t) {
      var a = sg.current;
      ra(sg, t), e._currentValue = a;
    }
    function pg(e, t, a) {
      for (var i = e; i !== null; ) {
        var u = i.alternate;
        if (_u(i.childLanes, t) ? u !== null && !_u(u.childLanes, t) && (u.childLanes = at(u.childLanes, t)) : (i.childLanes = at(i.childLanes, t), u !== null && (u.childLanes = at(u.childLanes, t))), i === a)
          break;
        i = i.return;
      }
      i !== a && S("Expected to find the propagation root when scheduling context work. This error is likely caused by a bug in React. Please file an issue.");
    }
    function Ub(e, t, a) {
      zb(e, t, a);
    }
    function zb(e, t, a) {
      var i = e.child;
      for (i !== null && (i.return = e); i !== null; ) {
        var u = void 0, s = i.dependencies;
        if (s !== null) {
          u = i.child;
          for (var f = s.firstContext; f !== null; ) {
            if (f.context === t) {
              if (i.tag === te) {
                var p = Rs(a), v = Hu(tn, p);
                v.tag = Xh;
                var y = i.updateQueue;
                if (y !== null) {
                  var g = y.shared, x = g.pending;
                  x === null ? v.next = v : (v.next = x.next, x.next = v), g.pending = v;
                }
              }
              i.lanes = at(i.lanes, a);
              var w = i.alternate;
              w !== null && (w.lanes = at(w.lanes, a)), pg(i.return, a, e), s.lanes = at(s.lanes, a);
              break;
            }
            f = f.next;
          }
        } else if (i.tag === tt)
          u = i.type === e.type ? null : i.child;
        else if (i.tag === $t) {
          var U = i.return;
          if (U === null)
            throw new Error("We just came from a parent so we must have had a parent. This is a bug in React.");
          U.lanes = at(U.lanes, a);
          var j = U.alternate;
          j !== null && (j.lanes = at(j.lanes, a)), pg(U, a, e), u = i.sibling;
        } else
          u = i.child;
        if (u !== null)
          u.return = i;
        else
          for (u = i; u !== null; ) {
            if (u === e) {
              u = null;
              break;
            }
            var P = u.sibling;
            if (P !== null) {
              P.return = u.return, u = P;
              break;
            }
            u = u.return;
          }
        i = u;
      }
    }
    function kf(e, t) {
      Wh = e, _f = null, fg = null;
      var a = e.dependencies;
      if (a !== null) {
        var i = a.firstContext;
        i !== null && (Zr(a.lanes, t) && Mp(), a.firstContext = null);
      }
    }
    function tr(e) {
      Gh && S("Context can only be read while React is rendering. In classes, you can read it in the render method or getDerivedStateFromProps. In function components, you can read it directly in the function body, but not inside Hooks like useReducer() or useMemo().");
      var t = e._currentValue;
      if (fg !== e) {
        var a = {
          context: e,
          memoizedValue: t,
          next: null
        };
        if (_f === null) {
          if (Wh === null)
            throw new Error("Context can only be read while React is rendering. In classes, you can read it in the render method or getDerivedStateFromProps. In function components, you can read it directly in the function body, but not inside Hooks like useReducer() or useMemo().");
          _f = a, Wh.dependencies = {
            lanes: Q,
            firstContext: a
          };
        } else
          _f = _f.next = a;
      }
      return t;
    }
    var Ks = null;
    function vg(e) {
      Ks === null ? Ks = [e] : Ks.push(e);
    }
    function Ab() {
      if (Ks !== null) {
        for (var e = 0; e < Ks.length; e++) {
          var t = Ks[e], a = t.interleaved;
          if (a !== null) {
            t.interleaved = null;
            var i = a.next, u = t.pending;
            if (u !== null) {
              var s = u.next;
              u.next = i, a.next = s;
            }
            t.pending = a;
          }
        }
        Ks = null;
      }
    }
    function CC(e, t, a, i) {
      var u = t.interleaved;
      return u === null ? (a.next = a, vg(t)) : (a.next = u.next, u.next = a), t.interleaved = a, Kh(e, i);
    }
    function jb(e, t, a, i) {
      var u = t.interleaved;
      u === null ? (a.next = a, vg(t)) : (a.next = u.next, u.next = a), t.interleaved = a;
    }
    function Fb(e, t, a, i) {
      var u = t.interleaved;
      return u === null ? (a.next = a, vg(t)) : (a.next = u.next, u.next = a), t.interleaved = a, Kh(e, i);
    }
    function Fa(e, t) {
      return Kh(e, t);
    }
    var Hb = Kh;
    function Kh(e, t) {
      e.lanes = at(e.lanes, t);
      var a = e.alternate;
      a !== null && (a.lanes = at(a.lanes, t)), a === null && (e.flags & (mn | Gr)) !== Me && yR(e);
      for (var i = e, u = e.return; u !== null; )
        u.childLanes = at(u.childLanes, t), a = u.alternate, a !== null ? a.childLanes = at(a.childLanes, t) : (u.flags & (mn | Gr)) !== Me && yR(e), i = u, u = u.return;
      if (i.tag === ee) {
        var s = i.stateNode;
        return s;
      } else
        return null;
    }
    var RC = 0, TC = 1, Xh = 2, hg = 3, Jh = !1, mg, Zh;
    mg = !1, Zh = null;
    function yg(e) {
      var t = {
        baseState: e.memoizedState,
        firstBaseUpdate: null,
        lastBaseUpdate: null,
        shared: {
          pending: null,
          interleaved: null,
          lanes: Q
        },
        effects: null
      };
      e.updateQueue = t;
    }
    function wC(e, t) {
      var a = t.updateQueue, i = e.updateQueue;
      if (a === i) {
        var u = {
          baseState: i.baseState,
          firstBaseUpdate: i.firstBaseUpdate,
          lastBaseUpdate: i.lastBaseUpdate,
          shared: i.shared,
          effects: i.effects
        };
        t.updateQueue = u;
      }
    }
    function Hu(e, t) {
      var a = {
        eventTime: e,
        lane: t,
        tag: RC,
        payload: null,
        callback: null,
        next: null
      };
      return a;
    }
    function Mo(e, t, a) {
      var i = e.updateQueue;
      if (i === null)
        return null;
      var u = i.shared;
      if (Zh === u && !mg && (S("An update (setState, replaceState, or forceUpdate) was scheduled from inside an update function. Update functions should be pure, with zero side-effects. Consider using componentDidUpdate or a callback."), mg = !0), j1()) {
        var s = u.pending;
        return s === null ? t.next = t : (t.next = s.next, s.next = t), u.pending = t, Hb(e, a);
      } else
        return Fb(e, u, t, a);
    }
    function em(e, t, a) {
      var i = t.updateQueue;
      if (i !== null) {
        var u = i.shared;
        if (Nd(a)) {
          var s = u.lanes;
          s = Md(s, e.pendingLanes);
          var f = at(s, a);
          u.lanes = f, Zc(e, f);
        }
      }
    }
    function gg(e, t) {
      var a = e.updateQueue, i = e.alternate;
      if (i !== null) {
        var u = i.updateQueue;
        if (a === u) {
          var s = null, f = null, p = a.firstBaseUpdate;
          if (p !== null) {
            var v = p;
            do {
              var y = {
                eventTime: v.eventTime,
                lane: v.lane,
                tag: v.tag,
                payload: v.payload,
                callback: v.callback,
                next: null
              };
              f === null ? s = f = y : (f.next = y, f = y), v = v.next;
            } while (v !== null);
            f === null ? s = f = t : (f.next = t, f = t);
          } else
            s = f = t;
          a = {
            baseState: u.baseState,
            firstBaseUpdate: s,
            lastBaseUpdate: f,
            shared: u.shared,
            effects: u.effects
          }, e.updateQueue = a;
          return;
        }
      }
      var g = a.lastBaseUpdate;
      g === null ? a.firstBaseUpdate = t : g.next = t, a.lastBaseUpdate = t;
    }
    function Pb(e, t, a, i, u, s) {
      switch (a.tag) {
        case TC: {
          var f = a.payload;
          if (typeof f == "function") {
            gC();
            var p = f.call(s, i, u);
            {
              if (e.mode & Xt) {
                yn(!0);
                try {
                  f.call(s, i, u);
                } finally {
                  yn(!1);
                }
              }
              SC();
            }
            return p;
          }
          return f;
        }
        case hg:
          e.flags = e.flags & ~Xn | Oe;
        case RC: {
          var v = a.payload, y;
          if (typeof v == "function") {
            gC(), y = v.call(s, i, u);
            {
              if (e.mode & Xt) {
                yn(!0);
                try {
                  v.call(s, i, u);
                } finally {
                  yn(!1);
                }
              }
              SC();
            }
          } else
            y = v;
          return y == null ? i : lt({}, i, y);
        }
        case Xh:
          return Jh = !0, i;
      }
      return i;
    }
    function tm(e, t, a, i) {
      var u = e.updateQueue;
      Jh = !1, Zh = u.shared;
      var s = u.firstBaseUpdate, f = u.lastBaseUpdate, p = u.shared.pending;
      if (p !== null) {
        u.shared.pending = null;
        var v = p, y = v.next;
        v.next = null, f === null ? s = y : f.next = y, f = v;
        var g = e.alternate;
        if (g !== null) {
          var x = g.updateQueue, w = x.lastBaseUpdate;
          w !== f && (w === null ? x.firstBaseUpdate = y : w.next = y, x.lastBaseUpdate = v);
        }
      }
      if (s !== null) {
        var U = u.baseState, j = Q, P = null, se = null, je = null, De = s;
        do {
          var _t = De.lane, Ct = De.eventTime;
          if (_u(i, _t)) {
            if (je !== null) {
              var V = {
                eventTime: Ct,
                // This update is going to be committed so we never want uncommit
                // it. Using NoLane works because 0 is a subset of all bitmasks, so
                // this will never be skipped by the check above.
                lane: Nt,
                tag: De.tag,
                payload: De.payload,
                callback: De.callback,
                next: null
              };
              je = je.next = V;
            }
            U = Pb(e, u, De, U, t, a);
            var L = De.callback;
            if (L !== null && // If the update was already committed, we should not queue its
            // callback again.
            De.lane !== Nt) {
              e.flags |= un;
              var X = u.effects;
              X === null ? u.effects = [De] : X.push(De);
            }
          } else {
            var N = {
              eventTime: Ct,
              lane: _t,
              tag: De.tag,
              payload: De.payload,
              callback: De.callback,
              next: null
            };
            je === null ? (se = je = N, P = U) : je = je.next = N, j = at(j, _t);
          }
          if (De = De.next, De === null) {
            if (p = u.shared.pending, p === null)
              break;
            var he = p, de = he.next;
            he.next = null, De = de, u.lastBaseUpdate = he, u.shared.pending = null;
          }
        } while (!0);
        je === null && (P = U), u.baseState = P, u.firstBaseUpdate = se, u.lastBaseUpdate = je;
        var Qe = u.shared.interleaved;
        if (Qe !== null) {
          var et = Qe;
          do
            j = at(j, et.lane), et = et.next;
          while (et !== Qe);
        } else s === null && (u.shared.lanes = Q);
        $p(j), e.lanes = j, e.memoizedState = U;
      }
      Zh = null;
    }
    function Vb(e, t) {
      if (typeof e != "function")
        throw new Error("Invalid argument passed as callback. Expected a function. Instead " + ("received: " + e));
      e.call(t);
    }
    function bC() {
      Jh = !1;
    }
    function nm() {
      return Jh;
    }
    function xC(e, t, a) {
      var i = t.effects;
      if (t.effects = null, i !== null)
        for (var u = 0; u < i.length; u++) {
          var s = i[u], f = s.callback;
          f !== null && (s.callback = null, Vb(f, a));
        }
    }
    var Sp = {}, Uo = Do(Sp), Ep = Do(Sp), rm = Do(Sp);
    function am(e) {
      if (e === Sp)
        throw new Error("Expected host context to exist. This error is likely caused by a bug in React. Please file an issue.");
      return e;
    }
    function _C() {
      var e = am(rm.current);
      return e;
    }
    function Sg(e, t) {
      aa(rm, t, e), aa(Ep, e, e), aa(Uo, Sp, e);
      var a = aw(t);
      ra(Uo, e), aa(Uo, a, e);
    }
    function Df(e) {
      ra(Uo, e), ra(Ep, e), ra(rm, e);
    }
    function Eg() {
      var e = am(Uo.current);
      return e;
    }
    function kC(e) {
      am(rm.current);
      var t = am(Uo.current), a = iw(t, e.type);
      t !== a && (aa(Ep, e, e), aa(Uo, a, e));
    }
    function Cg(e) {
      Ep.current === e && (ra(Uo, e), ra(Ep, e));
    }
    var Bb = 0, DC = 1, OC = 1, Cp = 2, al = Do(Bb);
    function Rg(e, t) {
      return (e & t) !== 0;
    }
    function Of(e) {
      return e & DC;
    }
    function Tg(e, t) {
      return e & DC | t;
    }
    function Ib(e, t) {
      return e | t;
    }
    function zo(e, t) {
      aa(al, t, e);
    }
    function Nf(e) {
      ra(al, e);
    }
    function Yb(e, t) {
      var a = e.memoizedState;
      return a !== null ? a.dehydrated !== null : (e.memoizedProps, !0);
    }
    function im(e) {
      for (var t = e; t !== null; ) {
        if (t.tag === Ne) {
          var a = t.memoizedState;
          if (a !== null) {
            var i = a.dehydrated;
            if (i === null || WE(i) || Vy(i))
              return t;
          }
        } else if (t.tag === Lt && // revealOrder undefined can't be trusted because it don't
        // keep track of whether it suspended or not.
        t.memoizedProps.revealOrder !== void 0) {
          var u = (t.flags & Oe) !== Me;
          if (u)
            return t;
        } else if (t.child !== null) {
          t.child.return = t, t = t.child;
          continue;
        }
        if (t === e)
          return null;
        for (; t.sibling === null; ) {
          if (t.return === null || t.return === e)
            return null;
          t = t.return;
        }
        t.sibling.return = t.return, t = t.sibling;
      }
      return null;
    }
    var Ha = (
      /*   */
      0
    ), cr = (
      /* */
      1
    ), Yl = (
      /*  */
      2
    ), fr = (
      /*    */
      4
    ), jr = (
      /*   */
      8
    ), wg = [];
    function bg() {
      for (var e = 0; e < wg.length; e++) {
        var t = wg[e];
        t._workInProgressVersionPrimary = null;
      }
      wg.length = 0;
    }
    function $b(e, t) {
      var a = t._getVersion, i = a(t._source);
      e.mutableSourceEagerHydrationData == null ? e.mutableSourceEagerHydrationData = [t, i] : e.mutableSourceEagerHydrationData.push(t, i);
    }
    var ve = k.ReactCurrentDispatcher, Rp = k.ReactCurrentBatchConfig, xg, Lf;
    xg = /* @__PURE__ */ new Set();
    var Xs = Q, Jt = null, dr = null, pr = null, lm = !1, Tp = !1, wp = 0, Qb = 0, Wb = 25, I = null, Ui = null, Ao = -1, _g = !1;
    function Bt() {
      {
        var e = I;
        Ui === null ? Ui = [e] : Ui.push(e);
      }
    }
    function re() {
      {
        var e = I;
        Ui !== null && (Ao++, Ui[Ao] !== e && Gb(e));
      }
    }
    function Mf(e) {
      e != null && !ct(e) && S("%s received a final argument that is not an array (instead, received `%s`). When specified, the final argument must be an array.", I, typeof e);
    }
    function Gb(e) {
      {
        var t = qe(Jt);
        if (!xg.has(t) && (xg.add(t), Ui !== null)) {
          for (var a = "", i = 30, u = 0; u <= Ao; u++) {
            for (var s = Ui[u], f = u === Ao ? e : s, p = u + 1 + ". " + s; p.length < i; )
              p += " ";
            p += f + `
`, a += p;
          }
          S(`React has detected a change in the order of Hooks called by %s. This will lead to bugs and errors if not fixed. For more information, read the Rules of Hooks: https://reactjs.org/link/rules-of-hooks

   Previous render            Next render
   ------------------------------------------------------
%s   ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
`, t, a);
        }
      }
    }
    function ia() {
      throw new Error(`Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app
See https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.`);
    }
    function kg(e, t) {
      if (_g)
        return !1;
      if (t === null)
        return S("%s received a final argument during this render, but not during the previous render. Even though the final argument is optional, its type cannot change between renders.", I), !1;
      e.length !== t.length && S(`The final argument passed to %s changed size between renders. The order and size of this array must remain constant.

Previous: %s
Incoming: %s`, I, "[" + t.join(", ") + "]", "[" + e.join(", ") + "]");
      for (var a = 0; a < t.length && a < e.length; a++)
        if (!q(e[a], t[a]))
          return !1;
      return !0;
    }
    function Uf(e, t, a, i, u, s) {
      Xs = s, Jt = t, Ui = e !== null ? e._debugHookTypes : null, Ao = -1, _g = e !== null && e.type !== t.type, t.memoizedState = null, t.updateQueue = null, t.lanes = Q, e !== null && e.memoizedState !== null ? ve.current = JC : Ui !== null ? ve.current = XC : ve.current = KC;
      var f = a(i, u);
      if (Tp) {
        var p = 0;
        do {
          if (Tp = !1, wp = 0, p >= Wb)
            throw new Error("Too many re-renders. React limits the number of renders to prevent an infinite loop.");
          p += 1, _g = !1, dr = null, pr = null, t.updateQueue = null, Ao = -1, ve.current = ZC, f = a(i, u);
        } while (Tp);
      }
      ve.current = Sm, t._debugHookTypes = Ui;
      var v = dr !== null && dr.next !== null;
      if (Xs = Q, Jt = null, dr = null, pr = null, I = null, Ui = null, Ao = -1, e !== null && (e.flags & Un) !== (t.flags & Un) && // Disable this warning in legacy mode, because legacy Suspense is weird
      // and creates false positives. To make this work in legacy mode, we'd
      // need to mark fibers that commit in an incomplete state, somehow. For
      // now I'll disable the warning that most of the bugs that would trigger
      // it are either exclusive to concurrent mode or exist in both.
      (e.mode & ht) !== Ue && S("Internal React error: Expected static flag was missing. Please notify the React team."), lm = !1, v)
        throw new Error("Rendered fewer hooks than expected. This may be caused by an accidental early return statement.");
      return f;
    }
    function zf() {
      var e = wp !== 0;
      return wp = 0, e;
    }
    function NC(e, t, a) {
      t.updateQueue = e.updateQueue, (t.mode & zt) !== Ue ? t.flags &= -50333701 : t.flags &= -2053, e.lanes = Ts(e.lanes, a);
    }
    function LC() {
      if (ve.current = Sm, lm) {
        for (var e = Jt.memoizedState; e !== null; ) {
          var t = e.queue;
          t !== null && (t.pending = null), e = e.next;
        }
        lm = !1;
      }
      Xs = Q, Jt = null, dr = null, pr = null, Ui = null, Ao = -1, I = null, $C = !1, Tp = !1, wp = 0;
    }
    function $l() {
      var e = {
        memoizedState: null,
        baseState: null,
        baseQueue: null,
        queue: null,
        next: null
      };
      return pr === null ? Jt.memoizedState = pr = e : pr = pr.next = e, pr;
    }
    function zi() {
      var e;
      if (dr === null) {
        var t = Jt.alternate;
        t !== null ? e = t.memoizedState : e = null;
      } else
        e = dr.next;
      var a;
      if (pr === null ? a = Jt.memoizedState : a = pr.next, a !== null)
        pr = a, a = pr.next, dr = e;
      else {
        if (e === null)
          throw new Error("Rendered more hooks than during the previous render.");
        dr = e;
        var i = {
          memoizedState: dr.memoizedState,
          baseState: dr.baseState,
          baseQueue: dr.baseQueue,
          queue: dr.queue,
          next: null
        };
        pr === null ? Jt.memoizedState = pr = i : pr = pr.next = i;
      }
      return pr;
    }
    function MC() {
      return {
        lastEffect: null,
        stores: null
      };
    }
    function Dg(e, t) {
      return typeof t == "function" ? t(e) : t;
    }
    function Og(e, t, a) {
      var i = $l(), u;
      a !== void 0 ? u = a(t) : u = t, i.memoizedState = i.baseState = u;
      var s = {
        pending: null,
        interleaved: null,
        lanes: Q,
        dispatch: null,
        lastRenderedReducer: e,
        lastRenderedState: u
      };
      i.queue = s;
      var f = s.dispatch = Jb.bind(null, Jt, s);
      return [i.memoizedState, f];
    }
    function Ng(e, t, a) {
      var i = zi(), u = i.queue;
      if (u === null)
        throw new Error("Should have a queue. This is likely a bug in React. Please file an issue.");
      u.lastRenderedReducer = e;
      var s = dr, f = s.baseQueue, p = u.pending;
      if (p !== null) {
        if (f !== null) {
          var v = f.next, y = p.next;
          f.next = y, p.next = v;
        }
        s.baseQueue !== f && S("Internal error: Expected work-in-progress queue to be a clone. This is a bug in React."), s.baseQueue = f = p, u.pending = null;
      }
      if (f !== null) {
        var g = f.next, x = s.baseState, w = null, U = null, j = null, P = g;
        do {
          var se = P.lane;
          if (_u(Xs, se)) {
            if (j !== null) {
              var De = {
                // This update is going to be committed so we never want uncommit
                // it. Using NoLane works because 0 is a subset of all bitmasks, so
                // this will never be skipped by the check above.
                lane: Nt,
                action: P.action,
                hasEagerState: P.hasEagerState,
                eagerState: P.eagerState,
                next: null
              };
              j = j.next = De;
            }
            if (P.hasEagerState)
              x = P.eagerState;
            else {
              var _t = P.action;
              x = e(x, _t);
            }
          } else {
            var je = {
              lane: se,
              action: P.action,
              hasEagerState: P.hasEagerState,
              eagerState: P.eagerState,
              next: null
            };
            j === null ? (U = j = je, w = x) : j = j.next = je, Jt.lanes = at(Jt.lanes, se), $p(se);
          }
          P = P.next;
        } while (P !== null && P !== g);
        j === null ? w = x : j.next = U, q(x, i.memoizedState) || Mp(), i.memoizedState = x, i.baseState = w, i.baseQueue = j, u.lastRenderedState = x;
      }
      var Ct = u.interleaved;
      if (Ct !== null) {
        var N = Ct;
        do {
          var V = N.lane;
          Jt.lanes = at(Jt.lanes, V), $p(V), N = N.next;
        } while (N !== Ct);
      } else f === null && (u.lanes = Q);
      var L = u.dispatch;
      return [i.memoizedState, L];
    }
    function Lg(e, t, a) {
      var i = zi(), u = i.queue;
      if (u === null)
        throw new Error("Should have a queue. This is likely a bug in React. Please file an issue.");
      u.lastRenderedReducer = e;
      var s = u.dispatch, f = u.pending, p = i.memoizedState;
      if (f !== null) {
        u.pending = null;
        var v = f.next, y = v;
        do {
          var g = y.action;
          p = e(p, g), y = y.next;
        } while (y !== v);
        q(p, i.memoizedState) || Mp(), i.memoizedState = p, i.baseQueue === null && (i.baseState = p), u.lastRenderedState = p;
      }
      return [p, s];
    }
    function Uk(e, t, a) {
    }
    function zk(e, t, a) {
    }
    function Mg(e, t, a) {
      var i = Jt, u = $l(), s, f = Ar();
      if (f) {
        if (a === void 0)
          throw new Error("Missing getServerSnapshot, which is required for server-rendered content. Will revert to client rendering.");
        s = a(), Lf || s !== a() && (S("The result of getServerSnapshot should be cached to avoid an infinite loop"), Lf = !0);
      } else {
        if (s = t(), !Lf) {
          var p = t();
          q(s, p) || (S("The result of getSnapshot should be cached to avoid an infinite loop"), Lf = !0);
        }
        var v = Fm();
        if (v === null)
          throw new Error("Expected a work-in-progress root. This is a bug in React. Please file an issue.");
        Xc(v, Xs) || UC(i, t, s);
      }
      u.memoizedState = s;
      var y = {
        value: s,
        getSnapshot: t
      };
      return u.queue = y, fm(AC.bind(null, i, y, e), [e]), i.flags |= Wr, bp(cr | jr, zC.bind(null, i, y, s, t), void 0, null), s;
    }
    function um(e, t, a) {
      var i = Jt, u = zi(), s = t();
      if (!Lf) {
        var f = t();
        q(s, f) || (S("The result of getSnapshot should be cached to avoid an infinite loop"), Lf = !0);
      }
      var p = u.memoizedState, v = !q(p, s);
      v && (u.memoizedState = s, Mp());
      var y = u.queue;
      if (_p(AC.bind(null, i, y, e), [e]), y.getSnapshot !== t || v || // Check if the susbcribe function changed. We can save some memory by
      // checking whether we scheduled a subscription effect above.
      pr !== null && pr.memoizedState.tag & cr) {
        i.flags |= Wr, bp(cr | jr, zC.bind(null, i, y, s, t), void 0, null);
        var g = Fm();
        if (g === null)
          throw new Error("Expected a work-in-progress root. This is a bug in React. Please file an issue.");
        Xc(g, Xs) || UC(i, t, s);
      }
      return s;
    }
    function UC(e, t, a) {
      e.flags |= po;
      var i = {
        getSnapshot: t,
        value: a
      }, u = Jt.updateQueue;
      if (u === null)
        u = MC(), Jt.updateQueue = u, u.stores = [i];
      else {
        var s = u.stores;
        s === null ? u.stores = [i] : s.push(i);
      }
    }
    function zC(e, t, a, i) {
      t.value = a, t.getSnapshot = i, jC(t) && FC(e);
    }
    function AC(e, t, a) {
      var i = function() {
        jC(t) && FC(e);
      };
      return a(i);
    }
    function jC(e) {
      var t = e.getSnapshot, a = e.value;
      try {
        var i = t();
        return !q(a, i);
      } catch {
        return !0;
      }
    }
    function FC(e) {
      var t = Fa(e, Ye);
      t !== null && yr(t, e, Ye, tn);
    }
    function om(e) {
      var t = $l();
      typeof e == "function" && (e = e()), t.memoizedState = t.baseState = e;
      var a = {
        pending: null,
        interleaved: null,
        lanes: Q,
        dispatch: null,
        lastRenderedReducer: Dg,
        lastRenderedState: e
      };
      t.queue = a;
      var i = a.dispatch = Zb.bind(null, Jt, a);
      return [t.memoizedState, i];
    }
    function Ug(e) {
      return Ng(Dg);
    }
    function zg(e) {
      return Lg(Dg);
    }
    function bp(e, t, a, i) {
      var u = {
        tag: e,
        create: t,
        destroy: a,
        deps: i,
        // Circular
        next: null
      }, s = Jt.updateQueue;
      if (s === null)
        s = MC(), Jt.updateQueue = s, s.lastEffect = u.next = u;
      else {
        var f = s.lastEffect;
        if (f === null)
          s.lastEffect = u.next = u;
        else {
          var p = f.next;
          f.next = u, u.next = p, s.lastEffect = u;
        }
      }
      return u;
    }
    function Ag(e) {
      var t = $l();
      {
        var a = {
          current: e
        };
        return t.memoizedState = a, a;
      }
    }
    function sm(e) {
      var t = zi();
      return t.memoizedState;
    }
    function xp(e, t, a, i) {
      var u = $l(), s = i === void 0 ? null : i;
      Jt.flags |= e, u.memoizedState = bp(cr | t, a, void 0, s);
    }
    function cm(e, t, a, i) {
      var u = zi(), s = i === void 0 ? null : i, f = void 0;
      if (dr !== null) {
        var p = dr.memoizedState;
        if (f = p.destroy, s !== null) {
          var v = p.deps;
          if (kg(s, v)) {
            u.memoizedState = bp(t, a, f, s);
            return;
          }
        }
      }
      Jt.flags |= e, u.memoizedState = bp(cr | t, a, f, s);
    }
    function fm(e, t) {
      return (Jt.mode & zt) !== Ue ? xp(Ri | Wr | wc, jr, e, t) : xp(Wr | wc, jr, e, t);
    }
    function _p(e, t) {
      return cm(Wr, jr, e, t);
    }
    function jg(e, t) {
      return xp(wt, Yl, e, t);
    }
    function dm(e, t) {
      return cm(wt, Yl, e, t);
    }
    function Fg(e, t) {
      var a = wt;
      return a |= Qi, (Jt.mode & zt) !== Ue && (a |= xl), xp(a, fr, e, t);
    }
    function pm(e, t) {
      return cm(wt, fr, e, t);
    }
    function HC(e, t) {
      if (typeof t == "function") {
        var a = t, i = e();
        return a(i), function() {
          a(null);
        };
      } else if (t != null) {
        var u = t;
        u.hasOwnProperty("current") || S("Expected useImperativeHandle() first argument to either be a ref callback or React.createRef() object. Instead received: %s.", "an object with keys {" + Object.keys(u).join(", ") + "}");
        var s = e();
        return u.current = s, function() {
          u.current = null;
        };
      }
    }
    function Hg(e, t, a) {
      typeof t != "function" && S("Expected useImperativeHandle() second argument to be a function that creates a handle. Instead received: %s.", t !== null ? typeof t : "null");
      var i = a != null ? a.concat([e]) : null, u = wt;
      return u |= Qi, (Jt.mode & zt) !== Ue && (u |= xl), xp(u, fr, HC.bind(null, t, e), i);
    }
    function vm(e, t, a) {
      typeof t != "function" && S("Expected useImperativeHandle() second argument to be a function that creates a handle. Instead received: %s.", t !== null ? typeof t : "null");
      var i = a != null ? a.concat([e]) : null;
      return cm(wt, fr, HC.bind(null, t, e), i);
    }
    function qb(e, t) {
    }
    var hm = qb;
    function Pg(e, t) {
      var a = $l(), i = t === void 0 ? null : t;
      return a.memoizedState = [e, i], e;
    }
    function mm(e, t) {
      var a = zi(), i = t === void 0 ? null : t, u = a.memoizedState;
      if (u !== null && i !== null) {
        var s = u[1];
        if (kg(i, s))
          return u[0];
      }
      return a.memoizedState = [e, i], e;
    }
    function Vg(e, t) {
      var a = $l(), i = t === void 0 ? null : t, u = e();
      return a.memoizedState = [u, i], u;
    }
    function ym(e, t) {
      var a = zi(), i = t === void 0 ? null : t, u = a.memoizedState;
      if (u !== null && i !== null) {
        var s = u[1];
        if (kg(i, s))
          return u[0];
      }
      var f = e();
      return a.memoizedState = [f, i], f;
    }
    function Bg(e) {
      var t = $l();
      return t.memoizedState = e, e;
    }
    function PC(e) {
      var t = zi(), a = dr, i = a.memoizedState;
      return BC(t, i, e);
    }
    function VC(e) {
      var t = zi();
      if (dr === null)
        return t.memoizedState = e, e;
      var a = dr.memoizedState;
      return BC(t, a, e);
    }
    function BC(e, t, a) {
      var i = !Dd(Xs);
      if (i) {
        if (!q(a, t)) {
          var u = Ld();
          Jt.lanes = at(Jt.lanes, u), $p(u), e.baseState = !0;
        }
        return t;
      } else
        return e.baseState && (e.baseState = !1, Mp()), e.memoizedState = a, a;
    }
    function Kb(e, t, a) {
      var i = za();
      jn(Gv(i, xi)), e(!0);
      var u = Rp.transition;
      Rp.transition = {};
      var s = Rp.transition;
      Rp.transition._updatedFibers = /* @__PURE__ */ new Set();
      try {
        e(!1), t();
      } finally {
        if (jn(i), Rp.transition = u, u === null && s._updatedFibers) {
          var f = s._updatedFibers.size;
          f > 10 && ze("Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table."), s._updatedFibers.clear();
        }
      }
    }
    function Ig() {
      var e = om(!1), t = e[0], a = e[1], i = Kb.bind(null, a), u = $l();
      return u.memoizedState = i, [t, i];
    }
    function IC() {
      var e = Ug(), t = e[0], a = zi(), i = a.memoizedState;
      return [t, i];
    }
    function YC() {
      var e = zg(), t = e[0], a = zi(), i = a.memoizedState;
      return [t, i];
    }
    var $C = !1;
    function Xb() {
      return $C;
    }
    function Yg() {
      var e = $l(), t = Fm(), a = t.identifierPrefix, i;
      if (Ar()) {
        var u = vb();
        i = ":" + a + "R" + u;
        var s = wp++;
        s > 0 && (i += "H" + s.toString(32)), i += ":";
      } else {
        var f = Qb++;
        i = ":" + a + "r" + f.toString(32) + ":";
      }
      return e.memoizedState = i, i;
    }
    function gm() {
      var e = zi(), t = e.memoizedState;
      return t;
    }
    function Jb(e, t, a) {
      typeof arguments[3] == "function" && S("State updates from the useState() and useReducer() Hooks don't support the second callback argument. To execute a side effect after rendering, declare it in the component body with useEffect().");
      var i = Vo(e), u = {
        lane: i,
        action: a,
        hasEagerState: !1,
        eagerState: null,
        next: null
      };
      if (QC(e))
        WC(t, u);
      else {
        var s = CC(e, t, u, i);
        if (s !== null) {
          var f = Ea();
          yr(s, e, i, f), GC(s, t, i);
        }
      }
      qC(e, i);
    }
    function Zb(e, t, a) {
      typeof arguments[3] == "function" && S("State updates from the useState() and useReducer() Hooks don't support the second callback argument. To execute a side effect after rendering, declare it in the component body with useEffect().");
      var i = Vo(e), u = {
        lane: i,
        action: a,
        hasEagerState: !1,
        eagerState: null,
        next: null
      };
      if (QC(e))
        WC(t, u);
      else {
        var s = e.alternate;
        if (e.lanes === Q && (s === null || s.lanes === Q)) {
          var f = t.lastRenderedReducer;
          if (f !== null) {
            var p;
            p = ve.current, ve.current = il;
            try {
              var v = t.lastRenderedState, y = f(v, a);
              if (u.hasEagerState = !0, u.eagerState = y, q(y, v)) {
                jb(e, t, u, i);
                return;
              }
            } catch {
            } finally {
              ve.current = p;
            }
          }
        }
        var g = CC(e, t, u, i);
        if (g !== null) {
          var x = Ea();
          yr(g, e, i, x), GC(g, t, i);
        }
      }
      qC(e, i);
    }
    function QC(e) {
      var t = e.alternate;
      return e === Jt || t !== null && t === Jt;
    }
    function WC(e, t) {
      Tp = lm = !0;
      var a = e.pending;
      a === null ? t.next = t : (t.next = a.next, a.next = t), e.pending = t;
    }
    function GC(e, t, a) {
      if (Nd(a)) {
        var i = t.lanes;
        i = Md(i, e.pendingLanes);
        var u = at(i, a);
        t.lanes = u, Zc(e, u);
      }
    }
    function qC(e, t, a) {
      ps(e, t);
    }
    var Sm = {
      readContext: tr,
      useCallback: ia,
      useContext: ia,
      useEffect: ia,
      useImperativeHandle: ia,
      useInsertionEffect: ia,
      useLayoutEffect: ia,
      useMemo: ia,
      useReducer: ia,
      useRef: ia,
      useState: ia,
      useDebugValue: ia,
      useDeferredValue: ia,
      useTransition: ia,
      useMutableSource: ia,
      useSyncExternalStore: ia,
      useId: ia,
      unstable_isNewReconciler: Z
    }, KC = null, XC = null, JC = null, ZC = null, Ql = null, il = null, Em = null;
    {
      var $g = function() {
        S("Context can only be read while React is rendering. In classes, you can read it in the render method or getDerivedStateFromProps. In function components, you can read it directly in the function body, but not inside Hooks like useReducer() or useMemo().");
      }, Xe = function() {
        S("Do not call Hooks inside useEffect(...), useMemo(...), or other built-in Hooks. You can only call Hooks at the top level of your React function. For more information, see https://reactjs.org/link/rules-of-hooks");
      };
      KC = {
        readContext: function(e) {
          return tr(e);
        },
        useCallback: function(e, t) {
          return I = "useCallback", Bt(), Mf(t), Pg(e, t);
        },
        useContext: function(e) {
          return I = "useContext", Bt(), tr(e);
        },
        useEffect: function(e, t) {
          return I = "useEffect", Bt(), Mf(t), fm(e, t);
        },
        useImperativeHandle: function(e, t, a) {
          return I = "useImperativeHandle", Bt(), Mf(a), Hg(e, t, a);
        },
        useInsertionEffect: function(e, t) {
          return I = "useInsertionEffect", Bt(), Mf(t), jg(e, t);
        },
        useLayoutEffect: function(e, t) {
          return I = "useLayoutEffect", Bt(), Mf(t), Fg(e, t);
        },
        useMemo: function(e, t) {
          I = "useMemo", Bt(), Mf(t);
          var a = ve.current;
          ve.current = Ql;
          try {
            return Vg(e, t);
          } finally {
            ve.current = a;
          }
        },
        useReducer: function(e, t, a) {
          I = "useReducer", Bt();
          var i = ve.current;
          ve.current = Ql;
          try {
            return Og(e, t, a);
          } finally {
            ve.current = i;
          }
        },
        useRef: function(e) {
          return I = "useRef", Bt(), Ag(e);
        },
        useState: function(e) {
          I = "useState", Bt();
          var t = ve.current;
          ve.current = Ql;
          try {
            return om(e);
          } finally {
            ve.current = t;
          }
        },
        useDebugValue: function(e, t) {
          return I = "useDebugValue", Bt(), void 0;
        },
        useDeferredValue: function(e) {
          return I = "useDeferredValue", Bt(), Bg(e);
        },
        useTransition: function() {
          return I = "useTransition", Bt(), Ig();
        },
        useMutableSource: function(e, t, a) {
          return I = "useMutableSource", Bt(), void 0;
        },
        useSyncExternalStore: function(e, t, a) {
          return I = "useSyncExternalStore", Bt(), Mg(e, t, a);
        },
        useId: function() {
          return I = "useId", Bt(), Yg();
        },
        unstable_isNewReconciler: Z
      }, XC = {
        readContext: function(e) {
          return tr(e);
        },
        useCallback: function(e, t) {
          return I = "useCallback", re(), Pg(e, t);
        },
        useContext: function(e) {
          return I = "useContext", re(), tr(e);
        },
        useEffect: function(e, t) {
          return I = "useEffect", re(), fm(e, t);
        },
        useImperativeHandle: function(e, t, a) {
          return I = "useImperativeHandle", re(), Hg(e, t, a);
        },
        useInsertionEffect: function(e, t) {
          return I = "useInsertionEffect", re(), jg(e, t);
        },
        useLayoutEffect: function(e, t) {
          return I = "useLayoutEffect", re(), Fg(e, t);
        },
        useMemo: function(e, t) {
          I = "useMemo", re();
          var a = ve.current;
          ve.current = Ql;
          try {
            return Vg(e, t);
          } finally {
            ve.current = a;
          }
        },
        useReducer: function(e, t, a) {
          I = "useReducer", re();
          var i = ve.current;
          ve.current = Ql;
          try {
            return Og(e, t, a);
          } finally {
            ve.current = i;
          }
        },
        useRef: function(e) {
          return I = "useRef", re(), Ag(e);
        },
        useState: function(e) {
          I = "useState", re();
          var t = ve.current;
          ve.current = Ql;
          try {
            return om(e);
          } finally {
            ve.current = t;
          }
        },
        useDebugValue: function(e, t) {
          return I = "useDebugValue", re(), void 0;
        },
        useDeferredValue: function(e) {
          return I = "useDeferredValue", re(), Bg(e);
        },
        useTransition: function() {
          return I = "useTransition", re(), Ig();
        },
        useMutableSource: function(e, t, a) {
          return I = "useMutableSource", re(), void 0;
        },
        useSyncExternalStore: function(e, t, a) {
          return I = "useSyncExternalStore", re(), Mg(e, t, a);
        },
        useId: function() {
          return I = "useId", re(), Yg();
        },
        unstable_isNewReconciler: Z
      }, JC = {
        readContext: function(e) {
          return tr(e);
        },
        useCallback: function(e, t) {
          return I = "useCallback", re(), mm(e, t);
        },
        useContext: function(e) {
          return I = "useContext", re(), tr(e);
        },
        useEffect: function(e, t) {
          return I = "useEffect", re(), _p(e, t);
        },
        useImperativeHandle: function(e, t, a) {
          return I = "useImperativeHandle", re(), vm(e, t, a);
        },
        useInsertionEffect: function(e, t) {
          return I = "useInsertionEffect", re(), dm(e, t);
        },
        useLayoutEffect: function(e, t) {
          return I = "useLayoutEffect", re(), pm(e, t);
        },
        useMemo: function(e, t) {
          I = "useMemo", re();
          var a = ve.current;
          ve.current = il;
          try {
            return ym(e, t);
          } finally {
            ve.current = a;
          }
        },
        useReducer: function(e, t, a) {
          I = "useReducer", re();
          var i = ve.current;
          ve.current = il;
          try {
            return Ng(e, t, a);
          } finally {
            ve.current = i;
          }
        },
        useRef: function(e) {
          return I = "useRef", re(), sm();
        },
        useState: function(e) {
          I = "useState", re();
          var t = ve.current;
          ve.current = il;
          try {
            return Ug(e);
          } finally {
            ve.current = t;
          }
        },
        useDebugValue: function(e, t) {
          return I = "useDebugValue", re(), hm();
        },
        useDeferredValue: function(e) {
          return I = "useDeferredValue", re(), PC(e);
        },
        useTransition: function() {
          return I = "useTransition", re(), IC();
        },
        useMutableSource: function(e, t, a) {
          return I = "useMutableSource", re(), void 0;
        },
        useSyncExternalStore: function(e, t, a) {
          return I = "useSyncExternalStore", re(), um(e, t);
        },
        useId: function() {
          return I = "useId", re(), gm();
        },
        unstable_isNewReconciler: Z
      }, ZC = {
        readContext: function(e) {
          return tr(e);
        },
        useCallback: function(e, t) {
          return I = "useCallback", re(), mm(e, t);
        },
        useContext: function(e) {
          return I = "useContext", re(), tr(e);
        },
        useEffect: function(e, t) {
          return I = "useEffect", re(), _p(e, t);
        },
        useImperativeHandle: function(e, t, a) {
          return I = "useImperativeHandle", re(), vm(e, t, a);
        },
        useInsertionEffect: function(e, t) {
          return I = "useInsertionEffect", re(), dm(e, t);
        },
        useLayoutEffect: function(e, t) {
          return I = "useLayoutEffect", re(), pm(e, t);
        },
        useMemo: function(e, t) {
          I = "useMemo", re();
          var a = ve.current;
          ve.current = Em;
          try {
            return ym(e, t);
          } finally {
            ve.current = a;
          }
        },
        useReducer: function(e, t, a) {
          I = "useReducer", re();
          var i = ve.current;
          ve.current = Em;
          try {
            return Lg(e, t, a);
          } finally {
            ve.current = i;
          }
        },
        useRef: function(e) {
          return I = "useRef", re(), sm();
        },
        useState: function(e) {
          I = "useState", re();
          var t = ve.current;
          ve.current = Em;
          try {
            return zg(e);
          } finally {
            ve.current = t;
          }
        },
        useDebugValue: function(e, t) {
          return I = "useDebugValue", re(), hm();
        },
        useDeferredValue: function(e) {
          return I = "useDeferredValue", re(), VC(e);
        },
        useTransition: function() {
          return I = "useTransition", re(), YC();
        },
        useMutableSource: function(e, t, a) {
          return I = "useMutableSource", re(), void 0;
        },
        useSyncExternalStore: function(e, t, a) {
          return I = "useSyncExternalStore", re(), um(e, t);
        },
        useId: function() {
          return I = "useId", re(), gm();
        },
        unstable_isNewReconciler: Z
      }, Ql = {
        readContext: function(e) {
          return $g(), tr(e);
        },
        useCallback: function(e, t) {
          return I = "useCallback", Xe(), Bt(), Pg(e, t);
        },
        useContext: function(e) {
          return I = "useContext", Xe(), Bt(), tr(e);
        },
        useEffect: function(e, t) {
          return I = "useEffect", Xe(), Bt(), fm(e, t);
        },
        useImperativeHandle: function(e, t, a) {
          return I = "useImperativeHandle", Xe(), Bt(), Hg(e, t, a);
        },
        useInsertionEffect: function(e, t) {
          return I = "useInsertionEffect", Xe(), Bt(), jg(e, t);
        },
        useLayoutEffect: function(e, t) {
          return I = "useLayoutEffect", Xe(), Bt(), Fg(e, t);
        },
        useMemo: function(e, t) {
          I = "useMemo", Xe(), Bt();
          var a = ve.current;
          ve.current = Ql;
          try {
            return Vg(e, t);
          } finally {
            ve.current = a;
          }
        },
        useReducer: function(e, t, a) {
          I = "useReducer", Xe(), Bt();
          var i = ve.current;
          ve.current = Ql;
          try {
            return Og(e, t, a);
          } finally {
            ve.current = i;
          }
        },
        useRef: function(e) {
          return I = "useRef", Xe(), Bt(), Ag(e);
        },
        useState: function(e) {
          I = "useState", Xe(), Bt();
          var t = ve.current;
          ve.current = Ql;
          try {
            return om(e);
          } finally {
            ve.current = t;
          }
        },
        useDebugValue: function(e, t) {
          return I = "useDebugValue", Xe(), Bt(), void 0;
        },
        useDeferredValue: function(e) {
          return I = "useDeferredValue", Xe(), Bt(), Bg(e);
        },
        useTransition: function() {
          return I = "useTransition", Xe(), Bt(), Ig();
        },
        useMutableSource: function(e, t, a) {
          return I = "useMutableSource", Xe(), Bt(), void 0;
        },
        useSyncExternalStore: function(e, t, a) {
          return I = "useSyncExternalStore", Xe(), Bt(), Mg(e, t, a);
        },
        useId: function() {
          return I = "useId", Xe(), Bt(), Yg();
        },
        unstable_isNewReconciler: Z
      }, il = {
        readContext: function(e) {
          return $g(), tr(e);
        },
        useCallback: function(e, t) {
          return I = "useCallback", Xe(), re(), mm(e, t);
        },
        useContext: function(e) {
          return I = "useContext", Xe(), re(), tr(e);
        },
        useEffect: function(e, t) {
          return I = "useEffect", Xe(), re(), _p(e, t);
        },
        useImperativeHandle: function(e, t, a) {
          return I = "useImperativeHandle", Xe(), re(), vm(e, t, a);
        },
        useInsertionEffect: function(e, t) {
          return I = "useInsertionEffect", Xe(), re(), dm(e, t);
        },
        useLayoutEffect: function(e, t) {
          return I = "useLayoutEffect", Xe(), re(), pm(e, t);
        },
        useMemo: function(e, t) {
          I = "useMemo", Xe(), re();
          var a = ve.current;
          ve.current = il;
          try {
            return ym(e, t);
          } finally {
            ve.current = a;
          }
        },
        useReducer: function(e, t, a) {
          I = "useReducer", Xe(), re();
          var i = ve.current;
          ve.current = il;
          try {
            return Ng(e, t, a);
          } finally {
            ve.current = i;
          }
        },
        useRef: function(e) {
          return I = "useRef", Xe(), re(), sm();
        },
        useState: function(e) {
          I = "useState", Xe(), re();
          var t = ve.current;
          ve.current = il;
          try {
            return Ug(e);
          } finally {
            ve.current = t;
          }
        },
        useDebugValue: function(e, t) {
          return I = "useDebugValue", Xe(), re(), hm();
        },
        useDeferredValue: function(e) {
          return I = "useDeferredValue", Xe(), re(), PC(e);
        },
        useTransition: function() {
          return I = "useTransition", Xe(), re(), IC();
        },
        useMutableSource: function(e, t, a) {
          return I = "useMutableSource", Xe(), re(), void 0;
        },
        useSyncExternalStore: function(e, t, a) {
          return I = "useSyncExternalStore", Xe(), re(), um(e, t);
        },
        useId: function() {
          return I = "useId", Xe(), re(), gm();
        },
        unstable_isNewReconciler: Z
      }, Em = {
        readContext: function(e) {
          return $g(), tr(e);
        },
        useCallback: function(e, t) {
          return I = "useCallback", Xe(), re(), mm(e, t);
        },
        useContext: function(e) {
          return I = "useContext", Xe(), re(), tr(e);
        },
        useEffect: function(e, t) {
          return I = "useEffect", Xe(), re(), _p(e, t);
        },
        useImperativeHandle: function(e, t, a) {
          return I = "useImperativeHandle", Xe(), re(), vm(e, t, a);
        },
        useInsertionEffect: function(e, t) {
          return I = "useInsertionEffect", Xe(), re(), dm(e, t);
        },
        useLayoutEffect: function(e, t) {
          return I = "useLayoutEffect", Xe(), re(), pm(e, t);
        },
        useMemo: function(e, t) {
          I = "useMemo", Xe(), re();
          var a = ve.current;
          ve.current = il;
          try {
            return ym(e, t);
          } finally {
            ve.current = a;
          }
        },
        useReducer: function(e, t, a) {
          I = "useReducer", Xe(), re();
          var i = ve.current;
          ve.current = il;
          try {
            return Lg(e, t, a);
          } finally {
            ve.current = i;
          }
        },
        useRef: function(e) {
          return I = "useRef", Xe(), re(), sm();
        },
        useState: function(e) {
          I = "useState", Xe(), re();
          var t = ve.current;
          ve.current = il;
          try {
            return zg(e);
          } finally {
            ve.current = t;
          }
        },
        useDebugValue: function(e, t) {
          return I = "useDebugValue", Xe(), re(), hm();
        },
        useDeferredValue: function(e) {
          return I = "useDeferredValue", Xe(), re(), VC(e);
        },
        useTransition: function() {
          return I = "useTransition", Xe(), re(), YC();
        },
        useMutableSource: function(e, t, a) {
          return I = "useMutableSource", Xe(), re(), void 0;
        },
        useSyncExternalStore: function(e, t, a) {
          return I = "useSyncExternalStore", Xe(), re(), um(e, t);
        },
        useId: function() {
          return I = "useId", Xe(), re(), gm();
        },
        unstable_isNewReconciler: Z
      };
    }
    var jo = F.unstable_now, e0 = 0, Cm = -1, kp = -1, Rm = -1, Qg = !1, Tm = !1;
    function t0() {
      return Qg;
    }
    function ex() {
      Tm = !0;
    }
    function tx() {
      Qg = !1, Tm = !1;
    }
    function nx() {
      Qg = Tm, Tm = !1;
    }
    function n0() {
      return e0;
    }
    function r0() {
      e0 = jo();
    }
    function Wg(e) {
      kp = jo(), e.actualStartTime < 0 && (e.actualStartTime = jo());
    }
    function a0(e) {
      kp = -1;
    }
    function wm(e, t) {
      if (kp >= 0) {
        var a = jo() - kp;
        e.actualDuration += a, t && (e.selfBaseDuration = a), kp = -1;
      }
    }
    function Wl(e) {
      if (Cm >= 0) {
        var t = jo() - Cm;
        Cm = -1;
        for (var a = e.return; a !== null; ) {
          switch (a.tag) {
            case ee:
              var i = a.stateNode;
              i.effectDuration += t;
              return;
            case ft:
              var u = a.stateNode;
              u.effectDuration += t;
              return;
          }
          a = a.return;
        }
      }
    }
    function Gg(e) {
      if (Rm >= 0) {
        var t = jo() - Rm;
        Rm = -1;
        for (var a = e.return; a !== null; ) {
          switch (a.tag) {
            case ee:
              var i = a.stateNode;
              i !== null && (i.passiveEffectDuration += t);
              return;
            case ft:
              var u = a.stateNode;
              u !== null && (u.passiveEffectDuration += t);
              return;
          }
          a = a.return;
        }
      }
    }
    function Gl() {
      Cm = jo();
    }
    function qg() {
      Rm = jo();
    }
    function Kg(e) {
      for (var t = e.child; t; )
        e.actualDuration += t.actualDuration, t = t.sibling;
    }
    function ll(e, t) {
      if (e && e.defaultProps) {
        var a = lt({}, t), i = e.defaultProps;
        for (var u in i)
          a[u] === void 0 && (a[u] = i[u]);
        return a;
      }
      return t;
    }
    var Xg = {}, Jg, Zg, eS, tS, nS, i0, bm, rS, aS, iS, Dp;
    {
      Jg = /* @__PURE__ */ new Set(), Zg = /* @__PURE__ */ new Set(), eS = /* @__PURE__ */ new Set(), tS = /* @__PURE__ */ new Set(), rS = /* @__PURE__ */ new Set(), nS = /* @__PURE__ */ new Set(), aS = /* @__PURE__ */ new Set(), iS = /* @__PURE__ */ new Set(), Dp = /* @__PURE__ */ new Set();
      var l0 = /* @__PURE__ */ new Set();
      bm = function(e, t) {
        if (!(e === null || typeof e == "function")) {
          var a = t + "_" + e;
          l0.has(a) || (l0.add(a), S("%s(...): Expected the last optional `callback` argument to be a function. Instead received: %s.", t, e));
        }
      }, i0 = function(e, t) {
        if (t === void 0) {
          var a = Dt(e) || "Component";
          nS.has(a) || (nS.add(a), S("%s.getDerivedStateFromProps(): A valid state object (or null) must be returned. You have returned undefined.", a));
        }
      }, Object.defineProperty(Xg, "_processChildContext", {
        enumerable: !1,
        value: function() {
          throw new Error("_processChildContext is not available in React 16+. This likely means you have multiple copies of React and are attempting to nest a React 15 tree inside a React 16 tree using unstable_renderSubtreeIntoContainer, which isn't supported. Try to make sure you have only one copy of React (and ideally, switch to ReactDOM.createPortal).");
        }
      }), Object.freeze(Xg);
    }
    function lS(e, t, a, i) {
      var u = e.memoizedState, s = a(i, u);
      {
        if (e.mode & Xt) {
          yn(!0);
          try {
            s = a(i, u);
          } finally {
            yn(!1);
          }
        }
        i0(t, s);
      }
      var f = s == null ? u : lt({}, u, s);
      if (e.memoizedState = f, e.lanes === Q) {
        var p = e.updateQueue;
        p.baseState = f;
      }
    }
    var uS = {
      isMounted: Lv,
      enqueueSetState: function(e, t, a) {
        var i = fo(e), u = Ea(), s = Vo(i), f = Hu(u, s);
        f.payload = t, a != null && (bm(a, "setState"), f.callback = a);
        var p = Mo(i, f, s);
        p !== null && (yr(p, i, s, u), em(p, i, s)), ps(i, s);
      },
      enqueueReplaceState: function(e, t, a) {
        var i = fo(e), u = Ea(), s = Vo(i), f = Hu(u, s);
        f.tag = TC, f.payload = t, a != null && (bm(a, "replaceState"), f.callback = a);
        var p = Mo(i, f, s);
        p !== null && (yr(p, i, s, u), em(p, i, s)), ps(i, s);
      },
      enqueueForceUpdate: function(e, t) {
        var a = fo(e), i = Ea(), u = Vo(a), s = Hu(i, u);
        s.tag = Xh, t != null && (bm(t, "forceUpdate"), s.callback = t);
        var f = Mo(a, s, u);
        f !== null && (yr(f, a, u, i), em(f, a, u)), Nc(a, u);
      }
    };
    function u0(e, t, a, i, u, s, f) {
      var p = e.stateNode;
      if (typeof p.shouldComponentUpdate == "function") {
        var v = p.shouldComponentUpdate(i, s, f);
        {
          if (e.mode & Xt) {
            yn(!0);
            try {
              v = p.shouldComponentUpdate(i, s, f);
            } finally {
              yn(!1);
            }
          }
          v === void 0 && S("%s.shouldComponentUpdate(): Returned undefined instead of a boolean value. Make sure to return true or false.", Dt(t) || "Component");
        }
        return v;
      }
      return t.prototype && t.prototype.isPureReactComponent ? !Ce(a, i) || !Ce(u, s) : !0;
    }
    function rx(e, t, a) {
      var i = e.stateNode;
      {
        var u = Dt(t) || "Component", s = i.render;
        s || (t.prototype && typeof t.prototype.render == "function" ? S("%s(...): No `render` method found on the returned component instance: did you accidentally return an object from the constructor?", u) : S("%s(...): No `render` method found on the returned component instance: you may have forgotten to define `render`.", u)), i.getInitialState && !i.getInitialState.isReactClassApproved && !i.state && S("getInitialState was defined on %s, a plain JavaScript class. This is only supported for classes created using React.createClass. Did you mean to define a state property instead?", u), i.getDefaultProps && !i.getDefaultProps.isReactClassApproved && S("getDefaultProps was defined on %s, a plain JavaScript class. This is only supported for classes created using React.createClass. Use a static property to define defaultProps instead.", u), i.propTypes && S("propTypes was defined as an instance property on %s. Use a static property to define propTypes instead.", u), i.contextType && S("contextType was defined as an instance property on %s. Use a static property to define contextType instead.", u), t.childContextTypes && !Dp.has(t) && // Strict Mode has its own warning for legacy context, so we can skip
        // this one.
        (e.mode & Xt) === Ue && (Dp.add(t), S(`%s uses the legacy childContextTypes API which is no longer supported and will be removed in the next major release. Use React.createContext() instead

.Learn more about this warning here: https://reactjs.org/link/legacy-context`, u)), t.contextTypes && !Dp.has(t) && // Strict Mode has its own warning for legacy context, so we can skip
        // this one.
        (e.mode & Xt) === Ue && (Dp.add(t), S(`%s uses the legacy contextTypes API which is no longer supported and will be removed in the next major release. Use React.createContext() with static contextType instead.

Learn more about this warning here: https://reactjs.org/link/legacy-context`, u)), i.contextTypes && S("contextTypes was defined as an instance property on %s. Use a static property to define contextTypes instead.", u), t.contextType && t.contextTypes && !aS.has(t) && (aS.add(t), S("%s declares both contextTypes and contextType static properties. The legacy contextTypes property will be ignored.", u)), typeof i.componentShouldUpdate == "function" && S("%s has a method called componentShouldUpdate(). Did you mean shouldComponentUpdate()? The name is phrased as a question because the function is expected to return a value.", u), t.prototype && t.prototype.isPureReactComponent && typeof i.shouldComponentUpdate < "u" && S("%s has a method called shouldComponentUpdate(). shouldComponentUpdate should not be used when extending React.PureComponent. Please extend React.Component if shouldComponentUpdate is used.", Dt(t) || "A pure component"), typeof i.componentDidUnmount == "function" && S("%s has a method called componentDidUnmount(). But there is no such lifecycle method. Did you mean componentWillUnmount()?", u), typeof i.componentDidReceiveProps == "function" && S("%s has a method called componentDidReceiveProps(). But there is no such lifecycle method. If you meant to update the state in response to changing props, use componentWillReceiveProps(). If you meant to fetch data or run side-effects or mutations after React has updated the UI, use componentDidUpdate().", u), typeof i.componentWillRecieveProps == "function" && S("%s has a method called componentWillRecieveProps(). Did you mean componentWillReceiveProps()?", u), typeof i.UNSAFE_componentWillRecieveProps == "function" && S("%s has a method called UNSAFE_componentWillRecieveProps(). Did you mean UNSAFE_componentWillReceiveProps()?", u);
        var f = i.props !== a;
        i.props !== void 0 && f && S("%s(...): When calling super() in `%s`, make sure to pass up the same props that your component's constructor was passed.", u, u), i.defaultProps && S("Setting defaultProps as an instance property on %s is not supported and will be ignored. Instead, define defaultProps as a static property on %s.", u, u), typeof i.getSnapshotBeforeUpdate == "function" && typeof i.componentDidUpdate != "function" && !eS.has(t) && (eS.add(t), S("%s: getSnapshotBeforeUpdate() should be used with componentDidUpdate(). This component defines getSnapshotBeforeUpdate() only.", Dt(t))), typeof i.getDerivedStateFromProps == "function" && S("%s: getDerivedStateFromProps() is defined as an instance method and will be ignored. Instead, declare it as a static method.", u), typeof i.getDerivedStateFromError == "function" && S("%s: getDerivedStateFromError() is defined as an instance method and will be ignored. Instead, declare it as a static method.", u), typeof t.getSnapshotBeforeUpdate == "function" && S("%s: getSnapshotBeforeUpdate() is defined as a static method and will be ignored. Instead, declare it as an instance method.", u);
        var p = i.state;
        p && (typeof p != "object" || ct(p)) && S("%s.state: must be set to an object or null", u), typeof i.getChildContext == "function" && typeof t.childContextTypes != "object" && S("%s.getChildContext(): childContextTypes must be defined in order to use getChildContext().", u);
      }
    }
    function o0(e, t) {
      t.updater = uS, e.stateNode = t, pu(t, e), t._reactInternalInstance = Xg;
    }
    function s0(e, t, a) {
      var i = !1, u = li, s = li, f = t.contextType;
      if ("contextType" in t) {
        var p = (
          // Allow null for conditional declaration
          f === null || f !== void 0 && f.$$typeof === R && f._context === void 0
        );
        if (!p && !iS.has(t)) {
          iS.add(t);
          var v = "";
          f === void 0 ? v = " However, it is set to undefined. This can be caused by a typo or by mixing up named and default imports. This can also happen due to a circular dependency, so try moving the createContext() call to a separate file." : typeof f != "object" ? v = " However, it is set to a " + typeof f + "." : f.$$typeof === pi ? v = " Did you accidentally pass the Context.Provider instead?" : f._context !== void 0 ? v = " Did you accidentally pass the Context.Consumer instead?" : v = " However, it is set to an object with keys {" + Object.keys(f).join(", ") + "}.", S("%s defines an invalid contextType. contextType should point to the Context object returned by React.createContext().%s", Dt(t) || "Component", v);
        }
      }
      if (typeof f == "object" && f !== null)
        s = tr(f);
      else {
        u = Cf(e, t, !0);
        var y = t.contextTypes;
        i = y != null, s = i ? Rf(e, u) : li;
      }
      var g = new t(a, s);
      if (e.mode & Xt) {
        yn(!0);
        try {
          g = new t(a, s);
        } finally {
          yn(!1);
        }
      }
      var x = e.memoizedState = g.state !== null && g.state !== void 0 ? g.state : null;
      o0(e, g);
      {
        if (typeof t.getDerivedStateFromProps == "function" && x === null) {
          var w = Dt(t) || "Component";
          Zg.has(w) || (Zg.add(w), S("`%s` uses `getDerivedStateFromProps` but its initial state is %s. This is not recommended. Instead, define the initial state by assigning an object to `this.state` in the constructor of `%s`. This ensures that `getDerivedStateFromProps` arguments have a consistent shape.", w, g.state === null ? "null" : "undefined", w));
        }
        if (typeof t.getDerivedStateFromProps == "function" || typeof g.getSnapshotBeforeUpdate == "function") {
          var U = null, j = null, P = null;
          if (typeof g.componentWillMount == "function" && g.componentWillMount.__suppressDeprecationWarning !== !0 ? U = "componentWillMount" : typeof g.UNSAFE_componentWillMount == "function" && (U = "UNSAFE_componentWillMount"), typeof g.componentWillReceiveProps == "function" && g.componentWillReceiveProps.__suppressDeprecationWarning !== !0 ? j = "componentWillReceiveProps" : typeof g.UNSAFE_componentWillReceiveProps == "function" && (j = "UNSAFE_componentWillReceiveProps"), typeof g.componentWillUpdate == "function" && g.componentWillUpdate.__suppressDeprecationWarning !== !0 ? P = "componentWillUpdate" : typeof g.UNSAFE_componentWillUpdate == "function" && (P = "UNSAFE_componentWillUpdate"), U !== null || j !== null || P !== null) {
            var se = Dt(t) || "Component", je = typeof t.getDerivedStateFromProps == "function" ? "getDerivedStateFromProps()" : "getSnapshotBeforeUpdate()";
            tS.has(se) || (tS.add(se), S(`Unsafe legacy lifecycles will not be called for components using new component APIs.

%s uses %s but also contains the following legacy lifecycles:%s%s%s

The above lifecycles should be removed. Learn more about this warning here:
https://reactjs.org/link/unsafe-component-lifecycles`, se, je, U !== null ? `
  ` + U : "", j !== null ? `
  ` + j : "", P !== null ? `
  ` + P : ""));
          }
        }
      }
      return i && JE(e, u, s), g;
    }
    function ax(e, t) {
      var a = t.state;
      typeof t.componentWillMount == "function" && t.componentWillMount(), typeof t.UNSAFE_componentWillMount == "function" && t.UNSAFE_componentWillMount(), a !== t.state && (S("%s.componentWillMount(): Assigning directly to this.state is deprecated (except inside a component's constructor). Use setState instead.", qe(e) || "Component"), uS.enqueueReplaceState(t, t.state, null));
    }
    function c0(e, t, a, i) {
      var u = t.state;
      if (typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(a, i), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(a, i), t.state !== u) {
        {
          var s = qe(e) || "Component";
          Jg.has(s) || (Jg.add(s), S("%s.componentWillReceiveProps(): Assigning directly to this.state is deprecated (except inside a component's constructor). Use setState instead.", s));
        }
        uS.enqueueReplaceState(t, t.state, null);
      }
    }
    function oS(e, t, a, i) {
      rx(e, t, a);
      var u = e.stateNode;
      u.props = a, u.state = e.memoizedState, u.refs = {}, yg(e);
      var s = t.contextType;
      if (typeof s == "object" && s !== null)
        u.context = tr(s);
      else {
        var f = Cf(e, t, !0);
        u.context = Rf(e, f);
      }
      {
        if (u.state === a) {
          var p = Dt(t) || "Component";
          rS.has(p) || (rS.add(p), S("%s: It is not recommended to assign props directly to state because updates to props won't be reflected in state. In most cases, it is better to use props directly.", p));
        }
        e.mode & Xt && rl.recordLegacyContextWarning(e, u), rl.recordUnsafeLifecycleWarnings(e, u);
      }
      u.state = e.memoizedState;
      var v = t.getDerivedStateFromProps;
      if (typeof v == "function" && (lS(e, t, v, a), u.state = e.memoizedState), typeof t.getDerivedStateFromProps != "function" && typeof u.getSnapshotBeforeUpdate != "function" && (typeof u.UNSAFE_componentWillMount == "function" || typeof u.componentWillMount == "function") && (ax(e, u), tm(e, a, u, i), u.state = e.memoizedState), typeof u.componentDidMount == "function") {
        var y = wt;
        y |= Qi, (e.mode & zt) !== Ue && (y |= xl), e.flags |= y;
      }
    }
    function ix(e, t, a, i) {
      var u = e.stateNode, s = e.memoizedProps;
      u.props = s;
      var f = u.context, p = t.contextType, v = li;
      if (typeof p == "object" && p !== null)
        v = tr(p);
      else {
        var y = Cf(e, t, !0);
        v = Rf(e, y);
      }
      var g = t.getDerivedStateFromProps, x = typeof g == "function" || typeof u.getSnapshotBeforeUpdate == "function";
      !x && (typeof u.UNSAFE_componentWillReceiveProps == "function" || typeof u.componentWillReceiveProps == "function") && (s !== a || f !== v) && c0(e, u, a, v), bC();
      var w = e.memoizedState, U = u.state = w;
      if (tm(e, a, u, i), U = e.memoizedState, s === a && w === U && !Ah() && !nm()) {
        if (typeof u.componentDidMount == "function") {
          var j = wt;
          j |= Qi, (e.mode & zt) !== Ue && (j |= xl), e.flags |= j;
        }
        return !1;
      }
      typeof g == "function" && (lS(e, t, g, a), U = e.memoizedState);
      var P = nm() || u0(e, t, s, a, w, U, v);
      if (P) {
        if (!x && (typeof u.UNSAFE_componentWillMount == "function" || typeof u.componentWillMount == "function") && (typeof u.componentWillMount == "function" && u.componentWillMount(), typeof u.UNSAFE_componentWillMount == "function" && u.UNSAFE_componentWillMount()), typeof u.componentDidMount == "function") {
          var se = wt;
          se |= Qi, (e.mode & zt) !== Ue && (se |= xl), e.flags |= se;
        }
      } else {
        if (typeof u.componentDidMount == "function") {
          var je = wt;
          je |= Qi, (e.mode & zt) !== Ue && (je |= xl), e.flags |= je;
        }
        e.memoizedProps = a, e.memoizedState = U;
      }
      return u.props = a, u.state = U, u.context = v, P;
    }
    function lx(e, t, a, i, u) {
      var s = t.stateNode;
      wC(e, t);
      var f = t.memoizedProps, p = t.type === t.elementType ? f : ll(t.type, f);
      s.props = p;
      var v = t.pendingProps, y = s.context, g = a.contextType, x = li;
      if (typeof g == "object" && g !== null)
        x = tr(g);
      else {
        var w = Cf(t, a, !0);
        x = Rf(t, w);
      }
      var U = a.getDerivedStateFromProps, j = typeof U == "function" || typeof s.getSnapshotBeforeUpdate == "function";
      !j && (typeof s.UNSAFE_componentWillReceiveProps == "function" || typeof s.componentWillReceiveProps == "function") && (f !== v || y !== x) && c0(t, s, i, x), bC();
      var P = t.memoizedState, se = s.state = P;
      if (tm(t, i, s, u), se = t.memoizedState, f === v && P === se && !Ah() && !nm() && !xe)
        return typeof s.componentDidUpdate == "function" && (f !== e.memoizedProps || P !== e.memoizedState) && (t.flags |= wt), typeof s.getSnapshotBeforeUpdate == "function" && (f !== e.memoizedProps || P !== e.memoizedState) && (t.flags |= $n), !1;
      typeof U == "function" && (lS(t, a, U, i), se = t.memoizedState);
      var je = nm() || u0(t, a, p, i, P, se, x) || // TODO: In some cases, we'll end up checking if context has changed twice,
      // both before and after `shouldComponentUpdate` has been called. Not ideal,
      // but I'm loath to refactor this function. This only happens for memoized
      // components so it's not that common.
      xe;
      return je ? (!j && (typeof s.UNSAFE_componentWillUpdate == "function" || typeof s.componentWillUpdate == "function") && (typeof s.componentWillUpdate == "function" && s.componentWillUpdate(i, se, x), typeof s.UNSAFE_componentWillUpdate == "function" && s.UNSAFE_componentWillUpdate(i, se, x)), typeof s.componentDidUpdate == "function" && (t.flags |= wt), typeof s.getSnapshotBeforeUpdate == "function" && (t.flags |= $n)) : (typeof s.componentDidUpdate == "function" && (f !== e.memoizedProps || P !== e.memoizedState) && (t.flags |= wt), typeof s.getSnapshotBeforeUpdate == "function" && (f !== e.memoizedProps || P !== e.memoizedState) && (t.flags |= $n), t.memoizedProps = i, t.memoizedState = se), s.props = i, s.state = se, s.context = x, je;
    }
    function Js(e, t) {
      return {
        value: e,
        source: t,
        stack: Pi(t),
        digest: null
      };
    }
    function sS(e, t, a) {
      return {
        value: e,
        source: null,
        stack: a ?? null,
        digest: t ?? null
      };
    }
    function ux(e, t) {
      return !0;
    }
    function cS(e, t) {
      try {
        var a = ux(e, t);
        if (a === !1)
          return;
        var i = t.value, u = t.source, s = t.stack, f = s !== null ? s : "";
        if (i != null && i._suppressLogging) {
          if (e.tag === te)
            return;
          console.error(i);
        }
        var p = u ? qe(u) : null, v = p ? "The above error occurred in the <" + p + "> component:" : "The above error occurred in one of your React components:", y;
        if (e.tag === ee)
          y = `Consider adding an error boundary to your tree to customize error handling behavior.
Visit https://reactjs.org/link/error-boundaries to learn more about error boundaries.`;
        else {
          var g = qe(e) || "Anonymous";
          y = "React will try to recreate this component tree from scratch " + ("using the error boundary you provided, " + g + ".");
        }
        var x = v + `
` + f + `

` + ("" + y);
        console.error(x);
      } catch (w) {
        setTimeout(function() {
          throw w;
        });
      }
    }
    var ox = typeof WeakMap == "function" ? WeakMap : Map;
    function f0(e, t, a) {
      var i = Hu(tn, a);
      i.tag = hg, i.payload = {
        element: null
      };
      var u = t.value;
      return i.callback = function() {
        e_(u), cS(e, t);
      }, i;
    }
    function fS(e, t, a) {
      var i = Hu(tn, a);
      i.tag = hg;
      var u = e.type.getDerivedStateFromError;
      if (typeof u == "function") {
        var s = t.value;
        i.payload = function() {
          return u(s);
        }, i.callback = function() {
          RR(e), cS(e, t);
        };
      }
      var f = e.stateNode;
      return f !== null && typeof f.componentDidCatch == "function" && (i.callback = function() {
        RR(e), cS(e, t), typeof u != "function" && J1(this);
        var v = t.value, y = t.stack;
        this.componentDidCatch(v, {
          componentStack: y !== null ? y : ""
        }), typeof u != "function" && (Zr(e.lanes, Ye) || S("%s: Error boundaries should implement getDerivedStateFromError(). In that method, return a state update to display an error message or fallback UI.", qe(e) || "Unknown"));
      }), i;
    }
    function d0(e, t, a) {
      var i = e.pingCache, u;
      if (i === null ? (i = e.pingCache = new ox(), u = /* @__PURE__ */ new Set(), i.set(t, u)) : (u = i.get(t), u === void 0 && (u = /* @__PURE__ */ new Set(), i.set(t, u))), !u.has(a)) {
        u.add(a);
        var s = t_.bind(null, e, t, a);
        Xr && Qp(e, a), t.then(s, s);
      }
    }
    function sx(e, t, a, i) {
      var u = e.updateQueue;
      if (u === null) {
        var s = /* @__PURE__ */ new Set();
        s.add(a), e.updateQueue = s;
      } else
        u.add(a);
    }
    function cx(e, t) {
      var a = e.tag;
      if ((e.mode & ht) === Ue && (a === Y || a === Ge || a === He)) {
        var i = e.alternate;
        i ? (e.updateQueue = i.updateQueue, e.memoizedState = i.memoizedState, e.lanes = i.lanes) : (e.updateQueue = null, e.memoizedState = null);
      }
    }
    function p0(e) {
      var t = e;
      do {
        if (t.tag === Ne && Yb(t))
          return t;
        t = t.return;
      } while (t !== null);
      return null;
    }
    function v0(e, t, a, i, u) {
      if ((e.mode & ht) === Ue) {
        if (e === t)
          e.flags |= Xn;
        else {
          if (e.flags |= Oe, a.flags |= Tc, a.flags &= -52805, a.tag === te) {
            var s = a.alternate;
            if (s === null)
              a.tag = Ht;
            else {
              var f = Hu(tn, Ye);
              f.tag = Xh, Mo(a, f, Ye);
            }
          }
          a.lanes = at(a.lanes, Ye);
        }
        return e;
      }
      return e.flags |= Xn, e.lanes = u, e;
    }
    function fx(e, t, a, i, u) {
      if (a.flags |= us, Xr && Qp(e, u), i !== null && typeof i == "object" && typeof i.then == "function") {
        var s = i;
        cx(a), Ar() && a.mode & ht && iC();
        var f = p0(t);
        if (f !== null) {
          f.flags &= ~Cr, v0(f, t, a, e, u), f.mode & ht && d0(e, s, u), sx(f, e, s);
          return;
        } else {
          if (!Pv(u)) {
            d0(e, s, u), YS();
            return;
          }
          var p = new Error("A component suspended while responding to synchronous input. This will cause the UI to be replaced with a loading indicator. To fix, updates that suspend should be wrapped with startTransition.");
          i = p;
        }
      } else if (Ar() && a.mode & ht) {
        iC();
        var v = p0(t);
        if (v !== null) {
          (v.flags & Xn) === Me && (v.flags |= Cr), v0(v, t, a, e, u), rg(Js(i, a));
          return;
        }
      }
      i = Js(i, a), Y1(i);
      var y = t;
      do {
        switch (y.tag) {
          case ee: {
            var g = i;
            y.flags |= Xn;
            var x = Rs(u);
            y.lanes = at(y.lanes, x);
            var w = f0(y, g, x);
            gg(y, w);
            return;
          }
          case te:
            var U = i, j = y.type, P = y.stateNode;
            if ((y.flags & Oe) === Me && (typeof j.getDerivedStateFromError == "function" || P !== null && typeof P.componentDidCatch == "function" && !pR(P))) {
              y.flags |= Xn;
              var se = Rs(u);
              y.lanes = at(y.lanes, se);
              var je = fS(y, U, se);
              gg(y, je);
              return;
            }
            break;
        }
        y = y.return;
      } while (y !== null);
    }
    function dx() {
      return null;
    }
    var Op = k.ReactCurrentOwner, ul = !1, dS, Np, pS, vS, hS, Zs, mS, xm, Lp;
    dS = {}, Np = {}, pS = {}, vS = {}, hS = {}, Zs = !1, mS = {}, xm = {}, Lp = {};
    function ga(e, t, a, i) {
      e === null ? t.child = yC(t, null, a, i) : t.child = xf(t, e.child, a, i);
    }
    function px(e, t, a, i) {
      t.child = xf(t, e.child, null, i), t.child = xf(t, null, a, i);
    }
    function h0(e, t, a, i, u) {
      if (t.type !== t.elementType) {
        var s = a.propTypes;
        s && tl(
          s,
          i,
          // Resolved props
          "prop",
          Dt(a)
        );
      }
      var f = a.render, p = t.ref, v, y;
      kf(t, u), va(t);
      {
        if (Op.current = t, Yn(!0), v = Uf(e, t, f, i, p, u), y = zf(), t.mode & Xt) {
          yn(!0);
          try {
            v = Uf(e, t, f, i, p, u), y = zf();
          } finally {
            yn(!1);
          }
        }
        Yn(!1);
      }
      return ha(), e !== null && !ul ? (NC(e, t, u), Pu(e, t, u)) : (Ar() && y && Xy(t), t.flags |= ti, ga(e, t, v, u), t.child);
    }
    function m0(e, t, a, i, u) {
      if (e === null) {
        var s = a.type;
        if (g_(s) && a.compare === null && // SimpleMemoComponent codepath doesn't resolve outer props either.
        a.defaultProps === void 0) {
          var f = s;
          return f = If(s), t.tag = He, t.type = f, SS(t, s), y0(e, t, f, i, u);
        }
        {
          var p = s.propTypes;
          if (p && tl(
            p,
            i,
            // Resolved props
            "prop",
            Dt(s)
          ), a.defaultProps !== void 0) {
            var v = Dt(s) || "Unknown";
            Lp[v] || (S("%s: Support for defaultProps will be removed from memo components in a future major release. Use JavaScript default parameters instead.", v), Lp[v] = !0);
          }
        }
        var y = tE(a.type, null, i, t, t.mode, u);
        return y.ref = t.ref, y.return = t, t.child = y, y;
      }
      {
        var g = a.type, x = g.propTypes;
        x && tl(
          x,
          i,
          // Resolved props
          "prop",
          Dt(g)
        );
      }
      var w = e.child, U = bS(e, u);
      if (!U) {
        var j = w.memoizedProps, P = a.compare;
        if (P = P !== null ? P : Ce, P(j, i) && e.ref === t.ref)
          return Pu(e, t, u);
      }
      t.flags |= ti;
      var se = ac(w, i);
      return se.ref = t.ref, se.return = t, t.child = se, se;
    }
    function y0(e, t, a, i, u) {
      if (t.type !== t.elementType) {
        var s = t.elementType;
        if (s.$$typeof === Ke) {
          var f = s, p = f._payload, v = f._init;
          try {
            s = v(p);
          } catch {
            s = null;
          }
          var y = s && s.propTypes;
          y && tl(
            y,
            i,
            // Resolved (SimpleMemoComponent has no defaultProps)
            "prop",
            Dt(s)
          );
        }
      }
      if (e !== null) {
        var g = e.memoizedProps;
        if (Ce(g, i) && e.ref === t.ref && // Prevent bailout if the implementation changed due to hot reload.
        t.type === e.type)
          if (ul = !1, t.pendingProps = i = g, bS(e, u))
            (e.flags & Tc) !== Me && (ul = !0);
          else return t.lanes = e.lanes, Pu(e, t, u);
      }
      return yS(e, t, a, i, u);
    }
    function g0(e, t, a) {
      var i = t.pendingProps, u = i.children, s = e !== null ? e.memoizedState : null;
      if (i.mode === "hidden" || ie)
        if ((t.mode & ht) === Ue) {
          var f = {
            baseLanes: Q,
            cachePool: null,
            transitions: null
          };
          t.memoizedState = f, Hm(t, a);
        } else if (Zr(a, Jr)) {
          var x = {
            baseLanes: Q,
            cachePool: null,
            transitions: null
          };
          t.memoizedState = x;
          var w = s !== null ? s.baseLanes : a;
          Hm(t, w);
        } else {
          var p = null, v;
          if (s !== null) {
            var y = s.baseLanes;
            v = at(y, a);
          } else
            v = a;
          t.lanes = t.childLanes = Jr;
          var g = {
            baseLanes: v,
            cachePool: p,
            transitions: null
          };
          return t.memoizedState = g, t.updateQueue = null, Hm(t, v), null;
        }
      else {
        var U;
        s !== null ? (U = at(s.baseLanes, a), t.memoizedState = null) : U = a, Hm(t, U);
      }
      return ga(e, t, u, a), t.child;
    }
    function vx(e, t, a) {
      var i = t.pendingProps;
      return ga(e, t, i, a), t.child;
    }
    function hx(e, t, a) {
      var i = t.pendingProps.children;
      return ga(e, t, i, a), t.child;
    }
    function mx(e, t, a) {
      {
        t.flags |= wt;
        {
          var i = t.stateNode;
          i.effectDuration = 0, i.passiveEffectDuration = 0;
        }
      }
      var u = t.pendingProps, s = u.children;
      return ga(e, t, s, a), t.child;
    }
    function S0(e, t) {
      var a = t.ref;
      (e === null && a !== null || e !== null && e.ref !== a) && (t.flags |= En, t.flags |= vo);
    }
    function yS(e, t, a, i, u) {
      if (t.type !== t.elementType) {
        var s = a.propTypes;
        s && tl(
          s,
          i,
          // Resolved props
          "prop",
          Dt(a)
        );
      }
      var f;
      {
        var p = Cf(t, a, !0);
        f = Rf(t, p);
      }
      var v, y;
      kf(t, u), va(t);
      {
        if (Op.current = t, Yn(!0), v = Uf(e, t, a, i, f, u), y = zf(), t.mode & Xt) {
          yn(!0);
          try {
            v = Uf(e, t, a, i, f, u), y = zf();
          } finally {
            yn(!1);
          }
        }
        Yn(!1);
      }
      return ha(), e !== null && !ul ? (NC(e, t, u), Pu(e, t, u)) : (Ar() && y && Xy(t), t.flags |= ti, ga(e, t, v, u), t.child);
    }
    function E0(e, t, a, i, u) {
      {
        switch (M_(t)) {
          case !1: {
            var s = t.stateNode, f = t.type, p = new f(t.memoizedProps, s.context), v = p.state;
            s.updater.enqueueSetState(s, v, null);
            break;
          }
          case !0: {
            t.flags |= Oe, t.flags |= Xn;
            var y = new Error("Simulated error coming from DevTools"), g = Rs(u);
            t.lanes = at(t.lanes, g);
            var x = fS(t, Js(y, t), g);
            gg(t, x);
            break;
          }
        }
        if (t.type !== t.elementType) {
          var w = a.propTypes;
          w && tl(
            w,
            i,
            // Resolved props
            "prop",
            Dt(a)
          );
        }
      }
      var U;
      Il(a) ? (U = !0, Fh(t)) : U = !1, kf(t, u);
      var j = t.stateNode, P;
      j === null ? (km(e, t), s0(t, a, i), oS(t, a, i, u), P = !0) : e === null ? P = ix(t, a, i, u) : P = lx(e, t, a, i, u);
      var se = gS(e, t, a, P, U, u);
      {
        var je = t.stateNode;
        P && je.props !== i && (Zs || S("It looks like %s is reassigning its own `this.props` while rendering. This is not supported and can lead to confusing bugs.", qe(t) || "a component"), Zs = !0);
      }
      return se;
    }
    function gS(e, t, a, i, u, s) {
      S0(e, t);
      var f = (t.flags & Oe) !== Me;
      if (!i && !f)
        return u && tC(t, a, !1), Pu(e, t, s);
      var p = t.stateNode;
      Op.current = t;
      var v;
      if (f && typeof a.getDerivedStateFromError != "function")
        v = null, a0();
      else {
        va(t);
        {
          if (Yn(!0), v = p.render(), t.mode & Xt) {
            yn(!0);
            try {
              p.render();
            } finally {
              yn(!1);
            }
          }
          Yn(!1);
        }
        ha();
      }
      return t.flags |= ti, e !== null && f ? px(e, t, v, s) : ga(e, t, v, s), t.memoizedState = p.state, u && tC(t, a, !0), t.child;
    }
    function C0(e) {
      var t = e.stateNode;
      t.pendingContext ? ZE(e, t.pendingContext, t.pendingContext !== t.context) : t.context && ZE(e, t.context, !1), Sg(e, t.containerInfo);
    }
    function yx(e, t, a) {
      if (C0(t), e === null)
        throw new Error("Should have a current fiber. This is a bug in React.");
      var i = t.pendingProps, u = t.memoizedState, s = u.element;
      wC(e, t), tm(t, i, null, a);
      var f = t.memoizedState;
      t.stateNode;
      var p = f.element;
      if (u.isDehydrated) {
        var v = {
          element: p,
          isDehydrated: !1,
          cache: f.cache,
          pendingSuspenseBoundaries: f.pendingSuspenseBoundaries,
          transitions: f.transitions
        }, y = t.updateQueue;
        if (y.baseState = v, t.memoizedState = v, t.flags & Cr) {
          var g = Js(new Error("There was an error while hydrating. Because the error happened outside of a Suspense boundary, the entire root will switch to client rendering."), t);
          return R0(e, t, p, a, g);
        } else if (p !== s) {
          var x = Js(new Error("This root received an early update, before anything was able hydrate. Switched the entire root to client rendering."), t);
          return R0(e, t, p, a, x);
        } else {
          Eb(t);
          var w = yC(t, null, p, a);
          t.child = w;
          for (var U = w; U; )
            U.flags = U.flags & ~mn | Gr, U = U.sibling;
        }
      } else {
        if (bf(), p === s)
          return Pu(e, t, a);
        ga(e, t, p, a);
      }
      return t.child;
    }
    function R0(e, t, a, i, u) {
      return bf(), rg(u), t.flags |= Cr, ga(e, t, a, i), t.child;
    }
    function gx(e, t, a) {
      kC(t), e === null && ng(t);
      var i = t.type, u = t.pendingProps, s = e !== null ? e.memoizedProps : null, f = u.children, p = jy(i, u);
      return p ? f = null : s !== null && jy(i, s) && (t.flags |= Da), S0(e, t), ga(e, t, f, a), t.child;
    }
    function Sx(e, t) {
      return e === null && ng(t), null;
    }
    function Ex(e, t, a, i) {
      km(e, t);
      var u = t.pendingProps, s = a, f = s._payload, p = s._init, v = p(f);
      t.type = v;
      var y = t.tag = S_(v), g = ll(v, u), x;
      switch (y) {
        case Y:
          return SS(t, v), t.type = v = If(v), x = yS(null, t, v, g, i), x;
        case te:
          return t.type = v = qS(v), x = E0(null, t, v, g, i), x;
        case Ge:
          return t.type = v = KS(v), x = h0(null, t, v, g, i), x;
        case Ze: {
          if (t.type !== t.elementType) {
            var w = v.propTypes;
            w && tl(
              w,
              g,
              // Resolved for outer only
              "prop",
              Dt(v)
            );
          }
          return x = m0(
            null,
            t,
            v,
            ll(v.type, g),
            // The inner type can have defaults too
            i
          ), x;
        }
      }
      var U = "";
      throw v !== null && typeof v == "object" && v.$$typeof === Ke && (U = " Did you wrap a component in React.lazy() more than once?"), new Error("Element type is invalid. Received a promise that resolves to: " + v + ". " + ("Lazy element type must resolve to a class or function." + U));
    }
    function Cx(e, t, a, i, u) {
      km(e, t), t.tag = te;
      var s;
      return Il(a) ? (s = !0, Fh(t)) : s = !1, kf(t, u), s0(t, a, i), oS(t, a, i, u), gS(null, t, a, !0, s, u);
    }
    function Rx(e, t, a, i) {
      km(e, t);
      var u = t.pendingProps, s;
      {
        var f = Cf(t, a, !1);
        s = Rf(t, f);
      }
      kf(t, i);
      var p, v;
      va(t);
      {
        if (a.prototype && typeof a.prototype.render == "function") {
          var y = Dt(a) || "Unknown";
          dS[y] || (S("The <%s /> component appears to have a render method, but doesn't extend React.Component. This is likely to cause errors. Change %s to extend React.Component instead.", y, y), dS[y] = !0);
        }
        t.mode & Xt && rl.recordLegacyContextWarning(t, null), Yn(!0), Op.current = t, p = Uf(null, t, a, u, s, i), v = zf(), Yn(!1);
      }
      if (ha(), t.flags |= ti, typeof p == "object" && p !== null && typeof p.render == "function" && p.$$typeof === void 0) {
        var g = Dt(a) || "Unknown";
        Np[g] || (S("The <%s /> component appears to be a function component that returns a class instance. Change %s to a class that extends React.Component instead. If you can't use a class try assigning the prototype on the function as a workaround. `%s.prototype = React.Component.prototype`. Don't use an arrow function since it cannot be called with `new` by React.", g, g, g), Np[g] = !0);
      }
      if (
        // Run these checks in production only if the flag is off.
        // Eventually we'll delete this branch altogether.
        typeof p == "object" && p !== null && typeof p.render == "function" && p.$$typeof === void 0
      ) {
        {
          var x = Dt(a) || "Unknown";
          Np[x] || (S("The <%s /> component appears to be a function component that returns a class instance. Change %s to a class that extends React.Component instead. If you can't use a class try assigning the prototype on the function as a workaround. `%s.prototype = React.Component.prototype`. Don't use an arrow function since it cannot be called with `new` by React.", x, x, x), Np[x] = !0);
        }
        t.tag = te, t.memoizedState = null, t.updateQueue = null;
        var w = !1;
        return Il(a) ? (w = !0, Fh(t)) : w = !1, t.memoizedState = p.state !== null && p.state !== void 0 ? p.state : null, yg(t), o0(t, p), oS(t, a, u, i), gS(null, t, a, !0, w, i);
      } else {
        if (t.tag = Y, t.mode & Xt) {
          yn(!0);
          try {
            p = Uf(null, t, a, u, s, i), v = zf();
          } finally {
            yn(!1);
          }
        }
        return Ar() && v && Xy(t), ga(null, t, p, i), SS(t, a), t.child;
      }
    }
    function SS(e, t) {
      {
        if (t && t.childContextTypes && S("%s(...): childContextTypes cannot be defined on a function component.", t.displayName || t.name || "Component"), e.ref !== null) {
          var a = "", i = Dr();
          i && (a += `

Check the render method of \`` + i + "`.");
          var u = i || "", s = e._debugSource;
          s && (u = s.fileName + ":" + s.lineNumber), hS[u] || (hS[u] = !0, S("Function components cannot be given refs. Attempts to access this ref will fail. Did you mean to use React.forwardRef()?%s", a));
        }
        if (t.defaultProps !== void 0) {
          var f = Dt(t) || "Unknown";
          Lp[f] || (S("%s: Support for defaultProps will be removed from function components in a future major release. Use JavaScript default parameters instead.", f), Lp[f] = !0);
        }
        if (typeof t.getDerivedStateFromProps == "function") {
          var p = Dt(t) || "Unknown";
          vS[p] || (S("%s: Function components do not support getDerivedStateFromProps.", p), vS[p] = !0);
        }
        if (typeof t.contextType == "object" && t.contextType !== null) {
          var v = Dt(t) || "Unknown";
          pS[v] || (S("%s: Function components do not support contextType.", v), pS[v] = !0);
        }
      }
    }
    var ES = {
      dehydrated: null,
      treeContext: null,
      retryLane: Nt
    };
    function CS(e) {
      return {
        baseLanes: e,
        cachePool: dx(),
        transitions: null
      };
    }
    function Tx(e, t) {
      var a = null;
      return {
        baseLanes: at(e.baseLanes, t),
        cachePool: a,
        transitions: e.transitions
      };
    }
    function wx(e, t, a, i) {
      if (t !== null) {
        var u = t.memoizedState;
        if (u === null)
          return !1;
      }
      return Rg(e, Cp);
    }
    function bx(e, t) {
      return Ts(e.childLanes, t);
    }
    function T0(e, t, a) {
      var i = t.pendingProps;
      U_(t) && (t.flags |= Oe);
      var u = al.current, s = !1, f = (t.flags & Oe) !== Me;
      if (f || wx(u, e) ? (s = !0, t.flags &= ~Oe) : (e === null || e.memoizedState !== null) && (u = Ib(u, OC)), u = Of(u), zo(t, u), e === null) {
        ng(t);
        var p = t.memoizedState;
        if (p !== null) {
          var v = p.dehydrated;
          if (v !== null)
            return Ox(t, v);
        }
        var y = i.children, g = i.fallback;
        if (s) {
          var x = xx(t, y, g, a), w = t.child;
          return w.memoizedState = CS(a), t.memoizedState = ES, x;
        } else
          return RS(t, y);
      } else {
        var U = e.memoizedState;
        if (U !== null) {
          var j = U.dehydrated;
          if (j !== null)
            return Nx(e, t, f, i, j, U, a);
        }
        if (s) {
          var P = i.fallback, se = i.children, je = kx(e, t, se, P, a), De = t.child, _t = e.child.memoizedState;
          return De.memoizedState = _t === null ? CS(a) : Tx(_t, a), De.childLanes = bx(e, a), t.memoizedState = ES, je;
        } else {
          var Ct = i.children, N = _x(e, t, Ct, a);
          return t.memoizedState = null, N;
        }
      }
    }
    function RS(e, t, a) {
      var i = e.mode, u = {
        mode: "visible",
        children: t
      }, s = TS(u, i);
      return s.return = e, e.child = s, s;
    }
    function xx(e, t, a, i) {
      var u = e.mode, s = e.child, f = {
        mode: "hidden",
        children: t
      }, p, v;
      return (u & ht) === Ue && s !== null ? (p = s, p.childLanes = Q, p.pendingProps = f, e.mode & Ut && (p.actualDuration = 0, p.actualStartTime = -1, p.selfBaseDuration = 0, p.treeBaseDuration = 0), v = Io(a, u, i, null)) : (p = TS(f, u), v = Io(a, u, i, null)), p.return = e, v.return = e, p.sibling = v, e.child = p, v;
    }
    function TS(e, t, a) {
      return wR(e, t, Q, null);
    }
    function w0(e, t) {
      return ac(e, t);
    }
    function _x(e, t, a, i) {
      var u = e.child, s = u.sibling, f = w0(u, {
        mode: "visible",
        children: a
      });
      if ((t.mode & ht) === Ue && (f.lanes = i), f.return = t, f.sibling = null, s !== null) {
        var p = t.deletions;
        p === null ? (t.deletions = [s], t.flags |= ka) : p.push(s);
      }
      return t.child = f, f;
    }
    function kx(e, t, a, i, u) {
      var s = t.mode, f = e.child, p = f.sibling, v = {
        mode: "hidden",
        children: a
      }, y;
      if (
        // In legacy mode, we commit the primary tree as if it successfully
        // completed, even though it's in an inconsistent state.
        (s & ht) === Ue && // Make sure we're on the second pass, i.e. the primary child fragment was
        // already cloned. In legacy mode, the only case where this isn't true is
        // when DevTools forces us to display a fallback; we skip the first render
        // pass entirely and go straight to rendering the fallback. (In Concurrent
        // Mode, SuspenseList can also trigger this scenario, but this is a legacy-
        // only codepath.)
        t.child !== f
      ) {
        var g = t.child;
        y = g, y.childLanes = Q, y.pendingProps = v, t.mode & Ut && (y.actualDuration = 0, y.actualStartTime = -1, y.selfBaseDuration = f.selfBaseDuration, y.treeBaseDuration = f.treeBaseDuration), t.deletions = null;
      } else
        y = w0(f, v), y.subtreeFlags = f.subtreeFlags & Un;
      var x;
      return p !== null ? x = ac(p, i) : (x = Io(i, s, u, null), x.flags |= mn), x.return = t, y.return = t, y.sibling = x, t.child = y, x;
    }
    function _m(e, t, a, i) {
      i !== null && rg(i), xf(t, e.child, null, a);
      var u = t.pendingProps, s = u.children, f = RS(t, s);
      return f.flags |= mn, t.memoizedState = null, f;
    }
    function Dx(e, t, a, i, u) {
      var s = t.mode, f = {
        mode: "visible",
        children: a
      }, p = TS(f, s), v = Io(i, s, u, null);
      return v.flags |= mn, p.return = t, v.return = t, p.sibling = v, t.child = p, (t.mode & ht) !== Ue && xf(t, e.child, null, u), v;
    }
    function Ox(e, t, a) {
      return (e.mode & ht) === Ue ? (S("Cannot hydrate Suspense in legacy mode. Switch from ReactDOM.hydrate(element, container) to ReactDOMClient.hydrateRoot(container, <App />).render(element) or remove the Suspense components from the server rendered components."), e.lanes = Ye) : Vy(t) ? e.lanes = Rr : e.lanes = Jr, null;
    }
    function Nx(e, t, a, i, u, s, f) {
      if (a)
        if (t.flags & Cr) {
          t.flags &= ~Cr;
          var N = sS(new Error("There was an error while hydrating this Suspense boundary. Switched to client rendering."));
          return _m(e, t, f, N);
        } else {
          if (t.memoizedState !== null)
            return t.child = e.child, t.flags |= Oe, null;
          var V = i.children, L = i.fallback, X = Dx(e, t, V, L, f), he = t.child;
          return he.memoizedState = CS(f), t.memoizedState = ES, X;
        }
      else {
        if (gb(), (t.mode & ht) === Ue)
          return _m(
            e,
            t,
            f,
            // TODO: When we delete legacy mode, we should make this error argument
            // required — every concurrent mode path that causes hydration to
            // de-opt to client rendering should have an error message.
            null
          );
        if (Vy(u)) {
          var p, v, y;
          {
            var g = zw(u);
            p = g.digest, v = g.message, y = g.stack;
          }
          var x;
          v ? x = new Error(v) : x = new Error("The server could not finish this Suspense boundary, likely due to an error during server rendering. Switched to client rendering.");
          var w = sS(x, p, y);
          return _m(e, t, f, w);
        }
        var U = Zr(f, e.childLanes);
        if (ul || U) {
          var j = Fm();
          if (j !== null) {
            var P = zd(j, f);
            if (P !== Nt && P !== s.retryLane) {
              s.retryLane = P;
              var se = tn;
              Fa(e, P), yr(j, e, P, se);
            }
          }
          YS();
          var je = sS(new Error("This Suspense boundary received an update before it finished hydrating. This caused the boundary to switch to client rendering. The usual way to fix this is to wrap the original update in startTransition."));
          return _m(e, t, f, je);
        } else if (WE(u)) {
          t.flags |= Oe, t.child = e.child;
          var De = n_.bind(null, e);
          return Aw(u, De), null;
        } else {
          Cb(t, u, s.treeContext);
          var _t = i.children, Ct = RS(t, _t);
          return Ct.flags |= Gr, Ct;
        }
      }
    }
    function b0(e, t, a) {
      e.lanes = at(e.lanes, t);
      var i = e.alternate;
      i !== null && (i.lanes = at(i.lanes, t)), pg(e.return, t, a);
    }
    function Lx(e, t, a) {
      for (var i = t; i !== null; ) {
        if (i.tag === Ne) {
          var u = i.memoizedState;
          u !== null && b0(i, a, e);
        } else if (i.tag === Lt)
          b0(i, a, e);
        else if (i.child !== null) {
          i.child.return = i, i = i.child;
          continue;
        }
        if (i === e)
          return;
        for (; i.sibling === null; ) {
          if (i.return === null || i.return === e)
            return;
          i = i.return;
        }
        i.sibling.return = i.return, i = i.sibling;
      }
    }
    function Mx(e) {
      for (var t = e, a = null; t !== null; ) {
        var i = t.alternate;
        i !== null && im(i) === null && (a = t), t = t.sibling;
      }
      return a;
    }
    function Ux(e) {
      if (e !== void 0 && e !== "forwards" && e !== "backwards" && e !== "together" && !mS[e])
        if (mS[e] = !0, typeof e == "string")
          switch (e.toLowerCase()) {
            case "together":
            case "forwards":
            case "backwards": {
              S('"%s" is not a valid value for revealOrder on <SuspenseList />. Use lowercase "%s" instead.', e, e.toLowerCase());
              break;
            }
            case "forward":
            case "backward": {
              S('"%s" is not a valid value for revealOrder on <SuspenseList />. React uses the -s suffix in the spelling. Use "%ss" instead.', e, e.toLowerCase());
              break;
            }
            default:
              S('"%s" is not a supported revealOrder on <SuspenseList />. Did you mean "together", "forwards" or "backwards"?', e);
              break;
          }
        else
          S('%s is not a supported value for revealOrder on <SuspenseList />. Did you mean "together", "forwards" or "backwards"?', e);
    }
    function zx(e, t) {
      e !== void 0 && !xm[e] && (e !== "collapsed" && e !== "hidden" ? (xm[e] = !0, S('"%s" is not a supported value for tail on <SuspenseList />. Did you mean "collapsed" or "hidden"?', e)) : t !== "forwards" && t !== "backwards" && (xm[e] = !0, S('<SuspenseList tail="%s" /> is only valid if revealOrder is "forwards" or "backwards". Did you mean to specify revealOrder="forwards"?', e)));
    }
    function x0(e, t) {
      {
        var a = ct(e), i = !a && typeof rt(e) == "function";
        if (a || i) {
          var u = a ? "array" : "iterable";
          return S("A nested %s was passed to row #%s in <SuspenseList />. Wrap it in an additional SuspenseList to configure its revealOrder: <SuspenseList revealOrder=...> ... <SuspenseList revealOrder=...>{%s}</SuspenseList> ... </SuspenseList>", u, t, u), !1;
        }
      }
      return !0;
    }
    function Ax(e, t) {
      if ((t === "forwards" || t === "backwards") && e !== void 0 && e !== null && e !== !1)
        if (ct(e)) {
          for (var a = 0; a < e.length; a++)
            if (!x0(e[a], a))
              return;
        } else {
          var i = rt(e);
          if (typeof i == "function") {
            var u = i.call(e);
            if (u)
              for (var s = u.next(), f = 0; !s.done; s = u.next()) {
                if (!x0(s.value, f))
                  return;
                f++;
              }
          } else
            S('A single row was passed to a <SuspenseList revealOrder="%s" />. This is not useful since it needs multiple rows. Did you mean to pass multiple children or an array?', t);
        }
    }
    function wS(e, t, a, i, u) {
      var s = e.memoizedState;
      s === null ? e.memoizedState = {
        isBackwards: t,
        rendering: null,
        renderingStartTime: 0,
        last: i,
        tail: a,
        tailMode: u
      } : (s.isBackwards = t, s.rendering = null, s.renderingStartTime = 0, s.last = i, s.tail = a, s.tailMode = u);
    }
    function _0(e, t, a) {
      var i = t.pendingProps, u = i.revealOrder, s = i.tail, f = i.children;
      Ux(u), zx(s, u), Ax(f, u), ga(e, t, f, a);
      var p = al.current, v = Rg(p, Cp);
      if (v)
        p = Tg(p, Cp), t.flags |= Oe;
      else {
        var y = e !== null && (e.flags & Oe) !== Me;
        y && Lx(t, t.child, a), p = Of(p);
      }
      if (zo(t, p), (t.mode & ht) === Ue)
        t.memoizedState = null;
      else
        switch (u) {
          case "forwards": {
            var g = Mx(t.child), x;
            g === null ? (x = t.child, t.child = null) : (x = g.sibling, g.sibling = null), wS(
              t,
              !1,
              // isBackwards
              x,
              g,
              s
            );
            break;
          }
          case "backwards": {
            var w = null, U = t.child;
            for (t.child = null; U !== null; ) {
              var j = U.alternate;
              if (j !== null && im(j) === null) {
                t.child = U;
                break;
              }
              var P = U.sibling;
              U.sibling = w, w = U, U = P;
            }
            wS(
              t,
              !0,
              // isBackwards
              w,
              null,
              // last
              s
            );
            break;
          }
          case "together": {
            wS(
              t,
              !1,
              // isBackwards
              null,
              // tail
              null,
              // last
              void 0
            );
            break;
          }
          default:
            t.memoizedState = null;
        }
      return t.child;
    }
    function jx(e, t, a) {
      Sg(t, t.stateNode.containerInfo);
      var i = t.pendingProps;
      return e === null ? t.child = xf(t, null, i, a) : ga(e, t, i, a), t.child;
    }
    var k0 = !1;
    function Fx(e, t, a) {
      var i = t.type, u = i._context, s = t.pendingProps, f = t.memoizedProps, p = s.value;
      {
        "value" in s || k0 || (k0 = !0, S("The `value` prop is required for the `<Context.Provider>`. Did you misspell it or forget to pass it?"));
        var v = t.type.propTypes;
        v && tl(v, s, "prop", "Context.Provider");
      }
      if (EC(t, u, p), f !== null) {
        var y = f.value;
        if (q(y, p)) {
          if (f.children === s.children && !Ah())
            return Pu(e, t, a);
        } else
          Ub(t, u, a);
      }
      var g = s.children;
      return ga(e, t, g, a), t.child;
    }
    var D0 = !1;
    function Hx(e, t, a) {
      var i = t.type;
      i._context === void 0 ? i !== i.Consumer && (D0 || (D0 = !0, S("Rendering <Context> directly is not supported and will be removed in a future major release. Did you mean to render <Context.Consumer> instead?"))) : i = i._context;
      var u = t.pendingProps, s = u.children;
      typeof s != "function" && S("A context consumer was rendered with multiple children, or a child that isn't a function. A context consumer expects a single child that is a function. If you did pass a function, make sure there is no trailing or leading whitespace around it."), kf(t, a);
      var f = tr(i);
      va(t);
      var p;
      return Op.current = t, Yn(!0), p = s(f), Yn(!1), ha(), t.flags |= ti, ga(e, t, p, a), t.child;
    }
    function Mp() {
      ul = !0;
    }
    function km(e, t) {
      (t.mode & ht) === Ue && e !== null && (e.alternate = null, t.alternate = null, t.flags |= mn);
    }
    function Pu(e, t, a) {
      return e !== null && (t.dependencies = e.dependencies), a0(), $p(t.lanes), Zr(a, t.childLanes) ? (Lb(e, t), t.child) : null;
    }
    function Px(e, t, a) {
      {
        var i = t.return;
        if (i === null)
          throw new Error("Cannot swap the root fiber.");
        if (e.alternate = null, t.alternate = null, a.index = t.index, a.sibling = t.sibling, a.return = t.return, a.ref = t.ref, t === i.child)
          i.child = a;
        else {
          var u = i.child;
          if (u === null)
            throw new Error("Expected parent to have a child.");
          for (; u.sibling !== t; )
            if (u = u.sibling, u === null)
              throw new Error("Expected to find the previous sibling.");
          u.sibling = a;
        }
        var s = i.deletions;
        return s === null ? (i.deletions = [e], i.flags |= ka) : s.push(e), a.flags |= mn, a;
      }
    }
    function bS(e, t) {
      var a = e.lanes;
      return !!Zr(a, t);
    }
    function Vx(e, t, a) {
      switch (t.tag) {
        case ee:
          C0(t), t.stateNode, bf();
          break;
        case ae:
          kC(t);
          break;
        case te: {
          var i = t.type;
          Il(i) && Fh(t);
          break;
        }
        case ge:
          Sg(t, t.stateNode.containerInfo);
          break;
        case tt: {
          var u = t.memoizedProps.value, s = t.type._context;
          EC(t, s, u);
          break;
        }
        case ft:
          {
            var f = Zr(a, t.childLanes);
            f && (t.flags |= wt);
            {
              var p = t.stateNode;
              p.effectDuration = 0, p.passiveEffectDuration = 0;
            }
          }
          break;
        case Ne: {
          var v = t.memoizedState;
          if (v !== null) {
            if (v.dehydrated !== null)
              return zo(t, Of(al.current)), t.flags |= Oe, null;
            var y = t.child, g = y.childLanes;
            if (Zr(a, g))
              return T0(e, t, a);
            zo(t, Of(al.current));
            var x = Pu(e, t, a);
            return x !== null ? x.sibling : null;
          } else
            zo(t, Of(al.current));
          break;
        }
        case Lt: {
          var w = (e.flags & Oe) !== Me, U = Zr(a, t.childLanes);
          if (w) {
            if (U)
              return _0(e, t, a);
            t.flags |= Oe;
          }
          var j = t.memoizedState;
          if (j !== null && (j.rendering = null, j.tail = null, j.lastEffect = null), zo(t, al.current), U)
            break;
          return null;
        }
        case Le:
        case Et:
          return t.lanes = Q, g0(e, t, a);
      }
      return Pu(e, t, a);
    }
    function O0(e, t, a) {
      if (t._debugNeedsRemount && e !== null)
        return Px(e, t, tE(t.type, t.key, t.pendingProps, t._debugOwner || null, t.mode, t.lanes));
      if (e !== null) {
        var i = e.memoizedProps, u = t.pendingProps;
        if (i !== u || Ah() || // Force a re-render if the implementation changed due to hot reload:
        t.type !== e.type)
          ul = !0;
        else {
          var s = bS(e, a);
          if (!s && // If this is the second pass of an error or suspense boundary, there
          // may not be work scheduled on `current`, so we check for this flag.
          (t.flags & Oe) === Me)
            return ul = !1, Vx(e, t, a);
          (e.flags & Tc) !== Me ? ul = !0 : ul = !1;
        }
      } else if (ul = !1, Ar() && db(t)) {
        var f = t.index, p = pb();
        aC(t, p, f);
      }
      switch (t.lanes = Q, t.tag) {
        case _e:
          return Rx(e, t, t.type, a);
        case en: {
          var v = t.elementType;
          return Ex(e, t, v, a);
        }
        case Y: {
          var y = t.type, g = t.pendingProps, x = t.elementType === y ? g : ll(y, g);
          return yS(e, t, y, x, a);
        }
        case te: {
          var w = t.type, U = t.pendingProps, j = t.elementType === w ? U : ll(w, U);
          return E0(e, t, w, j, a);
        }
        case ee:
          return yx(e, t, a);
        case ae:
          return gx(e, t, a);
        case fe:
          return Sx(e, t);
        case Ne:
          return T0(e, t, a);
        case ge:
          return jx(e, t, a);
        case Ge: {
          var P = t.type, se = t.pendingProps, je = t.elementType === P ? se : ll(P, se);
          return h0(e, t, P, je, a);
        }
        case Ie:
          return vx(e, t, a);
        case Je:
          return hx(e, t, a);
        case ft:
          return mx(e, t, a);
        case tt:
          return Fx(e, t, a);
        case It:
          return Hx(e, t, a);
        case Ze: {
          var De = t.type, _t = t.pendingProps, Ct = ll(De, _t);
          if (t.type !== t.elementType) {
            var N = De.propTypes;
            N && tl(
              N,
              Ct,
              // Resolved for outer only
              "prop",
              Dt(De)
            );
          }
          return Ct = ll(De.type, Ct), m0(e, t, De, Ct, a);
        }
        case He:
          return y0(e, t, t.type, t.pendingProps, a);
        case Ht: {
          var V = t.type, L = t.pendingProps, X = t.elementType === V ? L : ll(V, L);
          return Cx(e, t, V, X, a);
        }
        case Lt:
          return _0(e, t, a);
        case yt:
          break;
        case Le:
          return g0(e, t, a);
      }
      throw new Error("Unknown unit of work tag (" + t.tag + "). This error is likely caused by a bug in React. Please file an issue.");
    }
    function Af(e) {
      e.flags |= wt;
    }
    function N0(e) {
      e.flags |= En, e.flags |= vo;
    }
    var L0, xS, M0, U0;
    L0 = function(e, t, a, i) {
      for (var u = t.child; u !== null; ) {
        if (u.tag === ae || u.tag === fe)
          sw(e, u.stateNode);
        else if (u.tag !== ge) {
          if (u.child !== null) {
            u.child.return = u, u = u.child;
            continue;
          }
        }
        if (u === t)
          return;
        for (; u.sibling === null; ) {
          if (u.return === null || u.return === t)
            return;
          u = u.return;
        }
        u.sibling.return = u.return, u = u.sibling;
      }
    }, xS = function(e, t) {
    }, M0 = function(e, t, a, i, u) {
      var s = e.memoizedProps;
      if (s !== i) {
        var f = t.stateNode, p = Eg(), v = fw(f, a, s, i, u, p);
        t.updateQueue = v, v && Af(t);
      }
    }, U0 = function(e, t, a, i) {
      a !== i && Af(t);
    };
    function Up(e, t) {
      if (!Ar())
        switch (e.tailMode) {
          case "hidden": {
            for (var a = e.tail, i = null; a !== null; )
              a.alternate !== null && (i = a), a = a.sibling;
            i === null ? e.tail = null : i.sibling = null;
            break;
          }
          case "collapsed": {
            for (var u = e.tail, s = null; u !== null; )
              u.alternate !== null && (s = u), u = u.sibling;
            s === null ? !t && e.tail !== null ? e.tail.sibling = null : e.tail = null : s.sibling = null;
            break;
          }
        }
    }
    function Fr(e) {
      var t = e.alternate !== null && e.alternate.child === e.child, a = Q, i = Me;
      if (t) {
        if ((e.mode & Ut) !== Ue) {
          for (var v = e.selfBaseDuration, y = e.child; y !== null; )
            a = at(a, at(y.lanes, y.childLanes)), i |= y.subtreeFlags & Un, i |= y.flags & Un, v += y.treeBaseDuration, y = y.sibling;
          e.treeBaseDuration = v;
        } else
          for (var g = e.child; g !== null; )
            a = at(a, at(g.lanes, g.childLanes)), i |= g.subtreeFlags & Un, i |= g.flags & Un, g.return = e, g = g.sibling;
        e.subtreeFlags |= i;
      } else {
        if ((e.mode & Ut) !== Ue) {
          for (var u = e.actualDuration, s = e.selfBaseDuration, f = e.child; f !== null; )
            a = at(a, at(f.lanes, f.childLanes)), i |= f.subtreeFlags, i |= f.flags, u += f.actualDuration, s += f.treeBaseDuration, f = f.sibling;
          e.actualDuration = u, e.treeBaseDuration = s;
        } else
          for (var p = e.child; p !== null; )
            a = at(a, at(p.lanes, p.childLanes)), i |= p.subtreeFlags, i |= p.flags, p.return = e, p = p.sibling;
        e.subtreeFlags |= i;
      }
      return e.childLanes = a, t;
    }
    function Bx(e, t, a) {
      if (xb() && (t.mode & ht) !== Ue && (t.flags & Oe) === Me)
        return fC(t), bf(), t.flags |= Cr | us | Xn, !1;
      var i = Ih(t);
      if (a !== null && a.dehydrated !== null)
        if (e === null) {
          if (!i)
            throw new Error("A dehydrated suspense component was completed without a hydrated node. This is probably a bug in React.");
          if (wb(t), Fr(t), (t.mode & Ut) !== Ue) {
            var u = a !== null;
            if (u) {
              var s = t.child;
              s !== null && (t.treeBaseDuration -= s.treeBaseDuration);
            }
          }
          return !1;
        } else {
          if (bf(), (t.flags & Oe) === Me && (t.memoizedState = null), t.flags |= wt, Fr(t), (t.mode & Ut) !== Ue) {
            var f = a !== null;
            if (f) {
              var p = t.child;
              p !== null && (t.treeBaseDuration -= p.treeBaseDuration);
            }
          }
          return !1;
        }
      else
        return dC(), !0;
    }
    function z0(e, t, a) {
      var i = t.pendingProps;
      switch (Jy(t), t.tag) {
        case _e:
        case en:
        case He:
        case Y:
        case Ge:
        case Ie:
        case Je:
        case ft:
        case It:
        case Ze:
          return Fr(t), null;
        case te: {
          var u = t.type;
          return Il(u) && jh(t), Fr(t), null;
        }
        case ee: {
          var s = t.stateNode;
          if (Df(t), Gy(t), bg(), s.pendingContext && (s.context = s.pendingContext, s.pendingContext = null), e === null || e.child === null) {
            var f = Ih(t);
            if (f)
              Af(t);
            else if (e !== null) {
              var p = e.memoizedState;
              // Check if this is a client root
              (!p.isDehydrated || // Check if we reverted to client rendering (e.g. due to an error)
              (t.flags & Cr) !== Me) && (t.flags |= $n, dC());
            }
          }
          return xS(e, t), Fr(t), null;
        }
        case ae: {
          Cg(t);
          var v = _C(), y = t.type;
          if (e !== null && t.stateNode != null)
            M0(e, t, y, i, v), e.ref !== t.ref && N0(t);
          else {
            if (!i) {
              if (t.stateNode === null)
                throw new Error("We must have new props for new mounts. This error is likely caused by a bug in React. Please file an issue.");
              return Fr(t), null;
            }
            var g = Eg(), x = Ih(t);
            if (x)
              Rb(t, v, g) && Af(t);
            else {
              var w = ow(y, i, v, g, t);
              L0(w, t, !1, !1), t.stateNode = w, cw(w, y, i, v) && Af(t);
            }
            t.ref !== null && N0(t);
          }
          return Fr(t), null;
        }
        case fe: {
          var U = i;
          if (e && t.stateNode != null) {
            var j = e.memoizedProps;
            U0(e, t, j, U);
          } else {
            if (typeof U != "string" && t.stateNode === null)
              throw new Error("We must have new props for new mounts. This error is likely caused by a bug in React. Please file an issue.");
            var P = _C(), se = Eg(), je = Ih(t);
            je ? Tb(t) && Af(t) : t.stateNode = dw(U, P, se, t);
          }
          return Fr(t), null;
        }
        case Ne: {
          Nf(t);
          var De = t.memoizedState;
          if (e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
            var _t = Bx(e, t, De);
            if (!_t)
              return t.flags & Xn ? t : null;
          }
          if ((t.flags & Oe) !== Me)
            return t.lanes = a, (t.mode & Ut) !== Ue && Kg(t), t;
          var Ct = De !== null, N = e !== null && e.memoizedState !== null;
          if (Ct !== N && Ct) {
            var V = t.child;
            if (V.flags |= Mn, (t.mode & ht) !== Ue) {
              var L = e === null && (t.memoizedProps.unstable_avoidThisFallback !== !0 || !0);
              L || Rg(al.current, OC) ? I1() : YS();
            }
          }
          var X = t.updateQueue;
          if (X !== null && (t.flags |= wt), Fr(t), (t.mode & Ut) !== Ue && Ct) {
            var he = t.child;
            he !== null && (t.treeBaseDuration -= he.treeBaseDuration);
          }
          return null;
        }
        case ge:
          return Df(t), xS(e, t), e === null && ib(t.stateNode.containerInfo), Fr(t), null;
        case tt:
          var de = t.type._context;
          return dg(de, t), Fr(t), null;
        case Ht: {
          var Qe = t.type;
          return Il(Qe) && jh(t), Fr(t), null;
        }
        case Lt: {
          Nf(t);
          var et = t.memoizedState;
          if (et === null)
            return Fr(t), null;
          var Zt = (t.flags & Oe) !== Me, jt = et.rendering;
          if (jt === null)
            if (Zt)
              Up(et, !1);
            else {
              var Gn = $1() && (e === null || (e.flags & Oe) === Me);
              if (!Gn)
                for (var Ft = t.child; Ft !== null; ) {
                  var Pn = im(Ft);
                  if (Pn !== null) {
                    Zt = !0, t.flags |= Oe, Up(et, !1);
                    var la = Pn.updateQueue;
                    return la !== null && (t.updateQueue = la, t.flags |= wt), t.subtreeFlags = Me, Mb(t, a), zo(t, Tg(al.current, Cp)), t.child;
                  }
                  Ft = Ft.sibling;
                }
              et.tail !== null && Qn() > nR() && (t.flags |= Oe, Zt = !0, Up(et, !1), t.lanes = xd);
            }
          else {
            if (!Zt) {
              var Ir = im(jt);
              if (Ir !== null) {
                t.flags |= Oe, Zt = !0;
                var oi = Ir.updateQueue;
                if (oi !== null && (t.updateQueue = oi, t.flags |= wt), Up(et, !0), et.tail === null && et.tailMode === "hidden" && !jt.alternate && !Ar())
                  return Fr(t), null;
              } else // The time it took to render last row is greater than the remaining
              // time we have to render. So rendering one more row would likely
              // exceed it.
              Qn() * 2 - et.renderingStartTime > nR() && a !== Jr && (t.flags |= Oe, Zt = !0, Up(et, !1), t.lanes = xd);
            }
            if (et.isBackwards)
              jt.sibling = t.child, t.child = jt;
            else {
              var Ca = et.last;
              Ca !== null ? Ca.sibling = jt : t.child = jt, et.last = jt;
            }
          }
          if (et.tail !== null) {
            var Ra = et.tail;
            et.rendering = Ra, et.tail = Ra.sibling, et.renderingStartTime = Qn(), Ra.sibling = null;
            var ua = al.current;
            return Zt ? ua = Tg(ua, Cp) : ua = Of(ua), zo(t, ua), Ra;
          }
          return Fr(t), null;
        }
        case yt:
          break;
        case Le:
        case Et: {
          IS(t);
          var $u = t.memoizedState, Yf = $u !== null;
          if (e !== null) {
            var Kp = e.memoizedState, Xl = Kp !== null;
            Xl !== Yf && // LegacyHidden doesn't do any hiding — it only pre-renders.
            !ie && (t.flags |= Mn);
          }
          return !Yf || (t.mode & ht) === Ue ? Fr(t) : Zr(Kl, Jr) && (Fr(t), t.subtreeFlags & (mn | wt) && (t.flags |= Mn)), null;
        }
        case Tt:
          return null;
        case kt:
          return null;
      }
      throw new Error("Unknown unit of work tag (" + t.tag + "). This error is likely caused by a bug in React. Please file an issue.");
    }
    function Ix(e, t, a) {
      switch (Jy(t), t.tag) {
        case te: {
          var i = t.type;
          Il(i) && jh(t);
          var u = t.flags;
          return u & Xn ? (t.flags = u & ~Xn | Oe, (t.mode & Ut) !== Ue && Kg(t), t) : null;
        }
        case ee: {
          t.stateNode, Df(t), Gy(t), bg();
          var s = t.flags;
          return (s & Xn) !== Me && (s & Oe) === Me ? (t.flags = s & ~Xn | Oe, t) : null;
        }
        case ae:
          return Cg(t), null;
        case Ne: {
          Nf(t);
          var f = t.memoizedState;
          if (f !== null && f.dehydrated !== null) {
            if (t.alternate === null)
              throw new Error("Threw in newly mounted dehydrated component. This is likely a bug in React. Please file an issue.");
            bf();
          }
          var p = t.flags;
          return p & Xn ? (t.flags = p & ~Xn | Oe, (t.mode & Ut) !== Ue && Kg(t), t) : null;
        }
        case Lt:
          return Nf(t), null;
        case ge:
          return Df(t), null;
        case tt:
          var v = t.type._context;
          return dg(v, t), null;
        case Le:
        case Et:
          return IS(t), null;
        case Tt:
          return null;
        default:
          return null;
      }
    }
    function A0(e, t, a) {
      switch (Jy(t), t.tag) {
        case te: {
          var i = t.type.childContextTypes;
          i != null && jh(t);
          break;
        }
        case ee: {
          t.stateNode, Df(t), Gy(t), bg();
          break;
        }
        case ae: {
          Cg(t);
          break;
        }
        case ge:
          Df(t);
          break;
        case Ne:
          Nf(t);
          break;
        case Lt:
          Nf(t);
          break;
        case tt:
          var u = t.type._context;
          dg(u, t);
          break;
        case Le:
        case Et:
          IS(t);
          break;
      }
    }
    var j0 = null;
    j0 = /* @__PURE__ */ new Set();
    var Dm = !1, Hr = !1, Yx = typeof WeakSet == "function" ? WeakSet : Set, Re = null, jf = null, Ff = null;
    function $x(e) {
      bl(null, function() {
        throw e;
      }), ls();
    }
    var Qx = function(e, t) {
      if (t.props = e.memoizedProps, t.state = e.memoizedState, e.mode & Ut)
        try {
          Gl(), t.componentWillUnmount();
        } finally {
          Wl(e);
        }
      else
        t.componentWillUnmount();
    };
    function F0(e, t) {
      try {
        Fo(fr, e);
      } catch (a) {
        fn(e, t, a);
      }
    }
    function _S(e, t, a) {
      try {
        Qx(e, a);
      } catch (i) {
        fn(e, t, i);
      }
    }
    function Wx(e, t, a) {
      try {
        a.componentDidMount();
      } catch (i) {
        fn(e, t, i);
      }
    }
    function H0(e, t) {
      try {
        V0(e);
      } catch (a) {
        fn(e, t, a);
      }
    }
    function Hf(e, t) {
      var a = e.ref;
      if (a !== null)
        if (typeof a == "function") {
          var i;
          try {
            if (Be && dt && e.mode & Ut)
              try {
                Gl(), i = a(null);
              } finally {
                Wl(e);
              }
            else
              i = a(null);
          } catch (u) {
            fn(e, t, u);
          }
          typeof i == "function" && S("Unexpected return value from a callback ref in %s. A callback ref should not return a function.", qe(e));
        } else
          a.current = null;
    }
    function Om(e, t, a) {
      try {
        a();
      } catch (i) {
        fn(e, t, i);
      }
    }
    var P0 = !1;
    function Gx(e, t) {
      lw(e.containerInfo), Re = t, qx();
      var a = P0;
      return P0 = !1, a;
    }
    function qx() {
      for (; Re !== null; ) {
        var e = Re, t = e.child;
        (e.subtreeFlags & _l) !== Me && t !== null ? (t.return = e, Re = t) : Kx();
      }
    }
    function Kx() {
      for (; Re !== null; ) {
        var e = Re;
        Gt(e);
        try {
          Xx(e);
        } catch (a) {
          fn(e, e.return, a);
        }
        cn();
        var t = e.sibling;
        if (t !== null) {
          t.return = e.return, Re = t;
          return;
        }
        Re = e.return;
      }
    }
    function Xx(e) {
      var t = e.alternate, a = e.flags;
      if ((a & $n) !== Me) {
        switch (Gt(e), e.tag) {
          case Y:
          case Ge:
          case He:
            break;
          case te: {
            if (t !== null) {
              var i = t.memoizedProps, u = t.memoizedState, s = e.stateNode;
              e.type === e.elementType && !Zs && (s.props !== e.memoizedProps && S("Expected %s props to match memoized props before getSnapshotBeforeUpdate. This might either be because of a bug in React, or because a component reassigns its own `this.props`. Please file an issue.", qe(e) || "instance"), s.state !== e.memoizedState && S("Expected %s state to match memoized state before getSnapshotBeforeUpdate. This might either be because of a bug in React, or because a component reassigns its own `this.state`. Please file an issue.", qe(e) || "instance"));
              var f = s.getSnapshotBeforeUpdate(e.elementType === e.type ? i : ll(e.type, i), u);
              {
                var p = j0;
                f === void 0 && !p.has(e.type) && (p.add(e.type), S("%s.getSnapshotBeforeUpdate(): A snapshot value (or null) must be returned. You have returned undefined.", qe(e)));
              }
              s.__reactInternalSnapshotBeforeUpdate = f;
            }
            break;
          }
          case ee: {
            {
              var v = e.stateNode;
              Nw(v.containerInfo);
            }
            break;
          }
          case ae:
          case fe:
          case ge:
          case Ht:
            break;
          default:
            throw new Error("This unit of work tag should not have side-effects. This error is likely caused by a bug in React. Please file an issue.");
        }
        cn();
      }
    }
    function ol(e, t, a) {
      var i = t.updateQueue, u = i !== null ? i.lastEffect : null;
      if (u !== null) {
        var s = u.next, f = s;
        do {
          if ((f.tag & e) === e) {
            var p = f.destroy;
            f.destroy = void 0, p !== void 0 && ((e & jr) !== Ha ? qi(t) : (e & fr) !== Ha && ss(t), (e & Yl) !== Ha && Wp(!0), Om(t, a, p), (e & Yl) !== Ha && Wp(!1), (e & jr) !== Ha ? Nl() : (e & fr) !== Ha && wd());
          }
          f = f.next;
        } while (f !== s);
      }
    }
    function Fo(e, t) {
      var a = t.updateQueue, i = a !== null ? a.lastEffect : null;
      if (i !== null) {
        var u = i.next, s = u;
        do {
          if ((s.tag & e) === e) {
            (e & jr) !== Ha ? Td(t) : (e & fr) !== Ha && Dc(t);
            var f = s.create;
            (e & Yl) !== Ha && Wp(!0), s.destroy = f(), (e & Yl) !== Ha && Wp(!1), (e & jr) !== Ha ? zv() : (e & fr) !== Ha && Av();
            {
              var p = s.destroy;
              if (p !== void 0 && typeof p != "function") {
                var v = void 0;
                (s.tag & fr) !== Me ? v = "useLayoutEffect" : (s.tag & Yl) !== Me ? v = "useInsertionEffect" : v = "useEffect";
                var y = void 0;
                p === null ? y = " You returned null. If your effect does not require clean up, return undefined (or nothing)." : typeof p.then == "function" ? y = `

It looks like you wrote ` + v + `(async () => ...) or returned a Promise. Instead, write the async function inside your effect and call it immediately:

` + v + `(() => {
  async function fetchData() {
    // You can await here
    const response = await MyAPI.getData(someId);
    // ...
  }
  fetchData();
}, [someId]); // Or [] if effect doesn't need props or state

Learn more about data fetching with Hooks: https://reactjs.org/link/hooks-data-fetching` : y = " You returned: " + p, S("%s must not return anything besides a function, which is used for clean-up.%s", v, y);
              }
            }
          }
          s = s.next;
        } while (s !== u);
      }
    }
    function Jx(e, t) {
      if ((t.flags & wt) !== Me)
        switch (t.tag) {
          case ft: {
            var a = t.stateNode.passiveEffectDuration, i = t.memoizedProps, u = i.id, s = i.onPostCommit, f = n0(), p = t.alternate === null ? "mount" : "update";
            t0() && (p = "nested-update"), typeof s == "function" && s(u, p, a, f);
            var v = t.return;
            e: for (; v !== null; ) {
              switch (v.tag) {
                case ee:
                  var y = v.stateNode;
                  y.passiveEffectDuration += a;
                  break e;
                case ft:
                  var g = v.stateNode;
                  g.passiveEffectDuration += a;
                  break e;
              }
              v = v.return;
            }
            break;
          }
        }
    }
    function Zx(e, t, a, i) {
      if ((a.flags & Dl) !== Me)
        switch (a.tag) {
          case Y:
          case Ge:
          case He: {
            if (!Hr)
              if (a.mode & Ut)
                try {
                  Gl(), Fo(fr | cr, a);
                } finally {
                  Wl(a);
                }
              else
                Fo(fr | cr, a);
            break;
          }
          case te: {
            var u = a.stateNode;
            if (a.flags & wt && !Hr)
              if (t === null)
                if (a.type === a.elementType && !Zs && (u.props !== a.memoizedProps && S("Expected %s props to match memoized props before componentDidMount. This might either be because of a bug in React, or because a component reassigns its own `this.props`. Please file an issue.", qe(a) || "instance"), u.state !== a.memoizedState && S("Expected %s state to match memoized state before componentDidMount. This might either be because of a bug in React, or because a component reassigns its own `this.state`. Please file an issue.", qe(a) || "instance")), a.mode & Ut)
                  try {
                    Gl(), u.componentDidMount();
                  } finally {
                    Wl(a);
                  }
                else
                  u.componentDidMount();
              else {
                var s = a.elementType === a.type ? t.memoizedProps : ll(a.type, t.memoizedProps), f = t.memoizedState;
                if (a.type === a.elementType && !Zs && (u.props !== a.memoizedProps && S("Expected %s props to match memoized props before componentDidUpdate. This might either be because of a bug in React, or because a component reassigns its own `this.props`. Please file an issue.", qe(a) || "instance"), u.state !== a.memoizedState && S("Expected %s state to match memoized state before componentDidUpdate. This might either be because of a bug in React, or because a component reassigns its own `this.state`. Please file an issue.", qe(a) || "instance")), a.mode & Ut)
                  try {
                    Gl(), u.componentDidUpdate(s, f, u.__reactInternalSnapshotBeforeUpdate);
                  } finally {
                    Wl(a);
                  }
                else
                  u.componentDidUpdate(s, f, u.__reactInternalSnapshotBeforeUpdate);
              }
            var p = a.updateQueue;
            p !== null && (a.type === a.elementType && !Zs && (u.props !== a.memoizedProps && S("Expected %s props to match memoized props before processing the update queue. This might either be because of a bug in React, or because a component reassigns its own `this.props`. Please file an issue.", qe(a) || "instance"), u.state !== a.memoizedState && S("Expected %s state to match memoized state before processing the update queue. This might either be because of a bug in React, or because a component reassigns its own `this.state`. Please file an issue.", qe(a) || "instance")), xC(a, p, u));
            break;
          }
          case ee: {
            var v = a.updateQueue;
            if (v !== null) {
              var y = null;
              if (a.child !== null)
                switch (a.child.tag) {
                  case ae:
                    y = a.child.stateNode;
                    break;
                  case te:
                    y = a.child.stateNode;
                    break;
                }
              xC(a, v, y);
            }
            break;
          }
          case ae: {
            var g = a.stateNode;
            if (t === null && a.flags & wt) {
              var x = a.type, w = a.memoizedProps;
              yw(g, x, w);
            }
            break;
          }
          case fe:
            break;
          case ge:
            break;
          case ft: {
            {
              var U = a.memoizedProps, j = U.onCommit, P = U.onRender, se = a.stateNode.effectDuration, je = n0(), De = t === null ? "mount" : "update";
              t0() && (De = "nested-update"), typeof P == "function" && P(a.memoizedProps.id, De, a.actualDuration, a.treeBaseDuration, a.actualStartTime, je);
              {
                typeof j == "function" && j(a.memoizedProps.id, De, se, je), K1(a);
                var _t = a.return;
                e: for (; _t !== null; ) {
                  switch (_t.tag) {
                    case ee:
                      var Ct = _t.stateNode;
                      Ct.effectDuration += se;
                      break e;
                    case ft:
                      var N = _t.stateNode;
                      N.effectDuration += se;
                      break e;
                  }
                  _t = _t.return;
                }
              }
            }
            break;
          }
          case Ne: {
            u1(e, a);
            break;
          }
          case Lt:
          case Ht:
          case yt:
          case Le:
          case Et:
          case kt:
            break;
          default:
            throw new Error("This unit of work tag should not have side-effects. This error is likely caused by a bug in React. Please file an issue.");
        }
      Hr || a.flags & En && V0(a);
    }
    function e1(e) {
      switch (e.tag) {
        case Y:
        case Ge:
        case He: {
          if (e.mode & Ut)
            try {
              Gl(), F0(e, e.return);
            } finally {
              Wl(e);
            }
          else
            F0(e, e.return);
          break;
        }
        case te: {
          var t = e.stateNode;
          typeof t.componentDidMount == "function" && Wx(e, e.return, t), H0(e, e.return);
          break;
        }
        case ae: {
          H0(e, e.return);
          break;
        }
      }
    }
    function t1(e, t) {
      for (var a = null, i = e; ; ) {
        if (i.tag === ae) {
          if (a === null) {
            a = i;
            try {
              var u = i.stateNode;
              t ? _w(u) : Dw(i.stateNode, i.memoizedProps);
            } catch (f) {
              fn(e, e.return, f);
            }
          }
        } else if (i.tag === fe) {
          if (a === null)
            try {
              var s = i.stateNode;
              t ? kw(s) : Ow(s, i.memoizedProps);
            } catch (f) {
              fn(e, e.return, f);
            }
        } else if (!((i.tag === Le || i.tag === Et) && i.memoizedState !== null && i !== e)) {
          if (i.child !== null) {
            i.child.return = i, i = i.child;
            continue;
          }
        }
        if (i === e)
          return;
        for (; i.sibling === null; ) {
          if (i.return === null || i.return === e)
            return;
          a === i && (a = null), i = i.return;
        }
        a === i && (a = null), i.sibling.return = i.return, i = i.sibling;
      }
    }
    function V0(e) {
      var t = e.ref;
      if (t !== null) {
        var a = e.stateNode, i;
        switch (e.tag) {
          case ae:
            i = a;
            break;
          default:
            i = a;
        }
        if (typeof t == "function") {
          var u;
          if (e.mode & Ut)
            try {
              Gl(), u = t(i);
            } finally {
              Wl(e);
            }
          else
            u = t(i);
          typeof u == "function" && S("Unexpected return value from a callback ref in %s. A callback ref should not return a function.", qe(e));
        } else
          t.hasOwnProperty("current") || S("Unexpected ref object provided for %s. Use either a ref-setter function or React.createRef().", qe(e)), t.current = i;
      }
    }
    function n1(e) {
      var t = e.alternate;
      t !== null && (t.return = null), e.return = null;
    }
    function B0(e) {
      var t = e.alternate;
      t !== null && (e.alternate = null, B0(t));
      {
        if (e.child = null, e.deletions = null, e.sibling = null, e.tag === ae) {
          var a = e.stateNode;
          a !== null && ob(a);
        }
        e.stateNode = null, e._debugOwner = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
      }
    }
    function r1(e) {
      for (var t = e.return; t !== null; ) {
        if (I0(t))
          return t;
        t = t.return;
      }
      throw new Error("Expected to find a host parent. This error is likely caused by a bug in React. Please file an issue.");
    }
    function I0(e) {
      return e.tag === ae || e.tag === ee || e.tag === ge;
    }
    function Y0(e) {
      var t = e;
      e: for (; ; ) {
        for (; t.sibling === null; ) {
          if (t.return === null || I0(t.return))
            return null;
          t = t.return;
        }
        for (t.sibling.return = t.return, t = t.sibling; t.tag !== ae && t.tag !== fe && t.tag !== $t; ) {
          if (t.flags & mn || t.child === null || t.tag === ge)
            continue e;
          t.child.return = t, t = t.child;
        }
        if (!(t.flags & mn))
          return t.stateNode;
      }
    }
    function a1(e) {
      var t = r1(e);
      switch (t.tag) {
        case ae: {
          var a = t.stateNode;
          t.flags & Da && (QE(a), t.flags &= ~Da);
          var i = Y0(e);
          DS(e, i, a);
          break;
        }
        case ee:
        case ge: {
          var u = t.stateNode.containerInfo, s = Y0(e);
          kS(e, s, u);
          break;
        }
        default:
          throw new Error("Invalid host parent fiber. This error is likely caused by a bug in React. Please file an issue.");
      }
    }
    function kS(e, t, a) {
      var i = e.tag, u = i === ae || i === fe;
      if (u) {
        var s = e.stateNode;
        t ? Tw(a, s, t) : Cw(a, s);
      } else if (i !== ge) {
        var f = e.child;
        if (f !== null) {
          kS(f, t, a);
          for (var p = f.sibling; p !== null; )
            kS(p, t, a), p = p.sibling;
        }
      }
    }
    function DS(e, t, a) {
      var i = e.tag, u = i === ae || i === fe;
      if (u) {
        var s = e.stateNode;
        t ? Rw(a, s, t) : Ew(a, s);
      } else if (i !== ge) {
        var f = e.child;
        if (f !== null) {
          DS(f, t, a);
          for (var p = f.sibling; p !== null; )
            DS(p, t, a), p = p.sibling;
        }
      }
    }
    var Pr = null, sl = !1;
    function i1(e, t, a) {
      {
        var i = t;
        e: for (; i !== null; ) {
          switch (i.tag) {
            case ae: {
              Pr = i.stateNode, sl = !1;
              break e;
            }
            case ee: {
              Pr = i.stateNode.containerInfo, sl = !0;
              break e;
            }
            case ge: {
              Pr = i.stateNode.containerInfo, sl = !0;
              break e;
            }
          }
          i = i.return;
        }
        if (Pr === null)
          throw new Error("Expected to find a host parent. This error is likely caused by a bug in React. Please file an issue.");
        $0(e, t, a), Pr = null, sl = !1;
      }
      n1(a);
    }
    function Ho(e, t, a) {
      for (var i = a.child; i !== null; )
        $0(e, t, i), i = i.sibling;
    }
    function $0(e, t, a) {
      switch (Ed(a), a.tag) {
        case ae:
          Hr || Hf(a, t);
        case fe: {
          {
            var i = Pr, u = sl;
            Pr = null, Ho(e, t, a), Pr = i, sl = u, Pr !== null && (sl ? bw(Pr, a.stateNode) : ww(Pr, a.stateNode));
          }
          return;
        }
        case $t: {
          Pr !== null && (sl ? xw(Pr, a.stateNode) : Py(Pr, a.stateNode));
          return;
        }
        case ge: {
          {
            var s = Pr, f = sl;
            Pr = a.stateNode.containerInfo, sl = !0, Ho(e, t, a), Pr = s, sl = f;
          }
          return;
        }
        case Y:
        case Ge:
        case Ze:
        case He: {
          if (!Hr) {
            var p = a.updateQueue;
            if (p !== null) {
              var v = p.lastEffect;
              if (v !== null) {
                var y = v.next, g = y;
                do {
                  var x = g, w = x.destroy, U = x.tag;
                  w !== void 0 && ((U & Yl) !== Ha ? Om(a, t, w) : (U & fr) !== Ha && (ss(a), a.mode & Ut ? (Gl(), Om(a, t, w), Wl(a)) : Om(a, t, w), wd())), g = g.next;
                } while (g !== y);
              }
            }
          }
          Ho(e, t, a);
          return;
        }
        case te: {
          if (!Hr) {
            Hf(a, t);
            var j = a.stateNode;
            typeof j.componentWillUnmount == "function" && _S(a, t, j);
          }
          Ho(e, t, a);
          return;
        }
        case yt: {
          Ho(e, t, a);
          return;
        }
        case Le: {
          if (
            // TODO: Remove this dead flag
            a.mode & ht
          ) {
            var P = Hr;
            Hr = P || a.memoizedState !== null, Ho(e, t, a), Hr = P;
          } else
            Ho(e, t, a);
          break;
        }
        default: {
          Ho(e, t, a);
          return;
        }
      }
    }
    function l1(e) {
      e.memoizedState;
    }
    function u1(e, t) {
      var a = t.memoizedState;
      if (a === null) {
        var i = t.alternate;
        if (i !== null) {
          var u = i.memoizedState;
          if (u !== null) {
            var s = u.dehydrated;
            s !== null && $w(s);
          }
        }
      }
    }
    function Q0(e) {
      var t = e.updateQueue;
      if (t !== null) {
        e.updateQueue = null;
        var a = e.stateNode;
        a === null && (a = e.stateNode = new Yx()), t.forEach(function(i) {
          var u = r_.bind(null, e, i);
          if (!a.has(i)) {
            if (a.add(i), Xr)
              if (jf !== null && Ff !== null)
                Qp(Ff, jf);
              else
                throw Error("Expected finished root and lanes to be set. This is a bug in React.");
            i.then(u, u);
          }
        });
      }
    }
    function o1(e, t, a) {
      jf = a, Ff = e, Gt(t), W0(t, e), Gt(t), jf = null, Ff = null;
    }
    function cl(e, t, a) {
      var i = t.deletions;
      if (i !== null)
        for (var u = 0; u < i.length; u++) {
          var s = i[u];
          try {
            i1(e, t, s);
          } catch (v) {
            fn(s, t, v);
          }
        }
      var f = gl();
      if (t.subtreeFlags & kl)
        for (var p = t.child; p !== null; )
          Gt(p), W0(p, e), p = p.sibling;
      Gt(f);
    }
    function W0(e, t, a) {
      var i = e.alternate, u = e.flags;
      switch (e.tag) {
        case Y:
        case Ge:
        case Ze:
        case He: {
          if (cl(t, e), ql(e), u & wt) {
            try {
              ol(Yl | cr, e, e.return), Fo(Yl | cr, e);
            } catch (Qe) {
              fn(e, e.return, Qe);
            }
            if (e.mode & Ut) {
              try {
                Gl(), ol(fr | cr, e, e.return);
              } catch (Qe) {
                fn(e, e.return, Qe);
              }
              Wl(e);
            } else
              try {
                ol(fr | cr, e, e.return);
              } catch (Qe) {
                fn(e, e.return, Qe);
              }
          }
          return;
        }
        case te: {
          cl(t, e), ql(e), u & En && i !== null && Hf(i, i.return);
          return;
        }
        case ae: {
          cl(t, e), ql(e), u & En && i !== null && Hf(i, i.return);
          {
            if (e.flags & Da) {
              var s = e.stateNode;
              try {
                QE(s);
              } catch (Qe) {
                fn(e, e.return, Qe);
              }
            }
            if (u & wt) {
              var f = e.stateNode;
              if (f != null) {
                var p = e.memoizedProps, v = i !== null ? i.memoizedProps : p, y = e.type, g = e.updateQueue;
                if (e.updateQueue = null, g !== null)
                  try {
                    gw(f, g, y, v, p, e);
                  } catch (Qe) {
                    fn(e, e.return, Qe);
                  }
              }
            }
          }
          return;
        }
        case fe: {
          if (cl(t, e), ql(e), u & wt) {
            if (e.stateNode === null)
              throw new Error("This should have a text node initialized. This error is likely caused by a bug in React. Please file an issue.");
            var x = e.stateNode, w = e.memoizedProps, U = i !== null ? i.memoizedProps : w;
            try {
              Sw(x, U, w);
            } catch (Qe) {
              fn(e, e.return, Qe);
            }
          }
          return;
        }
        case ee: {
          if (cl(t, e), ql(e), u & wt && i !== null) {
            var j = i.memoizedState;
            if (j.isDehydrated)
              try {
                Yw(t.containerInfo);
              } catch (Qe) {
                fn(e, e.return, Qe);
              }
          }
          return;
        }
        case ge: {
          cl(t, e), ql(e);
          return;
        }
        case Ne: {
          cl(t, e), ql(e);
          var P = e.child;
          if (P.flags & Mn) {
            var se = P.stateNode, je = P.memoizedState, De = je !== null;
            if (se.isHidden = De, De) {
              var _t = P.alternate !== null && P.alternate.memoizedState !== null;
              _t || B1();
            }
          }
          if (u & wt) {
            try {
              l1(e);
            } catch (Qe) {
              fn(e, e.return, Qe);
            }
            Q0(e);
          }
          return;
        }
        case Le: {
          var Ct = i !== null && i.memoizedState !== null;
          if (
            // TODO: Remove this dead flag
            e.mode & ht
          ) {
            var N = Hr;
            Hr = N || Ct, cl(t, e), Hr = N;
          } else
            cl(t, e);
          if (ql(e), u & Mn) {
            var V = e.stateNode, L = e.memoizedState, X = L !== null, he = e;
            if (V.isHidden = X, X && !Ct && (he.mode & ht) !== Ue) {
              Re = he;
              for (var de = he.child; de !== null; )
                Re = de, c1(de), de = de.sibling;
            }
            t1(he, X);
          }
          return;
        }
        case Lt: {
          cl(t, e), ql(e), u & wt && Q0(e);
          return;
        }
        case yt:
          return;
        default: {
          cl(t, e), ql(e);
          return;
        }
      }
    }
    function ql(e) {
      var t = e.flags;
      if (t & mn) {
        try {
          a1(e);
        } catch (a) {
          fn(e, e.return, a);
        }
        e.flags &= ~mn;
      }
      t & Gr && (e.flags &= ~Gr);
    }
    function s1(e, t, a) {
      jf = a, Ff = t, Re = e, G0(e, t, a), jf = null, Ff = null;
    }
    function G0(e, t, a) {
      for (var i = (e.mode & ht) !== Ue; Re !== null; ) {
        var u = Re, s = u.child;
        if (u.tag === Le && i) {
          var f = u.memoizedState !== null, p = f || Dm;
          if (p) {
            OS(e, t, a);
            continue;
          } else {
            var v = u.alternate, y = v !== null && v.memoizedState !== null, g = y || Hr, x = Dm, w = Hr;
            Dm = p, Hr = g, Hr && !w && (Re = u, f1(u));
            for (var U = s; U !== null; )
              Re = U, G0(
                U,
                // New root; bubble back up to here and stop.
                t,
                a
              ), U = U.sibling;
            Re = u, Dm = x, Hr = w, OS(e, t, a);
            continue;
          }
        }
        (u.subtreeFlags & Dl) !== Me && s !== null ? (s.return = u, Re = s) : OS(e, t, a);
      }
    }
    function OS(e, t, a) {
      for (; Re !== null; ) {
        var i = Re;
        if ((i.flags & Dl) !== Me) {
          var u = i.alternate;
          Gt(i);
          try {
            Zx(t, u, i, a);
          } catch (f) {
            fn(i, i.return, f);
          }
          cn();
        }
        if (i === e) {
          Re = null;
          return;
        }
        var s = i.sibling;
        if (s !== null) {
          s.return = i.return, Re = s;
          return;
        }
        Re = i.return;
      }
    }
    function c1(e) {
      for (; Re !== null; ) {
        var t = Re, a = t.child;
        switch (t.tag) {
          case Y:
          case Ge:
          case Ze:
          case He: {
            if (t.mode & Ut)
              try {
                Gl(), ol(fr, t, t.return);
              } finally {
                Wl(t);
              }
            else
              ol(fr, t, t.return);
            break;
          }
          case te: {
            Hf(t, t.return);
            var i = t.stateNode;
            typeof i.componentWillUnmount == "function" && _S(t, t.return, i);
            break;
          }
          case ae: {
            Hf(t, t.return);
            break;
          }
          case Le: {
            var u = t.memoizedState !== null;
            if (u) {
              q0(e);
              continue;
            }
            break;
          }
        }
        a !== null ? (a.return = t, Re = a) : q0(e);
      }
    }
    function q0(e) {
      for (; Re !== null; ) {
        var t = Re;
        if (t === e) {
          Re = null;
          return;
        }
        var a = t.sibling;
        if (a !== null) {
          a.return = t.return, Re = a;
          return;
        }
        Re = t.return;
      }
    }
    function f1(e) {
      for (; Re !== null; ) {
        var t = Re, a = t.child;
        if (t.tag === Le) {
          var i = t.memoizedState !== null;
          if (i) {
            K0(e);
            continue;
          }
        }
        a !== null ? (a.return = t, Re = a) : K0(e);
      }
    }
    function K0(e) {
      for (; Re !== null; ) {
        var t = Re;
        Gt(t);
        try {
          e1(t);
        } catch (i) {
          fn(t, t.return, i);
        }
        if (cn(), t === e) {
          Re = null;
          return;
        }
        var a = t.sibling;
        if (a !== null) {
          a.return = t.return, Re = a;
          return;
        }
        Re = t.return;
      }
    }
    function d1(e, t, a, i) {
      Re = t, p1(t, e, a, i);
    }
    function p1(e, t, a, i) {
      for (; Re !== null; ) {
        var u = Re, s = u.child;
        (u.subtreeFlags & Wi) !== Me && s !== null ? (s.return = u, Re = s) : v1(e, t, a, i);
      }
    }
    function v1(e, t, a, i) {
      for (; Re !== null; ) {
        var u = Re;
        if ((u.flags & Wr) !== Me) {
          Gt(u);
          try {
            h1(t, u, a, i);
          } catch (f) {
            fn(u, u.return, f);
          }
          cn();
        }
        if (u === e) {
          Re = null;
          return;
        }
        var s = u.sibling;
        if (s !== null) {
          s.return = u.return, Re = s;
          return;
        }
        Re = u.return;
      }
    }
    function h1(e, t, a, i) {
      switch (t.tag) {
        case Y:
        case Ge:
        case He: {
          if (t.mode & Ut) {
            qg();
            try {
              Fo(jr | cr, t);
            } finally {
              Gg(t);
            }
          } else
            Fo(jr | cr, t);
          break;
        }
      }
    }
    function m1(e) {
      Re = e, y1();
    }
    function y1() {
      for (; Re !== null; ) {
        var e = Re, t = e.child;
        if ((Re.flags & ka) !== Me) {
          var a = e.deletions;
          if (a !== null) {
            for (var i = 0; i < a.length; i++) {
              var u = a[i];
              Re = u, E1(u, e);
            }
            {
              var s = e.alternate;
              if (s !== null) {
                var f = s.child;
                if (f !== null) {
                  s.child = null;
                  do {
                    var p = f.sibling;
                    f.sibling = null, f = p;
                  } while (f !== null);
                }
              }
            }
            Re = e;
          }
        }
        (e.subtreeFlags & Wi) !== Me && t !== null ? (t.return = e, Re = t) : g1();
      }
    }
    function g1() {
      for (; Re !== null; ) {
        var e = Re;
        (e.flags & Wr) !== Me && (Gt(e), S1(e), cn());
        var t = e.sibling;
        if (t !== null) {
          t.return = e.return, Re = t;
          return;
        }
        Re = e.return;
      }
    }
    function S1(e) {
      switch (e.tag) {
        case Y:
        case Ge:
        case He: {
          e.mode & Ut ? (qg(), ol(jr | cr, e, e.return), Gg(e)) : ol(jr | cr, e, e.return);
          break;
        }
      }
    }
    function E1(e, t) {
      for (; Re !== null; ) {
        var a = Re;
        Gt(a), R1(a, t), cn();
        var i = a.child;
        i !== null ? (i.return = a, Re = i) : C1(e);
      }
    }
    function C1(e) {
      for (; Re !== null; ) {
        var t = Re, a = t.sibling, i = t.return;
        if (B0(t), t === e) {
          Re = null;
          return;
        }
        if (a !== null) {
          a.return = i, Re = a;
          return;
        }
        Re = i;
      }
    }
    function R1(e, t) {
      switch (e.tag) {
        case Y:
        case Ge:
        case He: {
          e.mode & Ut ? (qg(), ol(jr, e, t), Gg(e)) : ol(jr, e, t);
          break;
        }
      }
    }
    function T1(e) {
      switch (e.tag) {
        case Y:
        case Ge:
        case He: {
          try {
            Fo(fr | cr, e);
          } catch (a) {
            fn(e, e.return, a);
          }
          break;
        }
        case te: {
          var t = e.stateNode;
          try {
            t.componentDidMount();
          } catch (a) {
            fn(e, e.return, a);
          }
          break;
        }
      }
    }
    function w1(e) {
      switch (e.tag) {
        case Y:
        case Ge:
        case He: {
          try {
            Fo(jr | cr, e);
          } catch (t) {
            fn(e, e.return, t);
          }
          break;
        }
      }
    }
    function b1(e) {
      switch (e.tag) {
        case Y:
        case Ge:
        case He: {
          try {
            ol(fr | cr, e, e.return);
          } catch (a) {
            fn(e, e.return, a);
          }
          break;
        }
        case te: {
          var t = e.stateNode;
          typeof t.componentWillUnmount == "function" && _S(e, e.return, t);
          break;
        }
      }
    }
    function x1(e) {
      switch (e.tag) {
        case Y:
        case Ge:
        case He:
          try {
            ol(jr | cr, e, e.return);
          } catch (t) {
            fn(e, e.return, t);
          }
      }
    }
    if (typeof Symbol == "function" && Symbol.for) {
      var zp = Symbol.for;
      zp("selector.component"), zp("selector.has_pseudo_class"), zp("selector.role"), zp("selector.test_id"), zp("selector.text");
    }
    var _1 = [];
    function k1() {
      _1.forEach(function(e) {
        return e();
      });
    }
    var D1 = k.ReactCurrentActQueue;
    function O1(e) {
      {
        var t = (
          // $FlowExpectedError – Flow doesn't know about IS_REACT_ACT_ENVIRONMENT global
          typeof IS_REACT_ACT_ENVIRONMENT < "u" ? IS_REACT_ACT_ENVIRONMENT : void 0
        ), a = typeof jest < "u";
        return a && t !== !1;
      }
    }
    function X0() {
      {
        var e = (
          // $FlowExpectedError – Flow doesn't know about IS_REACT_ACT_ENVIRONMENT global
          typeof IS_REACT_ACT_ENVIRONMENT < "u" ? IS_REACT_ACT_ENVIRONMENT : void 0
        );
        return !e && D1.current !== null && S("The current testing environment is not configured to support act(...)"), e;
      }
    }
    var N1 = Math.ceil, NS = k.ReactCurrentDispatcher, LS = k.ReactCurrentOwner, Vr = k.ReactCurrentBatchConfig, fl = k.ReactCurrentActQueue, vr = (
      /*             */
      0
    ), J0 = (
      /*               */
      1
    ), Br = (
      /*                */
      2
    ), Ai = (
      /*                */
      4
    ), Vu = 0, Ap = 1, ec = 2, Nm = 3, jp = 4, Z0 = 5, MS = 6, xt = vr, Sa = null, Dn = null, hr = Q, Kl = Q, US = Do(Q), mr = Vu, Fp = null, Lm = Q, Hp = Q, Mm = Q, Pp = null, Pa = null, zS = 0, eR = 500, tR = 1 / 0, L1 = 500, Bu = null;
    function Vp() {
      tR = Qn() + L1;
    }
    function nR() {
      return tR;
    }
    var Um = !1, AS = null, Pf = null, tc = !1, Po = null, Bp = Q, jS = [], FS = null, M1 = 50, Ip = 0, HS = null, PS = !1, zm = !1, U1 = 50, Vf = 0, Am = null, Yp = tn, jm = Q, rR = !1;
    function Fm() {
      return Sa;
    }
    function Ea() {
      return (xt & (Br | Ai)) !== vr ? Qn() : (Yp !== tn || (Yp = Qn()), Yp);
    }
    function Vo(e) {
      var t = e.mode;
      if ((t & ht) === Ue)
        return Ye;
      if ((xt & Br) !== vr && hr !== Q)
        return Rs(hr);
      var a = Db() !== kb;
      if (a) {
        if (Vr.transition !== null) {
          var i = Vr.transition;
          i._updatedFibers || (i._updatedFibers = /* @__PURE__ */ new Set()), i._updatedFibers.add(e);
        }
        return jm === Nt && (jm = Ld()), jm;
      }
      var u = za();
      if (u !== Nt)
        return u;
      var s = pw();
      return s;
    }
    function z1(e) {
      var t = e.mode;
      return (t & ht) === Ue ? Ye : Bv();
    }
    function yr(e, t, a, i) {
      i_(), rR && S("useInsertionEffect must not schedule updates."), PS && (zm = !0), go(e, a, i), (xt & Br) !== Q && e === Sa ? o_(t) : (Xr && bs(e, t, a), s_(t), e === Sa && ((xt & Br) === vr && (Hp = at(Hp, a)), mr === jp && Bo(e, hr)), Va(e, i), a === Ye && xt === vr && (t.mode & ht) === Ue && // Treat `act` as if it's inside `batchedUpdates`, even in legacy mode.
      !fl.isBatchingLegacy && (Vp(), rC()));
    }
    function A1(e, t, a) {
      var i = e.current;
      i.lanes = t, go(e, t, a), Va(e, a);
    }
    function j1(e) {
      return (
        // TODO: Remove outdated deferRenderPhaseUpdateToNextBatch experiment. We
        // decided not to enable it.
        (xt & Br) !== vr
      );
    }
    function Va(e, t) {
      var a = e.callbackNode;
      qc(e, t);
      var i = Gc(e, e === Sa ? hr : Q);
      if (i === Q) {
        a !== null && SR(a), e.callbackNode = null, e.callbackPriority = Nt;
        return;
      }
      var u = Ul(i), s = e.callbackPriority;
      if (s === u && // Special case related to `act`. If the currently scheduled task is a
      // Scheduler task, rather than an `act` task, cancel it and re-scheduled
      // on the `act` queue.
      !(fl.current !== null && a !== WS)) {
        a == null && s !== Ye && S("Expected scheduled callback to exist. This error is likely caused by a bug in React. Please file an issue.");
        return;
      }
      a != null && SR(a);
      var f;
      if (u === Ye)
        e.tag === Oo ? (fl.isBatchingLegacy !== null && (fl.didScheduleLegacyUpdate = !0), fb(lR.bind(null, e))) : nC(lR.bind(null, e)), fl.current !== null ? fl.current.push(No) : hw(function() {
          (xt & (Br | Ai)) === vr && No();
        }), f = null;
      else {
        var p;
        switch (qv(i)) {
          case Nr:
            p = os;
            break;
          case xi:
            p = Ol;
            break;
          case Ma:
            p = Gi;
            break;
          case Ua:
            p = hu;
            break;
          default:
            p = Gi;
            break;
        }
        f = GS(p, aR.bind(null, e));
      }
      e.callbackPriority = u, e.callbackNode = f;
    }
    function aR(e, t) {
      if (tx(), Yp = tn, jm = Q, (xt & (Br | Ai)) !== vr)
        throw new Error("Should not already be working.");
      var a = e.callbackNode, i = Yu();
      if (i && e.callbackNode !== a)
        return null;
      var u = Gc(e, e === Sa ? hr : Q);
      if (u === Q)
        return null;
      var s = !Xc(e, u) && !Vv(e, u) && !t, f = s ? W1(e, u) : Pm(e, u);
      if (f !== Vu) {
        if (f === ec) {
          var p = Kc(e);
          p !== Q && (u = p, f = VS(e, p));
        }
        if (f === Ap) {
          var v = Fp;
          throw nc(e, Q), Bo(e, u), Va(e, Qn()), v;
        }
        if (f === MS)
          Bo(e, u);
        else {
          var y = !Xc(e, u), g = e.current.alternate;
          if (y && !H1(g)) {
            if (f = Pm(e, u), f === ec) {
              var x = Kc(e);
              x !== Q && (u = x, f = VS(e, x));
            }
            if (f === Ap) {
              var w = Fp;
              throw nc(e, Q), Bo(e, u), Va(e, Qn()), w;
            }
          }
          e.finishedWork = g, e.finishedLanes = u, F1(e, f, u);
        }
      }
      return Va(e, Qn()), e.callbackNode === a ? aR.bind(null, e) : null;
    }
    function VS(e, t) {
      var a = Pp;
      if (ef(e)) {
        var i = nc(e, t);
        i.flags |= Cr, ab(e.containerInfo);
      }
      var u = Pm(e, t);
      if (u !== ec) {
        var s = Pa;
        Pa = a, s !== null && iR(s);
      }
      return u;
    }
    function iR(e) {
      Pa === null ? Pa = e : Pa.push.apply(Pa, e);
    }
    function F1(e, t, a) {
      switch (t) {
        case Vu:
        case Ap:
          throw new Error("Root did not complete. This is a bug in React.");
        case ec: {
          rc(e, Pa, Bu);
          break;
        }
        case Nm: {
          if (Bo(e, a), xu(a) && // do not delay if we're inside an act() scope
          !ER()) {
            var i = zS + eR - Qn();
            if (i > 10) {
              var u = Gc(e, Q);
              if (u !== Q)
                break;
              var s = e.suspendedLanes;
              if (!_u(s, a)) {
                Ea(), Jc(e, s);
                break;
              }
              e.timeoutHandle = Fy(rc.bind(null, e, Pa, Bu), i);
              break;
            }
          }
          rc(e, Pa, Bu);
          break;
        }
        case jp: {
          if (Bo(e, a), Od(a))
            break;
          if (!ER()) {
            var f = ri(e, a), p = f, v = Qn() - p, y = a_(v) - v;
            if (y > 10) {
              e.timeoutHandle = Fy(rc.bind(null, e, Pa, Bu), y);
              break;
            }
          }
          rc(e, Pa, Bu);
          break;
        }
        case Z0: {
          rc(e, Pa, Bu);
          break;
        }
        default:
          throw new Error("Unknown root exit status.");
      }
    }
    function H1(e) {
      for (var t = e; ; ) {
        if (t.flags & po) {
          var a = t.updateQueue;
          if (a !== null) {
            var i = a.stores;
            if (i !== null)
              for (var u = 0; u < i.length; u++) {
                var s = i[u], f = s.getSnapshot, p = s.value;
                try {
                  if (!q(f(), p))
                    return !1;
                } catch {
                  return !1;
                }
              }
          }
        }
        var v = t.child;
        if (t.subtreeFlags & po && v !== null) {
          v.return = t, t = v;
          continue;
        }
        if (t === e)
          return !0;
        for (; t.sibling === null; ) {
          if (t.return === null || t.return === e)
            return !0;
          t = t.return;
        }
        t.sibling.return = t.return, t = t.sibling;
      }
      return !0;
    }
    function Bo(e, t) {
      t = Ts(t, Mm), t = Ts(t, Hp), $v(e, t);
    }
    function lR(e) {
      if (nx(), (xt & (Br | Ai)) !== vr)
        throw new Error("Should not already be working.");
      Yu();
      var t = Gc(e, Q);
      if (!Zr(t, Ye))
        return Va(e, Qn()), null;
      var a = Pm(e, t);
      if (e.tag !== Oo && a === ec) {
        var i = Kc(e);
        i !== Q && (t = i, a = VS(e, i));
      }
      if (a === Ap) {
        var u = Fp;
        throw nc(e, Q), Bo(e, t), Va(e, Qn()), u;
      }
      if (a === MS)
        throw new Error("Root did not complete. This is a bug in React.");
      var s = e.current.alternate;
      return e.finishedWork = s, e.finishedLanes = t, rc(e, Pa, Bu), Va(e, Qn()), null;
    }
    function P1(e, t) {
      t !== Q && (Zc(e, at(t, Ye)), Va(e, Qn()), (xt & (Br | Ai)) === vr && (Vp(), No()));
    }
    function BS(e, t) {
      var a = xt;
      xt |= J0;
      try {
        return e(t);
      } finally {
        xt = a, xt === vr && // Treat `act` as if it's inside `batchedUpdates`, even in legacy mode.
        !fl.isBatchingLegacy && (Vp(), rC());
      }
    }
    function V1(e, t, a, i, u) {
      var s = za(), f = Vr.transition;
      try {
        return Vr.transition = null, jn(Nr), e(t, a, i, u);
      } finally {
        jn(s), Vr.transition = f, xt === vr && Vp();
      }
    }
    function Iu(e) {
      Po !== null && Po.tag === Oo && (xt & (Br | Ai)) === vr && Yu();
      var t = xt;
      xt |= J0;
      var a = Vr.transition, i = za();
      try {
        return Vr.transition = null, jn(Nr), e ? e() : void 0;
      } finally {
        jn(i), Vr.transition = a, xt = t, (xt & (Br | Ai)) === vr && No();
      }
    }
    function uR() {
      return (xt & (Br | Ai)) !== vr;
    }
    function Hm(e, t) {
      aa(US, Kl, e), Kl = at(Kl, t);
    }
    function IS(e) {
      Kl = US.current, ra(US, e);
    }
    function nc(e, t) {
      e.finishedWork = null, e.finishedLanes = Q;
      var a = e.timeoutHandle;
      if (a !== Hy && (e.timeoutHandle = Hy, vw(a)), Dn !== null)
        for (var i = Dn.return; i !== null; ) {
          var u = i.alternate;
          A0(u, i), i = i.return;
        }
      Sa = e;
      var s = ac(e.current, null);
      return Dn = s, hr = Kl = t, mr = Vu, Fp = null, Lm = Q, Hp = Q, Mm = Q, Pp = null, Pa = null, Ab(), rl.discardPendingWarnings(), s;
    }
    function oR(e, t) {
      do {
        var a = Dn;
        try {
          if (qh(), LC(), cn(), LS.current = null, a === null || a.return === null) {
            mr = Ap, Fp = t, Dn = null;
            return;
          }
          if (Be && a.mode & Ut && wm(a, !0), $e)
            if (ha(), t !== null && typeof t == "object" && typeof t.then == "function") {
              var i = t;
              bi(a, i, hr);
            } else
              cs(a, t, hr);
          fx(e, a.return, a, t, hr), dR(a);
        } catch (u) {
          t = u, Dn === a && a !== null ? (a = a.return, Dn = a) : a = Dn;
          continue;
        }
        return;
      } while (!0);
    }
    function sR() {
      var e = NS.current;
      return NS.current = Sm, e === null ? Sm : e;
    }
    function cR(e) {
      NS.current = e;
    }
    function B1() {
      zS = Qn();
    }
    function $p(e) {
      Lm = at(e, Lm);
    }
    function I1() {
      mr === Vu && (mr = Nm);
    }
    function YS() {
      (mr === Vu || mr === Nm || mr === ec) && (mr = jp), Sa !== null && (Cs(Lm) || Cs(Hp)) && Bo(Sa, hr);
    }
    function Y1(e) {
      mr !== jp && (mr = ec), Pp === null ? Pp = [e] : Pp.push(e);
    }
    function $1() {
      return mr === Vu;
    }
    function Pm(e, t) {
      var a = xt;
      xt |= Br;
      var i = sR();
      if (Sa !== e || hr !== t) {
        if (Xr) {
          var u = e.memoizedUpdaters;
          u.size > 0 && (Qp(e, hr), u.clear()), Qv(e, t);
        }
        Bu = Ad(), nc(e, t);
      }
      Su(t);
      do
        try {
          Q1();
          break;
        } catch (s) {
          oR(e, s);
        }
      while (!0);
      if (qh(), xt = a, cR(i), Dn !== null)
        throw new Error("Cannot commit an incomplete root. This error is likely caused by a bug in React. Please file an issue.");
      return Oc(), Sa = null, hr = Q, mr;
    }
    function Q1() {
      for (; Dn !== null; )
        fR(Dn);
    }
    function W1(e, t) {
      var a = xt;
      xt |= Br;
      var i = sR();
      if (Sa !== e || hr !== t) {
        if (Xr) {
          var u = e.memoizedUpdaters;
          u.size > 0 && (Qp(e, hr), u.clear()), Qv(e, t);
        }
        Bu = Ad(), Vp(), nc(e, t);
      }
      Su(t);
      do
        try {
          G1();
          break;
        } catch (s) {
          oR(e, s);
        }
      while (!0);
      return qh(), cR(i), xt = a, Dn !== null ? (jv(), Vu) : (Oc(), Sa = null, hr = Q, mr);
    }
    function G1() {
      for (; Dn !== null && !hd(); )
        fR(Dn);
    }
    function fR(e) {
      var t = e.alternate;
      Gt(e);
      var a;
      (e.mode & Ut) !== Ue ? (Wg(e), a = $S(t, e, Kl), wm(e, !0)) : a = $S(t, e, Kl), cn(), e.memoizedProps = e.pendingProps, a === null ? dR(e) : Dn = a, LS.current = null;
    }
    function dR(e) {
      var t = e;
      do {
        var a = t.alternate, i = t.return;
        if ((t.flags & us) === Me) {
          Gt(t);
          var u = void 0;
          if ((t.mode & Ut) === Ue ? u = z0(a, t, Kl) : (Wg(t), u = z0(a, t, Kl), wm(t, !1)), cn(), u !== null) {
            Dn = u;
            return;
          }
        } else {
          var s = Ix(a, t);
          if (s !== null) {
            s.flags &= Nv, Dn = s;
            return;
          }
          if ((t.mode & Ut) !== Ue) {
            wm(t, !1);
            for (var f = t.actualDuration, p = t.child; p !== null; )
              f += p.actualDuration, p = p.sibling;
            t.actualDuration = f;
          }
          if (i !== null)
            i.flags |= us, i.subtreeFlags = Me, i.deletions = null;
          else {
            mr = MS, Dn = null;
            return;
          }
        }
        var v = t.sibling;
        if (v !== null) {
          Dn = v;
          return;
        }
        t = i, Dn = t;
      } while (t !== null);
      mr === Vu && (mr = Z0);
    }
    function rc(e, t, a) {
      var i = za(), u = Vr.transition;
      try {
        Vr.transition = null, jn(Nr), q1(e, t, a, i);
      } finally {
        Vr.transition = u, jn(i);
      }
      return null;
    }
    function q1(e, t, a, i) {
      do
        Yu();
      while (Po !== null);
      if (l_(), (xt & (Br | Ai)) !== vr)
        throw new Error("Should not already be working.");
      var u = e.finishedWork, s = e.finishedLanes;
      if (Cd(s), u === null)
        return Rd(), null;
      if (s === Q && S("root.finishedLanes should not be empty during a commit. This is a bug in React."), e.finishedWork = null, e.finishedLanes = Q, u === e.current)
        throw new Error("Cannot commit the same tree as before. This error is likely caused by a bug in React. Please file an issue.");
      e.callbackNode = null, e.callbackPriority = Nt;
      var f = at(u.lanes, u.childLanes);
      Ud(e, f), e === Sa && (Sa = null, Dn = null, hr = Q), ((u.subtreeFlags & Wi) !== Me || (u.flags & Wi) !== Me) && (tc || (tc = !0, FS = a, GS(Gi, function() {
        return Yu(), null;
      })));
      var p = (u.subtreeFlags & (_l | kl | Dl | Wi)) !== Me, v = (u.flags & (_l | kl | Dl | Wi)) !== Me;
      if (p || v) {
        var y = Vr.transition;
        Vr.transition = null;
        var g = za();
        jn(Nr);
        var x = xt;
        xt |= Ai, LS.current = null, Gx(e, u), r0(), o1(e, u, s), uw(e.containerInfo), e.current = u, fs(s), s1(u, e, s), ds(), md(), xt = x, jn(g), Vr.transition = y;
      } else
        e.current = u, r0();
      var w = tc;
      if (tc ? (tc = !1, Po = e, Bp = s) : (Vf = 0, Am = null), f = e.pendingLanes, f === Q && (Pf = null), w || mR(e.current, !1), gd(u.stateNode, i), Xr && e.memoizedUpdaters.clear(), k1(), Va(e, Qn()), t !== null)
        for (var U = e.onRecoverableError, j = 0; j < t.length; j++) {
          var P = t[j], se = P.stack, je = P.digest;
          U(P.value, {
            componentStack: se,
            digest: je
          });
        }
      if (Um) {
        Um = !1;
        var De = AS;
        throw AS = null, De;
      }
      return Zr(Bp, Ye) && e.tag !== Oo && Yu(), f = e.pendingLanes, Zr(f, Ye) ? (ex(), e === HS ? Ip++ : (Ip = 0, HS = e)) : Ip = 0, No(), Rd(), null;
    }
    function Yu() {
      if (Po !== null) {
        var e = qv(Bp), t = _s(Ma, e), a = Vr.transition, i = za();
        try {
          return Vr.transition = null, jn(t), X1();
        } finally {
          jn(i), Vr.transition = a;
        }
      }
      return !1;
    }
    function K1(e) {
      jS.push(e), tc || (tc = !0, GS(Gi, function() {
        return Yu(), null;
      }));
    }
    function X1() {
      if (Po === null)
        return !1;
      var e = FS;
      FS = null;
      var t = Po, a = Bp;
      if (Po = null, Bp = Q, (xt & (Br | Ai)) !== vr)
        throw new Error("Cannot flush passive effects while already rendering.");
      PS = !0, zm = !1, gu(a);
      var i = xt;
      xt |= Ai, m1(t.current), d1(t, t.current, a, e);
      {
        var u = jS;
        jS = [];
        for (var s = 0; s < u.length; s++) {
          var f = u[s];
          Jx(t, f);
        }
      }
      bd(), mR(t.current, !0), xt = i, No(), zm ? t === Am ? Vf++ : (Vf = 0, Am = t) : Vf = 0, PS = !1, zm = !1, Sd(t);
      {
        var p = t.current.stateNode;
        p.effectDuration = 0, p.passiveEffectDuration = 0;
      }
      return !0;
    }
    function pR(e) {
      return Pf !== null && Pf.has(e);
    }
    function J1(e) {
      Pf === null ? Pf = /* @__PURE__ */ new Set([e]) : Pf.add(e);
    }
    function Z1(e) {
      Um || (Um = !0, AS = e);
    }
    var e_ = Z1;
    function vR(e, t, a) {
      var i = Js(a, t), u = f0(e, i, Ye), s = Mo(e, u, Ye), f = Ea();
      s !== null && (go(s, Ye, f), Va(s, f));
    }
    function fn(e, t, a) {
      if ($x(a), Wp(!1), e.tag === ee) {
        vR(e, e, a);
        return;
      }
      var i = null;
      for (i = t; i !== null; ) {
        if (i.tag === ee) {
          vR(i, e, a);
          return;
        } else if (i.tag === te) {
          var u = i.type, s = i.stateNode;
          if (typeof u.getDerivedStateFromError == "function" || typeof s.componentDidCatch == "function" && !pR(s)) {
            var f = Js(a, e), p = fS(i, f, Ye), v = Mo(i, p, Ye), y = Ea();
            v !== null && (go(v, Ye, y), Va(v, y));
            return;
          }
        }
        i = i.return;
      }
      S(`Internal React error: Attempted to capture a commit phase error inside a detached tree. This indicates a bug in React. Likely causes include deleting the same fiber more than once, committing an already-finished tree, or an inconsistent return pointer.

Error message:

%s`, a);
    }
    function t_(e, t, a) {
      var i = e.pingCache;
      i !== null && i.delete(t);
      var u = Ea();
      Jc(e, a), c_(e), Sa === e && _u(hr, a) && (mr === jp || mr === Nm && xu(hr) && Qn() - zS < eR ? nc(e, Q) : Mm = at(Mm, a)), Va(e, u);
    }
    function hR(e, t) {
      t === Nt && (t = z1(e));
      var a = Ea(), i = Fa(e, t);
      i !== null && (go(i, t, a), Va(i, a));
    }
    function n_(e) {
      var t = e.memoizedState, a = Nt;
      t !== null && (a = t.retryLane), hR(e, a);
    }
    function r_(e, t) {
      var a = Nt, i;
      switch (e.tag) {
        case Ne:
          i = e.stateNode;
          var u = e.memoizedState;
          u !== null && (a = u.retryLane);
          break;
        case Lt:
          i = e.stateNode;
          break;
        default:
          throw new Error("Pinged unknown suspense boundary type. This is probably a bug in React.");
      }
      i !== null && i.delete(t), hR(e, a);
    }
    function a_(e) {
      return e < 120 ? 120 : e < 480 ? 480 : e < 1080 ? 1080 : e < 1920 ? 1920 : e < 3e3 ? 3e3 : e < 4320 ? 4320 : N1(e / 1960) * 1960;
    }
    function i_() {
      if (Ip > M1)
        throw Ip = 0, HS = null, new Error("Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate. React limits the number of nested updates to prevent infinite loops.");
      Vf > U1 && (Vf = 0, Am = null, S("Maximum update depth exceeded. This can happen when a component calls setState inside useEffect, but useEffect either doesn't have a dependency array, or one of the dependencies changes on every render."));
    }
    function l_() {
      rl.flushLegacyContextWarning(), rl.flushPendingUnsafeLifecycleWarnings();
    }
    function mR(e, t) {
      Gt(e), Vm(e, xl, b1), t && Vm(e, Ri, x1), Vm(e, xl, T1), t && Vm(e, Ri, w1), cn();
    }
    function Vm(e, t, a) {
      for (var i = e, u = null; i !== null; ) {
        var s = i.subtreeFlags & t;
        i !== u && i.child !== null && s !== Me ? i = i.child : ((i.flags & t) !== Me && a(i), i.sibling !== null ? i = i.sibling : i = u = i.return);
      }
    }
    var Bm = null;
    function yR(e) {
      {
        if ((xt & Br) !== vr || !(e.mode & ht))
          return;
        var t = e.tag;
        if (t !== _e && t !== ee && t !== te && t !== Y && t !== Ge && t !== Ze && t !== He)
          return;
        var a = qe(e) || "ReactComponent";
        if (Bm !== null) {
          if (Bm.has(a))
            return;
          Bm.add(a);
        } else
          Bm = /* @__PURE__ */ new Set([a]);
        var i = ir;
        try {
          Gt(e), S("Can't perform a React state update on a component that hasn't mounted yet. This indicates that you have a side-effect in your render function that asynchronously later calls tries to update the component. Move this work to useEffect instead.");
        } finally {
          i ? Gt(e) : cn();
        }
      }
    }
    var $S;
    {
      var u_ = null;
      $S = function(e, t, a) {
        var i = bR(u_, t);
        try {
          return O0(e, t, a);
        } catch (s) {
          if (Sb() || s !== null && typeof s == "object" && typeof s.then == "function")
            throw s;
          if (qh(), LC(), A0(e, t), bR(t, i), t.mode & Ut && Wg(t), bl(null, O0, null, e, t, a), $i()) {
            var u = ls();
            typeof u == "object" && u !== null && u._suppressLogging && typeof s == "object" && s !== null && !s._suppressLogging && (s._suppressLogging = !0);
          }
          throw s;
        }
      };
    }
    var gR = !1, QS;
    QS = /* @__PURE__ */ new Set();
    function o_(e) {
      if (hi && !Xb())
        switch (e.tag) {
          case Y:
          case Ge:
          case He: {
            var t = Dn && qe(Dn) || "Unknown", a = t;
            if (!QS.has(a)) {
              QS.add(a);
              var i = qe(e) || "Unknown";
              S("Cannot update a component (`%s`) while rendering a different component (`%s`). To locate the bad setState() call inside `%s`, follow the stack trace as described in https://reactjs.org/link/setstate-in-render", i, t, t);
            }
            break;
          }
          case te: {
            gR || (S("Cannot update during an existing state transition (such as within `render`). Render methods should be a pure function of props and state."), gR = !0);
            break;
          }
        }
    }
    function Qp(e, t) {
      if (Xr) {
        var a = e.memoizedUpdaters;
        a.forEach(function(i) {
          bs(e, i, t);
        });
      }
    }
    var WS = {};
    function GS(e, t) {
      {
        var a = fl.current;
        return a !== null ? (a.push(t), WS) : vd(e, t);
      }
    }
    function SR(e) {
      if (e !== WS)
        return Mv(e);
    }
    function ER() {
      return fl.current !== null;
    }
    function s_(e) {
      {
        if (e.mode & ht) {
          if (!X0())
            return;
        } else if (!O1() || xt !== vr || e.tag !== Y && e.tag !== Ge && e.tag !== He)
          return;
        if (fl.current === null) {
          var t = ir;
          try {
            Gt(e), S(`An update to %s inside a test was not wrapped in act(...).

When testing, code that causes React state updates should be wrapped into act(...):

act(() => {
  /* fire events that update state */
});
/* assert on the output */

This ensures that you're testing the behavior the user would see in the browser. Learn more at https://reactjs.org/link/wrap-tests-with-act`, qe(e));
          } finally {
            t ? Gt(e) : cn();
          }
        }
      }
    }
    function c_(e) {
      e.tag !== Oo && X0() && fl.current === null && S(`A suspended resource finished loading inside a test, but the event was not wrapped in act(...).

When testing, code that resolves suspended data should be wrapped into act(...):

act(() => {
  /* finish loading suspended data */
});
/* assert on the output */

This ensures that you're testing the behavior the user would see in the browser. Learn more at https://reactjs.org/link/wrap-tests-with-act`);
    }
    function Wp(e) {
      rR = e;
    }
    var ji = null, Bf = null, f_ = function(e) {
      ji = e;
    };
    function If(e) {
      {
        if (ji === null)
          return e;
        var t = ji(e);
        return t === void 0 ? e : t.current;
      }
    }
    function qS(e) {
      return If(e);
    }
    function KS(e) {
      {
        if (ji === null)
          return e;
        var t = ji(e);
        if (t === void 0) {
          if (e != null && typeof e.render == "function") {
            var a = If(e.render);
            if (e.render !== a) {
              var i = {
                $$typeof: $,
                render: a
              };
              return e.displayName !== void 0 && (i.displayName = e.displayName), i;
            }
          }
          return e;
        }
        return t.current;
      }
    }
    function CR(e, t) {
      {
        if (ji === null)
          return !1;
        var a = e.elementType, i = t.type, u = !1, s = typeof i == "object" && i !== null ? i.$$typeof : null;
        switch (e.tag) {
          case te: {
            typeof i == "function" && (u = !0);
            break;
          }
          case Y: {
            (typeof i == "function" || s === Ke) && (u = !0);
            break;
          }
          case Ge: {
            (s === $ || s === Ke) && (u = !0);
            break;
          }
          case Ze:
          case He: {
            (s === nt || s === Ke) && (u = !0);
            break;
          }
          default:
            return !1;
        }
        if (u) {
          var f = ji(a);
          if (f !== void 0 && f === ji(i))
            return !0;
        }
        return !1;
      }
    }
    function RR(e) {
      {
        if (ji === null || typeof WeakSet != "function")
          return;
        Bf === null && (Bf = /* @__PURE__ */ new WeakSet()), Bf.add(e);
      }
    }
    var d_ = function(e, t) {
      {
        if (ji === null)
          return;
        var a = t.staleFamilies, i = t.updatedFamilies;
        Yu(), Iu(function() {
          XS(e.current, i, a);
        });
      }
    }, p_ = function(e, t) {
      {
        if (e.context !== li)
          return;
        Yu(), Iu(function() {
          Gp(t, e, null, null);
        });
      }
    };
    function XS(e, t, a) {
      {
        var i = e.alternate, u = e.child, s = e.sibling, f = e.tag, p = e.type, v = null;
        switch (f) {
          case Y:
          case He:
          case te:
            v = p;
            break;
          case Ge:
            v = p.render;
            break;
        }
        if (ji === null)
          throw new Error("Expected resolveFamily to be set during hot reload.");
        var y = !1, g = !1;
        if (v !== null) {
          var x = ji(v);
          x !== void 0 && (a.has(x) ? g = !0 : t.has(x) && (f === te ? g = !0 : y = !0));
        }
        if (Bf !== null && (Bf.has(e) || i !== null && Bf.has(i)) && (g = !0), g && (e._debugNeedsRemount = !0), g || y) {
          var w = Fa(e, Ye);
          w !== null && yr(w, e, Ye, tn);
        }
        u !== null && !g && XS(u, t, a), s !== null && XS(s, t, a);
      }
    }
    var v_ = function(e, t) {
      {
        var a = /* @__PURE__ */ new Set(), i = new Set(t.map(function(u) {
          return u.current;
        }));
        return JS(e.current, i, a), a;
      }
    };
    function JS(e, t, a) {
      {
        var i = e.child, u = e.sibling, s = e.tag, f = e.type, p = null;
        switch (s) {
          case Y:
          case He:
          case te:
            p = f;
            break;
          case Ge:
            p = f.render;
            break;
        }
        var v = !1;
        p !== null && t.has(p) && (v = !0), v ? h_(e, a) : i !== null && JS(i, t, a), u !== null && JS(u, t, a);
      }
    }
    function h_(e, t) {
      {
        var a = m_(e, t);
        if (a)
          return;
        for (var i = e; ; ) {
          switch (i.tag) {
            case ae:
              t.add(i.stateNode);
              return;
            case ge:
              t.add(i.stateNode.containerInfo);
              return;
            case ee:
              t.add(i.stateNode.containerInfo);
              return;
          }
          if (i.return === null)
            throw new Error("Expected to reach root first.");
          i = i.return;
        }
      }
    }
    function m_(e, t) {
      for (var a = e, i = !1; ; ) {
        if (a.tag === ae)
          i = !0, t.add(a.stateNode);
        else if (a.child !== null) {
          a.child.return = a, a = a.child;
          continue;
        }
        if (a === e)
          return i;
        for (; a.sibling === null; ) {
          if (a.return === null || a.return === e)
            return i;
          a = a.return;
        }
        a.sibling.return = a.return, a = a.sibling;
      }
      return !1;
    }
    var ZS;
    {
      ZS = !1;
      try {
        var TR = Object.preventExtensions({});
      } catch {
        ZS = !0;
      }
    }
    function y_(e, t, a, i) {
      this.tag = e, this.key = a, this.elementType = null, this.type = null, this.stateNode = null, this.return = null, this.child = null, this.sibling = null, this.index = 0, this.ref = null, this.pendingProps = t, this.memoizedProps = null, this.updateQueue = null, this.memoizedState = null, this.dependencies = null, this.mode = i, this.flags = Me, this.subtreeFlags = Me, this.deletions = null, this.lanes = Q, this.childLanes = Q, this.alternate = null, this.actualDuration = Number.NaN, this.actualStartTime = Number.NaN, this.selfBaseDuration = Number.NaN, this.treeBaseDuration = Number.NaN, this.actualDuration = 0, this.actualStartTime = -1, this.selfBaseDuration = 0, this.treeBaseDuration = 0, this._debugSource = null, this._debugOwner = null, this._debugNeedsRemount = !1, this._debugHookTypes = null, !ZS && typeof Object.preventExtensions == "function" && Object.preventExtensions(this);
    }
    var ui = function(e, t, a, i) {
      return new y_(e, t, a, i);
    };
    function eE(e) {
      var t = e.prototype;
      return !!(t && t.isReactComponent);
    }
    function g_(e) {
      return typeof e == "function" && !eE(e) && e.defaultProps === void 0;
    }
    function S_(e) {
      if (typeof e == "function")
        return eE(e) ? te : Y;
      if (e != null) {
        var t = e.$$typeof;
        if (t === $)
          return Ge;
        if (t === nt)
          return Ze;
      }
      return _e;
    }
    function ac(e, t) {
      var a = e.alternate;
      a === null ? (a = ui(e.tag, t, e.key, e.mode), a.elementType = e.elementType, a.type = e.type, a.stateNode = e.stateNode, a._debugSource = e._debugSource, a._debugOwner = e._debugOwner, a._debugHookTypes = e._debugHookTypes, a.alternate = e, e.alternate = a) : (a.pendingProps = t, a.type = e.type, a.flags = Me, a.subtreeFlags = Me, a.deletions = null, a.actualDuration = 0, a.actualStartTime = -1), a.flags = e.flags & Un, a.childLanes = e.childLanes, a.lanes = e.lanes, a.child = e.child, a.memoizedProps = e.memoizedProps, a.memoizedState = e.memoizedState, a.updateQueue = e.updateQueue;
      var i = e.dependencies;
      switch (a.dependencies = i === null ? null : {
        lanes: i.lanes,
        firstContext: i.firstContext
      }, a.sibling = e.sibling, a.index = e.index, a.ref = e.ref, a.selfBaseDuration = e.selfBaseDuration, a.treeBaseDuration = e.treeBaseDuration, a._debugNeedsRemount = e._debugNeedsRemount, a.tag) {
        case _e:
        case Y:
        case He:
          a.type = If(e.type);
          break;
        case te:
          a.type = qS(e.type);
          break;
        case Ge:
          a.type = KS(e.type);
          break;
      }
      return a;
    }
    function E_(e, t) {
      e.flags &= Un | mn;
      var a = e.alternate;
      if (a === null)
        e.childLanes = Q, e.lanes = t, e.child = null, e.subtreeFlags = Me, e.memoizedProps = null, e.memoizedState = null, e.updateQueue = null, e.dependencies = null, e.stateNode = null, e.selfBaseDuration = 0, e.treeBaseDuration = 0;
      else {
        e.childLanes = a.childLanes, e.lanes = a.lanes, e.child = a.child, e.subtreeFlags = Me, e.deletions = null, e.memoizedProps = a.memoizedProps, e.memoizedState = a.memoizedState, e.updateQueue = a.updateQueue, e.type = a.type;
        var i = a.dependencies;
        e.dependencies = i === null ? null : {
          lanes: i.lanes,
          firstContext: i.firstContext
        }, e.selfBaseDuration = a.selfBaseDuration, e.treeBaseDuration = a.treeBaseDuration;
      }
      return e;
    }
    function C_(e, t, a) {
      var i;
      return e === Hh ? (i = ht, t === !0 && (i |= Xt, i |= zt)) : i = Ue, Xr && (i |= Ut), ui(ee, null, null, i);
    }
    function tE(e, t, a, i, u, s) {
      var f = _e, p = e;
      if (typeof e == "function")
        eE(e) ? (f = te, p = qS(p)) : p = If(p);
      else if (typeof e == "string")
        f = ae;
      else
        e: switch (e) {
          case fi:
            return Io(a.children, u, s, t);
          case Qa:
            f = Je, u |= Xt, (u & ht) !== Ue && (u |= zt);
            break;
          case di:
            return R_(a, u, s, t);
          case ue:
            return T_(a, u, s, t);
          case ye:
            return w_(a, u, s, t);
          case Tn:
            return wR(a, u, s, t);
          case an:
          case gt:
          case sn:
          case ar:
          case vt:
          default: {
            if (typeof e == "object" && e !== null)
              switch (e.$$typeof) {
                case pi:
                  f = tt;
                  break e;
                case R:
                  f = It;
                  break e;
                case $:
                  f = Ge, p = KS(p);
                  break e;
                case nt:
                  f = Ze;
                  break e;
                case Ke:
                  f = en, p = null;
                  break e;
              }
            var v = "";
            {
              (e === void 0 || typeof e == "object" && e !== null && Object.keys(e).length === 0) && (v += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.");
              var y = i ? qe(i) : null;
              y && (v += `

Check the render method of \`` + y + "`.");
            }
            throw new Error("Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) " + ("but got: " + (e == null ? e : typeof e) + "." + v));
          }
        }
      var g = ui(f, a, t, u);
      return g.elementType = e, g.type = p, g.lanes = s, g._debugOwner = i, g;
    }
    function nE(e, t, a) {
      var i = null;
      i = e._owner;
      var u = e.type, s = e.key, f = e.props, p = tE(u, s, f, i, t, a);
      return p._debugSource = e._source, p._debugOwner = e._owner, p;
    }
    function Io(e, t, a, i) {
      var u = ui(Ie, e, i, t);
      return u.lanes = a, u;
    }
    function R_(e, t, a, i) {
      typeof e.id != "string" && S('Profiler must specify an "id" of type `string` as a prop. Received the type `%s` instead.', typeof e.id);
      var u = ui(ft, e, i, t | Ut);
      return u.elementType = di, u.lanes = a, u.stateNode = {
        effectDuration: 0,
        passiveEffectDuration: 0
      }, u;
    }
    function T_(e, t, a, i) {
      var u = ui(Ne, e, i, t);
      return u.elementType = ue, u.lanes = a, u;
    }
    function w_(e, t, a, i) {
      var u = ui(Lt, e, i, t);
      return u.elementType = ye, u.lanes = a, u;
    }
    function wR(e, t, a, i) {
      var u = ui(Le, e, i, t);
      u.elementType = Tn, u.lanes = a;
      var s = {
        isHidden: !1
      };
      return u.stateNode = s, u;
    }
    function rE(e, t, a) {
      var i = ui(fe, e, null, t);
      return i.lanes = a, i;
    }
    function b_() {
      var e = ui(ae, null, null, Ue);
      return e.elementType = "DELETED", e;
    }
    function x_(e) {
      var t = ui($t, null, null, Ue);
      return t.stateNode = e, t;
    }
    function aE(e, t, a) {
      var i = e.children !== null ? e.children : [], u = ui(ge, i, e.key, t);
      return u.lanes = a, u.stateNode = {
        containerInfo: e.containerInfo,
        pendingChildren: null,
        // Used by persistent updates
        implementation: e.implementation
      }, u;
    }
    function bR(e, t) {
      return e === null && (e = ui(_e, null, null, Ue)), e.tag = t.tag, e.key = t.key, e.elementType = t.elementType, e.type = t.type, e.stateNode = t.stateNode, e.return = t.return, e.child = t.child, e.sibling = t.sibling, e.index = t.index, e.ref = t.ref, e.pendingProps = t.pendingProps, e.memoizedProps = t.memoizedProps, e.updateQueue = t.updateQueue, e.memoizedState = t.memoizedState, e.dependencies = t.dependencies, e.mode = t.mode, e.flags = t.flags, e.subtreeFlags = t.subtreeFlags, e.deletions = t.deletions, e.lanes = t.lanes, e.childLanes = t.childLanes, e.alternate = t.alternate, e.actualDuration = t.actualDuration, e.actualStartTime = t.actualStartTime, e.selfBaseDuration = t.selfBaseDuration, e.treeBaseDuration = t.treeBaseDuration, e._debugSource = t._debugSource, e._debugOwner = t._debugOwner, e._debugNeedsRemount = t._debugNeedsRemount, e._debugHookTypes = t._debugHookTypes, e;
    }
    function __(e, t, a, i, u) {
      this.tag = t, this.containerInfo = e, this.pendingChildren = null, this.current = null, this.pingCache = null, this.finishedWork = null, this.timeoutHandle = Hy, this.context = null, this.pendingContext = null, this.callbackNode = null, this.callbackPriority = Nt, this.eventTimes = ws(Q), this.expirationTimes = ws(tn), this.pendingLanes = Q, this.suspendedLanes = Q, this.pingedLanes = Q, this.expiredLanes = Q, this.mutableReadLanes = Q, this.finishedLanes = Q, this.entangledLanes = Q, this.entanglements = ws(Q), this.identifierPrefix = i, this.onRecoverableError = u, this.mutableSourceEagerHydrationData = null, this.effectDuration = 0, this.passiveEffectDuration = 0;
      {
        this.memoizedUpdaters = /* @__PURE__ */ new Set();
        for (var s = this.pendingUpdatersLaneMap = [], f = 0; f < Eu; f++)
          s.push(/* @__PURE__ */ new Set());
      }
      switch (t) {
        case Hh:
          this._debugRootType = a ? "hydrateRoot()" : "createRoot()";
          break;
        case Oo:
          this._debugRootType = a ? "hydrate()" : "render()";
          break;
      }
    }
    function xR(e, t, a, i, u, s, f, p, v, y) {
      var g = new __(e, t, a, p, v), x = C_(t, s);
      g.current = x, x.stateNode = g;
      {
        var w = {
          element: i,
          isDehydrated: a,
          cache: null,
          // not enabled yet
          transitions: null,
          pendingSuspenseBoundaries: null
        };
        x.memoizedState = w;
      }
      return yg(x), g;
    }
    var iE = "18.3.1";
    function k_(e, t, a) {
      var i = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : null;
      return Yr(i), {
        // This tag allow us to uniquely identify this as a React Portal
        $$typeof: rr,
        key: i == null ? null : "" + i,
        children: e,
        containerInfo: t,
        implementation: a
      };
    }
    var lE, uE;
    lE = !1, uE = {};
    function _R(e) {
      if (!e)
        return li;
      var t = fo(e), a = cb(t);
      if (t.tag === te) {
        var i = t.type;
        if (Il(i))
          return eC(t, i, a);
      }
      return a;
    }
    function D_(e, t) {
      {
        var a = fo(e);
        if (a === void 0) {
          if (typeof e.render == "function")
            throw new Error("Unable to find node on an unmounted component.");
          var i = Object.keys(e).join(",");
          throw new Error("Argument appears to not be a ReactComponent. Keys: " + i);
        }
        var u = qr(a);
        if (u === null)
          return null;
        if (u.mode & Xt) {
          var s = qe(a) || "Component";
          if (!uE[s]) {
            uE[s] = !0;
            var f = ir;
            try {
              Gt(u), a.mode & Xt ? S("%s is deprecated in StrictMode. %s was passed an instance of %s which is inside StrictMode. Instead, add a ref directly to the element you want to reference. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-find-node", t, t, s) : S("%s is deprecated in StrictMode. %s was passed an instance of %s which renders StrictMode children. Instead, add a ref directly to the element you want to reference. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-find-node", t, t, s);
            } finally {
              f ? Gt(f) : cn();
            }
          }
        }
        return u.stateNode;
      }
    }
    function kR(e, t, a, i, u, s, f, p) {
      var v = !1, y = null;
      return xR(e, t, v, y, a, i, u, s, f);
    }
    function DR(e, t, a, i, u, s, f, p, v, y) {
      var g = !0, x = xR(a, i, g, e, u, s, f, p, v);
      x.context = _R(null);
      var w = x.current, U = Ea(), j = Vo(w), P = Hu(U, j);
      return P.callback = t ?? null, Mo(w, P, j), A1(x, j, U), x;
    }
    function Gp(e, t, a, i) {
      yd(t, e);
      var u = t.current, s = Ea(), f = Vo(u);
      gn(f);
      var p = _R(a);
      t.context === null ? t.context = p : t.pendingContext = p, hi && ir !== null && !lE && (lE = !0, S(`Render methods should be a pure function of props and state; triggering nested component updates from render is not allowed. If necessary, trigger nested updates in componentDidUpdate.

Check the render method of %s.`, qe(ir) || "Unknown"));
      var v = Hu(s, f);
      v.payload = {
        element: e
      }, i = i === void 0 ? null : i, i !== null && (typeof i != "function" && S("render(...): Expected the last optional `callback` argument to be a function. Instead received: %s.", i), v.callback = i);
      var y = Mo(u, v, f);
      return y !== null && (yr(y, u, f, s), em(y, u, f)), f;
    }
    function Im(e) {
      var t = e.current;
      if (!t.child)
        return null;
      switch (t.child.tag) {
        case ae:
          return t.child.stateNode;
        default:
          return t.child.stateNode;
      }
    }
    function O_(e) {
      switch (e.tag) {
        case ee: {
          var t = e.stateNode;
          if (ef(t)) {
            var a = Hv(t);
            P1(t, a);
          }
          break;
        }
        case Ne: {
          Iu(function() {
            var u = Fa(e, Ye);
            if (u !== null) {
              var s = Ea();
              yr(u, e, Ye, s);
            }
          });
          var i = Ye;
          oE(e, i);
          break;
        }
      }
    }
    function OR(e, t) {
      var a = e.memoizedState;
      a !== null && a.dehydrated !== null && (a.retryLane = Yv(a.retryLane, t));
    }
    function oE(e, t) {
      OR(e, t);
      var a = e.alternate;
      a && OR(a, t);
    }
    function N_(e) {
      if (e.tag === Ne) {
        var t = gs, a = Fa(e, t);
        if (a !== null) {
          var i = Ea();
          yr(a, e, t, i);
        }
        oE(e, t);
      }
    }
    function L_(e) {
      if (e.tag === Ne) {
        var t = Vo(e), a = Fa(e, t);
        if (a !== null) {
          var i = Ea();
          yr(a, e, t, i);
        }
        oE(e, t);
      }
    }
    function NR(e) {
      var t = dn(e);
      return t === null ? null : t.stateNode;
    }
    var LR = function(e) {
      return null;
    };
    function M_(e) {
      return LR(e);
    }
    var MR = function(e) {
      return !1;
    };
    function U_(e) {
      return MR(e);
    }
    var UR = null, zR = null, AR = null, jR = null, FR = null, HR = null, PR = null, VR = null, BR = null;
    {
      var IR = function(e, t, a) {
        var i = t[a], u = ct(e) ? e.slice() : lt({}, e);
        return a + 1 === t.length ? (ct(u) ? u.splice(i, 1) : delete u[i], u) : (u[i] = IR(e[i], t, a + 1), u);
      }, YR = function(e, t) {
        return IR(e, t, 0);
      }, $R = function(e, t, a, i) {
        var u = t[i], s = ct(e) ? e.slice() : lt({}, e);
        if (i + 1 === t.length) {
          var f = a[i];
          s[f] = s[u], ct(s) ? s.splice(u, 1) : delete s[u];
        } else
          s[u] = $R(
            // $FlowFixMe number or string is fine here
            e[u],
            t,
            a,
            i + 1
          );
        return s;
      }, QR = function(e, t, a) {
        if (t.length !== a.length) {
          ze("copyWithRename() expects paths of the same length");
          return;
        } else
          for (var i = 0; i < a.length - 1; i++)
            if (t[i] !== a[i]) {
              ze("copyWithRename() expects paths to be the same except for the deepest key");
              return;
            }
        return $R(e, t, a, 0);
      }, WR = function(e, t, a, i) {
        if (a >= t.length)
          return i;
        var u = t[a], s = ct(e) ? e.slice() : lt({}, e);
        return s[u] = WR(e[u], t, a + 1, i), s;
      }, GR = function(e, t, a) {
        return WR(e, t, 0, a);
      }, sE = function(e, t) {
        for (var a = e.memoizedState; a !== null && t > 0; )
          a = a.next, t--;
        return a;
      };
      UR = function(e, t, a, i) {
        var u = sE(e, t);
        if (u !== null) {
          var s = GR(u.memoizedState, a, i);
          u.memoizedState = s, u.baseState = s, e.memoizedProps = lt({}, e.memoizedProps);
          var f = Fa(e, Ye);
          f !== null && yr(f, e, Ye, tn);
        }
      }, zR = function(e, t, a) {
        var i = sE(e, t);
        if (i !== null) {
          var u = YR(i.memoizedState, a);
          i.memoizedState = u, i.baseState = u, e.memoizedProps = lt({}, e.memoizedProps);
          var s = Fa(e, Ye);
          s !== null && yr(s, e, Ye, tn);
        }
      }, AR = function(e, t, a, i) {
        var u = sE(e, t);
        if (u !== null) {
          var s = QR(u.memoizedState, a, i);
          u.memoizedState = s, u.baseState = s, e.memoizedProps = lt({}, e.memoizedProps);
          var f = Fa(e, Ye);
          f !== null && yr(f, e, Ye, tn);
        }
      }, jR = function(e, t, a) {
        e.pendingProps = GR(e.memoizedProps, t, a), e.alternate && (e.alternate.pendingProps = e.pendingProps);
        var i = Fa(e, Ye);
        i !== null && yr(i, e, Ye, tn);
      }, FR = function(e, t) {
        e.pendingProps = YR(e.memoizedProps, t), e.alternate && (e.alternate.pendingProps = e.pendingProps);
        var a = Fa(e, Ye);
        a !== null && yr(a, e, Ye, tn);
      }, HR = function(e, t, a) {
        e.pendingProps = QR(e.memoizedProps, t, a), e.alternate && (e.alternate.pendingProps = e.pendingProps);
        var i = Fa(e, Ye);
        i !== null && yr(i, e, Ye, tn);
      }, PR = function(e) {
        var t = Fa(e, Ye);
        t !== null && yr(t, e, Ye, tn);
      }, VR = function(e) {
        LR = e;
      }, BR = function(e) {
        MR = e;
      };
    }
    function z_(e) {
      var t = qr(e);
      return t === null ? null : t.stateNode;
    }
    function A_(e) {
      return null;
    }
    function j_() {
      return ir;
    }
    function F_(e) {
      var t = e.findFiberByHostInstance, a = k.ReactCurrentDispatcher;
      return ho({
        bundleType: e.bundleType,
        version: e.version,
        rendererPackageName: e.rendererPackageName,
        rendererConfig: e.rendererConfig,
        overrideHookState: UR,
        overrideHookStateDeletePath: zR,
        overrideHookStateRenamePath: AR,
        overrideProps: jR,
        overridePropsDeletePath: FR,
        overridePropsRenamePath: HR,
        setErrorHandler: VR,
        setSuspenseHandler: BR,
        scheduleUpdate: PR,
        currentDispatcherRef: a,
        findHostInstanceByFiber: z_,
        findFiberByHostInstance: t || A_,
        // React Refresh
        findHostInstancesForRefresh: v_,
        scheduleRefresh: d_,
        scheduleRoot: p_,
        setRefreshHandler: f_,
        // Enables DevTools to append owner stacks to error messages in DEV mode.
        getCurrentFiber: j_,
        // Enables DevTools to detect reconciler version rather than renderer version
        // which may not match for third party renderers.
        reconcilerVersion: iE
      });
    }
    var qR = typeof reportError == "function" ? (
      // In modern browsers, reportError will dispatch an error event,
      // emulating an uncaught JavaScript error.
      reportError
    ) : function(e) {
      console.error(e);
    };
    function cE(e) {
      this._internalRoot = e;
    }
    Ym.prototype.render = cE.prototype.render = function(e) {
      var t = this._internalRoot;
      if (t === null)
        throw new Error("Cannot update an unmounted root.");
      {
        typeof arguments[1] == "function" ? S("render(...): does not support the second callback argument. To execute a side effect after rendering, declare it in a component body with useEffect().") : $m(arguments[1]) ? S("You passed a container to the second argument of root.render(...). You don't need to pass it again since you already passed it to create the root.") : typeof arguments[1] < "u" && S("You passed a second argument to root.render(...) but it only accepts one argument.");
        var a = t.containerInfo;
        if (a.nodeType !== Ln) {
          var i = NR(t.current);
          i && i.parentNode !== a && S("render(...): It looks like the React-rendered content of the root container was removed without using React. This is not supported and will cause errors. Instead, call root.unmount() to empty a root's container.");
        }
      }
      Gp(e, t, null, null);
    }, Ym.prototype.unmount = cE.prototype.unmount = function() {
      typeof arguments[0] == "function" && S("unmount(...): does not support a callback argument. To execute a side effect after rendering, declare it in a component body with useEffect().");
      var e = this._internalRoot;
      if (e !== null) {
        this._internalRoot = null;
        var t = e.containerInfo;
        uR() && S("Attempted to synchronously unmount a root while React was already rendering. React cannot finish unmounting the root until the current render has completed, which may lead to a race condition."), Iu(function() {
          Gp(null, e, null, null);
        }), qE(t);
      }
    };
    function H_(e, t) {
      if (!$m(e))
        throw new Error("createRoot(...): Target container is not a DOM element.");
      KR(e);
      var a = !1, i = !1, u = "", s = qR;
      t != null && (t.hydrate ? ze("hydrate through createRoot is deprecated. Use ReactDOMClient.hydrateRoot(container, <App />) instead.") : typeof t == "object" && t !== null && t.$$typeof === _r && S(`You passed a JSX element to createRoot. You probably meant to call root.render instead. Example usage:

  let root = createRoot(domContainer);
  root.render(<App />);`), t.unstable_strictMode === !0 && (a = !0), t.identifierPrefix !== void 0 && (u = t.identifierPrefix), t.onRecoverableError !== void 0 && (s = t.onRecoverableError), t.transitionCallbacks !== void 0 && t.transitionCallbacks);
      var f = kR(e, Hh, null, a, i, u, s);
      Lh(f.current, e);
      var p = e.nodeType === Ln ? e.parentNode : e;
      return ep(p), new cE(f);
    }
    function Ym(e) {
      this._internalRoot = e;
    }
    function P_(e) {
      e && eh(e);
    }
    Ym.prototype.unstable_scheduleHydration = P_;
    function V_(e, t, a) {
      if (!$m(e))
        throw new Error("hydrateRoot(...): Target container is not a DOM element.");
      KR(e), t === void 0 && S("Must provide initial children as second argument to hydrateRoot. Example usage: hydrateRoot(domContainer, <App />)");
      var i = a ?? null, u = a != null && a.hydratedSources || null, s = !1, f = !1, p = "", v = qR;
      a != null && (a.unstable_strictMode === !0 && (s = !0), a.identifierPrefix !== void 0 && (p = a.identifierPrefix), a.onRecoverableError !== void 0 && (v = a.onRecoverableError));
      var y = DR(t, null, e, Hh, i, s, f, p, v);
      if (Lh(y.current, e), ep(e), u)
        for (var g = 0; g < u.length; g++) {
          var x = u[g];
          $b(y, x);
        }
      return new Ym(y);
    }
    function $m(e) {
      return !!(e && (e.nodeType === Qr || e.nodeType === Yi || e.nodeType === nd));
    }
    function qp(e) {
      return !!(e && (e.nodeType === Qr || e.nodeType === Yi || e.nodeType === nd || e.nodeType === Ln && e.nodeValue === " react-mount-point-unstable "));
    }
    function KR(e) {
      e.nodeType === Qr && e.tagName && e.tagName.toUpperCase() === "BODY" && S("createRoot(): Creating roots directly with document.body is discouraged, since its children are often manipulated by third-party scripts and browser extensions. This may lead to subtle reconciliation issues. Try using a container element created for your app."), fp(e) && (e._reactRootContainer ? S("You are calling ReactDOMClient.createRoot() on a container that was previously passed to ReactDOM.render(). This is not supported.") : S("You are calling ReactDOMClient.createRoot() on a container that has already been passed to createRoot() before. Instead, call root.render() on the existing root instead if you want to update it."));
    }
    var B_ = k.ReactCurrentOwner, XR;
    XR = function(e) {
      if (e._reactRootContainer && e.nodeType !== Ln) {
        var t = NR(e._reactRootContainer.current);
        t && t.parentNode !== e && S("render(...): It looks like the React-rendered content of this container was removed without using React. This is not supported and will cause errors. Instead, call ReactDOM.unmountComponentAtNode to empty a container.");
      }
      var a = !!e._reactRootContainer, i = fE(e), u = !!(i && ko(i));
      u && !a && S("render(...): Replacing React-rendered children with a new root component. If you intended to update the children of this node, you should instead have the existing children update their state and render the new components instead of calling ReactDOM.render."), e.nodeType === Qr && e.tagName && e.tagName.toUpperCase() === "BODY" && S("render(): Rendering components directly into document.body is discouraged, since its children are often manipulated by third-party scripts and browser extensions. This may lead to subtle reconciliation issues. Try rendering into a container element created for your app.");
    };
    function fE(e) {
      return e ? e.nodeType === Yi ? e.documentElement : e.firstChild : null;
    }
    function JR() {
    }
    function I_(e, t, a, i, u) {
      if (u) {
        if (typeof i == "function") {
          var s = i;
          i = function() {
            var w = Im(f);
            s.call(w);
          };
        }
        var f = DR(
          t,
          i,
          e,
          Oo,
          null,
          // hydrationCallbacks
          !1,
          // isStrictMode
          !1,
          // concurrentUpdatesByDefaultOverride,
          "",
          // identifierPrefix
          JR
        );
        e._reactRootContainer = f, Lh(f.current, e);
        var p = e.nodeType === Ln ? e.parentNode : e;
        return ep(p), Iu(), f;
      } else {
        for (var v; v = e.lastChild; )
          e.removeChild(v);
        if (typeof i == "function") {
          var y = i;
          i = function() {
            var w = Im(g);
            y.call(w);
          };
        }
        var g = kR(
          e,
          Oo,
          null,
          // hydrationCallbacks
          !1,
          // isStrictMode
          !1,
          // concurrentUpdatesByDefaultOverride,
          "",
          // identifierPrefix
          JR
        );
        e._reactRootContainer = g, Lh(g.current, e);
        var x = e.nodeType === Ln ? e.parentNode : e;
        return ep(x), Iu(function() {
          Gp(t, g, a, i);
        }), g;
      }
    }
    function Y_(e, t) {
      e !== null && typeof e != "function" && S("%s(...): Expected the last optional `callback` argument to be a function. Instead received: %s.", t, e);
    }
    function Qm(e, t, a, i, u) {
      XR(a), Y_(u === void 0 ? null : u, "render");
      var s = a._reactRootContainer, f;
      if (!s)
        f = I_(a, t, e, u, i);
      else {
        if (f = s, typeof u == "function") {
          var p = u;
          u = function() {
            var v = Im(f);
            p.call(v);
          };
        }
        Gp(t, f, e, u);
      }
      return Im(f);
    }
    var ZR = !1;
    function $_(e) {
      {
        ZR || (ZR = !0, S("findDOMNode is deprecated and will be removed in the next major release. Instead, add a ref directly to the element you want to reference. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-find-node"));
        var t = B_.current;
        if (t !== null && t.stateNode !== null) {
          var a = t.stateNode._warnedAboutRefsInRender;
          a || S("%s is accessing findDOMNode inside its render(). render() should be a pure function of props and state. It should never access something that requires stale data from the previous render, such as refs. Move this logic to componentDidMount and componentDidUpdate instead.", Dt(t.type) || "A component"), t.stateNode._warnedAboutRefsInRender = !0;
        }
      }
      return e == null ? null : e.nodeType === Qr ? e : D_(e, "findDOMNode");
    }
    function Q_(e, t, a) {
      if (S("ReactDOM.hydrate is no longer supported in React 18. Use hydrateRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot"), !qp(t))
        throw new Error("Target container is not a DOM element.");
      {
        var i = fp(t) && t._reactRootContainer === void 0;
        i && S("You are calling ReactDOM.hydrate() on a container that was previously passed to ReactDOMClient.createRoot(). This is not supported. Did you mean to call hydrateRoot(container, element)?");
      }
      return Qm(null, e, t, !0, a);
    }
    function W_(e, t, a) {
      if (S("ReactDOM.render is no longer supported in React 18. Use createRoot instead. Until you switch to the new API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot"), !qp(t))
        throw new Error("Target container is not a DOM element.");
      {
        var i = fp(t) && t._reactRootContainer === void 0;
        i && S("You are calling ReactDOM.render() on a container that was previously passed to ReactDOMClient.createRoot(). This is not supported. Did you mean to call root.render(element)?");
      }
      return Qm(null, e, t, !1, a);
    }
    function G_(e, t, a, i) {
      if (S("ReactDOM.unstable_renderSubtreeIntoContainer() is no longer supported in React 18. Consider using a portal instead. Until you switch to the createRoot API, your app will behave as if it's running React 17. Learn more: https://reactjs.org/link/switch-to-createroot"), !qp(a))
        throw new Error("Target container is not a DOM element.");
      if (e == null || !oy(e))
        throw new Error("parentComponent must be a valid React Component");
      return Qm(e, t, a, !1, i);
    }
    var eT = !1;
    function q_(e) {
      if (eT || (eT = !0, S("unmountComponentAtNode is deprecated and will be removed in the next major release. Switch to the createRoot API. Learn more: https://reactjs.org/link/switch-to-createroot")), !qp(e))
        throw new Error("unmountComponentAtNode(...): Target container is not a DOM element.");
      {
        var t = fp(e) && e._reactRootContainer === void 0;
        t && S("You are calling ReactDOM.unmountComponentAtNode() on a container that was previously passed to ReactDOMClient.createRoot(). This is not supported. Did you mean to call root.unmount()?");
      }
      if (e._reactRootContainer) {
        {
          var a = fE(e), i = a && !ko(a);
          i && S("unmountComponentAtNode(): The node you're attempting to unmount was rendered by another copy of React.");
        }
        return Iu(function() {
          Qm(null, null, e, !1, function() {
            e._reactRootContainer = null, qE(e);
          });
        }), !0;
      } else {
        {
          var u = fE(e), s = !!(u && ko(u)), f = e.nodeType === Qr && qp(e.parentNode) && !!e.parentNode._reactRootContainer;
          s && S("unmountComponentAtNode(): The node you're attempting to unmount was rendered by React and is not a top-level container. %s", f ? "You may have accidentally passed in a React root node instead of its container." : "Instead, have the parent component update its state and rerender in order to remove this component.");
        }
        return !1;
      }
    }
    Tr(O_), So(N_), Kv(L_), Ds(za), jd(Wv), (typeof Map != "function" || // $FlowIssue Flow incorrectly thinks Map has no prototype
    Map.prototype == null || typeof Map.prototype.forEach != "function" || typeof Set != "function" || // $FlowIssue Flow incorrectly thinks Set has no prototype
    Set.prototype == null || typeof Set.prototype.clear != "function" || typeof Set.prototype.forEach != "function") && S("React depends on Map and Set built-in types. Make sure that you load a polyfill in older browsers. https://reactjs.org/link/react-polyfills"), yc(XT), uy(BS, V1, Iu);
    function K_(e, t) {
      var a = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : null;
      if (!$m(t))
        throw new Error("Target container is not a DOM element.");
      return k_(e, t, null, a);
    }
    function X_(e, t, a, i) {
      return G_(e, t, a, i);
    }
    var dE = {
      usingClientEntryPoint: !1,
      // Keep in sync with ReactTestUtils.js.
      // This is an array for better minification.
      Events: [ko, Ef, Mh, uo, gc, BS]
    };
    function J_(e, t) {
      return dE.usingClientEntryPoint || S('You are importing createRoot from "react-dom" which is not supported. You should instead import it from "react-dom/client".'), H_(e, t);
    }
    function Z_(e, t, a) {
      return dE.usingClientEntryPoint || S('You are importing hydrateRoot from "react-dom" which is not supported. You should instead import it from "react-dom/client".'), V_(e, t, a);
    }
    function ek(e) {
      return uR() && S("flushSync was called from inside a lifecycle method. React cannot flush when React is already rendering. Consider moving this call to a scheduler task or micro task."), Iu(e);
    }
    var tk = F_({
      findFiberByHostInstance: Is,
      bundleType: 1,
      version: iE,
      rendererPackageName: "react-dom"
    });
    if (!tk && On && window.top === window.self && (navigator.userAgent.indexOf("Chrome") > -1 && navigator.userAgent.indexOf("Edge") === -1 || navigator.userAgent.indexOf("Firefox") > -1)) {
      var tT = window.location.protocol;
      /^(https?|file):$/.test(tT) && console.info("%cDownload the React DevTools for a better development experience: https://reactjs.org/link/react-devtools" + (tT === "file:" ? `
You might need to use a local HTTP server (instead of file://): https://reactjs.org/link/react-devtools-faq` : ""), "font-weight:bold");
    }
    Ia.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = dE, Ia.createPortal = K_, Ia.createRoot = J_, Ia.findDOMNode = $_, Ia.flushSync = ek, Ia.hydrate = Q_, Ia.hydrateRoot = Z_, Ia.render = W_, Ia.unmountComponentAtNode = q_, Ia.unstable_batchedUpdates = BS, Ia.unstable_renderSubtreeIntoContainer = X_, Ia.version = iE, typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop == "function" && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(new Error());
  }()), Ia;
}
function hT() {
  if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function")) {
    if (process.env.NODE_ENV !== "production")
      throw new Error("^_^");
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(hT);
    } catch (D) {
      console.error(D);
    }
  }
}
process.env.NODE_ENV === "production" ? (hT(), yE.exports = fk()) : yE.exports = dk();
var pk = yE.exports, gE, qm = pk;
if (process.env.NODE_ENV === "production")
  gE = qm.createRoot, qm.hydrateRoot;
else {
  var dT = qm.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
  gE = function(D, F) {
    dT.usingClientEntryPoint = !0;
    try {
      return qm.createRoot(D, F);
    } finally {
      dT.usingClientEntryPoint = !1;
    }
  };
}
var $f = tv();
const vk = /* @__PURE__ */ ak($f), SE = "rls:state-changed";
function ev() {
  var F;
  if (typeof window > "u") return null;
  const D = window;
  return D.rlsState || D.__RLS_STATE__ || ((F = D.rlsBridge) == null ? void 0 : F.state) || null;
}
function hk(D) {
  return typeof window > "u" ? () => {
  } : (window.addEventListener(SE, D), () => window.removeEventListener(SE, D));
}
function mT() {
  typeof window > "u" || window.dispatchEvent(new Event(SE));
}
function EE() {
  const [D, F] = $f.useState(() => ev());
  return $f.useEffect(() => (F(ev()), hk(() => F(ev()))), []), D;
}
function Km({
  label: D,
  bgColor: F,
  textColor: k,
  intent: ce,
  size: Te = "md",
  icon: ze,
  onDismiss: S,
  dismissLabel: mt
}) {
  const Y = [
    "pill",
    "rls-react-pill",
    ce ? `rls-pill-${ce}` : "",
    Te ? `rls-pill-${Te}` : ""
  ].filter(Boolean).join(" "), te = {
    ...F ? { backgroundColor: F, borderColor: F } : null,
    ...k ? { color: k } : null
  };
  return /* @__PURE__ */ we.jsxs("span", { className: Y, style: te, children: [
    ze ? /* @__PURE__ */ we.jsx("span", { className: "rls-react-icon", "aria-hidden": "true", children: ze }) : null,
    /* @__PURE__ */ we.jsx("span", { className: "rls-react-label", children: D }),
    S ? /* @__PURE__ */ we.jsx(
      "button",
      {
        type: "button",
        className: "rls-react-dismiss",
        "aria-label": mt || `Dismiss ${D}`,
        onClick: S,
        children: "x"
      }
    ) : null
  ] });
}
function CE({
  label: D,
  bgColor: F,
  textColor: k,
  intent: ce,
  size: Te = "md",
  icon: ze,
  onDismiss: S,
  dismissLabel: mt
}) {
  const Y = [
    "tag",
    "rls-react-tag",
    ce ? `rls-tag-${ce}` : "",
    Te ? `rls-tag-${Te}` : ""
  ].filter(Boolean).join(" "), te = {
    ...F ? { backgroundColor: F, borderColor: F } : null,
    ...k ? { color: k } : null
  };
  return /* @__PURE__ */ we.jsxs("span", { className: Y, style: te, children: [
    ze ? /* @__PURE__ */ we.jsx("span", { className: "rls-react-icon", "aria-hidden": "true", children: ze }) : null,
    /* @__PURE__ */ we.jsx("span", { className: "rls-react-label", children: D }),
    S ? /* @__PURE__ */ we.jsx(
      "button",
      {
        type: "button",
        className: "rls-react-dismiss",
        "aria-label": mt || `Dismiss ${D}`,
        onClick: S,
        children: "x"
      }
    ) : null
  ] });
}
const mk = [
  { id: "label", label: "Label" },
  { id: "public", label: "Public" },
  { id: "eras", label: "Eras" }
], yk = [
  { key: "labelScheduled", label: "Label Scheduled" },
  { key: "labelReleased", label: "Label Released" },
  { key: "rivalScheduled", label: "Rival Scheduled" },
  { key: "rivalReleased", label: "Rival Released" }
];
function gk(D) {
  return D === 0 ? "12AM" : D < 12 ? `${D}AM` : D === 12 ? "12PM" : `${D - 12}PM`;
}
function pT(D) {
  if (!Number.isFinite(D)) return "-";
  const F = new Date(D), k = window.DAYS || ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"], ce = window.MONTHS || [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC"
  ], Te = k[F.getUTCDay()] || "DAY", ze = ce[F.getUTCMonth()] || "MON", S = String(F.getUTCDate()).padStart(2, "0"), mt = F.getUTCFullYear(), Y = F.getUTCHours();
  return `${Te} - ${ze} ${S}, ${mt} - ${gk(Y)}`;
}
function yT(D, F) {
  var ce;
  return ((ce = (Array.isArray(D == null ? void 0 : D.rivals) ? D.rivals : []).find((Te) => Te.name === F)) == null ? void 0 : ce.country) || null;
}
function Sk(D, F) {
  var ze, S;
  if (F != null && F.labelColor) return F.labelColor;
  const k = (F == null ? void 0 : F.label) || ((ze = D == null ? void 0 : D.label) == null ? void 0 : ze.name) || "Label", ce = yT(D, k) || ((S = D == null ? void 0 : D.label) == null ? void 0 : S.country) || "Annglora";
  return (window.COUNTRY_COLORS || {})[ce] || "var(--accent)";
}
function Ek(D, F) {
  var Te, ze;
  const k = (F == null ? void 0 : F.label) || ((Te = D == null ? void 0 : D.label) == null ? void 0 : Te.name) || "Label";
  return (yT(D, k) || ((ze = D == null ? void 0 : D.label) == null ? void 0 : ze.country) || "Annglora") === "Bytenza" ? "#f4f1ea" : "#0b0f14";
}
function Ck(D) {
  var ce;
  const F = (ce = window.rlsUi) == null ? void 0 : ce.setCalendarTab;
  if (typeof F == "function") {
    F(D);
    return;
  }
  const k = ev();
  k && (k.ui || (k.ui = {}), k.ui.calendarTab = D, mT());
}
function Rk(D, F) {
  var Te;
  const k = (Te = window.rlsUi) == null ? void 0 : Te.setCalendarFilter;
  if (typeof k == "function") {
    k(D, F);
    return;
  }
  const ce = ev();
  ce && (ce.ui || (ce.ui = {}), ce.ui.calendarFilters || (ce.ui.calendarFilters = {}), ce.ui.calendarFilters[D] = F, mT());
}
function Tk() {
  var F;
  const D = window.rlsBuildCalendarProjection || ((F = window.rlsBridge) == null ? void 0 : F.buildCalendarProjection);
  if (typeof D != "function") return null;
  try {
    return D({ pastWeeks: 0, futureWeeks: 11 });
  } catch (k) {
    return console.warn("Calendar projection failed.", k), null;
  }
}
function wk() {
  var Te, ze, S, mt;
  const D = EE();
  if ($f.useEffect(() => {
    const Y = document.getElementById("calendarModal");
    if (!Y) return;
    const te = Y.querySelectorAll("#calendarModalTabs, #calendarModalFilters, #calendarFullList");
    return te.forEach((_e) => _e.classList.add("hidden")), () => te.forEach((_e) => _e.classList.remove("hidden"));
  }, []), !D)
    return /* @__PURE__ */ we.jsx("div", { className: "muted", children: "Calendar bridge waiting for state." });
  const F = ((Te = D.ui) == null ? void 0 : Te.calendarTab) || "label", k = ((ze = D.ui) == null ? void 0 : ze.calendarFilters) || {}, ce = Tk();
  return /* @__PURE__ */ we.jsxs("div", { className: "rls-react-calendar", children: [
    /* @__PURE__ */ we.jsx("div", { className: "tabs", children: mk.map((Y) => /* @__PURE__ */ we.jsx(
      "button",
      {
        type: "button",
        className: `tab${F === Y.id ? " active" : ""}`,
        onClick: () => Ck(Y.id),
        children: Y.label
      },
      Y.id
    )) }),
    F !== "eras" ? /* @__PURE__ */ we.jsx("div", { className: "filter-row", children: yk.map((Y) => {
      const te = k[Y.key] !== !1;
      return /* @__PURE__ */ we.jsxs("label", { className: "check-pill", children: [
        /* @__PURE__ */ we.jsx(
          "input",
          {
            type: "checkbox",
            checked: te,
            onChange: (_e) => Rk(Y.key, _e.target.checked)
          }
        ),
        Y.label
      ] }, Y.key);
    }) }) : null,
    /* @__PURE__ */ we.jsx("div", { className: "list", children: ce ? F === "eras" ? (S = ce.eras) != null && S.length ? ce.eras.map((Y) => /* @__PURE__ */ we.jsxs("div", { className: "list-item", children: [
      /* @__PURE__ */ we.jsx("div", { className: "item-title", children: Y.name || "Unknown Era" }),
      /* @__PURE__ */ we.jsxs("div", { className: "muted", children: [
        "Act: ",
        Y.actName || "Unknown",
        " | Stage: ",
        Y.stageName || "Active"
      ] }),
      /* @__PURE__ */ we.jsxs("div", { className: "muted", children: [
        "Started Week ",
        Y.startedWeek || "-",
        " | Content: ",
        Y.content || "-"
      ] })
    ] }, Y.id || `${Y.name}-${Y.actName}`)) : /* @__PURE__ */ we.jsx("div", { className: "muted", children: "No active eras on the calendar." }) : (mt = ce.weeks) != null && mt.length ? ce.weeks.map((Y) => {
      const te = Array.isArray(Y.events) ? Y.events.slice().sort((_e, ee) => _e.ts - ee.ts) : [];
      return /* @__PURE__ */ we.jsxs("div", { className: "list-item", children: [
        /* @__PURE__ */ we.jsxs("div", { className: "list-row", children: [
          /* @__PURE__ */ we.jsxs("div", { children: [
            /* @__PURE__ */ we.jsxs("div", { className: "item-title", children: [
              "Week ",
              Y.weekNumber
            ] }),
            /* @__PURE__ */ we.jsxs("div", { className: "muted", children: [
              pT(Y.start),
              " - ",
              pT(Y.end - (window.HOUR_MS || 36e5))
            ] })
          ] }),
          /* @__PURE__ */ we.jsx(Km, { label: `${te.length} event(s)` })
        ] }),
        te.map((_e) => {
          var tt;
          const ee = _e.label || ((tt = D.label) == null ? void 0 : tt.name) || "Label", ge = Sk(D, _e), ae = Ek(D, _e), fe = _e.actName || "Unknown", Ie = _e.title || "Untitled", Je = _e.typeLabel || "Event", It = _e.distribution || "Digital";
          return /* @__PURE__ */ we.jsxs("div", { className: "muted", children: [
            /* @__PURE__ */ we.jsx(CE, { label: ee, bgColor: ge, textColor: ae }),
            " | ",
            fe,
            " | ",
            Ie,
            " (",
            Je,
            ", ",
            It,
            ")"
          ] }, _e.id || `${ee}-${_e.ts}-${Ie}`);
        })
      ] }, `week-${Y.weekNumber}`);
    }) : /* @__PURE__ */ we.jsx("div", { className: "muted", children: "No scheduled entries." }) : /* @__PURE__ */ we.jsx("div", { className: "muted", children: "Calendar data is unavailable." }) })
  ] });
}
function bk() {
  var Te, ze, S;
  const D = EE();
  if (!D)
    return /* @__PURE__ */ we.jsx("div", { className: "muted", children: "UI tokens waiting for state." });
  const F = ((Te = D.ui) == null ? void 0 : Te.createStage) || "sheet", k = ((ze = D.label) == null ? void 0 : ze.alignment) || "Neutral", ce = ((S = D.label) == null ? void 0 : S.name) || "Record Label";
  return /* @__PURE__ */ we.jsxs("div", { className: "rls-react-section", children: [
    /* @__PURE__ */ we.jsx("div", { className: "tiny muted", children: "React UI tokens (demo)" }),
    /* @__PURE__ */ we.jsxs("div", { className: "rls-react-token-row", children: [
      /* @__PURE__ */ we.jsx(Km, { label: `Stage: ${F}`, size: "sm" }),
      /* @__PURE__ */ we.jsx(CE, { label: k, size: "sm" }),
      /* @__PURE__ */ we.jsx(Km, { label: ce, size: "sm" })
    ] })
  ] });
}
const xk = [
  {
    role: "Songwriter",
    key: "songwriterIds",
    label: "Songwriter",
    slotLabel: "Songwriter Slot",
    targetBase: "track-writer"
  },
  {
    role: "Performer",
    key: "performerIds",
    label: "Recorder",
    slotLabel: "Recorder Slot",
    targetBase: "track-performer"
  },
  {
    role: "Producer",
    key: "producerIds",
    label: "Producer",
    slotLabel: "Producer Slot",
    targetBase: "track-producer"
  }
], _k = 3;
function kk(D) {
  return String(D || "").replace(/\"/g, "%22").replace(/'/g, "%27");
}
function Dk(D, F, k) {
  const ce = window.TRACK_ROLE_LIMITS || {}, Te = Number(ce[F]);
  return Number.isFinite(Te) && Te > 0 ? Te : Number.isFinite(k) && k > 0 ? k : 1;
}
function Ok({ limit: D, assigned: F, current: k }) {
  const ce = Math.min(_k, D), Te = Number.isFinite(k) ? k : ce;
  return Math.max(ce, Math.min(D, Math.max(Te, F)));
}
function Nk(D, F) {
  if (!D) return F;
  const k = typeof D.stageName == "string" ? D.stageName.trim() : "", ce = String(D.name || k || "").trim();
  return k && ce && k !== ce ? /* @__PURE__ */ we.jsxs("span", { className: "name-stack", children: [
    /* @__PURE__ */ we.jsx("span", { className: "creator-stage-name", children: k }),
    /* @__PURE__ */ we.jsxs("span", { className: "muted", children: [
      "[",
      ce,
      "]"
    ] })
  ] }) : ce || k || F;
}
function Lk() {
  var _e, ee, ge, ae;
  const D = EE();
  if ($f.useEffect(() => {
    const fe = document.getElementById("trackSlotGrid");
    if (fe)
      return fe.classList.add("hidden"), () => fe.classList.remove("hidden");
  }, []), !D)
    return /* @__PURE__ */ we.jsx("div", { className: "muted", children: "Track slots waiting for state." });
  const F = Array.isArray(D.creators) ? D.creators : [], k = $f.useMemo(() => {
    const fe = /* @__PURE__ */ new Map();
    return F.forEach((Ie) => {
      Ie != null && Ie.id && fe.set(Ie.id, Ie);
    }), fe;
  }, [F]), ce = ((_e = D.ui) == null ? void 0 : _e.createStage) || "sheet", Te = ce === "demo" ? "Performer" : ce === "master" ? "Producer" : "Songwriter", ze = ((ee = D.ui) == null ? void 0 : ee.slotTarget) || null, S = ((ge = D.ui) == null ? void 0 : ge.trackSlots) || {}, mt = ((ae = D.ui) == null ? void 0 : ae.trackSlotVisible) || {}, Y = Number(window.STUDIO_COLUMN_SLOT_COUNT) || 5, te = window.UNASSIGNED_CREATOR_LABEL || "Unassigned";
  return /* @__PURE__ */ we.jsx("div", { className: "rls-react-trackslots", children: xk.map((fe) => {
    const Ie = Array.isArray(S[fe.key]) ? S[fe.key].slice() : [], Je = Dk(D, fe.role, Ie.length);
    for (; Ie.length < Je; ) Ie.push(null);
    const It = Ie.filter(Boolean).length, tt = Ok({
      limit: Je,
      assigned: It,
      current: Number(mt[fe.role])
    }), Ge = Math.max(1, Math.ceil(Je / Y)), ft = fe.role === Te;
    return /* @__PURE__ */ we.jsxs(
      "div",
      {
        className: `slot-role-group${ft ? " is-active" : ""}`,
        "data-slot-role-group": fe.role,
        children: [
          /* @__PURE__ */ we.jsxs("div", { className: "slot-group-head", children: [
            /* @__PURE__ */ we.jsxs("div", { className: "slot-group-label", "data-slot-group-label": fe.role, children: [
              fe.label,
              " Slots"
            ] }),
            /* @__PURE__ */ we.jsxs("div", { className: "slot-group-actions", children: [
              /* @__PURE__ */ we.jsx(Km, { label: `${It}/${Je}`, size: "sm" }),
              ft ? /* @__PURE__ */ we.jsx(CE, { label: "Active Stage", size: "sm" }) : null,
              /* @__PURE__ */ we.jsx("button", { type: "button", className: "ghost mini", "data-slot-more": fe.role, children: "Add Slot" }),
              /* @__PURE__ */ we.jsx("button", { type: "button", className: "ghost mini", "data-slot-less": fe.role, children: "Show Less" })
            ] })
          ] }),
          /* @__PURE__ */ we.jsx("div", { className: "slot-role-grid", "data-slot-role-grid": fe.role, children: Array.from({ length: Ge }).map((Ne, Ze) => {
            const He = Ze * Y + 1, en = He <= tt;
            return /* @__PURE__ */ we.jsxs(vk.Fragment, { children: [
              /* @__PURE__ */ we.jsxs(
                "div",
                {
                  className: `slot-column-label${en ? "" : " hidden"}`,
                  "data-slot-column-label": `${fe.role}-${Ze + 1}`,
                  "data-slot-role": fe.role,
                  "data-slot-column-start": String(He),
                  children: [
                    "Studio ",
                    Ze + 1
                  ]
                }
              ),
              Array.from({ length: Y }).map((Ht, $t) => {
                const Lt = Ze * Y + $t + 1;
                if (Lt > Je) return null;
                const yt = `${fe.targetBase}-${Lt}`, Le = Ie[Lt - 1], Et = Le ? k.get(Le) : null, Tt = Lt > tt, kt = ze === yt, Se = (Et == null ? void 0 : Et.portraitUrl) || "", Z = Se ? { backgroundImage: `url("${kk(Se)}")` } : void 0, xe = [
                  "slot-avatar",
                  Se ? "has-image" : "",
                  Et ? "" : "is-empty"
                ].filter(Boolean).join(" ");
                return /* @__PURE__ */ we.jsxs(
                  "div",
                  {
                    className: `id-slot${kt ? " active" : ""}${Tt ? " hidden" : ""}`,
                    "data-slot-target": yt,
                    "data-slot-type": "creator",
                    "data-slot-role": fe.role,
                    "data-slot-group": "track",
                    "data-slot-index": String(Lt),
                    children: [
                      /* @__PURE__ */ we.jsxs("div", { className: "slot-label", children: [
                        fe.slotLabel,
                        " ",
                        Lt
                      ] }),
                      /* @__PURE__ */ we.jsxs("div", { className: "slot-id", children: [
                        /* @__PURE__ */ we.jsx("div", { className: xe, style: Z, "aria-hidden": "true" }),
                        /* @__PURE__ */ we.jsx("div", { className: "slot-value", children: Nk(Et, te) })
                      ] }),
                      /* @__PURE__ */ we.jsxs("div", { className: "slot-actions", children: [
                        /* @__PURE__ */ we.jsx("button", { type: "button", className: "ghost mini", "data-slot-recommend": yt, children: "Recommend" }),
                        /* @__PURE__ */ we.jsx("button", { type: "button", className: "ghost mini", "data-slot-clear": yt, children: "Clear" })
                      ] })
                    ]
                  },
                  yt
                );
              })
            ] }, `${fe.role}-col-${Ze}`);
          }) })
        ]
      },
      fe.role
    );
  }) });
}
function hE(D, F) {
  const k = document.getElementById(D);
  if (!k) return;
  gE(k).render(F);
}
typeof document < "u" && (hE("rls-react-pills-root", /* @__PURE__ */ we.jsx(bk, {})), hE("rls-react-calendar-root", /* @__PURE__ */ we.jsx(wk, {})), hE("rls-react-trackslots-root", /* @__PURE__ */ we.jsx(Lk, {})));
