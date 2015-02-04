/**
 * Created by cchet on 1/24/2015.
 */
/* var person = {
    firstname: "Thomas",
    lastname: "Herzog"
} */

Object.prototype.mySuperProp = "superProp";
var person = new Object();
person.firstname = "Thomas";
console.log(person.firstname);
console.log(person.mySuperProp);

/* factory pattern shall be used for object creation */
/* Arrays shall be created with = [] and not Array(). Is slower could cause conflicts with a function defined anywhere in the scope which does different stuff */
