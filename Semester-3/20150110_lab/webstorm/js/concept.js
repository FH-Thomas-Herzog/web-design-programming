/* http://addyosmani.com/resources/essentialjsdesignpatterns/book/
 * */
/* #### Call by value example ####
 var x = 3;
 var y = x;
 x = 14;
 console.log(x);
 console.log(y);
 */




/*
 var obj1 = new Object();
 var obj2 = new Object();
 obj1.name = "Fritz";
 console.log(obj1.name);
 console.log(obj2.name);
 */




/* #### This example displays the call by value of the given actual parameter object address. ####
 /**
 * Sets the age on the given object.
 * The new set reference is lost after function finished.
 * @param obj
 */
/* This example displays the call by value of the given actual parameter object address.
 function setAge(obj) {
 obj.age = 28;
 obj = new Object();
 obj.age = 19;
 }

 var person = new Object();
 setAge(person);
 console.log(person.age);
 */




/* #### Conversion to boolean ####
 var msg = "Hello World";
 var msgAssBoolean = Boolean(msg);
 console.log(msgAssBoolean);
 * first ! negates the boolean and implicitly converts variable to boolean and the second ! negates teh negation again to retrieve the original bool value
 console.log(!!msgAssBoolean);
 console.log(!!msg);
 */




/* #### If for non empty string  ####
 var msg = "message";
 if(msg) {
 alert("if");
 }else {
 alert("else");
 }
 */

/* #### Primitive wrappers #####
 * the wrappers object are created when needed and discarded right after the usage.
 * So the value set text.color is useless because object is created, value set and object discarded
 var text = "Hello world";
 var subString = text.substring(3);
 console.log(subString);
 text.color = "red";
 console.log(text.color);
 */


/* #### new Boolean constructs a object which is always true unless the object is null. ######
 var b = new Boolean(false);
 if(b) {
 alert("if");
 }else{
 alert("else");
 }
 */


/* #### function is always an object no mather if function expression or function declaration #####
 var foo = function() {
 };

 foo.test = "whatever";
 console.log(foo.test);
 */


/* ##### 'this' examples. When does this point to what object ?  ######
 * if a member function is called without this then this is the global object.
 * two options are possible:
 * 1. set this via bind
 * 2. keep original this in member variable self
 * 3. call method with this.
 var person = {
 firstName: "Hugo"
 };
 person.sayHello = function () {
 return this.firstName;
 };
 console.log(person.sayHello());

 var myFunc = person.sayHello;
 console.log(myFunc());
 */



/* #### hide variables from the outer scope ######
 * IFE: Inline - function - expression
 *
 (function() {
 var x = "hello";
 alert(x);
 })();
 alert(x);
 */



/* ##### closures #####
 * The variable is retrieved from the creating context which were invoked earlier and has last i value set on i.
 * Only the reference to the parent scope is visible to the created function, but not the values.
 * To avoid such a issue the variable needs ot be conserved.
 * */
var fs = [];
function init() {
    for (var i = 0; i <= 10; i++) {
        /*var f = function (i) {
         return function () {
         console.log(i);
         };
         }(i);*/
        /* does the same as the former implementation */
        var f = makeFunction(i);
        fs.push(f);
    }
}

/**
 * Creates a function and conserves the variable.
 * @param i
 * @returns {Function}
 */
function makeFunction(i) {
    return function () {
        console.log(i);
    };
};
init();
fs[3]();