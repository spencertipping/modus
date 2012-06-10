caterwaul.module( 'modus' ,function($) {$=jQuery;
var original_jquery_val=$.fn.val;
 (function() {var use_named_combinator=function(receiver,args) {;
return $.modus[args[0] ] .apply(receiver,Array.prototype.slice.call(args,1) ) } ;
return $.fn.val=function() {var args=arguments;
return(function(it) {return it?args.length?it.setter.apply(this,args) 
:it.getter.call(this) 
:original_jquery_val.apply(this,args) } ) .call(this, (this.data( 'modus' ) ) ) } ,$.fn.modus=function(getter,setter) {;
return getter.constructor===String?use_named_combinator(this,arguments) 
:this.data( 'modus' , {getter:getter,setter:setter} ) } } ) .call(this) ,$.modus= (function(it) {return(function() {var find=function(container,path) {;
return path.constructor===String?container.filter(path) .add(container.find(path) ) 
:path.constructor===Function?path(container) 
: (function() {throw new Error( ( 'invalid modus path: ' + (path) + '' ) ) } ) .call(this) } ;
return it.val=function() {;
return original_jquery_val.apply(this,arguments) } ,it.delegate=function(getter,setter) {;
return(function(it) {return it.first=function() {;
return it} ,it.val=function() {;
return arguments.length? (function(it) {return this} ) .call(this, (setter.apply(this,arguments) ) ) 
:getter.apply(this,arguments) } ,it} ) .call(this, ( {} ) ) } ,it.list=function(new_element) {;
return this.modus( (function(nothing) {return(function(xs) {var x,x0,xi,xl,xr;
for(var xr=new xs.constructor() ,xi=0,xl=xs.length;
xi<xl;
 ++xi)x=xs[xi] ,xr.push( ($(x) .val() ) ) ;
return xr} ) .call(this,Array.prototype.slice.call( (this.children() ) ) ) } ) , (function(xs) {return(function(it) {return(function(xs) {var x,x0,xi,xl,xr;
for(var xi=0,xl=xs.length;
xi<xl;
 ++xi)x=xs[xi] , (it.append(new_element(x) .val(x) ) ) ;
return xs} ) .call(this,xs) ,it} ) .call(this, (this.empty() ) ) } ) ) } ,it.composite=function(paths) {;
return this.modus( (function(nothing) {return(function(o) {for(var r= {} ,i=0,l=o.length,x;
i<l;
 ++i)x=o[i] ,r[x[0] ] =x[1] ;
return r} ) .call(this, ( (function(xs) {var x,x0,xi,xl,xr;
for(var xr=new xs.constructor() ,xi=0,xl=xs.length;
xi<xl;
 ++xi)x=xs[xi] ,xr.push( ( [x,find(this,paths[x] ) .first() .val() ] ) ) ;
return xr} ) .call(this, (function(o) {var ks= [] ;
for(var k in o)Object.prototype.hasOwnProperty.call(o,k) &&ks.push(k) ;
return ks} ) .call(this, (paths) ) ) ) ) } ) , (function(o) {return( (function(xs) {var x,x0,xi,xl,xr;
for(var x in xs)if(Object.prototype.hasOwnProperty.call(xs,x) )find(this,paths[x] ) .first() .val(o[x] ) ;
return xs} ) .call(this,paths) ,this) } ) ) } } ) .call(this) ,it} ) .call(this, ( {util: {} } ) ) } ) ;
