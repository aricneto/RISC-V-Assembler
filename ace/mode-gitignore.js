define("ace/mode/gitignore_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextHighlightRules = require("./text_highlight_rules").TextHighlightRules;

var GitignoreHighlightRules = function() {
    this.$rules = {
        "start" : [
            {
            token: "storage.modifier.riscv",
            regex: /\b(?:align|ascii|asciiz|byte|double|extern|float|globl|space|word|eqv|half)\b/,
            comment: "Assembler directives for data storage"
            }, {
                token: "entity.name.section.riscv",
                regex: /\b(?:data|text|kdata|ktext)\b/,
                comment: "Segements: .data .text"
            }, {
                token: "keyword.parameter.riscv",
                regex: /\b(?:x(?:3[01]|[12]?[0-9]|[0-9])\b|zero|a[0-7]|s(?:[1]?[01]|[0-9])|t[0-6]|gp|sp|fp|tp|ra|pc)\b/,
                comment: "Registers by id x1, x2, ..."
            }, {
                token: "variable.parameter.riscv",
                regex: /\bf(?:t(?:[0-9]|[1][01])|a[0-7]|s(?:[0-9]|[1][01]))\b/,
                comment: "Floating point registers"
            }, {
                token: "support.function.source.riscv",
                regex: /\b(?:(?:add|sub|div|divu|l|mov|mul|mulh|mulhu|mulhsu|neg|s|c\.eq|c\.le|c\.lt)\.[ds]|cvt\.s\.[dw]|cvt\.d\.[sw]|cvt\.w\.[ds]|bc1[tf])\b/,
                comment: "The RISC-V floating-point instruction set"
            }, {
                token: "support.function.source.riscv",
                regex: /\b(?:add|addu|addi|addiu|sub|subu|and|andi|or|not|ori|nor|xor|xori|slt|sltu|slti|sltiu|slli|sll|rol|srli|sra|srl|ror|j|jr|jal|jalr|beq|bne|blt|bge|lw|sw|lb|sb|lh|sh|lui|move|mfhi|mflo|mthi|mtlo|ld|sd)\b/,
                comment: "Just the hardcoded instructions provided by the RISC-V assembly language"
            }, {
                token: "support.function.other.riscv",
                regex: /\b(?:abs|b|beqz|bgt|bgtu|ble|bleu|bltu|bnez|div|divu|la|li|mv|mul|neg|not|rem|remu|seq|sge|sgt|sle|sne)\b/,
                comment: "Pseudo instructions"
            }, {
                token: "constant.numeric.integer.riscv",
                regex: /\b(?:\d+|0(?:x|X)[a-fA-F0-9]+)\b/
            }, {
                token: "punctuation.definition.comment.riscv",
                regex: /#.*/
            }
        ]
    };
    
    this.normalizeRules();
};

GitignoreHighlightRules.metaData = {
    fileTypes: ['gitignore'],
    name: 'Gitignore'
};

oop.inherits(GitignoreHighlightRules, TextHighlightRules);

exports.GitignoreHighlightRules = GitignoreHighlightRules;
});

define("ace/mode/gitignore",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/gitignore_highlight_rules"], function(require, exports, module) {
"use strict";

var oop = require("../lib/oop");
var TextMode = require("./text").Mode;
var GitignoreHighlightRules = require("./gitignore_highlight_rules").GitignoreHighlightRules;

var Mode = function() {
    this.HighlightRules = GitignoreHighlightRules;
    this.$behaviour = this.$defaultBehaviour;
};
oop.inherits(Mode, TextMode);

(function() {
    this.lineCommentStart = "#";
    this.$id = "ace/mode/gitignore";
}).call(Mode.prototype);

exports.Mode = Mode;
});
                (function() {
                    window.require(["ace/mode/gitignore"], function(m) {
                        if (typeof module == "object" && typeof exports == "object" && module) {
                            module.exports = m;
                        }
                    });
                })();
            