Modus component library | Spencer Tipping
Licensed under the terms of the MIT source code license

# Introduction

Modus as a framework provides a way to overload the val() method on jQuery objects, but it doesn't provide any components. This file includes several commonly-used business-logic components
and the bidirectional value conversions for them.

    caterwaul.module('modus.components', 'js_all jquery', function ($) {

      $ = jQuery;

# Terminal components

These are ways of reinterpreting text or other direct user input.

## Formatted input

A lot of input components can take one of many formats. This low-level wrapper lets you indicate which kind of format should be treated in which way. The idea is that you have a mapping from
format string to handler; the parser tries to match each format to the user's input and calls the corresponding handler. Each handler can reject the input if it isn't correct. To simplify
the design, each format variable matches against exactly one word. The val() function returns undefined if no format matches. For example, here's how to parse an e-mail:

    email_box() = jquery in input /modus('formatted', {'_user@_domain._tld': given.match in match}, email -given.email);
    email_box().val('foo@bar.com');
    email_box().val()           // -> {_user: 'foo', _domain: 'bar', _tld: 'com'}

Note the asymmetry of the val() method generated here. It's ok to do this; you just have to watch out for the lack of inversion. Also note that there is no particular order in which the
patterns are matched.

Rejection happens when your handler function returns undefined. For example, here's one that accepts only strings of the form 'x minutes ago', where x is a number. This widget implements a
symmetric val() function, which is normally what you would want.

    time_ago_box() = jquery in input /modus('formatted', {'_x minutes ago': given.match [/\d+/.test(match._x) ? -Number(match._x) : undefined]}, '#{n} minutes ago' -given.n);

Things to be aware of:

    1. All patterns are case-insensitive. Normally this isn't a problem, but it's worth knowing.
    2. All patterns attempt to match against the whole contents of the text field, but allow whitespace at the beginning and at the end.
    3. Most regexp special characters will be converted to literal characters. There isn't a way to get regexp functionality in patterns at the moment.
    4. Any identifier that starts with an underscore is converted into a greedy regexp match for one or more non-whitespace characters.

      $.modus.formatted(patterns, serialize) = this.modus(given.nothing in parse(this.modus('val')),
                                                          given.value   in this.modus('val', serialize(value)))

                                               -where [escape(p)                           = p.replace(/([.$+*\[\]{}()?])/g, '\\$1'),
                                                       regexp_for(p)                       = new RegExp('^\\s*' + escape(p).replace(/(_\w+)/g, '\\S+') + '\\s*$', 'i'),
                                                       variable_list_for(p)                = p.match(/_\w+/g),

                                                       compiled_regexps                    = patterns /pairs *[{pattern: regexp_for(x[0]), variables: variable_list_for(x[0]), f: x[1]}] /seq,

                                                       make_variable_table(matches, names) = names *[[x, matches[xi]]] -object -seq,
                                                       matching_patterns(s)                = compiled_regexps %[x.pattern.test(s)] /seq,
                                                       variable_sets_for(s)                = matching_patterns(s) *[{f: x.f, vars: make_variable_table(x.pattern.exec(s), x.variables)}] /seq,
                                                       parse(s)                            = variable_sets_for(s) *[x.f(x.vars)] %[x !== undefined] /seq -re- it[0]],

## Personal information components

These don't actually do much, but they do establish a convention for how to talk about information such as names, e-mail addresses, phone numbers, etc. In the future they may implement
custom parsers and serializers.

      $.modus.name()    = this,
      $.modus.email()   = this,
      $.modus.phone()   = this,
      $.modus.address() = this,

## Date/time

There are two components that handle dates and times. One handles absolute time references, and the other handles relative time references or durations. Absolute dates are parsed in any of
these formats:

    1. December 31, 2010
    2. 31 December, 2010
    3. December 31 2010
    4. 31 December 2010
    5. 2010 31 December
    6. 2010 December 31
    7. 2010.1231
    8. 12/31/2010
    9. 12-31-2010
     10. December 31
     11. 31 December
     12. 12/31
     13. 12-31

Each of these formats supports the following variations:

    1. The year can be specified as two-digit or four-digit. The two-digit cutoff is 1970.
    2. The month, if written as a word, can be any unambiguous prefix. For instance, J is a valid month, as are ja, jan, JAN, etc. Months are case-insensitive.

Times are parsed in any of these formats:

    1. midnight, noon, etc. (named times)
    2. 12:00 AM
    3. 12:00:10 pm
    4. 14:00
    5. 14:00:10
    6. 3pm
    7. 3 pm

Date/time combinations are:

    1. date at time
    2. date time
    3. time on date
    4. time date
    5. date.time
    6. date

Dates are serialized into one of these forms:

    31 December 2010                    <- if time is midnight
    31 December 2010, 12:00 PM          <- if time is not midnight

      $.modus.util -se [it.named_months           = 'january february march april may june july august september october november december'.split(/\s+/),
                        it.named_times            = {midnight: '12:00 AM', noon: '12:00 PM'},

                        it.time_formats           = ['_name', '_hh:_mm _ap', '_hh:_mm:_ss _ap', '_hh:_mm_ap', '_hh:_mm:_ss_ap', '_HH:_mm', '_HH:_mm:_ss', '_hh_ap', '_hh _ap'],
                        it.date_formats           = ['_month _dd, _yyyy', '_month _dd _yyyy', '_dd _month, _yyyy', '_dd _month _yyyy',
                                                     '_yyyy _ddd _month', '_yyyy _month _dd', '_yyyy._mm_dd', '_mm/_dd/_yyyy', '_mm-_dd-_yyyy',
                                                     '_month _dd', '_dd _month', '_dd/_mm', '_dd-_mm'],

                        it.date_with_time_formats = ['_date at _time', '_date _time', '_time on _date', '_time _date', '_date._time', '_date'],

                        it.named_month(m)         = it.named_months %~![x.indexOf(m.toLowerCase()) === 0 && new Number(xi)] /seq -re [it.length === 1 ? it[0] : undefined],
                        it.parse_year(y)          = /\d{4}/.test(y) ? Number(y) : /\d{2}/.test(y) ? Number(y) + 1970 : undefined,

                        it.milliseconds(h, m, s)  = (((h * 60) + m) * 60 + s) * 1000,

                        it.date_from_match(match) = where [year  = match._yyyy  ? it.parse_year(match._yyyy)   : new Date().getFullYear(),
                                                           month = match._month ? it.named_month(match._month) : Number(match._mm) - 1,
                                                           day   = match._dd && Number(match._dd)]

                                                          [year !== undefined && month !== undefined && day !== undefined ? new Date(year, month, day) : undefined],

                        it.time_from_match(match) = match._name  ? it.time_from_match(it.named_times[match._name]) :
                                                    match._mm_ap ? it.time_from_match('#{it._hh}:#{it._mm_ap.substr(0, 2)} #{it._mm_ap.substr(2)}') :
                                                    match._ss_ap ? it.time_from_match('#{it._hh}:#{it._mm}:#{it._ss_ap.substr(0, 2)} #{it._ss_ap.substr(2)}') :
                                                    match._hh_ap ? it.time_from_match('#{it._hh_ap.substr(0, 2)} #{it._hh_ap.substr(2)}') :

                                                    match._HH    ? it.milliseconds(Number(match._HH),                                         Number(match._mm) || 0, Number(match._ss) || 0) :
                                                    match._ap    ? it.milliseconds(Number(match._hh) % 12 + (/^p/i.test(match._ap) ? 12 : 0), Number(match._mm) || 0, Number(match._ss) || 0) :
                                                                   undefined,

                        it.parse_date_time(match) = where [date = it.date_from_match(match), time = it.time_from_match(match)]
                                                          [date !== undefined ? new Date(+date + +time) : undefined],

                        it.serialize_time(d)      = '#{it.getHours() % 12 || 12}:#{it.getMinutes()} #{it.getHours() >= 12 ? "PM" : "AM"}',
                        it.serialize_date(d)      = '#{d.getDays()} #{it.named_months[d.getMonth()]} #{it.getFullYear()}' +
                                                      (d.getHours() === 0 && d.getMinutes() === 0 ? '' : ' #{it.serialize_time(d)}'),

                        it.date_patterns()        = unique_strings_in(it.date_with_time_formats *~![all_dates_and_times(x)] /seq)

                                                    -where [pairings                    = seq in it.date_formats - it.time_formats,
                                                            all_dates_and_times(format) = it.date_with_time_formats *~!~[pairings *p[x.replace(/_date/, p[0]).replace(/_time/, p[1])]] /seq,
                                                            unique_strings_in(xs)       = xs *[[x, true]] /object /keys /seq],

                        it.time_parsers()         = it.time_formats    *[[x, it.time_from_match]] /object /seq,
                        it.date_parsers()         = it.date_patterns() *[[x, it.parse_date_time]] /object /seq],

      $.modus.date() = this.formatted($.modus.util.date_parsers(), $.modus.util.serialize_date),
      $.modus.time() = this.formatted($.modus.util.time_parsers(), $.modus.util.serialize_time),

Relative date/time entry is still pending; this will be responsible for parsing things like '5 minutes'.

## Authentication components

These accept things like username/password. Right now the username component is just the identity, and password ensures that an input field is in fact a password box. A variant,
hashed_password(), uses the SHA-256 hash imported from kevlar to provide a read-only password. (Trying to set a hashed password results in an error, since presumably the hash is
irreversible.)

      $.modus.username()        = this,
      $.modus.password()        = this.attr('type', 'password'),
      $.modus.hashed_password() = this.attr('type', 'password').modus(delay   in kevlar.encode85(kevlar.sha256(this.val())),
                                                                      given.p in 'cannot set password' -raise)});
