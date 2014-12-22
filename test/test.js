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

            var f2 = new Fetcha({uri: '/api/test3', method: 'POST'}, 'ololo');
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
                    }
                },
                function(xhr) { return (this instanceof Fetcha) + ' alala ' + xhr.method; }
            );
            storeResult(f2);

            waitInit();
        });

        wait();

        runs(function() {
            expect(oks).toEqual([
                'true alala /api/test4 false',
                'true alala /api/test4 true',
                'parse: {"url":"/api/test4","method":"POST","body":"true alala POST"} POST',
                'transform: {"url":"/api/test4","method":"POST","body":"true alala POST"} POST',
                {url: '/api/test4', method: 'POST', body: 'true alala POST', ololo: 'ululu'}
            ]);
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
