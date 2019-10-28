const lang = `

Quaver {
    
    Piece = Piece #"\\n"? #"\\n"? #"\\n"? Block --stack
    | Block 

    Block = comment | Track
    
    comment = "//" c+
    
    c = ~"\\n" any

	Track = funcRef? ":"? Chain
	
    Chain = Chain ">>" Func -- stack
    | Func
   
    Func =  funcName listOf<funcElem, separator>
    
    funcElem = funcElem subPara -- combine
    | subPara
    
    subPara = number | "_" | funcRef

	number = "+"? "-"? digit* "." digit+ -- fullFloat
    | "+"? "-"? digit "." -- dot
	| "+"? "-"? digit+ -- int
    
    funcRef = "~" funcName
    
    funcName = listOf<letter+, "_">

    separator = ","? space 
}

`;

export {lang}