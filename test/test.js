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
        });
    });


    function storeResult(f) {
        f.then(
            function(data) { oks.push(data); },
            function(data) { errors.push(data); }
        )
    }
});
