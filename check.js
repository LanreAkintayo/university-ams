const str = "[0x1234,     0x248937reh,         0xukjhgfj]";

// Remove square brackets and split the string into an array
const stringWithoutBrackets = str.slice(1, -1);
const array = stringWithoutBrackets.split(",").map((item) => item.trim());

console.log(array); // Output: ['lanre', 'Nike', 'Kunle']
