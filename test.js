var toBin = function (num, pad) {
    var out = "";
    while (pad--)
        out += (num >> pad) & 1;
    return out;
}

var imm = toBin(3, 12);
console.log(imm + '\n');

imm1 = imm.substring(0, 1);
imm2 = imm.substring(2, 8);
imm3 = imm.substring(8, 12);
imm4 = imm.substring(1, 2);

console.log(imm1 +imm2+imm3+imm4);
