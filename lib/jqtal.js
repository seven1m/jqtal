(function($){

  var methods = {};

  methods.init = function(binding) {
    this.find('[data-content]').each(function() {
      var e = $(this);
      var instruction = e.data('content');
      var value = binding[instruction];
      e.text(value);
    });
    return this;
  };

  // warning: side-effects
  // modifies original scope AND returns resolved value
  methods.resolve = function(instruction, scope) {
    var parts = instruction.split('/');
    var value;
    for(var i=0; i<parts.length; i++) {
      if(parts[i] == '.') continue;
      if(parts[i] == '..') {
        scope.splice(0, 1);
      } else if(parts[i] == '') { // a slash /
        scope.splice(0, scope.length-1);
      } else {
        value = scope[0][parts[i]];
        scope.unshift(value);
      }
    }
    return scope[0];
  };

  // builds new scope based on data-scope instructions
  methods.scope = function(elm, binding) {
    var scope = [binding];
    $(elm.parents('[data-scope]').get().reverse()).each(function() {
      methods.resolve($(this).data('scope'), scope);
    });
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
