(function($){

  var methods = {};

  methods.init = function(binding) {
    this.find('[data-content]').each(function() {
      var e = $(this);
      var instruction = e.data('content');
      var scope = methods.scope(e, binding);
      e.text(methods.resolve(instruction, scope));
    });
    this.find('[data-attr]').each(function() {
      var e = $(this);
      var parts = e.data('attr').split('=');
      var scope = methods.scope(e, binding);
      e.attr(parts[0], methods.resolve(parts[1], scope));
    });
    this.find('[data-val]').each(function() {
      var e = $(this);
      var instruction = e.data('val');
      var scope = methods.scope(e, binding);
      e.val(methods.resolve(instruction, scope));
    });
    return this;
  };

  // returns resolved value
  // if you pass modify_scope=true
  // this method modifies original scope also
  methods.resolve = function(instruction, scope, modify_scope) {
    if(!modify_scope) scope = scope.slice(0);
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
      methods.resolve($(this).data('scope'), scope, true);
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
