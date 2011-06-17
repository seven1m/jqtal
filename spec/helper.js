function tmpl(html) {
  $('#main').html(html);
}

beforeEach(function() {
  this.addMatchers({
    toHaveClass: function(className) {
      var element = this.actual;
      return element.hasClass(className);
    }
  });
});
