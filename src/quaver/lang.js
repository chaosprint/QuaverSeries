const lang = `

Quaver {
    
    Piece = Piece listOf<"\\n", "\\n"> Block --stack
    | Block

    Block = comment | Def | Track

    Def = funcName? ":"? FuncDef "}"+
    
    FuncDef = FuncDef FuncBody --new
    | FuncBody
    
    FuncBody = FuncPart | Chain
    
    FuncPart = "[" funcName "]" "{"
    
    comment = "//" c+
    
    c = ~"\\n" any

	Track = funcRef? ":"? Chain
	
    Chain = Chain ">>" Func -- stack
    | Func
   
    Func =  funcName listOf<funcElem, separator>
    
    funcElem = funcElem subPara -- combine
    | subPara
    
    subPara = number | "_" | funcRef | duration | var

    var = letter+

	number = "+"? "-"? digit* "." digit+ -- fullFloat
    | "+"? "-"? digit "." -- dot
    | "+"? "-"? digit+ -- int
    
    duration = "\`" digit+ "n"

    funcRef = "~" funcName
    
    funcName = listOf<letter+, "_">

    separator = ","? space 
}

`;

// Def = funcName ":=" listOf<DefChain, "."> ";"

// DefChain = lambda Chain

// lambda = "λ" | "\\\\"

export {lang}