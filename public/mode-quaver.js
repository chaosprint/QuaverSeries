// this file should be copied to node_modules/brace/mode

ace.define("ace/mode/quaver_highlight_rules", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text_highlight_rules"], function (acequire, exports, module) {
  "use strict";

  var oop = acequire("../lib/oop");
  
  // var DocCommentHighlightRules = acequire("./doc_comment_highlight_rules").DocCommentHighlightRules;

  var TextHighlightRules = acequire("./text_highlight_rules").TextHighlightRules;

  var QuaverHighlightRules = function QuaverHighlightRules() {
    var keywordControls = "loop|bpm|shift|every|speed|choose|range|play|set_gate|set_gate_all|midi_out";
    var storageType = `sawtooth|square|triangle|
    |sin_synth|saw_synth|squ_synth|tri_synth|sampler|
    |membrane|pluck|brown|white|pink|
    |metalphone|fm|lfo|sin_lfo|tri_lfo|saw_lfo|squ_lfo|
    |pwm|sin_osc|squ_osc|saw_osc|tri_osc|
    |pink_noise|brown_noise|white_noise`
    var storageModifiers = "";
    var keywordOperators = ">>|->|="
    var builtinConstants = "lpf|hpf|reverb|pingpong|adsr|amp|jcreverb|freeverb|delay"
    var keywordMapper = this.$keywords = this.createKeywordMapper({
        "keyword.control" : keywordControls,
        "storage.type" : storageType,
        "storage.modifier" : storageModifiers,
        "keyword.operator" : keywordOperators,
        // "variable.language": "this",
        "constant.language": builtinConstants
    }, "identifier");
    this.$rules = {
      "start": [{
        token: "comment",
        regex: "//$",
        next: "start"
      }, {
        token: "invisible",
        regex: ">>|:"
      }, {
        token: "comment",
        regex: "//",
        next: "singleLineComment"
      }, {
        token: "variable.parameter",
        regex: "(((((_)+)?((~)[a-z])((_)+)?)+)|(_))(\\s|\\n|~)?\\b"
      }, {
        token : "support.constant",
        regex : ","
      }, {
        token : "constant.character",
        regex : "(((((_)+)?([0-9]+)((_)+)?)+)|(_))(\\s|\\n|~)?\\b"
      }, {
        token : "constant.character",
        regex : "\`([0-9]+)[a-z]\\b"
      }, {
        token: "string",
        regex: "((~)([a-z]+(_)?)+)\\b"
      },{
        token: "constant.numeric",
        regex: "[-+]?[0-9]*\.?[0-9]+"
        // regex : "[+-]?\\d+(?:(?:\\.\\d*)?(?:[eE][+-]?\\d+)?)?(?:L|l|UL|ul|u|U|F|f|ll|LL|ull|ULL)?\\b"
      }, {
        token : keywordMapper,
        regex : "[a-zA-Z_$][a-zA-Z0-9_$]*\\b"
      },{
        token: "text",
        regex: "\\\\s+"
      }],
      
      "singleLineComment": [{
        token: "comment",
        regex: /\\\\$/,
        next: "singleLineComment"
      }, {
        token: "comment",
        regex: /$/,
        next: "start"
      }, {
        defaultToken: "comment"
      }]
    };
  };

  oop.inherits(QuaverHighlightRules, TextHighlightRules);
  exports.QuaverHighlightRules = QuaverHighlightRules;
});
ace.define("ace/mode/quaver", ["require", "exports", "module", "ace/lib/oop", "ace/mode/text", "ace/mode/quaver_highlight_rules"], function (acequire, exports, module) {
  "use strict";

  var oop = acequire("../lib/oop");
  var TextMode = acequire("./text").Mode;
  var QuaverHighlightRules = acequire("./quaver_highlight_rules").QuaverHighlightRules;

  var Mode = function Mode() {
    this.HighlightRules = QuaverHighlightRules;
    this.$behaviour = this.$defaultBehaviour;
  };

  oop.inherits(Mode, TextMode);
  (function () {
    this.lineCommentStart = "//"; // this.blockComment = {start:"//", end:""}

    this.$id = "ace/mode/quaver";
  }).call(Mode.prototype);
  exports.Mode = Mode;
});