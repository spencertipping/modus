// Modus core combinators | Spencer Tipping
// Licensed under the terms of the MIT source code license

// Introduction.
// Modus is a set of combinators that wrap jQuery objects and provides its own methods for type-specified DOM manipulation. It does this by letting you define method-sets that operate on given
// sets of elements; these are installed on modus wrappers. Modus wrappers are to jQuery as jQuery is to the DOM; they cross-cut jQuery's selector "hierarchy" and provide a more coherent and
// domain-specific set of functionality. Modus diverges from jQuery by specializing, rather than generalizing, the DOM.

//   Example: parsed e-mail input box.
//   Suppose you want to create a text box that accepts e-mail addresses and maps those addresses into their parsed username, domain name, and TLD. In regular jQuery with Caterwaul you might
//   write this:

//   | email_box(x) = jquery [input.email /instavalidate(/\w+@\w+\.\w+/) /val(x || '')]
//                    -effect [it.data('parsed', given.nothing in parse_email(it.val()))];

//   Then the usage works this way:

//   | var parsed = something.find('.email').data('parsed')();

//   The 'data' invocation is required to bind the function to the actual <input> node rather than to the jQuery selector that contains it (which is highly transient due to jQuery's design).
//   Modus lets you write this instead:

//   | email_box_behavior = modus().method('parsed', given.nothing in parse_email(this.jquery.val()));
//     email_box(x) = email_box_behavior(jquery in input.email /instavalidate(/\w+@\w+\.\w+/) /val(x || ''));

//   Modus provides a much more straightforward usage pattern:

//   | var parsed = something.find(email_box_behavior).parsed();
//     var parsed = something.find('.email').parsed();             // Equivalent, depending on component layout

//   Example: composite component.
//   This is the real case where jQuery isn't sufficient. Suppose you've got a heterogeneous composition of components and want to automatically propagate state both downwards and upwards. This
//   requires some kind of abstraction, and modus gives you a way to express that:

//   | person_behavior = modus().selector({name: 'td.name input', email: 'td.email input'}).
//                               attr('val', given.nothing in {name: this.name().val(), email: this.email().val()},
//                                           given.x       in this -effect- it.name().val(x.name)
//                                                                 -effect- it.email().val(x.email));
//     person(p) = person_behavior(jquery in table.person(tr(td.name(input /val(p.name)), td.email[email_box(p.email)])));

//   Widget combination is a really common thing to want to do, so modus provides higher-order behaviors to help. These higher-order behaviors build up the val() function and selectors for you so
//   that you don't have to:

//   | person_behavior = modus.composite({name: 'td.name input', email: 'td.email input'});
//     person(p)       = person_behavior(jquery in table.person(tr(td.name(input), td.email[email_box()]))).val(p);

//   Here's what usage looks like:

//   | my_person = person({name: 'bob', email: 'woot@woot.com'});
//     my_person.val().name        // -> 'bob'
//     my_person.val().email       // -> 'woot@woot.com'

//   Example: a wrapper for something.
//   Let's say we want a component that takes some other component but adds a delete link to it. You can do this by constructing a wrapper behavior. Here's how that looks:

//   | delete_link_wrapper   = modus.wrapper('.item');     // Forwards .val() calls to the .item descendant
//     delete_link_around(x) = delete_link_wrapper(jquery in div.deletable(a.remove('[nuke this thing]') /click(given.nothing in $(this).parent().remove()), div.item[x]));

//   Now you can use this wrapper transparently with other components:

//   | wrapped_person = delete_link_around(my_person);
//     wrapped_person.val()        // -> my_person.val()
//     wrapped_person.val(x)       // -> my_person.val(x)

//   Example: a list of stuff.
//   It's very common to want to display a list of things to the user. Modus makes this simple by giving you a list constructor that provides an array functor over the .val() function. All it
//   needs is a constructor function for each element:

//   | list_of_people_behavior = modus.list(person);
//     list_of_people(ps)      = list_of_people_behavior(jquery in div).val(ps);

//   At this point you can query the .val() method of a list of people and it will transparently map that into an array:

//   | my_list = list_of_people([{name: 'foo', email: 'bar@bif.com'}, ...]);
//     my_list.val()               // -> [{name: 'foo', email: 'bar@bif.com'}, ...]

// Internal design concerns.
// This section is mainly to help me iron out how modus interfaces with the world.

//   Linkages.
//   Modus objects refer to the jQuery objects they wrap, and the jQuery objects refer back to the modus objects. Modus objects also act as proxies for jQuery collections. For example:

//   | var m = list_of_people([...]);
//     m[0]                        // -> <table> DOM element (not jQuery-wrapped)
//     m.length                    // -> 1
//     m.jquery                    // -> jQuery containing a <table> element
//     m.jquery.data('modus')      // -> something equivalent to m
//     m.each(...)                 // equivalent to m.jquery.each(...) to make proxying work

//   It's for this reason that you can use arbitrary jQuery selectors without modus having a hard reference ahead of time.

//   Synchronization.
//   A big aspect of modus is being able to synchronize a widget on-screen with server-side data. This can be done in one of two ways. If the component is self-contained and a diff-ish algorithm
//   can determine what has changed, then we can update single components using some kind of replacement. (This assumes that the component's logical representation captures everything about its
//   state.) Otherwise we can show the user any changes made on the server without trying to merge them. This has the advantage that the user won't have to worry about the merge.

// Implementation.
// Modus is implemented using caterwaul and assumes that the jQuery reference is available.

  caterwaul.js_all()(function (original_modus, $) {

//   Global instance.
//   This is a function that returns functions that create .data() references to themselves. The modus() function represents a generator for behaviors, and each behavior, when applied to a jQuery
//   object, will set that object's .data('modus') to refer to itself. This allows later modus objects to refer to whatever behavior you've established for the element.

//   If you invoke the modus() global on a jQuery object, that jQuery object's modus wrapper will be returned. If this doesn't exist, then the jQuery object will be returned instead.

    modus(x) = x && x instanceof jQuery ? x.data('modus') || x : calls_its_init_method() -se- add_initial_methods_to(it) -se- make_a_subclass_of_jquery(it),

      where [calls_its_init_method()      = bind [result = given.nothing in result.init.apply(result, arguments)] in result,
             make_a_subclass_of_jquery(f) = f -se [it.prototype = $(null), it.prototype.constructor = it],
             add_initial_methods_to(f)    = caterwaul.merge(f, modus.prototype)],

    modus.deglobalize() = modus -se [modus = original_modus],

    modus.prototype = {} -se [it.constructor     = modus,

                              it.init(jquery)    = jquery.data('modus', this) *![this[xi] = x] /seq
                                                   -then [this.length = jquery.length, this.jquery = jquery, caterwaul.merge(this, this.prototype)],

                              it.method(name, f) = this -se [this.prototype[name] = f],
                              it.each(f)         = this *![f.call(x, xi)] /seq],

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
                              -where [selector_method_for(selector)() = modus(this.jquery.filter(selector).add(this.jquery.find(selector)).eq(0))]],

//   Component combinators.
//   These combine components somehow. The simplest is 'composite', which just generates a val() function that knows how to destructure single-layer hashes and convert .val() calls accordingly.
//   It also gives you selector-accessors for the mappings.

    modus.composite(mappings) = modus().selector(mappings).attr('val', given.nothing [mappings /keys *[[x, this[x]().val()]]        |object |seq],
                                                                       given.hash    [hash     /keys *[[x, this[x]().val(hash[x])]] |object |seq -re- this]),

//   The other combinator you get is 'list', which does exactly what you'd expect. Its parameter is a constructor function for each item; this will be called when you set the value of the list
//   and should probably be called if you manually add elements. Note that the value constructor should return a modus object unless the logical value of each child is sufficiently described by
//   jQuery's built-in val() function.

    modus.list(create_item) = modus().attr('val', given.nothing in this.children() *[modus($(x)).val()] /seq,
                                                  given.xs      in this.empty() -effect- xs *![it.append(create_item(x))] /seq -re- this);

    return modus})(typeof modus === 'undefined' ? undefined : modus, jQuery);
// Generated by SDoc 
