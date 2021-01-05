let sum=0;
let pi=3.14159265, h=96;
let r=144/2;
sum=2*pi*r*(h+r);
r=143.95/2;
sum-=2*pi*r*(h+r);
//for(let r=143.95/2;r<144/2;r+=0.00001) {
//    sum=sum+(2*pi*r*h + 2*pi*Math.pow(r,2));
//    sum=sum+(2*pi*r*(h+r));
//}
//console.log(sum);
let i = pi*Math.pow(144/2,2)*h - pi*Math.pow(143.95/2, 2)*h;

const R1=144/2, r1=143.95/2;
console.log(i);
console.log(pi*h*(Math.pow(R1,2)-Math.pow(r1,2)));