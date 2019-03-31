// Matches: "INSTRUCTION      (REGISTER), (IMMEDIATE | REGISTER), (IMMEDIATE | REGISTER | (REGISTER))
// GROUPS:      1                  2               3                            4
var regex = /^[\t ]*([A-Za-z]*)[\t ]*([xX]\d*)[\t ]*,[\t ]*([xX]\d*|\d*)[\t ]*(?:)?(?:(?:\((?=.*\))|,)[\t ]*([xX]\d*|\d*))?(?![^\t \n\)])/; //todo: add regex suport to nop and break

var GROUP_OPCODE = 1;

//run("addi x9,x20,56\naddi x20,x9,463\nadd x21,x20,x9\nld x9,23(x10)\njal x7,234322");

var app = angular.module("RISCV_assembler", []);

var toBin = function (num, pad) {
    var out = "";
    while (pad--)
        out += (num >> pad) & 1;
    return out;
}

var padMemAddress = function (num) {
    return ('000' + num).slice(-3);
}

app.controller("Ctrl", function ($scope) {

    $scope.error = "";

    var readReg = function (reg) { // todo: check if register exists
        if (reg.charAt(0) == 'x') {
            reg = reg.substr(1);
            reg = parseInt(reg, 10);            
    
            return toBin(reg, 5);
        }
    }

    $scope.assemble = function () {
        $scope.editor = ace.edit('editor');

        // clean errors
        $scope.editor.getSession().setAnnotations([{}]);
        $scope.error = "";

        var input = $scope.editor.getValue();

        var code = [];
        var mem = "";
        var lines = input.split('\n');

        var buildMem = function (code) {
            var lineNum = 0;

            mem = "WIDTH = 8;\nDEPTH = 256;\n\nADDRESS_RADIX = DEC;\nDATA_RADIX = BIN;\n\nCONTENT\n\nBEGIN\n\n";

            // assemble instructions
            code.forEach(function (instruction) {
                // if it's a comment
                if (instruction.substr(0,2) == '--')
                    mem += instruction;
                else {
                    for (i = 3; i >= 0; i--) {
                        mem += padMemAddress(lineNum) + ': ' + instruction.substr(i * 8, 8) + ';\n';
                        lineNum++;
                    }
                }
                mem += '\n';
            });

            instLines = lineNum; // number of lines that have an instruction

            // fill remaining addresses with 0
            for (i = 0; i < 276 - instLines; i++) {
                mem += padMemAddress(lineNum) + ': 00000000;\n'
                if ((i + 1) % 4 == 0)
                    mem += '\n'
                lineNum++;
            }

            mem += "\nEND;"
        }

        var rd, rs1, rs2, imm;

        // check if one of the operands is null
        var checkOperands = function (operands) {
            operands.forEach(function (op) {
                if (op == undefined || op == '')
                    throw "Invalid operands";
            });
        }

        for (var i = 0, l = lines.length; i < l; i++) {
            var match = regex.exec(lines[i]);
            try {
            if (lines[i] != '' && match[GROUP_OPCODE] != undefined) {
                var instr = match[GROUP_OPCODE].toUpperCase();
                switch (instr) {
                    case 'ADD':
                        rd = readReg(match[2]);
                        rs1 = readReg(match[3]);
                        rs2 = readReg(match[4]);

                        checkOperands([match[2], match[3], match[4]]);

                        code.push('--add: ' + match[2] + ', ' + match[3] + ', ' + match[4]);
                        code.push('0000000' + rs2 + rs1 + '000' + rd + '0110011');
                        break;

                    case 'SUB':
                        rd = readReg(match[2]);
                        rs1 = readReg(match[3]);
                        rs2 = readReg(match[4]);

                        checkOperands([match[2], match[3], match[4]]);                        

                        code.push('--sub: ' + match[2] + ', ' + match[3] + ', ' + match[4]);
                        code.push('0100000' + rs2 + rs1 + '000' + rd + '0110011');
                        break;

                    case 'AND':
                        rd = readReg(match[2]);
                        rs1 = readReg(match[3]);
                        rs2 = readReg(match[4]);

                        checkOperands([match[2], match[3], match[4]]);                        

                        code.push('--and: ' + match[2] + ', ' + match[3] + ', ' + match[4]);
                        code.push('0000000' + rs2 + rs1 + '111' + rd + '0110011');
                        break;

                    case 'SLT':
                        rd = readReg(match[2]);
                        rs1 = readReg(match[3]);
                        rs2 = readReg(match[4]);

                        checkOperands([match[2], match[3], match[4]]);                        

                        code.push('--slt: ' + match[2] + ', ' + match[3] + ', ' + match[4]);
                        code.push('0000000' + rs2 + rs1 + '010' + rd + '0110011');
                        break;

                    case 'ADDI':
                        rd = readReg(match[2]);
                        rs1 = readReg(match[3]);
                        imm = toBin(match[4], 12);

                        checkOperands([match[2], match[3], match[4]]);                       

                        code.push('--addi: ' + match[2] + ', ' + match[3] + ', ' + match[4]);
                        code.push(imm + rs1 + '000' + rd + '0010011');
                        break;

                    case 'SRLI':
                        rd = readReg(match[2]);
                        rs1 = readReg(match[3]);
                        imm = toBin(match[4], 5);

                        checkOperands([match[2], match[3], match[4]]);                       

                        code.push('--srli: ' + match[2] + ', ' + match[3] + ', ' + match[4]);
                        code.push('0000000' + imm + rs1 + '101' + rd + '0010011');
                        break;

                    case 'SRAI':
                        rd = readReg(match[2]);
                        rs1 = readReg(match[3]);
                        imm = toBin(match[4], 5);

                        checkOperands([match[2], match[3], match[4]]);                       

                        code.push('--srai: ' + match[2] + ', ' + match[3] + ', ' + match[4]);
                        code.push('0100000' + imm + rs1 + '101' + rd + '0010011');
                        break;

                    case 'SLLI':
                        rd = readReg(match[2]);
                        rs1 = readReg(match[3]);
                        imm = toBin(match[4], 5);

                        checkOperands([match[2], match[3], match[4]]);                       

                        code.push('--slli: ' + match[2] + ', ' + match[3] + ', ' + match[4]);
                        code.push('0000000' + imm + rs1 + '001' + rd + '0010011');
                        break;

                    case 'SLTI':
                        rd = readReg(match[2]);
                        rs1 = readReg(match[3]);
                        imm = toBin(match[4], 12);

                        checkOperands([match[2], match[3], match[4]]);                       

                        code.push('--slti: ' + match[2] + ', ' + match[3] + ', ' + match[4]);
                        code.push(imm + rs1 + '010' + rd + '0010011');
                        break;

                    case 'JALR':
                        rd = readReg(match[2]);
                        rs1 = readReg(match[3]);
                        imm = toBin(match[4], 12);

                        checkOperands([match[2], match[3], match[4]]);                       

                        code.push('--jalr: ' + match[2] + ', ' + match[3] + ', ' + match[4]);
                        code.push(imm + rs1 + '000' + rd + '1100111');
                        break;

                    case 'LD':
                        rd = readReg(match[2]);
                        imm = toBin(match[3], 12);
                        rs1 = readReg(match[4]);

                        checkOperands([match[2], match[3], match[4]]);              

                        code.push('--ld: ' + match[2] + ', ' + match[3] + '(' + match[4] + ')');
                        code.push(imm + rs1 + '011' + rd + '0000011');
                        break;

                    case 'LW':
                        rd = readReg(match[2]);
                        imm = toBin(match[3], 12);
                        rs1 = readReg(match[4]);

                        checkOperands([match[2], match[3], match[4]]);                       

                        code.push('--lw: ' + match[2] + ', ' + match[3] + '(' + match[4] + ')');
                        code.push(imm + rs1 + '010' + rd + '0000011');
                        break;

                    case 'LBU':
                        rd = readReg(match[2]);
                        imm = toBin(match[3], 12);
                        rs1 = readReg(match[4]);

                        checkOperands([match[2], match[3], match[4]]);                       

                        code.push('--lbu: ' + match[2] + ', ' + match[3] + '(' + match[4] + ')');
                        code.push(imm + rs1 + '100' + rd + '0000011');
                        break;

                    case 'LH':
                        rd = readReg(match[2]);
                        imm = toBin(match[3], 12);
                        rs1 = readReg(match[4]);

                        checkOperands([match[2], match[3], match[4]]);                       

                        code.push('--lh: ' + match[2] + ', ' + match[3] + '(' + match[4] + ')');
                        code.push(imm + rs1 + '001' + rd + '0000011');
                        break;

                    case 'NOP':
                        code.push('--nop');
                        code.push('00000000000000000000000000010011');
                        break;

                    case 'BREAK':
                        code.push('--break');
                        code.push('00000000000100000000000001110011');
                        break;

                    case 'SD':            // SB x4, 41(x5)
                        rs1 = readReg(match[4]);
                        rs2 = readReg(match[2]);
                        imm = toBin(match[3], 12);

                        checkOperands([match[2], match[3], match[4]]);                       

                        imm1 = imm.substr(0, 7);
                        imm2 = imm.substr(7, 5);              

                        code.push('--sd: ' + match[2] + ', ' + match[3] + '(' + match[4] + ')');
                        code.push(imm1 + rs2 + rs1 + '111' + imm2 + '0100011');
                        break;

                
                    case 'SW':            
                        rs1 = readReg(match[4]);
                        rs2 = readReg(match[2]);
                        imm = toBin(match[3], 12);

                        checkOperands([match[2], match[3], match[4]]);

                        imm1 = imm.substr(0, 7);
                        imm2 = imm.substr(7, 5);              

                        code.push('--sw: ' + match[2] + ', ' + match[3] + '(' + match[4] + ')');
                        code.push(imm1 + rs2 + rs1 + '010' + imm2 + '0100011');
                        break;
                
                    case 'SH':            
                        rs1 = readReg(match[4]);
                        rs2 = readReg(match[2]);
                        imm = toBin(match[3], 12);

                        checkOperands([match[2], match[3], match[4]]);

                        imm1 = imm.substr(0, 7);
                        imm2 = imm.substr(7, 5);              

                        code.push('--sh: ' + match[2] + ', ' + match[3] + '(' + match[4] + ')');
                        code.push(imm1 + rs2 + rs1 + '001' + imm2 + '0100011');
                        break;
                
                    case 'SB':            
                        rs1 = readReg(match[4]);
                        rs2 = readReg(match[2]);
                        imm = toBin(match[3], 12);

                        checkOperands([match[2], match[3], match[4]]);

                        imm1 = imm.substr(0, 7);
                        imm2 = imm.substr(7, 5);              

                        code.push('--sb: ' + match[2] + ', ' + match[3] + '(' + match[4] + ')');
                        code.push(imm1 + rs2 + rs1 + '000' + imm2 + '0100011');
                        break;
                
                    case 'BEQ':
                        rs1 = readReg(match[2]);
                        rs2 = readReg(match[3]);
                        imm = toBin(match[4], 12);

                        checkOperands([match[2], match[3], match[4]]);

                        imm1 = imm.substring(0, 1);
                        imm2 = imm.substring(2, 8);
                        imm3 = imm.substring(8, 12);
                        imm4 = imm.substring(1, 2);
                
                        code.push('--beq: ' + match[2] + ', ' + match[3] + ', ' + match[4]);
                        code.push(imm1 + imm2 + rs2 + rs1 + '000' + imm3 + imm4 + '1100011');
                        break;
                
                    case 'BNE':            
                        rs1 = readReg(match[2]);
                        rs2 = readReg(match[3]);
                        imm = toBin(match[4], 12);

                        checkOperands([match[2], match[3], match[4]]);

                        imm1 = imm.substring(0, 1);
                        imm2 = imm.substring(2, 8);
                        imm3 = imm.substring(8, 12);
                        imm4 = imm.substring(1, 2);
                
                        code.push('--bne: ' + match[2] + ', ' + match[3] + ', ' + match[4]);
                        code.push(imm1 + imm2 + rs2 + rs1 + '001' + imm3 + imm4 + '1100011');
                        break;
                
                    case 'BLT':            
                        rs1 = readReg(match[2]);
                        rs2 = readReg(match[3]);
                        imm = toBin(match[4], 12);

                        checkOperands([match[2], match[3], match[4]]);

                        imm1 = imm.substring(0, 1);
                        imm2 = imm.substring(2, 8);
                        imm3 = imm.substring(8, 12);
                        imm4 = imm.substring(1, 2);
                
                        code.push('--blt: ' + match[2] + ', ' + match[3] + ', ' + match[4]);
                        code.push(imm1 + imm2 + rs2 + rs1 + '100' + imm3 + imm4 + '1100011');
                        break;
                
                    case 'BGE':            
                        rs1 = readReg(match[2]);
                        rs2 = readReg(match[3]);
                        imm = toBin(match[4], 12);

                        checkOperands([match[2], match[3], match[4]]);

                        imm1 = imm.substring(0, 1);
                        imm2 = imm.substring(2, 8);
                        imm3 = imm.substring(8, 12);
                        imm4 = imm.substring(1, 2);
                
                        code.push('--beq: ' + match[2] + ', ' + match[3] + ', ' + match[4]);
                        code.push(imm1 + imm2 + rs2 + rs1 + '101' + imm3 + imm4 + '1100011');
                        break;

                    case 'JAL':
                        rd = readReg(match[2]);
                        imm = toBin(match[3], 20);

                        checkOperands([match[2], match[3]]);

                        imm = imm.substring(0, 1)
                            + imm.substring(10, 20)
                            + imm.substring(10, 11)
                            + imm.substring(1, 9);

                        code.push('--jal: ' + match[2] + ', ' + match[3]);
                        code.push(imm + rd + '1101111');
                        break;

                    case 'LUI':
                        rd = readReg(match[2]);
                        imm = toBin(match[3], 20);

                        checkOperands([match[2], match[3]]);

                        code.push('--lui: ' + match[2] + ', ' + match[3]);
                        code.push(imm + rd + '0110111');
                        break;
                    default:
                        $scope.editor.getSession().setAnnotations([{
                            row: i,
                            column: 0,
                            text: "Not a valid instruction", // Or the Json reply from the parser 
                            type: "error" // also warning and information
                        }]);
                        $scope.error = "Not a valid instruction: " + instr;
                        break;
                }
            }
        } catch (e) {
            err = e;
            err = e == "Invalid operands" ? "Invalid operands" : "Invalid syntax"
            $scope.editor.getSession().setAnnotations([{
                row: i,
                column: 0,
                text: e, // Or the Json reply from the parser 
                type: "error" // also warning and information
            }]);
            $scope.error = err + " in line " + (i + 1);
            throw (e);
        }
        }

        buildMem(code);

        ace.edit('memory').setValue(mem);
    };

});