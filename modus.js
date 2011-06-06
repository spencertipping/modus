// Modus core combinators | Spencer Tipping
// Licensed under the terms of the MIT source code license

// Introduction.
// Modus is a set of combinators that wrap jQuery objects and provides its own methods for type-specified DOM manipulation. It does this by letting you define method-sets that operate on given
// sets of elements; these are installed on modus wrappers. Modus wrappers are to jQuery as jQuery is to the DOM; they cross-cut jQuery's selector "hierarchy" and provide a more coherent and
// domain-specific set of functionality. Modus diverges from jQuery by specializing, rather than generalizing, the DOM.

// Implementation.
// Modus is implemented using caterwaul and assumes that the jQuery reference is available.

  caterwaul.js_all()(function (original_modus, $) {

//   Global instance.
//   This is a function that returns functions that create .data() references to themselves. The modus() function represents a generator for behaviors, and each behavior, when applied to a jQuery
//   object, will set that object's .data('modus') to refer to itself. This allows later modus objects to refer to whatever behavior you've established for the element.

//   If you invoke the modus() global on a jQuery object, that jQuery object's modus wrapper will be returned. If this doesn't exist, then the jQuery object will be returned instead.

    modus(x) = x && x instanceof jQuery ? x.data('modus') || x : calls_its_init_method() -se- add_initial_methods_to(it),
    where [calls_its_init_method()   = f -where [f() = this instanceof f ? undefined : f.init.apply(f, arguments)],
           add_initial_methods_to(f) = caterwaul.merge(f, modus.prototype)],

    modus.deglobalize() = modus -se [modus = original_modus],

//   The init() method on instances of the global modus object returns a modus object of that behavior. It in turn contains a reference to the jQuery object that contains the components it
//   represents. Not a lot happens when doing this. All we have to do is link the jQuery object to the new modus constructor and link the '$' property to the jQuery collection being wrapped.

//   Note that invoking a modus behavior on something doesn't return the modus wrapper! It just sets data on the jQuery collection. You use the modus() function on the jQuery collection to get
//   the modus wrapper for that element. You can pass a second parameter to the behavior to set the value inline. (This is often more convenient than trying to wedge a value-set call into a
//   constructor function.)

    modus.prototype = {} -se [it.constructor     = modus,
                              it.init(jquery, v) = new this() -then [it.$ = jquery.data('modus', it)] -then [it.val(v) -unless [v === undefined]] -returning- jquery,
                              it.method(name, f) = this -se [this.prototype[name] = f],
                              it.each(f)         = this.$.each(f)],

//   Metaprogramming methods.
//   These are methods on behaviors that let you add methods in a systematic way. You can add additional meta-methods by extending modus.prototype.

    modus.prototype -se [

//     Attr method.
//     This adds a getter/setter attribute in jQuery style. If you pass arguments to the function then it acts as a setter returning the receiver, and if you pass no arguments then it acts as a
//     retriever. For convenience these cases are pre-separated; you specify the getter and setter separately.

      it.attr(name, getter, setter) = this.method(name, given.x [arguments.length ? setter.apply(this, arguments) -re- this : getter.call(this)]),

//     Selector method.
//     This lets you create methods that dig through the DOM hierarchy to reference other modus nodes. You do this by specifying a hash that maps method names to selector strings. The object you
//     get back from one of these methods will be a modus wrapper around the jQuery selector that matched. Ambiguous selectors are reduced to the first matching element.

      it.selector(mappings) = mappings /pairs *![this.method(name, selector_method_for(selector)) -where [name = x[0], selector = x[1]]] /seq -re- this
                              -where [selector_method_for(selector)() = modus(this.$.filter(selector).add(this.$.find(selector)).eq(0))]],

//   Component combinators.
//   These combine components somehow. The simplest is 'composite', which just generates a val() function that knows how to destructure single-layer hashes and convert .val() calls accordingly.
//   It also gives you selector-accessors for the mappings.

    modus.composite(mappings) = modus().selector(mappings).attr('val', given.nothing [mappings /keys *[[x, this[x]().val()]]        |object |seq],
                                                                       given.hash    [hash     /keys *[[x, this[x]().val(hash[x])]] |object |seq, this]),

//   The other combinator you get is 'list', which does exactly what you'd expect. Its parameter is a constructor function for each item; this will be called when you set the value of the list
//   and should probably be called if you manually add elements. Note that the value constructor should return a modus object unless the logical value of each child is sufficiently described by
//   jQuery's built-in val() function.

    modus.list(create_item) = modus().attr('val', given.nothing in this.$.children() *[modus($(x)).val()] /seq,
                                                  given.xs      in this.$.empty() -effect- xs *![it.append(create_item(x))] /seq -re- this),

//   Finally, there's wrapping. This just forwards the .val() method to a child component.

    modus.wrapper(path) = modus().attr('val', given.nothing in modus(this.$.find(path)).val(),
                                              given.x       in modus(this.$.find(path)).val(x));

    return modus})(typeof modus === 'undefined' ? undefined : modus, jQuery);
// Generated by SDoc 
