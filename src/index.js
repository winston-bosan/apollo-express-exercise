//This stays at the very top so our process environment context is loaded first
//Database password and stuff
import 'dotenv/config';

console.log('Hello Node.js project.');
console.log(process.env.MY_DATABASE_PASSWORD);