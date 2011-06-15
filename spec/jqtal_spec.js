describe("jqTAL", function() {

  describe("tal()", function() {
    it("is a function", function() {
      expect(typeof $().tal).toEqual("function");
    });

    it("returns this", function() {
      var elm = $('#main');
      expect(elm.tal()).toEqual(elm);
    });
  });

  describe("data-scope", function() {
    
  });

  describe("data-content", function() {
    beforeEach(function() {
      tmpl("<span data-content='foo'/>");
    });

    it("sets the content of the element", function() {
      $('#main').tal({foo: 'bar'});
      expect($('#main span').html()).toEqual('bar');
    });
  });

  describe("resolve method", function() {
    it("returns the value of a property", function() {
      var value = $().tal('resolve', 'bar', [{bar: 'baz'}, {foo: {bar: 'baz'}}]);
      expect(value).toEqual('baz');
    });

    it("returns the value of a nested property", function() {
      var value = $().tal('resolve', 'foo/bar', [{foo: {bar: 'baz'}}]);
      expect(value).toEqual('baz');
    });

    it("translates .", function() {
      var value = $().tal('resolve', '.', ['bar', {foo: 'bar'}]);
      expect(value).toEqual('bar');
    });

    it("translates ..", function() {
      var value = $().tal('resolve', '../bar', ['1', {foo: '1', bar: '2'}]);
      expect(value).toEqual('2');
    });

    it("translates /", function() {
      var value = $().tal('resolve', '/bar', ['1', {foo: '1', bar: '2'}]);
      expect(value).toEqual('2');
    });
  });

  describe("scope method", function() {
    describe("given an element with no parent scope instructions", function() {
      var binding;

      beforeEach(function() {
        $('#main').html('<span/>');
        binding = {foo: 'bar'};
      });

      it("returns a scope with a single object", function() {
        var scope = $().tal('scope', $('#main span'), binding);
        expect(scope).toEqual([binding]);
      });
    });

    describe("given an element with a single parent scope instruction", function() {
      var binding;

      beforeEach(function() {
        $('#main').html('<div data-scope="foo"><span/></div>');
        binding = {foo: {bar: 'baz'}};
      });

      it("returns a scope with the original binding and the object specified by the scope instruction", function() {
        var scope = $().tal('scope', $('#main span'), binding);
        expect(scope).toEqual([binding.foo, binding]);
      });
    });

    describe("given an element with multiple parent scope instructions", function() {
      var binding;

      beforeEach(function() {
        $('#main').html('<div data-scope="foo"><div data-scope="bar"><span/></div></div>');
        binding = {foo: {bar: 'baz'}};
      });

      it("returns a scope with an object for every instruction, plus the original binding", function() {
        var scope = $().tal('scope', $('#main span'), binding);
        expect(scope).toEqual([binding.foo.bar, binding.foo, binding]);
      });
    });

    describe("given an element with parent scope instructions including a ..", function() {
      var binding;

      beforeEach(function() {
        $('#main').html('<div data-scope="foo">' +
                        '  <div data-scope="bar">' +
                        '    <div data-scope="..">' +
                        '      <div data-scope="baz">' +
                        '        <span/>' +
                        '      </div>' +
                        '    </div>' +
                        '  </div>' +
                        '</div>'
                       );
        binding = {
          foo: {
            bar: {
              far: '1'
            },
            baz: '2'
          }
        };
      });

      it("returns a scope with all objects except levels where we traversed back up", function() {
        var scope = $().tal('scope', $('#main span'), binding);
        expect(scope).toEqual([binding.foo.baz, binding.foo, binding]);
      });
    });

    describe("given an element with parent scope instructions including a /", function() {
      var binding;

      beforeEach(function() {
        $('#main').html('<div data-scope="foo">' +
                        '  <div data-scope="bar">' +
                        '    <div data-scope="/baz">' +
                        '      <span/>' +
                        '    </div>' +
                        '  </div>' +
                        '</div>'
                       );
        binding = {
          foo: {
            bar: '1'
          },
          baz: {
            far: '2'
          }
        };
      });

      it("returns a scope with only objects following the root instruction", function() {
        var scope = $().tal('scope', $('#main span'), binding);
        expect(scope).toEqual([binding.baz, binding]);
      });
    });
  });

});
