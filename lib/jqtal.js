(function($){

  var methods = {};

  methods.init = function(binding) {

    var repeats = [];
    $(this).find('[data-repeat]').each(function() {
      var e = $(this);
      var instruction = e.data('repeat');
      var scope = methods.scope(e, binding, false);
      var items = methods.resolve(instruction, scope);
      var exists = false;
      var p = e.parent()[0];
      for(var i=0; i<repeats.length; i++) {
        if(repeats[i][0] == p && repeats[i][1] == instruction) {
          exists = true
          break;
        }
      }
      if(!exists) repeats.push([e.parent(), instruction, items]);
    });
    for(var i=0; i<repeats.length; i++) {
      var p = repeats[i][0];
      var instruction = repeats[i][1];
      var items = repeats[i][2];
      var elms;
      while((elms = $(p).find('[data-repeat=' + instruction + ']')).length < items.length) {
        elms.eq(0).clone().insertAfter(elms.eq(elms.length-1));
      }
      while((elms = $(p).find('[data-repeat=' + instruction + ']')).length > items.length) {
        elms.eq(elms.length-1).remove();
      }
    }

    var process = function(elm, name, processor) {
      $(elm).find('[data-' + name + ']').each(function() {
        var e = $(this);
        var instruction = e.data(name);
        var scope = methods.scope(e, binding);
        processor(e, instruction, scope);
      });
    };

    process(this, 'content', function(elm, instruction, scope) {
      elm.text(methods.resolve(instruction, scope));
    });

    process(this, 'attr', function(elm, instruction, scope) {
      var parts = instruction.split('=');
      elm.attr(parts[0], methods.resolve(parts[1], scope));
    });

    process(this, 'val', function(elm, instruction, scope) {
      var value = methods.resolve(instruction, scope);
      if(new String(elm.attr('type')).match(/checkbox|radio/i)) {
        elm.attr('checked', elm.val() == value);
      } else {
        elm.val(value);
      }
    });

    return this;
  };

  // returns resolved value
  // if you pass modify_scope=true
  // this method modifies original scope also
  methods.resolve = function(instruction, scope, modify_scope) {
    if(!modify_scope) scope = scope.slice(0);
    if(instruction.match(/^js:/)) {
      var prop = function(name) { return methods.resolve(name, scope) }
      var js = instruction.replace(/^js:/, '');
      value = eval("(function(prop) { " + js + " })(prop)");
      scope.unshift(value);
    } else {
      var parts = instruction.replace(/\([^\)]*\)/, '').split('/');
      var value;
      for(var i=0; i<parts.length; i++) {
        if(parts[i] == '.') continue;
        if(parts[i] == '..') {
          scope.splice(0, 1);
        } else if(parts[i] == '') { // a slash /
          scope.splice(0, scope.length-1);
        } else {
          value = scope[0][parts[i]];
          if(typeof value == 'function') {
            value = value();
          } else if(typeof scope[0].get == 'function') {
            value = scope[0].get(parts[i]);
          }
          scope.unshift(value);
        }
      }
    }
    return scope[0];
  };

  // builds new scope based on data-scope instructions
  methods.scope = function(elm, binding, scopeRepeat) {
    var scope = [binding];
    var build = function(i, e) {
      var e = $(e);
      var s, r;
      if(s = e.data('scope')) {
        methods.resolve(s, scope, true);
      }
      if(scopeRepeat !== false && (r = e.data('repeat'))) {
        var index = e.prevAll('[data-repeat=' + r + ']').length;
        methods.resolve(r + '/' + index, scope, true);
      }
    };
    $(elm.parents('[data-scope], [data-repeat]').get().reverse()).each(build);
    build(-1, elm);
    return scope;
  };

  $.fn.tal = function(method) {
    if(methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else {
      return methods.init.apply(this, arguments);
    }
  };


})(jQuery);
