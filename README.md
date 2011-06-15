# jqTAL

JavaScript Template Attribute Language

Built specifically for Backbone.js and jQuery (but should also be useful sans Backbone).

Inspired by Zope TAL [link](link).


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

* jqTAL uses HTML5 `data-` prefixed custom attributes instead of custom syntax.
* Template `data-` attributes are *not* removed from the rendered HTML.
* The same DOM elements and template language can be reused over and over again without re-rendering the HTML.
* *No* JavaScript eval within the template itself.


## Syntax

### Scopes

Everything in jqTAL must be interpreted in the context of an active "scope". In all cases, the current scope will be a JavaScript object of some sort.

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

...in this example, jqTAL looks for `parentObject['childObject']`.

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

With multiple references to a similarly named attribute on objects in various scopes (current, parent, grandparent, etc.), templates can get hard to read. So, jqTAL has a way to annotate instructions for clarity; the above can be rewritten as:

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


## Usage

Include the script:

    <script src="lib/jqtal.js"></script>

To "render" a template, call the `tal()` function on a jQuery object, passing in the bindings, e.g.:

    $(selector).tal(bindings);

Example:

    var foo = {bar: 'baz'};
    $('body').tal(foo);

In this example, everything within the `<body>` element is considered part of the jqTAL template.

Any object you pass to `tal()` is made available to the template. It's also common to wrap several objects in a single parent object, e.g. `{foo: foo, bar: bar}`.


## Re-Rendering

jqTAL is especially useful for updating the same template repeatedly, without recreating all the DOM elements each time. Here are some things to note:

### data-repeat

Loops are a bit tricky. Here is the logic jqTAL follows when rendering a `data-repeat` block:

WRITE ME


## FAQs

**How do I replace or omit a tag in the output?**

You can't, unfortunately. Because jqTAL doesn't really "output" HTML -- it more-so "decorates" it -- there are no TAL instructions that might cause an instruction to disappear from the DOM, which would cause subsequent updates to fail.

