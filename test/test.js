describe('Simple test', function() {
    var oks = [];
    var errors = [];


    it('runs simple test', function() {
        var flag;
        var waitInit = function() {
            flag = false;
            setTimeout(function() { flag = true; }, 500);
        };
        var wait = function() {
            waitsFor(function() { return flag; });
        };

        var f1 = Fetcha({uri: '/api/test'});

        expect(f1 instanceof Fetcha).toBeTruthy();

        storeResult(f1);

        expect(oks).toEqual([]);
        expect(errors).toEqual([]);

        waitInit();
        wait();

        runs(function() {
            expect(oks).toEqual([{url: '/api/test', method: 'GET'}]);
            expect(errors).toEqual([]);

            oks = [];

            var f2 = new Fetcha({uri: '/api/test2'});
            expect(f2 instanceof Fetcha).toBeTruthy();
            storeResult(f2);

            waitInit();
        });

        wait();

        runs(function() {
            expect(oks).toEqual([{url: '/api/test2', method: 'GET'}]);
            expect(errors).toEqual([]);

            oks = [];

            var f2 = new Fetcha({uri: '/api/test3', method: 'POST', body: 'ololo'});
            storeResult(f2);

            waitInit();
        });

        wait();

        runs(function() {
            expect(oks).toEqual([{url: '/api/test3', method: 'POST', body: 'ololo'}]);
            expect(errors).toEqual([]);

            oks = [];

            var f2 = new Fetcha(
                {
                    uri: '/api/test4',
                    method: 'POST',
                    body: function(overrideCallbackPayload, uri, method) { return (this instanceof Fetcha) + ' alala ' + uri + ' eee ' + method + ' uuu ' + JSON.stringify(overrideCallbackPayload); },
                    parse: function(response, xhr) {
                        oks.push('parse: ' + response + ' ' + xhr.method);
                        return JSON.parse(response);
                    },
                    transform: function(response, xhr) {
                        oks.push('transform: ' + JSON.stringify(response) + ' ' + xhr.method);
                        response.ololo = 'ululu';
                        return response;
                    },
                    callback: function(xhr, completed) {
                        oks.push((this instanceof Fetcha) + ' alala ' + xhr.uri + ' ' + completed);
                    },
                    override: function(overrideCallbackPayload, uri, method, body) {
                        oks.push(
                            (this instanceof Fetcha) + '|' +
                            uri + '|' +
                            method + '|' +
                            JSON.stringify(overrideCallbackPayload) + '|' +
                            body
                        );
                    }
                },
                {a: 1, b: 2}
            );
            storeResult(f2);

            waitInit();
        });

        wait();

        runs(function() {
            expect(oks).toEqual([
                'true|/api/test4|POST|{"a":1,"b":2}|true alala /api/test4 eee POST uuu {"a":1,"b":2}',
                'true alala /api/test4 false',
                'true alala /api/test4 true',
                'parse: {"url":"/api/test4","method":"POST","body":"true alala /api/test4 eee POST uuu {\\"a\\":1,\\"b\\":2}"} POST',
                'transform: {"url":"/api/test4","method":"POST","body":"true alala /api/test4 eee POST uuu {\\"a\\":1,\\"b\\":2}"} POST',
                {url: '/api/test4', method: 'POST', body: 'true alala /api/test4 eee POST uuu {"a":1,"b":2}', ololo: 'ululu'}
            ]);
            expect(errors).toEqual([]);
            oks = [];

            var f2 = new Fetcha({
                uri: '/api/test5',
                cache: Fetcha.cache(undefined, 700),
                transform: function(d) { d.rnd = Math.random(); return d; }
            });
            storeResult(f2);
            f2 = new Fetcha({
                uri: '/api/test5',
                cache: Fetcha.cache(undefined, 700),
                transform: function(d) { d.rnd = Math.random(); return d; }
            });
            storeResult(f2);

            waitInit();
        });

        wait();

        var cached;

        runs(function() {
            cached = oks[0];
            expect(oks).toEqual([cached, cached]);
            expect(errors).toEqual([]);
            oks = [];

            var f2 = new Fetcha({
                uri: '/api/test5',
                cache: Fetcha.cache(undefined, 700),
                transform: function(d) { d.rnd = Math.random(); return d; }
            });
            storeResult(f2);

            waitInit();
        });

        wait();

        runs(function() {
            expect(oks).toEqual([cached]);
            expect(errors).toEqual([]);
            oks = [];

            var f2 = new Fetcha({
                uri: '/api/test5',
                cache: Fetcha.cache(undefined, 700),
                transform: function(d) { d.rnd = Math.random(); return d; }
            });
            storeResult(f2);

            waitInit();
        });

        wait();

        runs(function() {
            var data = oks[0] || {};
            expect(data.rnd).not.toEqual(cached.rnd);
            delete data.rnd;
            delete cached.rnd;
            expect(data).toEqual(cached);
            expect(errors).toEqual([]);
            oks = [];

            waitInit();
        });

        wait();

        runs(function() {
            var f2 = Fetcha({
                uri: '/api/test6',
                body: 'hehe',
                override: function(overrideCallbackPayload, uri, method, body) {
                    return {
                        payload: overrideCallbackPayload,
                        uri: uri,
                        method: method,
                        body: body
                    };
                }
            }, {yaya: 'haha'});
            storeResult(f2);

            waitInit();
        });

        wait();

        runs(function() {
            expect(oks).toEqual([{
                payload: {yaya: 'haha'},
                uri: '/api/test6',
                method: 'GET',
                body: 'hehe'
            }]);
            expect(errors).toEqual([]);
        });
    });


    function storeResult(f) {
        f.then(
            function(data) { oks.push(data); },
            function(data) { errors.push(data); }
        )
    }
});
