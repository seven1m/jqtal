describe("jqtal", function() {

  describe("tal()", function() {
    it("is a function", function() {
      expect(typeof $().tal).toEqual("function");
    });

    it("returns this", function() {
      var elm = $('#main');
      expect(elm.tal()).toEqual(elm);
    });
  });

  describe("data-content", function() {
    describe("given a simple instruction", function() {
      beforeEach(function() {
        tmpl("<span data-content='foo'/>");
      });

      it("sets the content of the element", function() {
        $('#main').tal({foo: 'bar'});
        expect($('#main span').html()).toEqual('bar');
      });
    });

    describe("given a complex instruction", function() {
      beforeEach(function() {
        tmpl("<span data-content='foo/bar'/>");
      });

      it("sets the content of the element", function() {
        $('#main').tal({foo: {bar: 'baz'}});
        expect($('#main span').html()).toEqual('baz');
      });
    });
  });

  describe("data-attr", function() {
    beforeEach(function() {
      tmpl("<span data-attr='id=foo'/>");
    });

    it("sets the specified attribute of the element", function() {
      $('#main').tal({foo: 'bar'});
      expect($('#main span').attr('id')).toEqual('bar');
    });
  });

  describe("data-val", function() {
    describe("given an input field", function() {
      beforeEach(function() {
        tmpl("<input data-val='foo'/>");
      });

      it("sets the value attribute of the field", function() {
        $('#main').tal({foo: 'bar'});
        expect($('#main input').val()).toEqual('bar');
      });
    });

    describe("given a select field", function() {
      beforeEach(function() {
        tmpl("<select data-val='foo'><option></option><option value='baz'>baz</option><option value='bar'>bar</option></select>");
      });

      it("selects the appropriate option", function() {
        $('#main').tal({foo: 'bar'});
        expect($('#main select').val()).toEqual('bar');
      });
    });

    describe("given a textarea", function() {
      beforeEach(function() {
        tmpl("<textarea data-val='foo'></textarea>");
      });

      it("sets the value of the textarea", function() {
        $('#main').tal({foo: 'bar'});
        expect($('#main textarea').val()).toEqual('bar');
      });
    });

    describe("given a checkbox", function() {
      beforeEach(function() {
        tmpl("<input type='checkbox' value='bar' data-val='foo'/>");
      });

      it("checks the box if the value matches", function() {
        $('#main').tal({foo: 'bar'});
        expect($('#main input').attr('checked')).toBeTruthy();
        $('#main').tal({foo: 'baz'});
        expect($('#main input').attr('checked')).not.toBeTruthy();
      });
    });

    describe("given a radio button", function() {
      beforeEach(function() {
        tmpl("<input type='radio' name='foo' value='bar' data-val='foo'/>");
      });

      it("checks the box if the value matches", function() {
        $('#main').tal({foo: 'bar'});
        expect($('#main input').attr('checked')).toBeTruthy();
        $('#main').tal({foo: 'baz'});
        expect($('#main input').attr('checked')).not.toBeTruthy();
      });
    });
  });

  describe("data-repeat", function() {
    beforeEach(function() {
      tmpl("<div data-repeat='people' data-attr='class=.'><span data-content='.'/></div>");
    });

    describe("given a single item", function() {
      beforeEach(function() {
        $('#main').tal({people: ['Jean-Luc']});
      });

      it("leaves the single div", function() {
        expect($('#main div').length).toEqual(1);
      });

      it("scopes instructions on the element itself to the indexed item", function() {
        expect($('#main div')).toHaveClass('Jean-Luc');
      });

      it("scopes instructions on children of the element to the indexed item", function() {
        expect($('#main div span').html()).toEqual('Jean-Luc');
      });
    });

    describe("given two items", function() {
      beforeEach(function() {
        $('#main').tal({people: ['Jean-Luc', 'William']});
      });

      it("duplicates the div", function() {
        expect($('#main div').length).toEqual(2);
      });

      it("scopes instructions on both elements to the indexed item", function() {
        expect($('#main div').eq(0)).toHaveClass('Jean-Luc');
        expect($('#main div').eq(1)).toHaveClass('William');
      });

      it("scopes instructions on children of the elements to the indexed item", function() {
        expect($('#main div span').eq(0).html()).toEqual('Jean-Luc');
        expect($('#main div span').eq(1).html()).toEqual('William');
      });
    });

    describe("given three items", function() {
      beforeEach(function() {
        $('#main').tal({people: ['Jean-Luc', 'William', 'Deanna']});
      });

      it("duplicates the div twice", function() {
        expect($('#main div').length).toEqual(3);
      });

      it("scopes instructions on all elements to the indexed item", function() {
        expect($('#main div').eq(0)).toHaveClass('Jean-Luc');
        expect($('#main div').eq(1)).toHaveClass('William');
        expect($('#main div').eq(2)).toHaveClass('Deanna');
      });

      it("scopes instructions on children of the elements to the indexed item", function() {
        expect($('#main div span').eq(0).html()).toEqual('Jean-Luc');
        expect($('#main div span').eq(1).html()).toEqual('William');
        expect($('#main div span').eq(2).html()).toEqual('Deanna');
      });
    });

    describe("given a second pass with one less item", function() {
      beforeEach(function() {
        $('#main').tal({people: ['Jean-Luc', 'William', 'Deanna']});
        $('#main').tal({people: ['Jean-Luc', 'William']});
      });

      it("removes one of divs", function() {
        expect($('#main div').length).toEqual(2);
      });

      it("scopes instructions on both remaining elements to the indexed item", function() {
        expect($('#main div').eq(0)).toHaveClass('Jean-Luc');
        expect($('#main div').eq(1)).toHaveClass('William');
      });

      it("scopes instructions on children of the remaining elements to the indexed item", function() {
        expect($('#main div span').eq(0).html()).toEqual('Jean-Luc');
        expect($('#main div span').eq(1).html()).toEqual('William');
      });
    });

    describe("given a second pass with one more item", function() {
      beforeEach(function() {
        $('#main').tal({people: ['Jean-Luc', 'William']});
        $('#main').tal({people: ['Jean-Luc', 'William', 'Deanna']});
      });

      it("removes one of divs", function() {
        expect($('#main div').length).toEqual(3);
      });

      it("scopes instructions on all elements to the indexed item", function() {
        expect($('#main div').eq(0)).toHaveClass('Jean-Luc');
        expect($('#main div').eq(1)).toHaveClass('William');
        expect($('#main div').eq(2)).toHaveClass('Deanna');
      });

      it("scopes instructions on children of the elements to the indexed item", function() {
        expect($('#main div span').eq(0).html()).toEqual('Jean-Luc');
        expect($('#main div span').eq(1).html()).toEqual('William');
        expect($('#main div span').eq(2).html()).toEqual('Deanna');
      });
    });
  });

  describe("resolve method", function() {
    it("returns the value of calling a property that's a function", function() {
      var value = $().tal('resolve', 'foo', [{foo: function() { return 'bar' }}]);
      expect(value).toEqual('bar');
    });

    it("returns the value of calling get() on the scoped object", function() {
      var scopeObj = {get: jasmine.createSpy('get').andReturn('bar')};
      var value = $().tal('resolve', 'foo', [scopeObj]);
      expect(value).toEqual('bar');
      expect(scopeObj.get).toHaveBeenCalledWith('foo');
    });

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

    it("translates array indexes", function() {
      var value = $().tal('resolve', 'foo/1', [{foo: ['0', '1']}]);
      expect(value).toEqual('1');
    });

    it("does not modify the passed scope by default", function() {
      var scope = [{foo: '1'}];
      var value = $().tal('resolve', 'foo', scope);
      expect(scope).toEqual([{foo: '1'}]);
    });

  });

  describe("scope method", function() {
    describe("given an element with no parent scope instructions", function() {
      var binding;

      beforeEach(function() {
        tmpl('<span/>');
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
        tmpl('<div data-scope="foo"><span/></div>');
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
        tmpl('<div data-scope="foo"><div data-scope="bar"><span/></div></div>');
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
        tmpl('<div data-scope="foo">' +
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
        tmpl('<div data-scope="foo">' +
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

    describe("given an element with a single parent repeat instruction", function() {
      var binding;

      beforeEach(function() {
        tmpl('<div data-repeat="foos"><span/></div>');
        binding = {foos: [{bar: 'baz'}]};
      });

      it("returns a scope with the original binding and the object specified by the iteration of the repeat instruction", function() {
        var scope = $().tal('scope', $('#main span'), binding);
        expect(scope).toEqual([binding.foos[0], binding.foos, binding]);
      });
    });
  });

});
