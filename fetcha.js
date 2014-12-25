/*!
 * conkitty-route v0.0.0, https://github.com/hoho/fetcha
 * (c) 2014 Marat Abdullin, MIT license
 */

window.Fetcha = (function(undefined) {
    'use strict';

    var cache = {};

    function Fetcha(settings, overrideCallbackPayload) {
        // self.ok — Success callbacks.
        // self.err — Error callbacks.
        // self.d — Done.
        // self.e — Error.
        // self.r = XMLHTTRequest.
        // self.j = Parsed response JSON.

        if (!(this instanceof Fetcha)) {
            return new Fetcha(settings, overrideCallbackPayload);
        }

        var self = this,
            uri = settings.uri,
            method = (settings.method || 'GET').toUpperCase(),
            parse = settings.parse || function(response) { if (this.status !== 204) { return JSON.parse(response); } },
            body,
            transform = settings.transform,
            override = settings.override,
            emitEvent = settings.callback,
            cacheKey,
            ttl,
            cached,
            req,
            response;

        if (method === 'GET' &&
            ((cacheKey = ifFunction(settings.cache, null, [uri, overrideCallbackPayload]))))
        {
            if (cacheKey instanceof CacheSettings) {
                ttl = cacheKey.ttl || 1000;
                cacheKey = cacheKey.key;
            }

            cacheKey = cacheKey ? '|' + cacheKey : '_' + uri;

            if ((cached = cache[cacheKey])) {
                return cached.data;
            } else {
                cache[cacheKey] = {
                    data: self,
                    timer: setTimeout(function() { delete cache[cacheKey]; }, ttl)
                };
            }
        }

        self.ok = [];
        self.err = [];

        body = ifFunction(settings.body, self, [overrideCallbackPayload, uri, method]);

        if (((self.j = override && override.call(self, overrideCallbackPayload, uri, method, body))) === undefined) {
            self.r = req = new XMLHttpRequest();

            req.open(
                (req.method = method),
                (req.uri = uri),
                true
            );

            if (emitEvent) { emitEvent.call(self, req, false); }

            req.onreadystatechange = function() {
                if (req.readyState === 4) { // Completed.
                    if (emitEvent) { emitEvent.call(self, req, true); }
                    self.d = self.e = true;
                    if (((req.status / 100) | 0) === 2) { // A clever Math.ceil(req.status / 100) === 2
                        try {
                            // TODO: Look at HTTP status codes and handle them more carefully.
                            response = req.responseText;
                            response = parse ? parse.call(self, response, req) : (req.status === 204 ? undefined : JSON.parse(response));
                            self.j = transform ? transform.call(self, response, req) : response;
                            self.e = false;
                        } catch(e) {}
                    }
                    done(self);
                    self.r = undefined;
                }
            };

            req.send(body);
        } else {
            self.d = true;
            done(self);
        }
    }

    var proto = Fetcha.prototype;

    proto.then = function(ok, error) {
        var self = this;
        if (ok) { self.ok.push(ok); }
        if (error) { self.err.push(error); }
        done(self);
    };


    proto.reject = function() {
        var self = this;

        if (!self.d) {
            if (self.r) {
                self.r.abort();
                self.r = undefined;
            }
            self.d = self.e = true;
            done(self);
        }
    };


    Fetcha.cache = CacheSettings;
    Fetcha.clear = function clearCache() {
        var i,
            keys = Object.keys(cache);

        for (i = keys.length; i--;) {
            clearTimeout(cache[keys[i]].timer);
        }

        cache = {};
    };


    return Fetcha;


    function done(self/**/, todo, data) {
        if (self.d) {
            if (self.e) {
                todo = self.err;
                data = self.r;
            } else {
                todo = self.ok;
                data = self.j;
            }

            while (todo.length) {
                todo.shift()(data);
            }
        }
    }


    function ifFunction(val, context, args) {
        return typeof val === 'function' ?
            val.apply(context, args)
            :
            val;
    }


    function CacheSettings(key, ttl) {
        if (!(this instanceof CacheSettings)) {
            return new CacheSettings(key, ttl);
        }
        this.key = key;
        this.ttl = ttl;
    }
})();
