/*!
 * conkitty-route v0.0.0, https://github.com/hoho/fetcha
 * (c) 2014 Marat Abdullin, MIT license
 */

window.Fetcha = (function(undefined) {
    'use strict';

    function Fetcha(settings, body) {
        // self.ok — Success callbacks.
        // self.err — Error callbacks.
        // self.d — Done.
        // self.e — Error.
        // self.r = XMLHTTRequest.
        // self.j = Parsed response JSON.

        var self = this,
            uri = settings.uri,
            method = settings.method || 'GET',
            parse = settings.parse || function(response) { if (this.status !== 204) { return JSON.parse(response); } },
            transform = settings.transform,
            override = settings.override,
            emitEvent = settings.callback,
            req,
            response;

        if (!(self instanceof Fetcha)) {
            return new Fetcha(settings, body);
        }

        self.ok = [];
        self.err = [];

        if (((self.j = override && override.call(self))) === undefined) {
            self.r = req = new XMLHttpRequest();

            req.open(
                (req.method = method.toUpperCase()),
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

            if (body) {
                body = body(req);
            }

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
})();
