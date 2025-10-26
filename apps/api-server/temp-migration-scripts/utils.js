export const retrieveArg = (argToRetrieve) => {
    const givenArgs = process.argv
    const totalArgWithKeyAndValue = givenArgs.find(arg => arg.startsWith(argToRetrieve))
    let valueFromArg = null
    if (totalArgWithKeyAndValue) {
        valueFromArg = totalArgWithKeyAndValue.split("=")[1]
    }
    return valueFromArg
}