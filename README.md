# jqtal

jQuery Template Attribute Language

Built specifically to complement Backbone.js (but should also be useful sans Backbone).


## Example Usage

    <form data-scope="person">
      <input name="first_name" data-val="first_name"/>
      <input name="last_name" data-val="last_name"/>
      <div class="address" data-repeat="addresses">
        <select name="description" data-val="description">
          <option value="home">home</option>
          <option value="work">work</option>
        </select>
        <input name="line1" data-val="line1"/>
        <input name="line2" data-val="line2"/>
        <input name="city"  data-val="city" />
        <input name="state" data-val="state"/>
        <input name="zip"   data-val="zip"  />
      </div>
    </form>


## Goals

* jqtal uses HTML5 `data-` prefixed custom attributes instead of custom syntax.
* Template `data-` attributes are *not* removed from the rendered HTML.
* The same DOM elements and template instructions are reused for each call to `tal()` without re-rendering all the HTML.


## Usage

Include the script:

    <script src="lib/jqtal.js"></script>

To "render" a template, call the `tal()` function on a jQuery object, passing in the bindings, e.g.:

    $(selector).tal(bindings);

Example:

    var foo = {bar: 'baz'};
    $('body').tal(foo);

In this example, everything within the `<body>` element is considered part of the jqtal template.

Any object you pass to `tal()` is made available to the template. It's also common to wrap several objects in a single parent object, e.g. `{foo: foo, bar: bar}`.


## Syntax

### Instructions

"Instructions" are what you put inside the `data-` attributes that tell jqtal what to do. In most cases, you'll use a single identifier, such as `first_name` -- this will cause the "first\_name" property of an object to be used as the value for whatever you wish to do. For example:

    <div data-content="first_name"/>

...will insert the "first\_name" property of whatever object is in "scope" (read about scopes below) as the text content of the `div` tag.

Further, you can use slash notation to grab an property within a property, like so:

    <div data-content="birthday/getFullYear"/>

jqtal is smart enough to know that "birthday" is an object itself, and that `getFullYear` is actually a function, which should be called.

If you absolutely must, you can even execute JavaScript as an instruction:

    <div data-content="js: var d = prop('birthday');
                           return (d instanceof Date) ? format_date(d) : 'unknown';"/>

(The `return` is necessary since the JavaScript gets wrapped in a function.)


### Scopes

Everything in jqtal must be interpreted in the context of an active "scope". In all cases, the current scope will be a JavaScript object of some sort.

One way to set the scope is to use the `data-scope` attribute:

    <div data-scope="foo">
      ...
    </div>

Any TAL attributes on the enclosing element (`div`) or on child elements will be evaluated in the context of the specified object (`foo`).

You may nest scopes, but be aware the child scope will itself be evaluated in the context of the enclosing scope:

    <div data-scope="parentObject">
      <div data-scope="childObject">
        ...
      </div>
    </div>

...in this example, jqtal looks for `parentObject['childObject']`.

If instead you need to reference a parent or top-level object, you may use `../` or `/` respectively. For example:

    <div data-scope="object1">
      <div data-scope="/object2">
        ...
      </div>
    </div>

`../` and `/` works like you'd expect path manipulation to work on a POSIX compatible file system:

    .         # the current scoped object
    foo       # foo object/attribute at the current scope
    ./foo     # same
    ../foo    # parent scope
    ../../foo # grandparent scope

Other TAL attributes may also affect the current scope, e.g. `data-repeat` (explained later).

### Content

**Replace** the content (if any) of the tag, but leave the tag itself.

    <div data-content="bar"/>

"bar" specifies an attribute of the object specified by the enclosing scope. The word "attribute" is sort of a loose term in this case, as the following steps are taken in order to get the value of the "attribute":

* *Is `bar` a function on the scope object?* If so, execute `object.bar()` and use the return value.
* *Does the scoped object have a `get()` method?* If so, call `object.get('bar')` and use the return value.
* *Otherwise*, just use the value of `object['bar']`.

### Tag Attribute

To set an HTML attribute, use `data-attr`:

    <div data-attr="id=baz"/>

The TAL syntax for this instruction is the format `{html attribute}={object attribute}` -- all this attribute talk can be confusing!

### Field Value

To set a field value, use `data-val`:

    <input name="foo" data-val="bar"/>

This works on `select` fields and `textareas` as well, since it uses jQuery's `val()` method.

It even works on check boxes and radio buttons -- If the value matches the value specified on the field, then `checked` is set to true.

### Repeating Things

    <div data-repeat="things">
      ...
    </div>

This instruction duplicates the `div` for every item in the array `things`. Additionally, the current scope for each `div` is set to the `thing` it represents:

    <div data-repeat="people">
      <h1 data-content="name"/>
      ...
    </div>

Each reference to `name` is scoped to the current person in the repeat scope.

If you need to reference something in the parent scope, use `../` or `/` as described in the **Scopes** section above. For example, given the following object:

    country = {
      name: 'USA',
      states: [
        { name: 'Alabama', cities: ['Montgomery', 'Birmingham'] },
        { name: 'Alaska',  cities: ['Juneau',     'Anchorage' ] },
      ]
    }

...and the following template:

    <div data-scope="country">
      <div data-repeat="states">
        <div data-repeat="cities">
          <p>
            <span data-content="."/>,         <!-- city string -->
            <span data-content="../name"/>    <!-- state name -->
            <span data-content="../../name"/> <!-- country name -->
          </p>
        </div>
      </div>
    </div>

Some explanation is probably necessary:

* `.` represents the current scoped object. In this case, it's just a string, so we need to insert the object itself.
* `../name` grabs the "name" attribute of the parent scope (the state).
* `../../name` grabs the "name" attribute of the grandparent scope (the country).

With multiple references to a similarly named attribute on objects in various scopes (current, parent, grandparent, etc.), templates can get hard to read. So, jqtal has a way to annotate instructions for clarity; the above can be rewritten as:

    <div data-scope="country">
      <div data-repeat="states">
        <div data-repeat="cities">
          <p>
            <span data-content=".(city)"/>,
            <span data-content="../(state)name"/>
            <span data-content="../../(country)name"/>
          </p>
        </div>
      </div>
    </div>

Anything in parenthesis (including the parenthesis themselves) are removed from the instruction before evaluation, so the annotations are only there for helping humans.


## FAQs

**How do I replace or omit a tag in the output?**

You can't. Because jqtal doesn't really "output" HTML -- it more-so "decorates" it -- there are no TAL instructions that might cause an instruction to disappear from the DOM, which would cause subsequent updates to fail.


## Credits

jqtal was inspired by Zope's [TAL](http://wiki.zope.org/ZPT/TAL), one of the few good things to come out of Zope.


## Copyright & Disclaimer

Copyright (C) 2011 by Tim Morgan and TJRM, Inc.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
