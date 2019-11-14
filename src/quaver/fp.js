const print = paras => {
    if (paras[0] !== "_") {
        console.warn("Please use underscore after print");  
    }
    return everything => console.log(everything)
}

export {print}