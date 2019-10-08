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
    
    funcElem = para | funcRef
      
   	para = para subPara -- combine
    | subPara
    
    subPara = number | "_"

	number = "-"? digit* "." digit+ -- fullFloat
    | "-"? digit "." -- dot
	| "-"? digit+ -- int
    
    funcRef = "~" validName

    funcName = validName
    
    validName = listOf<letter+, "_">

    separator = ","? space 
}

`;

export {lang}