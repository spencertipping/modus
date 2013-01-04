Modus UI combinators | Spencer Tipping
Licensed under the terms of the MIT source code license

    caterwaul.module('modus', 'js_all', function ($) {

      $ = jQuery;

# Introduction

Modus gives you combinators for the jQuery val() function. It does this by overloading jQuery's implementation of val() in certain cases. You specify how this is overloaded by configuring an
object using the modus() method. For example, here's how to create an <input> box whose val() method returns a boolean depending on whether the user entered 'yes' or 'no':

    yes_no_box() = jquery [input /modus(parse_yes_or_no)]
                   -where [parse_yes_or_no(e) = e.modus('val') === 'yes'];

If we also wanted a setter for val(), we could implement that too. Here's how to implement a setter that sets the text to 'yes' or 'no' from a boolean:

    jquery [input /modus(parse_yes_or_no, set_yes_or_no)]
    -where [set_yes_or_no(b)   = this.modus('val', b ? 'yes' : 'no'),
            parse_yes_or_no(x) = ...];

This is a terminal combinator, since presumably we're working directly with the val() function implemented on <input> elements. (This is why we had to indirect the val() calls.) The picture
gets more interesting with nonterminals.

      var original_jquery_val = $.fn.val;

      $.fn.val(args = arguments) = this.data('modus') -re [it ? args.length ? it.setter.apply(this, args) : it.getter.call(this) : original_jquery_val.apply(this, args)],

      $.fn.modus(getter, setter) = getter.constructor === String ? use_named_combinator(this, arguments) : this.data('modus', {getter: getter, setter: setter}),
      where [use_named_combinator(receiver, args) = $.modus[args[0]].apply(receiver, Array.prototype.slice.call(args, 1))],

# Nonterminal combinators

Modus provides combinators to handle the most common cases of component nesting.

      $.modus = capture [
        util = {},

## Original value access

Terminal combinators need this to avoid causing an infinite loop.

      val() = original_jquery_val.apply(this, arguments),

## Delegate combinator

This lets you build a proxy component that has no component associated with it. This works because modus uses duck typing for the jQuery components below; all we need to do is implement a
fake first() method to return 'this'.

      delegate(getter, setter) = capture [first() = this,
                                          val()   = arguments.length ? setter.apply(this, arguments) -then- this :
                                                                       getter.apply(this, arguments)],

## List combinator

Let's suppose we want to present the user with a bunch of yes/no boxes and manage their values as an array. One way to do this would be to write the nesting out longhand, but it's easier to
use the list combinator:

    list_of_boxes() = jquery [div.list /modus('list', yes_no_box)];
    my_list = list_of_boxes().val([true, false, false]);        // populates the list with three text boxes and sets their values
    my_list.val()                                               // -> [true, false, false]

The new_element constructor receives a copy of the value and that value's index within its collection. This is useful if you're using value polymorphism.

      list(new_element) = this.modus("+this.children() *[$(x).val()] /seq".qf,
                                     "this.empty() -se- _ *![new_element(x, xi).val(x) /!it.append] /seq".qf),

## Composite combinator

This lets you build up a component hierarchy and represent an object of state. For example, suppose we want to represent a person's name and e-mail address. Here's how that might be done:

    name_and_email() = jquery [div(input.name, input.email) /modus('composite', {name: '.name', email: '.email'})];
    my_person = name_and_email().val({name: 'Spencer', email: 'spencer@spencertipping.com'})    // populates boxes by path
    my_person.val()                                                                             // -> {name: 'Spencer', email: 'spencer@spencertipping.com'}

You can use ambiguous paths; if you do this, the first matching element will be chosen.

      composite(paths) = this.modus("paths %v* [find(this, x).first().val()] /seq".qf,
                                    "paths %k*![find(this, paths[x]).first().val(_[x])] /seq /then.this".qf),

      where [find(container, path) = path.constructor === String   ? container.filter(path) /~add/ container.find(path) :
                                     path.constructor === Function ? path(container) : raise [new Error('invalid modus path: #{path}')]]]});
